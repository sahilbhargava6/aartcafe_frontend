// Product prices the way checkout charges them: the discounted price whenever one is set.
type Priced = { base_price?: unknown; discount_price?: unknown; price?: unknown };

export function salePrice(product: Priced): number {
  const discount = Number(product.discount_price);
  if (discount > 0) return discount;
  return Number(product.base_price ?? product.price) || 0;
}

// The original price to show struck through next to the sale price, or null when there is no discount
export function originalPrice(product: Priced): number | null {
  const base = Number(product.base_price);
  return base > salePrice(product) ? base : null;
}

export const formatRupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
