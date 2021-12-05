const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const LARGE_APPROVAL = '100000000000000000000000000000000';
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';
    // Reward rate of .1%
    const initialRewardRate = "1000";

    const epoch = 3600;
    const firstEpochNumber = "1";
    const firstBlockTime = "1638662400";

        authFactory = await ethers.getContractFactory('OlympusAuthority');
        erc20Factory = await ethers.getContractFactory('DAI');

        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sOhmFactory = await ethers.getContractFactory('sOlympus');
        gOhmFactory = await ethers.getContractFactory('gOHM');
        treasuryFactory = await ethers.getContractFactory('OlympusTreasury');
        distributorFactory = await ethers.getContractFactory('Distributor');

        depositoryFactory = await ethers.getContractFactory('OlympusBondDepository');
        tellerFactory = await ethers.getContractFactory('BondTeller');

        dai = await erc20Factory.deploy(0);
        lpToken = await erc20Factory.deploy(0);

        auth = await authFactory.deploy(deployer.address, deployer.address, deployer.address, deployer.address); // TODO
        ohm = await ohmFactory.deploy(auth.address);
        sOhm = await sOhmFactory.deploy();
        gOhm = await gOhmFactory.deploy(deployer.address, sOhm.address); // Call migrate immediately
        staking = await stakingFactory.deploy(ohm.address, sOhm.address, gOhm.address, epoch, firstEpochNumber, firstBlockTime, auth.address);
        treasury = await treasuryFactory.deploy(ohm.address, "0", auth.address);
        distributor = await distributorFactory.deploy(treasury.address, ohm.address, staking.address, auth.address);
        depository = await depositoryFactory.deploy(ohm.address, treasury.address, auth.address);
        teller = await tellerFactory.deploy(depository.address, staking.address, treasury.address, ohm.address, sOhm.address, auth.address);

        // Needed for treasury deposit
        await gOhm.migrate(staking.address, sOhm.address);
        await dai.mint(deployer.address, initialMint);
        await dai.approve(treasury.address, LARGE_APPROVAL);

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, LARGE_APPROVAL);

        // To get past OHM contract guards
        await auth.pushVault(treasury.address, true);

        // Initialization for sOHM contract.
        // Set index to 10
        await sOhm.setIndex("10000000000");
        await sOhm.setgOHM(gOhm.address);
        await sOhm.initialize(staking.address, treasury.address);

        // Set distributor staking contract
        await staking.setDistributor(distributor.address);

        // enable on chain governance to avoid queue
        //await treasury.enableOnChainGovernance();
        //await advanceBlock(1);
        //await treasury.enableOnChainGovernance();
		
		
        await treasury.queueTimelock("8", teller.address, ZERO_ADDRESS);
        await treasury.queueTimelock("8", distributor.address, ZERO_ADDRESS);
		await treasury.queueTimelock("0", deployer.address, ZERO_ADDRESS);
		await treasury.queueTimelock("2", dai.address, ZERO_ADDRESS);
        await treasury.execute("0");
		await treasury.execute("1");
		await treasury.execute("2");
		await treasury.execute("3");

        // toggle reward manager
        //await treasury.enable('8', teller.address, ZERO_ADDRESS);
        // toggle deployer reserve depositor
        //await treasury.enable('0', deployer.address, ZERO_ADDRESS);
        // toggle DAI as reserve token
        //await treasury.enable('2', dai.address, ZERO_ADDRESS);

        // Deposit 10,000 DAI to treasury, 1,000 OHM gets minted to deployer with 9000 as excess reserves (ready to be minted)
        await treasury.connect(deployer).deposit('10000000000000000000000', dai.address, '9000000000000');

        // Get sOHM in deployer wallet
        //const sohmAmount = "1000000000000"
        //await ohm.approve(staking.address, LARGE_APPROVAL);
        //await staking.stake(deployer.address, sohmAmount, true, true);

        // Transfer 100 sOHM to alice for testing
        //await sOhm.transfer(alice.address, "100000000000");

        // initialize depository
        //await depository.setTeller(teller.address);
        //await depository.setGlobal("500000", "10000000");
        //await depository.setFeed(oracle.address);

        // set mock oracle price
        //await oracle.setPrice("100000000000");

        //await auth.pushPolicy(bob.address, true);

        // set operator/dao rewards
        //await teller.connect(bob).setReward(true, "1000000");
        //await teller.connect(bob).setReward(false, "10000000");

        // add bond
        //await depository.addBond(
        //    dai.address,
        //    oracle.address,
        //    "100000000000",
        //    false,
        //    1000000,
        //    true,
        //    700000
        //);

		console.log("Olympus Authority: ", auth.address);
		console.log("OHM: " + ohm.address);
		console.log("sOhm: " + sOhm.address);
		console.log("gOHM: " + gOhm.address);
		console.log("Olympus Treasury: " + treasury.address);
		console.log("Staking Contract: " + staking.address);
		console.log("Distributor: " + distributor.address);
		console.log("Depository: " + depository.address);
		console.log("Teller: " + teller.address);
		console.log("Dai: " + dai.address);
		console.log("lptoken: " + lpToken.address);



    /*const DAI = "0x5a3098b556b5C39556fd27F508Cf549727F9A7bB";
    const oldOHM = "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932";
    const oldsOHM = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";
    const oldStaking = "0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2";
    const oldwsOHM = "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad";
    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const oldTreasury = "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7";

    const FRAX = "0x2f7249cb599139e560f0c81c269ab9b04799e453";
    const LUSD = "0x45754df05aa6305114004358ecf8d04ff3b84e26";

    const Authority = await ethers.getContractFactory("OlympusAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        oldOHM,
        oldsOHM,
        oldTreasury,
        oldStaking,
        oldwsOHM,
        sushiRouter,
        uniRouter,
        "0",
        authority.address
    );

    const firstEpochNumber = "1";
    const firstBlockTime = "1638576001";

    const OHM = await ethers.getContractFactory("OlympusERC20Token");
    const ohm = await OHM.deploy(authority.address);

    const SOHM = await ethers.getContractFactory("sOlympus");
    const sOHM = await SOHM.deploy();

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(deployer.address, sOHM.address); //staking

    await migrator.setgOHM(gOHM.address);

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(ohm.address, "0", authority.address);

    //await olympusTreasury.queueTimelock("0", migrator.address, migrator.address);
    //await olympusTreasury.queueTimelock("8", migrator.address, migrator.address);
    await olympusTreasury.queueTimelock("2", DAI, DAI);
    await olympusTreasury.queueTimelock("2", FRAX, FRAX);
    await olympusTreasury.queueTimelock("2", LUSD, LUSD);

    await authority.pushVault(olympusTreasury.address, true); // replaces ohm.setVault(treasury.address)

    const OlympusStaking = await ethers.getContractFactory("OlympusStaking");
    const staking = await OlympusStaking.deploy(
        ohm.address,
        sOHM.address,
        gOHM.address,
        "28800",
        firstEpochNumber,
        firstBlockTime,
        authority.address
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        ohm.address,
        staking.address,
        authority.address
    );
	
	await gOHM.migrate(staking.address, sOHM.address);

    // Initialize sohm
    await sOHM.setIndex("7675210820");
    await sOHM.setgOHM(gOHM.address);
    await sOHM.initialize(staking.address, olympusTreasury.address);

    await staking.setDistributor(distributor.address);

    await olympusTreasury.execute("0");
    await olympusTreasury.execute("1");
    await olympusTreasury.execute("2");
    //await olympusTreasury.execute("3");
    //await olympusTreasury.execute("4");

    console.log("Olympus Authority: ", authority.address);
    console.log("OHM: " + ohm.address);
    console.log("sOhm: " + sOHM.address);
    console.log("gOHM: " + gOHM.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);
	*/
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
