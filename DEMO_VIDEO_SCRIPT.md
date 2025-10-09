# 🎥 Demo Video Script for Universal FHEVM SDK

**Duration**: 10-12 minutes
**Format**: Screen recording with voiceover
**Sections**: 4 main parts

---

## Part 1: Introduction & Problem Statement (0:00-2:00)

### Visual: Title Screen
**Show**: Project logo and title "Universal FHEVM SDK"

**Voiceover**:
> "Hi everyone! I'm excited to present the Universal FHEVM SDK, built for the Zama FHE Challenge. This SDK represents the next generation of confidential smart contract development, making encrypted computation simple, consistent, and accessible to all developers."

### Visual: Current Pain Points
**Show**: Code comparison showing current complexity

**Voiceover**:
> "Currently, building with FHEVM requires managing multiple dependencies, understanding complex encryption flows, and writing framework-specific code. What if we could make it as simple as using wagmi for web3 development?"

### Visual: Solution Overview
**Show**: Architecture diagram

**Voiceover**:
> "The Universal FHEVM SDK is framework-agnostic, works everywhere from Node.js to Next.js to Vue, and wraps all dependencies into a single package. Best of all, you can get started in less than 10 lines of code."

---

## Part 2: Quick Setup Demo (2:00-4:30)

### Visual: Terminal - Installation
**Show**: Running installation command

```bash
npm install @fhevm/sdk
```

**Voiceover**:
> "Installation is a breeze. Just one package, and you're ready to go."

### Visual: Code Editor - Basic Setup
**Show**: Creating client in 10 lines

```typescript
import { createFhevmClient, encrypt } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const client = createFhevmClient({
  provider,
  chainId: 11155111
});

await client.init();

const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...'
});
```

**Voiceover**:
> "Here's the complete setup. Import the SDK, create a client, initialize it, and you're encrypting values. That's it - just 10 lines from zero to encrypted."

### Visual: Browser - First Encryption
**Show**: Running the code and seeing encrypted output

**Voiceover**:
> "When we run this, we get back an encrypted input ready to send to our smart contract. The SDK handles all the complexity of FHE encryption behind the scenes."

---

## Part 3: Framework Demonstrations (4:30-8:00)

### Visual: React Hook Demo
**Show**: React component using useEncrypt hook

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

function VotingButton() {
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  const vote = async (choice: number) => {
    await encrypt(choice, 'euint8', {
      contractAddress: VOTING_CONTRACT,
      userAddress: address!
    });
  };

  return (
    <button onClick={() => vote(1)} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Vote Yes'}
    </button>
  );
}
```

**Voiceover**:
> "For React developers, we provide wagmi-style hooks. Look how clean this is - useEncrypt gives you the encryption function, loading state, and encrypted data. It feels natural if you've used wagmi or other web3 libraries."

### Visual: Vue Composable Demo
**Show**: Vue component using the same API

```typescript
import { useEncrypt } from '@fhevm/sdk/vue';

export default {
  setup() {
    const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

    const vote = async (choice: number) => {
      await encrypt(choice, 'euint8', {
        contractAddress: VOTING_CONTRACT,
        userAddress: address.value!
      });
    };

    return { vote, isEncrypting };
  }
}
```

**Voiceover**:
> "Vue developers get the exact same API, but with reactive refs. It's the same pattern, same simplicity - just framework-specific reactivity."

### Visual: Node.js Backend Demo
**Show**: Server-side encryption script

```typescript
import { createFhevmClient, encrypt } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(process.env.RPC_URL);
const client = createFhevmClient({ provider, chainId: 11155111 });

await client.init();

