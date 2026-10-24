import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Leaf, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Star, Trash2, Truck, X } from 'lucide-react';
import { calculateCartItemPrice, useStore } from '../store';
import { ProductCard, PageIntro, EmptyState, QuantityStepper } from '../components/ui';
import '../styles/commerce.css';

const weightMultiplier = (weight: string) => weight === '1kg' ? 3.5 : weight === '500g' ? 1.85 : 1;
const collectionInfo = [
  { slug: 'indonesian-coffee', name: 'Indonesian coffee', label: 'A thousand islands. Endless character.', text: 'Explore extraordinary coffees grown in the rich volcanic soil of the Indonesian archipelago.', color: '#d8a574' },
  { slug: 'arabica-selection', name: 'Arabica selection', label: 'The finer side of your everyday.', text: 'Beautifully balanced, naturally expressive, and selected for the moments you want to slow down.', color: '#c7c9ad' },
  { slug: 'dark-roast', name: 'Dark & distinctive', label: 'For the bold at heart.', text: 'Deep chocolate, toasted spice, and a beautifully lingering finish. Make your morning a little louder.', color: '#b67760' },
  { slug: 'light-medium-roast', name: 'Light & medium roast', label: 'Let the origin speak.', text: 'Bright fruit, delicate sweetness, and the individual character of every remarkable growing region.', color: '#e2c99e' },
  { slug: 'coffee-bundles', name: 'Better together', label: 'A whole new world in a box.', text: 'Meet your next favorite with curated combinations for curious coffee people.', color: '#c6b3b9' },
  { slug: 'limited-editions', name: 'Small-batch discoveries', label: 'Here for a good time.', text: 'Distinctive seasonal favorites and exceptional coffees worth making a little room for.', color: '#b8c6b5' },
];

function collectionMatch(slug: string, product: { roast: string; id: string; origin: string }) {
  if (slug === 'dark-roast') return product.roast === 'Dark';
  if (slug === 'light-medium-roast') return product.roast !== 'Dark';
  if (slug === 'limited-editions') return /bali|toraja/i.test(`${product.id} ${product.origin}`);
  if (slug === 'coffee-bundles') return true;
  return true;
}

