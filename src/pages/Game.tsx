import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';
import { aiOpponent } from '../services/AIOpponent';
import { GameState, createInitialGameState } from '../types/gameState';
import { Card, createCardFromId, createDeck } from '../types/poker';
import { shuffleDeck, dealHoleCards, dealFlop, dealTurn, dealRiver, cardsToCardIds } from '../utils/deckUtils';
import CardComponent, { Hand, CommunityCardsDisplay } from '../components/Card';

export default function Game() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }
    setUserInfo(info);
    
    // Initialize game with AI opponent
    const ai = aiOpponent.getAIPlayer();
    const initialState = createInitialGameState(
      `game-${Date.now()}`,
      { 
        pubkey: info.pubkey,
        name: info.metadata.display_name || info.metadata.name || 'You',
        picture: info.metadata.picture,
      },
      ai,
      10000 // 10k sats buy-in
    );
    
    setGameState(initialState);
  }, [navigate]);

  const startGame = () => {
    if (!gameState) return;
    
    // Shuffle and deal
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const { playerHands, remaining } = dealHoleCards(shuffled, 2);
    
    const newState: GameState = {
      ...gameState,
      stage: 'preflop',
      challenger: {
        ...gameState.challenger,
        cards: cardsToCardIds(playerHands[0]),
      },
      challenged: {
        ...gameState.challenged,
        cards: cardsToCardIds(playerHands[1]),
      },
      deckSeed: 'local-' + Date.now(),
    };
    
    setGameState(newState);
  };
  
  const dealFlopCards = () => {
    if (!gameState) return;
    
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const afterHoleCards = shuffled.slice(4);
    const { flop } = dealFlop(afterHoleCards);
    
    setGameState({
      ...gameState,
      stage: 'postflop',
      communityCards: {
        flop: cardsToCardIds(flop) as [string, string, string],
      },
    });
    
    // AI takes action after flop
    triggerAIAction();
  };
  
  const dealTurnCard = () => {
    if (!gameState) return;
    
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const afterFlop = shuffled.slice(9);
    const { turn } = dealTurn(afterFlop);
    
    setGameState({
      ...gameState,
      stage: 'postturn',
      communityCards: {
        ...gameState.communityCards,
        turn: turn.id,
      },
    });
    
    triggerAIAction();
  };
  
  const dealRiverCard = () => {
    if (!gameState) return;
    
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const afterTurn = shuffled.slice(11);
    const { river } = dealRiver(afterTurn);
    
    setGameState({
      ...gameState,
      stage: 'postriver',
      communityCards: {
        ...gameState.communityCards,
        river: river.id,
      },
    });
    
    triggerAIAction();
  };
  
  const triggerAIAction = async () => {
    if (!gameState) return;
    
    setAiThinking(true);
    const decision = await aiOpponent.makeDecision(gameState, true);
    setAiThinking(false);
    
    console.log('🤖 AI decision:', decision);
    // TODO: Apply AI decision to game state
  };
  
  const handlePlayerAction = (action: string) => {
    console.log('Player action:', action);
    // TODO: Implement player actions
  };

  const leaveGame = () => {
    navigate('/lobby');
  };

  if (!userInfo || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noise">
        <div className="w-8 h-8 border-2 border-lightning-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const myHand: Card[] = gameState.challenger.cards.map(id => createCardFromId(id));
  const aiHand: Card[] = gameState.challenged.cards.map(id => createCardFromId(id));
  
  const communityCards = {
    flop: gameState.communityCards.flop?.map(id => createCardFromId(id)) as [Card, Card, Card] | undefined,
    turn: gameState.communityCards.turn ? createCardFromId(gameState.communityCards.turn) : undefined,
    river: gameState.communityCards.river ? createCardFromId(gameState.communityCards.river) : undefined,
  };

  return (
    <div className="min-h-screen bg-noise flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={leaveGame} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">Lightning Poker vs AI</h1>
                <p className="text-xs text-slate-400">Practice Mode</p>
              </div>
            </div>
            
            <div className="text-sm bg-slate-800 px-3 py-1 rounded-lg">
              <span className="text-slate-400">Stage:</span>
              <span className="ml-2 text-lightning-400 font-semibold">{gameState.stage}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {gameState.stage === 'waiting' ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-2xl mb-6 shadow-2xl shadow-lightning-500/50">
              <span className="text-6xl">🤖</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-gradient">Play vs AI</h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-8">Practice your poker skills!</p>
            
            <button onClick={startGame} className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Start Game
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
            {/* AI Hand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img src={gameState.challenged.picture} alt="AI" className="w-8 h-8 rounded-full" />
                <p className="text-sm font-semibold">{gameState.challenged.name}</p>
                {aiThinking && (
                  <span className="text-xs text-lightning-400 animate-pulse">thinking...</span>
                )}
              </div>
              <div className="flex justify-center">
                {aiHand.length > 0 ? (
                  <Hand cards={aiHand} faceDown={true} size="md" />
                ) : (
                  <div className="text-slate-600">Waiting...</div>
                )}
              </div>
            </div>
            
            {/* Community Cards */}
            <div className="bg-slate-900/50 rounded-xl p-4 sm:p-8 border border-slate-800">
              <CommunityCardsDisplay 
                flop={communityCards.flop}
                turn={communityCards.turn}
                river={communityCards.river}
                size="lg"
              />
              
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-slate-400">Pot</p>
                <p className="text-2xl sm:text-3xl font-bold text-lightning-400">
                  {gameState.pot.toLocaleString()} sats
                </p>
              </div>
            </div>
            
            {/* Your Hand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img src={gameState.challenger.picture} alt="You" className="w-8 h-8 rounded-full" />
                <p className="text-sm font-semibold">{gameState.challenger.name}</p>
              </div>
              <div className="flex justify-center mb-6">
                {myHand.length > 0 ? (
                  <Hand cards={myHand} faceDown={false} size="lg" />
                ) : (
                  <div className="text-slate-600">Waiting...</div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                {gameState.stage === 'preflop' && (
                  <button onClick={dealFlopCards} className="btn-primary px-6 py-3">
                    Deal Flop
                  </button>
                )}
                {gameState.stage === 'postflop' && (
                  <button onClick={dealTurnCard} className="btn-primary px-6 py-3">
                    Deal Turn
                  </button>
                )}
                {gameState.stage === 'postturn' && (
                  <button onClick={dealRiverCard} className="btn-primary px-6 py-3">
                    Deal River
                  </button>
                )}
                
                <button onClick={() => handlePlayerAction('fold')} className="btn-secondary px-6 py-3">
                  Fold
                </button>
                <button onClick={() => handlePlayerAction('check')} className="btn-secondary px-6 py-3">
                  Check
                </button>
                <button onClick={() => handlePlayerAction('raise')} className="btn-secondary px-6 py-3">
                  Raise
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}