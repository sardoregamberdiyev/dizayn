import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { products as initialProducts, weightMultiplier, type Product } from './data';

export interface CartItem {
  key: string;
  productId: string;
  weight: string;
  grind: string;
  quantity: number;
  subscription?: string;
}

export interface OrderItem extends CartItem {
  name: string;
  image: string;
  price: number;
}

export interface Customer {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | 'Processing'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | string;

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  date: string;
  customer: Customer;
  deliveryMethod: string;
  notes?: string;
  promoCode?: string;
}

export interface OrderDetails {
  customer: Customer;
  deliveryMethod: string;
  notes?: string;
  promoCode?: string;
  discount?: number;
  shipping?: number;
}

export interface Subscription {
  id: string;
  productId: string;
  frequency: string;
  weight: string;
  grind?: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  date: string;
}

export type SubscriptionInput = Pick<Subscription, 'productId' | 'frequency' | 'weight' | 'grind'>;
export interface User {
  name: string;
  email: string;
}
export type Currency = 'USD' | 'UZS';

const STORAGE_PREFIX = 'coffee-shop.v1.';
const money = (value: number) => Math.round(value * 100) / 100;
export function calculateCartItemPrice(
  product: Product,
  item: Pick<CartItem, 'weight' | 'subscription'>,
): number {
  return money(product.price * weightMultiplier(item.weight) * (item.subscription ? 0.9 : 1));
}

export function calculateCartTotal(cart: CartItem[], products: Product[]): number {
  return money(
    cart.reduce((total, item) => {
      const product = products.find((value) => value.id === item.productId);
      return total + (product ? calculateCartItemPrice(product, item) * item.quantity : 0);
    }, 0),
  );
}

export function calculateOrderAmounts(subtotal: number, discountInput = 0, shippingInput = 0) {
  const discount = money(
    Math.min(subtotal, Math.max(0, Number.isFinite(discountInput) ? discountInput : 0)),
  );
  const shipping = money(Math.max(0, Number.isFinite(shippingInput) ? shippingInput : 0));
  return { discount, shipping, total: money(subtotal - discount + shipping) };
}

const quantityValue = (quantity: number) =>
  Math.min(99, Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)));
const makeId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() ?? Date.now().toString(36).toUpperCase()}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isOptionalText = (value: unknown) => value === undefined || typeof value === 'string';
const isDate = (value: unknown) => isText(value) && Number.isFinite(Date.parse(value));
const isWeight = (value: unknown) =>
  typeof value === 'string' && ['250g', '500g', '1kg'].includes(value);

function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  return (
    ['id', 'slug', 'name', 'origin', 'color', 'image', 'description', 'altitude'].every((key) =>
      isText(value[key]),
    ) &&
    typeof value.roast === 'string' &&
    ['Light', 'Medium', 'Dark'].includes(value.roast) &&
    Array.isArray(value.notes) &&
    value.notes.every(isText) &&
    isAmount(value.price) &&
    isAmount(value.rating) &&
    value.rating <= 5 &&
    isAmount(value.reviews) &&
    Number.isInteger(value.reviews) &&
    (value.stock === undefined || (isAmount(value.stock) && Number.isInteger(value.stock)))
  );
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    isText(value.key) &&
    isText(value.productId) &&
    isWeight(value.weight) &&
    isText(value.grind) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity >= 1 &&
    value.quantity <= 99 &&
    isOptionalText(value.subscription)
  );
}

function isOrder(value: unknown): value is Order {
  if (!isRecord(value) || !isRecord(value.customer)) return false;
  return (
    isText(value.id) &&
    isText(value.status) &&
    isDate(value.date) &&
    isText(value.deliveryMethod) &&
    ['name', 'email', 'address', 'city', 'postalCode', 'country'].every(
      (key) => typeof (value.customer as Record<string, unknown>)[key] === 'string',
    ) &&
    ['subtotal', 'discount', 'shipping', 'total'].every((key) => isAmount(value[key])) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item) =>
        isCartItem(item) &&
        isRecord(item) &&
        isText(item.name) &&
        isText(item.image) &&
        isAmount(item.price),
    ) &&
    isOptionalText(value.notes) &&
    isOptionalText(value.promoCode)
  );
}

