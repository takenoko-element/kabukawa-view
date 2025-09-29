// front/components/PaymentForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { TestModeNotice } from "./TestModeNotice";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTheme } from "next-themes";

type PaymentFormProps = {
  clientSecret: string;
};

export const PaymentForm = ({ clientSecret }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const { resolvedTheme } = useTheme();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !elements.getElement(CardNumberElement)) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: cardHolderName,
          },
        },
      }
    );

    if (error) {
      toast.error(error.message || "決済処理中にエラーが発生しました。");
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("アップグレードが完了しました！");
      router.push("/upgrade/success?fromPayment=true");
    }
  };

  const options = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      style: {
        base: {
          color: isDark ? "#FFFFFF" : "#000000",
        },
        invalid: { color: "red" },
      },
    };
  }, [resolvedTheme]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 text-left">
        <h2 className="text-2xl font-bold tracking-tight">カード情報を入力</h2>
        <TestModeNotice />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="card-holder-name">カード名義人</Label>
          <Input
            id="card-holder-name"
            placeholder="TARO YAMADA"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            required
            maxLength={30}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-number">カード番号</Label>
          <div className="rounded-md border p-3 bg-transparent dark:bg-input/30">
            <CardNumberElement id="card-number" options={options} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-expiry">有効期限</Label>
            <div className="rounded-md border p-3 bg-transparent dark:bg-input/30">
              <CardExpiryElement id="card-expiry" options={options} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-cvc">セキュリティコード</Label>
            <div className="rounded-md border p-3 bg-transparent dark:bg-input/30">
              <CardCvcElement id="card-cvc" options={options} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full mt-6"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          支払う
        </Button>
      </form>
    </div>
  );
};
