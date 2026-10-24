import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Coffee,
  Download,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Trash2,
  TrendingUp,
  Users,
  X,
  Repeat,
  ImagePlus,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store';
import type { Product } from '../data';
import '../styles/admin.css';

type Coupon = { id: string; code: string; discount: number; active: boolean };
type Review = {
  id: string;
  customer: string;
  product: string;
  rating: number;
  message: string;
  published: boolean;
};
type Story = { id: string; title: string; category: string; status: string };
type ShopSettings = { name: string; email: string; freeShipping: number; dispatch: string };

function matchesLocalShape(value: unknown, model: unknown): boolean {
  if (Array.isArray(model))
    return (
      Array.isArray(value) &&
      value.every((item) => !model.length || matchesLocalShape(item, model[0]))
    );
  if (model !== null && typeof model === 'object')
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.entries(model).every(([key, field]) =>
        matchesLocalShape((value as Record<string, unknown>)[key], field),
      )
    );
  return typeof value === typeof model && (typeof value !== 'number' || Number.isFinite(value));
}

function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`coffee.admin.${key}`);
      if (!saved) return fallback;
      const parsed: unknown = JSON.parse(saved);
      if (!matchesLocalShape(parsed, fallback)) return fallback;
      if (
        key === 'stock' &&
        !Object.values(parsed as Record<string, unknown>).every(
          (quantity) => typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 0,
        )
      )
        return fallback;
      if (
        key === 'subscriptionStatuses' &&
        !Object.values(parsed as Record<string, unknown>).every(
          (status) => typeof status === 'string',
        )
      )
        return fallback;
      return parsed as T;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(`coffee.admin.${key}`, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const navigation = [
  { section: '', label: 'Overview', icon: LayoutDashboard },
  { section: 'analytics', label: 'Analytics', icon: BarChart3 },
  { section: 'orders', label: 'Orders', icon: ShoppingBag },
  { section: 'products', label: 'Products', icon: Package },
  { section: 'inventory', label: 'Inventory & categories', icon: Tags },
  { section: 'customers', label: 'Customers', icon: Users },
  { section: 'promotions', label: 'Promotions', icon: TrendingUp },
  { section: 'reviews', label: 'Reviews', icon: Star },
  { section: 'content', label: 'Journal', icon: FileText },
  { section: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { section: 'settings', label: 'Settings', icon: Settings },
];

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-modal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="admin-modal-heading">
        <h2>{title}</h2>
        <button className="admin-icon" type="button" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function Status({ children }: { children: ReactNode }) {
  const status = String(children).toLowerCase();
  return (
    <span
      className={`admin-status ${/delivered|active|published|approved|paid/.test(status) ? 'is-positive' : /cancelled|out of stock|inactive/.test(status) ? 'is-negative' : ''}`}
    >
      {children}
    </span>
  );
}

function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="admin-empty">
      <Coffee size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="button button-outline" to="/shop">
        Visit the storefront <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const data = rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${(typeof cell === 'string' && /^[=+\-@]/.test(cell) ? "'" + cell : String(cell)).replace(/"/g, '""')}"`,
        )
        .join(','),
    )
    .join('\n');
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const blankProduct: Product = {
  id: '',
  slug: '',
  name: '',
  origin: 'Java',
  roast: 'Medium',
  notes: [],
  price: 18,
  color: '#E13B32',
  image: '/images/java-bag.svg',
  description: '',
  altitude: '1,200–1,600 m',
  rating: 0,
  reviews: 0,
};

export function AdminPage() {
  const store = useStore();
  const { products, orders, subscriptions, formatPrice, notify } = store;
  const location = useLocation();
  const section = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const active = navigation.find((item) => item.section === section) || navigation[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('All statuses');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [imageError, setImageError] = useState('');
  const [stock, setStock] = useLocalState<Record<string, number>>('stock', {});
  const [categories, setCategories] = useLocalState<string[]>('categories', [
    'Single origin',
    'Signature blends',
    'Coffee bundles',
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [coupons, setCoupons] = useLocalState<Coupon[]>('coupons', [
    { id: 'welcome', code: 'COFFEE10', discount: 10, active: true },
  ]);
  const [couponForm, setCouponForm] = useState(false);
  const [reviews, setReviews] = useLocalState<Review[]>('reviews', [
    {
      id: 'r1',
      customer: 'Maya R. · sample review',
      product: 'Sumatra Arabica',
      rating: 5,
      message: 'Rich chocolate notes and such a lovely morning ritual.',
      published: true,
    },
    {
      id: 'r2',
      customer: 'Alex K. · sample review',
      product: 'Java Arabica',
      rating: 5,
      message: 'Beautifully balanced in a pour-over. My new favorite.',
      published: false,
    },
  ]);
  const [stories, setStories] = useLocalState<Story[]>('stories', [
    {
      id: 's1',
      title: 'A little patience. A better cup.',
      category: 'Brew guides',
      status: 'Published',
    },
    {
      id: 's2',
      title: 'From volcanic soil to your morning ritual',
      category: 'Origins',
      status: 'Published',
    },
  ]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [settings, setSettings] = useLocalState<ShopSettings>('settings', {
    name: 'COFFEE SHOP',
    email: 'hello@coffeeshop.example',
    freeShipping: 50,
    dispatch: 'Monday–Friday, 9am–5pm',
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [subscriptionStatuses, setSubscriptionStatuses] = useLocalState<Record<string, string>>(
    'subscriptionStatuses',
    {},
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setQuery('');
    setOrderFilter('All statuses');
  }, [section]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => !/delivered|cancelled/i.test(order.status)).length;
  const customers = useMemo(() => {
    const entries = new Map<
      string,
      { name: string; email: string; orders: number; total: number; city: string }
    >();
    orders.forEach((order) => {
      const previous = entries.get(order.customer.email);
      entries.set(order.customer.email, {
        name: order.customer.name,
        email: order.customer.email,
        orders: (previous?.orders || 0) + 1,
        total: (previous?.total || 0) + order.total,
        city: order.customer.city,
      });
    });
    return [...entries.values()];
  }, [orders]);
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.origin} ${product.roast}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const filteredOrders = orders.filter(
    (order) =>
      `${order.id} ${order.customer.name} ${order.customer.email}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (orderFilter === 'All statuses' || order.status.toLowerCase() === orderFilter.toLowerCase()),
  );
  const dailySales = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + offset);
    const day = date.toDateString();
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      amount: orders
        .filter((order) => new Date(order.date).toDateString() === day)
        .reduce((sum, order) => sum + order.total, 0),
    };
  });
  const maxSales = Math.max(...dailySales.map((day) => day.amount), 1);

  function startProduct(product?: Product) {
    setIsNewProduct(!product);
    setEditingProduct(product ? { ...product, notes: [...product.notes] } : { ...blankProduct });
    setImageError('');
  }
  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;
    const slug =
      editingProduct.slug ||
      editingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const product = { ...editingProduct, id: editingProduct.id || `${slug}-${Date.now()}`, slug };
    if (products.some((item) => item.slug === slug && item.id !== product.id)) {
      setImageError('A product already uses this URL slug. Please choose another.');
      return;
    }
    if (isNewProduct) store.addProduct(product);
    else store.updateProduct(product);
    setEditingProduct(null);
    notify(isNewProduct ? 'Product added to your local catalog.' : 'Product updated.');
  }
  function uploadProductImage(file?: File) {
    if (!file || !editingProduct) return;
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.type)) {
      setImageError('Choose a JPG, PNG, WebP, GIF, or SVG image.');
      return;
    }
    if (file.size > 1_500_000) {
      setImageError('Please use an image smaller than 1.5 MB for local storage.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditingProduct((previous) =>
        previous ? { ...previous, image: String(reader.result) } : previous,
      );
      setImageError('');
    };
    reader.readAsDataURL(file);
  }

  const exportOrders = () =>
    downloadCsv('coffee-shop-orders.csv', [
      ['Order', 'Date', 'Customer', 'Email', 'Status', 'Total (USD)'],
      ...orders.map((order) => [
        order.id,
        order.date,
        order.customer.name,
        order.customer.email,
        order.status,
        order.total,
      ]),
    ]);
  const searchControl = (
    <label className="admin-search">
      <Search size={17} />
      <input
        aria-label={`Search ${active.label.toLowerCase()}`}
        placeholder={`Search ${active.label.toLowerCase()}...`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </label>
  );

  const orderTable = (rows = filteredOrders) =>
    rows.length ? (
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th className="align-right">Total</th>
              <th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link className="admin-table-link" to={`/account/orders/${order.id}`}>
                    #{order.id.replace(/^CS-/, '')}
                  </Link>
                </td>
                <td>
                  <strong>{order.customer.name}</strong>
                  <small>{order.customer.email}</small>
                </td>
                <td>
                  {new Date(order.date).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td>
                  <Status>{order.status}</Status>
                </td>
                <td className="align-right">{formatPrice(order.total)}</td>
                <td>
                  <select
                    aria-label={`Status for order ${order.id}`}
                    value={order.status}
                    onChange={(event) => {
                      store.updateOrderStatus(order.id, event.target.value);
                      notify('Order status updated.');
                    }}
                  >
                    {[
                      ...new Set([
                        order.status,
                        'Processing',
                        'Packed',
                        'Shipped',
                        'Delivered',
                        'Cancelled',
                      ]),
                    ].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty
        title={
          query || orderFilter !== 'All statuses'
            ? 'No matching orders'
            : 'The first cup starts here.'
        }
        description={
          query || orderFilter !== 'All statuses'
            ? 'Try a different search or status filter.'
            : 'Orders placed through the demo checkout will appear here. No orders have been invented.'
        }
      />
    );

  function renderSection() {
    if (
      section === '' ||
      section === 'analytics' ||
      !navigation.some((item) => item.section === section)
    )
      return (
        <>
          <div className="admin-metrics">
            {[
              {
                label: 'Total revenue',
                value: formatPrice(totalRevenue),
                detail: 'All local demo orders',
                icon: TrendingUp,
              },
              {
                label: 'Orders',
                value: orders.length,
                detail: `${pendingOrders} awaiting completion`,
                icon: ShoppingBag,
              },
              {
                label: 'Customers',
                value: customers.length,
                detail: 'Unique checkout email addresses',
                icon: Users,
              },
              {
                label: 'Products',
                value: products.length,
                detail: `${products.filter((product) => (stock[product.id] ?? product.stock ?? 48) <= 10).length} with low local inventory`,
                icon: Package,
              },
            ].map((metric) => (
              <article className="admin-metric" key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <metric.icon size={18} />
                </div>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel admin-sales-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Your week, in coffee.</h2>
                  <p>Sales from local demo orders</p>
                </div>
                <span className="admin-subtle-pill">
                  Last 7 days <ChevronDown size={13} />
                </span>
              </div>
              <div
                className="admin-chart"
                role="img"
                aria-label={`Sales over the last seven days: ${dailySales.map((day) => `${day.day} ${formatPrice(day.amount)}`).join(', ')}`}
              >
                <div className="admin-chart-values">
                  <span>{formatPrice(maxSales === 1 ? 100 : maxSales)}</span>
                  <span>{formatPrice(maxSales === 1 ? 50 : maxSales / 2)}</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="admin-chart-bars">
                  {dailySales.map((day, index) => (
                    <div className="admin-chart-day" key={index}>
                      <div className="admin-chart-track">
                        <div
                          className="admin-chart-bar"
                          style={{
                            height: `${day.amount ? Math.max(3, (day.amount / maxSales) * 100) : 0}%`,
                          }}
                        >
                          <span>{formatPrice(day.amount)}</span>
                        </div>
                      </div>
                      <small>{day.day}</small>
                    </div>
                  ))}
                </div>
              </div>
              {!orders.length && (
                <p className="admin-chart-empty">
                  Your first demo order will bring this chart to life.
                </p>
              )}
            </section>
            <section className="admin-panel admin-catalog-note">
              <span className="eyebrow">THE GOOD STUFF</span>
              <Coffee size={40} strokeWidth={1.2} />
              <h2>
                A fresh start.
                <br />A better cup.
              </h2>
              <p>
                Your storefront is ready to explore. Keep the catalog considered and the coffee
                exceptional.
              </p>
              <button className="button button-primary" onClick={() => startProduct()}>
                Add a product <Plus size={16} />
              </button>
              <Link to="/shop">
                View the collection <ArrowRight size={15} />
              </Link>
            </section>
          </div>
          <section className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <h2>Recent orders</h2>
                <p>A little care in every delivery.</p>
              </div>
              <Link to="/admin/orders" className="admin-text-link">
                View all orders <ArrowRight size={15} />
              </Link>
            </div>
            {orderTable(orders.slice(0, 5))}
          </section>
          {section === 'analytics' && (
            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>By coffee origin</h2>
                  <p>Current catalog composition</p>
                </div>
              </div>
              <div className="admin-origin-stats">
                {[...new Set(products.map((product) => product.origin))].map((origin) => (
                  <div key={origin}>
                    <strong>{origin}</strong>
                    <div>
                      <span
                        style={{
                          width: `${(products.filter((product) => product.origin === origin).length / products.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span>
                      {products.filter((product) => product.origin === origin).length} products
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      );
    if (section === 'orders')
      return (
        <section className="admin-panel">
          <div className="admin-toolbar">
            {searchControl}
            <select
              aria-label="Filter orders by status"
              value={orderFilter}
              onChange={(event) => setOrderFilter(event.target.value)}
            >
              {['All statuses', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(
                (status) => (
                  <option key={status}>{status}</option>
                ),
              )}
            </select>
            <span className="admin-count">{filteredOrders.length} orders</span>
          </div>
          {orderTable()}
        </section>
      );
    if (section === 'products')
      return (
        <section className="admin-panel">
          <div className="admin-toolbar">
            {searchControl}
            <span className="admin-count">{filteredProducts.length} products</span>
            <button
              className="button button-primary admin-small-button"
              onClick={() => startProduct()}
            >
              <Plus size={16} /> Add product
            </button>
          </div>
          {filteredProducts.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Origin</th>
                    <th>Roast</th>
                    <th>Price / 250g</th>
                    <th>Inventory</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={product.image} alt="" />
                          <div>
                            <Link to={`/product/${product.slug}`}>{product.name}</Link>
                            <small>{product.notes.join(' · ')}</small>
                          </div>
                        </div>
                      </td>
                      <td>{product.origin}</td>
                      <td>{product.roast}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <Status>
                          {(stock[product.id] ?? product.stock ?? 48) === 0
                            ? 'Out of stock'
                            : `${stock[product.id] ?? product.stock ?? 48} in stock`}
                        </Status>
                      </td>
                      <td>
                        <button
                          className="admin-icon"
                          onClick={() => startProduct(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No coffee found"
              description="Try another search, or add a new product to your local catalog."
            />
          )}
        </section>
      );
    if (section === 'inventory')
      return (
        <>
          <div className="admin-callout">
            <AlertTriangle size={18} />
            <p>
              Stock updates affect the local catalog. Categories are local planning labels. No
              production inventory is reserved.
            </p>
          </div>
          <section className="admin-panel">
            <div className="admin-toolbar">
              {searchControl}
              <span className="admin-count">Edit quantities directly</span>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Coffee</th>
                    <th>Origin</th>
                    <th>Local inventory</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>{product.origin}</td>
                      <td>
                        <input
                          className="admin-stock-input"
                          type="number"
                          min="0"
                          max="99999"
                          aria-label={`${product.name} inventory`}
                          value={stock[product.id] ?? product.stock ?? 48}
                          onChange={(event) => {
                            const quantity = Math.max(0, Math.floor(Number(event.target.value)));
                            setStock((previous) => ({ ...previous, [product.id]: quantity }));
                            store.updateProduct({ ...product, stock: quantity });
                          }}
                        />
                      </td>
                      <td>
                        <Status>
                          {(stock[product.id] ?? product.stock ?? 48) === 0
                            ? 'Out of stock'
                            : (stock[product.id] ?? product.stock ?? 48) <= 10
                              ? 'Low stock'
                              : 'Available'}
                        </Status>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <h2>Categories</h2>
                <p>Organize your local planning workspace.</p>
              </div>
            </div>
            <div className="admin-category-list">
              {categories.map((category) => (
                <span key={category}>
                  {category}
                  <button
                    aria-label={`Remove category ${category}`}
                    onClick={() =>
                      setCategories((previous) => previous.filter((item) => item !== category))
                    }
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <form
              className="admin-inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (newCategory.trim() && !categories.includes(newCategory.trim()))
                  setCategories((previous) => [...previous, newCategory.trim()]);
                setNewCategory('');
              }}
            >
              <label className="sr-only" htmlFor="new-category">
                New category
              </label>
              <input
                id="new-category"
                placeholder="New category name"
                required
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              />
              <button className="button button-outline" type="submit">
                <Plus size={16} /> Add category
              </button>
            </form>
          </section>
        </>
      );
    if (section === 'customers')
      return (
        <section className="admin-panel">
          <div className="admin-toolbar">
            {searchControl}
            <span className="admin-count">{customers.length} customers</span>
          </div>
          {customers.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Location</th>
                    <th>Orders</th>
                    <th>Total spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter((customer) =>
                      `${customer.name} ${customer.email}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((customer) => (
                      <tr key={customer.email}>
                        <td>
                          <strong>{customer.name}</strong>
                          <small>{customer.email}</small>
                        </td>
                        <td>{customer.city}</td>
                        <td>{customer.orders}</td>
                        <td>{formatPrice(customer.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="A community, one cup at a time."
              description="Customers from local demo checkout orders will appear here."
            />
          )}
        </section>
      );
    if (section === 'promotions')
      return (
        <>
          <div className="admin-callout">
            <Tags size={18} />
            <p>
              COFFEE10 is the storefront demo promotion. Additional codes here are local campaign
              drafts; checkout redemption requires backend integration.
            </p>
          </div>
          <section className="admin-panel">
            <div className="admin-toolbar">
              {searchControl}
              <button
                className="button button-primary admin-small-button"
                onClick={() => setCouponForm(true)}
              >
                <Plus size={16} /> Create promotion
              </button>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons
                    .filter((coupon) => coupon.code.toLowerCase().includes(query.toLowerCase()))
                    .map((coupon) => (
                      <tr key={coupon.id}>
                        <td>
                          <strong className="admin-coupon-code">{coupon.code}</strong>
                        </td>
                        <td>{coupon.discount}% off</td>
                        <td>
                          <Status>{coupon.active ? 'Active draft' : 'Inactive'}</Status>
                        </td>
                        <td>
                          <button
                            className="admin-text-link"
                            onClick={() =>
                              setCoupons((previous) =>
                                previous.map((item) =>
                                  item.id === coupon.id ? { ...item, active: !item.active } : item,
                                ),
                              )
                            }
                          >
                            {coupon.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="admin-icon"
                            aria-label={`Delete ${coupon.code}`}
                            onClick={() =>
                              setCoupons((previous) =>
                                previous.filter((item) => item.id !== coupon.id),
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      );
    if (section === 'reviews')
      return (
        <>
          <div className="admin-callout">
            <Star size={18} />
            <p>
              Sample reviews for moderation practice. Changes remain in this browser and do not
              change storefront review counts.
            </p>
          </div>
          <section className="admin-panel">
            <div className="admin-toolbar">
              {searchControl}
              <span className="admin-count">
                {reviews.filter((review) => !review.published).length} awaiting review
              </span>
            </div>
            <div className="admin-review-list">
              {reviews
                .filter((review) =>
                  `${review.customer} ${review.product} ${review.message}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((review) => (
                  <article key={review.id}>
                    <div className="admin-review-avatar">{review.customer[0]}</div>
                    <div>
                      <div className="admin-review-meta">
                        <strong>{review.customer}</strong>
                        <Status>{review.published ? 'Published' : 'Pending review'}</Status>
                      </div>
                      <div
                        className="admin-review-stars"
                        aria-label={`${review.rating} out of five stars`}
                      >
                        {Array.from({ length: review.rating }, (_, index) => (
                          <Star size={13} fill="currentColor" key={index} />
                        ))}
                      </div>
                      <p>{review.message}</p>
                      <small>{review.product}</small>
                    </div>
                    <button
                      className="button button-outline admin-small-button"
                      onClick={() =>
                        setReviews((previous) =>
                          previous.map((item) =>
                            item.id === review.id ? { ...item, published: !item.published } : item,
                          ),
                        )
                      }
                    >
                      {review.published ? 'Unpublish' : 'Approve'}
                    </button>
                  </article>
                ))}
            </div>
          </section>
        </>
      );
    if (section === 'content')
      return (
        <>
          <div className="admin-callout">
            <FileText size={18} />
            <p>
              Editorial planning drafts are saved locally. Publishing to the storefront requires a
              connected content service.
            </p>
          </div>
          <section className="admin-panel">
            <div className="admin-toolbar">
              {searchControl}
              <button
                className="button button-primary admin-small-button"
                onClick={() =>
                  setEditingStory({
                    id: `story-${Date.now()}`,
                    title: '',
                    category: 'Coffee culture',
                    status: 'Draft',
                  })
                }
              >
                <Plus size={16} /> New story
              </button>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Story</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {stories
                    .filter((story) => story.title.toLowerCase().includes(query.toLowerCase()))
                    .map((story) => (
                      <tr key={story.id}>
                        <td>
                          <strong>{story.title}</strong>
                        </td>
                        <td>{story.category}</td>
                        <td>
                          <Status>{story.status}</Status>
                        </td>
                        <td>
                          <button
                            className="admin-icon"
                            aria-label={`Edit ${story.title}`}
                            onClick={() => setEditingStory({ ...story })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="admin-icon"
                            aria-label={`Delete ${story.title}`}
                            onClick={() =>
                              setStories((previous) =>
                                previous.filter((item) => item.id !== story.id),
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      );
    if (section === 'subscriptions')
      return (
        <section className="admin-panel">
          <div className="admin-toolbar">
            {searchControl}
            <span className="admin-count">{subscriptions.length} subscriptions</span>
          </div>
          {subscriptions.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Coffee</th>
                    <th>Frequency</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Local note</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions
                    .filter((subscription) =>
                      `${subscription.id} ${products.find((product) => product.id === subscription.productId)?.name}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((subscription) => (
                      <tr key={subscription.id}>
                        <td>#{subscription.id.slice(-8)}</td>
                        <td>
                          {products.find((product) => product.id === subscription.productId)
                            ?.name || 'Coffee plan'}
                        </td>
                        <td>{subscription.frequency}</td>
                        <td>{subscription.weight}</td>
                        <td>
                          <select
                            aria-label={`Subscription status for ${subscription.id}`}
                            value={subscription.status}
                            onChange={(event) =>
                              store.updateSubscription(
                                subscription.id,
                                event.target.value as typeof subscription.status,
                              )
                            }
                          >
                            <option>Active</option>
                            <option>Paused</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <select
                            aria-label={`Internal fulfillment note for ${subscription.id}`}
                            value={subscriptionStatuses[subscription.id] || 'Ready for review'}
                            onChange={(event) =>
                              setSubscriptionStatuses((previous) => ({
                                ...previous,
                                [subscription.id]: event.target.value,
                              }))
                            }
                          >
                            {['Ready for review', 'Packed this cycle', 'Customer contacted'].map(
                              (status) => (
                                <option key={status}>{status}</option>
                              ),
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Good coffee. On repeat."
              description="Plans created in the subscription demo will be listed here. No recurring charges are made."
            />
          )}
        </section>
      );
    if (section === 'settings')
      return (
        <div className="admin-settings-layout">
          <section className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <h2>Workspace preferences</h2>
                <p>
                  Local admin display settings. Storefront configuration remains in the source code.
                </p>
              </div>
            </div>
            <form
              className="admin-settings-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSettingsSaved(true);
                notify('Workspace preferences saved locally.');
              }}
            >
              <label>
                Workspace name
                <input
                  required
                  value={settings.name}
                  onChange={(event) => {
                    setSettings({ ...settings, name: event.target.value });
                    setSettingsSaved(false);
                  }}
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(event) => {
                    setSettings({ ...settings, email: event.target.value });
                    setSettingsSaved(false);
                  }}
                />
              </label>
              <label>
                Planned free shipping threshold (USD)
                <input
                  type="number"
                  min="0"
                  required
                  value={settings.freeShipping}
                  onChange={(event) => {
                    setSettings({ ...settings, freeShipping: Number(event.target.value) });
                    setSettingsSaved(false);
                  }}
                />
              </label>
              <label>
                Dispatch hours
                <input
                  required
                  value={settings.dispatch}
                  onChange={(event) => {
                    setSettings({ ...settings, dispatch: event.target.value });
                    setSettingsSaved(false);
                  }}
                />
              </label>
              <button className="button button-primary" type="submit">
                {settingsSaved ? (
                  <>
                    <Check size={16} /> Saved locally
                  </>
                ) : (
                  'Save preferences'
                )}
              </button>
            </form>
          </section>
          <aside className="admin-panel admin-settings-note">
            <Settings size={28} />
            <h3>A clear workspace.</h3>
            <p>
              This is a frontend demo. Products, orders, and preferences are stored in your browser,
              not a production database.
            </p>
            <p>
              Do not enter confidential customer or business information. A production service needs
              authentication, authorization, server validation, and a payment provider.
            </p>
            <Link to="/">
              Back to the storefront <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      );
    return null;
  }

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <button
          className="admin-sidebar-scrim"
          aria-label="Close admin navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin-brand">
          <span>
            <Coffee size={25} />
          </span>
          <strong>
            COFFEE SHOP<small>THE ROAST ROOM</small>
          </strong>
        </Link>
        <button
          className="admin-mobile-close admin-icon"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="admin-workspace">
          <span className="admin-workspace-dot" />
          <div>
            <strong>{settings.name}</strong>
            <small>Demo workspace · local data</small>
          </div>
        </div>
        <span className="admin-nav-label">MANAGE YOUR STORE</span>
        <nav aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link
              key={item.section}
              className={active.section === item.section ? 'is-active' : ''}
              to={`/admin${item.section ? `/${item.section}` : ''}`}
            >
              <item.icon size={18} />
              {item.label}
              {item.section === 'orders' && pendingOrders > 0 && <span>{pendingOrders}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <p>Made for better mornings.</p>
          <Link to="/">
            <ArrowLeft size={16} /> Back to storefront
          </Link>
          <span>Frontend demo · No real payments</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="admin-mobile-menu admin-icon"
              aria-label="Open admin navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>{active.label}</strong>
          </div>
          <div className="admin-topbar-actions">
            <Link to="/" className="admin-view-store">
              View store <ArrowRight size={14} />
            </Link>
            <div className="admin-notification-wrap">
              <button
                className="admin-icon"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((previous) => !previous)}
              >
                <Bell size={20} />
                {pendingOrders > 0 && <span className="admin-notification-dot" />}
              </button>
              {notificationsOpen && (
                <div className="admin-notification-popover">
                  <strong>You're in the loop.</strong>
                  <p>
                    {pendingOrders
                      ? `${pendingOrders} demo orders are awaiting completion.`
                      : 'No new order notifications.'}
                  </p>
                  <Link to="/admin/orders" onClick={() => setNotificationsOpen(false)}>
                    View orders <ArrowRight size={14} />
                  </Link>
                  <button
                    className="admin-icon"
                    aria-label="Close notifications"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
            <span className="admin-profile-avatar">CS</span>
          </div>
        </header>
        <main className="admin-content" id="main-content">
          <div className="admin-page-heading">
            <div>
              <span className="eyebrow">THE ROAST ROOM / {active.label.toUpperCase()}</span>
              <h1>{section === '' ? 'Good morning, coffee people.' : active.label}</h1>
              <p>
                {section === ''
                  ? "Here's what's brewing in your store today."
                  : `A little more care for your ${active.label.toLowerCase()}.`}
              </p>
            </div>
            {(section === '' || section === 'orders' || section === 'analytics') && (
              <button className="button button-outline admin-small-button" onClick={exportOrders}>
                <Download size={16} /> Export orders
              </button>
            )}
          </div>
          <div className="admin-demo-banner">
            <span /> Demo workspace · Changes are saved in this browser only. No production access
            or payment processing.
          </div>
          {renderSection()}
          <footer className="admin-footer">
            <span>COFFEE SHOP — thoughtfully brewed.</span>
            <Link to="/help">
              Store help <ArrowRight size={13} />
            </Link>
          </footer>
        </main>
      </div>
      {editingProduct && (
        <Modal
          title={isNewProduct ? 'A new coffee, a new story.' : `Edit ${editingProduct.name}`}
          onClose={() => setEditingProduct(null)}
        >
          <form className="admin-edit-form" onSubmit={saveProduct}>
            <div className="admin-product-editor">
              <div className="admin-upload-area">
                <img src={editingProduct.image} alt="Product image preview" />
                <label className="button button-outline admin-small-button">
                  <ImagePlus size={16} /> Upload image
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={(event) => uploadProductImage(event.target.files?.[0])}
                  />
                </label>
                <small>JPG, PNG, WebP or SVG · Max 1.5 MB</small>
              </div>
              <div className="admin-form-grid">
                <label>
                  Product name
                  <input
                    required
                    maxLength={80}
                    value={editingProduct.name}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  URL slug
                  <input
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="auto-generated-from-name"
                    value={editingProduct.slug}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, slug: event.target.value })
                    }
                  />
                </label>
                <label>
                  Origin
                  <input
                    required
                    value={editingProduct.origin}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, origin: event.target.value })
                    }
                  />
                </label>
                <label>
                  Roast
                  <select
                    value={editingProduct.roast}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        roast: event.target.value as Product['roast'],
                      })
                    }
                  >
                    <option>Light</option>
                    <option>Medium</option>
                    <option>Dark</option>
                  </select>
                </label>
                <label>
                  Price / 250g (USD)
                  <input
                    required
                    type="number"
                    min="0.5"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, price: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Altitude
                  <input
                    required
                    value={editingProduct.altitude}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, altitude: event.target.value })
                    }
                  />
                </label>
                <label className="admin-form-full">
                  Tasting notes (comma-separated)
                  <input
                    required
                    value={editingProduct.notes.join(', ')}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        notes: event.target.value.split(',').map((note) => note.trim()),
                      })
                    }
                  />
                </label>
                <label className="admin-form-full">
                  Description
                  <textarea
                    rows={3}
                    required
                    value={editingProduct.description}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, description: event.target.value })
                    }
                  />
                </label>
                <label>
                  Accent color
                  <input
                    type="color"
                    value={editingProduct.color}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, color: event.target.value })
                    }
                  />
                </label>
              </div>
            </div>
            {imageError && (
              <p className="admin-form-error" role="alert">
                {imageError}
              </p>
            )}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                <Check size={16} /> {isNewProduct ? 'Add product' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {couponForm && (
        <Modal title="Create a campaign draft" onClose={() => setCouponForm(false)}>
          <form
            className="admin-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              const code = String(values.get('code')).trim().toUpperCase();
              if (coupons.some((coupon) => coupon.code === code)) {
                notify('That code already exists.');
                return;
              }
              setCoupons((previous) => [
                ...previous,
                {
                  id: `coupon-${Date.now()}`,
                  code,
                  discount: Number(values.get('discount')),
                  active: true,
                },
              ]);
              setCouponForm(false);
              notify('Promotion draft saved locally.');
            }}
          >
            <label>
              Promotion code
              <input name="code" required pattern="[A-Za-z0-9_-]{3,24}" placeholder="MORNING15" />
            </label>
            <label>
              Percentage discount
              <input name="discount" type="number" min="1" max="100" required defaultValue="15" />
            </label>
            <p className="admin-form-help">
              Planning draft only. New codes do not automatically redeem at checkout.
            </p>
            <div className="admin-modal-actions">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setCouponForm(false)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Save draft
              </button>
            </div>
          </form>
        </Modal>
      )}
      {editingStory && (
        <Modal title="Edit editorial plan" onClose={() => setEditingStory(null)}>
          <form
            className="admin-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              setStories((previous) =>
                previous.some((story) => story.id === editingStory.id)
                  ? previous.map((story) => (story.id === editingStory.id ? editingStory : story))
                  : [...previous, editingStory],
              );
              setEditingStory(null);
              notify('Editorial plan saved locally.');
            }}
          >
            <label>
              Story title
              <input
                required
                value={editingStory.title}
                onChange={(event) =>
                  setEditingStory({ ...editingStory, title: event.target.value })
                }
              />
            </label>
            <label>
              Category
              <select
                value={editingStory.category}
                onChange={(event) =>
                  setEditingStory({ ...editingStory, category: event.target.value })
                }
              >
                {['Brew guides', 'Origins', 'Coffee culture', 'Roasting'].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={editingStory.status}
                onChange={(event) =>
                  setEditingStory({ ...editingStory, status: event.target.value })
                }
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </label>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setEditingStory(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Save story plan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
