import { Card, getCardSymbol, isRedCard } from '../types/poker';

interface CardComponentProps {
  card: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CardComponent({ 
  card, 
  faceDown = false, 
  size = 'md',
  className = '' 
}: CardComponentProps) {
  const isRed = isRedCard(card);
  
  const sizeClasses = {
    sm: 'w-12 h-16 text-sm',
    md: 'w-16 h-24 text-lg',
    lg: 'w-20 h-28 text-xl',
  };
  
  if (faceDown) {
    return (
      <div 
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-blue-600 to-blue-800 
          rounded-lg border-2 border-blue-400
          flex items-center justify-center
          shadow-lg
          ${className}
        `}
      >
        <div className="text-2xl opacity-50">🂠</div>
      </div>
    );
  }
  
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        bg-white rounded-lg border-2 border-slate-300
        flex flex-col items-center justify-center
        shadow-lg hover:shadow-xl transition-shadow
        ${className}
      `}
    >
      <div className={`font-bold ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
        {getCardSymbol(card)}
      </div>
    </div>
  );
}

/**
 * Display a hand of cards
 */
interface HandProps {
  cards: Card[];
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Hand({ cards, faceDown = false, size = 'md' }: HandProps) {
  return (
    <div className="flex gap-2">
      {cards.map((card, index) => (
        <CardComponent 
          key={card.id} 
          card={card} 
          faceDown={faceDown}
          size={size}
          className="hover:scale-105 transition-transform cursor-pointer"
        />
      ))}
    </div>
  );
}

/**
 * Display community cards with labels
 */
interface CommunityCardsProps {
  flop?: [Card, Card, Card];
  turn?: Card;
  river?: Card;
  size?: 'sm' | 'md' | 'lg';
}

export function CommunityCardsDisplay({ flop, turn, river, size = 'md' }: CommunityCardsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-slate-400 uppercase tracking-wider">Community Cards</p>
      <div className="flex gap-3">
        {/* Flop */}
        {flop ? (
          flop.map((card, index) => (
            <CardComponent key={card.id} card={card} size={size} />
          ))
        ) : (
          <>
            <div className={`${size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'} bg-slate-800 rounded-lg border-2 border-slate-700 border-dashed`} />
            <div className={`${size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'} bg-slate-800 rounded-lg border-2 border-slate-700 border-dashed`} />
            <div className={`${size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'} bg-slate-800 rounded-lg border-2 border-slate-700 border-dashed`} />
          </>
        )}
        
        {/* Turn */}
        {turn ? (
          <CardComponent key={turn.id} card={turn} size={size} />
        ) : (
          <div className={`${size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'} bg-slate-800 rounded-lg border-2 border-slate-700 border-dashed`} />
        )}
        
        {/* River */}
        {river ? (
          <CardComponent key={river.id} card={river} size={size} />
        ) : (
          <div className={`${size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'} bg-slate-800 rounded-lg border-2 border-slate-700 border-dashed`} />
        )}
      </div>
    </div>
  );
}