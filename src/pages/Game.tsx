import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';
import { Card } from '../types/poker';
import { createShuffledDeck, dealHoleCards, dealFlop, dealTurn, dealRiver } from '../utils/deckUtils';
import CardComponent, { Hand, CommunityCardsDisplay } from '../components/Card';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const role = searchParams.get('role'); // 'challenger' or 'challenged'
  
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<{
    flop?: [Card, Card, Card];
    turn?: Card;
    river?: Card;
  }>({});
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }
    setUserInfo(info);
  }, [navigate]);

  const startGame = () => {
    // Create and shuffle deck
    const shuffled = createShuffledDeck();
    
    // Deal hole cards to 2 players
    const { playerHands, remaining } = dealHoleCards(shuffled, 2);
    
    setPlayerHand(playerHands[0]);
    setOpponentHand(playerHands[1]);
    setDeck(remaining);
    setGameStarted(true);
  };
  
  const dealFlopCards = () => {
    const { flop, remaining } = dealFlop(deck);
    setCommunityCards(prev => ({ ...prev, flop }));
    setDeck(remaining);
  };
  
  const dealTurnCard = () => {
    const { turn, remaining } = dealTurn(deck);
    setCommunityCards(prev => ({ ...prev, turn }));
    setDeck(remaining);
  };
  
  const dealRiverCard = () => {
    const { river, remaining } = dealRiver(deck);
    setCommunityCards(prev => ({ ...prev, river }));
    setDeck(remaining);
  };

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
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connected
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {!gameStarted ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-2xl mb-6 shadow-2xl shadow-lightning-500/50">
              <span className="text-6xl">🃏</span>
            </div>
            <h1 className="text-6xl font-bold mb-4 text-gradient">Texas Hold'em</h1>
            <p className="text-xl text-slate-400 mb-8">Ready to play?</p>
            
            <button
              onClick={startGame}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Game
            </button>
            
            <div className="mt-8 text-xs text-slate-500">
              <p>Game ID: {gameId}</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-8">
            {/* Opponent Hand (face down) */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">Opponent</p>
              <div className="flex justify-center">
                <Hand cards={opponentHand} faceDown={true} size="md" />
              </div>
            </div>
            
            {/* Community Cards */}
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
              <CommunityCardsDisplay 
                flop={communityCards.flop}
                turn={communityCards.turn}
                river={communityCards.river}
                size="lg"
              />
              
              {/* Pot Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">Pot</p>
                <p className="text-3xl font-bold text-lightning-400">20,000 sats</p>
              </div>
            </div>
            
            {/* Your Hand */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">Your Hand</p>
              <div className="flex justify-center mb-6">
                <Hand cards={playerHand} faceDown={false} size="lg" />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                {!communityCards.flop && (
                  <button
                    onClick={dealFlopCards}
                    className="btn-primary px-6 py-3"
                  >
                    Deal Flop
                  </button>
                )}
                
                {communityCards.flop && !communityCards.turn && (
                  <button
                    onClick={dealTurnCard}
                    className="btn-primary px-6 py-3"
                  >
                    Deal Turn
                  </button>
                )}
                
                {communityCards.turn && !communityCards.river && (
                  <button
                    onClick={dealRiverCard}
                    className="btn-primary px-6 py-3"
                  >
                    Deal River
                  </button>
                )}
                
                <button className="btn-secondary px-6 py-3">Fold</button>
                <button className="btn-secondary px-6 py-3">Check</button>
                <button className="btn-primary px-6 py-3">Raise</button>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="text-center text-xs text-slate-600">
              <p>Cards remaining in deck: {deck.length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}