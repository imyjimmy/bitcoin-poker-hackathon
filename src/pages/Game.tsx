import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const role = searchParams.get('role'); // 'challenger' or 'challenged'

  useEffect(() => {
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }
    setUserInfo(info);
  }, [navigate]);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lightning-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noise flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/lobby')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">Game #{gameId?.substring(0, 8)}</h1>
                <p className="text-xs text-slate-400">
                  {role === 'challenger' ? 'You challenged' : 'You were challenged'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-2xl mb-6 shadow-2xl shadow-lightning-500/50">
            <span className="text-6xl">🃏</span>
          </div>
          <h1 className="text-6xl font-bold mb-4 text-gradient">Poker</h1>
          <p className="text-xl text-slate-400 mb-8">Texas Hold 'Em</p>
          
          <div className="card max-w-md mx-auto">
            <p className="text-slate-300 mb-4">
              Game is starting...
            </p>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Game ID:</strong> {gameId}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                <strong className="text-slate-300">Your Role:</strong> {role}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}