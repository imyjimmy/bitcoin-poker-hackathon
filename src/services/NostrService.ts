import { relayInit, SimplePool, Event } from 'nostr-tools';
import { npubEncode } from 'nostr-tools/nip19'; // ADD THIS

export interface NostrFollower {
  pubkey: string;
  profile?: {
    name?: string;
    display_name?: string;
    picture?: string;
    about?: string;
  };
}

export interface GameChallenge {
  challengeId: string;
  challenger: string;
  challenged: string;
  buyIn: number;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined' | 'active';
}

export function formatPubkey(hexPubkey: string, type: 'npub' | 'short' = 'short'): string {
  if (type === 'npub') {
    return npubEncode(hexPubkey);
  }
  // Short format: npub1...xyz (first 8 + last 4 of npub)
  const npub = npubEncode(hexPubkey);
  return `${npub.substring(0, 12)}...${npub.substring(npub.length - 4)}`;
}

class NostrService {
  private pool: SimplePool;
  private relays = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band',
  ];

  constructor() {
    this.pool = new SimplePool();
  }

  async fetchFollowers(pubkey: string): Promise<NostrFollower[]> {
    try {
      // Fetch the user's contact list (kind 3)
      const events = await this.pool.querySync(this.relays, {
        kinds: [3],
        authors: [pubkey],
        limit: 1
      });

      if (events.length === 0) {
        console.log('No contacts found');
        return [];
      }

      // Extract pubkeys from the 'p' tags
      const contactEvent = events[0];
      const followedPubkeys = contactEvent.tags
        .filter(tag => tag[0] === 'p')
        .map(tag => tag[1]);

      console.log(`Found ${followedPubkeys.length} followers`);

      // Fetch profiles for these pubkeys (kind 0)
      const profiles = await this.pool.querySync(this.relays, {
        kinds: [0],
        authors: followedPubkeys.slice(0, 50), // Limit to first 50 for demo
      });

      // Map pubkeys to profiles
      const profileMap = new Map<string, any>();
      profiles.forEach(event => {
        try {
          const profile = JSON.parse(event.content);
          profileMap.set(event.pubkey, profile);
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      });

      // Create follower objects
      const followers: NostrFollower[] = followedPubkeys.slice(0, 100).map(pubkey => ({
        pubkey,
        profile: profileMap.get(pubkey) || {
          name: `User ${pubkey.substring(0, 8)}`,
          picture: `https://api.dicebear.com/7.x/shapes/svg?seed=${pubkey}`
        }
      }));

      return followers;
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }

  async createChallenge(challengerPubkey: string, challengedPubkey: string, buyIn: number): Promise<string> {
    const challengeId = `game-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const event = {
      kind: 30000, // Custom game event
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['t', 'lightning-poker'],
        ['challenge', challengeId],
        ['p', challengedPubkey], // Tag the challenged player
        ['buyin', buyIn.toString()]
      ],
      content: JSON.stringify({
        type: 'CHALLENGE',
        challengeId,
        challenger: challengerPubkey,
        challenged: challengedPubkey,
        buyIn,
        timestamp: Date.now()
      })
    };

    if (!window.nostr) {
      throw new Error('Nostr extension not found');
    }

    const signedEvent = await window.nostr.signEvent(event);
    await this.pool.publish(this.relays, signedEvent);

    console.log('Challenge created:', challengeId);
    return challengeId;
  }

  async fetchIncomingChallenges(pubkey: string): Promise<GameChallenge[]> {
    try {
      const events = await this.pool.querySync(this.relays, {
        kinds: [30000],
        '#p': [pubkey],
        '#t': ['lightning-poker'],
        limit: 20
      });

      const challenges: GameChallenge[] = events.map(event => {
        try {
          const content = JSON.parse(event.content);
          return {
            challengeId: content.challengeId,
            challenger: content.challenger,
            challenged: content.challenged,
            buyIn: content.buyIn,
            timestamp: content.timestamp,
            status: 'pending' as const
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean) as GameChallenge[];

      return challenges;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }

  subscribeToIncomingChallenges(pubkey: string, callback: (challenge: GameChallenge) => void) {
    const sub = this.pool.subscribeMany(
      this.relays,
      [
        {
          kinds: [30000],
          '#p': [pubkey],
          '#t': ['lightning-poker'],
          since: Math.floor(Date.now() / 1000)
        }
      ],
      {
        onevent(event) {
          try {
            const content = JSON.parse(event.content);
            if (content.type === 'CHALLENGE') {
              callback({
                challengeId: content.challengeId,
                challenger: content.challenger,
                challenged: content.challenged,
                buyIn: content.buyIn,
                timestamp: content.timestamp,
                status: 'pending'
              });
            }
          } catch (e) {
            console.error('Error parsing challenge event:', e);
          }
        }
      }
    );

    return sub;
  }

  async fetchProfile(pubkey: string): Promise<any> {
    try {
      const events = await this.pool.querySync(this.relays, {
        kinds: [0],
        authors: [pubkey],
        limit: 1
      });

      if (events.length > 0) {
        return JSON.parse(events[0].content);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }

    return {
      name: `User ${pubkey.substring(0, 8)}`,
      picture: `https://api.dicebear.com/7.x/shapes/svg?seed=${pubkey}`
    };
  }

  close() {
    this.pool.close(this.relays);
  }
}

export const nostrService = new NostrService();