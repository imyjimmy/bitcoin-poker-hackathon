import { CardId } from './poker';

/**
 * Game stages in Texas Hold'em
 */
export type GameStage = 
  | 'waiting'           // Waiting for second player
  | 'preflop'          // Before flop - first betting round
  | 'postflop'         // After flop - second betting round
  | 'postturn'         // After turn - third betting round
  | 'postriver'        // After river - final betting round
  | 'showdown'         // Revealing hands and determining winner
  | 'finished';        // Game over

/**
 * Betting actions
 */
export type BettingAction = 'check' | 'raise' | 'fold' | 'call' | 'all-in';

/**
 * Player action
 */
export interface PlayerAction {
  pubkey: string;
  action: BettingAction;
  amount?: number;
  timestamp: number;
}

/**
 * Player info in game
 */
export interface GamePlayer {
  pubkey: string;
  name: string;
  picture?: string;
  chips: number;           // Current chip count
  bet: number;             // Current bet in this round
  folded: boolean;
  allIn: boolean;
  cards: CardId[];         // Their hole cards (only visible to them)
}

/**
 * Complete game state
 */
export interface GameState {
  gameId: string;
  stage: GameStage;
  
  // Players
  challenger: GamePlayer;
  challenged: GamePlayer;
  
  // Deck and cards
  deckSeed: string;                    // Seed for deterministic shuffling
  communityCards: {
    flop?: [CardId, CardId, CardId];
    turn?: CardId;
    river?: CardId;
  };
  
  // Betting
  pot: number;
  currentBet: number;                  // Highest bet in current round
  currentPlayer: string;               // Pubkey of player whose turn it is
  
  // History
  actions: PlayerAction[];
  
  // Metadata
  buyIn: number;
  createdAt: number;
  lastUpdate: number;
}

/**
 * Game event types published to Nostr
 */
export type GameEventType =
  | 'GAME_START'
  | 'DEAL_FLOP'
  | 'DEAL_TURN'
  | 'DEAL_RIVER'
  | 'PLAYER_CHECK'
  | 'PLAYER_RAISE'
  | 'PLAYER_FOLD'
  | 'PLAYER_CALL'
  | 'PLAYER_ALL_IN'
  | 'ROUND_END'
  | 'GAME_END';

/**
 * Game event payload
 */
export interface GameEvent {
  type: GameEventType;
  gameId: string;
  pubkey: string;      // Player who triggered event
  timestamp: number;
  
  // Event-specific data
  data?: {
    seed?: string;           // For GAME_START
    cards?: CardId[];        // For dealing
    amount?: number;         // For betting actions
    newStage?: GameStage;    // For stage transitions
    winner?: string;         // For GAME_END
  };
}

/**
 * Initialize a new game state
 */
export function createInitialGameState(
  gameId: string,
  challenger: { pubkey: string; name: string; picture?: string },
  challenged: { pubkey: string; name: string; picture?: string },
  buyIn: number
): GameState {
  return {
    gameId,
    stage: 'waiting',
    challenger: {
      pubkey: challenger.pubkey,
      name: challenger.name,
      picture: challenger.picture,
      chips: buyIn,
      bet: 0,
      folded: false,
      allIn: false,
      cards: [],
    },
    challenged: {
      pubkey: challenged.pubkey,
      name: challenged.name,
      picture: challenged.picture,
      chips: buyIn,
      bet: 0,
      folded: false,
      allIn: false,
      cards: [],
    },
    deckSeed: '',
    communityCards: {},
    pot: 0,
    currentBet: 0,
    currentPlayer: challenger.pubkey, // Challenger starts
    actions: [],
    buyIn,
    createdAt: Date.now(),
    lastUpdate: Date.now(),
  };
}