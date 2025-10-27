import { useState } from 'react';
import WalletConnection from './components/WalletConnection';
import UserRegistration from './components/UserRegistration';
import SystemStats from './components/SystemStats';
import ParkingManagement from './components/ParkingManagement';
import QueryFunctions from './components/QueryFunctions';
import MyReservations from './components/MyReservations';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen p-5">
        <div className="max-w-7xl mx-auto">
          <header className="text-center text-white mb-10">
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">
              🚗 Private Parking Reservation System
            </h1>
            <p className="text-xl opacity-90">
              Privacy-preserving parking resource allocation platform based on Zama FHE technology
            </p>
          </header>

          <WalletConnection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <UserRegistration />
            <SystemStats />
          </div>

          <ParkingManagement />

          <QueryFunctions />

          <MyReservations />
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;
