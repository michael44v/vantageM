import { useState, useEffect, useCallback } from "react";
import {
  Wallet, ArrowRight, AlertCircle, Loader2, Upload,
  CheckCircle, Copy, RefreshCw,
} from "lucide-react";
import { paymentService, accountService } from "../../services/api";

const CLOUDINARY_CLOUD  = "dguvkirdr";
const CLOUDINARY_PRESET = "ablemarkets";

const CRYPTO_WALLETS = [
  { symbol: "BTC",  name: "Bitcoin",   network: "Bitcoin Network",   address: "bc1qmal2x2cuadsazm30k8k9r4f49vjemag0n5veue", color: "#F7931A", icon: "₿" },
  { symbol: "ETH",  name: "Ethereum",  network: "ERC-20",            address: "0x76b4290026e9BF4770714C6a67302C97724D98aF", color: "#627EEA", icon: "Ξ" },
  { symbol: "USDT", name: "Tether",    network: "TRC-20 (TRON)",     address: "TT5sbDn7brY96wpBEia8Vd4uxGN8vE6M9W",         color: "#26A17B", icon: "₮" },
  { symbol: "BNB",  name: "BNB",       network: "BNB Smart Chain",   address: "0x76b4290026e9BF4770714C6a67302C97724D98aF", color: "#F3BA2F", icon: "B" },
];

const BANK_DETAILS = [
  { label: "Bank Name",      value: "vāntãgeCFD Global Prime" },
  { label: "Account Number", value: "881 223 990 001" },
  { label: "SWIFT / BIC",    value: "VGPGBK11XX" },
  { label: "Account Name",   value: "vāntãgeCFD Ltd" },
  { label: "Reference",      value: "Your registered email" },
];

const CRYPTO_WITHDRAW_WALLETS = [
  { symbol: "BTC",  name: "Bitcoin",   network: "Bitcoin Network" },
  { symbol: "ETH",  name: "Ethereum",  network: "ERC-20" },
  { symbol: "USDT", name: "Tether",    network: "TRC-20 (TRON)" },
  { symbol: "BNB",  name: "BNB",       network: "BNB Smart Chain" },
];

function QRCode({ value, size = 160 }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=10`}
      alt="Wallet QR Code" width={size} height={size}
      className="rounded-xl border border-surface-border"
    />
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 text-[#8897A9] hover:text-accent transition-colors flex-shrink-0">
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white ${type === "success" ? "bg-primary" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Upload to Cloudinary, return secure_url ───────────────────────────────────
async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file",           file);
  form.append("upload_preset",  "futyApp");
  form.append("folder",         "vantage_deposits");
  const res = await fetch(`https://api.cloudinary.com/v1_1/dguvkirdr/auto/upload`, {
    method: "POST", body: form,
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error?.message || "Cloudinary upload failed.");
  }
  return res.json(); // { secure_url, public_id, ... }
}

