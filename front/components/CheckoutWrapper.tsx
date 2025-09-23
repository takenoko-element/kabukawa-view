// front/components/CheckoutWrapper.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from "uuid";

import { Plan } from "@/types";
import { API_URL } from "@/constants/config";
import { PaymentForm } from "./PaymentForm";

// Stripeの公開可能キーを環境変数から読み込む
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Props = {
  plan: Plan;
};

export const CheckoutWrapper = ({ plan }: Props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // 冪等性キー
  const [idempotencyKey] = useState(() => uuidv4());
  const { getToken } = useAuth();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const token = await getToken();
        let response;
        if (plan === "subscription") {
          response = await axios.post(
            `${API_URL}/api/create-subscription`,
            {}, // bodyは空でOK
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          response = await axios.post(
            `${API_URL}/api/create-payment-intent`,
            {}, // bodyは空でOK
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey, // 冪等ヘッダーにuuidv4で作成した値を設定
              },
            }
          );
        }

        setClientSecret(response.data.client_secret);

        return () => {
          effectRan.current = true;
        };
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
