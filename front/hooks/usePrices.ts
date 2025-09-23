// front/hooks/usePrices.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_URL } from "@/constants/config";

type PriceInfo = {
  id: string;
  amount: number;
};

type PricesResponse = {
  one_time: PriceInfo | null;
  subscription: PriceInfo | null;
};

const fetchPrices = async (): Promise<PricesResponse> => {
  const { data } = await axios.get(`${API_URL}/api/prices`);
  return data;
};

export const usePrices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  return {
    prices: data,
    isLoading,
    error,
  };
};
