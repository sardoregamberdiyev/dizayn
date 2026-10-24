import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useStore, calculateCartItemPrice } from '../store';
import { QuantityStepper } from './ui';

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className={`brand ${small ? 'brand-small' : ''}`} aria-label="Coffee Shop home">
      <span className="brand-top">C O F F E E S H O P</span>
      <span className="brand-cup">
        <span>EST.</span>
        <Coffee size={37} strokeWidth={1.2} />
        <span>2024</span>
      </span>
      <span className="brand-bottom">GOOD COFFEE. GOOD DAYS.</span>
    </Link>
  );
}

function Overlay({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = ref.current?.querySelectorAll<HTMLElement>(
          'a,button,input,select,textarea,[tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', listener);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="overlay-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`drawer ${wide ? 'drawer-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="drawer-top">
          <span className="eyebrow">{title}</span>
          <button className="icon-button" onClick={onClose} aria-label={`Close ${title}`}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const [panel, setPanel] = useState<'menu' | 'search' | 'cart' | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(false);
  const {
    products,
    cart,
    cartCount,
    cartTotal,
    wishlist,
    user,
    formatPrice,
    updateQuantity,
    removeFromCart,
    currency,
    setCurrency,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setPanel(null);
    setAccountOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const closePanel = useRef(() => setPanel(null)).current;
  return (
    <>
      <header className={`site-header ${compact ? 'header-compact' : ''}`}>
        <div className="header-left">
          <button className="menu-pill" onClick={() => setPanel('menu')} aria-label="Open menu">
            <span>Menu</span>
            <i>
              <Menu size={18} />
            </i>
          </button>
          <button className="header-search" onClick={() => setPanel('search')}>
            <span>Find your daily ritual...</span>
            <i>
              <Search size={20} />
            </i>
          </button>
        </div>
        <Brand />
        <div className="header-right">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as 'USD' | 'UZS')}
            className="currency-select"
          >
            <option>USD</option>
            <option>UZS</option>
          </select>
          <div className="account-container">
            <button
              className="account-button"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <span className="avatar">
                <UserRound size={20} />
              </span>
              <span className="account-name">
                {user?.name.split(' ')[0] || 'Hello, coffee lover'}
              </span>
              <ChevronDown size={14} />
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                <Link to={user ? '/account' : '/account/auth'}>
                  {user ? 'My account' : 'Sign in / Register'}
                </Link>
                <Link to="/account/orders">Your orders</Link>
                <Link to="/subscription">Coffee subscription</Link>
              </div>
            )}
          </div>
          <Link
            className="icon-button header-heart"
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
          >
            <Heart size={21} />
            {wishlist.length > 0 && <span className="count-dot">{wishlist.length}</span>}
          </Link>
          <button
            className="icon-button bag-button"
            onClick={() => setPanel('cart')}
            aria-label={`Open shopping bag, ${cartCount} items`}
          >
            <ShoppingBag size={21} />
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>
      {panel === 'menu' && (
        <Overlay title="Explore Coffee Shop" onClose={closePanel} wide>
          <nav className="mega-menu">
            {[
              ['01', 'The coffee', '/shop'],
              ['02', 'Our collections', '/collections'],
              ['03', 'Meet the origins', '/origins'],
              ['04', 'The journal', '/journal'],
              ['05', 'Our story', '/about'],
              ['06', 'Your daily ritual', '/subscription'],
            ].map(([number, label, to]) => (
              <NavLink key={to} to={to}>
                <span>{number}</span>
                {label}
                <ArrowRight />
              </NavLink>
            ))}
          </nav>
          <div className="menu-bottom">
            <Link to="/bundles">Bundles & gifts</Link>
            <Link to="/contact">Say hello</Link>
            <Link to="/help">Help & shipping</Link>
            <Link to="/admin">Demo admin</Link>
          </div>
          <p className="menu-tagline">Life happens. Coffee helps.</p>
        </Overlay>
      )}
      {panel === 'search' && (
        <Overlay title="Find your next favorite" onClose={closePanel} wide>
          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search />
            <input
              aria-label="Search coffee"
              autoFocus
              placeholder="Try Sumatra, chocolate, or dark roast"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="circle-button" aria-label="Submit search">
              <ArrowRight />
            </button>
          </form>
          <span className="eyebrow search-label">
            {query ? 'Coffee that matches your mood' : 'A few crowd favorites'}
          </span>
          <div className="search-suggestions">
            {products
              .filter((product) =>
                `${product.name} ${product.origin} ${product.notes.join(' ')}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .slice(0, 4)
              .map((product) => (
                <Link to={`/product/${product.slug}`} key={product.id}>
                  <img src={product.image} alt="" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.notes.join(' · ')}</p>
                  </div>
                  <span>{formatPrice(product.price)}</span>
                  <ArrowRight size={18} />
                </Link>
              ))}
          </div>
          {query &&
            !products.some((product) =>
              `${product.name} ${product.origin} ${product.notes.join(' ')}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            ) && <p className="muted">No beans found. Try a different origin or tasting note.</p>}
          <div className="search-tags">
            <Link to="/collections/dark-roast">Dark roast ↗</Link>
            <Link to="/bundles">Bundles ↗</Link>
            <Link to="/shop?origin=Bali">Bali favorites ↗</Link>
          </div>
        </Overlay>
      )}
      {panel === 'cart' && (
        <Overlay title={`Your bag (${cartCount})`} onClose={closePanel}>
          <div className="mini-cart">
            {!cart.length ? (
              <div className="mini-empty">
                <Coffee size={48} />
                <h2>
                  A little empty.
                  <br />A lot of possibility.
                </h2>
                <p>Your next great morning starts here.</p>
                <Link className="button button-primary" to="/shop">
                  Find your coffee
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                <p className="shipping-message">
                  {cartTotal >= 50
                    ? 'Nice! Your order ships free.'
                    : `${formatPrice(50 - cartTotal)} away from free shipping`}
                </p>
                <div className="shipping-progress">
                  <span style={{ width: `${Math.min((cartTotal / 50) * 100, 100)}%` }} />
                </div>
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <article className="mini-cart-item" key={item.key}>
                      <Link to={`/product/${product.slug}`}>
                        <img src={product.image} alt={product.name} />
                      </Link>
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {item.weight} · {item.grind}
                        </p>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.key, value)}
                        />
                      </div>
                      <div className="mini-price">
                        <span>
                          {formatPrice(calculateCartItemPrice(product, item) * item.quantity)}
                        </span>
                        <button onClick={() => removeFromCart(item.key)}>Remove</button>
                      </div>
                    </article>
                  );
                })}
                <div className="mini-cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <p>Shipping and discounts calculated at checkout.</p>
                  <Link className="button button-primary" to="/checkout">
                    Checkout
                    <ArrowRight size={17} />
                  </Link>
                  <Link className="text-link" to="/cart">
                    View your bag
                  </Link>
                </div>
              </>
            )}
          </div>
        </Overlay>
      )}
    </>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="site-footer">
      <div className="newsletter">
        <div>
          <span className="eyebrow">GOOD NEWS. GREAT COFFEE.</span>
          <h2>
            LET’S KEEP
            <br />
            <em>IN TOUCH.</em>
          </h2>
        </div>
        <div>
          <p>
            A fresh pour of stories, new releases, and a little inspiration. Straight to your inbox.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (email) setSubscribed(true);
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              placeholder="Your email address"
              onChange={(event) => {
                setEmail(event.target.value);
                setSubscribed(false);
              }}
            />
            <button className="circle-button" aria-label="Subscribe to newsletter">
              {subscribed ? <Check /> : <ArrowRight />}
            </button>
          </form>
          <p className="newsletter-status" role="status">
            {subscribed
              ? 'You’re on the local demo list. Here’s to better mornings.'
              : 'No spam. Just good taste.'}
          </p>
        </div>
      </div>
      <div className="footer-main">
        <div>
          <Brand small />
          <p>
            Thoughtfully sourced.
            <br />
            Joyfully roasted. Always shared.
          </p>
        </div>
        <div>
          <h3>THE GOOD STUFF</h3>
          <Link to="/shop">Shop all coffee</Link>
          <Link to="/collections">Our collections</Link>
          <Link to="/bundles">Bundles & gifts</Link>
          <Link to="/subscription">Subscribe & save</Link>
        </div>
        <div>
          <h3>TAKE A LOOK AROUND</h3>
          <Link to="/about">Our story</Link>
          <Link to="/origins">Coffee origins</Link>
          <Link to="/journal">The journal</Link>
          <Link to="/contact">Say hello</Link>
        </div>
        <div>
          <h3>HERE TO HELP</h3>
          <Link to="/help">Shipping & returns</Link>
          <Link to="/help?category=brewing">Brewing & storage</Link>
          <Link to="/account/orders">Track an order</Link>
          <Link to="/admin">Demo admin</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} COFFEE SHOP. Made for good mornings.</span>
        <span>Frontend concept · Demo checkout</span>
        <Link to="/help">Privacy & terms</Link>
      </div>
    </footer>
  );
}

export function Toast() {
  const { notification } = useStore();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast ${notification ? 'toast-visible' : ''}`}
    >
      <span className="toast-check">
        <Check size={16} />
      </span>
      {notification}
    </div>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
