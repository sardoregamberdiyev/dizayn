import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Product } from '../data';
import { useStore } from '../store';

export function PageIntro({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}

export function EmptyState({ title, description, action = 'Explore our coffee', to = '/shop', headingLevel = 2 }: { title: string; description?: string; action?: string; to?: string; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return <div className="empty-state"><span className="empty-icon"><ShoppingBag size={34}/></span><Heading>{title}</Heading>{description && <p>{description}</p>}<Link className="button button-primary" to={to}>{action}<ArrowRight size={16}/></Link></div>;
}

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}><Minus size={15}/></button><span aria-live="polite">{value}</span><button type="button" aria-label="Increase quantity" disabled={value >= 99} onClick={() => onChange(Math.min(99, value + 1))}><Plus size={15}/></button></div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart, formatPrice } = useStore();
  return <article className="product-card"><div className="product-card-art" style={{ backgroundColor: product.color }}><Link to={`/product/${product.slug}`} aria-label={`Discover ${product.name}`}><img src={product.image} alt={`${product.name} specialty coffee bag`} loading="lazy"/></Link><span className="product-origin">{product.origin}</span><button className={`icon-button product-heart ${wishlist.includes(product.id) ? 'is-saved' : ''}`} aria-label={`${wishlist.includes(product.id) ? 'Remove' : 'Save'} ${product.name} ${wishlist.includes(product.id) ? 'from' : 'to'} wishlist`} aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product.id)}><Heart size={19} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'}/></button><span className="product-roast">{product.roast} roast</span></div><div className="product-card-info"><div><span className="tiny-label">SINGLE ORIGIN · 250G</span><h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3><p>{product.notes.join(' · ')}</p></div><div className="product-card-bottom"><span className="product-price">{formatPrice(product.price)}</span><span className="product-rating"><Star size={12} fill="currentColor"/>{product.rating}</span><button className="quick-add" aria-label={`Add ${product.name} to cart`} onClick={() => addToCart(product.id)}><Plus size={18}/><span>Add</span></button></div></div></article>;
}
