import React, { useContext, useEffect, useState, useCallback } from "react";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import {
  FiHeart,
  FiDollarSign,
  FiRadio,
  FiLoader,
  FiLock,
  FiGift,
  FiVideo,
  FiAward,
} from "react-icons/fi";
// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import ArnenArtifact from "../contracts/Arnen.json";
import arnenAddress from "../contracts/Arnen-contract-address.json";

import ContentArtifact from "../contracts/Contents.json";
import contentAddress from "../contracts/Contents-contract-address.json";
// import { NFTStorage, File } from "nft.storage";
// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";

import { Stream } from "./stream";
import NFTImage from "./assets/arnen_nft.png";
import { Router, Route, Switch } from "react-router-dom";
// const SECRET_API_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBkNjY2NjEyMzdCMzM3MzUyYTE5NTBhY2VDMDhkMUZCNDc1QzEwRjUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NjQ2NzE3OTYwMSwibmFtZSI6ImFybmVuIn0.ncDV7DnQiVIPOsZEdcsTgHEAZ6lNcrSYkYXqJnssBgQ";

// const storeAsset = async () => {
//   const client = new NFTStorage({
//     token: SECRET_API_KEY,
//   });
//   const metadata = await client.store({
//     name: "Arnen NFT #",
//     NFT_Counter,
//     description:
//       "A Special Time Based NFT to gain access to the Arnen Platform",
//     attributes: [
//       { trait_type: "Mode", value: "Time Based" },
//       { trait_type: "Status", value: "Active" },
//       { trait_type: "Validity", value: "5" },
//     ],
//     image: new File([NFTImage], "arnen_nft.png", { type: "image/png" }),
//   });
//   return metadata;
// };

// import { Transfer } from "./Transfer";
// import { TransactionErrorMessage } from "./TransactionErrorMessage";
// import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
// import { NoTokensMessage } from "./NoTokensMessage";

// This is the Hardhat Network id, you might change it in the hardhat.config.js.
// If you are using MetaMask, be sure to change the Network id to 1337.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = "31337";

const ArnenContext = React.createContext({
  address: null,
  contract: null,
  contentContract: null,
});

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    return (
      <ArnenContext.Provider
        value={{
          address: this.state.selectedAddress,
          contract: this._arnen,
          contentContract: this._content,
        }}
      >
        <Switch exact>
          <Route path="/" exact>
            <Welcome
              hasAddress={!!this.state.selectedAddress}
              connectWallet={() => this._connectWallet()}
              networkError={this.state.networkError}
              dismiss={() => this.setState({ networkError: undefined })}
            />
          </Route>

          <Route path="/stream" exact>
            <Stream />
          </Route>
        </Switch>
      </ArnenContext.Provider>
    );
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._content = new ethers.Contract(
      contentAddress.Contents,
      ContentArtifact.abi,
      this._provider.getSigner(0)
    );

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._arnen = new ethers.Contract(
      arnenAddress.Arnen,
      ArnenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: "Please connect Metamask to Localhost:8545",
    });

    return false;
  }
}

const useIsTokenHolder = () => {
  const { address, contract } = useContext(ArnenContext);
  const [counter, setCounter] = useState(0);
  const [isHolder, setIsHolder] = useState(false);
  useEffect(() => {
    if (contract && address) {
      const doCheck = async (...args) => {
        const res = await contract.checkTokenHolder();
        console.log(res);
        setIsHolder(res);
      };

      doCheck();
      contract.on("Transfer", doCheck);

      return () => {
        contract.removeAllListeners("Transfer");
      };
    }
  }, [address, contract]);
  return isHolder;
};

const useDistributeTip = () => {
  const { address, contract } = useContext(ArnenContext);
  const [totalTipped, setTotalTipped] = useState("");
  const [isTipping, setIsTipping] = useState(false);

  useEffect(() => {
    if (contract && address) {
      const doCheck = async (...args) => {
        const total = await contract.totalAmountTipped();
        setTotalTipped(ethers.utils.formatEther(total));
        setIsTipping(false);
        // setIsHolder(res);
      };

      doCheck();
      contract.on("Tipped", doCheck);

      return () => {
        contract.removeAllListeners("Tipped");
      };
    }
  }, []);

  const distribute = async () => {
    setIsTipping(true);
    const res = await contract.distributeTip();
    console.log(res);
    // console.log(res);
  };

  return {
    distribute,
    isDistrubuting: isTipping,
    totalTipped,
  };
};

const useMintAccessNFT = () => {
  const [isTokenHolder, setIsTokenHolder] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { address, contract } = useContext(ArnenContext);
  useEffect(() => {
    if (contract) {
      const doCheck = async () => {
        const res = await contract.checkTokenHolder();
        setIsTokenHolder(res);
        setIsLoading(false);
      };

      doCheck();

      contract.on("Transfer", doCheck);

      return () => {
        contract.removeAllListeners("Transfer");
      };
    }
  }, [address, contract]);

  const mintAccess = async () => {
    // user already has access, no-op
    if (isTokenHolder) return;
    setIsMinting(true);
    const res = await contract.mint(1, 0);
    setIsLoading(true);
    setIsMinting(false);
  };

  return {
    mintAccess,
    isMinting,
    isLoading,
    isTokenHolder,
  };
};

const useOptionInterval = (options) => {
  const [index, setIndex] = useState(0);
  const interval = useCallback(() => {
    setIndex((index + 1) % options.length);
  }, [options, setIndex]);

  useEffect(() => {
    const intervalId = setInterval(interval, 1000);
    return () => clearInterval(intervalId);
  }, [interval]);
  return options[index];
};