function isSubscription(value: unknown): value is Subscription {
  return (
    isRecord(value) &&
    ['id', 'productId', 'frequency'].every((key) => isText(value[key])) &&
    isWeight(value.weight) &&
    typeof value.status === 'string' &&
    ['Active', 'Paused', 'Cancelled'].includes(value.status) &&
    isDate(value.date) &&
    isOptionalText(value.grind)
  );
}

/** Recover safely from obsolete, edited, or partially corrupted browser storage. */
export function validatePersistedState<T>(key: string, saved: unknown, fallback: T): T {
  let valid = false;
  switch (key) {
    case 'products':
      valid = Array.isArray(saved) && saved.length > 0 && saved.every(isProduct);
      break;
    case 'cart':
      valid = Array.isArray(saved) && saved.every(isCartItem);
      break;
    case 'wishlist':
      valid = Array.isArray(saved) && saved.every(isText);
      break;
    case 'orders':
      valid = Array.isArray(saved) && saved.every(isOrder);
      break;
    case 'subscriptions':
      valid = Array.isArray(saved) && saved.every(isSubscription);
      break;
    case 'user':
      valid = saved === null || (isRecord(saved) && isText(saved.name) && isText(saved.email));
      break;
    case 'currency':
      valid = saved === 'USD' || saved === 'UZS';
      break;
    default:
      valid = false;
  }
  return valid ? (saved as T) : fallback;
}

function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      if (saved === null) return initialValue;
      const parsed: unknown = JSON.parse(saved);
      return validatePersistedState(key, parsed, initialValue);
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* Private browsing and storage quotas should not prevent shopping. */
    }
  }, [key, value]);
  return [value, setValue];
}

export interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  subscriptions: Subscription[];
  user: User | null;
  currency: Currency;
  notification: string;
  cartCount: number;
  cartTotal: number;
  addToCart: (
    productId: string,
    weight?: string,
    grind?: string,
    quantity?: number,
    subscription?: string,
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  toggleWishlist: (id: string) => void;
  clearCart: () => void;
  placeOrder: (details: OrderDetails) => Order;
  login: (name: string, email: string) => void;
  logout: () => void;
  setCurrency: Dispatch<SetStateAction<Currency>>;
  formatPrice: (amount: number) => string;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addSubscription: (input: SubscriptionInput) => Subscription;
  updateSubscription: (id: string, status: Subscription['status']) => void;
  notify: (message: string) => void;
  dismissNotification: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = usePersistentState<Product[]>('products', initialProducts);
  const [cart, setCart] = usePersistentState<CartItem[]>('cart', []);
  const [wishlist, setWishlist] = usePersistentState<string[]>('wishlist', []);
  const [orders, setOrders] = usePersistentState<Order[]>('orders', []);
  const [subscriptions, setSubscriptions] = usePersistentState<Subscription[]>('subscriptions', []);
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [currency, setCurrency] = usePersistentState<Currency>('currency', 'USD');
  const [notification, setNotification] = useState('');
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string) => {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    setNotification(message);
    notificationTimer.current = setTimeout(() => setNotification(''), 3800);
  }, []);

  useEffect(
    () => () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    },
    [],
  );

  const addToCart = useCallback(
    (
      productId: string,
      weight = '250g',
      grind = 'Whole Bean',
      quantity = 1,
      subscription?: string,
    ) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return;
      if (product.stock === 0) {
        notify('This coffee is currently sold out.');
        return;
      }
      const key = [productId, weight, grind, subscription ?? ''].join('::');
      setCart((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing)
          return current.map((item) =>
            item.key === key
              ? { ...item, quantity: quantityValue(item.quantity + quantityValue(quantity)) }
              : item,
          );
        return [
          ...current,
          {
            key,
            productId,
            weight,
            grind,
            quantity: quantityValue(quantity),
            ...(subscription ? { subscription } : {}),
          },
        ];
      });
      notify(`${product.name} added to your bag.`);
    },
    [products, setCart, notify],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      setCart((current) =>
        quantity <= 0
          ? current.filter((item) => item.key !== key)
          : current.map((item) =>
              item.key === key ? { ...item, quantity: quantityValue(quantity) } : item,
            ),
      );
    },
    [setCart],
  );

  const removeFromCart = useCallback(
    (key: string) => setCart((current) => current.filter((item) => item.key !== key)),
    [setCart],
  );
  const clearCart = useCallback(() => setCart([]), [setCart]);

  const toggleWishlist = useCallback(
    (id: string) => {
      if (!products.some((product) => product.id === id)) return;
      setWishlist((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
    },
    [products, setWishlist],
  );

  const cartTotal = useMemo(() => calculateCartTotal(cart, products), [cart, products]);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = useCallback(
    (details: OrderDetails) => {
      const items: OrderItem[] = cart.flatMap((item) => {
        const product = products.find((value) => value.id === item.productId);
        return product
          ? [
              {
                ...item,
                name: product.name,
                image: product.image,
                price: calculateCartItemPrice(product, item),
              },
            ]
          : [];
      });
      if (!items.length) throw new Error('Add a coffee to your bag before placing an order.');
      if (
        !details.customer.name.trim() ||
        !details.customer.email.trim() ||
        !details.customer.address.trim()
      )
        throw new Error('Please complete your contact and delivery details.');
      const subtotal = money(items.reduce((total, item) => total + item.price * item.quantity, 0));
      const { discount, shipping, total } = calculateOrderAmounts(
        subtotal,
        details.discount,
        details.shipping,
      );
      const order: Order = {
        id: makeId('CS'),
        items,
        subtotal,
        discount,
        shipping,
        total,
        status: 'Processing',
        date: new Date().toISOString(),
        customer: { ...details.customer },
        deliveryMethod: details.deliveryMethod,
        ...(details.notes ? { notes: details.notes } : {}),
        ...(details.promoCode ? { promoCode: details.promoCode } : {}),
      };
      setOrders((current) => [order, ...current]);
      const activatedPlans: Subscription[] = items
        .filter((item) => item.subscription)
        .map((item) => ({
          id: makeId('SUB'),
          productId: item.productId,
          frequency: item.subscription!,
          weight: item.weight,
          grind: item.grind,
          status: 'Active',
          date: order.date,
        }));
      if (activatedPlans.length) setSubscriptions((current) => [...activatedPlans, ...current]);
      setCart([]);
      notify('Your demo order is confirmed. Thank you!');
      return order;
    },
    [cart, products, setOrders, setSubscriptions, setCart, notify],
  );

  const login = useCallback(
    (name: string, email: string) => {
      setUser({ name: name.trim(), email: email.trim().toLowerCase() });
      notify(`Welcome, ${name.trim()}!`);
    },
    [setUser, notify],
  );

  const logout = useCallback(() => {
    setUser(null);
    notify('You have signed out.');
  }, [setUser, notify]);
  const updateProduct = useCallback(
    (product: Product) => {
      setProducts((current) =>
        current.map((value) => (value.id === product.id ? { ...product } : value)),
      );
      notify('Product updated.');
    },
    [setProducts, notify],
  );
  const addProduct = useCallback(
    (product: Product) => {
      setProducts((current) =>
        current.some((value) => value.id === product.id || value.slug === product.slug)
          ? current
          : [...current, { ...product }],
      );
      notify('Product saved to the local catalog.');
    },
    [setProducts, notify],
  );
  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status } : order)),
      );
      notify('Order status updated.');
    },
    [setOrders, notify],
  );

  const addSubscription = useCallback(
    (input: SubscriptionInput) => {
      const subscription: Subscription = {
        ...input,
        id: makeId('SUB'),
        status: 'Active',
        date: new Date().toISOString(),
      };
      setSubscriptions((current) => [subscription, ...current]);
      notify('Your demo coffee subscription is active.');
      return subscription;
    },
    [setSubscriptions, notify],
  );
  const updateSubscription = useCallback(
    (id: string, status: Subscription['status']) => {
      setSubscriptions((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      notify(`Subscription ${status.toLowerCase()}.`);
    },
    [setSubscriptions, notify],
  );

  const formatPrice = useCallback(
    (amount: number) => {
      const selectedCurrency = currency === 'UZS' ? 'UZS' : 'USD';
      // A configurable display estimate, not a live exchange-rate or payment quote.
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedCurrency,
        maximumFractionDigits: selectedCurrency === 'UZS' ? 0 : 2,
      }).format(selectedCurrency === 'UZS' ? amount * 12800 : amount);
    },
    [currency],
  );

  const value: StoreContextValue = {
    products,
    cart,
    wishlist,
    orders,
    subscriptions,
    user,
    currency,
    notification,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    clearCart,
    placeOrder,
    login,
    logout,
    setCurrency,
    formatPrice,
    updateProduct,
    addProduct,
    updateOrderStatus,
    addSubscription,
    updateSubscription,
    notify,
    dismissNotification: () => setNotification(''),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider.');
  return context;
}
