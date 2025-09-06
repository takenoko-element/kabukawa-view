# api/database.py
import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session

# .envファイルから環境変数を読み込む
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")

# データベースエンジンを作成
engine = create_engine(DATABASE_URL, echo=True)

# APIエンドポイントでセッションを取得するための依存関係
def get_session():
    with Session(engine) as session:
        yield session