function Catalog({ mode = 'shop', collectionSlug }: { mode?: 'shop' | 'search'; collectionSlug?: string }) {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [origin, setOrigin] = useState(params.get('origin') || '');
  const [roast, setRoast] = useState(params.get('roast') || '');
  const [method, setMethod] = useState('');
  const [maxPrice, setMaxPrice] = useState(60);
  const [flavor, setFlavor] = useState('');
  const [available, setAvailable] = useState(false);
  const [rating, setRating] = useState('');
  const queryParam = params.get('q') || '';
  useEffect(() => setQuery(queryParam), [queryParam]);
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const collection = collectionInfo.find(c => c.slug === collectionSlug);
  const origins = Array.from(new Set(products.map(p => p.origin)));
  const results = useMemo(() => {
    const list = products.filter(p => (!collectionSlug || collectionMatch(collectionSlug, p)) && (!query || `${p.name} ${p.origin} ${p.notes.join(' ')}`.toLowerCase().includes(query.toLowerCase())) && (!origin || p.origin === origin) && (!roast || p.roast === roast) && p.price <= maxPrice && (!flavor || p.notes.some(note => note.toLowerCase().includes(flavor))) && (!available || p.stock !== 0) && (!rating || p.rating >= Number(rating)) && (!method || (method === 'Espresso' ? p.roast !== 'Light' : method === 'Pour-over' ? p.roast !== 'Dark' : true)));
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, query, origin, roast, maxPrice, sort, method, collectionSlug, flavor, available, rating]);
  function resetFilters() { setOrigin(''); setRoast(''); setMethod(''); setFlavor(''); setAvailable(false); setRating(''); setMaxPrice(60); setQuery(''); setParams({}); }
  return <main id="main-content" className="page-shell commerce-catalog">
    <div className="commerce-breadcrumb"><Link to="/">Home</Link><ChevronRight size={12} />{collection ? <><Link to="/collections">Collections</Link><ChevronRight size={12} /><span>{collection.name}</span></> : <span>{mode === 'search' ? 'Search' : 'Shop all coffee'}</span>}</div>
    <PageIntro eyebrow={collection ? 'A collection worth exploring' : mode === 'search' ? 'Find your next favorite' : 'Good mornings start here'} title={collection?.name || (mode === 'search' ? 'Your coffee, discovered.' : 'A little extraordinary. Every day.')} description={collection?.text || 'From volcanic highlands to your favorite cup. Find a coffee that feels like you.'} />
    <div className="commerce-catalog-toolbar">
      <div className="commerce-catalog-tabs"><Link className={!collectionSlug ? 'active' : ''} to="/shop">All coffee</Link><Link to="/collections/arabica-selection">Single origins</Link><Link to="/bundles">Bundles</Link><Link to="/subscription">Subscriptions</Link></div>
      <button className="button button-outline commerce-mobile-filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
    </div>
    <div className="commerce-catalog-layout">
      <aside className={`commerce-filters ${filtersOpen ? 'is-open' : ''}`} aria-label="Product filters">
        <div className="commerce-filter-title"><strong>Refine your ritual</strong><button className="commerce-filter-close icon-button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={20} /></button></div>
        <label className="commerce-filter-group">Origin<select value={origin} onChange={e => setOrigin(e.target.value)}><option value="">All origins</option>{origins.map(o => <option key={o}>{o}</option>)}</select></label>
        <fieldset className="commerce-filter-group"><legend>Roast level</legend>{['Light', 'Medium', 'Dark'].map(level => <label className="commerce-check" key={level}><input type="checkbox" checked={roast === level} onChange={() => setRoast(roast === level ? '' : level)} /><span>{level} roast</span><span className={`commerce-roast-dot roast-${level.toLowerCase()}`} /></label>)}</fieldset>
        <label className="commerce-filter-group">Your brewing method<select value={method} onChange={e => setMethod(e.target.value)}><option value="">Any brewing method</option><option>Espresso</option><option>Pour-over</option><option>French press</option></select></label>
        <label className="commerce-filter-group">Price up to ${maxPrice}<input aria-label="Maximum price in USD" type="range" min="10" max="60" step="1" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} /><span className="commerce-range-label"><span>$10</span><span>$60</span></span></label>
        <label className="commerce-filter-group">Flavor profile<select value={flavor} onChange={e => setFlavor(e.target.value)}><option value="">All tasting notes</option><option value="chocolate">Chocolate</option><option value="caramel">Caramel</option><option value="cherry">Fruit</option><option value="honey">Honey</option><option value="almond">Nutty</option></select></label>
        <label className="commerce-filter-group">Customer rating<select value={rating} onChange={e => setRating(e.target.value)}><option value="">All ratings</option><option value="4.8">4.8 stars & above</option><option value="4.9">4.9 stars & above</option></select></label>
        <label className="commerce-check commerce-stock-filter"><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} /><span>Available coffees only</span></label>
        <button className="commerce-text-button" onClick={resetFilters}>Clear all filters</button>
        <button className="button button-primary commerce-filter-apply" onClick={() => setFiltersOpen(false)}>Show {results.length} coffees <ArrowRight size={16} /></button>
        <div className="commerce-filter-note"><Leaf size={25} /><strong>Great coffee. Good intentions.</strong><p>Thoughtfully selected origins. Roasted for the way you like to brew.</p></div>
      </aside>
      <div className="commerce-results">
        <div className="commerce-results-toolbar"><label className="commerce-inline-search"><Search size={18} /><input aria-label="Search coffee" placeholder="Search your coffee…" value={query} onChange={e => { setQuery(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}); }} /></label><label className="commerce-sort"><span>Sort by</span><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
        <p className="commerce-result-count">{results.length} {results.length === 1 ? 'coffee' : 'coffees'} to make your day</p>
        {results.length ? <div className="product-grid commerce-product-grid">{results.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="commerce-no-results"><Search size={42} /><h2>No beans found. Yet.</h2><p>Try a different search or give your filters a little breathing room.</p><button className="button button-primary" onClick={resetFilters}>Reset filters</button></div>}
        <div className="commerce-bottom-note"><Check size={16} /> You've explored every coffee in this collection.</div>
      </div>
    </div>
  </main>;
}

