# api/main.py
import os
import stripe
from fastapi import FastAPI, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from typing import List, Dict
from pydantic import BaseModel
import requests
from jose import jwt, jwk
from jose.exceptions import JWTError, ExpiredSignatureError, JWTClaimsError
from svix.webhooks import Webhook, WebhookVerificationError
from database import get_session

from models import LayoutItem, Symbol, User

class UserWebhookPayload(BaseModel):
    data: dict
    object: str
    type: str

class UserStatus(BaseModel):
    is_premium: bool

class PaymentIntentResponse(BaseModel):
    client_secret: str

app = FastAPI()

# 環境変数から許可するオリジンを文字列として取得
origins_str = os.getenv("ALLOWED_ORIGINS", "")

# 文字列をカンマで分割して、URLのリストを作成
allowed_origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

# Stripe APIキーの設定
stripe.api_key = os.getenv("STRIPE_API_KEY")

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

async def get_current_user_payload(token: str = Depends(oauth2_scheme)):
    """
    トークンを検証し、ユーザーペイロードを返す依存関係
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

async def get_current_user(
    session: Session = Depends(get_session),
    clerk_user: dict = Depends(get_current_user_payload)
) -> User:
    """
    DBから現在のユーザー情報を取得する依存関係
    """
    user = session.exec(select(User).where(User.user_id == clerk_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    return user

async def get_current_user_for_update(
    session: Session = Depends(get_session),
    clerk_user: dict = Depends(get_current_user_payload)
) -> User:
    """
    DBから現在のユーザー情報を取得し、行をロックする依存関係
    """
    # with_for_update() をつけることで、トランザクションが完了するまでこの行をロックする
    user = session.exec(
        select(User).where(User.user_id == clerk_user["sub"]).with_for_update()
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    return user

@app.get("/")
def read_root():
    return {"message": "Welcome to Kabukawa-View API"}

# 現在のユーザーのプレミアム状態を返すエンドポイント
@app.get("/api/user-status", response_model=UserStatus)
def get_user_status(current_user: User = Depends(get_current_user)):
    return UserStatus(is_premium=current_user.is_premium)

# レイアウトを取得するエンドポイント
@app.get("/api/layout", response_model=Dict[str, List[LayoutItem]])
def get_layout(
    current_user: User = Depends(get_current_user)
):
    layouts: Dict[str, List[LayoutItem]] = {}
    for item in current_user.layouts:
        if item.breakpoint not in layouts:
            layouts[item.breakpoint] = []
        layouts[item.breakpoint].append(item)
    return layouts

# レイアウトを保存するエンドポイント
@app.post("/api/layout")
def save_layout(
    layouts: Dict[str, List[LayoutItem]],
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # DBに保存されている既存のアイテムを全て取得し、ユニークID(i)とbreakpointのタプルをキーにする
    db_items_query = session.exec(select(LayoutItem).where(LayoutItem.user_id == current_user.id)).all()
    db_items_dict = {(item.i, item.breakpoint): item for item in db_items_query}

    # フロントから来たアイテムのキーをセットで保持
    incoming_item_keys = set()

    # 1. 更新と追加
    for breakpoint, layout_items in layouts.items():
        for incoming_item in layout_items:
            item_key = (incoming_item.i, breakpoint)
            incoming_item_keys.add(item_key)

            db_item = db_items_dict.get(item_key)

            if db_item:
                # --- 既存アイテムの更新 ---
                db_item.x = incoming_item.x
                db_item.y = incoming_item.y
                db_item.w = incoming_item.w
                db_item.h = incoming_item.h
                db_item.symbol = incoming_item.symbol
                db_item.label = incoming_item.label
                session.add(db_item)
            else:
                # --- 新規アイテムの追加 ---
                # incoming_itemを辞書に変換し、breakpointを追加してから検証する
                item_data = incoming_item.model_dump()
                item_data['breakpoint'] = breakpoint

                new_item = LayoutItem.model_validate(item_data)
                new_item.user_id = current_user.id # userリレーションではなくuser_idを直接設定
                session.add(new_item)

    # 2. 削除
    # DBにあり、フロントから来ていないアイテムを削除
    for key, db_item in db_items_dict.items():
        if key not in incoming_item_keys:
            session.delete(db_item)

    session.commit()
    return {"message": "Layout saved successfully"}

# 銘柄リストを取得するエンドポイント
@app.get("/api/symbols", response_model=List[Symbol])
def get_symbols(session: Session = Depends(get_session)):
    symbols = session.exec(select(Symbol)).all()
    return symbols

# Clerk Webhook用のエンドポイント
@app.post("/api/clerk-webhooks")
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

        # email_addressesリストが存在し、空でないことを確認
        email_addresses = data.get("email_addresses", [])
        if not email_addresses:
            raise HTTPException(
                status_code=400,
                detail="Email address is required but was not provided by the webhook payload.",
            )

        email = email_addresses[0].get("email_address")
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email address is required but was not provided by the webhook payload.",
            )

        existing_user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not existing_user:
            new_user = User(user_id=user_id, email=email, is_premium=False)
            session.add(new_user)
            session.commit()

    elif event_type == "user.updated":
        user_id = data["id"]
        user_to_update = session.exec(select(User).where(User.user_id == user_id)).first()
        if user_to_update:
            # email_addressesが存在する場合のみ更新処理を行う
            email_addresses = data.get("email_addresses", [])
            if email_addresses and (email := email_addresses[0].get("email_address")):
                user_to_update.email = email
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

# Stripe Elements用のエンドポイント
# Stripe Payment Intentを作成し、クライアントシークレットを返すエンドポイント
@app.post("/api/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_for_update),
    idempotency_key: str = Header(None, alias="Idempotency-Key"),
):
    if current_user.is_premium:
        raise HTTPException(status_code=400, detail="すでにプレミアム会員です。")

    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Keyヘッダーが必要です。")

    try:
        # ----- 高冪等性確保のための処理 ＆ 支払いインテントの作成 -----
        # 1. DBに保存されたPaymentIntent IDがあるか確認
        if current_user.stripe_payment_intent_id:
            try:
                # 2. Stripe APIでPaymentIntentの現在の状態を取得
                existing_pi = stripe.PaymentIntent.retrieve(
                    current_user.stripe_payment_intent_id
                )
                # 3. まだ支払いが完了していない場合、そのclient_secretを返す
                if existing_pi.status in ["requires_payment_method", "requires_confirmation"]:
                     return PaymentIntentResponse(client_secret=existing_pi.client_secret)
            except stripe.error.InvalidRequestError:
                # Stripe側でIDが無効な場合は、新規作成処理に進む
                pass

        # 4. 既存の有効なPaymentIntentがない場合、新規に作成
        payment_intent = stripe.PaymentIntent.create(
            amount=500,
            currency="jpy",
            automatic_payment_methods={"enabled": True},
            # metadataにuser_idをセットして、webhookでどのユーザーか識別できるようにする
            metadata={"user_id": current_user.user_id},
            idempotency_key=idempotency_key,
        )

        # 5. 作成したPaymentIntentのIDをDBに保存
        current_user.stripe_payment_intent_id = payment_intent.id
        session.add(current_user)
        session.commit()

        return PaymentIntentResponse(client_secret=payment_intent.client_secret)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stripe Webhook用のエンドポイント
@app.post("/api/stripe-webhooks")
async def stripe_webhook(
    request: Request,
    session: Session = Depends(get_session),
    stripe_signature: str = Header(None),
):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Stripe webhook secret not configured")

    try:
        payload = await request.body()
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=stripe_signature, secret=webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    event_data = event["data"]["object"]

    # イベントタイプに応じて処理を分岐
    # payment_intent.succeeded イベントを処理
    if event["type"] == "payment_intent.succeeded":
        # PaymentIntentからmetadataを取得
        user_id = event_data.get("metadata", {}).get("user_id")

        if user_id:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if user:
                # プレミアム状態への更新とPaymentIntent IDのクリア
                if not user.is_premium:
                    user.is_premium = True

                user.stripe_payment_intent_id = None
                session.add(user)
                session.commit()
    # 支払失敗時のハンドリング
    elif event["type"] == "payment_intent.payment_failed":
        user_id = event_data.get("metadata", {}).get("user_id")
        if user_id:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if user:
                # 支払いが失敗したので、次の支払いのためにIDをクリアする
                user.stripe_payment_intent_id = None
                session.add(user)
                session.commit()

    return {"status": "success"}