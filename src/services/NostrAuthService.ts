import { NostrProfile, NostrSignedEvent } from '../types';

class AuthService {
  private baseUrl = window.location.origin;
  
  async challenge(): Promise<string> {
    // For now, generate a challenge locally since backend isn't implemented
    const challenge = `auth-challenge-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return challenge;
  }
  
  async signChallenge(challenge: string): Promise<NostrSignedEvent> {
    if (!window.nostr) {
      throw new Error('Please install a Nostr browser extension like nos2x or Alby');
    }
    
    const event = {
      kind: 1,
      content: challenge,
      tags: [['challenge', challenge]],
      created_at: Math.floor(Date.now() / 1000)
    };
    
    return await window.nostr.signEvent(event);
  }
  
  async verify(signedEvent: NostrSignedEvent): Promise<{ token: string; pubkey: string; metadata: NostrProfile }> {
    // Mock verification for frontend-only implementation
    // In production, this would call your backend API
    const token = `mock-token-${signedEvent.pubkey.substring(0, 16)}`;
    
    // Try to fetch profile metadata from a public relay (optional)
    const metadata: NostrProfile = {
      name: `User ${signedEvent.pubkey.substring(0, 8)}`,
      display_name: `User ${signedEvent.pubkey.substring(0, 8)}`,
      picture: `https://api.dicebear.com/7.x/shapes/svg?seed=${signedEvent.pubkey}`,
    };
    
    return {
      token,
      pubkey: signedEvent.pubkey,
      metadata
    };
  }
  
  async login(): Promise<{ token: string; pubkey: string; metadata: NostrProfile }> {
    try {
      const challenge = await this.challenge();
      const signedEvent = await this.signChallenge(challenge);
      const result = await this.verify(signedEvent);
      
      // Store in localStorage
      localStorage.setItem('nostr_token', result.token);
      localStorage.setItem('nostr_pubkey', result.pubkey);
      localStorage.setItem('nostr_metadata', JSON.stringify(result.metadata));
      
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  
  logout(): void {
    localStorage.removeItem('nostr_token');
    localStorage.removeItem('nostr_pubkey');
    localStorage.removeItem('nostr_metadata');
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('nostr_token');
  }
  
  getUserInfo(): { token: string; pubkey: string; metadata: NostrProfile } | null {
    const token = localStorage.getItem('nostr_token');
    const pubkey = localStorage.getItem('nostr_pubkey');
    const metadataStr = localStorage.getItem('nostr_metadata');
    
    if (!token || !pubkey || !metadataStr) {
      return null;
    }
    
    return {
      token,
      pubkey,
      metadata: JSON.parse(metadataStr)
    };
  }
}

export const NostrAuthService = new AuthService();
