// Nostr types
export interface NostrProfile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
}

export interface UserInfo {
  pubkey: string;
  token: string;
  metadata: NostrProfile;
}

// Window extension for Nostr
declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: NostrEvent): Promise<NostrSignedEvent>;
    };
  }
}

export interface NostrEvent {
  kind: number;
  content: string;
  tags: string[][];
  created_at: number;
}

export interface NostrSignedEvent extends NostrEvent {
  id: string;
  pubkey: string;
  sig: string;
}

// Lightning Wallet types
export interface LightningWallet {
  balance: number; // in sats
  address: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  status: 'active' | 'pending' | 'closed';
}

export interface Payment {
  id: string;
  amount: number;
  type: 'sent' | 'received';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}
