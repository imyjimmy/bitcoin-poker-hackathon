import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await NostrAuthService.login();
      navigate('/lobby');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-noise">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-2xl mb-6 shadow-2xl shadow-lightning-500/50">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Lightning Wallet</h1>
          <p className="text-slate-400 text-lg">Testnet Edition</p>
        </div>

        {/* Login Card */}
        <div className="card lightning-glow">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Connect with Nostr</h2>
            <p className="text-slate-400">
              Sign in with your Nostr identity to create or access your Lightning wallet
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Sign in with Nostr</span>
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">
              <strong className="text-slate-300">No Nostr extension?</strong>
            </p>
            <p className="text-xs text-slate-400">
              Install a browser extension like{' '}
              <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" className="text-lightning-400 hover:text-lightning-300">
                nos2x
              </a>
              {' '}or{' '}
              <a href="https://getalby.com/" target="_blank" rel="noopener noreferrer" className="text-lightning-400 hover:text-lightning-300">
                Alby
              </a>
              {' '}to continue
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Running on Bitcoin Testnet - No real funds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
