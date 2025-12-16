// ========================================
// POKER TYPES - Texas Hold'em
// ========================================

/**
 * Card Suits
 */
export type Suit = 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades

/**
 * Card Ranks (in ascending order)
 */
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/**
 * Individual Card with unique identity
 * Examples: "JH" (Jack of Hearts), "AS" (Ace of Spades), "10D" (Ten of Diamonds)
 */
export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // Unique identifier like "JH", "AS", "10D"
}

/**
 * Card ID type - enforces format like "JH", "AS", "10D"
 * Examples:
 * - "JH" = Jack of Hearts
 * - "AS" = Ace of Spades
 * - "10D" = Ten of Diamonds
 * - "2C" = Two of Clubs
 */
export type CardId = string;

/**
 * All possible card IDs in a standard 52-card deck
 */
export const ALL_CARD_IDS: CardId[] = [
  // Hearts
  '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
  // Diamonds
  '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
  // Clubs
  '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
  // Spades
  '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS',
];

/**
 * Deck of 52 cards
 */
export type Deck = Card[];

/**
 * Player's hole cards (2 cards in Texas Hold'em)
 */
export interface HoleCards {
  card1: Card;
  card2: Card;
}

/**
 * Community cards on the table (up to 5 in Texas Hold'em)
 */
export interface CommunityCards {
  flop?: [Card, Card, Card]; // First 3 cards
  turn?: Card;                // 4th card
  river?: Card;               // 5th card
}

/**
 * Hand Rankings (from lowest to highest)
 */
export enum HandRank {
  HighCard = 0,
  Pair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

/**
 * Evaluated poker hand with ranking
 */
export interface EvaluatedHand {
  rank: HandRank;
  cards: Card[];              // The 5 cards that make up the hand
  description: string;        // Human-readable like "Pair of Kings"
  value: number;              // Numeric value for comparison (higher is better)
}

/**
 * Betting actions
 */
export type BettingAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

/**
 * Player action in the game
 */
export interface PlayerAction {
  action: BettingAction;
  amount?: number;  // Amount for raise/call/all-in
  timestamp: number;
}

/**
 * Helper function to create a Card from its ID
 * @param cardId - Card identifier like "JH", "AS", "10D"
 * @returns Card object
 */
export function createCardFromId(cardId: CardId): Card {
  // Parse the card ID
  // Examples: "JH" -> rank="J", suit="H"
  //           "10D" -> rank="10", suit="D"
  
  const suit = cardId.charAt(cardId.length - 1) as Suit;
  const rank = cardId.slice(0, -1) as Rank;
  
  return {
    rank,
    suit,
    id: cardId,
  };
}

/**
 * Helper function to create a full 52-card deck
 * @returns Array of all 52 cards
 */
export function createDeck(): Deck {
  return ALL_CARD_IDS.map(createCardFromId);
}

/**
 * Helper function to get card display name
 * @param card - The card
 * @returns Human-readable name like "Jack of Hearts"
 */
export function getCardDisplayName(card: Card): string {
  const rankNames: Record<Rank, string> = {
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Ten',
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King',
    'A': 'Ace',
  };
  
  const suitNames: Record<Suit, string> = {
    'H': 'Hearts',
    'D': 'Diamonds',
    'C': 'Clubs',
    'S': 'Spades',
  };
  
  return `${rankNames[card.rank]} of ${suitNames[card.suit]}`;
}

/**
 * Helper function to get card emoji/symbol
 * @param card - The card
 * @returns Unicode card symbol like "🂡"
 */
export function getCardSymbol(card: Card): string {
  // Suit symbols
  const suitSymbols: Record<Suit, string> = {
    'H': '♥',  // Hearts (red)
    'D': '♦',  // Diamonds (red)
    'C': '♣',  // Clubs (black)
    'S': '♠',  // Spades (black)
  };
  
  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Helper function to check if card is red
 */
export function isRedCard(card: Card): boolean {
  return card.suit === 'H' || card.suit === 'D';
}

/**
 * Helper function to get numeric value of rank (for comparison)
 * Ace is high (14), King is 13, Queen is 12, Jack is 11
 */
export function getRankValue(rank: Rank): number {
  const rankValues: Record<Rank, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };
  
  return rankValues[rank];
}