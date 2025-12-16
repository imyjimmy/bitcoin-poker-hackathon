import { useState } from 'react';

interface AddBalanceModalProps {
  onClose: () => void;
  onAddBalance: (amount: number) => void;
}

export default function AddBalanceModal({ onClose, onAddBalance }: AddBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presetAmounts = [
    { label: '10K sats', value: 10000 },
    { label: '50K sats', value: 50000 },
    { label: '100K sats', value: 100000 },
    { label: '1M sats', value: 1000000 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    setLoading(true);
    
    // Simulate adding balance (in real app, this would interact with LDK/BDK)
    setTimeout(() => {
      onAddBalance(amountNum);
      setLoading(false);
    }, 1500);
  };

  const handlePresetClick = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="card max-w-md w-full animate-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Add Balance
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount (satoshis)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in sats"
              className="input-field"
              min="1"
              required
              disabled={loading}
            />
          </div>

          {/* Preset Amounts */}
          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-3">Quick amounts:</p>
            <div className="grid grid-cols-2 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className="btn-secondary text-sm py-2 hover:border-lightning-500/50 hover:text-lightning-400 transition-all"
                  disabled={loading}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Testnet Balance</p>
                <p className="text-xs text-blue-400">
                  This is a simulated testnet wallet. In a real implementation, you would fund your wallet by:
                </p>
                <ul className="text-xs text-blue-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Receiving testnet BTC from a faucet</li>
                  <li>Opening Lightning channels with testnet nodes</li>
                  <li>Receiving Lightning payments</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading || !amount}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Balance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
