import React, { useState, useEffect, useMemo } from "react";

// ---------- Design tokens ----------
// Palette: ink navy surface, brass/gold accent (coin), sage (income), rust (expense)
const COLORS = {
  bg: "#14171F",
  surface: "#1C212D",
  surface2: "#232838",
  line: "#2C3244",
  text: "#EDEFF3",
  muted: "#8B93A7",
  faint: "#5C6479",
  brass: "#C9A227",
  brassSoft: "#E4C65A",
  sage: "#4E9B6E",
  rust: "#B5533F",
};

const FONT_DISPLAY = "'Fraunces', 'Georgia', serif";
const FONT_BODY = "'Inter', 'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

// ---------- Seed data ----------
const CATEGORIES = [
  { key: "food", label: "Еда", color: "#C9A227" },
  { key: "transport", label: "Транспорт", color: "#5C8DBF" },
  { key: "home", label: "Дом", color: "#4E9B6E" },
  { key: "fun", label: "Развлечения", color: "#B5533F" },
  { key: "health", label: "Здоровье", color: "#8A6FB5" },
  { key: "other", label: "Прочее", color: "#8B93A7" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const initialAccounts = [
  { id: "a1", name: "Основной", type: "Наличные", balance: 42500, color: "#C9A227" },
  { id: "a2", name: "Карта Optima", type: "Дебетовая карта", balance: 118300, color: "#5C8DBF" },
  { id: "a3", name: "Копилка", type: "Сбережения", balance: 65000, color: "#4E9B6E" },
];

const initialTransactions = [
  { id: "t1", accountId: "a2", type: "expense", category: "food", note: "Продукты, Народный", amount: 1200, date: daysAgo(0) },
  { id: "t2", accountId: "a1", type: "expense", category: "transport", note: "Такси", amount: 450, date: daysAgo(0) },
  { id: "t3", accountId: "a2", type: "income", category: "other", note: "Зарплата", amount: 85000, date: daysAgo(1) },
  { id: "t4", accountId: "a2", type: "expense", category: "home", note: "Коммуналка", amount: 5400, date: daysAgo(1) },
  { id: "t7", accountId: "a2", type: "expense", category: "food", note: "Кафе", amount: 850, date: daysAgo(1) },
  { id: "t5", accountId: "a1", type: "expense", category: "fun", note: "Кино", amount: 900, date: daysAgo(3) },
  { id: "t6", accountId: "a2", type: "expense", category: "health", note: "Аптека", amount: 1200, date: daysAgo(5) },
];

const initialBudgets = [
  { category: "food", limit: 20000 },
  { category: "transport", limit: 6000 },
  { category: "fun", limit: 8000 },
  { category: "home", limit: 12000 },
];

const initialGoals = [
  { id: "g1", name: "Ноутбук", target: 150000, saved: 65000 },
  { id: "g2", name: "Поездка в Ош", target: 40000, saved: 12000 },
];

function fmt(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

function catInfo(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

// ---------- Small UI pieces ----------
function Divider() {
  return <div style={{ height: 1, background: COLORS.line, width: "100%" }} />;
}

function Pill({ children, tone }) {
  const bg = tone === "income" ? "rgba(78,155,110,0.15)" : tone === "expense" ? "rgba(181,83,63,0.15)" : "rgba(139,147,167,0.15)";
  const color = tone === "income" ? COLORS.sage : tone === "expense" ? COLORS.rust : COLORS.muted;
  return (
    <span
      style={{
        background: bg,
        color,
        fontFamily: FONT_MONO,
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 999,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function WalletCard({ account, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="wallet-card"
      style={{
        cursor: "pointer",
        textAlign: "left",
        minWidth: 220,
        flex: "0 0 auto",
        border: `1px solid ${active ? account.color : COLORS.line}`,
        background: `linear-gradient(155deg, ${COLORS.surface2} 0%, ${COLORS.surface} 70%)`,
        borderRadius: 14,
        padding: "18px 18px 16px",
        position: "relative",
        overflow: "hidden",
        boxShadow: active ? `0 0 0 1px ${account.color}55, 0 8px 24px -12px ${account.color}66` : "none",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${account.color}33, transparent 70%)`,
        }}
      />
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, color: COLORS.faint, textTransform: "uppercase" }}>
        {account.type}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: COLORS.text, marginTop: 6 }}>
        {account.name}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: account.color, marginTop: 14, fontWeight: 600 }}>
        {fmt(account.balance)} <span style={{ fontSize: 13, color: COLORS.muted }}>сом</span>
      </div>
    </button>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const over = value > max;
  return (
    <div style={{ height: 6, borderRadius: 3, background: COLORS.line, width: "100%", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: over ? COLORS.rust : color,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function detectBrand(digits) {
  if (/^4/.test(digits)) return { name: "VISA", gradient: ["#1A3A6B", "#2B5CA8"] };
  if (/^(5[1-5]|2[2-7])/.test(digits)) return { name: "Mastercard", gradient: ["#5A2A1E", "#B5533F"] };
  if (/^2/.test(digits)) return { name: "МИР", gradient: ["#1F4A3D", "#4E9B6E"] };
  return { name: "Карта", gradient: ["#3A3320", "#C9A227"] };
}

function PaymentCardVisual({ card }) {
  const [g1, g2] = card.gradient;
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "20px 22px",
        minHeight: 150,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
        boxShadow: "0 14px 30px -16px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 85% -10%, rgba(255,255,255,0.14), transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 34,
            height: 24,
            borderRadius: 5,
            background: "linear-gradient(155deg, #E4C65A, #C9A227)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
          }}
        />
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: 0.5 }}>
          {card.brand}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 3, color: "rgba(255,255,255,0.95)", marginBottom: 12 }}>
          •••• •••• •••• {card.last4}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 }}>
            {card.holder || "Владелец карты"}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{card.expiry}</div>
        </div>
      </div>
    </div>
  );
}

function CreatePinScreen({ onCreate }) {
  const [stage, setStage] = useState("enter"); // enter | confirm
  const [first, setFirst] = useState("");
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  function press(digit) {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (stage === "enter") {
          setFirst(next);
          setStage("confirm");
          setEntered("");
        } else if (next === first) {
          onCreate(next);
        } else {
          setError(true);
          setEntered("");
          setStage("enter");
          setFirst("");
        }
      }, 120);
    }
  }

  function backspace() {
    setEntered((e) => e.slice(0, -1));
    setError(false);
  }

  const title = stage === "enter" ? "Придумайте пин-код" : "Повторите пин-код";

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_BODY,
        color: COLORS.text,
      }}
    >
      <style>{`@import url('${FONT_IMPORT_URL}');`}</style>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.brass, textTransform: "uppercase" }}>
        A.K.Wallet
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: "8px 0 6px" }}>{title}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.faint, marginBottom: 22 }}>
        {stage === "enter" ? "4 цифры для защиты кошелька" : "чтобы убедиться, что вы не ошиблись"}
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 30 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `1px solid ${error ? COLORS.rust : COLORS.brass}`,
              background: i < entered.length ? (error ? COLORS.rust : COLORS.brass) : "transparent",
              transition: "background 0.15s ease",
            }}
          />
        ))}
      </div>
      {error && (
        <div style={{ color: COLORS.rust, fontSize: 12, fontFamily: FONT_MONO, marginBottom: 14, marginTop: -18 }}>
          Пин-коды не совпали, попробуйте снова
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `1px solid ${COLORS.line}`,
              fontSize: 20,
              fontFamily: FONT_MONO,
              color: COLORS.text,
              cursor: "pointer",
              background: COLORS.surface,
            }}
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => press("0")}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: `1px solid ${COLORS.line}`,
            fontSize: 20,
            fontFamily: FONT_MONO,
            color: COLORS.text,
            cursor: "pointer",
            background: COLORS.surface,
          }}
        >
          0
        </button>
        <button
          onClick={backspace}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: `1px solid ${COLORS.line}`,
            fontSize: 14,
            color: COLORS.muted,
            cursor: "pointer",
            background: COLORS.surface,
          }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}

function PinScreen({ correctPin, onUnlock, onForgot }) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  function press(digit) {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setEntered("");
        }
      }, 120);
    }
  }

  function backspace() {
    setEntered((e) => e.slice(0, -1));
    setError(false);
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_BODY,
        color: COLORS.text,
      }}
    >
      <style>{`@import url('${FONT_IMPORT_URL}');`}</style>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.brass, textTransform: "uppercase" }}>
        A.K.Wallet
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: "8px 0 28px" }}>
        Введите пин-код
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 30 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `1px solid ${error ? COLORS.rust : COLORS.brass}`,
              background: i < entered.length ? (error ? COLORS.rust : COLORS.brass) : "transparent",
              transition: "background 0.15s ease",
            }}
          />
        ))}
      </div>
      {error && (
        <div style={{ color: COLORS.rust, fontSize: 12, fontFamily: FONT_MONO, marginBottom: 14, marginTop: -18 }}>
          Неверный пин-код
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `1px solid ${COLORS.line}`,
              fontSize: 20,
              fontFamily: FONT_MONO,
              color: COLORS.text,
              cursor: "pointer",
              background: COLORS.surface,
            }}
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => press("0")}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: `1px solid ${COLORS.line}`,
            fontSize: 20,
            fontFamily: FONT_MONO,
            color: COLORS.text,
            cursor: "pointer",
            background: COLORS.surface,
          }}
        >
          0
        </button>
        <button
          onClick={backspace}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: `1px solid ${COLORS.line}`,
            fontSize: 14,
            color: COLORS.muted,
            cursor: "pointer",
            background: COLORS.surface,
          }}
        >
          ⌫
        </button>
      </div>
      <div
        role="button"
        onClick={onForgot}
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, marginTop: 26, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        Забыли пин-код? Создать новый
      </div>
    </div>
  );
}

// ---------- Main App ----------
function WalletApp({ onLock, storageBroken }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets] = useState(initialBudgets);
  const [goals, setGoals] = useState(initialGoals);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [tab, setTab] = useState("ledger"); // ledger | budgets | goals
  const [form, setForm] = useState({
    type: "expense",
    accountId: initialAccounts[0].id,
    category: "food",
    note: "",
    amount: "",
  });
  const [transferForm, setTransferForm] = useState({ from: initialAccounts[0].id, to: initialAccounts[1].id, amount: "" });
  const [showTransfer, setShowTransfer] = useState(false);

  const [cards, setCards] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", holder: "", expiry: "" });
  const [cardError, setCardError] = useState("");
  const [cardJustAdded, setCardJustAdded] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("wallet-data", true);
        if (result && result.value) {
          const data = JSON.parse(result.value);
          if (data.accounts) setAccounts(data.accounts);
          if (data.transactions) setTransactions(data.transactions);
          if (data.cards) setCards(data.cards);
          if (data.goals) setGoals(data.goals);
        }
      } catch (err) {
        // Данных ещё нет — работаем с демо-набором до первого изменения.
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    try {
      await window.storage.set(
        "wallet-data",
        JSON.stringify({
          accounts: next.accounts ?? accounts,
          transactions: next.transactions ?? transactions,
          cards: next.cards ?? cards,
          goals: next.goals ?? goals,
        }),
        true
      );
      setSaveError(false);
    } catch (err) {
      setSaveError(true);
    }
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const filteredTx = useMemo(() => {
    const list = activeAccountId ? transactions.filter((t) => t.accountId === activeAccountId) : transactions;
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, activeAccountId]);

  const monthIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const spentByCategory = (cat) =>
    transactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0);

  const spentOnDate = (dateStr) =>
    transactions.filter((t) => t.type === "expense" && t.date === dateStr).reduce((s, t) => s + t.amount, 0);

  const todayStr = daysAgo(0);
  const yesterdayStr = daysAgo(1);
  const spentToday = spentOnDate(todayStr);
  const spentYesterday = spentOnDate(yesterdayStr);
  const diffPct = spentYesterday === 0 ? null : Math.round(((spentToday - spentYesterday) / spentYesterday) * 100);

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const idx = 6 - i;
      const dateStr = daysAgo(idx);
      return { date: dateStr, amount: spentOnDate(dateStr), isToday: idx === 0 };
    });
  }, [transactions]);
  const last7Max = Math.max(1, ...last7.map((d) => d.amount));

  const todayByCategory = CATEGORIES.map((c) => ({
    ...c,
    amount: transactions.filter((t) => t.type === "expense" && t.date === todayStr && t.category === c.key).reduce((s, t) => s + t.amount, 0),
  })).filter((c) => c.amount > 0);

  function addTransaction(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    const tx = {
      id: "t" + Date.now(),
      accountId: form.accountId,
      type: form.type,
      category: form.category,
      note: form.note || (form.type === "income" ? "Доход" : "Расход"),
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
    };
    const newTransactions = [tx, ...transactions];
    const newAccounts = accounts.map((a) =>
      a.id === form.accountId ? { ...a, balance: a.balance + (form.type === "income" ? amt : -amt) } : a
    );
    setTransactions(newTransactions);
    setAccounts(newAccounts);
    setForm({ ...form, note: "", amount: "" });
    persist({ accounts: newAccounts, transactions: newTransactions });
  }

  function doTransfer(e) {
    e.preventDefault();
    const amt = parseFloat(transferForm.amount);
    if (!amt || amt <= 0 || transferForm.from === transferForm.to) return;
    const newAccounts = accounts.map((a) => {
      if (a.id === transferForm.from) return { ...a, balance: a.balance - amt };
      if (a.id === transferForm.to) return { ...a, balance: a.balance + amt };
      return a;
    });
    const fromName = accounts.find((a) => a.id === transferForm.from)?.name;
    const toName = accounts.find((a) => a.id === transferForm.to)?.name;
    const newTransactions = [
      {
        id: "t" + Date.now(),
        accountId: transferForm.from,
        type: "expense",
        category: "other",
        note: `Перевод → ${toName}`,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        id: "t" + (Date.now() + 1),
        accountId: transferForm.to,
        type: "income",
        category: "other",
        note: `Перевод ← ${fromName}`,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
      },
      ...transactions,
    ];
    setAccounts(newAccounts);
    setTransactions(newTransactions);
    setTransferForm({ ...transferForm, amount: "" });
    setShowTransfer(false);
    persist({ accounts: newAccounts, transactions: newTransactions });
  }

  function addToGoal(id, amount) {
    const newGoals = goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
    setGoals(newGoals);
    persist({ goals: newGoals });
  }

  function formatCardNumber(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2);
  }

  function luhnValid(digits) {
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  function addCard(e) {
    e.preventDefault();
    const digits = cardForm.number.replace(/\D/g, "");
    if (digits.length < 16) {
      setCardError("Введите все 16 цифр номера карты");
      return;
    }
    if (!luhnValid(digits)) {
      setCardError("Похоже, номер карты введён с ошибкой");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
      setCardError("Укажите срок действия в формате ММ/ГГ");
      return;
    }
    const brand = detectBrand(digits);
    const newCard = {
      id: "c" + Date.now(),
      brand: brand.name,
      gradient: brand.gradient,
      last4: digits.slice(-4),
      holder: cardForm.holder.trim().toUpperCase(),
      expiry: cardForm.expiry,
    };
    // Полный номер карты нигде не сохраняется и не покидает эту функцию —
    // в состоянии и в хранилище остаются только последние 4 цифры.
    const newCards = [...cards, newCard];
    setCards(newCards);
    setCardForm({ number: "", holder: "", expiry: "" });
    setCardError("");
    setShowAddCard(false);
    setCardJustAdded(newCard.id);
    setTimeout(() => setCardJustAdded(null), 2000);
    persist({ cards: newCards });
  }

  function removeCard(id) {
    const newCards = cards.filter((c) => c.id !== id);
    setCards(newCards);
    persist({ cards: newCards });
  }

  if (dataLoading) {
    return <LoadingScreen label="Загружаем ваш кошелёк…" />;
  }

  return (
    <div
      style={{
        background: `radial-gradient(ellipse 900px 500px at 15% -10%, rgba(201,162,39,0.08), transparent 60%), radial-gradient(ellipse 700px 400px at 100% 0%, rgba(92,141,191,0.06), transparent 55%), ${COLORS.bg}`,
        minHeight: "100vh",
        fontFamily: FONT_BODY,
        color: COLORS.text,
      }}
    >
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        * { box-sizing: border-box; }
        input, select, button { font-family: ${FONT_BODY}; }
        input::placeholder { color: ${COLORS.faint}; }
        input, select {
          background: ${COLORS.surface2};
          border: 1px solid ${COLORS.line};
          color: ${COLORS.text};
          border-radius: 8px;
          padding: 9px 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input:focus, select:focus, button:focus-visible {
          border-color: ${COLORS.brass};
          box-shadow: 0 0 0 2px ${COLORS.brass}33;
        }
        button { border: none; background: none; color: inherit; }
        .scrollx::-webkit-scrollbar { height: 6px; }
        .scrollx::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 3px; }
        .wallet-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .wallet-card:hover { transform: translateY(-4px); }
        .tab-btn { transition: color 0.15s ease, border-color 0.15s ease; position: relative; }
        .tab-btn:hover { color: ${COLORS.brassSoft}; }
        .add-card-tile { transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease; }
        .add-card-tile:hover { border-color: ${COLORS.brass}; color: ${COLORS.brassSoft}; background: ${COLORS.surface}; }
        .primary-btn { transition: filter 0.15s ease, transform 0.1s ease; }
        .primary-btn:hover { filter: brightness(1.08); }
        .primary-btn:active { transform: scale(0.98); }
        @keyframes cardPop {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          60% { transform: scale(1.02) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); }
        }
        .card-pop { animation: cardPop 0.4s cubic-bezier(.2,.8,.3,1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.brass, textTransform: "uppercase" }}>
              Гроссбух №1
            </div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, margin: "4px 0 0" }}>A.K.Wallet</h1>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                Итого по счетам
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 600, color: COLORS.brassSoft }}>
                {fmt(totalBalance)} <span style={{ fontSize: 15, color: COLORS.muted }}>сом</span>
              </div>
            </div>
            <button
              onClick={onLock}
              title="Заблокировать"
              style={{
                border: `1px solid ${COLORS.line}`,
                borderRadius: 8,
                width: 36,
                height: 36,
                color: COLORS.muted,
                cursor: "pointer",
                fontSize: 15,
                marginTop: 2,
              }}
            >
              🔒
            </button>
          </div>
        </div>
        {(saveError || storageBroken) && (
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: COLORS.rust,
              marginTop: -18,
              marginBottom: 18,
            }}
          >
            Не удалось сохранить данные на устройство — изменения видны только в этой сессии
          </div>
        )}
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: COLORS.brassSoft,
            background: "rgba(201,162,39,0.08)",
            border: `1px solid ${COLORS.brass}44`,
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 20,
          }}
        >
          👪 Общий доступ: все, у кого есть ссылка на это приложение, видят и могут менять эти данные
        </div>

        {/* Wallet cards */}
        <div className="scrollx" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
          <WalletCard
            account={{ id: null, name: "Все счета", type: "Свод", balance: totalBalance, color: COLORS.brass }}
            active={activeAccountId === null}
            onClick={() => setActiveAccountId(null)}
          />
          {accounts.map((a) => (
            <WalletCard key={a.id} account={a} active={activeAccountId === a.id} onClick={() => setActiveAccountId(a.id)} />
          ))}
        </div>

        {/* Income / expense summary strip */}
        <div style={{ display: "flex", gap: 24, margin: "26px 0", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>Доходы</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.sage, fontWeight: 600 }}>+{fmt(monthIncome)}</div>
          </div>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>Расходы</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.rust, fontWeight: 600 }}>−{fmt(monthExpense)}</div>
          </div>
          <button
            onClick={() => setShowTransfer((v) => !v)}
            style={{
              marginLeft: "auto",
              alignSelf: "flex-end",
              border: `1px solid ${COLORS.line}`,
              borderRadius: 8,
              padding: "9px 14px",
              fontSize: 13,
              color: COLORS.text,
              cursor: "pointer",
            }}
          >
            {showTransfer ? "Отменить перевод" : "↔ Перевод между счетами"}
          </button>
        </div>

        {showTransfer && (
          <form
            onSubmit={doTransfer}
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              background: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 10,
              padding: 14,
              marginBottom: 22,
            }}
          >
            <select value={transferForm.from} onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <span style={{ color: COLORS.muted }}>→</span>
            <select value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Сумма"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              style={{ width: 120 }}
            />
            <button
              type="submit"
              style={{ background: COLORS.brass, color: "#14171F", borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer" }}
            >
              Перевести
            </button>
          </form>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${COLORS.line}`, marginBottom: 20 }}>
          {[
            ["ledger", "Записи"],
            ["cards", "Карты"],
            ["analytics", "Аналитика"],
            ["budgets", "Бюджеты"],
            ["goals", "Цели"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="tab-btn"
              style={{
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: tab === key ? COLORS.brassSoft : COLORS.muted,
                borderBottom: `2px solid ${tab === key ? COLORS.brass : "transparent"}`,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LEDGER TAB */}
        {tab === "ledger" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, textTransform: "uppercase", marginBottom: 10 }}>
                {activeAccountId ? accounts.find((a) => a.id === activeAccountId)?.name : "Все операции"} · {filteredTx.length}
              </div>
              <Divider />
              {filteredTx.length === 0 && (
                <div style={{ padding: "24px 0", color: COLORS.faint, fontSize: 14 }}>Записей пока нет — добавьте первую справа.</div>
              )}
              {filteredTx.map((t) => {
                const c = catInfo(t.category);
                return (
                  <div key={t.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flex: "0 0 auto" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: COLORS.text }}>{t.note}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, marginTop: 2 }}>
                          {t.date} · {c.label}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 15,
                          fontWeight: 600,
                          color: t.type === "income" ? COLORS.sage : COLORS.rust,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                      </div>
                    </div>
                    <Divider />
                  </div>
                );
              })}
            </div>

            {/* Add transaction form */}
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, textTransform: "uppercase", marginBottom: 10 }}>
                Новая запись
              </div>
              <form
                onSubmit={addTransaction}
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {["expense", "income"].map((ty) => (
                    <button
                      type="button"
                      key={ty}
                      onClick={() => setForm({ ...form, type: ty })}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 8,
                        border: `1px solid ${form.type === ty ? (ty === "income" ? COLORS.sage : COLORS.rust) : COLORS.line}`,
                        color: form.type === ty ? (ty === "income" ? COLORS.sage : COLORS.rust) : COLORS.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {ty === "income" ? "Доход" : "Расход"}
                    </button>
                  ))}
                </div>

                <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                {form.type === "expense" && (
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="Заметка (необязательно)"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Сумма, сом"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    background: COLORS.brass,
                    color: "#14171F",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Добавить запись
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CARDS TAB */}
        {tab === "cards" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: COLORS.faint,
                marginBottom: 16,
              }}
            >
              🔒 Номер карты и CVV нигде не сохраняются — в приложении остаются только последние 4 цифры
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginBottom: 22 }}>
              {cards.map((c) => (
                <div key={c.id} style={{ position: "relative" }} className={cardJustAdded === c.id ? "card-pop" : ""}>
                  <PaymentCardVisual card={c} />
                  <button
                    onClick={() => removeCard(c.id)}
                    title="Удалить карту"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.35)",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAddCard((v) => !v)}
                className="add-card-tile"
                style={{
                  minHeight: 150,
                  borderRadius: 16,
                  border: `1px dashed ${COLORS.line}`,
                  color: COLORS.muted,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 22, color: COLORS.brass }}>+</span>
                Добавить карту
              </button>
            </div>

            {showAddCard && (
              <form
                onSubmit={addCard}
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 12,
                  padding: 20,
                  maxWidth: 420,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600 }}>Новая карта</div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                  style={{ fontFamily: FONT_MONO, letterSpacing: 1 }}
                  maxLength={19}
                  autoComplete="off"
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Имя владельца"
                    value={cardForm.holder}
                    onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })}
                    style={{ flex: 1 }}
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                    style={{ width: 90, fontFamily: FONT_MONO }}
                    maxLength={5}
                    autoComplete="off"
                  />
                </div>
                {cardError && (
                  <div style={{ color: COLORS.rust, fontSize: 12, fontFamily: FONT_MONO }}>{cardError}</div>
                )}
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, lineHeight: 1.5 }}>
                  CVV не запрашивается и не хранится. Полный номер используется только для проверки и сразу заменяется маской.
                </div>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    background: COLORS.brass,
                    color: "#14171F",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Сохранить карту
                </button>
              </form>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>Потрачено сегодня</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 600, color: COLORS.rust, marginTop: 6 }}>
                  {fmt(spentToday)} <span style={{ fontSize: 13, color: COLORS.muted }}>сом</span>
                </div>
                {diffPct !== null && (
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: diffPct > 0 ? COLORS.rust : COLORS.sage, marginTop: 6 }}>
                    {diffPct > 0 ? "▲" : "▼"} {Math.abs(diffPct)}% к вчера
                  </div>
                )}
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>Потрачено вчера</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 600, color: COLORS.text, marginTop: 6 }}>
                  {fmt(spentYesterday)} <span style={{ fontSize: 13, color: COLORS.muted }}>сом</span>
                </div>
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>За 7 дней</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 600, color: COLORS.brassSoft, marginTop: 6 }}>
                  {fmt(last7.reduce((s, d) => s + d.amount, 0))} <span style={{ fontSize: 13, color: COLORS.muted }}>сом</span>
                </div>
              </div>
            </div>

            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, textTransform: "uppercase", marginBottom: 12 }}>
              Расходы по дням
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, marginBottom: 30, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "16px 16px 10px" }}>
              {last7.map((d) => (
                <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLORS.muted }}>{d.amount > 0 ? fmt(d.amount) : ""}</div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 30,
                      height: `${Math.max(3, (d.amount / last7Max) * 90)}px`,
                      background: d.isToday ? COLORS.brass : COLORS.line,
                      borderRadius: 4,
                      transition: "height 0.3s ease",
                    }}
                  />
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: d.isToday ? COLORS.brassSoft : COLORS.faint }}>
                    {d.isToday ? "сег." : new Date(d.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, textTransform: "uppercase", marginBottom: 12 }}>
              Категории сегодня
            </div>
            {todayByCategory.length === 0 ? (
              <div style={{ color: COLORS.faint, fontSize: 14 }}>Сегодня расходов ещё не было.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {todayByCategory.map((c) => (
                  <div key={c.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{c.label}</span>
                      <span style={{ fontFamily: FONT_MONO, color: COLORS.muted }}>{fmt(c.amount)}</span>
                    </div>
                    <ProgressBar value={c.amount} max={Math.max(...todayByCategory.map((x) => x.amount))} color={c.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUDGETS TAB */}
        {tab === "budgets" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {budgets.map((b) => {
              const c = catInfo(b.category);
              const spent = spentByCategory(b.category);
              return (
                <div key={b.category} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    <Pill tone={spent > b.limit ? "expense" : "neutral"}>
                      {fmt(spent)} / {fmt(b.limit)}
                    </Pill>
                  </div>
                  <ProgressBar value={spent} max={b.limit} color={c.color} />
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.faint, marginTop: 8 }}>
                    {spent > b.limit ? `Превышение на ${fmt(spent - b.limit)} сом` : `Остаток ${fmt(b.limit - spent)} сом`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* GOALS TAB */}
        {tab === "goals" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {goals.map((g) => {
              const pct = Math.min(100, (g.saved / g.target) * 100);
              return (
                <div key={g.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600 }}>{g.name}</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.brassSoft }}>{pct.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={g.saved} max={g.target} color={COLORS.brass} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.muted }}>
                      {fmt(g.saved)} / {fmt(g.target)} сом
                    </span>
                    <button
                      onClick={() => addToGoal(g.id, 5000)}
                      style={{
                        border: `1px solid ${COLORS.brass}`,
                        color: COLORS.brassSoft,
                        borderRadius: 6,
                        padding: "5px 10px",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      +5 000
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingScreen({ label }) {
  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_BODY,
        color: COLORS.muted,
        gap: 12,
      }}
    >
      <style>{`@import url('${FONT_IMPORT_URL}');`}</style>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `2px solid ${COLORS.line}`,
          borderTopColor: COLORS.brass,
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [savedPin, setSavedPin] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [storageBroken, setStorageBroken] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("wallet-pin", true);
        if (result && result.value) {
          setSavedPin(result.value);
        }
      } catch (err) {
        // Ключ ещё не создан — это нормально при первом запуске.
      } finally {
        setCheckingStorage(false);
      }
    })();
  }, []);

  async function handleCreatePin(pin) {
    try {
      await window.storage.set("wallet-pin", pin, true);
    } catch (err) {
      setStorageBroken(true);
    }
    setSavedPin(pin);
    setUnlocked(true);
  }

  async function handleForgotPin() {
    try {
      await window.storage.delete("wallet-pin", true);
    } catch (err) {
      // ключа могло уже не быть
    }
    setSavedPin(null);
    setUnlocked(false);
  }

  if (checkingStorage) {
    return <LoadingScreen label="Проверяем сохранённые данные…" />;
  }

  if (!savedPin) {
    return <CreatePinScreen onCreate={handleCreatePin} />;
  }
  if (!unlocked) {
    return <PinScreen correctPin={savedPin} onUnlock={() => setUnlocked(true)} onForgot={handleForgotPin} />;
  }
  return <WalletApp onLock={() => setUnlocked(false)} storageBroken={storageBroken} />;
}
