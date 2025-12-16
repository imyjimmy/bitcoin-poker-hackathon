import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';
import { NostrProfile } from '../types/nostr';
import WalletCard from '../components/WalletCard';
import AddBalanceModal from '../components/AddBalanceModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{ pubkey: string; metadata: NostrProfile } | null>(null);
  const [balance, setBalance] = useState(0); // in sats
  const [showAddBalance, setShowAddBalance] = useState(false);

  useEffect(() => {
    // Check authentication
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }
    
    setUserInfo(info);
    
    // Load saved balance from localStorage
    const savedBalance = localStorage.getItem(`wallet_balance_${info.pubkey}`);
    if (savedBalance) {
      setBalance(parseInt(savedBalance));
    }
  }, [navigate]);

  const handleLogout = () => {
    NostrAuthService.logout();
    navigate('/');
  };

  const handleAddBalance = (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem(`wallet_balance_${userInfo?.pubkey}`, newBalance.toString());
    setShowAddBalance(false);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lightning-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noise">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-lg flex items-center justify-center shadow-lg shadow-lightning-500/30">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Texas Hold 'Em Poker with Lightning</h1>
                <p className="text-xs text-slate-400">Testnet!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <img 
                  src={userInfo.metadata.picture} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-lightning-500/30"
                />
                <div className="text-right">
                  <p className="text-sm font-medium">{userInfo.metadata.display_name || userInfo.metadata.name}</p>
                  <p className="text-xs text-slate-400">
                    {userInfo.pubkey.substring(0, 8)}...{userInfo.pubkey.substring(userInfo.pubkey.length - 4)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm py-2 px-4"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-2">
            <WalletCard 
              balance={balance} 
              onAddBalance={() => setShowAddBalance(true)}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-lightning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddBalance(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Balance
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2" disabled>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Payment
                  <span className="text-xs text-slate-500">(Soon)</span>
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2" disabled>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Receive
                  <span className="text-xs text-slate-500">(Soon)</span>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="card bg-gradient-to-br from-lightning-900/20 to-slate-900/50 border-lightning-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-lightning-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-lightning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-lightning-300">Testnet Mode</h3>
                  <p className="text-xs text-slate-400">
                    This wallet uses Bitcoin testnet. All transactions are for testing purposes only and have no real monetary value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400">No transactions yet</p>
              <p className="text-sm text-slate-500 mt-1">Your transactions will appear here</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Balance Modal */}
      {showAddBalance && (
        <AddBalanceModal 
          onClose={() => setShowAddBalance(false)}
          onAddBalance={handleAddBalance}
        />
      )}
    </div>
  );
}
