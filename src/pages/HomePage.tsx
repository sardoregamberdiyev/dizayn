import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Globe2,
  Leaf,
  PackageCheck,
  Quote,
  Star,
} from 'lucide-react';
import { useStore } from '../store';
import { ProductCard } from '../components/ui';
import { articles } from '../data';

const slides = [
  {
    name: 'Sumatra Arabica',
    label: 'BOLD ORIGINS. BEAUTIFUL MORNINGS.',
    slug: 'sumatra-arabica',
    main: '/images/sumatra-hero.webp',
    secondary: '/images/java-hero.webp',
    className: 'sumatra-slide',
    note: 'DARK CHOCOLATE · CEDAR · BROWN SUGAR',
  },
  {
    name: 'Java Arabica',
    label: 'A LITTLE ADVENTURE IN EVERY CUP.',
    slug: 'java-arabica',
    main: '/images/java-hero.webp',
    secondary: '/images/bali-bag.svg',
    className: 'java-slide',
    note: 'CACAO · ORANGE PEEL · ROASTED ALMOND',
  },
  {
    name: 'The Signature Pair',
    label: 'GOOD THINGS COME IN PAIRS.',
    slug: 'signature-house-blend',
    main: '/images/signature-bag.svg',
    secondary: '/images/espresso-bag.svg',
    className: 'signature-slide',
    note: 'YOUR NEW FAVORITE DAILY RITUAL',
  },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [flavor, setFlavor] = useState('Chocolatey');
  const [touchX, setTouchX] = useState(0);
  const { products } = useStore();
  const current = slides[slide];
  const flavorProduct =
    products.find(
      (product) =>
        product.id ===
        {
          Chocolatey: 'sumatra-arabica',
          Fruity: 'bali-kintamani',
          Nutty: 'java-arabica',
          Balanced: 'signature-house-blend',
        }[flavor],
    ) || products[0];
  return (
    <main id="main-content" className="home-page">
      <section
        className={`hero ${current.className}`}
        aria-label="Featured coffee collection"
        onTouchStart={(event) => setTouchX(event.touches[0].clientX)}
        onTouchEnd={(event) => {
          const distance = event.changedTouches[0].clientX - touchX;
          if (Math.abs(distance) > 60) setSlide((slide + (distance < 0 ? 1 : 2)) % 3);
        }}
      >
        <div className="hero-pattern" aria-hidden="true">
          <Coffee />
          <Coffee />
          <Coffee />
          <Coffee />
          <Coffee />
          <Coffee />
          <Coffee />
          <Coffee />
        </div>
        <div className="hero-ring hero-ring-one" />
        <div className="hero-ring hero-ring-two" />
        <div className="hero-notch" />
        <div className="hero-social">
          <div className="hero-social-top">
            <strong>+38K</strong>
            <span>
              Enjoy coffee
              <br />
              with us.
            </span>
          </div>
          <p>
            For the early birds,
            <br />
            the dreamers, and everyone
            <br />
            who loves a good cup.
          </p>
          <div className="coffee-people" aria-label="Our community">
            <span>AL</span>
            <span>MK</span>
            <span>JD</span>
            <Link to="/about" aria-label="Meet our coffee community">
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <img
          key={`${slide}-secondary`}
          className="hero-bag hero-bag-secondary"
          src={current.secondary}
          alt={
            slide === 0
              ? 'Java Arabica original illustrated coffee packaging'
              : 'Companion single origin coffee bag'
          }
        />
        <div className="hero-title" aria-label="Coffee Bean">
          <span>Coffee</span>
          <span>Bean</span>
        </div>
        <img
          key={`${slide}-main`}
          className="hero-bag hero-bag-main"
          src={current.main}
          alt={`${current.name} original illustrated coffee packaging`}
        />
        <Link className="promo-sticker" to="/bundles">
          <span>TWICE THE JOY</span>
          <strong>
            Better
            <br />
            together.
          </strong>
          <ArrowUpRight size={22} />
        </Link>
        <div className="hero-discover">
          <span className="tiny-label">{current.label}</span>
          <Link to={`/product/${current.slug}`}>
            Find your
            <br />
            daily ritual.
            <ArrowUpRight size={24} />
          </Link>
          <span className="hero-discover-line" />
          <span className="hero-origin-label">
            {current.name}
            <br />
            <small>{current.note}</small>
          </span>
        </div>
        <div className="hero-bottom">
          <Link className="hero-shop-link" to="/shop">
            Shop the coffee
            <ArrowRight size={18} />
          </Link>
          <div className="hero-slider">
            <span className="slide-number">
              0{slide + 1}
              <small>/ 03</small>
            </span>
            <div className="slide-progress">
              {slides.map((s, index) => (
                <button
                  aria-label={`Show ${s.name}`}
                  aria-current={index === slide ? 'true' : undefined}
                  className={index === slide ? 'active' : ''}
                  key={s.slug}
                  onClick={() => setSlide(index)}
                />
              ))}
            </div>
            <button aria-label="Previous featured coffee" onClick={() => setSlide((slide + 2) % 3)}>
              <ChevronLeft size={17} />
            </button>
            <button aria-label="Next featured coffee" onClick={() => setSlide((slide + 1) % 3)}>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="editorial-strip" aria-label="Coffee inspiration">
        <div className="editorial-statement">
          <h1>
            COFFEE SO GOOD,<span> EVEN YOUR ALARM CLOCK</span> WILL SMILE.
          </h1>
          <Link to="/journal" className="button button-outline">
            Explore more
            <ArrowUpRight size={18} />
          </Link>
        </div>
        {articles.slice(0, 2).map((article, index) => (
          <Link
            key={article.slug}
            className={`editorial-card editorial-card-${index + 1}`}
            to={`/journal/${article.slug}`}
          >
            <img
              src={index === 0 ? '/images/coffee-beans.jpg' : '/images/coffee-cup.jpg'}
              alt={
                index === 0
                  ? 'Roasted coffee beans with rich brown texture'
                  : 'A warm cup of specialty coffee'
              }
            />
            <div>
              <span>THE COFFEE JOURNAL · 0{index + 1}</span>
              <h2>
                {index === 0
                  ? 'BEAN BLISS: THE BEAUTY OF A PERFECT ROAST.'
                  : 'GLOBAL BEANSCAPE: A WORLD OF FLAVOR, ONE CUP AT A TIME.'}
              </h2>
            </div>
            <span className="editorial-arrow">
              <ArrowUpRight size={19} />
            </span>
          </Link>
        ))}
      </section>
      <div className="values-bar">
        <span>
          <Globe2 size={18} />
          Extraordinary origins
        </span>
        <span>
          <Leaf size={18} />
          Thoughtfully sourced
        </span>
        <span>
          <Coffee size={18} />
          Roasted with intention
        </span>
        <span>
          <PackageCheck size={18} />
          Fresh to your doorstep
        </span>
      </div>
      <section className="home-section featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION · BEST SELLERS</span>
            <h2>
              MEET YOUR
              <br />
              <em>MORNING PEOPLE.</em>
            </h2>
          </div>
          <div className="section-heading-aside">
            <p>
              Distinctive beans. Remarkable places.
              <br />A whole world in your cup.
            </p>
            <Link className="text-link" to="/shop">
              Shop all coffee
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="product-grid home-product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="arrival-ribbon">
        <div>
          <span className="eyebrow">NEW TO YOUR COFFEE SHELF</span>
          <h2>
            SMALL LOT.
            <br />
            <em>BIG PERSONALITY.</em>
          </h2>
        </div>
        <div className="arrival-package">
          <img
            src="/images/toraja-bag.svg"
            alt="Toraja Reserve new arrival coffee pouch"
            loading="lazy"
          />
          <span>
            THE
            <br />
            RESERVE
            <br />
            EDIT.
          </span>
        </div>
        <div>
          <p>
            Meet Toraja Reserve. Black cherry, caramel, and warm spice from the highlands of
            Sulawesi. An extraordinary little discovery.
          </p>
          <Link to="/product/toraja-reserve" className="text-link">
            Discover the new arrival
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="origin-feature">
        <div className="origin-feature-image">
          <img
            src="/images/coffee-farm.jpg"
            alt="Illustrated Indonesian coffee highlands"
            loading="lazy"
          />
          <span className="origin-coordinates">
            0° 35′ N · 99° 30′ E<br />
            SUMATRA, INDONESIA
          </span>
          <span className="origin-stamp">
            FROM THE
            <br />
            <strong>GROUND UP.</strong>
            <Leaf size={35} />
          </span>
        </div>
        <div className="origin-feature-content">
          <span className="eyebrow">ROOTED IN SOMETHING REAL</span>
          <h2>
            GREAT COFFEE.
            <br />
            EVEN BETTER
            <br />
            <em>STORIES.</em>
          </h2>
          <p>
            Behind every bean, there’s a place. A pair of hands. A tradition passed down through
            generations. We bring those stories to life, one thoughtfully roasted batch at a time.
          </p>
          <Link to="/origins" className="button button-outline">
            Meet the origins
            <ArrowUpRight size={18} />
          </Link>
          <div className="origin-detail">
            <span>
              06<small>DISTINCTIVE COFFEES</small>
            </span>
            <span>
              01<small>SHARED OBSESSION</small>
            </span>
          </div>
        </div>
      </section>
      <section className="home-section flavor-explorer">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FOLLOW YOUR TASTEBUDS</span>
            <h2>
              WHAT’S YOUR
              <br />
              <em>COFFEE PERSONALITY?</em>
            </h2>
          </div>
          <p>
            There’s no wrong answer.
            <br />
            Just your next favorite.
          </p>
        </div>
        <div className="flavor-layout">
          <div className="flavor-options">
            <span className="tiny-label">I LIKE MY COFFEE...</span>
            {['Chocolatey', 'Fruity', 'Nutty', 'Balanced'].map((name, index) => (
              <button
                key={name}
                className={flavor === name ? 'selected' : ''}
                onClick={() => setFlavor(name)}
              >
                <span>0{index + 1}</span>
                {name}
                <ArrowUpRight size={24} />
              </button>
            ))}
          </div>
          <div className="flavor-result" style={{ backgroundColor: flavorProduct.color }}>
            <span className="flavor-result-circle" />
            <img src={flavorProduct.image} alt={flavorProduct.name} loading="lazy" />
            <div>
              <span className="tiny-label">YOUR PERFECT MATCH</span>
              <h3>{flavorProduct.name}</h3>
              <p>{flavorProduct.notes.join(' · ')}</p>
              <Link className="button button-dark" to={`/product/${flavorProduct.slug}`}>
                Meet your match
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="subscription-banner">
        <div>
          <span className="eyebrow">A LITTLE ROUTINE. A LOT OF JOY.</span>
          <h2>
            NEVER RUN OUT
            <br />
            OF <em>GOOD MORNINGS.</em>
          </h2>
          <p>
            Your favorite coffee, on your schedule.
            <br />
            Subscribe and make the good stuff a habit.
          </p>
          <Link className="button button-light" to="/subscription">
            Find your subscription
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="subscription-art" aria-hidden="true">
          <span className="subscription-orbit" />
          <img src="/images/bali-bag.svg" alt="" />
          <img src="/images/signature-bag.svg" alt="" />
          <span className="subscription-tag">
            FRESH BEANS.
            <br />
            ON REPEAT.
            <ArrowDown size={22} />
          </span>
        </div>
      </section>
      <section className="home-section community-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BREWED TO BRING US TOGETHER</span>
            <h2>
              GOOD COMPANY.
              <br />
              <em>GREAT COFFEE.</em>
            </h2>
          </div>
          <Link to="/about" className="text-link">
            A little about us
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="community-grid">
          <div className="testimonial">
            <Quote size={35} strokeWidth={1} />
            <div className="stars" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star size={13} fill="currentColor" key={i} />
              ))}
            </div>
            <blockquote>
              “The kind of coffee that makes you put your phone down and just enjoy the moment.”
            </blockquote>
            <div>
              <span className="review-avatar">AK</span>
              <p>
                <strong>Amelia K.</strong>
                <span>Sample community review</span>
              </p>
            </div>
          </div>
          <Link className="community-photo" to="/journal/your-slow-morning-brew-guide">
            <img
              src="/images/coffee-cup.jpg"
              alt="Coffee as part of a slow morning ritual"
              loading="lazy"
            />
            <span>
              MAKE TIME FOR
              <br />
              THE LITTLE THINGS.
              <ArrowUpRight size={24} />
            </span>
          </Link>
          <div className="community-note">
            <Coffee size={48} strokeWidth={1} />
            <span className="eyebrow">FROM FIRST SIP TO LAST DROP</span>
            <h3>
              MORE THAN
              <br />A COFFEE.
              <br />
              <em>A feeling.</em>
            </h3>
            <Link to="/about" className="circle-button" aria-label="Read our brand story">
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="home-section latest-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FRESH OFF THE PRESS</span>
            <h2>
              A LITTLE
              <br />
              <em>COFFEE CULTURE.</em>
            </h2>
          </div>
          <Link className="text-link" to="/journal">
            Read the journal
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="journal-home-grid">
          {articles.map((article) => (
            <Link key={article.slug} to={`/journal/${article.slug}`}>
              <div>
                <img src={article.image} alt={article.title} loading="lazy" />
                <span className="circle-button">
                  <ArrowUpRight size={21} />
                </span>
              </div>
              <span className="tiny-label">
                {article.category} · {article.readTime}
              </span>
              <h3>{article.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
