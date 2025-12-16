import { SimplePool } from 'nostr-tools';
import { GameState, GameEvent, createInitialGameState } from '../types/gameState';
import { CardId, createDeck } from '../types/poker';
import { shuffleDeckWithSeed, dealHoleCards, dealFlop, dealTurn, dealRiver, cardsToCardIds } from '../utils/deckUtils';

class GameService {
  private pool: SimplePool;
  private relays = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band',
  ];

  constructor() {
    this.pool = new SimplePool();
  }

  /**
   * Publish a game event to Nostr
   */
  async publishGameEvent(event: GameEvent): Promise<void> {
    console.log('🔵 PUBLISHING EVENT:', event.type, event.data);
    
    const nostrEvent = {
      kind: 30001,
      created_at: Math.floor(event.timestamp / 1000),
      tags: [
        ['game', event.gameId],
        ['event_type', event.type],
        ['t', 'lightning-poker'],
      ],
      content: JSON.stringify(event),
    };

    if (!window.nostr) {
      throw new Error('Nostr extension not found');
    }

    const signedEvent = await window.nostr.signEvent(nostrEvent);
    console.log('✅ Signed event:', signedEvent.id);
    
    const results = await Promise.allSettled(
      this.relays.map(relay => this.pool.publish([relay], signedEvent))
    );
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Published to ${this.relays[index]}`);
      } else {
        console.error(`❌ Failed to publish to ${this.relays[index]}:`, result.reason);
      }
    });
    
    console.log('🔵 PUBLISH COMPLETE');
  }

  /**
   * Subscribe to game events for a specific game
   * Fetches historical events first, then subscribes to new ones
   */
  async subscribeToGameEvents(
    gameId: string, 
    callback: (event: GameEvent) => void,
    onHistoryLoaded?: () => void
  ) {
    console.log('🟢 SUBSCRIBING to game:', gameId);
    
    // STEP 1: Fetch historical events
    console.log('📜 Fetching history from:', this.relays);
    
    const historicalEvents = await this.pool.querySync(
      this.relays,
      [
        {
          kinds: [30001],
          '#game': [gameId],
          '#t': ['lightning-poker'],
        }
      ]
    );
    
    console.log(`📜 Found ${historicalEvents.length} historical events`);
    
    // Sort and apply
    historicalEvents.sort((a, b) => a.created_at - b.created_at);
    
    for (const nostrEvent of historicalEvents) {
      try {
        const gameEvent = JSON.parse(nostrEvent.content) as GameEvent;
        console.log('📜 REPLAYING:', gameEvent.type, gameEvent.data);
        callback(gameEvent);
      } catch (e) {
        console.error('❌ Error parsing historical event:', e);
      }
    }
    
    if (onHistoryLoaded) {
      onHistoryLoaded();
    }
    
    // STEP 2: Subscribe to new events
    console.log('🔔 Starting subscription with filter:', {
      kinds: [30001],
      '#game': [gameId],
      '#t': ['lightning-poker'],
    });

    const sub = this.pool.subscribeMany(
      this.relays,
      [
        {
          kinds: [30001],
          '#game': [gameId],
          '#t': ['lightning-poker'],
        }
      ] as any,
      {
        onevent(nostrEvent) {
          console.log('🔔 RAW EVENT RECEIVED:', {
            id: nostrEvent.id,
            kind: nostrEvent.kind,
            tags: nostrEvent.tags,
            game: nostrEvent.tags.find(t => t[0] === 'game')?.[1],
          });
          try {
            const gameEvent = JSON.parse(nostrEvent.content) as GameEvent;
            console.log('🔔 PARSED EVENT:', gameEvent.type, gameEvent.data);
            callback(gameEvent);
          } catch (e) {
            console.error('❌ Error parsing event:', e);
          }
        },
        oneose() {
          console.log('✅ Subscription established (EOSE received)');
        },
        onclose() {
          console.log('❌ Subscription closed!');
        }
      }
    );

    return sub;
  }

  /**
   * Start the game (dealer/challenger only)
   */
  async startGame(gameState: GameState, dealerPubkey: string): Promise<GameState> {
    // Generate random seed
    const seed = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Shuffle deck with seed
    const deck = createDeck();
    const shuffled = shuffleDeckWithSeed(deck, seed);
    
    // Deal hole cards
    const { playerHands } = dealHoleCards(shuffled, 2);
    
    const newState: GameState = {
      ...gameState,
      deckSeed: seed,
      stage: 'preflop',
      challenger: {
        ...gameState.challenger,
        cards: cardsToCardIds(playerHands[0]),
      },
      challenged: {
        ...gameState.challenged,
        cards: cardsToCardIds(playerHands[1]),
      },
      lastUpdate: Date.now(),
    };

    // Publish event
    await this.publishGameEvent({
      type: 'GAME_START',
      gameId: gameState.gameId,
      pubkey: dealerPubkey,
      timestamp: Date.now(),
      data: {
        seed,
        newStage: 'preflop',
      },
    });

    return newState;
  }

  /**
   * Deal flop
   */
  async dealFlopCards(gameState: GameState, dealerPubkey: string): Promise<GameState> {
    const deck = createDeck();
    const shuffled = shuffleDeckWithSeed(deck, gameState.deckSeed);
    const afterHoleCards = shuffled.slice(4);
    const { flop } = dealFlop(afterHoleCards);
    const flopIds = cardsToCardIds(flop) as [CardId, CardId, CardId];

    const newState: GameState = {
      ...gameState,
      stage: 'postflop',
      communityCards: { flop: flopIds },
      currentBet: 0,
      challenger: { ...gameState.challenger, bet: 0 },
      challenged: { ...gameState.challenged, bet: 0 },
      lastUpdate: Date.now(),
    };

    await this.publishGameEvent({
      type: 'DEAL_FLOP',
      gameId: gameState.gameId,
      pubkey: dealerPubkey,
      timestamp: Date.now(),
      data: {
        cards: flopIds,
        newStage: 'postflop',
      },
    });

    return newState;
  }

  /**
   * Deal turn
   */
  async dealTurnCard(gameState: GameState, dealerPubkey: string): Promise<GameState> {
    const deck = createDeck();
    const shuffled = shuffleDeckWithSeed(deck, gameState.deckSeed);
    const afterFlop = shuffled.slice(9);
    const { turn } = dealTurn(afterFlop);

    const newState: GameState = {
      ...gameState,
      stage: 'postturn',
      communityCards: {
        ...gameState.communityCards,
        turn: turn.id,
      },
      currentBet: 0,
      challenger: { ...gameState.challenger, bet: 0 },
      challenged: { ...gameState.challenged, bet: 0 },
      lastUpdate: Date.now(),
    };

    await this.publishGameEvent({
      type: 'DEAL_TURN',
      gameId: gameState.gameId,
      pubkey: dealerPubkey,
      timestamp: Date.now(),
      data: {
        cards: [turn.id],
        newStage: 'postturn',
      },
    });

    return newState;
  }

  /**
   * Deal river
   */
  async dealRiverCard(gameState: GameState, dealerPubkey: string): Promise<GameState> {
    const deck = createDeck();
    const shuffled = shuffleDeckWithSeed(deck, gameState.deckSeed);
    const afterTurn = shuffled.slice(11);
    const { river } = dealRiver(afterTurn);

    const newState: GameState = {
      ...gameState,
      stage: 'postriver',
      communityCards: {
        ...gameState.communityCards,
        river: river.id,
      },
      currentBet: 0,
      challenger: { ...gameState.challenger, bet: 0 },
      challenged: { ...gameState.challenged, bet: 0 },
      lastUpdate: Date.now(),
    };

    await this.publishGameEvent({
      type: 'DEAL_RIVER',
      gameId: gameState.gameId,
      pubkey: dealerPubkey,
      timestamp: Date.now(),
      data: {
        cards: [river.id],
        newStage: 'postriver',
      },
    });

    return newState;
  }

  /**
   * Apply event to local state
   */
  applyGameEvent(gameState: GameState, event: GameEvent): GameState {
    console.log('Applying event:', event.type, event.data);

    switch (event.type) {
      case 'GAME_START':
        if (!event.data?.seed) return gameState;
        
        const deck = createDeck();
        const shuffled = shuffleDeckWithSeed(deck, event.data.seed);
        const { playerHands } = dealHoleCards(shuffled, 2);
        
        return {
          ...gameState,
          deckSeed: event.data.seed,
          stage: 'preflop',
          challenger: {
            ...gameState.challenger,
            cards: cardsToCardIds(playerHands[0]),
          },
          challenged: {
            ...gameState.challenged,
            cards: cardsToCardIds(playerHands[1]),
          },
          lastUpdate: event.timestamp,
        };

      case 'DEAL_FLOP':
        if (!event.data?.cards) return gameState;
        return {
          ...gameState,
          stage: 'postflop',
          communityCards: {
            flop: event.data.cards as [CardId, CardId, CardId],
          },
          currentBet: 0,
          challenger: { ...gameState.challenger, bet: 0 },
          challenged: { ...gameState.challenged, bet: 0 },
          lastUpdate: event.timestamp,
        };

      case 'DEAL_TURN':
        if (!event.data?.cards) return gameState;
        return {
          ...gameState,
          stage: 'postturn',
          communityCards: {
            ...gameState.communityCards,
            turn: event.data.cards[0],
          },
          currentBet: 0,
          challenger: { ...gameState.challenger, bet: 0 },
          challenged: { ...gameState.challenged, bet: 0 },
          lastUpdate: event.timestamp,
        };

      case 'DEAL_RIVER':
        if (!event.data?.cards) return gameState;
        return {
          ...gameState,
          stage: 'postriver',
          communityCards: {
            ...gameState.communityCards,
            river: event.data.cards[0],
          },
          currentBet: 0,
          challenger: { ...gameState.challenger, bet: 0 },
          challenged: { ...gameState.challenged, bet: 0 },
          lastUpdate: event.timestamp,
        };

      default:
        return gameState;
    }
  }

  close() {
    this.pool.close(this.relays);
  }
}

export const gameService = new GameService();