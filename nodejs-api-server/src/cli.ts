#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { initializeFhevmClient } from './fhevm-client.js';
import { EncryptionService } from './services/encryption.service.js';
import { ContractService } from './services/contract.service.js';
import type { EncryptedType } from '@fhevm/sdk';

dotenv.config();

const program = new Command();

program
  .name('fhevm-cli')
  .description('CLI tool for FHEVM SDK operations')
  .version('1.0.0');

/**
 * Encrypt command
 */
program
  .command('encrypt')
  .description('Encrypt a value')
  .requiredOption('-v, --value <value>', 'Value to encrypt')
  .requiredOption('-t, --type <type>', 'Encryption type (euint8, euint16, euint32, euint64, ebool)')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .action(async (options) => {
    try {
      await initializeFhevmClient();
      const encryptionService = new EncryptionService();

      const value = options.type === 'ebool'
        ? options.value === 'true'
        : Number(options.value);

      console.log(`\n🔐 Encrypting ${value} as ${options.type}...`);

      const result = await encryptionService.encrypt(
        value,
        options.type as EncryptedType,
        options.contract
      );

      if (result.success) {
        console.log('\n✅ Encryption successful!');
        console.log(`   Handle: ${result.data?.handles[0]}`);
        console.log(`   Proof: ${result.data?.inputProof.substring(0, 20)}...`);
      } else {
        console.error('\n❌ Encryption failed:', result.error);
      }
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Decrypt command
 */
program
  .command('decrypt')
  .description('Decrypt an encrypted handle')
  .requiredOption('-h, --handle <handle>', 'Encrypted handle to decrypt')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .action(async (options) => {
    try {
      await initializeFhevmClient();
      const encryptionService = new EncryptionService();

      console.log(`\n🔓 Decrypting handle ${options.handle.substring(0, 20)}...`);

      const result = await encryptionService.decrypt(
        options.handle,
        options.contract
      );

      if (result.success) {
        console.log('\n✅ Decryption successful!');
        console.log(`   Value: ${result.value}`);
      } else {
        console.error('\n❌ Decryption failed:', result.error);
      }
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Submit command
 */
program
  .command('submit')
  .description('Encrypt and submit a value to contract')
  .requiredOption('-v, --value <value>', 'Value to encrypt and submit')
  .requiredOption('-t, --type <type>', 'Encryption type')
  .option('-c, --contract <address>', 'Contract address', process.env.CONTRACT_ADDRESS)
  .action(async (options) => {
    try {
      await initializeFhevmClient();
      const encryptionService = new EncryptionService();
      const contractService = new ContractService(options.contract);

      const value = options.type === 'ebool'
        ? options.value === 'true'
        : Number(options.value);

      console.log(`\n🔐 Encrypting ${value} as ${options.type}...`);

      const encryptResult = await encryptionService.encrypt(
        value,
        options.type as EncryptedType,
        options.contract
      );

      if (!encryptResult.success) {
        console.error('\n❌ Encryption failed:', encryptResult.error);
        process.exit(1);
      }

      console.log('✅ Encryption successful!');
      console.log(`\n📤 Submitting to contract...`);

      const submitResult = await contractService.submitEncryptedValue(
        encryptResult.data!.handles[0],
        encryptResult.data!.inputProof
      );

      if (submitResult.success) {
        console.log('\n✅ Transaction confirmed!');
        console.log(`   TX Hash: ${submitResult.txHash}`);
        console.log(`   Block: ${submitResult.blockNumber}`);
      } else {
        console.error('\n❌ Submission failed:', submitResult.error);
      }
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
