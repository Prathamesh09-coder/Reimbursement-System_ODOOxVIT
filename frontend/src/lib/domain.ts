export const normalizeStatus = (status?: string | null): "pending" | "approved" | "rejected" => {
  const value = (status || "").toUpperCase();
  if (value === "APPROVED") return "approved";
  if (value === "REJECTED") return "rejected";
  return "pending";
};

export const formatMoney = (amount?: number | string | null, currency?: string | null): string => {
  const numericAmount = Number(amount || 0);
  const curr = currency || "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${curr} ${numericAmount.toFixed(2)}`;
  }
};
