// // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
// // reference './constants.js' for other networks
// const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

// const NETWORKCHECK = true;
// const USE_NETWORK_SELECTOR = true;
// const [injectedProvider, setInjectedProvider] = useState();
// const [address, setAddress] = useState();
// const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
// const location = useLocation();

// const targetNetwork = NETWORKS[selectedNetwork];

// // 🔭 block explorer URL
// const blockExplorer = targetNetwork.blockExplorer;

// // load all your providers
// const localProvider = useStaticJsonRPC([
//   process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
// ]);
// const mainnetProvider = useStaticJsonRPC(providers);

// if (DEBUG) console.log(`Using ${selectedNetwork} network`);

// // 🛰 providers
// if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

// const logoutOfWeb3Modal = async () => {
//   await web3Modal.clearCachedProvider();
//   if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
//     await injectedProvider.provider.disconnect();
//   }
//   setTimeout(() => {
//     window.location.reload();
//   }, 1);
// };

// /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
// const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

// /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
// const gasPrice = useGasPrice(targetNetwork, "fast");
// // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
// const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
// const userSigner = userProviderAndSigner.signer;

// useEffect(() => {
//   async function getAddress() {
//     if (userSigner) {
//       const newAddress = await userSigner.getAddress();
//       setAddress(newAddress);
//     }
//   }
//   getAddress();
// }, [userSigner]);

// // You can warn the user if you would like them to be on a specific network
// const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
// const selectedChainId =
//   userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

// // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

// // The transactor wraps transactions and provides notificiations
// const tx = Transactor(userSigner, gasPrice);

// // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
// const yourLocalBalance = useBalance(localProvider, address);

// // Just plug in different 🛰 providers to get your balance on different chains:
// const yourMainnetBalance = useBalance(mainnetProvider, address);

// // const contractConfig = useContractConfig();

// const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

// // Load in your local 📝 contract and read a value from it:
// const readContracts = useContractLoader(localProvider, contractConfig);

// // If you want to make 🔐 write transactions to your contracts, use the userSigner:
// const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

// // EXTERNAL CONTRACT EXAMPLE:
// //
// // If you want to bring in the mainnet DAI contract it would look like:
// const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

// // If you want to call a function on a new block
// useOnBlock(mainnetProvider, () => {
//   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
// });

// // Then read your DAI balance like:
// const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
//   "0x34aA3F359A9D614239015126635CE7732c18fDF3",
// ]);

// // keep track of a variable from the contract in the local React state:
// const purpose = useContractReader(readContracts, "YourContract", "purpose");

// /*
// const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
// console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
// */

// //
// // 🧫 DEBUG 👨🏻‍🔬
// //
// useEffect(() => {
//   if (
//     DEBUG &&
//     mainnetProvider &&
//     address &&
//     selectedChainId &&
//     yourLocalBalance &&
//     yourMainnetBalance &&
//     readContracts &&
//     writeContracts &&
//     mainnetContracts
//   ) {
//     // console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
//     // console.log("🌎 mainnetProvider", mainnetProvider);
//     // console.log("🏠 localChainId", localChainId);
//     // console.log("👩‍💼 selected address:", address);
//     // console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
//     // console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
//     // console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
//     // console.log("📝 readContracts", readContracts);
//     // console.log("🌍 DAI contract on mainnet:", mainnetContracts);
//     // console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
//     // console.log("🔐 writeContracts", writeContracts);
//   }
// }, [
//   mainnetProvider,
//   address,
//   selectedChainId,
//   yourLocalBalance,
//   yourMainnetBalance,
//   readContracts,
//   writeContracts,
//   mainnetContracts,
//   localChainId,
//   myMainnetDAIBalance,
// ]);

// const loadWeb3Modal = useCallback(async () => {
//   const provider = await web3Modal.connect();
//   setInjectedProvider(new ethers.providers.Web3Provider(provider));

//   provider.on("chainChanged", chainId => {
//     console.log(`chain changed to ${chainId}! updating providers`);
//     setInjectedProvider(new ethers.providers.Web3Provider(provider));
//   });

//   provider.on("accountsChanged", () => {
//     console.log(`account changed!`);
//     setInjectedProvider(new ethers.providers.Web3Provider(provider));
//   });

//   // Subscribe to session disconnection
//   provider.on("disconnect", (code, reason) => {
//     console.log(code, reason);
//     logoutOfWeb3Modal();
//   });
//   // eslint-disable-next-line
// }, [setInjectedProvider]);

// useEffect(() => {
//   if (web3Modal.cachedProvider) {
//     loadWeb3Modal();
//   }
// }, [loadWeb3Modal]);

// const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

// REQ: Set time for NFT to expire
// REQ: Set access rules for NFT
// REQ: Set if NFT is transferable
// REQ: Set if NFT is burnable

const option = useOptionInterval(["Gym", "Concerts", "Merch", "Magazines", "Videos", "Podcasts", "Airdrops", "Music"]);

const colorOption = useOptionInterval([
  "text-red-500",
  "text-purple-500",
  "text-green-500",
  "text-orange-500",
  "text-teal-500",
]);

<div className="w-screen h-screen overflow-hidden">
  <div className="grid grid-rows-[84px,400px,1fr] px-6 h-full overflow-y-auto">
    <nav className="items-center max-w-6xl mx-auto w-full flex justify-end gap-x-6 text-gray-500">
      <h1 className="font-serif text-3xl font-bold text-gray-500">_</h1>
      <div className="flex-1" />
      <span href="#">Marketplaces</span>
      <span href="#">Publishing</span>
    </nav>

    <div className="max-w-6xl mx-auto w-full flex justify-center flex-col ">
      <h1 className="text-4xl font-bold text-gray-800 flex flex-col">
        <span className="text-blue-500">Arnen</span> NFT based content subscriptions
        <span className="text-gray-800">
          for your <span className={`${colorOption} lowercase`}>{option}</span>
        </span>
      </h1>
      <p className="max-w-prose text-gray-500 -mt-2">
        Using NFT as access point will be become mainstream in the near future, some services and time based and will
        need NFT that are likewise time based. You can get an NFT with a validity of 3 month and use that as a access
        point to a content platform or even a gym. So just as XP point decreases for the games the duration of validity
        will decrease every day. Option for renewal is also to be added.
      </p>
      <div className="flex gap-x-4 pt-2">
        <button className="font-semibold px-4 py-2 bg-blue-600 text-white rounded-xl">Become a publisher</button>
        <button className="font-semibold px-4 py-2 bg-white shadow text-gray-900 rounded-xl">
          Become a subscriber
        </button>
      </div>
    </div>
  </div>
</div>;
