import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';
import { nostrService, NostrFollower, GameChallenge, formatPubkey } from '../services/NostrService';

export default function Lobby() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [followers, setFollowers] = useState<NostrFollower[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<GameChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [challengingPubkey, setChallengingPubkey] = useState<string | null>(null);

  useEffect(() => {
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }

    setUserInfo(info);
    loadData(info.pubkey);

    // Subscribe to incoming challenges
    const sub = nostrService.subscribeToIncomingChallenges(info.pubkey, (challenge: any) => {
      setIncomingChallenges(prev => [challenge, ...prev]);
    });

    return () => {
      if (sub) sub.close();
    };
  }, [navigate]);

  const loadData = async (pubkey: string) => {
    setLoading(true);
    try {
      const [followersData, challengesData] = await Promise.all([
        nostrService.fetchFollowers(pubkey),
        nostrService.fetchIncomingChallenges(pubkey)
      ]);

      setFollowers(followersData);
      setIncomingChallenges(challengesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async (followerPubkey: string) => {
    if (!userInfo) return;

    setChallengingPubkey(followerPubkey);
    try {
      const buyIn = 10000; // Default buy-in of 10k sats
      const challengeId = await nostrService.createChallenge(
        userInfo.pubkey,
        followerPubkey,
        buyIn
      );

      // Navigate to game
      navigate(`/game/${challengeId}?role=challenger`);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Make sure you have a Nostr extension installed.');
    } finally {
      setChallengingPubkey(null);
    }
  };

  const handleAcceptChallenge = (challenge: GameChallenge) => {
    navigate(`/game/${challenge.challengeId}?role=challenged`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noise flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lightning-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your followers...</p>
        </div>
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
                <span className="text-xl">♠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Lightning Poker</h1>
                <p className="text-xs text-slate-400">Heads Up Texas Hold'em</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                View Balance
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incoming Challenges */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Incoming Challenges
              </h2>

              {incomingChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">No challenges yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.challengeId}
                      challenge={challenge}
                      onAccept={() => handleAcceptChallenge(challenge)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Followers to Challenge */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-lightning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Challenge Your Followers
              </h2>

              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 mb-2">No followers found</p>
                  <p className="text-sm text-slate-500">
                    Follow people on Nostr to challenge them to poker!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {followers.map((follower) => (
                    <FollowerCard
                      key={follower.pubkey}
                      follower={follower}
                      onChallenge={() => handleChallenge(follower.pubkey)}
                      isLoading={challengingPubkey === follower.pubkey}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Follower Card Component
function FollowerCard({ 
  follower, 
  onChallenge, 
  isLoading 
}: { 
  follower: NostrFollower; 
  onChallenge: () => void; 
  isLoading: boolean;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-4 hover:bg-slate-800 transition-all">
      <img
        src={follower.profile?.picture}
        alt={follower.profile?.name || 'User'}
        className="w-12 h-12 rounded-full border-2 border-slate-700"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {follower.profile?.display_name || follower.profile?.name || 'Anonymous'}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {/* {follower.pubkey.substring(0, 16)}... */}
          {formatPubkey(follower.pubkey, 'short')}
        </p>
      </div>
      <button
        onClick={onChallenge}
        disabled={isLoading}
        className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Challenge'
        )}
      </button>
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ 
  challenge, 
  onAccept 
}: { 
  challenge: GameChallenge; 
  onAccept: () => void;
}) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    nostrService.fetchProfile(challenge.challenger).then(setProfile);
  }, [challenge.challenger]);

  return (
    <div className="bg-gradient-to-br from-red-900/20 to-slate-900/50 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${challenge.challenger}`}
          alt="Challenger"
          className="w-10 h-10 rounded-full border-2 border-red-500/50"
        />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {profile?.display_name || profile?.name || 'Anonymous Player'}
          </p>
          <p className="text-xs text-slate-500">
            {challenge.challenger.substring(0, 16)}...
          </p>
        </div>
      </div>
      
      <div className="mb-3 pb-3 border-b border-slate-700">
        <p className="text-xs text-slate-400">Buy-in</p>
        <p className="text-lg font-bold text-lightning-400">
          {challenge.buyIn.toLocaleString()} sats
        </p>
      </div>

      <button
        onClick={onAccept}
        className="w-full btn-primary text-sm py-2"
      >
        Accept Challenge
      </button>
    </div>
  );
}