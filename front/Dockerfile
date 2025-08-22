# Node.jsの公式イメージをベースにする
FROM node:22-alpine AS base

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# Next.jsアプリをビルド
RUN npm run build

# ポートを開放
EXPOSE 3000

# コンテナ起動時にNext.jsサーバーを実行
CMD ["npm", "start"]