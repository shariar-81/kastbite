// @ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bike,
  Check,
  ChefHat,
  Clock3,
  Flame,
  LogOut,
  MoreVertical,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Search,
  Sparkles,
  Timer,
  Trash2,
  UserRound,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

const C = {
  bg: "#ffffff",
  surface: "#f6f7f9",
  surfaceHi: "#eef0f4",
  border: "#e2e5ea",
  text: "#0f1419",
  textDim: "#5b6472",
  pink: "#e21b5c",
  teal: "#12805c",
  amber: "#b7791f",
  violet: "#e21b5c",
};

const CATEGORIES = ["Starters", "Mains", "Rice & Noodles", "Drinks", "Desserts"];
const DEFAULT_CATEGORIES = [{ name: "Starters", emoji: "🥟" }, { name: "Mains", emoji: "🍛" }, { name: "Rice & Noodles", emoji: "🍜" }, { name: "Drinks", emoji: "🧋" }, { name: "Desserts", emoji: "🍮" }];
const STATUS_FLOW = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
const STATUS_ICON = { Rejected: X, Placed: Clock3, Preparing: ChefHat, "Out for Delivery": Bike, Delivered: PackageCheck };
const STATUS_COLOR = { Rejected: "#c62828", Placed: "#b7791f", Preparing: "#e21b5c", "Out for Delivery": "#0e7490", Delivered: "#12805c" };

const INITIAL_MENU = [
  { id: "m1", name: "Chili Garlic Wings", category: "Starters", price: 6.5, desc: "Crispy wings tossed in sticky chili-garlic glaze.", emoji: "🍗", spice: 2, tag: "Crowd favorite" },
  { id: "m2", name: "Vegetable Spring Rolls", category: "Starters", price: 4.5, desc: "Hand-rolled and fried until shatter-crisp.", emoji: "🥟", spice: 0, tag: "Light & crisp" },
  { id: "m3", name: "Smoked Beef Rendang", category: "Mains", price: 11, desc: "Slow-braised beef in coconut and spice paste.", emoji: "🍛", spice: 3, tag: "Chef's pick" },
  { id: "m4", name: "Grilled Lemongrass Chicken", category: "Mains", price: 9.5, desc: "Charred chicken thigh with lemongrass marinade.", emoji: "🍢", spice: 1, tag: "Best seller" },
  { id: "m5", name: "Prawn Pad Thai", category: "Rice & Noodles", price: 10, desc: "Wok-tossed rice noodles, tamarind and prawns.", emoji: "🍤", spice: 1, tag: "Wok hot" },
  { id: "m6", name: "Nasi Goreng", category: "Rice & Noodles", price: 8, desc: "Fried rice, fried egg and pickled cucumber.", emoji: "🍳", spice: 2, tag: "Comfort food" },
  { id: "m7", name: "Iced Lychee Tea", category: "Drinks", price: 3, desc: "Chilled black tea, lychee and fresh mint.", emoji: "🧋", spice: 0, tag: "Refreshing" },
  { id: "m8", name: "Calamansi Soda", category: "Drinks", price: 2.5, desc: "Sparkling water, calamansi and palm sugar.", emoji: "🥤", spice: 0, tag: "Zingy" },
  { id: "m9", name: "Pandan Coconut Custard", category: "Desserts", price: 4, desc: "Silky custard finished with toasted coconut.", emoji: "🍮", spice: 0, tag: "Sweet finish" },
  { id: "m10", name: "Black Sticky Rice Pudding", category: "Desserts", price: 4.5, desc: "Warm sticky rice with coconut cream.", emoji: "🍚", spice: 0, tag: "Classic" },
];

function hashPw(pw, salt) {
  const s = `${salt}:${pw}:kastbite`; let h = 5381, g = 52711;
  for (let i = 0; i < s.length; i++) { h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0; g = (Math.imul(g, 31) + s.charCodeAt(i)) >>> 0; }
  return h.toString(36) + g.toString(36);
}
const seed = (id, name, email, pw, role, address = "") => ({ id, name, email, pw: hashPw(pw, email), role, phone: "", address, active: true });
const INITIAL_USERS = [
  seed("u1", "Nadia Karim", "customer@kastbite.com", "customer123", "customer"),
  seed("u2", "Kitchen Staff", "staff@kastbite.com", "staff123", "staff"),
  seed("u3", "Rider One", "rider@kastbite.com", "rider123", "delivery"),
  seed("u4", "Site Admin", "admin@kastbite.com", "admin123", "admin"),
];
const money = (value) => `$${Number(value).toFixed(2)}`;
const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function InstallButton({ compact = false }) {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone;
    setInstalled(Boolean(standalone));
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (installed || !prompt) return null;
  return (
    <button className={compact ? "install-button compact" : "install-button"} onClick={install}>
      <DownloadIcon /> {compact ? "Install" : "Add to home screen"}
    </button>
  );
}

function DownloadIcon() {
  return <span className="download-glyph" aria-hidden="true">↓</span>;
}

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status] || Clock3;
  const color = STATUS_COLOR[status] || C.amber;
  return (
    <span className="status-badge" style={{ color, background: `${color}18`, borderColor: `${color}55` }}>
      <Icon size={13} /> {status}
    </span>
  );
}

