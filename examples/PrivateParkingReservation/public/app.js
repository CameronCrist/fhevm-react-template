// Private Parking Reservation System - Frontend Application
class ParkingApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;

        // Contract Configuration - Update after deployment
        this.contractAddress = "0xCca46D59993Df50Bb3D9b169A199fC3F84f5c18e"; // Replace with actual contract address
        this.contractABI = [
            // Basic functions
            "function owner() view returns (address)",
            "function totalSpots() view returns (uint32)",
            "function reservationCounter() view returns (uint32)",

            // User management
            "function registerUser(uint32 _userId, uint16 _creditScore)",
            "function userProfiles(address) view returns (tuple(uint32, uint16, bool, uint256, uint256))",

            // Parking spot management
            "function addParkingSpot(uint16 _price, string _location)",
            "function checkSpotAvailability(uint32 spotId) returns (bool)",
            "function getSpotInfo(uint32 spotId) view returns (string, bool, uint256)",

            // Reservation management
            "function reserveSpot(uint32 spotId, uint256 duration, uint16 paymentAmount)",
            "function completeReservation(uint256 reservationId)",
            "function cancelReservation(uint256 reservationId)",
            "function getUserReservations(address user) view returns (uint256[])",
            "function getReservationInfo(uint256 reservationId) view returns (uint32, uint256, uint256, bool)",

            // Query functions
            "function getStatistics() view returns (uint32, uint256, uint256)",
            "function verifyUserIdentity(address user, uint32 providedUserId) returns (bool)",

            // Admin functions
            "function updateSpotPrice(uint32 spotId, uint16 newPrice)",
            "function setSpotMaintenance(uint32 spotId, bool inMaintenance)",
            "function emergencyReleaseSpot(uint32 spotId)",

            // Events
            "event UserRegistered(address indexed user)",
            "event SpotAdded(uint32 indexed spotId, string location)",
            "event ReservationCreated(uint256 indexed reservationId, uint32 indexed spotId, address indexed user)",
            "event ReservationCompleted(uint256 indexed reservationId, uint32 indexed spotId)",
            "event ReservationCancelled(uint256 indexed reservationId, uint32 indexed spotId)"
        ];

        this.initializeApp();
    }

    async initializeApp() {
        await this.checkWalletConnection();
        this.setupEventListeners();
        await this.loadSystemStats();
    }

    async checkWalletConnection() {
        console.log('Checking wallet connection...');
        console.log('ethers available:', typeof ethers !== 'undefined');
        console.log('window.ethereum available:', typeof window.ethereum !== 'undefined');

        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);

            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } else {
            this.showStatus('walletInfo', 'Please install MetaMask wallet', 'error');
        }
    }

    async connectWallet() {
        console.log('Connect wallet clicked');

        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            this.showStatus('walletInfo', 'Ethers.js library failed to load. Please refresh the page.', 'error');
            return;
        }

        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            this.showStatus('walletInfo', 'Please install MetaMask wallet', 'error');
            return;
        }

        try {
            await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Check network
            const network = await this.provider.getNetwork();
            console.log('Connected network:', network);

            // Initialize contract
            if (this.contractAddress && this.contractAddress !== "0x...") {
                this.contract = new ethers.Contract(
                    this.contractAddress,
                    this.contractABI,
                    this.signer
                );
            }

            // Update UI
            document.getElementById('walletInfo').innerHTML = `
                <div class="wallet-address">
                    <strong>Connected:</strong><br>
                    ${this.userAddress}
                </div>
                <div>
                    <strong>Network:</strong> ${network.name} (${network.chainId})
                </div>
                <button id="disconnectWallet" class="btn btn-secondary">Disconnect</button>
            `;

            const disconnectBtn = document.getElementById('disconnectWallet');
            if (disconnectBtn) {
                disconnectBtn.addEventListener('click', () => {
                    this.disconnectWallet();
                });
            }

        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showStatus('walletInfo', 'Wallet connection failed: ' + error.message, 'error');
        }
    }

    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;

        document.getElementById('walletInfo').innerHTML = `
            <button id="connectWallet" class="btn">Connect MetaMask Wallet</button>
        `;

        const reconnectBtn = document.getElementById('connectWallet');
        if (reconnectBtn) {
            reconnectBtn.addEventListener('click', () => {
                this.connectWallet();
            });
        }
    }

    setupEventListeners() {
        // Wallet connection
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            console.log('Adding click listener to connect wallet button');
            connectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Connect wallet button clicked');
                this.connectWallet();
            });
        } else {
            console.log('Connect wallet button not found');
        }

        // User registration
        document.getElementById('registerUser').addEventListener('click', () => {
            this.registerUser();
        });

        // 停车位管理
        document.getElementById('addSpot').addEventListener('click', () => {
            this.addParkingSpot();
        });

        document.getElementById('reserveSpot').addEventListener('click', () => {
            this.reserveSpot();
        });

        // 查询功能
        document.getElementById('checkAvailability').addEventListener('click', () => {
            this.checkSpotAvailability();
        });

        document.getElementById('verifyIdentity').addEventListener('click', () => {
            this.verifyUserIdentity();
        });

        // System status
        document.getElementById('refreshStats').addEventListener('click', () => {
            this.loadSystemStats();
        });

        // My reservations
        document.getElementById('loadMyReservations').addEventListener('click', () => {
            this.loadMyReservations();
        });
    }

    async registerUser() {
        if (!this.contract) {
            this.showStatus('registerStatus', 'Please connect wallet and ensure contract address is correct', 'error');
            return;
        }

        const userId = document.getElementById('userId').value;
        const creditScore = document.getElementById('creditScore').value;

        if (!userId || !creditScore) {
            this.showStatus('registerStatus', 'Please fill in all fields', 'error');
            return;
        }

        if (creditScore < 300 || creditScore > 850) {
            this.showStatus('registerStatus', 'Credit score must be between 300-850', 'error');
            return;
        }

        try {
            this.showStatus('registerStatus', 'Registering user...', 'info');

            const tx = await this.contract.registerUser(userId, creditScore);
            this.showStatus('registerStatus', 'Transaction sent, waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus('registerStatus', 'User registration successful!', 'success');

            // Clear form
            document.getElementById('userId').value = '';
            document.getElementById('creditScore').value = '';

        } catch (error) {
            console.error('Registration failed:', error);
            this.showStatus('registerStatus', 'Registration failed: ' + error.message, 'error');
        }
    }

    async addParkingSpot() {
        if (!this.contract) {
            this.showStatus('parkingManagementStatus', 'Please connect wallet and ensure contract address is correct', 'error');
            return;
        }

        const price = document.getElementById('spotPrice').value;
        const location = document.getElementById('spotLocation').value;

        if (!price || !location) {
            this.showStatus('parkingManagementStatus', 'Please fill in price and location', 'error');
            return;
        }

        try {
            this.showStatus('parkingManagementStatus', 'Adding parking spot...', 'info');

            const tx = await this.contract.addParkingSpot(price, location);
            this.showStatus('parkingManagementStatus', 'Transaction sent, waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus('parkingManagementStatus', 'Parking spot added successfully!', 'success');

            // Clear form
            document.getElementById('spotPrice').value = '';
            document.getElementById('spotLocation').value = '';

            // Refresh statistics
            await this.loadSystemStats();

        } catch (error) {
            console.error('Adding parking spot failed:', error);
            this.showStatus('parkingManagementStatus', 'Adding failed: ' + error.message, 'error');
        }
    }

    async reserveSpot() {
        if (!this.contract) {
            this.showStatus('parkingManagementStatus', 'Please connect wallet and ensure contract address is correct', 'error');
            return;
        }

        const spotId = document.getElementById('reserveSpotId').value;
        const duration = document.getElementById('reserveDuration').value;
        const paymentAmount = document.getElementById('paymentAmount').value;

        if (!spotId || !duration || !paymentAmount) {
            this.showStatus('parkingManagementStatus', 'Please fill in all fields', 'error');
            return;
        }

        try {
            this.showStatus('parkingManagementStatus', 'Reserving parking spot...', 'info');

            const tx = await this.contract.reserveSpot(spotId, duration, paymentAmount);
            this.showStatus('parkingManagementStatus', 'Transaction sent, waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus('parkingManagementStatus', 'Parking spot reserved successfully!', 'success');

            // Clear form
            document.getElementById('reserveSpotId').value = '';
            document.getElementById('reserveDuration').value = '';
            document.getElementById('paymentAmount').value = '';

            // Refresh statistics
            await this.loadSystemStats();

        } catch (error) {
            console.error('Reservation failed:', error);
            this.showStatus('parkingManagementStatus', 'Reservation failed: ' + error.message, 'error');
        }
    }

    async checkSpotAvailability() {
        if (!this.contract) {
            this.showStatus('queryStatus', 'Please connect wallet and ensure contract address is correct', 'error');
            return;
        }

        const spotId = document.getElementById('checkSpotId').value;

        if (!spotId) {
            this.showStatus('queryStatus', 'Please enter parking spot ID', 'error');
            return;
        }

        try {
            this.showStatus('queryStatus', 'Checking availability...', 'info');

            // Note: This is an FHE function, returns encrypted result
            const isAvailable = await this.contract.checkSpotAvailability(spotId);

            // Get parking spot information
            const spotInfo = await this.contract.getSpotInfo(spotId);

            this.showStatus('queryStatus', `
                <strong>Parking Spot ${spotId} Information:</strong><br>
                Location: ${spotInfo[0]}<br>
                Active Status: ${spotInfo[1] ? 'Yes' : 'No'}<br>
                Reservation End Time: ${spotInfo[2] > 0 ? new Date(spotInfo[2] * 1000).toLocaleString() : 'Not reserved'}<br>
                <em>Note: Availability status is encrypted, needs decryption to view</em>
            `, 'info');

        } catch (error) {
            console.error('Query failed:', error);
            this.showStatus('queryStatus', 'Query failed: ' + error.message, 'error');
        }
    }

    async verifyUserIdentity() {
        if (!this.contract) {
            this.showStatus('queryStatus', 'Please connect wallet and ensure contract address is correct', 'error');
            return;
        }

        const userId = document.getElementById('verifyUserId').value;

        if (!userId) {
            this.showStatus('queryStatus', 'Please enter user ID', 'error');
            return;
        }

        try {
            this.showStatus('queryStatus', 'Verifying identity...', 'info');

            // Note: This is an FHE function, returns encrypted result
            const isValid = await this.contract.verifyUserIdentity(this.userAddress, userId);

            this.showStatus('queryStatus', `
                <strong>Identity Verification Result:</strong><br>
                <em>Returns encrypted verification result, needs decryption to view actual result</em>
            `, 'info');

        } catch (error) {
            console.error('Verification failed:', error);
            this.showStatus('queryStatus', 'Verification failed: ' + error.message, 'error');
        }
    }

    async loadSystemStats() {
        if (!this.contract) {
            document.getElementById('totalSpots').textContent = 'N/A';
            document.getElementById('totalReservations').textContent = 'N/A';
            document.getElementById('currentTime').textContent = 'N/A';
            return;
        }

        try {
            const stats = await this.contract.getStatistics();

            document.getElementById('totalSpots').textContent = stats[0].toString();
            document.getElementById('totalReservations').textContent = stats[1].toString();
            document.getElementById('currentTime').textContent = new Date(stats[2] * 1000).toLocaleTimeString();

        } catch (error) {
            console.error('Loading statistics failed:', error);
            document.getElementById('totalSpots').textContent = 'Error';
            document.getElementById('totalReservations').textContent = 'Error';
            document.getElementById('currentTime').textContent = 'Error';
        }
    }

    async loadMyReservations() {
        if (!this.contract || !this.userAddress) {
            this.showStatus('myReservations', 'Please connect wallet first', 'error');
            return;
        }

        try {
            const reservationIds = await this.contract.getUserReservations(this.userAddress);

            if (reservationIds.length === 0) {
                document.getElementById('myReservations').innerHTML =
                    '<div class="status status-info">You have no reservation records yet</div>';
                return;
            }

            let reservationsHtml = '<div class="parking-grid">';

            for (let i = 0; i < reservationIds.length; i++) {
                const reservationId = reservationIds[i];
                try {
                    const info = await this.contract.getReservationInfo(reservationId);
                    reservationsHtml += `
                        <div class="parking-spot ${info[3] ? 'spot-reserved' : 'spot-available'}">
                            <h4>Reservation #${reservationId}</h4>
                            <p><strong>Parking Spot:</strong> ${info[0]}</p>
                            <p><strong>Start:</strong> ${new Date(info[1] * 1000).toLocaleString()}</p>
                            <p><strong>End:</strong> ${new Date(info[2] * 1000).toLocaleString()}</p>
                            <p><strong>Status:</strong> ${info[3] ? 'In Progress' : 'Completed'}</p>
                            ${info[3] ? `<button onclick="app.completeReservation(${reservationId})" class="btn">Complete Reservation</button>` : ''}
                        </div>
                    `;
                } catch (error) {
                    console.error(`Failed to get reservation ${reservationId} information:`, error);
                }
            }

            reservationsHtml += '</div>';
            document.getElementById('myReservations').innerHTML = reservationsHtml;

        } catch (error) {
            console.error('Loading reservations failed:', error);
            this.showStatus('myReservations', 'Loading reservations failed: ' + error.message, 'error');
        }
    }

    async completeReservation(reservationId) {
        if (!this.contract) return;

        try {
            const tx = await this.contract.completeReservation(reservationId);
            await tx.wait();

            // Reload reservations
            await this.loadMyReservations();
            await this.loadSystemStats();

        } catch (error) {
            console.error('Complete reservation failed:', error);
            alert('Complete reservation failed: ' + error.message);
        }
    }

    showStatus(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.innerHTML = `<div class="status status-${type}">${message}</div>`;

        // Auto-clear success messages
        if (type === 'success') {
            setTimeout(() => {
                element.innerHTML = '';
            }, 5000);
        }
    }

    // Format address display
    formatAddress(address) {
        return address.slice(0, 6) + '...' + address.slice(-4);
    }

    // Format time display
    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }
}

// Initialize application
const app = new ParkingApp();

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            app.disconnectWallet();
        } else {
            app.connectWallet();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}

// Global function for HTML calls
window.app = app;