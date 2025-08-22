# Pythonの公式イメージをベースにする
FROM python:3.13-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要なライブラリをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコードをコピー
COPY . .

# ポートを開放
EXPOSE 8000

# コンテナ起動時にUvicornサーバーを実行
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]