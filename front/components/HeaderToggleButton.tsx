// front/components/HeaderToggleButton.tsx
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

export const HeaderToggleButton = ({ isVisible, setIsVisible }: Props) => {
  return isVisible ? (
    <Button
      onClick={() => setIsVisible(false)}
      className="absolute top-2 left-2 z-50 opacity-50 hover:opacity-100 transition-opacity duration-200"
      size="icon"
      variant="outline"
      title="ヘッダーを非表示"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  ) : (
    <Button
      onClick={() => setIsVisible(true)}
      className="absolute top-2 left-2 z-50 opacity-50 hover:opacity-100 transition-opacity duration-200"
      size="icon"
      variant="outline"
      title="ヘッダーを表示"
    >
      <ChevronDown className="h-5 w-5" />
    </Button>
  );
};
