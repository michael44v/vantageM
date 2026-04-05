import { useState } from "react";
import { CreditCard, Wallet, ArrowRight, CheckCircle, Upload } from "lucide-react";

export default function DepositWithdraw() {
  const [method, setMethod] = useState("coinbase");
  const [step, setStep] = useState(1); // 1: Amount, 2: Proof
  const [amount, setAmount] = useState("");

  const handleNext = () => setStep(2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-2xl text-primary">Funds & Payments</h1>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-full">Deposit</button>
           <button className="px-4 py-2 bg-surface text-primary text-xs font-bold rounded-full hover:bg-surface-border">Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Method Selector */}
        <div className="lg:col-span-1 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-4">Select Method</label>
          <button
            onClick={() => setMethod("coinbase")}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${method === 'coinbase' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-surface-border bg-white hover:border-accent/40'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
               <CheckCircle className="w-6 h-6" />
            </div>
            <div>
               <div className="font-bold text-primary">Coinbase</div>
               <div className="text-[10px] text-[#8897A9]">Automated Crypto Payment</div>
            </div>
          </button>

          <button
             onClick={() => setMethod("manual")}
             className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${method === 'manual' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-surface-border bg-white hover:border-accent/40'}`}
          >
            <div className="w-10 h-10 rounded-full bg-surface-border flex items-center justify-center text-primary flex-shrink-0">
               <Wallet className="w-6 h-6" />
            </div>
            <div>
               <div className="font-bold text-primary">Manual Deposit</div>
               <div className="text-[10px] text-[#8897A9]">Bank Wire / Crypto Transfer</div>
            </div>
          </button>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2 bg-white border border-surface-border rounded-xl p-8 shadow-card">
           {step === 1 ? (
             <div className="space-y-6">
                <h3 className="font-display font-bold text-xl text-primary">Enter Deposit Amount</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Currency</label>
                      <select className="input-field">
                         <option>USD - US Dollar</option>
                         <option>EUR - Euro</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Amount</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="input-field text-lg font-bold"
                      />
                      <div className="text-[10px] text-[#8897A9] mt-1 italic">Min: $10.00 | Max: $50,000.00</div>
                   </div>
                   <button onClick={handleNext} className="w-full btn-primary flex items-center justify-center gap-2 mt-4">
                      Continue <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in">
                <h3 className="font-display font-bold text-xl text-primary">Complete Your Deposit</h3>
                {method === 'coinbase' ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                     <p className="text-sm text-blue-800 mb-6 font-medium">Click below to pay with Coinbase Commerce. Your account will be credited instantly after confirmation.</p>
                     <button className="btn-primary bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 px-10 py-4 font-bold tracking-wide">
                        Pay with Coinbase
                     </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="bg-surface rounded-xl p-6 border border-surface-border space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-[#8897A9]">Bank Name:</span>
                           <span className="font-bold text-primary">Vantage Global Prime</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-[#8897A9]">Account Number:</span>
                           <span className="font-bold text-primary">881 223 990 001</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-[#8897A9]">SWIFT/BIC:</span>
                           <span className="font-bold text-primary">VGPGBK11XX</span>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Transaction ID / Reference</label>
                           <input type="text" placeholder="TXN-XXXX" className="input-field" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Upload Receipt Screenshot</label>
                           <div className="border-2 border-dashed border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer group">
                              <Upload className="w-8 h-8 text-[#8897A9] group-hover:text-accent mb-3" />
                              <div className="text-sm font-bold text-primary">Click to upload or drag & drop</div>
                              <div className="text-xs text-[#8897A9]">PNG, JPG up to 10MB</div>
                           </div>
                        </div>
                        <button className="w-full btn-primary mt-4">Submit Deposit Proof</button>
                        <button onClick={() => setStep(1)} className="w-full btn-ghost border-transparent text-xs font-bold hover:bg-transparent hover:text-accent">Go Back</button>
                     </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
