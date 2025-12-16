import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NostrAuthService } from '../services/NostrAuthService';
import { gameService } from '../services/GameService';
import { GameState, createInitialGameState } from '../types/gameState';
import { Card, createCardFromId } from '../types/poker';
import CardComponent, { Hand, CommunityCardsDisplay } from '../components/Card';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const role = searchParams.get('role');
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDealer, setIsDealer] = useState(false);

  useEffect(() => {
    const info = NostrAuthService.getUserInfo();
    if (!info) {
      navigate('/');
      return;
    }
    setUserInfo(info);
    
    const dealer = role === 'challenger';
    setIsDealer(dealer);
    
    const initialState = createInitialGameState(
      gameId!,
      { 
        pubkey: dealer ? info.pubkey : 'opponent-pubkey',
        name: dealer ? (info.metadata.display_name || info.metadata.name || 'You') : 'Opponent',
        picture: dealer ? info.metadata.picture : undefined,
      },
      {
        pubkey: !dealer ? info.pubkey : 'opponent-pubkey',
        name: !dealer ? (info.metadata.display_name || info.metadata.name || 'You') : 'Opponent',
        picture: !dealer ? info.metadata.picture : undefined,
      },
      10000
    );
    
    setGameState(initialState);
    
    const sub = gameService.subscribeToGameEvents(gameId!, (event) => {
      console.log('📨 Received:', event.type);
      
      setGameState(prevState => {
        if (!prevState) return prevState;
        return gameService.applyGameEvent(prevState, event);
      });
    });
    
    return () => {
      if (sub) sub.close();
    };
  }, [navigate, gameId, role]);

  const startGame = async () => {
    if (!gameState || !userInfo || !isDealer) return;
    
    try {
      const newState = await gameService.startGame(gameState, userInfo.pubkey);
      setGameState(newState);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game');
    }
  };
  
  const dealFlopCards = async () => {
    if (!gameState || !userInfo || !isDealer) return;
    
    try {
      const newState = await gameService.dealFlopCards(gameState, userInfo.pubkey);
      setGameState(newState);
    } catch (error) {
      console.error('Error dealing flop:', error);
    }
  };
  
  const dealTurnCard = async () => {
    if (!gameState || !userInfo || !isDealer) return;
    
    try {
      const newState = await gameService.dealTurnCard(gameState, userInfo.pubkey);
      setGameState(newState);
    } catch (error) {
      console.error('Error dealing turn:', error);
    }
  };
  
  const dealRiverCard = async () => {
    if (!gameState || !userInfo || !isDealer) return;
    
    try {
      const newState = await gameService.dealRiverCard(gameState, userInfo.pubkey);
      setGameState(newState);
    } catch (error) {
      console.error('Error dealing river:', error);
    }
  };

  const leaveGame = () => {
    if (confirm('Are you sure you want to leave this game?')) {
      navigate('/lobby');
    }
  };

  if (!userInfo || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noise">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lightning-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const isChallenger = role === 'challenger';
  const myCards = isChallenger ? gameState.challenger.cards : gameState.challenged.cards;
  const opponentCards = isChallenger ? gameState.challenged.cards : gameState.challenger.cards;
  
  const myHand: Card[] = myCards.map(id => createCardFromId(id));
  const opponentHand: Card[] = opponentCards.map(id => createCardFromId(id));
  
  const communityCards = {
    flop: gameState.communityCards.flop?.map(id => createCardFromId(id)) as [Card, Card, Card] | undefined,
    turn: gameState.communityCards.turn ? createCardFromId(gameState.communityCards.turn) : undefined,
    river: gameState.communityCards.river ? createCardFromId(gameState.communityCards.river) : undefined,
  };

  const getStageDisplay = () => {
    switch (gameState.stage) {
      case 'waiting': return 'Waiting';
      case 'preflop': return 'Pre-Flop';
      case 'postflop': return 'Post-Flop';
      case 'postturn': return 'Post-Turn';
      case 'postriver': return 'Post-River';
      case 'showdown': return 'Showdown';
      case 'finished': return 'Finished';
      default: return gameState.stage;
    }
  };

  return (
    <div className="min-h-screen bg-noise flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={leaveGame}
                className="text-slate-400 hover:text-white transition-colors"
                title="Leave Game"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">Game #{gameId?.substring(0, 8)}</h1>
                <p className="text-xs text-slate-400">
                  {isDealer ? '⚡ Dealer' : '👤 Player'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm bg-slate-800 px-3 py-1 rounded-lg">
                <span className="text-slate-400">Stage:</span>
                <span className="ml-2 text-lightning-400 font-semibold">{getStageDisplay()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {gameState.stage === 'waiting' ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lightning-500 to-lightning-600 rounded-2xl mb-6 shadow-2xl shadow-lightning-500/50">
              <span className="text-6xl">🃏</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-gradient">Texas Hold'em</h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-8">
              {isDealer ? 'Ready to deal?' : 'Waiting for dealer...'}
            </p>
            
            {isDealer && (
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
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
            {/* Opponent Hand */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">Opponent</p>
              <div className="flex justify-center">
                {opponentHand.length > 0 ? (
                  <Hand cards={opponentHand} faceDown={true} size="md" />
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
              
              {/* Pot */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-slate-400">Pot</p>
                <p className="text-2xl sm:text-3xl font-bold text-lightning-400">
                  {gameState.pot.toLocaleString()} sats
                </p>
              </div>
            </div>
            
            {/* Your Hand */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">Your Hand</p>
              <div className="flex justify-center mb-4 sm:mb-6">
                {myHand.length > 0 ? (
                  <Hand cards={myHand} faceDown={false} size="lg" />
                ) : (
                  <div className="text-slate-600">Waiting...</div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                {isDealer && (
                  <>
                    {gameState.stage === 'preflop' && (
                      <button onClick={dealFlopCards} className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                        Deal Flop
                      </button>
                    )}
                    {gameState.stage === 'postflop' && (
                      <button onClick={dealTurnCard} className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                        Deal Turn
                      </button>
                    )}
                    {gameState.stage === 'postturn' && (
                      <button onClick={dealRiverCard} className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                        Deal River
                      </button>
                    )}
                  </>
                )}
                
                <button className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base" disabled>Fold</button>
                <button className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base" disabled>Check</button>
                <button className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base" disabled>Raise</button>
              </div>
              
              {!isDealer && (
                <p className="text-xs text-slate-500 mt-3 sm:mt-4">
                  ⏳ Dealer controls the game flow
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}