export default function DepositWithdraw() {
  const [tab,            setTab]           = useState("deposit");
  const [method,         setMethod]        = useState("bank");
  const [selectedCrypto, setCrypto]        = useState(CRYPTO_WALLETS[0]);
  const [step,           setStep]          = useState(1);
  const [amount,         setAmount]        = useState("");
  const [txRef,          setTxRef]         = useState("");
  const [receipt,        setReceipt]       = useState(null);
  const [uploadStep,     setUploadStep]    = useState(""); // "cloudinary"|"saving"|""
  const [walletBal,      setWalletBal]     = useState(null);
  const [toast,          setToast]         = useState(null);
  const [fieldErr,       setFieldErr]      = useState({});

  // Withdraw state
  const [withdrawMethod, setWithdrawMethod] = useState("bank"); // "bank" | "crypto"
  const [wForm,    setWForm]    = useState({ accountName: "", accountNumber: "", bankName: "", amount: "" });
  const [wCrypto,  setWCrypto]  = useState({ symbol: "USDT", address: "" });
  const [wLoading, setWLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await accountService.getAll();
      setWalletBal(res.wallet_balance ?? null);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const validateStep1 = () => {
    const errs = {};
    const val  = parseFloat(amount);
    if (!amount || isNaN(val)) errs.amount = "Please enter an amount.";
    else if (val < 10)         errs.amount = "Minimum deposit is $100.00.";
    else if (val > 15000000)      errs.amount = "Maximum is $15,000,000.00.";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!txRef.trim()) errs.txRef   = "Transaction reference is required.";
    if (!receipt)      errs.receipt = "Please upload a receipt.";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  // ── Deposit submit: Cloudinary first, then API ────────────────────────────
  const handleDepositSubmit = async () => {
    if (!validateStep2()) return;
    setUploadStep("cloudinary");
    try {
      // 1. Upload receipt to Cloudinary
      const { secure_url } = await uploadToCloudinary(receipt);

      // 2. Save deposit request to DB with the Cloudinary URL
      setUploadStep("saving");
      await paymentService.submitDeposit({
        amount:       parseFloat(amount),
        currency:     "USD",
        method:       method === "crypto" ? "crypto" : "bank_wire",
        cryptoSymbol: method === "crypto" ? selectedCrypto.symbol : undefined,
        txRef,
        receiptUrl:   secure_url,
      });

      setToast({ message: "Deposit proof submitted! We'll credit your wallet within 24h.", type: "success" });
      setStep(1); setAmount(""); setTxRef(""); setReceipt(null);
      fetchWallet();
    } catch (err) {
      setToast({ message: err.message || "Submission failed.", type: "error" });
    } finally {
      setUploadStep("");
    }
  };

  const isSubmitting = !!uploadStep;
  const submitLabel  = uploadStep === "cloudinary" ? "Uploading receipt…"
                     : uploadStep === "saving"     ? "Saving request…"
                     : "Submit Deposit Proof";

  // ── Withdraw submit ───────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    const errs = {};
    const val  = parseFloat(wForm.amount);
    if (!wForm.amount || isNaN(val))              errs.wAmount = "Enter an amount.";
    else if (val < 10)                            errs.wAmount = "Minimum is $10.";
    else if (walletBal !== null && val > walletBal) errs.wAmount = "Insufficient balance.";
    if (withdrawMethod === "bank") {
      if (!wForm.accountName)   errs.accountName   = "Required.";
      if (!wForm.accountNumber) errs.accountNumber = "Required.";
      if (!wForm.bankName)      errs.bankName      = "Required.";
    } else {
      if (!wCrypto.address.trim()) errs.cryptoAddress = "Wallet address is required.";
    }
    setFieldErr(errs);
    if (Object.keys(errs).length) return;

    setWLoading(true);
    try {
      await paymentService.submitWithdrawal({
        amount:         parseFloat(wForm.amount),
        method:         withdrawMethod,
        bankName:       wForm.bankName,
        accountName:    wForm.accountName,
        accountNumber:  wForm.accountNumber,
        cryptoSymbol:   withdrawMethod === "crypto" ? wCrypto.symbol  : undefined,
        cryptoAddress:  withdrawMethod === "crypto" ? wCrypto.address : undefined,
      });
      setToast({ message: "Withdrawal request submitted. Processing in 1–3 days.", type: "success" });
      setWForm({ accountName: "", accountNumber: "", bankName: "", amount: "" });
      setWCrypto({ symbol: "USDT", address: "" });
      setFieldErr({});
      fetchWallet();
    } catch (err) {
      setToast({ message: err.message || "Failed.", type: "error" });
    } finally {
      setWLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-primary">Funds & Payments</h1>
          {walletBal !== null && (
            <p className="text-sm text-[#8897A9] mt-1">
              Wallet: <span className="font-bold text-primary">${parseFloat(walletBal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <button onClick={fetchWallet} className="ml-2 text-[#8897A9] hover:text-accent inline-flex items-center"><RefreshCw className="w-3 h-3" /></button>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {["deposit","withdraw"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setStep(1); setFieldErr({}); }}
              className={`px-5 py-2 text-xs font-bold rounded-full capitalize transition-colors ${tab === t ? "bg-accent text-white" : "bg-surface text-primary hover:bg-surface-border"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── DEPOSIT ──────────────────────────────────────────────────────── */}
      {tab === "deposit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Method selector */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-4">Select Method</p>
            {[
              { key: "bank",   label: "Bank Wire", sub: "Manual — 1–3 business days" },
              { key: "crypto", label: "Crypto",    sub: "BTC · ETH · USDT · BNB" },
            ].map((m) => (
              <button key={m.key} onClick={() => { setMethod(m.key); setStep(1); setFieldErr({}); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${method === m.key ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-surface-border bg-white hover:border-accent/40"}`}>
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-primary text-sm">{m.label}</div>
                  <div className="text-[10px] text-[#8897A9]">{m.sub}</div>
                </div>
              </button>
            ))}

            {method === "crypto" && (
              <div className="pt-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8897A9]">Select Coin</p>
                {CRYPTO_WALLETS.map((c) => (
                  <button key={c.symbol} onClick={() => setCrypto(c)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedCrypto.symbol === c.symbol ? "border-accent bg-accent/5" : "border-surface-border bg-white hover:border-accent/30"}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>{c.icon}</div>
                    <div>
                      <div className="font-bold text-primary text-sm">{c.symbol}</div>
                      <div className="text-[10px] text-[#8897A9]">{c.network}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action panel */}
          <div className="lg:col-span-2 bg-white border border-surface-border rounded-xl p-6 sm:p-8 shadow-card">
            {step === 1 ? (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-xl text-primary">Enter Deposit Amount</h3>
                <Field label="Amount (USD)" error={fieldErr.amount}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                    <input type="number" value={amount}
                      onChange={(e) => { setAmount(e.target.value); setFieldErr((p) => ({ ...p, amount: undefined })); }}
                      placeholder="0.00" className={`input-field pl-8 text-lg font-bold ${fieldErr.amount ? "border-red-400" : ""}`} />
                  </div>
                  <p className="text-[10px] text-[#8897A9] mt-1 italic">Min: $100 · Max: $15,000,000</p>
                </Field>
                <div className="flex gap-2 flex-wrap">
                  {[100, 500, 1000, 5000].map((v) => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${parseFloat(amount) === v ? "border-accent bg-accent/10 text-accent" : "border-surface-border text-[#8897A9] hover:border-accent/40"}`}>
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full btn-primary flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-primary">
                    {method === "crypto" ? `Send ${selectedCrypto.symbol}` : "Bank Transfer"}
                  </h3>
                  <span className="text-sm font-bold text-accent">${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>

                {method === "crypto" ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-surface rounded-xl border border-surface-border">
                      <QRCode value={selectedCrypto.address} size={140} />
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: selectedCrypto.color }}>{selectedCrypto.icon}</div>
                          <span className="font-bold text-primary">{selectedCrypto.name}</span>
                          <span className="text-xs text-[#8897A9]">({selectedCrypto.network})</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#8897A9] font-bold uppercase mb-1">Wallet Address</p>
                          <div className="flex items-start gap-1">
                            <code className="text-xs font-mono text-primary break-all leading-relaxed">{selectedCrypto.address}</code>
                            <CopyBtn text={selectedCrypto.address} />
                          </div>
                        </div>
                        <div className="text-[10px] text-[#8897A9] bg-white border border-surface-border rounded-lg px-3 py-2">
                          Send only <span className="font-bold text-primary">{selectedCrypto.symbol}</span> on <span className="font-bold text-primary">{selectedCrypto.network}</span>. Wrong network = permanent loss.
                        </div>
                      </div>
                    </div>
                    <Field label="Transaction Hash / ID" error={fieldErr.txRef}>
                      <input type="text" value={txRef}
                        onChange={(e) => { setTxRef(e.target.value); setFieldErr((p) => ({ ...p, txRef: undefined })); }}
                        placeholder="0x… or txid…" className={`input-field font-mono text-sm ${fieldErr.txRef ? "border-red-400" : ""}`} />
                    </Field>
                    <Field label="Upload Screenshot / Proof" error={fieldErr.receipt}>
                      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center text-center cursor-pointer group transition-colors ${fieldErr.receipt ? "border-red-300 bg-red-50" : "border-surface-border hover:border-accent"}`}>
                        <input type="file" className="sr-only" accept="image/*" onChange={(e) => { setReceipt(e.target.files?.[0] ?? null); setFieldErr((p) => ({ ...p, receipt: undefined })); }} />
                        {receipt ? <><CheckCircle className="w-7 h-7 text-emerald-500 mb-2" /><p className="text-sm font-bold text-primary">{receipt.name}</p></> : <><Upload className="w-7 h-7 text-[#8897A9] group-hover:text-accent mb-2 transition-colors" /><p className="text-sm font-bold text-primary">Upload confirmation screenshot</p></>}
                      </label>
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-surface rounded-xl p-5 border border-surface-border space-y-3">
                      {BANK_DETAILS.map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-sm gap-4 flex-wrap">
                          <span className="text-[#8897A9] flex-shrink-0">{row.label}</span>
                          <span className="font-bold text-primary flex items-center gap-1 break-all text-right">{row.value}<CopyBtn text={row.value} /></span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">Use your registered email as the transfer reference. Credited within 1–3 business days.</p>
                    </div>
                    <Field label="Transaction Reference" error={fieldErr.txRef}>
                      <input type="text" value={txRef}
                        onChange={(e) => { setTxRef(e.target.value); setFieldErr((p) => ({ ...p, txRef: undefined })); }}
                        placeholder="e.g. REF-20240401-001" className={`input-field ${fieldErr.txRef ? "border-red-400" : ""}`} />
                    </Field>
                    <Field label="Upload Receipt" error={fieldErr.receipt}>
                      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center text-center cursor-pointer group transition-colors ${fieldErr.receipt ? "border-red-300 bg-red-50" : "border-surface-border hover:border-accent"}`}>
                        <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={(e) => { setReceipt(e.target.files?.[0] ?? null); setFieldErr((p) => ({ ...p, receipt: undefined })); }} />
                        {receipt ? <><CheckCircle className="w-7 h-7 text-emerald-500 mb-2" /><p className="text-sm font-bold text-primary">{receipt.name}</p></> : <><Upload className="w-7 h-7 text-[#8897A9] group-hover:text-accent mb-2 transition-colors" /><p className="text-sm font-bold text-primary">Click to upload</p><p className="text-xs text-[#8897A9]">PNG, JPG, PDF up to 10MB</p></>}
                      </label>
                    </Field>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={() => { setStep(1); setFieldErr({}); }} className="sm:w-28 btn-ghost text-sm">← Back</button>
                  <button onClick={handleDepositSubmit} disabled={isSubmitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── WITHDRAW ──────────────────────────────────────────────────────── */
        <div className="max-w-xl space-y-4">
          <div className="bg-white border border-surface-border rounded-xl p-6 sm:p-8 shadow-card space-y-5">
            <h3 className="font-display font-bold text-xl text-primary">Withdraw Funds</h3>

            {walletBal !== null && (
              <div className="flex items-center justify-between bg-surface rounded-xl p-4 border border-surface-border">
                <span className="text-sm text-[#8897A9]">Available Balance</span>
                <span className="font-bold text-primary">${parseFloat(walletBal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Withdraw method toggle */}
            <div className="flex gap-2">
              {[
                { key: "bank",   label: "Bank Transfer" },
                { key: "crypto", label: "Crypto" },
              ].map((m) => (
                <button key={m.key} onClick={() => { setWithdrawMethod(m.key); setFieldErr({}); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-colors ${withdrawMethod === m.key ? "bg-primary text-white border-primary" : "border-surface-border text-[#8897A9] hover:border-accent/40"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            <Field label="Amount (USD)" error={fieldErr.wAmount}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                <input type="number" value={wForm.amount}
                  onChange={(e) => { setWForm((p) => ({ ...p, amount: e.target.value })); setFieldErr((p) => ({ ...p, wAmount: undefined })); }}
                  placeholder="0.00" className={`input-field pl-8 font-bold ${fieldErr.wAmount ? "border-red-400" : ""}`} />
              </div>
            </Field>

            {withdrawMethod === "bank" ? (
              <>
                <Field label="Account Holder Name" error={fieldErr.accountName}>
                  <input type="text" value={wForm.accountName}
                    onChange={(e) => { setWForm((p) => ({ ...p, accountName: e.target.value })); setFieldErr((p) => ({ ...p, accountName: undefined })); }}
                    placeholder="As it appears on your bank" className={`input-field ${fieldErr.accountName ? "border-red-400" : ""}`} />
                </Field>
                <Field label="Bank Name" error={fieldErr.bankName}>
                  <input type="text" value={wForm.bankName}
                    onChange={(e) => { setWForm((p) => ({ ...p, bankName: e.target.value })); setFieldErr((p) => ({ ...p, bankName: undefined })); }}
                    placeholder="e.g. GTBank, Access Bank" className={`input-field ${fieldErr.bankName ? "border-red-400" : ""}`} />
                </Field>
                <Field label="Account Number" error={fieldErr.accountNumber}>
                  <input type="text" value={wForm.accountNumber}
                    onChange={(e) => { setWForm((p) => ({ ...p, accountNumber: e.target.value })); setFieldErr((p) => ({ ...p, accountNumber: undefined })); }}
                    placeholder="10-digit account number" className={`input-field ${fieldErr.accountNumber ? "border-red-400" : ""}`} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Select Cryptocurrency" error={null}>
                  <div className="grid grid-cols-2 gap-2">
                    {CRYPTO_WITHDRAW_WALLETS.map((c) => (
                      <button key={c.symbol} onClick={() => setWCrypto((p) => ({ ...p, symbol: c.symbol }))}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${wCrypto.symbol === c.symbol ? "border-accent bg-accent/5" : "border-surface-border hover:border-accent/30"}`}>
                        <span className="text-xs font-bold text-primary">{c.symbol}</span>
                        <span className="text-[10px] text-[#8897A9]">{c.network}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Your Wallet Address" error={fieldErr.cryptoAddress}>
                  <input type="text" value={wCrypto.address}
                    onChange={(e) => { setWCrypto((p) => ({ ...p, address: e.target.value })); setFieldErr((p) => ({ ...p, cryptoAddress: undefined })); }}
                    placeholder={`Paste your ${wCrypto.symbol} address`}
                    className={`input-field font-mono text-sm ${fieldErr.cryptoAddress ? "border-red-400" : ""}`} />
                  <p className="text-[10px] text-[#8897A9] mt-1">Double-check your address. Crypto withdrawals are irreversible.</p>
                </Field>
              </>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">KYC must be approved before withdrawal. Processing takes 1–3 business days.</p>
            </div>

            <button onClick={handleWithdraw} disabled={wLoading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2">
              {wLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : <>Request Withdrawal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}