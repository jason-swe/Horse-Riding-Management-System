import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Package, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { depositApi } from "../../api/depositApi.js";
import { walletApi } from "../../api/walletApi.js";
import { formatTokenAmount, formatTransactionDate, getWalletBalance } from "./walletFormatters.js";
import "./spectator.css";

const VALID_PAYMENT_METHODS = ["VNPAY", "MOMO"];
const CUSTOM_DEPOSIT_ENABLED = true;
const paymentMethods = (import.meta.env.VITE_PAYMENT_METHODS || "VNPAY,MOMO")
  .split(",")
  .map((method) => method.trim().toUpperCase())
  .filter((method) => VALID_PAYMENT_METHODS.includes(method));

const paymentMethodMeta = {
  VNPAY: {
    label: "VNPAY",
    title: "ATM / bank card",
    note: "Sandbox gateway return",
  },
  MOMO: {
    label: "MoMo",
    title: "MoMo wallet",
    note: "Sandbox wallet checkout",
  },
};

function formatVnd(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function getOrderDate(order) {
  return order?.created_at || order?.createdAt || order?.updated_at || order?.updatedAt;
}

function normalizePackages(payload) {
  return payload?.packages || [];
}

function normalizeOrders(payload) {
  return payload?.orders || payload?.history || [];
}

export default function Deposit() {
  const [walletState, setWalletState] = useState({ balance: null, isLoading: true, error: "" });
  const [packagesState, setPackagesState] = useState({ packages: [], isLoading: true, error: "" });
  const [historyState, setHistoryState] = useState({ orders: [], isLoading: true, error: "" });
  const [depositState, setDepositState] = useState({
    mode: "package",
    packageId: "",
    customTokenAmount: "75",
    paymentMethod: paymentMethods[0] || VALID_PAYMENT_METHODS[0],
    preview: null,
    isPreviewing: false,
    isSubmitting: false,
    message: "",
    error: "",
  });

  const selectedPackage = useMemo(
    () => packagesState.packages.find((item) => item.package_id === depositState.packageId) || null,
    [depositState.packageId, packagesState.packages]
  );
  const visiblePaymentMethods = paymentMethods.length ? paymentMethods : VALID_PAYMENT_METHODS;

  async function loadDepositData() {
    setWalletState((current) => ({ ...current, isLoading: true, error: "" }));
    setPackagesState((current) => ({ ...current, isLoading: true, error: "" }));
    setHistoryState((current) => ({ ...current, isLoading: true, error: "" }));

    try {
      const [walletPayload, packagesPayload, historyPayload] = await Promise.all([
        walletApi.getMyWallet(),
        depositApi.listPackages(),
        depositApi.getHistory({ page: 1, limit: 8 }),
      ]);
      const packages = normalizePackages(packagesPayload);

      setWalletState({ balance: getWalletBalance(walletPayload), isLoading: false, error: "" });
      setPackagesState({ packages, isLoading: false, error: "" });
      setHistoryState({ orders: normalizeOrders(historyPayload), isLoading: false, error: "" });
      setDepositState((current) => ({
        ...current,
        packageId: current.packageId || packages[0]?.package_id || "",
        paymentMethod: visiblePaymentMethods.includes(current.paymentMethod) ? current.paymentMethod : visiblePaymentMethods[0],
        error: "",
      }));
    } catch (error) {
      setWalletState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load wallet." }));
      setPackagesState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load deposit packages." }));
      setHistoryState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load deposit history." }));
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [walletPayload, packagesPayload, historyPayload] = await Promise.all([
          walletApi.getMyWallet(),
          depositApi.listPackages(),
          depositApi.getHistory({ page: 1, limit: 8 }),
        ]);
        if (cancelled) return;

        const packages = normalizePackages(packagesPayload);
        setWalletState({ balance: getWalletBalance(walletPayload), isLoading: false, error: "" });
        setPackagesState({ packages, isLoading: false, error: "" });
        setHistoryState({ orders: normalizeOrders(historyPayload), isLoading: false, error: "" });
        setDepositState((current) => ({
          ...current,
          packageId: current.packageId || packages[0]?.package_id || "",
          paymentMethod: visiblePaymentMethods.includes(current.paymentMethod) ? current.paymentMethod : visiblePaymentMethods[0],
        }));
      } catch (error) {
        if (cancelled) return;
        setWalletState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load wallet." }));
        setPackagesState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load deposit packages." }));
        setHistoryState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load deposit history." }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function previewCustomDeposit() {
    const tokenAmount = Number(depositState.customTokenAmount);

    if (!Number.isInteger(tokenAmount) || tokenAmount < 1) {
      setDepositState((current) => ({ ...current, preview: null, error: "Custom token amount must be a positive integer.", message: "" }));
      return;
    }

    setDepositState((current) => ({ ...current, isPreviewing: true, error: "", message: "" }));

    try {
      const preview = await depositApi.previewCustom(tokenAmount);
      setDepositState((current) => ({ ...current, preview, isPreviewing: false, error: "" }));
    } catch (error) {
      setDepositState((current) => ({ ...current, preview: null, isPreviewing: false, error: error.message || "Unable to preview custom deposit." }));
    }
  }

  async function handleCreateIntent(event) {
    event.preventDefault();

    const isCustom = CUSTOM_DEPOSIT_ENABLED && depositState.mode === "custom";
    const customTokenAmount = Number(depositState.customTokenAmount);

    if (!depositState.paymentMethod) {
      setDepositState((current) => ({ ...current, error: "Please choose a payment method.", message: "" }));
      return;
    }

    if (!isCustom && !depositState.packageId) {
      setDepositState((current) => ({ ...current, error: "Please choose a deposit package.", message: "" }));
      return;
    }

    if (isCustom && (!Number.isInteger(customTokenAmount) || customTokenAmount < 1)) {
      setDepositState((current) => ({ ...current, error: "Custom token amount must be a positive integer.", message: "" }));
      return;
    }

    const body = isCustom
      ? { custom_token_amount: customTokenAmount, payment_method: depositState.paymentMethod }
      : { package_id: depositState.packageId, payment_method: depositState.paymentMethod };

    setDepositState((current) => ({ ...current, isSubmitting: true, error: "", message: "" }));

    try {
      const payload = await depositApi.createPaymentIntent(body);
      setDepositState((current) => ({
        ...current,
        isSubmitting: false,
        message: `Order ${payload.order_id || payload.order?.order_id || ""} created. Redirecting to payment gateway...`,
        error: "",
      }));

      if (payload.payment_url) {
        window.location.assign(payload.payment_url);
        return;
      }

      await loadDepositData();
    } catch (error) {
      setDepositState((current) => ({
        ...current,
        isSubmitting: false,
        message: "",
        error: error.message || "Unable to create payment intent.",
      }));
    }
  }

  const customPreview = depositState.preview;
  const packagePreview = selectedPackage
    ? {
      total_vnd: selectedPackage.vnd_price,
      total_token: selectedPackage.total_token ?? Number(selectedPackage.token_received || 0) + Number(selectedPackage.bonus_token || 0),
      bonus_token: selectedPackage.bonus_token || 0,
    }
    : null;
  const activePreview = depositState.mode === "custom"
    ? {
      total_vnd: customPreview?.vnd_price ?? Number(depositState.customTokenAmount || 0) * 1000,
      total_token: customPreview?.token_amount ?? Number(depositState.customTokenAmount || 0),
      bonus_token: 0,
    }
    : packagePreview;

  return (
    <section className="spectator-page deposit-page">
      <Link className="tournament-detail-back" to="/spectator/profile"><ArrowLeft size={16} /> Back to profile</Link>

      <header className="deposit-hero">
        <div>
          <p className="spectator-eyebrow">Wallet top-up</p>
          <h1 className="spectator-title">Add TOKEN for race-day betting.</h1>
          <p className="spectator-copy">Pick a bonus package or enter an exact TOKEN amount, then continue through a supported payment gateway.</p>
          <div className="deposit-hero__signals" aria-label="Deposit support summary">
            <span><ShieldCheck size={15} aria-hidden="true" /> Secure gateway return</span>
            <span><CreditCard size={15} aria-hidden="true" /> VNPAY and MoMo only</span>
            <span><Package size={15} aria-hidden="true" /> Custom amount supported</span>
          </div>
        </div>
        <aside className="deposit-balance-card">
          <span><WalletCards size={16} /> Current balance</span>
          <strong>{walletState.isLoading ? "Loading..." : formatTokenAmount(walletState.balance)}</strong>
          <small>{walletState.error || "Wallet updates after a successful gateway callback"}</small>
        </aside>
      </header>

      <div className="deposit-layout deposit-layout--wide">
        <form className="deposit-form spectator-card" onSubmit={handleCreateIntent}>
          <div className="spectator-card__header">
            <div>
              <p className="spectator-eyebrow">Top-up order</p>
              <h2>Create top-up order</h2>
            </div>
            <span className="spectator-badge">1 TOKEN = 1,000 VND</span>
          </div>

          {CUSTOM_DEPOSIT_ENABLED && (
            <div className="deposit-mode-toggle" role="group" aria-label="Deposit mode">
              <button className={depositState.mode === "package" ? "is-active" : ""} type="button" onClick={() => setDepositState((current) => ({ ...current, mode: "package", error: "", message: "" }))}>Packages</button>
              <button className={depositState.mode === "custom" ? "is-active" : ""} type="button" onClick={() => setDepositState((current) => ({ ...current, mode: "custom", error: "", message: "" }))}>Exact amount</button>
            </div>
          )}

          {depositState.mode === "package" ? (
            <div className="deposit-package-grid" aria-label="Active deposit packages">
              {packagesState.isLoading && <div className="deposit-empty">Loading packages...</div>}
              {!packagesState.isLoading && packagesState.error && <div className="deposit-empty">{packagesState.error}</div>}
              {!packagesState.isLoading && !packagesState.error && !packagesState.packages.length && <div className="deposit-empty">No active packages are available.</div>}
              {packagesState.packages.map((item) => {
                const totalToken = item.total_token ?? Number(item.token_received || 0) + Number(item.bonus_token || 0);
                return (
                  <button
                    className={item.package_id === depositState.packageId ? "deposit-package is-selected" : "deposit-package"}
                    key={item._id || item.package_id}
                    type="button"
                    onClick={() => setDepositState((current) => ({ ...current, packageId: item.package_id, error: "", message: "" }))}
                  >
                    <span><Package size={15} /> {item.label || item.package_id}</span>
                    <strong>{formatVnd(item.vnd_price)}</strong>
                    <small>{formatTokenAmount(totalToken)}{item.bonus_token ? ` includes +${item.bonus_token} bonus` : ""}</small>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="deposit-custom-row">
              <label htmlFor="deposit-token-amount">
                <span>Token amount</span>
                <input
                  id="deposit-token-amount"
                  min="1"
                  step="1"
                  type="number"
                  value={depositState.customTokenAmount}
                  onChange={(event) => setDepositState((current) => ({ ...current, customTokenAmount: event.target.value, preview: null, error: "", message: "" }))}
                />
              </label>
              <button className="spectator-button spectator-button--secondary" disabled={depositState.isPreviewing} type="button" onClick={previewCustomDeposit}>
                {depositState.isPreviewing ? "Previewing..." : "Preview"}
              </button>
              <small className="deposit-custom-note">Custom top-ups use the standard rate and do not include package bonus tokens.</small>
            </div>
          )}

          <div className="deposit-payment-methods" aria-label="Payment method">
            <span className="deposit-field-label">Payment method</span>
            <div className="deposit-payment-method-grid">
              {visiblePaymentMethods.map((method) => {
                const meta = paymentMethodMeta[method] || { label: method, title: method, note: "Supported gateway" };
                const isSelected = depositState.paymentMethod === method;
                return (
                  <button
                    className={isSelected ? "deposit-payment-method is-selected" : "deposit-payment-method"}
                    key={method}
                    type="button"
                    onClick={() => setDepositState((current) => ({ ...current, paymentMethod: method, error: "", message: "" }))}
                    aria-pressed={isSelected}
                  >
                    <Landmark size={17} aria-hidden="true" />
                    <span>{meta.label}</span>
                    <strong>{meta.title}</strong>
                    <small>{meta.note}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="deposit-preview">
            <span>Order preview</span>
            <strong>{activePreview ? `${formatTokenAmount(activePreview.total_token)} / ${formatVnd(activePreview.total_vnd)}` : "Select a package"}</strong>
            {activePreview?.bonus_token > 0 && <small>Bonus +{activePreview.bonus_token} TOKEN</small>}
          </div>

          {(depositState.message || depositState.error) && (
            <div className={depositState.error ? "deposit-status is-error" : "deposit-status is-success"} role="status">
              {depositState.error || depositState.message}
            </div>
          )}

          <button className="spectator-button spectator-button--primary" disabled={depositState.isSubmitting || packagesState.isLoading} type="submit">
            <CreditCard size={17} /> {depositState.isSubmitting ? "Creating order..." : "Continue to payment"}
          </button>
        </form>

        <article className="spectator-card deposit-history-card">
          <div className="spectator-card__header">
            <div>
              <p className="spectator-eyebrow">Deposit orders</p>
              <h2>Recent top-ups</h2>
            </div>
            <button className="spectator-badge profile-refresh-button" disabled={historyState.isLoading} type="button" onClick={loadDepositData}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="profile-history deposit-history-list">
            {historyState.isLoading && <div className="deposit-history-row"><span>Loading</span><strong>Deposit history</strong><small>Fetching latest orders</small><b>--</b></div>}
            {!historyState.isLoading && historyState.error && <div className="deposit-history-row"><span>Error</span><strong>Unable to load deposits</strong><small>{historyState.error}</small><b>--</b></div>}
            {!historyState.isLoading && !historyState.error && !historyState.orders.length && <div className="deposit-history-row"><span>Empty</span><strong>No deposit orders yet</strong><small>Create a payment intent to start your first top-up.</small><b>0 TOKEN</b></div>}
            {!historyState.isLoading && !historyState.error && historyState.orders.map((order) => (
              <div className="deposit-history-row" key={order._id || order.order_id}>
                <span className="deposit-history-row__date">{formatTransactionDate(getOrderDate(order))}</span>
                <span className="deposit-history-row__main">
                  <strong>{order.package_id || "CUSTOM"} <CheckCircle2 size={14} aria-hidden="true" /></strong>
                  <small>{order.order_id || order.gateway_reference_id || order.note || "Deposit order"}</small>
                </span>
                <b className={order.status === "success" ? "profile-history__won deposit-history-row__amount" : "deposit-history-row__amount"}>{order.status} / {formatTokenAmount(order.total_token)}</b>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