export function ShopPage() { return <Catalog />; }
export function SearchPage() { return <Catalog mode="search" />; }
export function CollectionPage() { const { slug } = useParams(); return <Catalog key={slug} collectionSlug={slug} />; }

export function CollectionsPage() {
  const { products } = useStore();
  return <main id="main-content" className="page-shell commerce-collections"><PageIntro eyebrow="Curated for curious coffee people" title="Find your kind of coffee." description="Different places. Different personalities. The same love for a remarkable cup." /><div className="commerce-collection-grid">{collectionInfo.map((collection, i) => <Link to={collection.slug === 'coffee-bundles' ? '/bundles' : `/collections/${collection.slug}`} key={collection.slug} className="commerce-collection-card" style={{ background: collection.color }}><span className="eyebrow">0{i + 1} / The collection</span><img src={products[i % products.length]?.image} alt={`${collection.name} coffee package`} loading="lazy" /><div><p>{collection.label}</p><h2>{collection.name}</h2></div><span className="commerce-collection-arrow"><ArrowRight /></span></Link>)}</div></main>;
}

export function ProductPage() {
  const { slug } = useParams();
  const { products, wishlist, toggleWishlist, addToCart, formatPrice } = useStore();
  const product = products.find(p => p.slug === slug);
  const [weight, setWeight] = useState('250g');
  const [grind, setGrind] = useState('Whole Bean');
  const [quantity, setQuantity] = useState(1);
  const [angle, setAngle] = useState(0);
  const navigate = useNavigate();
  useEffect(() => { setWeight('250g'); setGrind('Whole Bean'); setQuantity(1); setAngle(0); }, [slug]);
  if (!product) return <main id="main-content" className="page-shell"><EmptyState headingLevel={1} title="This coffee is taking a break." description="Discover another beautiful origin in our current collection." action="Explore the coffee" to="/shop" /></main>;
  function add(buy = false) { if (product?.stock === 0) return; addToCart(product!.id, weight, grind, quantity); if (buy) navigate('/checkout'); }
  const related = products.filter(p => p.id !== product.id).slice(0, 3);
  return <main id="main-content" className="page-shell commerce-product-detail">
    <div className="commerce-breadcrumb"><Link to="/">Home</Link><ChevronRight size={12} /><Link to="/shop">Coffee</Link><ChevronRight size={12} /><span>{product.name}</span></div>
    <div className="commerce-product-main">
      <div className="commerce-product-visual" style={{ '--product-color': product.color } as React.CSSProperties}>
        <span className="commerce-product-kicker">Single origin / Small batch</span><span className="commerce-product-orbit" />
        <img className={`commerce-product-bag angle-${angle}`} src={product.image} alt={`${product.name} original illustrated coffee packaging, view ${angle + 1}`} />
        <span className="commerce-product-caption">A little taste of {product.origin}.</span>
        <div className="commerce-gallery"><button aria-label="Previous product view" className="icon-button" onClick={() => setAngle((angle + 2) % 3)}><ChevronLeft size={18} /></button>{['Front', 'Detail', 'Side'].map((label, i) => <button key={label} className={angle === i ? 'active' : ''} onClick={() => setAngle(i)} aria-pressed={angle === i}>{label}</button>)}<button aria-label="Next product view" className="icon-button" onClick={() => setAngle((angle + 1) % 3)}><ChevronRight size={18} /></button></div>
      </div>
      <div className="commerce-product-information"><p className="eyebrow">{product.origin} • {product.roast} roast</p><h1>{product.name}</h1><div className="commerce-rating"><span aria-label={`${product.rating} out of 5 stars`}>★★★★★</span><b>{product.rating}</b><a href="#coffee-reviews">({product.reviews} reviews)</a></div><p className="commerce-product-description">{product.description}</p><div className="commerce-tasting-notes">{product.notes.map(note => <span key={note}>{note}</span>)}</div><div className="commerce-detail-price">{formatPrice(product.price * weightMultiplier(weight))}<span>/ {weight}</span><small><span /> {product.stock === 0 ? 'Currently sold out' : 'Freshly roasted & ready'}</small></div>
        <fieldset className="commerce-variant"><legend>01 / Choose your weight</legend><div>{['250g', '500g', '1kg'].map(size => <button className={weight === size ? 'selected' : ''} key={size} onClick={() => setWeight(size)} aria-pressed={weight === size}>{size}{size === '1kg' && <small>Best value</small>}</button>)}</div></fieldset>
        <label className="commerce-variant commerce-grind">02 / How do you brew?<select value={grind} onChange={e => setGrind(e.target.value)}>{['Whole Bean', 'Espresso', 'Filter', 'French Press'].map(g => <option key={g}>{g}</option>)}</select></label>
        <div className="commerce-add-row"><QuantityStepper value={quantity} onChange={setQuantity} /><button className="button button-primary" disabled={product.stock === 0} onClick={() => add()}><ShoppingBag size={18} /> Add to bag — {formatPrice(product.price * weightMultiplier(weight) * quantity)}</button><button className={`icon-button commerce-wish ${wishlist.includes(product.id) ? 'active' : ''}`} aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWishlist(product.id)}><Heart size={20} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button></div><button className="commerce-buy-now" disabled={product.stock === 0} onClick={() => add(true)}>Make this my next cup <ArrowRight size={16} /></button>
        <div className="commerce-product-promises"><span><Truck size={18} /> Free delivery on orders $50+</span><span><ShieldCheck size={18} /> Secure demo checkout</span><span><PackageCheck size={18} /> Sealed for fresh flavor</span></div>
      </div>
    </div>
    <section className="commerce-profile"><div><p className="eyebrow">Behind the bean</p><h2>A place. A process.<br />A whole lot of character.</h2><p>{product.origin}'s rich landscape gives this coffee its unmistakable personality. Our roast brings its natural sweetness into focus, without hiding what makes it special.</p><Link className="button button-outline" to="/origins">Explore the origin <ArrowRight size={16} /></Link></div><div className="commerce-profile-facts"><div><span>Origin</span><strong>{product.origin}, Indonesia</strong></div><div><span>Growing altitude</span><strong>{product.altitude}</strong></div><div><span>Roast profile</span><strong>{product.roast} roast</strong></div><div><span>Best enjoyed</span><strong>{product.roast === 'Dark' ? 'Espresso / French press' : 'Pour-over / Filter'}</strong></div><div className="commerce-roast-meter"><span>Roast intensity</span><div>{[1, 2, 3, 4, 5].map(n => <i key={n} className={n <= (product.roast === 'Dark' ? 5 : product.roast === 'Medium' ? 3 : 2) ? 'filled' : ''} />)}</div></div></div></section>
    <section className="commerce-brew"><div><p className="eyebrow">Your daily ritual, refined</p><h2>Make a really good cup.</h2></div>{[['01', 'Start fresh', 'Grind 18g of coffee just before brewing. A medium grind is a great place to begin.'], ['02', 'Find your balance', 'Add 300ml of filtered water at 92–96°C. Let your coffee bloom for 30 seconds.'], ['03', 'Take your time', 'Brew for 3–4 minutes. Taste, adjust, and find the little ritual that feels like you.']].map(([n, title, text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</section>
    <section id="coffee-reviews" className="commerce-reviews"><div><p className="eyebrow">The coffee crowd</p><h2>Good words. Great coffee.</h2><span className="commerce-review-total">{product.rating}<Star fill="currentColor" /><small>from {product.reviews} sample reviews</small></span></div><div>{[['Maya R.', 'My morning, upgraded.', 'Beautifully balanced and full of character. This is the cup I look forward to before I even get out of bed.'], ['Alex T.', 'Found my everyday favorite.', 'The tasting notes really come through. Lovely as a slow Sunday pour-over and just as good on busy mornings.']].map(([name, title, text]) => <article key={name}><span className="commerce-stars">★★★★★</span><h3>{title}</h3><p>{text}</p><small>{name} · Illustrative review</small></article>)}</div></section>
    <section className="commerce-related"><div className="section-heading"><div><p className="eyebrow">Keep exploring</p><h2>Your next coffee crush.</h2></div><Link to="/shop">Shop all coffee <ArrowRight size={16} /></Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p} />)}</div></section>
  </main>;
}

