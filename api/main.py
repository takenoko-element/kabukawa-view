# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# CORS設定（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsの開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticモデルでデータの型を定義
class ChartItem(BaseModel):
    i: str      # アイテムの一意なID
    x: int      # x座標 (グリッド単位)
    y: int      # y座標 (グリッド単位)
    w: int      # 幅 (グリッド単位)
    h: int      # 高さ (グリッド単位)
    symbol: str # 銘柄コード
    label: str
    chartType: str

# データベースの代わりとなるインメモリ変数
# { "default": [ChartItem, ...] } のような形式で保存
db: Dict[str, List[ChartItem]] = {
    "default_layout": [
        {"i": "a", "x": 0, "y": 0, "w": 8, "h": 6, "symbol": "NIKKEI225", "label": "日経平均 (Nikkei 225)", "chartType": "advanced"},
        {"i": "b", "x": 8, "y": 0, "w": 8, "h": 6, "symbol": "FX:USDJPY", "label": "ドル/円 (USD/JPY)", "chartType": "advanced"},
        {"i": "c", "x": 16, "y": 0, "w": 8, "h": 6, "symbol": "NASDAQ:AAPL", "label": "Apple", "chartType": "advanced"},
    ]
}

@app.get("/api/layout")
def get_layout():
    """保存されたレイアウト設定を取得する"""
    return db.get("default_layout", [])

@app.post("/api/layout")
def save_layout(layout: List[ChartItem]):
    """新しいレイアウト設定を保存する"""
    print(f"Received layout: {layout}")
    db["default_layout"] = layout
    return {"message": "Layout saved successfully"}


# 仮想環境の起動方法：
# .\venv\Scripts\Activate
# サーバーの起動方法:
# ターミナルで `uvicorn main:app --reload` を実行