const features = [
  {
    name: "Own and trade your platform access",
    icon: FiLock,
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
  },
  {
    name: "Get paid for the content you create",
    icon: FiDollarSign,
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
  },
  {
    name: "Support your favorite content creators",
    icon: FiHeart,
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
  },
  {
    name: "Get access to perks and rewards for your support",
    icon: FiGift,
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
  },
];

const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col items-start justify-start gap-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        {...props}
        className="shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-200 border rounded-md"
      />
    </div>
  );
};

const NFTMintModal = () => {
  const { isTokenHolder, mintAccess, isMinting } = useMintAccessNFT();
  const [view, setView] = useState("base");
  const { address } = useContext(ArnenContext);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
      <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <h1 className="text-2xl justify-center font-semibold flex gap-x-2 items-center">
            <span className="w-11 h-11 rounded-full flex text-white justify-center items-center bg-gray-900">
              <FiVideo />
            </span>
            <div className=" -skew-y-2 transform-gpu">Arnen</div>
          </h1>
          <div className="mt-3 text-center sm:mt-5">
            {view === "register-content-creator" ? (
              <div className="space-y-3 -mb-4">
                <Input label="Name" className="" value="" onChange={() => {}} />
                <Input
                  value="Niche"
                  label="Content Niche"
                  value=""
                  onChange={() => {}}
                />
                <Input label="Live Peer URL" value="" onChange={() => {}} />
                <div className="flex gap-x-4 pt-4">
                  <button
                    onClick={() => {
                      setView("base");
                    }}
                    type="button"
                    className=" items-center whitespace-nowrap w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setView("register-content-creator");
                    }}
                    type="button"
                    className="gap-x-2 items-center bg-blue-500 whitespace-nowrap w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiAward className="text-white" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>
            ) : null}

            {view === "base" ? (
              <>
                <h1
                  as="h3"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  You need to mint your access token
                </h1>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Eius aliquam laudantium explicabo pariatur iste dolorem
                    animi vitae error totam. At sapiente aliquam accusamus
                    facere veritatis.
                    {address}
                  </p>
                </div>{" "}
              </>
            ) : null}
          </div>
        </div>
        <div className="sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          {isMinting || isTokenHolder ? (
            <div className="mt-3 col-span-2 gap-x-2 items-center whitespace-nowrap w-full inline-flex justify-center rounded-md border px-4 py-2 bg-white text-base font-medium text-gray-700">
              <FiLoader className=" animate-spin" />
              <span>Creating your ticket to the best content.</span>
            </div>
          ) : null}
          {!isMinting && !isTokenHolder && view === "base" ? (
            <>
              <button
                onClick={() => {
                  mintAccess();
                }}
                type="button"
                className="mt-3 gap-x-2 items-center whitespace-nowrap w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiHeart className="text-red-500" />
                <span>Subscribe</span>
              </button>
              <button
                onClick={() => {
                  setView("register-content-creator");
                }}
                type="button"
                className="mt-3 gap-x-2 items-center whitespace-nowrap w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiAward className="text-blue-500" />
                <span>Create Content</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Welcome = (props) => {
  const { address, contract } = useContext(ArnenContext);

  return (
    <div className="w-screen h-screen overflow-y-auto bg-gradient-to-t from-gray-200 relative">
      {address && contract ? <NFTMintModal /> : null}
      <nav className="sticky top-0 flex h-20 shadow items-center z-50 bg-white">
        <div className="max-w-7xl mx-auto w-full px-8">
          <h1 className="text-2xl font-semibold flex gap-x-2 items-center">
            <span className="w-11 h-11 rounded-full flex text-white justify-center items-center bg-gray-900">
              <FiVideo />
            </span>
            <div className=" -skew-y-2 transform-gpu">Arnen</div>
          </h1>
        </div>
      </nav>
      <div className="relative max-w-7xl flex flex-col lg:flex-row-reverse mx-auto overflow-hidden">
        <div className="w-full">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:max-w-2xl lg:w-full lg:py-28 xl:py-32">
            <main className="mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block text-blue-600 xl:inline">Arnen</span>
                </h1>
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 sm:text-3xl md:text-4xl">
                  <span className="block text-gray-600 xl:inline">
                    Community owned content platform
                  </span>
                </h2>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Using NFT as access point will be become mainstream in the
                  near future, some services and time based and will need NFT
                  that are likewise time based.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => {
                        props.connectWallet();
                      }}
                      className="inline-flex group gap-x-2 items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
                    >
                      <img
                        className="w-8 h-8 group-hover:scale-125 transform-gpu transition-all"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1024px-MetaMask_Fox.svg.png?20201112074605"
                        alt="MetaMask"
                      />
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="w-full md:p-8">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full md:rounded-xl md:shadow-xl hover:scale-105 hover:shadow-sm transition-all"
            src="https://images.pexels.com/photos/7676406/pexels-photo-7676406.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt=""
          />
        </div>
      </div>

      <div className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-left">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              How it works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              NFT Subscriptions
            </p>
            <p className="mt-4 text-xl text-gray-500">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md text-blue-500 shadow-sm border border-gray-200">
                      <feature.icon size={20} />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="px-1">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-blue-600">
              Connect your wallet and join our community
            </span>
          </h2>
          <div className=" flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => {
                  props.connectWallet();
                }}
                className="inline-flex group gap-x-2 items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
              >
                <img
                  className="w-8 h-8 group-hover:scale-125 transform-gpu transition-all"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1024px-MetaMask_Fox.svg.png?20201112074605"
                  alt="MetaMask"
                />
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
