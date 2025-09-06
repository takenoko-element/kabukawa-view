// front/hooks/useTradingViewScript.ts
import { useState, useEffect } from "react";

const TV_SCRIPT_ID = "tradingview-widget-script";
type ScriptStatus = "idle" | "loading" | "ready" | "error";

export const useTradingViewScript = (): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>(() => {
    // 既にスクリプトが存在すれば 'ready' で初期化
    return typeof window !== "undefined" &&
      document.getElementById(TV_SCRIPT_ID)
      ? "ready"
      : "idle";
  });

  useEffect(() => {
    // idle 状態でなければ何もしない (一度だけ実行)
    if (status !== "idle") {
      return;
    }

    // ダブルチェック
    if (document.getElementById(TV_SCRIPT_ID)) {
      setStatus("ready");
      return;
    }

    setStatus("loading");
    const script = document.createElement("script");
    script.id = TV_SCRIPT_ID;
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setStatus("ready");
    script.onerror = () => setStatus("error");

    document.body.appendChild(script);
  }, [status]);

  return status;
};