export function WishlistPage() {
  const { products, wishlist } = useStore();
  return <main id="main-content" className="page-shell"><PageIntro eyebrow="Saved for a slower moment" title="Your coffee crushes." description="The ones you keep coming back to. Ready whenever you are." />{wishlist.length ? <div className="product-grid commerce-wishlist-grid">{products.filter(p => wishlist.includes(p.id)).map(p => <ProductCard key={p.id} product={p} />)}</div> : <EmptyState title="A little space for your favorites." description="Tap the heart on any coffee to save it here for later." action="Find your favorites" to="/shop" />}</main>;
}

export function BundlesPage() {
  const { products, addToCart, formatPrice, notify } = useStore();
  const bundles = [{ title: 'The island explorer', description: 'Three origins. A beautiful introduction to the extraordinary coffees of Indonesia.', ids: [0, 1, 2], color: '#d6c8b0', tag: 'The discovery edit' }, { title: 'The bold morning duo', description: 'Rich, chocolatey favorites for espresso lovers and wonderfully unhurried breakfasts.', ids: [1, 5], color: '#b9c4af', tag: 'The everyday ritual' }, { title: 'The slow Sunday set', description: 'Bright, expressive coffees to pair with your favorite record and absolutely no plans.', ids: [2, 3], color: '#d5b6ae', tag: 'The weekend edit' }];
  return <main id="main-content" className="page-shell"><PageIntro eyebrow="Some things are better together" title="More beans. More possibilities." description="Thoughtful pairings for your kitchen shelf, your next discovery, or someone who deserves a better morning." /><div className="commerce-bundles">{bundles.map(bundle => { const coffees = bundle.ids.map(i => products[i]).filter(Boolean); const price = coffees.reduce((s, p) => s + p.price, 0); return <article key={bundle.title} className="commerce-bundle"><div className="commerce-bundle-art" style={{ background: bundle.color }}>{coffees.map((p, i) => <img key={p.id} src={p.image} alt={p.name} style={{ transform: `rotate(${(i - (coffees.length - 1) / 2) * 13}deg)` }} />)}<span>{coffees.length} origins / 250g each</span></div><div className="commerce-bundle-info"><p className="eyebrow">{bundle.tag}</p><h2>{bundle.title}</h2><p>{bundle.description}</p><ul>{coffees.map(p => <li key={p.id}><Check size={14} />{p.name}</li>)}</ul><button className="button button-primary" onClick={() => { coffees.forEach(p => addToCart(p.id, '250g', 'Whole Bean', 1)); notify(`${bundle.title} added to your bag`); }}>Add the set — {formatPrice(price)} <Plus size={18} /></button></div></article>; })}</div></main>;
}

