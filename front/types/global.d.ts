// front/types/global.d.ts

// 既存のWindowインターフェースを拡張する
declare global {
  interface Window {
    // TradingViewプロパティを追加。
    // スクリプト読み込み後に存在するため、オプショナル(?)にしておくのが安全。
    // 型が複雑なので、一旦 `any` で定義するのが簡単です。
    TradingView?: any;
  }
}

// このファイルがモジュールであることを示すためのおまじない
export {};
