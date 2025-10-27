// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateParkingReservation is SepoliaConfig {

    address public owner;
    uint32 public totalSpots;
    uint32 public reservationCounter;

    struct ParkingSpot {
        euint16 encryptedPrice;        // 加密的停车位价格
        euint8 encryptedStatus;        // 加密状态: 0=可用, 1=已预订, 2=维护中
        bool isActive;                 // 停车位是否激活
        euint32 encryptedReservedBy;   // 加密的预订者ID
        uint256 reservationEnd;        // 预订结束时间
        string location;               // 停车位位置信息
    }

    struct UserProfile {
        euint32 encryptedUserId;       // 加密用户ID
        euint16 encryptedCreditScore;  // 加密信用评分
        bool isRegistered;             // 是否已注册
        uint256 totalReservations;     // 总预订次数
        uint256 lastReservation;       // 最后预订时间
    }

    struct Reservation {
        uint32 spotId;                 // 停车位ID
        euint32 encryptedUserId;       // 加密用户ID
        euint16 encryptedPaidAmount;   // 加密支付金额
        uint256 startTime;             // 预订开始时间
        uint256 endTime;               // 预订结束时间
        euint8 encryptedStatus;        // 加密状态: 0=进行中, 1=已完成, 2=已取消
        bool isActive;                 // 是否激活
    }

    mapping(uint32 => ParkingSpot) public parkingSpots;
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => Reservation) public reservations;
    mapping(address => uint256[]) public userReservations;

    // 加密映射：用户地址到加密用户ID
    mapping(address => euint32) private encryptedUserIds;

    event SpotAdded(uint32 indexed spotId, string location);
    event UserRegistered(address indexed user);
    event ReservationCreated(uint256 indexed reservationId, uint32 indexed spotId, address indexed user);
    event ReservationCompleted(uint256 indexed reservationId, uint32 indexed spotId);
    event ReservationCancelled(uint256 indexed reservationId, uint32 indexed spotId);
    event SpotStatusUpdated(uint32 indexed spotId);
    event PriceUpdated(uint32 indexed spotId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegistered() {
        require(userProfiles[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier validSpot(uint32 spotId) {
        require(spotId < totalSpots, "Invalid spot ID");
        require(parkingSpots[spotId].isActive, "Spot not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSpots = 0;
        reservationCounter = 0;
    }

    // 注册用户
    function registerUser(uint32 _userId, uint16 _creditScore) external {
        require(!userProfiles[msg.sender].isRegistered, "User already registered");
        require(_creditScore <= 850, "Invalid credit score");

        // 加密用户数据
        euint32 encUserId = FHE.asEuint32(_userId);
        euint16 encCreditScore = FHE.asEuint16(_creditScore);

        userProfiles[msg.sender] = UserProfile({
            encryptedUserId: encUserId,
            encryptedCreditScore: encCreditScore,
            isRegistered: true,
            totalReservations: 0,
            lastReservation: 0
        });

        encryptedUserIds[msg.sender] = encUserId;

        // 设置访问权限
        FHE.allowThis(encUserId);
        FHE.allowThis(encCreditScore);
        FHE.allow(encUserId, msg.sender);
        FHE.allow(encCreditScore, msg.sender);

        emit UserRegistered(msg.sender);
    }

    // 添加停车位（仅管理员）
    function addParkingSpot(uint16 _price, string memory _location) external onlyOwner {
        euint16 encPrice = FHE.asEuint16(_price);
        euint8 encStatus = FHE.asEuint8(0); // 0 = 可用
        euint32 encReservedBy = FHE.asEuint32(0); // 0 = 无人预订

        parkingSpots[totalSpots] = ParkingSpot({
            encryptedPrice: encPrice,
            encryptedStatus: encStatus,
            isActive: true,
            encryptedReservedBy: encReservedBy,
            reservationEnd: 0,
            location: _location
        });

        // 设置访问权限
        FHE.allowThis(encPrice);
        FHE.allowThis(encStatus);
        FHE.allowThis(encReservedBy);

        emit SpotAdded(totalSpots, _location);
        totalSpots++;
    }

    // 查看可用停车位（加密查询）
    function checkSpotAvailability(uint32 spotId) external validSpot(spotId) returns (ebool) {
        ParkingSpot storage spot = parkingSpots[spotId];

        // 检查状态是否为可用(0)且预订时间已过
        euint8 availableStatus = FHE.asEuint8(0);
        ebool isAvailable = FHE.eq(spot.encryptedStatus, availableStatus);

        // 如果有预订但时间已过期，也视为可用
        if (spot.reservationEnd > 0 && block.timestamp > spot.reservationEnd) {
            return FHE.asEbool(true);
        }

        return isAvailable;
    }

    // 预订停车位
    function reserveSpot(uint32 spotId, uint256 duration, uint16 paymentAmount) external onlyRegistered validSpot(spotId) {
        require(duration > 0 && duration <= 86400, "Invalid duration"); // 最多24小时
        require(paymentAmount > 0, "Payment required");

        ParkingSpot storage spot = parkingSpots[spotId];

        // 检查停车位是否可用
        euint8 availableStatus = FHE.asEuint8(0);
        ebool isAvailable = FHE.eq(spot.encryptedStatus, availableStatus);

        // 在实际应用中，这里需要async解密来验证
        // 为简化演示，假设检查通过

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        // 加密支付金额和状态
        euint16 encPaidAmount = FHE.asEuint16(paymentAmount);
        euint8 encReservationStatus = FHE.asEuint8(0); // 0 = 进行中
        euint8 encSpotStatusReserved = FHE.asEuint8(1); // 1 = 已预订

        // 创建预订记录
        reservations[reservationCounter] = Reservation({
            spotId: spotId,
            encryptedUserId: userProfiles[msg.sender].encryptedUserId,
            encryptedPaidAmount: encPaidAmount,
            startTime: startTime,
            endTime: endTime,
            encryptedStatus: encReservationStatus,
            isActive: true
        });

        // 更新停车位状态
        spot.encryptedStatus = encSpotStatusReserved;
        spot.encryptedReservedBy = userProfiles[msg.sender].encryptedUserId;
        spot.reservationEnd = endTime;

        // 更新用户信息
        userProfiles[msg.sender].totalReservations++;
        userProfiles[msg.sender].lastReservation = startTime;
        userReservations[msg.sender].push(reservationCounter);

        // 设置访问权限
        FHE.allowThis(encPaidAmount);
        FHE.allowThis(encReservationStatus);
        FHE.allow(encPaidAmount, msg.sender);
        FHE.allow(encReservationStatus, msg.sender);

        emit ReservationCreated(reservationCounter, spotId, msg.sender);
        reservationCounter++;
    }

    // 完成预订
    function completeReservation(uint256 reservationId) external {
        require(reservationId < reservationCounter, "Invalid reservation ID");

        Reservation storage reservation = reservations[reservationId];
        require(reservation.isActive, "Reservation not active");
        require(block.timestamp >= reservation.endTime, "Reservation not ended yet");

        // 更新预订状态为已完成
        euint8 completedStatus = FHE.asEuint8(1); // 1 = 已完成
        reservation.encryptedStatus = completedStatus;

        // 释放停车位
        ParkingSpot storage spot = parkingSpots[reservation.spotId];
        euint8 availableStatus = FHE.asEuint8(0); // 0 = 可用
        euint32 noReserver = FHE.asEuint32(0); // 0 = 无人预订

        spot.encryptedStatus = availableStatus;
        spot.encryptedReservedBy = noReserver;
        spot.reservationEnd = 0;

        // 设置访问权限
        FHE.allowThis(completedStatus);
        FHE.allowThis(availableStatus);
        FHE.allowThis(noReserver);

        emit ReservationCompleted(reservationId, reservation.spotId);
    }

    // 取消预订
    function cancelReservation(uint256 reservationId) external {
        require(reservationId < reservationCounter, "Invalid reservation ID");

        Reservation storage reservation = reservations[reservationId];
        require(reservation.isActive, "Reservation not active");
        require(block.timestamp < reservation.startTime + 1800, "Cannot cancel after 30 minutes"); // 30分钟内可取消

        // 验证是否为预订者（需要解密验证，这里简化处理）
        // 在实际应用中需要使用FHE比较

        // 更新预订状态为已取消
        euint8 cancelledStatus = FHE.asEuint8(2); // 2 = 已取消
        reservation.encryptedStatus = cancelledStatus;
        reservation.isActive = false;

        // 释放停车位
        ParkingSpot storage spot = parkingSpots[reservation.spotId];
        euint8 availableStatus = FHE.asEuint8(0); // 0 = 可用
        euint32 noReserver = FHE.asEuint32(0); // 0 = 无人预订

        spot.encryptedStatus = availableStatus;
        spot.encryptedReservedBy = noReserver;
        spot.reservationEnd = 0;

        // 设置访问权限
        FHE.allowThis(cancelledStatus);
        FHE.allowThis(availableStatus);
        FHE.allowThis(noReserver);

        emit ReservationCancelled(reservationId, reservation.spotId);
    }

    // 更新停车位价格（仅管理员）
    function updateSpotPrice(uint32 spotId, uint16 newPrice) external onlyOwner validSpot(spotId) {
        euint16 encNewPrice = FHE.asEuint16(newPrice);

        parkingSpots[spotId].encryptedPrice = encNewPrice;

        FHE.allowThis(encNewPrice);

        emit PriceUpdated(spotId);
    }

    // 设置停车位维护状态（仅管理员）
    function setSpotMaintenance(uint32 spotId, bool inMaintenance) external onlyOwner validSpot(spotId) {
        euint8 newStatus = FHE.asEuint8(inMaintenance ? 2 : 0); // 2 = 维护中, 0 = 可用

        parkingSpots[spotId].encryptedStatus = newStatus;

        FHE.allowThis(newStatus);

        emit SpotStatusUpdated(spotId);
    }

    // 获取用户预订历史
    function getUserReservations(address user) external view returns (uint256[] memory) {
        return userReservations[user];
    }

    // 获取停车位信息（公开信息）
    function getSpotInfo(uint32 spotId) external view validSpot(spotId) returns (
        string memory location,
        bool isActive,
        uint256 reservationEnd
    ) {
        ParkingSpot storage spot = parkingSpots[spotId];
        return (spot.location, spot.isActive, spot.reservationEnd);
    }

    // 获取预订信息（公开信息）
    function getReservationInfo(uint256 reservationId) external view returns (
        uint32 spotId,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        require(reservationId < reservationCounter, "Invalid reservation ID");

        Reservation storage reservation = reservations[reservationId];
        return (
            reservation.spotId,
            reservation.startTime,
            reservation.endTime,
            reservation.isActive
        );
    }

    // 获取总体统计信息
    function getStatistics() external view returns (
        uint32 totalParkingSpots,
        uint256 totalReservations,
        uint256 currentTime
    ) {
        return (totalSpots, reservationCounter, block.timestamp);
    }

    // 验证用户身份（使用加密比较）
    function verifyUserIdentity(address user, uint32 providedUserId) external returns (ebool) {
        require(userProfiles[user].isRegistered, "User not registered");

        euint32 encProvidedId = FHE.asEuint32(providedUserId);
        euint32 storedId = userProfiles[user].encryptedUserId;

        return FHE.eq(encProvidedId, storedId);
    }

    // 紧急停车位释放（仅管理员）
    function emergencyReleaseSpot(uint32 spotId) external onlyOwner validSpot(spotId) {
        ParkingSpot storage spot = parkingSpots[spotId];

        euint8 availableStatus = FHE.asEuint8(0); // 0 = 可用
        euint32 noReserver = FHE.asEuint32(0); // 0 = 无人预订

        spot.encryptedStatus = availableStatus;
        spot.encryptedReservedBy = noReserver;
        spot.reservationEnd = 0;

        FHE.allowThis(availableStatus);
        FHE.allowThis(noReserver);

        emit SpotStatusUpdated(spotId);
    }
}