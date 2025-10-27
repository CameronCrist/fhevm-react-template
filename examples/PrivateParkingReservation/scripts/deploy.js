const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署机密停车位预订合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 部署合约
  const PrivateParkingReservation = await ethers.getContractFactory("PrivateParkingReservation");
  const contract = await PrivateParkingReservation.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("PrivateParkingReservation 合约已部署到:", contractAddress);

  // 验证合约部署
  try {
    const owner = await contract.owner();
    console.log("合约所有者:", owner);

    const stats = await contract.getStatistics();
    console.log("初始统计信息:");
    console.log("- 总停车位数:", stats[0].toString());
    console.log("- 总预订数:", stats[1].toString());
    console.log("- 当前时间:", stats[2].toString());

    console.log("\n合约部署成功！");
    console.log("请保存以下信息:");
    console.log(`合约地址: ${contractAddress}`);
    console.log(`网络: ${network.name}`);
    console.log(`区块链浏览器: https://${network.name === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${contractAddress}`);

  } catch (error) {
    console.error("验证合约时出错:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });