interface WalletCardProps {
  balance: number;
  onAddBalance: () => void;
}

export default function WalletCard({ balance, onAddBalance }: WalletCardProps) {
  const formatBalance = (sats: number) => {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(8)} BTC`;
    }
    return `${sats.toLocaleString()} sats`;
  };

  const balanceInBTC = (balance / 100000000).toFixed(8);
  const balanceInUSD = (balance * 0.0004).toFixed(2); // Mock conversion rate

  return (
    <div className="card relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lightning-500/5 to-bitcoin-500/5" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Balance</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-gradient">
                {formatBalance(balance)}
              </h2>
              {balance > 0 && (
                <span className="text-slate-500 text-lg">
                  ≈ ${balanceInUSD}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onAddBalance}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Balance
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Received</p>
            </div>
            <p className="text-xl font-bold text-green-400">0 sats</p>
            <p className="text-xs text-slate-500 mt-1">0 transactions</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Sent</p>
            </div>
            <p className="text-xl font-bold text-red-400">0 sats</p>
            <p className="text-xs text-slate-500 mt-1">0 transactions</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-lightning-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-lightning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Channels</p>
            </div>
            <p className="text-xl font-bold text-lightning-400">0</p>
            <p className="text-xs text-slate-500 mt-1">No active channels</p>
          </div>
        </div>

        {/* Wallet Address (Mock) */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Lightning Address (Testnet)</p>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3">
            <code className="text-sm text-lightning-400 flex-1 font-mono overflow-x-auto">
              ln-testnet-mock-address@wallet.local
            </code>
            <button 
              className="text-slate-400 hover:text-white transition-colors"
              onClick={() => {
                navigator.clipboard.writeText('ln-testnet-mock-address@wallet.local');
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