function GlowButton({ children, onClick, disabled = false, color = C.pink, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glow-button ${className}`}
      style={{ background: color, boxShadow: "none" }}
    >
      {children}
    </button>
  );
}

function Logo({ small = false }) {
  return (
    <div className={`brand-mark ${small ? "small" : ""}`}>
      <span className="brand-dot" />
      <span className="brand-kast">Kast</span><span>Bite</span>
    </div>
  );
}

const ViewCtx = createContext({ role: null, user: null, switchRole: () => {}, openProfile: () => {}, signOut: () => {} });
const VIEWS = [
  { id: "customer", label: "Customer", icon: UserRound },
  { id: "staff", label: "Restaurant", icon: ChefHat },
  { id: "delivery", label: "Delivery person", icon: Bike },
  { id: "admin", label: "Administrator", icon: ShieldCheck },
];
const ROLE_LABEL = { customer: "Customer", staff: "Restaurant staff", delivery: "Delivery person", admin: "Administrator" };
function ViewMenu() {
  const { role, user, switchRole, openProfile, signOut } = useContext(ViewCtx);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest(".view-menu")) setOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  if (!user) return null;
  const item = (key, i, icon, label, onClick, current) => <button key={key} role="menuitem" className={`view-item ${current ? "current" : ""}`} style={{ transitionDelay: open ? `${70 + i * 45}ms` : "0ms" }} onClick={() => { setOpen(false); onClick(); }}>{icon}<span>{label}</span>{current && <Check size={16} />}</button>;
  return (
    <div className="view-menu">
      <button className={`view-trigger avatar ${open ? "open" : ""}`} aria-label="Account menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{user.name.trim()[0]?.toUpperCase() || "?"}</button>
      <div className={`view-panel ${open ? "show" : ""}`} role="menu">
        <div className="view-user"><strong>{user.name}</strong><small>{user.email}</small><small>{ROLE_LABEL[user.role]}</small></div>
        {item("p", 0, <UserRound size={18} />, "My profile", openProfile)}
        {user.role === "admin" && <><div className="view-panel-title">Switch view</div>{VIEWS.map((v, i) => item(v.id, i + 1, <v.icon size={18} />, v.label, () => switchRole(v.id), role === v.id))}</>}
        <div className="view-sep" />
        {item("o", 6, <LogOut size={18} />, "Sign out", signOut)}
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function submit(e) { e.preventDefault(); setErr((mode === "login" ? onLogin(f.email, f.pw) : onSignup(f)) || ""); }
  const quick = [["Customer", "customer@kastbite.com", "customer123"], ["Restaurant", "staff@kastbite.com", "staff123"], ["Rider", "rider@kastbite.com", "rider123"], ["Admin", "admin@kastbite.com", "admin123"]];
  return (
    <main className="auth-wrap"><div className="auth-card">
      <Logo />
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="auth-sub">{mode === "login" ? "Sign in to order food or manage the kitchen." : "Customer accounts are free. Staff accounts are created by the admin."}</p>
      <form onSubmit={submit}>
        {mode === "signup" && <label>Full name<input className="pf-input" value={f.name} onChange={set("name")} autoComplete="name" /></label>}
        <label>Email<input className="pf-input" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Password<input className="pf-input" type="password" value={f.pw} onChange={set("pw")} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {err && <div className="auth-error">{err}</div>}
        <button className="pf-btn" type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
      {mode === "login" && <div className="auth-quick"><small>Quick sign-in (tap to fill)</small><div>{quick.map(([l, e, p]) => <button key={l} type="button" onClick={() => setF({ ...f, email: e, pw: p })}>{l}</button>)}</div></div>}
    </div></main>
  );
}

function ProfileModal({ user, onSave, onPassword, onClose }) {
  const [f, setF] = useState({ name: user.name, phone: user.phone || "", address: user.address || "" });
  const [pw, setPw] = useState({ cur: "", next: "" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="pf-backdrop" onClick={onClose}><div className="pf-card" onClick={(e) => e.stopPropagation()}>
      <div className="pf-head"><h2>My profile</h2><button className="pf-x" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="pf-meta"><span className="avatar-lg">{user.name.trim()[0]?.toUpperCase()}</span><div><strong>{user.email}</strong><small>{ROLE_LABEL[user.role]}</small></div></div>
      <label>Full name<input className="pf-input" value={f.name} onChange={set("name")} /></label>
      <label>Phone<input className="pf-input" value={f.phone} onChange={set("phone")} placeholder="e.g. 01712 345678" /></label>
      {user.role === "customer" && <label>Default delivery address<input className="pf-input" value={f.address} onChange={set("address")} placeholder="Used to pre-fill checkout" /></label>}
      <button className="pf-btn" onClick={() => { if (!f.name.trim()) return setMsg("Name can't be empty."); onSave({ ...f, name: f.name.trim() }); setMsg("Profile saved."); }}>Save changes</button>
      <h3 className="pf-sub">Change password</h3>
      <input className="pf-input" type="password" placeholder="Current password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
      <input className="pf-input" type="password" placeholder="New password (6+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
      <button className="pf-btn ghost" onClick={() => { const r = onPassword(pw.cur, pw.next); setMsg(r || "Password updated."); if (!r) setPw({ cur: "", next: "" }); }}>Update password</button>
      {msg && <div className="pf-msg">{msg}</div>}
    </div></div>
  );
}

function TopBar({ title, subtitle, onLogout, accent = C.pink, right }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title">
          <Logo small />
          <span className="topbar-divider" />
          <div>
            <div className="topbar-heading" style={{ color: accent }}>{title}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="topbar-actions">
          {right}
          <ViewMenu />
        </div>
      </div>
    </header>
  );
}

function RoleSelect({ onSelect, users }) {
  const roles = [
    { id: "customer", label: "Customer", short: "01", desc: "Browse the menu, build a basket and track delivery.", icon: UserRound, color: C.pink },
    { id: "staff", label: "Restaurant staff", short: "02", desc: "Manage the live queue and move orders through the kitchen.", icon: ChefHat, color: C.pink },
    { id: "admin", label: "Administrator", short: "03", desc: "Shape the menu, review orders and watch revenue.", icon: ShieldCheck, color: C.violet },
    { id: "delivery", label: "Delivery person", short: "04", desc: "Pick up ready orders and mark them delivered.", icon: Bike, color: C.pink },
  ];
  return (
    <main className="role-screen">
      <div className="noise" />
      <div className="orb orb-pink" /><div className="orb orb-teal" />
      <nav className="landing-nav"><Logo /><span className="eyebrow"><span className="live-dot" /> Offline-ready ordering</span><InstallButton compact /></nav>
      <section className="hero-block">
        <div className="hero-copy">
          <div className="eyebrow"><Zap size={13} /> STREET FOOD, REWIRED</div>
          <h1>Order from your<br /><span className="gradient-text">favourite kitchen.</span></h1>
          <p>Browse the menu, pay by card or cash, and follow your order from the restaurant to your door. Restaurant, rider and admin views are included.</p>
          <div className="location-search"><MapPin size={17} /><div><small>Delivering to</small><strong>Dhaka, Bangladesh</strong></div><button>Change</button></div>
          <div className="hero-meta"><span><Wifi size={14} /> Works offline</span><span><Timer size={14} /> 25–35 min delivery</span><span><Sparkles size={14} /> Card or cash</span></div>
        </div>
        <div className="role-panel">
          <div className="panel-kicker">Choose your view</div>
          <div className="role-list">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button key={role.id} className="role-card" disabled={users.find((u) => u.role === role.id)?.active === false} onClick={() => onSelect(role.id)} style={{ "--role-color": role.color }}>
                  <span className="role-number">{role.short}</span>
                  <span className="role-icon"><Icon size={20} /></span>
                  <span className="role-copy"><strong>{role.label}</strong><small>{users.find((u) => u.role === role.id)?.active === false ? "Suspended by admin" : role.desc}</small></span>
                  <span className="role-arrow">↗</span>
                </button>
              );
            })}
          </div>
          <div className="panel-foot"><QrCode size={16} /> Pick a role to continue</div>
        </div>
      </section>
      <footer className="landing-footer"><span>KASTBITE / 2026</span><span>Built for fast, friendly ordering</span></footer>
    </main>
  );
}

function SpiceLevel({ level }) {
  if (!level) return null;
  return <span className="spice" aria-label={`${level} spice level`}>{Array.from({ length: level }).map((_, i) => <Flame key={i} size={12} fill={C.pink} />)}</span>;
}

function CustomerApp({ deliveries, categories, user, menu, cart, setCart, orders, setOrders, setPayments, addLog, onLogout, setActiveOrderId }) {
  const [payMethod, setPayMethod] = useState("Card");
  const [screen, setScreen] = useState("menu");
  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [coords, setCoords] = useState(null);
  const [locMsg, setLocMsg] = useState("");
  function locate() {
    if (!navigator.geolocation) { setLocMsg("Location is not supported on this device. Type your address instead."); return; }
    setLocMsg("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) };
        setCoords(c); setAddress((cur) => cur || `Current location (${c.lat}, ${c.lng})`); setLocMsg("");
      },
      () => setLocMsg("Couldn't get your location. Allow location access or type your address."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [activeOrderId, setLocalActiveOrderId] = useState(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const cartItems = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...menu.find((item) => item.id === id), qty })).filter((item) => item.id), [cart, menu]);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const activeOrder = orders.find((order) => order.id === activeOrderId);
  const filteredMenu = menu.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.desc} ${item.tag}`.toLowerCase().includes(query.toLowerCase()));

  function changeQty(id, delta) { setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + delta) })); }
  function placeOrder() {
    if (!cartItems.length) return;
    const id = `#${String(Date.now()).slice(-4)}`;
    const newOrder = { id, userId: user?.id, customerName: customerName || "Guest", address: address || "No address provided", coords, items: cartItems.map(({ image, ...rest }) => rest), total, status: "Placed", placedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setOrders((current) => [newOrder, ...current]);
    setPayments((current) => [{ orderId: id, method: payMethod, amount: total, status: payMethod === "Card" ? "Confirmed" : "Pending (cash)" }, ...current]);
    addLog(`Order ${id} placed · ${money(total)} · ${payMethod === "Card" ? "payment gateway confirmed" : "cash on delivery"}`);
    setLocalActiveOrderId(id);
    setActiveOrderId(id);
    setCart({});
    setCartOpen(false);
    setScreen("tracking");
  }

  if (screen === "tracking" && activeOrder) return <OrderTracking delivery={deliveries.find((d) => d.orderId === activeOrder.id)} order={activeOrder} orders={orders} onBack={() => setScreen("menu")} onLogout={onLogout} />;
  if (screen === "checkout") return <Checkout coords={coords} locate={locate} locMsg={locMsg} payMethod={payMethod} setPayMethod={setPayMethod} cartItems={cartItems} total={total} customerName={customerName} setCustomerName={setCustomerName} address={address} setAddress={setAddress} onBack={() => setScreen("menu")} onPlace={placeOrder} />;

  return (
    <div className="app-shell">
      <TopBar title="Customer" subtitle="Delivering to Dhaka · now" onLogout={onLogout} right={<button className="cart-trigger" onClick={() => setCartOpen(true)}><ShoppingCart size={16} /> Cart {itemCount > 0 && <b>{itemCount}</b>}</button>} />
      <main className="content-wrap">
        {(() => { const live = orders.find((o) => !["Delivered", "Rejected"].includes(o.status)); return live && <button className="track-banner" onClick={() => { setLocalActiveOrderId(live.id); setScreen("tracking"); }}><span className="live-dot" /><span>Order {live.id} · {live.status}</span><b>Track order</b></button>; })()}
        <button className="loc-pill" onClick={locate}><MapPin size={15} /> {coords ? `Delivering to your GPS location (${coords.lat}, ${coords.lng})` : "Use my current location"}</button>{locMsg && <small className="loc-msg">{locMsg}</small>}
        <section className="promo-row"><div className="promo promo-brand"><strong>Hungry?<br />Fresh food in 25–35 min</strong><span>Pay by card or cash</span></div><div className="promo promo-dark"><strong>Order online,<br />track every step</strong><span>From kitchen to your door</span></div></section>
        <label className="menu-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes, cravings, or ingredients..." /><kbd>⌘ K</kbd></label>
        <div className="cat-row">{[["All", "🍽️"], ...categories.filter((c) => menu.some((m) => m.category === c.name)).map((c) => [c.name, c.emoji])].map(([cat, icon]) => <button key={cat} className={category === cat ? "cat active" : "cat"} onClick={() => setCategory(cat)}><span>{icon}</span>{cat}</button>)}</div>
        <h2 className="feed-title">{category === "All" ? "Popular right now" : category}</h2>
        <section className="menu-grid">
          {filteredMenu.map((item, index) => <MenuCard key={item.id} item={item} quantity={cart[item.id] || 0} onAdd={() => changeQty(item.id, 1)} onRemove={() => changeQty(item.id, -1)} index={index} />)}
        </section>
      </main>
      {itemCount > 0 && !cartOpen && <button className="basket-bar" onClick={() => setCartOpen(true)}><span className="basket-count">{itemCount}</span><span>View basket</span><b>{money(total)}</b></button>}
      {cartOpen && <CartDrawer items={cartItems} total={total} onChange={changeQty} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setScreen("checkout"); }} />}
    </div>
  );
}

