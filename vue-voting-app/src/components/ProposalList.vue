<template>
  <div class="proposal-list">
    <div class="header">
      <h2>Active Proposals</h2>
      <button @click="showCreateModal = true" class="create-button">
        ➕ Create Proposal
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      Loading proposals...
    </div>

    <div v-else-if="proposals.length === 0" class="empty-state">
      <p>No proposals yet. Create the first one!</p>
    </div>

    <div v-else class="proposals-grid">
      <VotingCard
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
        :fhevm-client="fhevmClient"
        :contract-address="contractAddress"
        :user-address="userAddress"
        :is-wallet-connected="isWalletConnected"
        @vote-submitted="handleVoteSubmitted"
      />
    </div>

    <!-- Create Proposal Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <h3>Create New Proposal</h3>
        <form @submit.prevent="handleCreateProposal">
          <div class="form-group">
            <label>Proposal Title:</label>
            <input
              v-model="newProposalTitle"
              type="text"
              placeholder="Enter proposal title..."
              required
              class="input-field"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="cancel-button">
              Cancel
            </button>
            <button type="submit" :disabled="isCreating" class="submit-button">
              {{ isCreating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VotingCard from './VotingCard.vue';
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
  fhevmClient: Ref<FhevmClient | null>;
  contractAddress: string;
  userAddress: string;
  isWalletConnected: boolean;
  contract: any;
}>();

const proposals = ref<Proposal[]>([]);
const isLoading = ref(false);
const showCreateModal = ref(false);
const newProposalTitle = ref('');
const isCreating = ref(false);

const loadProposals = async () => {
  if (!props.contract) return;

  isLoading.value = true;
  try {
    // Get proposal count
    const count = await props.contract.getProposalCount();
    const proposalCount = Number(count);

    const loadedProposals: Proposal[] = [];

    // Load each proposal
    for (let i = 0; i < proposalCount; i++) {
      const proposalData = await props.contract.getProposal(i);
      loadedProposals.push({
        id: i,
        title: proposalData[0],
        yesVotes: Number(proposalData[1]),
        noVotes: Number(proposalData[2]),
        active: proposalData[3],
      });
    }

    proposals.value = loadedProposals;
  } catch (error) {
    console.error('Error loading proposals:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleCreateProposal = async () => {
  if (!props.contract || !newProposalTitle.value.trim()) return;

  isCreating.value = true;
  try {
    const tx = await props.contract.createProposal(newProposalTitle.value);
    await tx.wait();

    // Reload proposals
    await loadProposals();

    // Reset form
    newProposalTitle.value = '';
    showCreateModal.value = false;
  } catch (error) {
    console.error('Error creating proposal:', error);
    alert('Failed to create proposal');
  } finally {
    isCreating.value = false;
  }
};

const handleVoteSubmitted = async (proposalId: number, encryptedVote: string, inputProof: string) => {
  if (!props.contract) return;

  try {
    const tx = await props.contract.vote(proposalId, encryptedVote, inputProof);
    await tx.wait();

    // Reload proposals to show updated vote count
    await loadProposals();
  } catch (error) {
    console.error('Error submitting vote:', error);
    alert('Failed to submit vote');
  }
};

onMounted(() => {
  loadProposals();
});

defineExpose({
  loadProposals,
});
</script>

<style scoped>
.proposal-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.create-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover {
  background: #2563eb;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 18px;
}

.proposals-grid {
  display: grid;
  gap: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.submit-button {
  background: #3b82f6;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2563eb;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
