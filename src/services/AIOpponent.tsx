import { GameState, BettingAction } from '../types/gameState';

class AIOpponentService {
  /**
   * AI makes a decision based on game state
   */
  async makeDecision(gameState: GameState, isChallenger: boolean): Promise<{
    action: BettingAction;
    amount?: number;
  }> {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiPlayer = isChallenger ? gameState.challenged : gameState.challenger;
    const opponentBet = isChallenger ? gameState.challenger.bet : gameState.challenged.bet;
    
    // Simple AI logic
    const random = Math.random();
    
    // If there's a bet to call
    if (opponentBet > aiPlayer.bet) {
      const callAmount = opponentBet - aiPlayer.bet;
      
      // 70% call, 20% fold, 10% raise
      if (random < 0.7) {
        return { action: 'call', amount: callAmount };
      } else if (random < 0.9) {
        return { action: 'fold' };
      } else {
        // Raise
        const raiseAmount = callAmount * 2;
        return { action: 'raise', amount: callAmount + raiseAmount };
      }
    } else {
      // No bet to call - check or bet
      if (random < 0.6) {
        return { action: 'check' };
      } else {
        // Make a small bet
        const betAmount = Math.floor(aiPlayer.chips * 0.1);
        return { action: 'raise', amount: betAmount };
      }
    }
  }
  
  /**
   * Get AI player info
   */
  getAIPlayer() {
    return {
      pubkey: 'ai-opponent',
      name: '🤖 AI Opponent',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-poker',
    };
  }
}

export const aiOpponent = new AIOpponentService();