<template>
  <div class="voting-card">
    <div class="card-header">
      <h3 class="proposal-title">{{ proposal.title }}</h3>
      <span v-if="proposal.active" class="status-badge active">Active</span>
      <span v-else class="status-badge inactive">Closed</span>
    </div>

    <div class="vote-counts">
      <div class="count-item">
        <span class="label">Yes Votes:</span>
        <span class="value">{{ proposal.yesVotes }}</span>
      </div>
      <div class="count-item">
        <span class="label">No Votes:</span>
        <span class="value">{{ proposal.noVotes }}</span>
      </div>
    </div>

    <div v-if="proposal.active" class="voting-buttons">
      <button
        @click="handleVote(true)"
        :disabled="isEncrypting || !isWalletConnected"
        class="vote-button yes"
      >
        {{ isEncrypting ? 'Encrypting...' : '👍 Vote Yes' }}
      </button>
      <button
        @click="handleVote(false)"
        :disabled="isEncrypting || !isWalletConnected"
        class="vote-button no"
      >
        {{ isEncrypting ? 'Encrypting...' : '👎 Vote No' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      ❌ {{ error.message }}
    </div>

    <div v-if="encryptedData" class="success-message">
      ✅ Vote encrypted and submitted successfully!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEncrypt } from '@/composables/useEncrypt';
import type { FhevmClient } from '@fhevm/sdk';
import type { Ref } from 'vue';

interface Proposal {
  id: number;
  title: string;
  yesVotes: number;
  noVotes: number;
  active: boolean;
}

const props = defineProps<{
  proposal: Proposal;
  fhevmClient: Ref<FhevmClient | null>;
  contractAddress: string;
  userAddress: string;
  isWalletConnected: boolean;
}>();

const emit = defineEmits<{
  voteSubmitted: [proposalId: number, encryptedVote: string, inputProof: string];
}>();

const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(props.fhevmClient);

const handleVote = async (choice: boolean) => {
  if (!props.isWalletConnected) {
    alert('Please connect your wallet first');
    return;
  }

  // Encrypt vote: 1 for Yes, 0 for No
  const encrypted = await encrypt(choice ? 1 : 0, 'euint8', {
    contractAddress: props.contractAddress,
    userAddress: props.userAddress,
  });

  if (encrypted) {
    // Emit event to parent to submit transaction
    emit('voteSubmitted', props.proposal.id, encrypted.handles[0], encrypted.inputProof);
  }
};
</script>

<style scoped>
.voting-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.proposal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.vote-counts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.count-item {
  display: flex;
  flex-direction: column;
}

.count-item .label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.count-item .value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.voting-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.vote-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.vote-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vote-button.yes {
  background: #10b981;
  color: white;
}

.vote-button.yes:hover:not(:disabled) {
  background: #059669;
}

.vote-button.no {
  background: #ef4444;
  color: white;
}

.vote-button.no:hover:not(:disabled) {
  background: #dc2626;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 14px;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background: #dcfce7;
  color: #166534;
  border-radius: 8px;
  font-size: 14px;
}
</style>
