// front/components/DashboardHeader.tsx
import {
  CandlestickChart,
  LineChart,
  BarChart4,
  Settings,
  Search,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { chartTypeOptions, ChartType } from "@/constants/chartTypes";
import { intervalOptions, Interval } from "@/constants/intervals";
import ThemeToggleButton from "./ThemeToggleButton";
import { UpgradeButton } from "./UpgradeButton";

type Props = {
  isVisible: boolean;
  interval: Interval;
  setInterval: (interval: Interval) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  openSettingsModal: () => void;
  openSearchModal: () => void;
  saveLayout: () => void;
};

const iconMap: Record<ChartType, React.ElementType> = {
  candles: CandlestickChart,
  line: LineChart,
  bars: BarChart4,
};

const DashboardHeader = ({
  isVisible,
  interval,
  setInterval,
  chartType,
  setChartType,
  openSettingsModal,
  openSearchModal,
  saveLayout,
}: Props) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out shrink-0 ${
        isVisible ? "auto" : "h-0"
      }`}
    >
      <div
        className={`p-4 space-y-4 transition-opacity duration-300 overflow-hidden ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">KABUKAWA View</h1>
          <div className="flex items-center gap-4">
            <SignedIn>
              <UpgradeButton />
              <Button
                onClick={saveLayout}
                variant="outline"
                className="transition-all duration-200"
              >
                レイアウト保存
              </Button>
            </SignedIn>
            <ThemeToggleButton />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">ログイン</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {chartTypeOptions.map((option) => {
              const IconComponent = iconMap[option.name];
              return (
                <Button
                  key={option.name}
                  variant={chartType === option.name ? "default" : "secondary"}
                  size="icon"
                  onClick={() => setChartType(option.name)}
                  title={option.label}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={openSettingsModal}
              title="チャート設定"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Separator orientation="vertical" />
          <div className="flex items-center gap-1">
            {intervalOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setInterval(option.value)}
                variant={interval === option.value ? "default" : "secondary"}
                className="transition-all duration-200"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" />
          <div className="ml-4 flex items-center gap-2">
            <Button onClick={openSearchModal}>
              <Search className="mr-2 h-4 w-4" />
              銘柄を追加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardHeader;
