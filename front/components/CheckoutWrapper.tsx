// front/components/CheckoutWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from "uuid";

import { API_URL } from "@/constants/config";
import { PaymentForm } from "./PaymentForm";

// Stripeの公開可能キーを環境変数から読み込む
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const CheckoutWrapper = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // 冪等性キー
  const [idempotencyKey] = useState(() => uuidv4());
  const { getToken } = useAuth();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.post(
          `${API_URL}/api/create-payment-intent`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Idempotency-Key": idempotencyKey, // 冪等ヘッダーにuuidv4で作成した値を設定
            },
          }
        );
        setClientSecret(data.client_secret);
      } catch (error) {
        console.error("PaymentIntentの作成に失敗しました", error);
      }
    };

    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border bg-card p-6 text-foreground shadow-lg">
      {!clientSecret ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
};
