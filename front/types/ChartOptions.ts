// front/types/ChartOptions.ts
// TradingViewウィジェットに直接渡すオプションの型
export type TradingViewOptions = {
  hide_side_toolbar: boolean;
  hide_top_toolbar: boolean;
  hide_legend: boolean;
  hide_volume: boolean;
  withdateranges: boolean;
};

// 設定モーダルで管理するすべてのオプションをまとめた型
export type AllChartSettings = TradingViewOptions & {
  enable_chart_operation: boolean;
  default_w?: number;
  default_h?: number;
};
