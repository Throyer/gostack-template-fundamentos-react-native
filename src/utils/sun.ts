interface Product {
  price: number;
  quantity: number;
}

export const sunTotalItensOnCart = (products: Product[]): number =>
  products.reduce((a: number, { quantity: b }) => a + b, 0);

export const sunTotalOnCart = (products: Product[]): number =>
  products.reduce((a: number, { price: b, quantity }) => a + quantity * b, 0);
