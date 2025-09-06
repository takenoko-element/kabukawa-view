# api/models.py
from typing import Optional
from sqlmodel import Field, SQLModel

# Symbolテーブルのモデル
# SQLModelはPydanticを内包しているため、APIのレスポンスモデルとしても機能する
class Symbol(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    value: str = Field(unique=True, index=True)
    category: str

# LayoutItemテーブルのモデル
class LayoutItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    i: str = Field(unique=True, index=True)
    x: int
    y: int
    w: int
    h: int
    symbol: str
    label: str