function MenuCard({ item, quantity, onAdd, onRemove, index }) {
  return (
    <article className="menu-card" style={{ animationDelay: `${index * 45}ms` }}>
      <div className="menu-card-top">{item.image ? <img className="food-photo" src={item.image} alt={item.name} /> : <span className="food-emoji">{item.emoji}</span>}<span className="food-tag">{item.tag}</span></div>
      <div className="menu-card-body"><div className="food-category">{item.category} <SpiceLevel level={item.spice} /></div><h3>{item.name}</h3><p>{item.desc}</p></div>
      <div className="menu-card-bottom"><strong>{money(item.price)}</strong>{quantity ? <div className="stepper"><button onClick={onRemove} aria-label="Remove one"><span>−</span></button><b>{quantity}</b><button onClick={onAdd} aria-label="Add one"><Plus size={15} /></button></div> : <button className="add-dish" onClick={onAdd}><Plus size={15} /> Add</button>}</div>
    </article>
  );
}

function CartDrawer({ items, total, onChange, onClose, onCheckout }) {
  return <div className="drawer-backdrop" onMouseDown={onClose}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-head"><div><div className="eyebrow" style={{ color: C.pink }}>YOUR ORDER</div><h2>Your basket</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{!items.length ? <div className="empty-state"><ShoppingBag size={28} /><strong>Your basket is waiting.</strong><span>Add a dish or two and we’ll take it from here.</span></div> : <><div className="drawer-items">{items.map((item) => <div className="drawer-item" key={item.id}>{item.image ? <img className="mini-photo" src={item.image} alt="" /> : <span className="mini-emoji">{item.emoji}</span>}<div><strong>{item.name}</strong><small>{money(item.price)} each</small></div><div className="mini-stepper"><button onClick={() => onChange(item.id, -1)}>−</button><b>{item.qty}</b><button onClick={() => onChange(item.id, 1)}>+</button></div></div>)}</div><div className="drawer-total"><span>Total</span><strong>{money(total)}</strong></div><GlowButton onClick={onCheckout} className="full-button">Continue to checkout</GlowButton></>}</aside></div>;
}

