import { Card, Deck, createDeck, CardId } from '../types/poker';

/**
 * Shuffle a deck using Fisher-Yates algorithm
 * @param deck - Deck to shuffle
 * @returns Shuffled deck (new array)
 */
export function shuffleDeck(deck: Deck): Deck {
  const shuffled = [...deck]; // Create copy
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle deck with a deterministic seed (for commit-reveal later)
 * Simple implementation - for production use a crypto-safe PRNG
 * @param deck - Deck to shuffle
 * @param seed - Random seed
 * @returns Shuffled deck
 */
export function shuffleDeckWithSeed(deck: Deck, seed: string): Deck {
  const shuffled = [...deck];
  
  // Simple seeded random (NOT cryptographically secure!)
  // For hackathon demo only - use proper PRNG in production
  let hashCode = 0;
  for (let i = 0; i < seed.length; i++) {
    hashCode = ((hashCode << 5) - hashCode) + seed.charCodeAt(i);
    hashCode = hashCode & hashCode; // Convert to 32-bit integer
  }
  
  const seededRandom = () => {
    hashCode = (hashCode * 9301 + 49297) % 233280;
    return hashCode / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Deal cards from the top of the deck
 * @param deck - Deck to deal from
 * @param count - Number of cards to deal
 * @returns Object with dealt cards and remaining deck
 */
export function dealCards(deck: Deck, count: number): { cards: Card[], remaining: Deck } {
  if (count > deck.length) {
    throw new Error(`Cannot deal ${count} cards from deck with ${deck.length} cards`);
  }
  
  const cards = deck.slice(0, count);
  const remaining = deck.slice(count);
  
  return { cards, remaining };
}

/**
 * Create and shuffle a new deck
 * @returns Shuffled deck ready to play
 */
export function createShuffledDeck(): Deck {
  const deck = createDeck();
  return shuffleDeck(deck);
}

/**
 * Deal hole cards to multiple players
 * @param deck - Deck to deal from
 * @param numPlayers - Number of players (2 for heads-up)
 * @returns Object with player hands and remaining deck
 */
export function dealHoleCards(deck: Deck, numPlayers: number): {
  playerHands: Card[][];
  remaining: Deck;
} {
  const playerHands: Card[][] = [];
  let remaining = [...deck];
  
  // Deal 2 cards to each player
  for (let i = 0; i < numPlayers; i++) {
    const { cards, remaining: newRemaining } = dealCards(remaining, 2);
    playerHands.push(cards);
    remaining = newRemaining;
  }
  
  return { playerHands, remaining };
}

/**
 * Burn a card (discard from top of deck, standard in Texas Hold'em)
 * @param deck - Deck to burn from
 * @returns Remaining deck after burning
 */
export function burnCard(deck: Deck): Deck {
  return deck.slice(1);
}

/**
 * Deal the flop (3 community cards)
 * @param deck - Deck to deal from
 * @returns Object with flop cards and remaining deck
 */
export function dealFlop(deck: Deck): { flop: [Card, Card, Card], remaining: Deck } {
  // Burn one card first (standard poker rules)
  const afterBurn = burnCard(deck);
  const { cards, remaining } = dealCards(afterBurn, 3);
  
  if (cards.length !== 3) {
    throw new Error('Flop must have exactly 3 cards');
  }
  
  return {
    flop: [cards[0], cards[1], cards[2]],
    remaining,
  };
}

/**
 * Deal the turn (4th community card)
 * @param deck - Deck to deal from
 * @returns Object with turn card and remaining deck
 */
export function dealTurn(deck: Deck): { turn: Card, remaining: Deck } {
  const afterBurn = burnCard(deck);
  const { cards, remaining } = dealCards(afterBurn, 1);
  
  return {
    turn: cards[0],
    remaining,
  };
}

/**
 * Deal the river (5th community card)
 * @param deck - Deck to deal from
 * @returns Object with river card and remaining deck
 */
export function dealRiver(deck: Deck): { river: Card, remaining: Deck } {
  const afterBurn = burnCard(deck);
  const { cards, remaining } = dealCards(afterBurn, 1);
  
  return {
    river: cards[0],
    remaining,
  };
}

/**
 * Convert CardId[] to Card[]
 * Useful when receiving card IDs from Nostr events
 */
export function cardIdsToCards(cardIds: CardId[]): Card[] {
  const deck = createDeck();
  const deckMap = new Map(deck.map(card => [card.id, card]));
  
  return cardIds.map(id => {
    const card = deckMap.get(id);
    if (!card) {
      throw new Error(`Invalid card ID: ${id}`);
    }
    return card;
  });
}

/**
 * Convert Card[] to CardId[]
 * Useful for sending cards via Nostr events
 */
export function cardsToCardIds(cards: Card[]): CardId[] {
  return cards.map(card => card.id);
}