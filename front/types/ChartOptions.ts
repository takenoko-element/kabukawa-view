// front/types/ChartOptions.ts
// TradingViewウィジェットに直接渡すオプションの型
export interface TradingViewOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  hide_top_toolbar?: boolean;
  hide_side_toolbar?: boolean;
  hide_legend?: boolean;
  hide_volume?: boolean;
  withdateranges?: boolean;
}

// デフォルトのチャートサイズの型定義
export type DefaultChartSizes = {
  lg: { w: number; h: number };
  md: { w: number; h: number };
  sm: { w: number; h: number };
  xs: { w: number; h: number };
  xxs: { w: number; h: number };
};

// 設定モーダルで管理するすべてのオプションをまとめた型
export type AllChartSettings = TradingViewOptions & {
  enable_chart_operation: boolean;
  defaultChartSizes: DefaultChartSizes;
};
