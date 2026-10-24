import { describe, expect, it } from 'vitest';
import { products, weightMultiplier } from '../src/data';
import {
  calculateCartItemPrice,
  calculateCartTotal,
  calculateOrderAmounts,
  validatePersistedState,
  type CartItem,
} from '../src/store';

const java = products.find((product) => product.id === 'java-arabica')!;
const sumatra = products.find((product) => product.id === 'sumatra-arabica')!;
const item = (
  productId: string,
  weight: string,
  quantity: number,
  subscription?: string,
): CartItem => ({
  key: `${productId}-${weight}`,
  productId,
  weight,
  grind: 'Filter',
  quantity,
  subscription,
});

describe('variant pricing and invoice consistency', () => {
  it('prices a mixed-origin, mixed-weight bag from the selected variants', () => {
    const cart = [item(java.id, '500g', 2), item(sumatra.id, '1kg', 1)];
    expect(calculateCartItemPrice(java, cart[0])).toBe(31.45);
    expect(calculateCartTotal(cart, products)).toBe(125.9);
    expect(weightMultiplier('500g') / 2).toBeLessThan(weightMultiplier('250g'));
    expect(weightMultiplier('1kg') / 4).toBeLessThan(weightMultiplier('500g') / 2);
  });

  it('rounds the discounted unit price once so quantity totals equal order snapshots', () => {
    const recurring = item(java.id, '500g', 3, 'Every 2 weeks');
    const unitPrice = calculateCartItemPrice(java, recurring);
    expect(unitPrice).toBe(28.31);
    expect(calculateCartTotal([recurring], products)).toBe(84.93);
    expect(calculateCartTotal([recurring], products)).toBe(
      Math.round(unitPrice * recurring.quantity * 100) / 100,
    );
  });

  it('ignores an unavailable catalog entry without charging for it', () => {
    expect(calculateCartTotal([item('removed-coffee', '250g', 2)], products)).toBe(0);
    expect(calculateCartTotal([], products)).toBe(0);
  });

  it('calculates discount and shipping without negative totals or invalid adjustments', () => {
    expect(calculateOrderAmounts(125.9, 12.59, 5)).toEqual({
      discount: 12.59,
      shipping: 5,
      total: 118.31,
    });
    expect(calculateOrderAmounts(18, 200, 5)).toEqual({ discount: 18, shipping: 5, total: 5 });
    expect(calculateOrderAmounts(18, -3, -9)).toEqual({ discount: 0, shipping: 0, total: 18 });
    expect(calculateOrderAmounts(18, Number.NaN, Number.POSITIVE_INFINITY)).toEqual({
      discount: 0,
      shipping: 0,
      total: 18,
    });
  });
});

describe('browser storage recovery', () => {
  it('rejects null array entries and restores safe state instead of crashing', () => {
    expect(validatePersistedState('products', [null], products)).toBe(products);
    expect(validatePersistedState('cart', [null], [])).toEqual([]);
    expect(validatePersistedState('wishlist', [null], [])).toEqual([]);
    expect(validatePersistedState('orders', [null], [])).toEqual([]);
    expect(validatePersistedState('subscriptions', [null], [])).toEqual([]);
  });

  it('keeps valid catalog and cart data but rejects unsafe quantities and prices', () => {
    expect(validatePersistedState('products', products, [])).toHaveLength(6);
    const validCart = [item(java.id, '500g', 2)];
    expect(validatePersistedState('cart', validCart, [])).toBe(validCart);
    expect(validatePersistedState('cart', [{ ...validCart[0], quantity: -4 }], [])).toEqual([]);
    expect(validatePersistedState('products', [{ ...java, price: 'free' }], products)).toBe(
      products,
    );
    expect(validatePersistedState('products', [], products)).toBe(products);
  });

  it('recovers malformed profile and currency without retaining invalid values', () => {
    expect(
      validatePersistedState('user', { name: null, email: 'alex@example.com' }, null),
    ).toBeNull();
    expect(
      validatePersistedState('user', { name: 'Alex', email: 'alex@example.com' }, null),
    ).toEqual({ name: 'Alex', email: 'alex@example.com' });
    expect(validatePersistedState('currency', 'INVALID', 'USD')).toBe('USD');
    expect(validatePersistedState('currency', 'UZS', 'USD')).toBe('UZS');
  });
});