function readPromo() { try { return sessionStorage.getItem('coffee-promo') || ''; } catch { return ''; } }

export function CartPage() {
  const { cart, products, updateQuantity, removeFromCart, cartTotal, cartCount, formatPrice, toggleWishlist, wishlist, notify } = useStore();
  const [coupon, setCoupon] = useState(readPromo());
  const [applied, setApplied] = useState(readPromo() === 'COFFEE10');
  const [couponError, setCouponError] = useState('');
  const discount = applied ? cartTotal * .1 : 0;
  const shipping = cartTotal >= 50 ? 0 : 5;
  function applyCoupon(e: FormEvent) { e.preventDefault(); if (coupon.trim().toUpperCase() === 'COFFEE10') { setApplied(true); setCouponError(''); try { sessionStorage.setItem('coffee-promo', 'COFFEE10'); } catch { /* storage optional */ } notify('A little treat: 10% off applied'); } else { setCouponError('That code is not valid. Try COFFEE10.'); setApplied(false); try { sessionStorage.removeItem('coffee-promo'); } catch { /* storage optional */ } } }
  return <main id="main-content" className="page-shell commerce-cart"><PageIntro eyebrow="Good things in the bag" title="Your next great morning." description={cartCount ? `${cartCount} ${cartCount === 1 ? 'little reason' : 'little reasons'} to get out of bed.` : 'Every great ritual starts with a little discovery.'} />{!cart.length ? <EmptyState title="Your bag is brewing with possibility." description="Find your favorite origin, and we’ll take it from here." action="Explore the coffee" to="/shop" /> : <div className="commerce-cart-layout"><div><div className="commerce-free-shipping"><Truck size={22} /><div><strong>{cartTotal >= 50 ? 'Your coffee travels free.' : `${formatPrice(50 - cartTotal)} away from free delivery.`}</strong><div className="commerce-shipping-progress"><span style={{ width: `${Math.min(cartTotal / 50 * 100, 100)}%` }} /></div></div></div><div className="commerce-cart-items">{cart.map(item => { const p = products.find(product => product.id === item.productId); if (!p) return null; return <article className="commerce-cart-item" key={item.key}><Link to={`/product/${p.slug}`} className="commerce-cart-image" style={{ background: `${p.color}28` }}><img src={p.image} alt={p.name} /></Link><div className="commerce-cart-item-info"><p className="eyebrow">{p.origin}</p><Link to={`/product/${p.slug}`}><h2>{p.name}</h2></Link><p>{item.weight} / {item.grind}{item.subscription ? ` / ${item.subscription}` : ''}</p><button className="commerce-text-button" onClick={() => { if (!wishlist.includes(p.id)) toggleWishlist(p.id); removeFromCart(item.key); }}>Save for later</button></div><div className="commerce-cart-item-controls"><strong>{formatPrice(calculateCartItemPrice(p, item) * item.quantity)}</strong><QuantityStepper value={item.quantity} onChange={q => updateQuantity(item.key, q)} /><button className="commerce-remove" aria-label={`Remove ${p.name}`} onClick={() => removeFromCart(item.key)}><Trash2 size={15} /> Remove</button></div></article>; })}</div><Link className="commerce-back-link" to="/shop"><ChevronLeft size={16} /> Keep exploring</Link></div><aside className="commerce-summary"><p className="eyebrow">Almost coffee time</p><h2>Your order summary</h2><dl><div><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div><div><dt>Delivery</dt><dd>{shipping === 0 ? 'On us' : formatPrice(shipping)}</dd></div>{applied && <div className="commerce-discount"><dt>COFFEE10 — 10% off</dt><dd>−{formatPrice(discount)}</dd></div>}</dl><form className="commerce-coupon" onSubmit={applyCoupon}><label htmlFor="coupon">A little something extra?</label><div><input id="coupon" placeholder="Promo code" value={coupon} onChange={e => setCoupon(e.target.value)} /><button type="submit">Apply</button></div>{couponError && <small role="alert">{couponError}</small>}{applied && <span className="commerce-coupon-success"><Check size={13} /> Your 10% treat is applied.</span>}</form><div className="commerce-summary-total"><span>Total</span><strong>{formatPrice(cartTotal - discount + shipping)}</strong></div><p className="commerce-tax-note">Final demo total. No payment will be taken.</p><Link className="button button-primary" to="/checkout">Checkout <ArrowRight size={18} /></Link><p className="commerce-summary-security"><ShieldCheck size={15} /> A safe, simple demo checkout</p></aside></div>}<section className="commerce-cart-recommendations"><div className="section-heading"><div><p className="eyebrow">Room for one more?</p><h2>Make it a little more interesting.</h2></div></div><div className="product-grid">{products.filter(p => !cart.some(i => i.productId === p.id)).slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}</div></section></main>;
}