const encrypted = await encrypt(client, secretValue, 'euint64', {
  contractAddress: CONTRACT_ADDRESS,
  userAddress: SERVICE_ADDRESS
});
```

**Voiceover**:
> "The same SDK works on the backend too. Here we're using Node.js with a JSON-RPC provider to encrypt sensitive data server-side. One SDK, everywhere."

### Visual: Next.js Full-Stack Demo
**Show**: Combined client and server usage

**Voiceover**:
> "And of course, Next.js developers get the best of both worlds. Client components use React hooks, server actions use the core functions. It's seamless across the full stack."

---

## Part 4: Real-World Example - Parking Reservation (8:00-11:00)

### Visual: Application Overview
**Show**: Parking reservation app homepage

**Voiceover**:
> "To demonstrate real-world usage, I've built a complete parking reservation system. This app uses encrypted credit scores, confidential booking data, and private payment information."

### Visual: User Registration Flow
**Show**: Registering a user with encrypted credit score

**Voiceover**:
> "When a user registers, their credit score is encrypted client-side using our SDK. The encrypted value goes on-chain, but nobody - not even the contract owner - can see the actual score without permission."

### Visual: Making a Reservation
**Show**: Creating an encrypted parking reservation

**Voiceover**:
> "Booking a parking spot encrypts the reservation details. The duration, spot ID, and payment are all processed homomorphically on-chain. Privacy is preserved throughout."

### Visual: Decryption with Permissions
**Show**: User viewing their own encrypted data

**Voiceover**:
> "Only the user can decrypt their own data. The SDK handles EIP-712 signature generation, gateway communication, and all the complexity. The developer just calls decrypt and gets the plaintext back."

### Visual: Code Walkthrough
**Show**: Key parts of the implementation

**Voiceover**:
> "The implementation uses the same hooks we saw earlier. This real-world app proves the SDK isn't just a demo - it's production-ready."

---

## Part 5: Design Choices & Wrap-up (11:00-12:00)

### Visual: Design Principles
**Show**: Bullet points of key decisions

**Voiceover**:
> "Let me quickly explain some design choices. First, why framework-agnostic? Because developers use different tools, and forcing them to use React or Vue limits adoption. The core SDK works everywhere, and framework bindings are thin wrappers."

**Show**: wagmi comparison

**Voiceover**:
> "Second, why wagmi-style hooks? Because web3 developers already know this pattern. It's familiar, it's proven, and it reduces the learning curve to nearly zero."

**Show**: Single package benefits

**Voiceover**:
> "Third, why one package? Dependency management is painful. Bundling everything into @fhevm/sdk means developers install once and never worry about version conflicts or missing packages."

### Visual: Future Roadmap
**Show**: Planned features

**Voiceover**:
> "Looking ahead, we're planning Angular support, Svelte composables, batch optimization, and more example templates. But the foundation is solid and ready for production use today."

### Visual: Call to Action
**Show**: Links and resources

**Voiceover**:
> "Thank you for watching! The SDK is open source, fully documented, and ready to use. Links are in the description. I'd love to hear your feedback, and I can't wait to see what you build with confidential smart contracts. Happy encrypting!"

### Visual: End Screen
**Show**:
- GitHub: github.com/yourusername/fhevm-universal-sdk
- NPM: @fhevm/sdk
- Demo: fhevm-universal-sdk.vercel.app
- Docs: docs.example.com

---

## Recording Tips

### Setup
1. **Screen Resolution**: 1920x1080 or 1280x720
2. **Screen Recording Software**: OBS Studio or Loom
3. **Code Editor**: VS Code with clean theme
4. **Browser**: Chrome with clean profile (no personal bookmarks)

### Visual Polish
1. **Zoom Level**: 150% for code visibility
2. **Terminal**: Use large font (16-18pt)
3. **Mouse Highlighting**: Enable pointer highlight
4. **Smooth Scrolling**: Scroll slowly for readability

### Audio
1. **Microphone**: Use good quality USB mic
2. **Environment**: Quiet room, no background noise
3. **Speaking**: Clear, moderate pace, enthusiasm
4. **Volume**: Consistent levels, no clipping

### Editing
1. **Intro/Outro**: 5-second title cards
2. **Transitions**: Simple fades between sections
3. **Annotations**: Highlight key code lines
4. **Background Music**: Soft, non-distracting (optional)

### Export Settings
1. **Format**: MP4 (H.264)
2. **Resolution**: 1080p
3. **Frame Rate**: 30fps or 60fps
4. **Bitrate**: 8000-10000 kbps for quality

---

## B-Roll Suggestions

### Code Examples
- Typing out the 10-line setup
- IntelliSense autocomplete showing types
- Error handling examples
- Test results showing green checkmarks

### Visual Diagrams
- Architecture flow animation
- Encryption process visualization
- Network diagram (client → gateway → contract)

### Application Screenshots
- Next.js showcase homepage
- Parking app in action
- Multiple framework examples side-by-side

### Terminal Output
- Installation progress
- Test results
- Build output
- TypeScript compilation

---

## Key Messages to Emphasize

1. **< 10 Lines to Start** - Show this multiple times
2. **Framework Agnostic** - Works everywhere
3. **wagmi-Inspired** - Familiar to web3 devs
4. **Production Ready** - Real app example
5. **Complete Flow** - Init → Encrypt → Decrypt
6. **Type Safe** - TypeScript first
7. **Single Package** - No dependency hell

---

## Common Questions to Address

**Q: Does it work with my framework?**
A: Yes! Node.js, Next.js, React, Vue, vanilla JS - it works everywhere.

**Q: Is it production ready?**
A: Absolutely. Full test coverage, TypeScript support, and real-world examples.

**Q: How does it compare to using fhevmjs directly?**
A: It wraps fhevmjs with a simpler API, hooks for React/Vue, and handles all the boilerplate.

**Q: Can I use it on the backend?**
A: Yes! Node.js support with JsonRpcProvider.

**Q: Is there documentation?**
A: Comprehensive docs, API reference, and framework-specific guides.

---

## Demo Commands Reference

```bash
# Installation
npm install @fhevm/sdk

# Run Next.js showcase
cd examples/nextjs-showcase
npm run dev

# Run parking reservation example
cd examples/parking-reservation
npm run dev

# Run tests
npm test

# Build SDK
npm run build

# Type check
npm run typecheck
```

---

**Total Estimated Duration**: 12 minutes
**Target Audience**: Blockchain developers familiar with Ethereum and React/Vue
**Goal**: Demonstrate ease of use, completeness, and production readiness
