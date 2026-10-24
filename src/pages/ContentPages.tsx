import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  Heart,
  Leaf,
  MapPin,
  Package,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { articles, weightMultiplier } from '../data';
import { useStore } from '../store';
import { EmptyState, PageIntro, ProductCard } from '../components/ui';
import '../styles/content.css';

const regionNotes: Record<
  string,
  { subtitle: string; altitude: string; notes: string; description: string }
> = {
  Java: {
    subtitle: 'Volcanic soil. Timeless character.',
    altitude: '1,200–1,600m',
    notes: 'Cocoa · toasted almond · brown sugar',
    description:
      'From the misty slopes of Java comes a beautifully balanced cup. Volcanic soils and a slower growing season give these coffees their gentle sweetness and rounded body.',
  },
  Sumatra: {
    subtitle: 'Wild by nature. Rich by tradition.',
    altitude: '1,100–1,500m',
    notes: 'Dark chocolate · cedar · sweet spice',
    description:
      'Sumatra is known for its distinctive wet-hulled process. The result is a full, earthy cup with a lingering finish and a character all its own.',
  },
  Bali: {
    subtitle: 'Bright mornings begin here.',
    altitude: '1,200–1,700m',
    notes: 'Orange · milk chocolate · florals',
    description:
      'The highlands of Kintamani bring a lively brightness to the cup. Citrus gardens and mountain air inspire a coffee that feels as sunny as its home.',
  },
  Toraja: {
    subtitle: 'A little further off the beaten path.',
    altitude: '1,400–1,800m',
    notes: 'Caramel · ripe plum · warm spice',
    description:
      'In the mountainous heart of Sulawesi, small farms cultivate coffees with layered sweetness. Take your time with this one; there is more to discover in every sip.',
  },
};

export function AboutPage() {
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="A little more than coffee"
        title="GOOD COFFEE. GREAT COMPANY."
        description="We believe the best part of a morning is a cup worth slowing down for."
      />
      <section className="content-story-hero">
        <img
          src="/images/coffee-farm.jpg"
          alt="Green coffee growing landscape in the Indonesian highlands"
        />
        <div className="content-story-card">
          <span className="eyebrow">Rooted in curiosity</span>
          <h2>
            FROM THE ISLANDS,
            <br />
            WITH A LITTLE SOUL.
          </h2>
          <p>
            COFFEE SHOP is an Indonesian-inspired specialty coffee concept. We bring bold origins,
            thoughtful roasting, and a playful point of view to your daily ritual.
          </p>
          <p>
            Our collection explores the flavors of Java, Sumatra, Bali, and Toraja. Every bag is an
            invitation to get to know your coffee a little better.
          </p>
          <Link className="button button-primary" to="/origins">
            Explore our origins <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="content-values">
        <div>
          <Leaf />
          <span>01 / Thoughtful selection</span>
          <h3>Character comes first.</h3>
          <p>
            Distinctive origins and clear tasting notes help you find a coffee that feels like
            yours.
          </p>
        </div>
        <div>
          <Coffee />
          <span>02 / Everyday craft</span>
          <h3>Make a little ritual.</h3>
          <p>
            Useful brew guides and approachable advice make a better cup feel beautifully simple.
          </p>
        </div>
        <div>
          <Heart />
          <span>03 / Better together</span>
          <h3>There is always room.</h3>
          <p>
            New to specialty coffee or already weighing every bean? Pull up a chair. You belong
            here.
          </p>
        </div>
      </section>
      <section className="content-split-feature">
        <div>
          <span className="eyebrow">The roast makes the difference</span>
          <h2>
            BOLD FLAVORS.
            <br />
            NO SHORTCUTS.
          </h2>
          <p>
            Light and medium roasts let brightness and sweetness shine. A deeper roast creates a
            comforting, full-bodied cup. Explore the collection and discover your own sweet spot.
          </p>
          <Link className="button button-outline" to="/shop">
            Find your coffee <ArrowRight size={18} />
          </Link>
        </div>
        <img src="/images/coffee-roasting.jpg" alt="Freshly roasted coffee beans being prepared" />
      </section>
    </main>
  );
}

