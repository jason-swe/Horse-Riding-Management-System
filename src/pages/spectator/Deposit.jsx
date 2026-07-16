import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, History, Landmark, Package, RefreshCw, ShieldCheck, Target, Trophy, WalletCards } from "lucide-react";
import { betApi } from "../../api/betApi.js";
import { depositApi } from "../../api/depositApi.js";
import { walletApi } from "../../api/walletApi.js";
import { formatTokenAmount, formatTransactionAmount, formatTransactionDate, getWalletBalance, transactionLabel } from "./walletFormatters.js";
import { useSpectatorRaceResults } from "./useSpectatorData.js";
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
  },
  MOMO: {
    label: "MoMo",
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

function normalizeTransactions(payload) {
  return payload?.transactions || payload?.history || [];
}

function normalizePredictions(payload) {
  return Array.isArray(payload) ? payload : Array.isArray(payload?.bets) ? payload.bets : [];
}

function getEntityName(value, fallback = "") {
  if (!value || typeof value === "string") return fallback;
  return value.name || value.full_name || fallback;
}

function formatPredictionStatus(value) {
  const normalized = String(value || "pending").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeActivityTone(status, fallbackTone = "pending", transactionType = "") {
  const normalized = String(status || "").toLowerCase();
  const type = String(transactionType || "").toLowerCase();

  if (type.includes("redemption") || type.includes("redeem") || type.includes("reward")) return "lost";
  if (["success", "completed", "complete", "published", "won", "settled"].includes(normalized)) return "success";
  if (["lost", "failed", "failure", "cancelled", "canceled", "rejected", "expired"].includes(normalized)) return "lost";
  if (fallbackTone === "won") return "success";
  if (fallbackTone === "lost") return "lost";
  return "pending";
}

function formatActivityStatus(value) {
  const normalized = String(value || "pending").toLowerCase();
  if (normalized === "success") return "Success";
  if (normalized === "completed" || normalized === "complete") return "Completed";
  if (normalized === "published") return "Published";
  if (normalized === "won") return "Won";
  if (normalized === "lost") return "Lost";
  if (normalized === "failed" || normalized === "failure") return "Failed";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function toPredictionHistoryRow(prediction) {
  const status = String(prediction?.status || "pending").toLowerCase();
  const raceName = getEntityName(prediction?.race_id, "Race");
  const horseName =
    prediction?.odds_snapshot?.horse_name ||
    getEntityName(prediction?.predicted_horse_id, "Selected runner");
  const currency =
    prediction?.odds_snapshot?.currency ||
    prediction?.race_id?.betting_market?.currency ||
    "TOKEN";
  const payoutAmount = Number(prediction?.payout_amount ?? 0);
  const potentialPayout = Number(prediction?.potential_payout ?? 0);

  return {
    id: prediction?._id || prediction?.id,
    kind: "prediction",
    date: prediction?.settled_at || prediction?.submitted_at,
    title: `${formatPredictionStatus(status)} prediction`,
    detail: `${raceName} / ${horseName}`,
    amount: status === "won" ? payoutAmount : Number(prediction?.stake_amount ?? 0),
    amountLabel: status === "won" ? `+${formatTokenAmount(payoutAmount).replace(" TOKEN", ` ${currency}`)}` : formatTokenAmount(Number(prediction?.stake_amount ?? 0)).replace(" TOKEN", ` ${currency}`),
    status,
    tone: normalizeActivityTone(status, status === "won" ? "won" : status === "lost" ? "lost" : "pending"),
    meta: status === "won" ? "Prediction payout" : potentialPayout ? `Potential ${formatTokenAmount(potentialPayout).replace(" TOKEN", ` ${currency}`)}` : "Prediction receipt",
  };
}

export default function Deposit() {
  const { error: resultsError, isLoading: resultsLoading, reload: reloadResults, results: raceResults } = useSpectatorRaceResults();
  const [walletState, setWalletState] = useState({ balance: null, isLoading: true, error: "" });
  const [packagesState, setPackagesState] = useState({ packages: [], isLoading: true, error: "" });
  const [historyState, setHistoryState] = useState({ orders: [], isLoading: true, error: "" });
  const [activityState, setActivityState] = useState({ transactions: [], predictions: [], isLoading: true, error: "" });
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
    setActivityState((current) => ({ ...current, isLoading: true, error: "" }));

    try {
      const [walletPayload, packagesPayload, historyPayload, transactionsPayload, predictionsPayload] = await Promise.all([
        walletApi.getMyWallet(),
        depositApi.listPackages(),
        depositApi.getHistory({ page: 1, limit: 8 }),
        walletApi.getTransactions({ page: 1, limit: 12 }),
        betApi.getMyBets({ page: 1, limit: 12 }),
      ]);
      const packages = normalizePackages(packagesPayload);

      setWalletState({ balance: getWalletBalance(walletPayload), isLoading: false, error: "" });
      setPackagesState({ packages, isLoading: false, error: "" });
      setHistoryState({ orders: normalizeOrders(historyPayload), isLoading: false, error: "" });
      setActivityState({
        transactions: normalizeTransactions(transactionsPayload),
        predictions: normalizePredictions(predictionsPayload).map(toPredictionHistoryRow),
        isLoading: false,
        error: "",
      });
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
      setActivityState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load account activity." }));
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [walletPayload, packagesPayload, historyPayload, transactionsPayload, predictionsPayload] = await Promise.all([
          walletApi.getMyWallet(),
          depositApi.listPackages(),
          depositApi.getHistory({ page: 1, limit: 8 }),
          walletApi.getTransactions({ page: 1, limit: 12 }),
          betApi.getMyBets({ page: 1, limit: 12 }),
        ]);
        if (cancelled) return;

        const packages = normalizePackages(packagesPayload);
        setWalletState({ balance: getWalletBalance(walletPayload), isLoading: false, error: "" });
        setPackagesState({ packages, isLoading: false, error: "" });
        setHistoryState({ orders: normalizeOrders(historyPayload), isLoading: false, error: "" });
        setActivityState({
          transactions: normalizeTransactions(transactionsPayload),
          predictions: normalizePredictions(predictionsPayload).map(toPredictionHistoryRow),
          isLoading: false,
          error: "",
        });
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
        setActivityState((current) => ({ ...current, isLoading: false, error: error.message || "Unable to load account activity." }));
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
  const latestWinner = raceResults.find((result) => Number(result.position) === 1) || null;
  const activityRows = useMemo(() => {
    const depositRows = historyState.orders.map((order) => ({
      id: order._id || order.order_id,
      kind: "deposit",
      date: getOrderDate(order),
      title: order.package_id || "Custom deposit",
      detail: order.note || "Top-up order",
      amountLabel: formatTokenAmount(order.total_token),
      status: order.status || "pending",
      tone: normalizeActivityTone(order.status),
      meta: "Top-up order",
    }));

    const transactionRows = activityState.transactions.map((transaction) => ({
      id: transaction._id || transaction.reference_id || `${transaction.transaction_type}-${transaction.created_at}`,
      kind: "wallet",
      date: transaction.created_at,
      title: transactionLabel(transaction.transaction_type),
      detail: transaction.note || "Wallet movement",
      amountLabel: formatTransactionAmount(transaction),
      status: transaction.status || "completed",
      tone: normalizeActivityTone(
        transaction.status,
        transaction.direction === "credit" ? "won" : transaction.direction === "debit" ? "lost" : "pending",
        transaction.transaction_type
      ),
      meta: transaction.direction === "credit" ? "Credit" : "Debit",
    }));

    const winnerRows = raceResults
      .filter((result) => Number(result.position) === 1)
      .slice(0, 6)
      .map((result) => ({
        id: result.id || `${result.race}-${result.horse}-${result.publishedAt}`,
        kind: "race-win",
        date: result.publishedAt,
        title: "Race winner",
        detail: `${result.horse} / ${result.race}`,
        amountLabel: result.score === "-" ? "Published" : `${result.score} pts`,
        status: "published",
        tone: "success",
        meta: `Lane ${result.lane} / ${result.time}`,
      }));

    return [...depositRows, ...transactionRows, ...activityState.predictions, ...winnerRows]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 18);
  }, [activityState.predictions, activityState.transactions, historyState.orders, raceResults]);

  return (
    <section className="spectator-page deposit-page">
      <Link className="tournament-detail-back" to="/spectator/profile"><ArrowLeft size={16} /> Back to profile</Link>

      <header className="deposit-hero">
        <div>
          <p className="spectator-eyebrow">Wallet command</p>
          <h1 className="spectator-title">Deposit</h1>
          <p className="spectator-copy">Top up TOKEN, review wallet movement, track prediction receipts, and follow published race wins from one account ledger.</p>
          <div className="deposit-hero__signals" aria-label="Deposit support summary">
            <span><ShieldCheck size={15} aria-hidden="true" /> Secure gateway return</span>
            <span><CreditCard size={15} aria-hidden="true" /> VNPAY and MoMo only</span>
            <span><Target size={15} aria-hidden="true" /> Prediction history included</span>
          </div>
        </div>
        <aside className="deposit-balance-card">
          <span><WalletCards size={16} /> Current balance</span>
          <strong>{walletState.isLoading ? "Loading..." : formatTokenAmount(walletState.balance)}</strong>
          <small>{walletState.error || "Wallet updates after payment, prediction settlement, and race prize activity."}</small>
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
              <button className={depositState.mode === "custom" ? "is-active" : ""} type="button" onClick={() => setDepositState((current) => ({ ...current, mode: "custom", error: "", message: "" }))}>Custom</button>
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
                const meta = paymentMethodMeta[method] || { label: method };
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
                    <strong>{meta.label}</strong>
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
              <p className="spectator-eyebrow">Account ledger</p>
              <h2>Recent activity</h2>
            </div>
            <button className="spectator-badge profile-refresh-button" disabled={historyState.isLoading || activityState.isLoading || resultsLoading} type="button" onClick={() => { loadDepositData(); reloadResults?.(); }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="deposit-activity-summary" aria-label="Deposit account summary">
            <div><Package size={16} /><span>Top-ups</span><strong>{historyState.orders.length}</strong></div>
            <div><History size={16} /><span>Ledger rows</span><strong>{activityState.transactions.length}</strong></div>
            <div><Target size={16} /><span>Predictions</span><strong>{activityState.predictions.length}</strong></div>
            <div><Trophy size={16} /><span>Latest winner</span><strong>{latestWinner?.horse || "TBA"}</strong></div>
          </div>

          <div className="profile-history deposit-history-list deposit-activity-list">
            {(historyState.isLoading || activityState.isLoading || resultsLoading) && <div className="deposit-history-row"><span>Loading</span><strong>Account activity</strong><small>Fetching wallet, prediction, and race records</small><b>--</b></div>}
            {!historyState.isLoading && (historyState.error || activityState.error || resultsError) && <div className="deposit-history-row"><span>Error</span><strong>Some activity is unavailable</strong><small>{historyState.error || activityState.error || resultsError}</small><b>--</b></div>}
            {!historyState.isLoading && !activityState.isLoading && !resultsLoading && !historyState.error && !activityState.error && !resultsError && !activityRows.length && <div className="deposit-history-row"><span>Empty</span><strong>No account activity yet</strong><small>Top-ups, withdrawals, predictions, payouts, and race wins will appear here.</small><b>0 TOKEN</b></div>}
            {!historyState.isLoading && !activityState.isLoading && !resultsLoading && activityRows.map((row) => (
              <div className={`deposit-history-row deposit-activity-row deposit-activity-row--${row.tone}`} key={`${row.kind}-${row.id}`}>
                <span className="deposit-history-row__date">
                  <span>{formatTransactionDate(row.date)}</span>
                  <em className={`deposit-status-tag deposit-status-tag--${row.tone}`}>{formatActivityStatus(row.status)}</em>
                </span>
                <span className="deposit-history-row__main">
                  <strong>{row.title} {row.tone === "success" && <CheckCircle2 size={14} aria-hidden="true" />}</strong>
                  <small>{row.detail}</small>
                </span>
                <b className={row.tone === "success" ? "profile-history__won deposit-history-row__amount" : "deposit-history-row__amount"}>{row.amountLabel}</b>
                <em className="deposit-history-row__meta">{row.meta}</em>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
