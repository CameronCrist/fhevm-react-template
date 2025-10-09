# 📖 Code Examples - Universal FHEVM SDK

Real-world examples for common use cases.

## Table of Contents

1. [Basic Encryption](#basic-encryption)
2. [User Registration](#user-registration)
3. [Confidential Voting](#confidential-voting)
4. [Private Auction](#private-auction)
5. [Encrypted Storage](#encrypted-storage)
6. [Batch Operations](#batch-operations)

---

## Basic Encryption

### Simple Value Encryption

```typescript
import { createFhevmClient, encrypt } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Setup
const provider = new BrowserProvider(window.ethereum);
const client = createFhevmClient({
  provider,
  chainId: 11155111,
});

await client.init();

// Encrypt a number
const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});

console.log(encrypted);
// {
//   handles: ['0x...'],
//   inputProof: '0x...'
// }
```

### React Component

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

function SimpleEncryption() {
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  return (
    <button onClick={() => encrypt(42, 'euint32', options)}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt 42'}
    </button>
  );
}
```

---

## User Registration

### Encrypted Credit Score

```typescript
// Component for user registration with encrypted credit score
function UserRegistration() {
  const client = useFhevmClient();
  const { address } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt(client);

  const [userId, setUserId] = useState('');
  const [creditScore, setCreditScore] = useState('700');

  const handleRegister = async () => {
    // Encrypt credit score
    const encrypted = await encrypt(Number(creditScore), 'euint16', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
    });

    if (!encrypted) return;

    // Call contract
    await contract.registerUser(
      userId,
      encrypted.handles[0],
      encrypted.inputProof
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
      <input
        type="number"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
      />

      <input
        type="number"
        min="300"
        max="850"
        value={creditScore}
        onChange={(e) => setCreditScore(e.target.value)}
        placeholder="Credit Score"
      />

      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Register'}
      </button>

      <p className="note">
        🔐 Credit score will be encrypted before submission
      </p>
    </form>
  );
}
```

### Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserRegistry {
    struct User {
        uint256 userId;
        bytes encryptedCreditScore; // Encrypted euint16
        bool isRegistered;
    }

    mapping(address => User) public users;

    function registerUser(
        uint256 userId,
        bytes32 handle,
        bytes calldata inputProof
    ) external {
        require(!users[msg.sender].isRegistered, "Already registered");

        users[msg.sender] = User({
            userId: userId,
            encryptedCreditScore: abi.encodePacked(handle),
            isRegistered: true
        });
    }
}
```

---

## Confidential Voting

### Vote Submission

```typescript
function ConfidentialVoting() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting } = useEncrypt(client);
  const { address } = useAccount();

  const vote = async (choice: number) => {
    // Encrypt vote choice (0 = No, 1 = Yes)
    const encrypted = await encrypt(choice, 'euint8', {
      contractAddress: VOTING_CONTRACT,
      userAddress: address!,
    });

    if (!encrypted) return;

    // Submit encrypted vote
    await votingContract.submitVote(
      encrypted.handles[0],
      encrypted.inputProof
    );
  };

  return (
    <div className="voting-buttons">
      <button
        onClick={() => vote(1)}
        disabled={isEncrypting}
        className="vote-yes"
      >
        Vote Yes
      </button>

      <button
        onClick={() => vote(0)}
        disabled={isEncrypting}
        className="vote-no"
      >
        Vote No
      </button>

      {isEncrypting && <p>Encrypting your vote...</p>}
    </div>
  );
}
```

### View Results

```typescript
function VotingResults({ proposalId }: { proposalId: number }) {
  const client = useFhevmClient();
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt(client);
  const { data: signer } = useSigner();

  const [totalVotes, setTotalVotes] = useState<number | null>(null);

  const viewResults = async () => {
    // Get encrypted vote count from contract
    const handle = await contract.getVoteCount(proposalId);

    // Decrypt (requires permission)
    const count = await decrypt(handle, {
      contractAddress: VOTING_CONTRACT,
      userAddress: address!,
      signer: signer!,
    });

    if (count !== null) {
      setTotalVotes(count as number);
    }
  };

  return (
    <div>
      <button onClick={viewResults} disabled={isDecrypting}>
        View Results
      </button>

      {totalVotes !== null && (
        <div>Total Votes: {totalVotes}</div>
      )}
    </div>
  );
}
```

---

## Private Auction

### Submit Encrypted Bid

```typescript
function AuctionBid({ auctionId }: { auctionId: number }) {
  const client = useFhevmClient();
  const { encrypt, isEncrypting } = useEncrypt(client);
  const [bidAmount, setBidAmount] = useState('');

  const submitBid = async () => {
    // Encrypt bid amount
    const encrypted = await encrypt(Number(bidAmount), 'euint64', {
      contractAddress: AUCTION_CONTRACT,
      userAddress: address!,
    });

    if (!encrypted) return;

    // Submit encrypted bid
    await auctionContract.submitBid(
      auctionId,
      encrypted.handles[0],
      encrypted.inputProof,
      { value: parseEther(bidAmount) }
    );
  };

  return (
    <div>
      <input
        type="number"
        step="0.01"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Bid amount (ETH)"
      />

      <button onClick={submitBid} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting Bid...' : 'Submit Bid'}
      </button>

      <p className="privacy-note">
        🔐 Your bid amount will remain private until auction ends
      </p>
    </div>
  );
}
```

---

## Encrypted Storage

### Store Private Data

```typescript
function EncryptedNotes() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting } = useEncrypt(client);
  const [note, setNote] = useState('');

  const saveNote = async () => {
    // Convert string to number (for demo - in production use proper encoding)
    const noteValue = Buffer.from(note).readUInt32BE(0);

    const encrypted = await encrypt(noteValue, 'euint32', {
      contractAddress: STORAGE_CONTRACT,
      userAddress: address!,
    });

    if (!encrypted) return;

    await storageContract.storeNote(
      encrypted.handles[0],
      encrypted.inputProof
    );
  };

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Your private note"
      />

      <button onClick={saveNote} disabled={isEncrypting}>
        Save (Encrypted)
      </button>
    </div>
  );
}
```

---

## Batch Operations

### Encrypt Multiple Values

```typescript
function BatchEncryption() {
  const client = useFhevmClient();
  const [values, setValues] = useState([10, 20, 30, 40, 50]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [results, setResults] = useState<EncryptedInput[]>([]);

  const encryptAll = async () => {
    setIsEncrypting(true);

    try {
      const encrypted = await Promise.all(
        values.map(value =>
          client.encrypt(value, 'euint32', {
            contractAddress: CONTRACT_ADDRESS,
            userAddress: address!,
          })
        )
      );

      setResults(encrypted);
    } catch (error) {
      console.error('Batch encryption failed:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div>
      <h3>Values to Encrypt:</h3>
      <ul>
        {values.map((v, i) => <li key={i}>{v}</li>)}
      </ul>

      <button onClick={encryptAll} disabled={isEncrypting}>
        {isEncrypting ? `Encrypting ${values.length} values...` : 'Encrypt All'}
      </button>

      {results.length > 0 && (
        <div>
          <h3>Encrypted Results:</h3>
          <ul>
            {results.map((r, i) => (
              <li key={i}>
                Handle: {r.handles[0].substring(0, 10)}...
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Using batchEncrypt Helper

```typescript
import { batchEncrypt } from '@fhevm/sdk';

async function encryptMultiple() {
  const encrypted = await batchEncrypt(
    client,
    [
      { value: 10, type: 'euint32' },
      { value: 20, type: 'euint32' },
      { value: true, type: 'ebool' },
    ],
    {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
    }
  );

  return encrypted;
}
```

---

## Error Handling

### Retry Failed Encryption

```typescript
import { retry } from '@fhevm/sdk';

function RobustEncryption() {
  const client = useFhevmClient();

  const encryptWithRetry = async (value: number) => {
    try {
      const encrypted = await retry(
        () => client.encrypt(value, 'euint32', {
          contractAddress: CONTRACT_ADDRESS,
          userAddress: address!,
        }),
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoffFactor: 2,
        }
      );

      return encrypted;
    } catch (error) {
      console.error('Failed after 3 attempts:', error);
      return null;
    }
  };

  return (
    <button onClick={() => encryptWithRetry(42)}>
      Encrypt with Retry
    </button>
  );
}
```

---

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [React Guide](./framework-guides/react.md) - React integration
- [Real-World Example](../examples/parking-reservation/README.md) - Parking reservation app

---

**More examples coming soon!**