export function JournalPage() {
  const [category, setCategory] = useState('All stories');
  const categories = ['All stories', ...new Set(articles.map((article) => article.category))];
  const filtered = articles.filter(
    (article) => category === 'All stories' || article.category === category,
  );
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="The coffee journal"
        title="STORIES WORTH A SECOND CUP."
        description="A closer look at the people, places, and little rituals behind your coffee."
      />
      <div className="content-tabs" aria-label="Story categories">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="journal-grid">
        {filtered.map((article, index) => (
          <Link
            to={`/journal/${article.slug}`}
            className={`journal-card ${index === 0 ? 'journal-featured' : ''}`}
            key={article.slug}
          >
            <div className="journal-image">
              <img src={article.image} alt={article.title} />
              <span className="journal-arrow">
                <ArrowUpRight />
              </span>
            </div>
            <div className="journal-meta">
              <span>{article.category}</span>
              <span>
                <Clock size={13} /> {article.readTime}
              </span>
            </div>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);
  const { products } = useStore();
  if (!article)
    return (
      <main id="main-content" className="page-shell">
        <EmptyState
          headingLevel={1}
          title="This story is still brewing."
          description="Explore the latest from our coffee journal."
          action="Visit the journal"
          to="/journal"
        />
      </main>
    );
  return (
    <main id="main-content" className="content-article">
      <div className="page-shell">
        <Link className="content-back" to="/journal">
          ← Back to the journal
        </Link>
        <PageIntro
          eyebrow={`${article.category} / ${article.readTime}`}
          title={article.title}
          description={article.excerpt}
        />
      </div>
      <img className="content-article-cover" src={article.image} alt={article.title} />
      <div className="content-article-body">
        <p className="content-dropcap">{article.body[0]}</p>
        {article.body.slice(1).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <blockquote>
          “Good coffee is a reason to pause. A great cup makes you want to stay.”
        </blockquote>
        <h2>Make it your own</h2>
        <p>
          Start with fresh water, freshly ground coffee, and a recipe you can repeat. Change one
          thing at a time, taste as you go, and trust your own preferences. The best cup is the one
          you enjoy.
        </p>
        <Link className="button button-outline" to="/shop">
          Find a coffee for your next brew <ArrowRight size={18} />
        </Link>
      </div>
      <section className="page-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Read. Brew. Repeat.</span>
            <h2>A GOOD PLACE TO START.</h2>
          </div>
          <Link to="/shop">
            Shop all coffee <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

export function OriginsPage() {
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="A taste of the archipelago"
        title="EVERY ISLAND. A DIFFERENT STORY."
        description="Travel through Indonesia, one extraordinary cup at a time."
      />
      <div className="origin-map" aria-label="Explore Indonesian coffee regions">
        <div className="origin-map-lines" />
        <span className="origin-map-ocean">INDIAN OCEAN</span>
        <div className="origin-map-heading">
          17,000+ ISLANDS.
          <br />
          ENDLESS POSSIBILITY.
        </div>
        {Object.keys(regionNotes).map((name, index) => (
          <a
            href={`#origin-${name.toLowerCase()}`}
            className={`origin-pin origin-pin-${index}`}
            key={name}
          >
            <span />
            <strong>{name}</strong>
            <small>{regionNotes[name].altitude}</small>
          </a>
        ))}
      </div>
      <section className="origins-grid">
        {Object.entries(regionNotes).map(([name, region], index) => (
          <article className="origin-card" id={`origin-${name.toLowerCase()}`} key={name}>
            <div className="origin-card-top">
              <span>0{index + 1} / INDONESIA</span>
              <MapPin size={22} />
            </div>
            <h2>{name.toUpperCase()}</h2>
            <h3>{region.subtitle}</h3>
            <p>{region.description}</p>
            <dl>
              <div>
                <dt>Typical altitude</dt>
                <dd>{region.altitude}</dd>
              </div>
              <div>
                <dt>In the cup</dt>
                <dd>{region.notes}</dd>
              </div>
            </dl>
            <Link
              className="button button-outline"
              to={`/shop?origin=${encodeURIComponent(name === 'Toraja' ? 'Sulawesi' : name)}`}
            >
              Taste {name} <ArrowUpRight size={18} />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="Let's talk coffee"
        title="OUR DOOR IS ALWAYS OPEN."
        description="A brewing question, a collaboration, or just a hello. We would love to hear it."
      />
      <div className="contact-layout">
        <aside className="contact-details">
          <Coffee size={42} strokeWidth={1.2} />
          <h2>
            A GOOD CONVERSATION
            <br />
            STARTS HERE.
          </h2>
          <p>Find quick answers in our help center, or try the contact form preview.</p>
          <div>
            <span className="eyebrow">Studio hours</span>
            <p>
              Monday–Friday
              <br />
              9:00–18:00 WIB (Jakarta)
            </p>
          </div>
          <div>
            <span className="eyebrow">Have a quick question?</span>
            <Link to="/help">
              Visit the help center <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="content-demo-note">
            This is a storefront concept. The form previews the experience and does not send email.
          </p>
        </aside>
        {sent ? (
          <section className="content-form-success" role="status">
            <Check size={44} />
            <h2>LOOKING GOOD.</h2>
            <p>
              Your message passed validation in this demo. No message was sent or stored on a
              server.
            </p>
            <button className="button button-outline" onClick={() => setSent(false)}>
              Write another message
            </button>
          </section>
        ) : (
          <form className="content-form" onSubmit={submit}>
            <div className="content-form-pair">
              <label className="field">
                Your name
                <input name="name" autoComplete="name" required placeholder="Alex Morgan" />
              </label>
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="alex@example.com"
                />
              </label>
            </div>
            <label className="field">
              What can we help with?
              <select name="subject" required defaultValue="">
                <option value="" disabled>
                  Select a topic
                </option>
                <option>Product &amp; brewing question</option>
                <option>Orders & delivery</option>
                <option>Subscriptions</option>
                <option>Partnerships</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="field">
              Your message
              <textarea
                name="message"
                required
                minLength={10}
                rows={7}
                placeholder="Tell us what is on your mind…"
              />
            </label>
            <label className="content-check">
              <input type="checkbox" required /> I understand this form is a local preview.
            </label>
            <button className="button button-primary" type="submit">
              Preview message <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const faqs = [
  {
    category: 'Delivery',
    question: 'Where do you deliver?',
    answer:
      'This storefront demonstrates a delivery flow with a configurable country field. Live delivery regions and carrier coverage will be confirmed when fulfillment is connected.',
  },
  {
    category: 'Delivery',
    question: 'How much is shipping?',
    answer:
      'The demo offers standard shipping for $5, free for coffee orders of $50 or more. Express delivery is available at checkout for $12. Your final demo estimate appears before you place the order.',
  },
  {
    category: 'Delivery',
    question: 'How can I track my order?',
    answer:
      'After placing a demo order, open Account → Orders and choose your order. The order detail page shows its current status and delivery address. Live carrier tracking is not connected.',
  },
  {
    category: 'Returns',
    question: 'Can I return my coffee?',
    answer:
      'If something is wrong with a future live order, contact the store with the order number and a description of the issue. The policies shown here are a storefront preview; a live returns policy will be published before real sales begin.',
  },
  {
    category: 'Coffee',
    question: 'Whole bean or ground: which should I choose?',
    answer:
      'Choose whole bean if you have a grinder and enjoy grinding just before brewing. Otherwise choose the grind for your brewing method: espresso, filter, or French press. Your selection is saved with the cart item.',
  },
  {
    category: 'Coffee',
    question: 'What is the best way to store coffee?',
    answer:
      'Keep your coffee in an airtight container in a cool, dry place away from direct sunlight. Avoid the refrigerator, where moisture and surrounding aromas can affect the beans.',
  },
  {
    category: 'Coffee',
    question: 'How much coffee should I use?',
    answer:
      'For a balanced filter coffee, start with 15g of coffee to 250ml of water. Adjust the grind, dose, or water to suit your taste. For espresso, start with your machine’s recommended recipe.',
  },
  {
    category: 'Payments',
    question: 'Will checkout charge my card?',
    answer:
      'No. Checkout is explicitly a local demonstration and never processes a payment. Please do not enter real card details; this demo does not request or store them.',
  },
  {
    category: 'Account',
    question: 'How does the demo account work?',
    answer:
      'Your name, email, cart, saved coffees, and demo orders are kept in this browser’s local storage. No server account is created and passwords are not saved. Clear browser storage to remove the demo data.',
  },
  {
    category: 'Subscriptions',
    question: 'Can I pause or cancel a subscription?',
    answer:
      'Yes. Visit Account → Subscriptions to pause, resume, or cancel a demo plan. No recurring charge is created and no real delivery is scheduled.',
  },
];

export function HelpPage() {
  const [category, setCategory] = useState('All questions');
  const [query, setQuery] = useState('');
  const filtered = faqs.filter(
    (item) =>
      (category === 'All questions' || item.category === category) &&
      `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="A little help goes a long way"
        title="LET'S CLEAR THINGS UP."
        description="From your first order to your favorite brewing ritual, find the answer here."
      />
      <div className="help-search">
        <Search size={20} />
        <input
          aria-label="Search help questions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What would you like to know?"
        />
      </div>
      <div className="content-tabs">
        {['All questions', ...new Set(faqs.map((item) => item.category))].map((item) => (
          <button
            key={item}
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="help-list">
        {filtered.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <ChevronDown size={20} />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
        {!filtered.length && (
          <EmptyState
            title="No answers found."
            description="Try another search, or explore a different topic."
          />
        )}
      </div>
      <div className="content-help-cta">
        <div>
          <h2>STILL CURIOUS?</h2>
          <p>We are always happy to talk coffee.</p>
        </div>
        <Link className="button button-primary" to="/contact">
          Get in touch <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}

export function SubscriptionPage() {
  const { products, formatPrice, addToCart, notify } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState(products[0]?.id ?? 'java-arabica');
  const [weight, setWeight] = useState('250g');
  const [frequency, setFrequency] = useState('Every 2 weeks');
  const product = products.find((item) => item.id === productId) ?? products[0];
  const multiplier = weightMultiplier(weight);
  const price = product ? Math.round(product.price * multiplier * 0.9 * 100) / 100 : 0;
  function subscribe() {
    if (!product) return;
    if (product.stock === 0) {
      notify('This coffee is sold out. Please choose another origin.');
      setStep(1);
      return;
    }
    addToCart(product.id, weight, 'Whole Bean', 1, frequency);
    notify('Coffee plan added. Complete demo checkout to activate.');
    navigate('/checkout');
  }
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="Your ritual, on repeat"
        title="NEVER RUN OUT OF GOOD MORNINGS."
        description="Choose your coffee. Set your rhythm. Make your favorite cup a regular thing."
      />
      <div className="subscription-layout">
        <aside className="subscription-art">
          <span className="eyebrow">Fresh routine. Zero fuss.</span>
          {product && <img src={product.image} alt={`${product.name} coffee bag`} />}
          <div>
            <h2>
              MORE COFFEE.
              <br />
              LESS THINKING.
            </h2>
            <p>Flexible deliveries · Pause anytime · Your favorite origin</p>
          </div>
        </aside>
        <section className="subscription-builder">
          <div className="subscription-progress" aria-label={`Step ${step} of 3`}>
            {['Your coffee', 'Your rhythm', 'Your plan'].map((label, index) => (
              <button
                key={label}
                className={step >= index + 1 ? 'active' : ''}
                onClick={() => setStep(index + 1)}
              >
                <span>{step > index + 1 ? <Check size={14} /> : index + 1}</span>
                {label}
              </button>
            ))}
          </div>
          {step === 1 ? (
            <>
              <span className="eyebrow">01 / Make it personal</span>
              <h2>WHAT'S YOUR TYPE?</h2>
              <div className="subscription-options">
                {products.slice(0, 4).map((item) => (
                  <button
                    disabled={item.stock === 0}
                    onClick={() => setProductId(item.id)}
                    className={productId === item.id ? 'selected' : ''}
                    key={item.id}
                  >
                    <img src={item.image} alt="" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.notes.join(' · ')}</small>
                    </span>
                    {productId === item.id && <Check size={20} />}
                  </button>
                ))}
              </div>
              <button className="button button-primary" onClick={() => setStep(2)}>
                Choose your rhythm <ArrowRight size={18} />
              </button>
            </>
          ) : step === 2 ? (
            <>
              <span className="eyebrow">02 / Find your rhythm</span>
              <h2>
                JUST ENOUGH.
                <br />
                JUST IN TIME.
              </h2>
              <fieldset className="subscription-choices">
                <legend>How much coffee?</legend>
                {['250g', '500g', '1kg'].map((item) => (
                  <label className={weight === item ? 'selected' : ''} key={item}>
                    <input
                      type="radio"
                      name="weight"
                      checked={weight === item}
                      onChange={() => setWeight(item)}
                    />
                    {item}
                  </label>
                ))}
              </fieldset>
              <fieldset className="subscription-frequency">
                <legend>How often?</legend>
                {['Every week', 'Every 2 weeks', 'Every month'].map((item) => (
                  <label className={frequency === item ? 'selected' : ''} key={item}>
                    <input
                      type="radio"
                      name="frequency"
                      checked={frequency === item}
                      onChange={() => setFrequency(item)}
                    />
                    <span>
                      <strong>{item}</strong>
                      <small>
                        {item === 'Every week'
                          ? 'For the daily devotee'
                          : item === 'Every 2 weeks'
                            ? 'A perfectly balanced routine'
                            : 'A little monthly moment'}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="content-button-row">
                <button className="button button-outline" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="button button-primary" onClick={() => setStep(3)}>
                  Review my plan <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">03 / Your new favorite habit</span>
              <h2>
                MEET YOUR
                <br />
                COFFEE ROUTINE.
              </h2>
              <dl className="subscription-summary">
                <div>
                  <dt>Coffee</dt>
                  <dd>{product?.name}</dd>
                </div>
                <div>
                  <dt>Bag size</dt>
                  <dd>{weight} / Whole bean</dd>
                </div>
                <div>
                  <dt>Frequency</dt>
                  <dd>{frequency}</dd>
                </div>
                <div>
                  <dt>Per delivery / 10% plan saving</dt>
                  <dd>{formatPrice(price)}</dd>
                </div>
              </dl>
              <p className="content-demo-note">
                Demo subscription. No recurring payments or deliveries will be scheduled. Your plan
                becomes visible in your account after demo checkout.
              </p>
              <button className="button button-primary" onClick={subscribe}>
                Continue to checkout <ArrowRight size={18} />
              </button>
              <button className="content-text-button" onClick={() => setStep(1)}>
                Edit my selections
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export function AuthPage() {
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') ?? 'login';
  const { login } = useStore();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const titles: Record<string, string> = {
    login: 'YOUR DAILY DOSE OF GOOD.',
    register: 'GOOD COMPANY STARTS HERE.',
    forgot: 'LET’S GET YOU BACK IN.',
    reset: 'A FRESH START.',
  };
  function changeMode(next: string) {
    setParams({ mode: next });
    setSubmitted(false);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (mode === 'forgot' || mode === 'reset') {
      setSubmitted(true);
      return;
    }
    const email = String(data.get('email'));
    const name = String(data.get('name') || email.split('@')[0]);
    login(name, email);
    navigate('/account');
  }
  return (
    <main id="main-content" className="page-shell auth-layout">
      <aside className="auth-art">
        <span className="eyebrow">Coffee tastes better together.</span>
        <img src="/images/sumatra-bag.svg" alt="Sumatra Arabica coffee packaging" />
        <div>
          <span>YOUR NEXT</span>
          <strong>good morning.</strong>
        </div>
      </aside>
      <section className="auth-form">
        <Link className="content-back" to="/">
          ← Back to the good stuff
        </Link>
        <span className="eyebrow">
          {mode === 'register' ? 'Pull up a chair' : 'Welcome to coffee shop'}
        </span>
        <h1>{titles[mode] ?? titles.login}</h1>
        <p>
          {mode === 'register'
            ? 'Save your favorites and keep your coffee routine in one place.'
            : mode === 'forgot'
              ? 'Preview the account recovery experience.'
              : mode === 'reset'
                ? 'Preview a new password form.'
                : 'Your favorites, your orders, your little coffee corner.'}
        </p>
        {submitted ? (
          <div className="content-form-success" role="status">
            <Check size={32} />
            <h2>{mode === 'forgot' ? 'RECOVERY PREVIEWED.' : 'PASSWORD FORM VALIDATED.'}</h2>
            <p>
              This local demo does not send recovery emails, create passwords, or change
              credentials. Use the demo sign-in to explore your account.
            </p>
            <button className="button button-primary" onClick={() => changeMode('login')}>
              Back to sign in
            </button>
          </div>
        ) : (
          <form className="content-form" onSubmit={submit}>
            {mode === 'register' && (
              <label className="field">
                Your name
                <input name="name" autoComplete="name" required placeholder="Alex Morgan" />
              </label>
            )}
            {mode !== 'reset' && (
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
            )}
            {mode === 'register' || mode === 'reset' ? (
              <label className="field">
                {mode === 'reset' ? 'New password' : 'Choose a password'}
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
            ) : null}
            {mode === 'login' && (
              <div className="auth-form-links">
                <label className="content-check">
                  <input type="checkbox" defaultChecked /> Remember this browser
                </label>
                <button
                  type="button"
                  className="content-text-button"
                  onClick={() => changeMode('forgot')}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <p className="content-demo-note">
              Local demo access. No server authentication is connected. Passwords are never saved.
              Your profile stays in this browser.
            </p>
            <button className="button button-primary" type="submit">
              {mode === 'register'
                ? 'Create demo profile'
                : mode === 'forgot'
                  ? 'Preview recovery'
                  : mode === 'reset'
                    ? 'Preview reset'
                    : 'Continue to demo account'}{' '}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
        <div className="auth-switch">
          {mode === 'register' ? (
            <>
              Already part of the crew? <button onClick={() => changeMode('login')}>Sign in</button>
            </>
          ) : mode === 'login' ? (
            <>
              New around here?{' '}
              <button onClick={() => changeMode('register')}>Create an account</button>
            </>
          ) : (
            <button onClick={() => changeMode('login')}>Back to sign in</button>
          )}
        </div>
        {mode === 'forgot' && (
          <button className="content-text-button" onClick={() => changeMode('reset')}>
            Preview password reset screen
          </button>
        )}
      </section>
    </main>
  );
}

function AccountNav() {
  return (
    <nav className="account-navigation" aria-label="Account navigation">
      <Link to="/account">My overview</Link>
      <Link to="/account/orders">My orders</Link>
      <Link to="/wishlist">Saved coffees</Link>
      <Link to="/account?tab=subscriptions">Subscriptions</Link>
      <Link to="/account?tab=profile">Personal details</Link>
      <Link to="/account?tab=addresses">Addresses</Link>
    </nav>
  );
}

export function AccountPage() {
  const {
    user,
    orders,
    wishlist,
    subscriptions,
    login,
    logout,
    products,
    updateSubscription,
    notify,
  } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [address, setAddress] = useState(() => {
    try {
      return localStorage.getItem('coffee-shop-demo-address') ?? '';
    } catch {
      return '';
    }
  });
  if (!user)
    return (
      <main id="main-content" className="page-shell">
        <EmptyState
          headingLevel={1}
          title="YOUR COFFEE CORNER AWAITS."
          description="Create a local demo profile to explore your account."
          action="Sign in"
          to="/account/auth"
        />
      </main>
    );
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login(String(data.get('name')), String(data.get('email')));
    notify('Your demo profile has been updated.');
  }
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="Your coffee corner"
        title={`HEY, ${user.name.toUpperCase()}.`}
        description="A little space for all your favorite things."
      />
      <div className="account-layout">
        <aside>
          <AccountNav />
          <button className="content-text-button" onClick={() => setConfirmLogout(true)}>
            Sign out
          </button>
          {confirmLogout && (
            <div className="account-confirm">
              <p>Sign out of this demo profile?</p>
              <button
                className="button button-primary"
                onClick={() => {
                  logout();
                  setConfirmLogout(false);
                }}
              >
                Sign out
              </button>
              <button className="content-text-button" onClick={() => setConfirmLogout(false)}>
                Stay here
              </button>
            </div>
          )}
        </aside>
        <section className="account-content">
          {tab === 'profile' ? (
            <>
              <h2>PERSONAL DETAILS</h2>
              <form className="content-form" onSubmit={saveProfile}>
                <label className="field">
                  Your name
                  <input name="name" autoComplete="name" defaultValue={user.name} required />
                </label>
                <label className="field">
                  Email address
                  <input
                    name="email"
                    autoComplete="email"
                    type="email"
                    defaultValue={user.email}
                    required
                  />
                </label>
                <button className="button button-primary" type="submit">
                  Save details <Check size={18} />
                </button>
              </form>
              <div className="account-security">
                <ShieldCheck />
                <div>
                  <h3>Account security</h3>
                  <p>
                    This browser-only demo has no password or saved payment credentials. Live
                    authentication will be connected separately.
                  </p>
                </div>
              </div>
            </>
          ) : tab === 'addresses' ? (
            <>
              <h2>YOUR SAVED ADDRESS</h2>
              <p className="muted">A local address note for your next coffee delivery.</p>
              <form
                className="content-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  try {
                    localStorage.setItem('coffee-shop-demo-address', address);
                    notify('Address saved in this browser.');
                  } catch {
                    notify('Browser storage is unavailable.');
                  }
                }}
              >
                <label className="field">
                  Delivery address
                  <textarea
                    rows={5}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    placeholder="Street, apartment, city, postal code, country"
                  />
                </label>
                <button className="button button-primary">
                  Save address <Check size={18} />
                </button>
              </form>
            </>
          ) : tab === 'subscriptions' ? (
            <>
              <div className="section-heading">
                <h2>YOUR COFFEE ROUTINE</h2>
                <Link to="/subscription">
                  Add a plan <ArrowUpRight size={16} />
                </Link>
              </div>
              {!subscriptions.length ? (
                <EmptyState
                  title="A FRESH ROUTINE AWAITS."
                  description="Choose your coffee and set your own delivery rhythm."
                  action="Build your plan"
                  to="/subscription"
                />
              ) : (
                <div className="account-plans">
                  {subscriptions.map((plan) => {
                    const product = products.find((item) => item.id === plan.productId);
                    return (
                      <article key={plan.id}>
                        <img src={product?.image} alt={product?.name ?? 'Coffee subscription'} />
                        <div>
                          <span className="eyebrow">{plan.status}</span>
                          <h3>{product?.name ?? 'Coffee plan'}</h3>
                          <p>
                            {plan.weight} · {plan.frequency}
                          </p>
                          <div className="content-button-row">
                            {plan.status.toLowerCase() !== 'cancelled' && (
                              <>
                                <button
                                  className="button button-outline"
                                  onClick={() =>
                                    updateSubscription(
                                      plan.id,
                                      plan.status.toLowerCase() === 'active' ? 'Paused' : 'Active',
                                    )
                                  }
                                >
                                  {plan.status.toLowerCase() === 'active' ? (
                                    <Pause size={15} />
                                  ) : (
                                    <Play size={15} />
                                  )}
                                  {plan.status.toLowerCase() === 'active'
                                    ? 'Pause plan'
                                    : 'Resume plan'}
                                </button>
                                <button
                                  className="content-text-button"
                                  onClick={() => updateSubscription(plan.id, 'Cancelled')}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="content-demo-note">
                Demo plans never create real recurring charges or shipments.
              </p>
            </>
          ) : (
            <>
              <div className="account-metrics">
                <Link to="/account/orders">
                  <Package />
                  <strong>{orders.length}</strong>
                  <span>Orders to smile about</span>
                </Link>
                <Link to="/wishlist">
                  <Heart />
                  <strong>{wishlist.length}</strong>
                  <span>Coffees on your mind</span>
                </Link>
                <button onClick={() => setParams({ tab: 'subscriptions' })}>
                  <Coffee />
                  <strong>
                    {subscriptions.filter((plan) => plan.status.toLowerCase() === 'active').length}
                  </strong>
                  <span>Active coffee routines</span>
                </button>
              </div>
              <div className="account-welcome">
                <span className="eyebrow">Make yourself at home</span>
                <h2>
                  YOUR NEXT GREAT
                  <br />
                  CUP IS WAITING.
                </h2>
                <p>
                  Explore a new origin, revisit an old favorite, or find a little inspiration for
                  tomorrow morning.
                </p>
                <Link className="button button-primary" to="/shop">
                  Find your next coffee <ArrowRight size={18} />
                </Link>
              </div>
              <div className="account-security">
                <ShieldCheck />
                <div>
                  <h3>Your payment preferences</h3>
                  <p>
                    No payment details are stored. All checkout orders are local demonstrations.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export function OrdersPage() {
  const { orders, formatPrice } = useStore();
  return (
    <main id="main-content" className="page-shell content-page">
      <PageIntro
        eyebrow="The good stuff, delivered"
        title="YOUR COFFEE HISTORY."
        description="Every order has a story. Here are yours."
      />
      <div className="account-layout">
        <AccountNav />
        <section>
          {!orders.length ? (
            <EmptyState
              title="THE FIRST CUP IS CALLING."
              description="Once you place a demo order, you will find it right here."
              action="Explore the collection"
              to="/shop"
            />
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <Link className="order-list-card" key={order.id} to={`/account/orders/${order.id}`}>
                  <div>
                    <span className="eyebrow">Order {order.id}</span>
                    <h2>
                      {new Date(order.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h2>
                    <span className="order-status">{order.status}</span>
                  </div>
                  <div className="order-mini-images">
                    {order.items.slice(0, 3).map((item, index) => {
                      return <img key={index} src={item.image} alt={item.name} />;
                    })}
                  </div>
                  <div>
                    <strong>{formatPrice(order.total)}</strong>
                    <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  </div>
                  <ArrowUpRight />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { orders, products, formatPrice } = useStore();
  const order = orders.find((item) => item.id === id);
  if (!order)
    return (
      <main id="main-content" className="page-shell">
        <EmptyState
          headingLevel={1}
          title="ORDER NOT FOUND."
          description="This demo order is not saved in this browser."
          action="View your orders"
          to="/account/orders"
        />
      </main>
    );
  const normalized = order.status.toLowerCase();
  const stages = ['Order confirmed', 'Roasting & packing', 'On its way', 'Delivered'];
  const stage = normalized.includes('cancel')
    ? -1
    : normalized.includes('deliver')
      ? 3
      : normalized.includes('ship')
        ? 2
        : normalized.includes('process') || normalized.includes('pack')
          ? 1
          : 0;
  return (
    <main id="main-content" className="page-shell content-page">
      <Link className="content-back" to="/account/orders">
        ← Your orders
      </Link>
      <PageIntro
        eyebrow={`Placed ${new Date(order.date).toLocaleDateString('en-US')}`}
        title={`ORDER ${order.id}`}
        description={
          normalized.includes('cancel')
            ? 'This demo order has been cancelled.'
            : 'Your next good morning is one step closer.'
        }
      />
      <div className="order-tracking">
        {stages.map((label, index) => (
          <div className={index <= stage ? 'complete' : ''} key={label}>
            <span>{index <= stage ? <Check size={18} /> : index + 1}</span>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
      <p className="content-demo-note">
        Local demo tracking. This order does not create a shipment or a payment.
      </p>
      <div className="order-detail-layout">
        <div className="order-detail-items">
          {order.items.map((item, index) => {
            const product = products.find((product) => product.id === item.productId);
            return (
              <article key={index}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.weight} · {item.grind}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                {product && (
                  <Link to={`/product/${product.slug}`}>
                    View coffee <ArrowUpRight size={16} />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
        <aside className="order-delivery">
          <Truck size={28} />
          <h2>DELIVERY DETAILS</h2>
          <p>
            {order.customer.name}
            <br />
            {order.customer.address}
            <br />
            {order.customer.city}, {order.customer.postalCode}
            <br />
            {order.customer.country}
          </p>
          <p>{order.customer.email}</p>
          <p className="muted">{order.deliveryMethod}</p>
          <div className="order-total">
            <span>Order total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
          <Link to="/help">
            Need a hand? <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
