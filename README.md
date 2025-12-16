# bitcoin-poker-hackathon
Playing heads up Texas Hold Em in the browser

## ⚡ Lightning Wallet - Testnet Edition

A React + TypeScript Lightning Network wallet prototype with Nostr authentication. Built for Bitcoin testnet experimentation.

## Features

- 🔐 **Nostr Authentication** - Login with your Nostr identity
- ⚡ **Lightning Wallet** - Testnet Lightning Network wallet interface
- 💰 **Balance Management** - Add and track testnet satoshis
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- 🔒 **Privacy-Focused** - Client-side authentication (backend optional)

## Prerequisites

Before running this app, you'll need:

1. **Node.js** (v18 or higher)
2. **A Nostr browser extension** - Install one of these:
   - [nos2x](https://github.com/fiatjaf/nos2x) (Chrome/Firefox)
   - [Alby](https://getalby.com/) (Chrome/Firefox/Safari)

## Installation

1. **Clone or navigate to the project:**
   ```bash
   cd lightning-wallet-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Usage

### 1. Login with Nostr

- Click "Sign in with Nostr" on the login page
- Your Nostr extension will prompt you to sign a challenge
- Approve the signature to authenticate

### 2. Add Balance

- On the dashboard, click "Add Balance"
- Enter an amount in satoshis or use preset amounts
- Click "Add Balance" to simulate adding funds

**Note:** This is a testnet simulation. In a production app:
- You'd fund your wallet from a testnet faucet
- Open Lightning channels with testnet nodes
- Receive real testnet Lightning payments

### 3. View Your Wallet

The dashboard shows:
- Total balance (in sats and BTC)
- Transaction statistics
- Lightning address
- Recent activity

## Project Structure

```
lightning-wallet-app/
├── src/
│   ├── components/
│   │   ├── AddBalanceModal.tsx    # Modal for adding balance
│   │   └── WalletCard.tsx         # Main wallet display card
│   ├── pages/
│   │   ├── Login.tsx              # Nostr login page
│   │   └── Dashboard.tsx          # Main wallet dashboard
│   ├── services/
│   │   └── NostrAuthService.ts    # Nostr authentication logic
│   ├── types.ts                   # TypeScript type definitions
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles & Tailwind
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind CSS config
└── vite.config.ts                 # Vite config
```

## Next Steps: LDK/BDK Integration

This is currently a frontend skeleton. To integrate real Lightning functionality:

### 1. Add WASM Dependencies

```bash
# Install the necessary packages (when available)
npm install @lightningdevkit/ldk-node-wasm
npm install @bitcoindevkit/bdk-wasm
```

### 2. Create WASM Service

Create `src/services/LightningService.ts`:

```typescript
// Load LDK WASM module
import * as LDK from '@lightningdevkit/ldk-node-wasm';
import * as BDK from '@bitcoindevkit/bdk-wasm';

class LightningService {
  private node: LDK.Node | null = null;
  private wallet: BDK.Wallet | null = null;

  async initialize(network: 'testnet' | 'mainnet') {
    // Initialize BDK wallet for on-chain
    this.wallet = await BDK.Wallet.new(/* config */);
    
    // Initialize LDK node for Lightning
    this.node = await LDK.Node.new(/* config */);
    
    await this.node.start();
  }

  async createInvoice(amountMsat: number): Promise<string> {
    // Create Lightning invoice
    return await this.node.createInvoice(amountMsat);
  }

  async payInvoice(invoice: string): Promise<void> {
    // Pay Lightning invoice
    await this.node.sendPayment(invoice);
  }
  
  // ... more methods
}

export const lightningService = new LightningService();
```

### 3. Update Components

### How it Works (No Backend)
Modify the Dashboard and WalletCard components to use real LDK/BDK methods instead of mocked values.

How It Works (No Backend!):
Player 1 Browser          Nostr Relays          Player 2 Browser
     │                         │                        │
     ├──► fetchFollowers() ────┤                        │
     │                         │                        │
     ├──► createChallenge() ───┤                        │
     │    (kind 30000 event)   │                        │
     │                         ├────► subscription ─────┤
     │                         │      (gets challenge)  │
     │                         │                        │
Nostr Events Used:

Kind 0: User profiles (name, picture)
Kind 3: Contact lists (followers)
Kind 30000: Game challenges (custom event type)

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Nostr** - Authentication protocol

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Important Notes

⚠️ **Testnet Only** - This wallet is designed for Bitcoin testnet. Never use testnet wallets for real funds.

⚠️ **Frontend Only** - Currently, this is a frontend skeleton. Real Lightning functionality requires:
- LDK WASM integration
- BDK WASM integration
- Proper key management
- Channel management
- Backend for authentication (optional)

⚠️ **Security** - This is a prototype for learning. For production:
- Implement proper key storage
- Add backup/recovery mechanisms
- Use secure authentication
- Add rate limiting
- Implement proper error handling

## License

MIT

## Contributing

Contributions welcome! This is a learning project to demonstrate Lightning + Nostr integration.