export function CheckoutPage() {
  const { cart, products, user, cartTotal, formatPrice, placeOrder } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState('standard');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', address: '', city: '', postalCode: '', country: 'Uzbekistan' });
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const discount = readPromo() === 'COFFEE10' ? cartTotal * .1 : 0;
  const shipping = delivery === 'express' ? 12 : cartTotal >= 50 ? 0 : 5;
  const total = cartTotal - discount + shipping;
  function next(e: FormEvent) { e.preventDefault(); setError(''); if (step < 3) setStep(step + 1); else { if (!accepted) { setError('Please acknowledge that this is a demo order.'); return; } setPlacing(true); try { const order = placeOrder({ customer: contact, deliveryMethod: delivery, notes, promoCode: discount ? 'COFFEE10' : undefined, discount, shipping }); navigate(`/order-success?order=${order.id}`, { replace: true }); } catch { setError('We couldn’t save your demo order. Your bag is still here. Please try again.'); setPlacing(false); } } }
  if (!cart.length) return <main id="main-content" className="page-shell"><EmptyState headingLevel={1} title="Your next great cup is waiting." description="Add a coffee to your bag before continuing to checkout." action="Explore coffee" to="/shop" /></main>;
  return <main id="main-content" className="page-shell commerce-checkout"><Link className="commerce-back-link" to="/cart"><ChevronLeft size={16} /> Back to your bag</Link><PageIntro eyebrow="Make mornings a little better" title="The last little step." /><div className="commerce-checkout-steps">{['Your details', 'Delivery', 'Review & confirm'].map((label, i) => <button key={label} className={step === i + 1 ? 'active' : step > i + 1 ? 'complete' : ''} disabled={i + 1 > step} onClick={() => setStep(i + 1)}><span>{step > i + 1 ? <Check size={15} /> : `0${i + 1}`}</span>{label}</button>)}</div><div className="commerce-checkout-layout"><form className="commerce-checkout-form" onSubmit={next}><div className="commerce-demo-note"><ShieldCheck size={22} /><p><strong>A little note before you order.</strong>This is an interactive storefront demo. No payment is collected and no coffee is shipped. Use sample contact information.</p></div>{error && <div className="commerce-form-error" role="alert">{error}</div>}
    {step === 1 && <><h2>Where should the good mornings go?</h2><p className="muted">No account needed. Just the essentials.</p><div className="commerce-form-grid"><label className="commerce-field commerce-full">Full name<input required autoComplete="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Alex Morgan" minLength={2} /></label><label className="commerce-field commerce-full">Email address<input required type="email" autoComplete="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="alex@example.com" /></label><label className="commerce-field commerce-full">Street address<input required autoComplete="street-address" value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} placeholder="Street name, building, apartment" minLength={4} /></label><label className="commerce-field">City<input required autoComplete="address-level2" value={contact.city} onChange={e => setContact({ ...contact, city: e.target.value })} placeholder="Tashkent" /></label><label className="commerce-field">Postal code<input required autoComplete="postal-code" value={contact.postalCode} onChange={e => setContact({ ...contact, postalCode: e.target.value })} placeholder="100000" /></label><label className="commerce-field commerce-full">Country<select value={contact.country} onChange={e => setContact({ ...contact, country: e.target.value })}>{['Uzbekistan', 'United States', 'United Kingdom', 'Indonesia', 'Germany', 'France', 'Other'].map(country => <option key={country}>{country}</option>)}</select></label></div></>}
    {step === 2 && <><h2>A delivery to look forward to.</h2><p className="muted">Choose the pace of your next great coffee.</p><div className="commerce-delivery-options">{[{ id: 'standard', title: 'The easy-going option', text: 'Standard delivery · 3–5 business days', price: cartTotal >= 50 ? 'Free' : formatPrice(5) }, { id: 'express', title: 'Can’t wait for coffee', text: 'Express delivery · 1–2 business days', price: formatPrice(12) }].map(option => <label className={delivery === option.id ? 'selected' : ''} key={option.id}><input type="radio" name="delivery" value={option.id} checked={delivery === option.id} onChange={() => setDelivery(option.id)} /><span><strong>{option.title}</strong><small>{option.text}</small></span><b>{option.price}</b></label>)}</div><label className="commerce-field">Anything we should know?<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional delivery notes" rows={3} maxLength={500} /></label></>}
    {step === 3 && <><h2>All set for something good.</h2><p className="muted">Take one last look. Your coffee deserves a good start.</p><div className="commerce-review-address"><div><p className="eyebrow">Contact & address</p><strong>{contact.name}</strong><p>{contact.email}<br />{contact.address}<br />{contact.city}, {contact.postalCode}<br />{contact.country}</p></div><button type="button" className="commerce-text-button" onClick={() => setStep(1)}>Edit details</button></div><div className="commerce-review-address"><div><p className="eyebrow">Delivery</p><strong>{delivery === 'express' ? 'Express · 1–2 business days' : 'Standard · 3–5 business days'}</strong>{notes && <p>{notes}</p>}</div><button type="button" className="commerce-text-button" onClick={() => setStep(2)}>Change</button></div><div className="commerce-payment-demo"><ShieldCheck size={26} /><div><h3>Demo payment</h3><p>No card details required. Confirming creates a sample order stored in this browser only.</p></div></div><label className="commerce-check commerce-demo-consent"><input type="checkbox" required checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>I understand this is a demo order with no actual payment or delivery.</span></label></>}
    <div className="commerce-checkout-actions">{step > 1 && <button type="button" className="button button-outline" onClick={() => setStep(step - 1)}><ChevronLeft size={16} /> Back</button>}<button type="submit" className="button button-primary" disabled={placing}>{placing ? 'Creating your order…' : step === 3 ? `Place demo order — ${formatPrice(total)}` : step === 1 ? 'Continue to delivery' : 'Review your order'}<ArrowRight size={17} /></button></div>
  </form><aside className="commerce-summary commerce-checkout-summary"><p className="eyebrow">A bag full of good things</p><h2>Your coffee</h2><div className="commerce-checkout-items">{cart.map(item => { const p = products.find(p => p.id === item.productId); return p ? <div key={item.key}><span className="commerce-checkout-thumb"><img src={p.image} alt={p.name} /><b>{item.quantity}</b></span><div><strong>{p.name}</strong><small>{item.weight} · {item.grind}</small></div><span>{formatPrice(calculateCartItemPrice(p, item) * item.quantity)}</span></div> : null; })}</div><dl><div><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div><div><dt>Delivery</dt><dd>{shipping ? formatPrice(shipping) : 'On us'}</dd></div>{discount > 0 && <div className="commerce-discount"><dt>COFFEE10</dt><dd>−{formatPrice(discount)}</dd></div>}</dl><div className="commerce-summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><p className="commerce-tax-note">Sample total · no payment collected</p></aside></div></main>;
}

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const { orders, formatPrice } = useStore();
  const order = params.get('order') ? orders.find(o => o.id === params.get('order')) : orders[0];
  if (!order) return <main id="main-content" className="page-shell"><EmptyState headingLevel={1} title="Every good cup starts somewhere." description="Your order confirmation will appear here after checkout." action="Find your coffee" to="/shop" /></main>;
  return <main id="main-content" className="page-shell commerce-order-success"><div className="commerce-order-success-icon"><Check size={44} /></div><p className="eyebrow">Good things are brewing</p><h1>Your morning<br />just got better.</h1><p>Thanks for exploring COFFEE SHOP, {order.customer.name.split(' ')[0]}.<br />Your demo order has been saved in this browser.</p><div className="commerce-success-details"><div><span>Order number</span><strong>{order.id}</strong></div><div><span>Order total</span><strong>{formatPrice(order.total)}</strong></div><div><span>Status</span><strong>{order.status}</strong></div></div><div className="commerce-success-actions"><Link to={`/account/orders/${order.id}`} className="button button-primary">View your order <ArrowRight size={17} /></Link><Link to="/shop" className="button button-outline">Keep discovering</Link></div><p className="commerce-success-note"><ShieldCheck size={15} /> Demo only. No payment was charged and no parcel will be sent.</p></main>;
}
