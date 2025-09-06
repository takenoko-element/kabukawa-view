# api/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import LayoutItem, Symbol

app = FastAPI()

# CORS設定（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Kabukawa-View API"}

# レイアウトを取得するエンドポイント
@app.get("/api/layout", response_model=List[LayoutItem])
def get_layout(session: Session = Depends(get_session)):
    layout_items = session.exec(select(LayoutItem)).all()
    return layout_items

# レイアウトを保存するエンドポイント
@app.post("/api/layout")
def save_layout(layout_items: List[LayoutItem], session: Session = Depends(get_session)):
    # 既存のレイアウトを全て削除
    db_items = session.exec(select(LayoutItem)).all()
    for item in db_items:
        session.delete(item)
    # 新しいレイアウトを追加
    session.add_all(layout_items)
    session.commit()
    return {"message": "Layout saved successfully"}

# 銘柄リストを取得するエンドポイント
@app.get("/api/symbols", response_model=List[Symbol])
def get_symbols(session: Session = Depends(get_session)):
    symbols = session.exec(select(Symbol)).all()
    return symbols


# 仮想環境の起動方法：
# .\venv\Scripts\Activate
# deactivate
# サーバーの起動方法:
# ターミナルで `uvicorn main:app --reload` を実行