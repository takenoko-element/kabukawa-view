# api/create_tables.py
from database import engine
from models import SQLModel

import models

def main():
    print("Creating database and tables...")
    SQLModel.metadata.create_all(engine)
    print("Done!")

if __name__ == "__main__":
    main()

# テーブルの作成方法
# python create_tables.py