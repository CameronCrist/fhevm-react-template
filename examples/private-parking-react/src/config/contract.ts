export const CONTRACT_ABI = [
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
