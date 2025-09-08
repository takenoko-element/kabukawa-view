# api/main.py
import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
import requests
from jose import jwt, jwk
from jose.exceptions import JWTError, ExpiredSignatureError, JWTClaimsError
from svix.webhooks import Webhook, WebhookVerificationError
from database import get_session

from models import LayoutItem, Symbol, User

app = FastAPI()

# CORS設定（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clerkの発行者(Issuer)とJWKSのエンドポイントURLを環境変数から取得
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
if not CLERK_JWT_ISSUER:
    raise ValueError("CLERK_JWT_ISSUER is not set in environment variables")

# JWKS (JSON Web Key Set) を取得するためのURL
JWKS_URL = f"{CLERK_JWT_ISSUER}/.well-known/jwks.json"

# OAuth2スキームの定義
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWKSをキャッシュする変数
jwks_cache = None

def get_jwks():
    """
    ClerkからJWKSを取得し、キャッシュする
    """
    global jwks_cache
    if jwks_cache is None:
        response = requests.get(JWKS_URL)
        response.raise_for_status()
        jwks_cache = response.json()
    return jwks_cache

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    トークンを検証し、ユーザー情報を返す依存関係
    """
    try:
        jwks = get_jwks()
        # トークンのヘッダーからキーID (kid) を取得
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Unable to find appropriate key")

        # トークンをデコードして検証
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            issuer=CLERK_JWT_ISSUER,
            options={"verify_aud": False} # audienceの検証はClerk側で行われるため不要
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTClaimsError as e:
        raise HTTPException(status_code=401, detail=f"Invalid claims: {e}")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"JWT Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to Kabukawa-View API"}

# レイアウトを取得するエンドポイント
@app.get("/api/layout", response_model=List[LayoutItem])
def get_layout(
    session: Session = Depends(get_session),
    clerk_user: dict = Depends(get_current_user)
):
    user = session.exec(select(User).where(User.user_id == clerk_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.layouts

# レイアウトを保存するエンドポイント
@app.post("/api/layout")
def save_layout(
    layout_items: List[LayoutItem],
    session: Session = Depends(get_session),
    clerk_user: dict = Depends(get_current_user)
):
    user = session.exec(select(User).where(User.user_id == clerk_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 既存のレイアウトを全て削除
    db_items = session.exec(select(LayoutItem).where(LayoutItem.user_id == user.id)).all()
    for item in db_items:
        session.delete(item)

    # 新しいレイアウトを追加
    for item_data in layout_items:
        # PydanticモデルからSQLModelインスタンスへの変換
        new_item = LayoutItem.model_validate(item_data)
        new_item.user = user
        session.add(new_item)

    session.commit()
    return {"message": "Layout saved successfully"}

# 銘柄リストを取得するエンドポイント
@app.get("/api/symbols", response_model=List[Symbol])
def get_symbols(session: Session = Depends(get_session)):
    symbols = session.exec(select(Symbol)).all()
    return symbols

# Clerk Webhook用のエンドポイント
class UserWebhookPayload(BaseModel):
    data: dict
    object: str
    type: str

@app.post("/api/webhooks")
async def handle_webhook(request: Request, session: Session = Depends(get_session)):
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        headers = dict(request.headers)
        wh = Webhook(webhook_secret)
        payload = await request.body()
        evt = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Webhook verification failed: {e}")

    event_type = evt["type"]
    data = evt["data"]

    if event_type == "user.created":
        user_id = data["id"]
        email = data["email_addresses"][0]["email_address"]
        existing_user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not existing_user:
            new_user = User(user_id=user_id, email=email)
            session.add(new_user)
            session.commit()

    elif event_type == "user.updated":
        user_id = data["id"]
        user_to_update = session.exec(select(User).where(User.user_id == user_id)).first()
        if user_to_update:
            user_to_update.email = data["email_addresses"][0]["email_address"]
            session.add(user_to_update)
            session.commit()

    elif event_type == "user.deleted":
        user_id = data.get("id")
        if user_id:
            user_to_delete = session.exec(select(User).where(User.user_id == user_id)).first()
            if user_to_delete:
                session.delete(user_to_delete)
                session.commit()

    return {"status": "success"}

# 仮想環境の起動方法：
# .\venv\Scripts\Activate
# deactivate
# サーバーの起動方法:
# ターミナルで `uvicorn main:app --reload` を実行