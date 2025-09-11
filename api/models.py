# api/models.py
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

# Usersテーブルのモデル
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(unique=True, index=True)
    email: str

    layouts: List["LayoutItem"] = Relationship(back_populates="user")

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
    i: str
    x: int
    y: int
    w: int
    h: int
    symbol: str
    label: str
    breakpoint: str

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="layouts")