// front/types/LayoutItem.ts
import { Layout } from "react-grid-layout";

// グリッドレイアウトのアイテム
export interface LayoutItem extends Layout {
  i: string;
  symbol: string;
  label: string;
}

// 画面サイズごとのレイアウトを格納するオブジェクトの型
export type Layouts = {
  [key: string]: LayoutItem[];
};