function Checkout({ coords, locate, locMsg, payMethod, setPayMethod, cartItems, total, customerName, setCustomerName, address, setAddress, onBack, onPlace }) {
  const inputStyle = { background: C.surface, borderColor: C.border, color: C.text };
  return <div className="app-shell"><TopBar title="Checkout" subtitle="Almost there" onLogout={() => window.location.reload()} /><main className="checkout-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to menu</button><div className="checkout-grid"><section><div className="eyebrow" style={{ color: C.pink }}>FINAL CHECK</div><h1 className="page-title">Make it<br /><span className="gradient-text">yours.</span></h1><p className="checkout-intro">Tell us where to send the good stuff. Pay by card through the simulated payment gateway, or choose cash on delivery. No real payment is processed.</p><label>Your name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Aisha Rahman" style={inputStyle} /></label><label>Delivery address<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="e.g. 12 Lotus Street, Apt 4B" style={inputStyle} /></label><button type="button" className="loc-pill" onClick={locate}><MapPin size={15} /> {coords ? `GPS location saved (${coords.lat}, ${coords.lng})` : "Use my current location"}</button>{locMsg && <small className="loc-msg">{locMsg}</small>}{[["Card", "Card · payment gateway", "Simulated · confirmed instantly"], ["Cash", "Cash on delivery", "Pay the rider on arrival"]].map(([id, title, note]) => <button type="button" key={id} className="payment-note" onClick={() => setPayMethod(id)} style={{ width: "100%", textAlign: "left", borderColor: payMethod === id ? C.teal : undefined }}><span className="payment-icon">$</span><div><strong>{title}</strong><small>{note}</small></div>{payMethod === id && <Check size={16} style={{ color: C.teal, marginLeft: "auto" }} />}</button>)}<GlowButton onClick={onPlace} disabled={!cartItems.length} className="full-button">Place order · {money(total)}</GlowButton></section><aside className="order-summary"><div className="eyebrow" style={{ color: C.teal }}>ORDER SUMMARY</div><h2>In the bag</h2>{cartItems.map((item) => <div className="summary-line" key={item.id}><span>{item.qty} × {item.name}</span><strong>{money(item.price * item.qty)}</strong></div>)}<div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div></aside></div></main></div>;
}

