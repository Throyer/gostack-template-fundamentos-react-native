import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY_PRODUCTS = '@GoMarketplace:products';

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const exists = products.find(({ id }) => id === product.id);

      if (exists) {
        setProducts(
          products.map(
            ({ id, ...rest }): Product =>
              id === product.id
                ? {
                    id,
                    ...rest,
                    quantity: rest.quantity + 1,
                  }
                : {
                    ...product,
                    quantity: 1,
                  },
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        STORAGE_KEY_PRODUCTS,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updated = products.map(
        (product): Product =>
          product.id === id
            ? {
                ...product,
                quantity: product.quantity + 1,
              }
            : product,
      );
      setProducts(updated);
      await AsyncStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updated = products
        .map(
          (product): Product =>
            product.id === id
              ? {
                  ...product,
                  quantity: product.quantity - 1,
                }
              : product,
        )
        .filter(product => product.quantity > 0);
      setProducts(updated);
      await AsyncStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
