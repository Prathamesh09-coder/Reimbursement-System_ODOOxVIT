import axios from "axios";

export const convertCurrency = async (
  from: string,
  to: string,
  amount: number
): Promise<number> => {
  const res = await axios.get(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  return amount * Number(res.data.rates[to] ?? 1);
};