const RESTO = { lat: 23.7925, lng: 90.4078 };
const DEFAULT_DEST = { lat: 23.7806, lng: 90.4193 };
function routeFor(order) {
  const dest = order.coords || DEFAULT_DEST;
  return { dest, from: order.coords ? { lat: dest.lat + 0.014, lng: dest.lng - 0.01 } : RESTO };
}
function km(a, b) {
  const rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
function LiveMap({ order, delivery }) {
  const r = delivery?.from ? { from: delivery.from, dest: delivery.dest } : routeFor(order);
  const W = 640, H = 340, pad = 70;
  const pos = delivery?.pos || (order.status === "Delivered" ? r.dest : null);
  const pts = [r.from, r.dest, ...(pos ? [pos] : [])];
  const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
  const k = Math.cos((r.dest.lat * Math.PI) / 180);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const w = Math.max((maxLng - minLng) * k, 1e-4), h = Math.max(maxLat - minLat, 1e-4);
  const s = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
  const ox = (W - w * s) / 2, oy = (H - h * s) / 2;
  const P = (p) => [ox + (p.lng - minLng) * k * s, oy + (maxLat - p.lat) * s];
  const [fx, fy] = P(r.from), [dx, dy] = P(r.dest), [px, py] = pos ? P(pos) : [fx, fy];
  const eta = Math.max(1, Math.round(km(pos || r.from, r.dest) / 0.3));
  const st = order.status, live = st === "Out for Delivery";
  const label = st === "Delivered" ? "Delivered. Enjoy your meal!" : live ? `${delivery?.rider || "Your rider"} is on the way · about ${eta} min away` : st === "Preparing" ? "The kitchen is preparing your food. A rider will pick it up soon." : "Waiting for the restaurant to accept your order.";
  return (
    <div className="live-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Live delivery map">
        <rect width={W} height={H} fill="#eef1ea" />
        <rect x="355" y="160" width="95" height="80" rx="10" fill="#d9ecd2" />
        <path d="M-10 285 C120 250 240 330 360 290 S560 250 650 285 L650 350 L-10 350Z" fill="#cfe3f3" />
        <g stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round"><path d="M90 0V340M200 0V340M330 0V340M450 0V340M560 0V340M0 70H640M0 150H640M0 240H640" /><path d="M0 330L300 0M340 340L640 60" strokeWidth="14" /></g>
        <line x1={fx} y1={fy} x2={dx} y2={dy} stroke="#b9bfc9" strokeWidth="4" strokeDasharray="7 7" strokeLinecap="round" />
        {pos && <line x1={fx} y1={fy} x2={px} y2={py} stroke="#e21b5c" strokeWidth="5" strokeLinecap="round" />}
        <g transform={`translate(${fx},${fy})`}><rect x="-17" y="-17" width="34" height="34" rx="9" fill="#0f1419" stroke="#fff" strokeWidth="3" /><text y="6" textAnchor="middle" fontSize="18">🍽️</text><text y="34" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f1419">Kitchen</text></g>
        <g transform={`translate(${dx},${dy})`}><circle r="17" fill="#fff" stroke="#e21b5c" strokeWidth="4" /><text y="6" textAnchor="middle" fontSize="17">🏠</text><text y="34" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f1419">You</text></g>
        {(live || st === "Delivered") && <g style={{ transform: `translate(${px}px, ${py}px)`, transition: "transform 2.4s linear" }}>
          <ellipse rx="16" ry="6" fill="#e21b5c" opacity=".25" className="map-pulse" />
          <path d="M0 0C-12 -16 -19 -24 -19 -34A19 19 0 1 1 19 -34C19 -24 12 -16 0 0Z" fill="#e21b5c" stroke="#fff" strokeWidth="3" />
          <circle cy="-34" r="12" fill="#fff" />
          <text y="-28.5" textAnchor="middle" fontSize="17" fontWeight="800" fill="#e21b5c" fontFamily="Bricolage Grotesque, Figtree, sans-serif">K</text>
        </g>}
      </svg>
      <div className="live-map-bar">{live && <span className="live-dot" />}<span>{label}</span></div>
    </div>
  );
}

function OrderTracking({ delivery, order, orders, onBack, onLogout }) {
  const current = Math.max(0, STATUS_FLOW.indexOf(order.status));
  return <div className="app-shell"><TopBar title="Order tracking" subtitle={`Order ${order.id} · placed ${order.placedAt}`} onLogout={onLogout} /><main className="tracking-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to menu</button><div className="tracking-hero"><div><div className="eyebrow" style={{ color: C.teal }}>ORDER {order.id}</div><h1 className="page-title">On its way<br /><span className="gradient-text">to you.</span></h1><p>We’re keeping an eye on it. Your order is currently <strong style={{ color: STATUS_COLOR[order.status] }}>{order.status.toLowerCase()}</strong>.</p></div><div className="tracking-orb"><Bike size={34} /><span>{order.status === "Out for Delivery" ? "On the way" : order.status === "Delivered" ? "Arrived" : "~ 25 min"}</span></div></div><LiveMap order={order} delivery={delivery} /><div className="timeline">{STATUS_FLOW.map((status, index) => { const Icon = STATUS_ICON[status]; const color = STATUS_COLOR[status]; const done = index <= current; return <div className={`timeline-item ${done ? "done" : ""}`} key={status}><div className="timeline-icon" style={done ? { background: `${color}20`, borderColor: color, color } : {}}><Icon size={18} /></div><div><strong>{status}</strong><small>{index === 0 ? "Order received" : index === 1 ? "The kitchen is on it" : index === 2 ? "Rider has picked it up" : "Enjoy every bite"}</small></div>{index < STATUS_FLOW.length - 1 && <span className="timeline-line" style={index < current ? { background: C.teal } : {}} />}</div>})}</div><div className="tracked-order"><div className="tracked-order-head"><div><div className="eyebrow" style={{ color: C.pink }}>DELIVERY DETAILS</div><h2>{order.customerName}</h2><p>{order.address}</p></div><StatusBadge status={order.status} /></div><div className="tracked-items">{order.items.map((item) => <span key={item.id}>{item.emoji} {item.qty} × {item.name}</span>)}</div><div className="tracked-total"><span>Total paid on delivery</span><strong>{money(order.total)}</strong></div></div>{orders.length > 1 && <div className="previous-orders"><h3>Recent orders</h3>{orders.slice(0, 4).map((recent) => <div key={recent.id}><span>{recent.id} · {recent.customerName}</span><StatusBadge status={recent.status} /></div>)}</div>}</main></div>;
}

function StaffApp({ orders, setOrders, setPayments, addLog, onLogout }) {
  function accept(id) { setOrders((c) => c.map((o) => o.id === id ? { ...o, status: "Preparing" } : o)); addLog(`Restaurant accepted order ${id}`); }
  function reject(id) { setOrders((c) => c.map((o) => o.id === id ? { ...o, status: "Rejected" } : o)); setPayments((c) => c.map((p) => p.orderId === id ? { ...p, status: p.method === "Card" ? "Refunded" : "Cancelled" } : p)); addLog(`Restaurant rejected order ${id}`); }
  return <div className="app-shell"><TopBar title="Kitchen console" subtitle="Live service queue" accent={C.teal} onLogout={onLogout} right={<div className="live-pill"><span className="live-dot" /> Live queue</div>} /><main className="content-wrap"><section className="staff-header"><div><div className="eyebrow" style={{ color: C.teal }}>STAFF / SERVICE</div><h1 className="page-title">Keep the line<br /><span style={{ color: C.teal }}>moving.</span></h1></div><div className="queue-stat"><span>Open tickets</span><strong>{orders.filter((order) => !["Delivered", "Rejected"].includes(order.status)).length.toString().padStart(2, "0")}</strong></div></section>{orders.length === 0 ? <div className="wide-empty"><ChefHat size={32} /><h2>Kitchen is quiet.</h2><p>New customer orders will appear here as soon as they land.</p></div> : <div className="order-queue">{orders.map((order) => <StaffOrderCard key={order.id} order={order} onAccept={() => accept(order.id)} onReject={() => reject(order.id)} />)}</div>}</main></div>;
}

function MapsLink({ coords }) {
  if (!coords) return null;
  return <> · <a href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noreferrer" style={{ color: "#e21b5c", fontWeight: 600 }}>Open in Maps</a></>;
}

function StaffOrderCard({ order, onAccept, onReject }) {
  const st = order.status; const closed = st === "Delivered" || st === "Rejected";
  return <article className={`staff-order ${closed ? "complete" : ""}`}><div className="staff-order-top"><div><span className="order-number">{order.id}</span><span className="order-time">Placed {order.placedAt}</span></div><StatusBadge status={st} /></div><div className="staff-order-main"><div><h3>{order.customerName}</h3><p>{order.address}<MapsLink coords={order.coords} /></p></div><strong>{money(order.total)}</strong></div><div className="staff-item-list">{order.items.map((item) => <span key={item.id}>{item.emoji} {item.qty} × {item.name}</span>)}</div>{st === "Placed" ? <div style={{ display: "flex", gap: 8 }}><button className="advance-button" onClick={onAccept}>Accept order <Check size={15} /></button><button className="advance-button" onClick={onReject}>Reject</button></div> : <button className="advance-button" disabled>{st === "Preparing" ? "Waiting for a rider" : st === "Out for Delivery" ? "With the rider" : st}</button>}</article>;
}

/* 1.4 Delivery management */
function DeliveryApp({ user, orders, setOrders, deliveries, setDeliveries, setPayments, addLog, onLogout }) {
  const rider = user?.name || "Rider";
  const [useGps, setUseGps] = useState(false);
  const [gpsMsg, setGpsMsg] = useState("");
  useEffect(() => {
    if (!useGps) return;
    if (!navigator.geolocation) { setGpsMsg("GPS isn't available on this device."); setUseGps(false); return; }
    const id = navigator.geolocation.watchPosition(
      (p) => { setGpsMsg("Sharing your live GPS with customers."); setDeliveries((c) => c.map((d) => d.status === "Out for Delivery" ? { ...d, pos: { lat: p.coords.latitude, lng: p.coords.longitude }, mode: "gps", updatedAt: Date.now() } : d)); },
      () => { setGpsMsg("Couldn't read GPS, so the route is simulated instead."); setUseGps(false); },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [useGps]);
  const ready = orders.filter((o) => o.status === "Preparing" && !deliveries.some((d) => d.orderId === o.id));
  const active = deliveries.filter((d) => d.status !== "Delivered");
  function take(o) { const rt = routeFor(o); setDeliveries((c) => [{ orderId: o.id, rider, address: o.address, coords: o.coords, status: "Out for Delivery", from: rt.from, dest: rt.dest, pos: rt.from, progress: 0, mode: "sim", updatedAt: Date.now() }, ...c]); setOrders((c) => c.map((x) => x.id === o.id ? { ...x, status: "Out for Delivery" } : x)); addLog(`${rider} took order ${o.id}`); }
  function done(id) { setDeliveries((c) => c.map((d) => d.orderId === id ? { ...d, status: "Delivered" } : d)); setOrders((c) => c.map((x) => x.id === id ? { ...x, status: "Delivered" } : x)); setPayments((c) => c.map((p) => p.orderId === id && p.method === "Cash" ? { ...p, status: "Collected" } : p)); addLog(`Order ${id} delivered by ${rider}`); }
  const row = (o, btn) => <article className="staff-order" key={o.id}><div className="staff-order-top"><span className="order-number">{o.id}</span></div><div className="staff-order-main"><div><h3>{o.customerName || "Customer"}</h3><p>{o.address}<MapsLink coords={o.coords} /></p></div></div>{btn}</article>;
  return <div className="app-shell"><TopBar title="Delivery console" subtitle="Pickups and drop-offs" accent={C.amber} onLogout={onLogout} /><main className="content-wrap"><section className="staff-header"><div><div className="eyebrow" style={{ color: C.amber }}>RIDER / ASSIGNMENTS</div><h1 className="page-title">Deliver it<br /><span style={{ color: C.amber }}>hot.</span></h1></div><div className="queue-stat"><span>On the road</span><strong>{String(active.length).padStart(2, "0")}</strong></div></section><button className="loc-pill" onClick={() => setUseGps((v) => !v)}><MapPin size={15} /> {useGps ? "Sharing live GPS (tap to stop)" : "Share my live GPS with customers"}</button>{gpsMsg && <small className="loc-msg">{gpsMsg}</small>}<div className="section-heading"><h2>Ready for pickup</h2><span>{ready.length}</span></div><div className="order-queue">{ready.length ? ready.map((o) => row(o, <button className="advance-button" onClick={() => take(o)}>Take this delivery <Bike size={15} /></button>)) : <div className="wide-empty compact-empty"><p>No orders are waiting for a rider.</p></div>}</div><div className="section-heading"><h2>My deliveries</h2><span>{active.length}</span></div><div className="order-queue">{active.length ? active.map((d) => row({ id: d.orderId, address: d.address, coords: d.coords }, <button className="advance-button" onClick={() => done(d.orderId)}>Mark delivered <Check size={15} /></button>)) : <div className="wide-empty compact-empty"><p>Nothing on the road right now.</p></div>}</div></main></div>;
}

/* 1.1 user management, reports and logs for the admin */
function AdminExtras({ users, setUsers, orders, payments, deliveries, logs, addLog }) {
  const [nu, setNu] = useState({ name: "", email: "", pw: "", role: "staff" });
  const [uq, setUq] = useState("");
  const [urole, setUrole] = useState("all");
  const [ustatus, setUstatus] = useState("all");
  const shown = users.filter((u) => (urole === "all" || u.role === urole) && (ustatus === "all" || (ustatus === "active") === u.active) && `${u.name} ${u.email}`.toLowerCase().includes(uq.trim().toLowerCase()));
  const [err, setErr] = useState("");
  function addAccount() {
    const email = nu.email.trim().toLowerCase();
    if (!nu.name.trim() || !email.includes("@") || nu.pw.length < 6) return setErr("Enter a name, a valid email and a password of 6+ characters.");
    if (users.some((u) => u.email === email)) return setErr("That email already has an account.");
    setUsers((c) => [...c, seed("u" + Date.now(), nu.name.trim(), email, nu.pw, nu.role)]);
    addLog(`Admin created a ${nu.role} account for ${nu.name.trim()}`); setNu({ name: "", email: "", pw: "", role: "staff" }); setErr("");
  }
  const received = payments.filter((p) => ["Confirmed", "Collected"].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
  const toggle = (u) => { setUsers((c) => c.map((x) => x.id === u.id ? { ...x, active: !x.active } : x)); addLog(`${u.name} ${u.active ? "suspended" : "reactivated"}`); };
  return <main className="content-wrap"><div className="metrics"><Metric label="Payments received" value={money(received)} color={C.teal} /><Metric label="Active deliveries" value={deliveries.filter((d) => d.status !== "Delivered").length} color={C.amber} /><Metric label="Rejected orders" value={orders.filter((o) => o.status === "Rejected").length} color={C.pink} /></div><section className="admin-section"><div className="section-heading"><div><div className="eyebrow" style={{ color: C.violet }}>USERS</div><h2>User management</h2></div><span>{shown.length} of {users.length} accounts</span></div><div className="acct-form"><input className="pf-input" placeholder="Full name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} /><input className="pf-input" placeholder="Email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} /><input className="pf-input" type="password" placeholder="Password" value={nu.pw} onChange={(e) => setNu({ ...nu, pw: e.target.value })} /><select className="pf-input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}><option value="staff">Restaurant staff</option><option value="delivery">Delivery person</option><option value="admin">Administrator</option></select><button className="pf-btn" onClick={addAccount}>Add account</button></div>{err && <div className="auth-error">{err}</div>}<div className="user-filters"><input className="pf-input" placeholder="Search by name or email" value={uq} onChange={(e) => setUq(e.target.value)} /><select className="pf-input" value={urole} onChange={(e) => setUrole(e.target.value)}><option value="all">All roles</option><option value="customer">Customers</option><option value="staff">Restaurant staff</option><option value="delivery">Delivery people</option><option value="admin">Administrators</option></select><select className="pf-input" value={ustatus} onChange={(e) => setUstatus(e.target.value)}><option value="all">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option></select></div>{shown.length === 0 && <p className="group-empty">No accounts match these filters.</p>}<div className="admin-menu-list">{shown.map((u) => <div className="admin-menu-row" key={u.id}><div className="admin-menu-copy"><strong>{u.name}</strong><small>{u.email} · {ROLE_LABEL[u.role]} · {u.active ? "Active" : "Suspended"}</small></div>{u.role !== "admin" && <button className="add-dish" onClick={() => toggle(u)}>{u.active ? "Suspend" : "Reactivate"}</button>}</div>)}</div></section><section className="admin-section"><div className="section-heading"><div><div className="eyebrow" style={{ color: C.violet }}>ACTIVITY</div><h2>Logs</h2></div><span>{logs.length} events</span></div>{logs.length ? <div className="admin-orders">{logs.slice(0, 10).map((l, i) => <div key={i}><span>{l.t} · {l.text}</span></div>)}</div> : <div className="wide-empty compact-empty"><p>Activity will be recorded here.</p></div>}</section></main>;
}

function AdminApp({ categories, setCategories, menu, setMenu, orders, extras, onLogout }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", category: categories[0]?.name || "", price: "", desc: "", emoji: "🍽️", image: "" });
  const [mq, setMq] = useState("");
  const [mcat, setMcat] = useState("All");
  const [showSec, setShowSec] = useState(false);
  const [sec, setSec] = useState({ name: "", emoji: "" });
  const [secErr, setSecErr] = useState("");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  function startAdd(cat) { setEditingId(null); setForm({ name: "", category: cat || categories[0]?.name || "", price: "", desc: "", emoji: "🍽️", image: "" }); setShowForm(true); }
  function startEdit(item) { setEditingId(item.id); setForm({ name: item.name, category: item.category, price: item.price, desc: item.desc, emoji: item.emoji, image: item.image || "" }); setShowForm(true); }
  function save() { if (!form.name || !form.price) return; if (editingId) setMenu((current) => current.map((item) => item.id === editingId ? { ...item, ...form, price: Number(form.price) } : item)); else setMenu((current) => [...current, { ...form, id: `m${Date.now()}`, price: Number(form.price), spice: 0, tag: "New on the menu" }]); setShowForm(false); }
  const groupNames = [...categories.map((c) => c.name), ...new Set(menu.map((m) => m.category).filter((n) => !categories.some((c) => c.name === n)))];
  const emojiOf = (n) => categories.find((c) => c.name === n)?.emoji || "🍴";
  const matches = (m) => `${m.name} ${m.desc}`.toLowerCase().includes(mq.trim().toLowerCase());
  function addSection() {
    const name = sec.name.trim();
    if (!name) return setSecErr("Give the section a name.");
    if (groupNames.some((n) => n.toLowerCase() === name.toLowerCase())) return setSecErr("That section already exists.");
    setCategories((c) => [...c, { name, emoji: sec.emoji.trim() || "🍴" }]); setSec({ name: "", emoji: "" }); setSecErr(""); setShowSec(false); setMcat(name);
  }
  function delSection(n) { setCategories((c) => c.filter((x) => x.name !== n)); if (mcat === n) setMcat("All"); }
  const dishRow = (item) => <div className="admin-menu-row" key={item.id}>{item.image ? <img className="admin-photo" src={item.image} alt="" /> : <span className="admin-emoji">{item.emoji}</span>}<div className="admin-menu-copy"><strong>{item.name}</strong><small>{item.desc}</small></div><strong className="admin-price">{money(item.price)}</strong><button className="icon-button" onClick={() => startEdit(item)} aria-label="Edit dish"><Pencil size={14} /></button><button className="icon-button danger" onClick={() => setMenu((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Delete dish"><Trash2 size={14} /></button></div>;
  const visible = groupNames.filter((n) => (mcat === "All" || mcat === n) && (mcat !== "All" || !mq.trim() || menu.some((m) => m.category === n && matches(m))));
  return <div className="app-shell"><TopBar title="Control room" subtitle="Menu & orders" accent={C.violet} onLogout={onLogout} /><main className="content-wrap"><section className="staff-header"><div><div className="eyebrow" style={{ color: C.violet }}>ADMIN / OVERVIEW</div><h1 className="page-title">Make it<br /><span style={{ color: C.violet }}>delicious.</span></h1></div><div className="admin-stamp"><ShieldCheck size={17} /><span>Admin mode</span></div></section><div className="metrics"><Metric label="Total orders" value={orders.length} color={C.pink} /><Metric label="Revenue" value={money(revenue)} color={C.amber} /><Metric label="Menu items" value={menu.length} color={C.teal} /></div><section className="admin-section"><div className="section-heading"><div><div className="eyebrow" style={{ color: C.violet }}>CATALOG</div><h2>Menu management</h2></div><div className="menu-head-actions"><span>{menu.length} dishes</span><button className="add-dish ghost" onClick={() => setShowSec((s) => !s)}><Plus size={15} /> Add section</button><button className="add-dish" onClick={() => startAdd()}><Plus size={15} /> Add new dish</button></div></div><input className="pf-input menu-search-admin" placeholder="Search dishes by name or description" value={mq} onChange={(e) => setMq(e.target.value)} /><div className="chip-row"><button className={mcat === "All" ? "chip active" : "chip"} onClick={() => setMcat("All")}>All <b>{menu.length}</b></button>{groupNames.map((n) => <button key={n} className={mcat === n ? "chip active" : "chip"} onClick={() => setMcat(n)}>{emojiOf(n)} {n} <b>{menu.filter((m) => m.category === n).length}</b></button>)}</div>{showSec && <div className="sec-form"><input className="pf-input" placeholder="New section name, e.g. Combos" value={sec.name} onChange={(e) => setSec({ ...sec, name: e.target.value })} /><input className="pf-input sec-emoji" placeholder="🍴" value={sec.emoji} onChange={(e) => setSec({ ...sec, emoji: e.target.value })} /><button className="pf-btn" onClick={addSection}>Create section</button></div>}{secErr && <div className="auth-error">{secErr}</div>}{visible.length ? visible.map((n) => { const items = menu.filter((m) => m.category === n && matches(m)); return <div className="menu-group" key={n}><div className="menu-group-head"><h3>{emojiOf(n)} {n}</h3><span>{items.length}</span><div className="menu-group-actions"><button className="link-btn" onClick={() => startAdd(n)}>+ Add dish</button>{!menu.some((m) => m.category === n) && <button className="link-btn danger" onClick={() => delSection(n)}>Delete section</button>}</div></div>{items.length ? <div className="admin-menu-list">{items.map(dishRow)}</div> : <p className="group-empty">{mq ? "No dishes match your search." : "No dishes in this section yet."}</p>}</div>; }) : <p className="group-empty">No dishes match your search.</p>}</section><section className="admin-section"><div className="section-heading"><div><div className="eyebrow" style={{ color: C.pink }}>SERVICE LOG</div><h2>All orders</h2></div><span>{orders.length ? "Latest first" : "No orders yet"}</span></div>{orders.length ? <div className="admin-orders">{orders.map((order) => <div key={order.id}><span>{order.id} · {order.customerName} · {money(order.total)}</span><StatusBadge status={order.status} /></div>)}</div> : <div className="wide-empty compact-empty"><ShoppingBag size={26} /><p>Orders will show up here after checkout.</p></div>}</section></main>{extras}{showForm && <MenuModal categoryNames={groupNames} form={form} setForm={setForm} editingId={editingId} onClose={() => setShowForm(false)} onSave={save} />}</div>;
}

function Metric({ label, value, color }) { return <div className="metric"><span>{label}</span><strong style={{ color }}>{value}</strong></div>; }
function readPhoto(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL("image/jpeg", 0.78));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function MenuModal({ categoryNames, form, setForm, editingId, onClose, onSave }) { return <div className="modal-backdrop"><div className="menu-modal"><div className="modal-heading"><div><div className="eyebrow" style={{ color: C.violet }}>MENU</div><h2>{editingId ? "Edit item" : "Add new dish"}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="modal-fields"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Mango sticky rice" /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categoryNames.map((category) => <option key={category}>{category}</option>)}</select></label><label>Price<input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label><label>Description<input value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} placeholder="A short description" /></label><div className="photo-row"><label>Emoji<input value={form.emoji} onChange={(event) => setForm({ ...form, emoji: event.target.value })} placeholder="🍽️" /></label><div className="photo-field"><span>Photo (optional)</span><div className="photo-pick">{form.image ? <img src={form.image} alt="Dish preview" /> : <span className="photo-empty">{form.emoji || "🍽️"}</span>}<label className="photo-btn">{form.image ? "Change" : "Upload photo"}<input type="file" accept="image/*" style={{ display: "none" }} onChange={(event) => { const f = event.target.files?.[0]; if (f) readPhoto(f, (data) => setForm((cur) => ({ ...cur, image: data }))); event.target.value = ""; }} /></label>{form.image && <button type="button" className="photo-remove" onClick={() => setForm({ ...form, image: "" })}>Remove</button>}</div></div></div></div><GlowButton color={C.violet} className="full-button" onClick={onSave}>Save dish <Check size={15} /></GlowButton></div></div>; }

export default function App() {
  const [view, setView] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [menu, setMenu] = useState(() => readStorage("kastbite-menu", INITIAL_MENU));
  const [orders, setOrders] = useState(() => readStorage("kastbite-orders", []));
  const [cart, setCart] = useState(() => readStorage("kastbite-cart", {}));
  const [users, setUsers] = useState(() => readStorage("kastbite-accounts-v2", INITIAL_USERS));
  const [categories, setCategories] = useState(() => readStorage("kastbite-categories", DEFAULT_CATEGORIES));
  useEffect(() => { localStorage.setItem("kastbite-categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => {
    const fresh = (d) => d.mode === "gps" && Date.now() - d.updatedAt < 8000;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setDeliveries((cur) => {
        if (!cur.some((d) => d.status === "Out for Delivery" && d.from && !fresh(d))) return cur;
        return cur.map((d) => {
          if (d.status !== "Out for Delivery" || !d.from || fresh(d)) return d;
          const progress = Math.min(0.97, (d.progress || 0) + 0.05);
          return { ...d, progress, mode: "sim", updatedAt: Date.now(), pos: { lat: d.from.lat + (d.dest.lat - d.from.lat) * progress, lng: d.from.lng + (d.dest.lng - d.from.lng) * progress } };
        });
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.newValue) return;
      try {
        const v = JSON.parse(e.newValue);
        if (e.key === "kastbite-deliveries") setDeliveries(v); else if (e.key === "kastbite-orders") setOrders(v); else if (e.key === "kastbite-payments") setPayments(v);
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [payments, setPayments] = useState(() => readStorage("kastbite-payments", []));
  const [deliveries, setDeliveries] = useState(() => readStorage("kastbite-deliveries", []));
  const [logs, setLogs] = useState(() => readStorage("kastbite-logs", []));
  const addLog = (text) => setLogs((c) => [{ t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text }, ...c].slice(0, 50));
  const [session, setSession] = useState(() => readStorage("kastbite-session", null));
  useEffect(() => { localStorage.setItem("kastbite-session", JSON.stringify(session)); }, [session]);
  const user = users.find((u) => u.id === session && u.active) || null;
  const role = user ? (user.role === "admin" && view) || user.role : null;
  function login(email, pw) {
    const u = users.find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.pw !== hashPw(pw, u.email)) return "Wrong email or password.";
    if (!u.active) return "This account is suspended. Please contact the admin.";
    setSession(u.id); setView(null); addLog(`${u.name} signed in`); return null;
  }
  function signup({ name, email, pw }) {
    const em = email.trim().toLowerCase();
    if (!name.trim() || !em.includes("@")) return "Enter your name and a valid email.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    if (users.some((x) => x.email === em)) return "That email already has an account.";
    const u = seed("u" + Date.now(), name.trim(), em, pw, "customer");
    setUsers((c) => [...c, u]); setSession(u.id); setView(null); addLog(`${u.name} created a customer account`); return null;
  }
  function signOut() { setSession(null); setView(null); setCart({}); setActiveOrderId(null); }
  function saveProfile(patch) { setUsers((c) => c.map((x) => x.id === user.id ? { ...x, ...patch } : x)); }
  function changePassword(cur, next) {
    if (user.pw !== hashPw(cur, user.email)) return "Current password is wrong.";
    if (next.length < 6) return "New password must be at least 6 characters.";
    setUsers((c) => c.map((x) => x.id === user.id ? { ...x, pw: hashPw(next, user.email) } : x)); addLog(`${user.name} changed their password`); return null;
  }
  const [activeOrderId, setActiveOrderId] = useState(null);
  const online = useOnlineStatus();

  useEffect(() => { try { localStorage.setItem("kastbite-menu", JSON.stringify(menu)); } catch { /* storage full: photos too large */ } }, [menu]);
  useEffect(() => { localStorage.setItem("kastbite-orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("kastbite-accounts-v2", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("kastbite-payments", JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem("kastbite-deliveries", JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem("kastbite-logs", JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem("kastbite-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);

  function switchRole(r) { if (r === role || user?.role !== "admin") return; setView(r); setActiveOrderId(null); addLog(`Admin switched to ${r} view`); }
  const logout = signOut;
  return <ViewCtx.Provider value={{ role, user, switchRole, openProfile: () => setShowProfile(true), signOut }}><div className="app-root"><div className="network-ribbon" style={{ color: online ? C.teal : C.amber }}><span className="network-dot" /> {online ? "Online · changes saved on this device" : "Offline mode · the UI still works"}</div>{!user && <AuthScreen onLogin={login} onSignup={signup} />}{role === "customer" && <CustomerApp deliveries={deliveries} categories={categories} user={user} setPayments={setPayments} addLog={addLog} menu={menu} cart={cart} setCart={setCart} orders={orders.filter((o) => o.userId === user.id)} setOrders={setOrders} setActiveOrderId={setActiveOrderId} onLogout={logout} />}{role === "staff" && <StaffApp setPayments={setPayments} addLog={addLog} orders={orders} setOrders={setOrders} onLogout={logout} />}{role === "delivery" && <DeliveryApp user={user} orders={orders} setOrders={setOrders} deliveries={deliveries} setDeliveries={setDeliveries} setPayments={setPayments} addLog={addLog} onLogout={logout} />}{role === "admin" && <AdminApp categories={categories} setCategories={setCategories} menu={menu} setMenu={setMenu} orders={orders} onLogout={logout} extras={<AdminExtras users={users} setUsers={setUsers} orders={orders} payments={payments} deliveries={deliveries} logs={logs} addLog={addLog} />} />}{showProfile && user && <ProfileModal user={user} onSave={saveProfile} onPassword={changePassword} onClose={() => setShowProfile(false)} />}</div></ViewCtx.Provider>;
}

export { C };
