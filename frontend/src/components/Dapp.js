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
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { Loading } from "./Loading";

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
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.

    return (
      <ArnenContext.Provider
        value={{
          address: this.state.selectedAddress,
          contract: this._token,
        }}
      >
        <Welcome
          hasAddress={!!this.state.selectedAddress}
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this.setState({ networkError: undefined })}
        />
      </ArnenContext.Provider>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
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
      this._stopPollingData();
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
      this._stopPollingData();
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
    this._getTokenData();
    this._startPollingData();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
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
        const res = await contract.checkTokenHolder(address);
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
        // const res = await contract.checkTokenHolder(address);
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

const useTip = () => {
  const { address, contract } = useContext(ArnenContext);
  const [isTipping, setIsTipping] = useState(false);

  const tip = async () => {
    setIsTipping(true);
    const res = await contract.tip({
      value: ethers.utils.parseEther("0.01"),
    });
    setIsTipping(false);
  };

  return {
    tip,
    isTipping,
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
        const res = await contract.checkTokenHolder(address);
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
    const res = await contract.mint(0, 0);
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

const NFTMintModal = () => {
  const { isTokenHolder, mintAccess, isMinting } = useMintAccessNFT();
  const { address } = useContext(ArnenContext);
  // if (isTokenHolder) {
  //   return null;
  // }
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
            <h1 as="h3" className="text-lg leading-6 font-medium text-gray-900">
              You need to mint your access token
            </h1>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius
                aliquam laudantium explicabo pariatur iste dolorem animi vitae
                error totam. At sapiente aliquam accusamus facere veritatis.
                {address}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          {isMinting || isTokenHolder ? (
            <div className="mt-3 col-span-2 gap-x-2 items-center whitespace-nowrap w-full inline-flex justify-center rounded-md border px-4 py-2 bg-white text-base font-medium text-gray-700">
              <FiLoader className=" animate-spin" />
              <span>Creating your ticket to the best content.</span>
            </div>
          ) : null}
          {!isMinting && !isTokenHolder ? (
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

const TipBar = () => {
  const { tip, isTipping } = useTip();

  return (
    <div className="flex gap-x-2">
      <button className="flex font-semibold gap-x-1 rounded-full items-center hover:text-blue-400 px-4 py-2 shadow">
        <FiRadio />
        <span>Subscribe</span>
      </button>
      <button className="flex gap-x-1 font-semibold rounded-full items-center hover:text-red-400 px-4 py-2 shadow">
        <FiHeart />
        <span>Like</span>
      </button>
      <button
        onClick={() => {
          tip();
        }}
        disabled={isTipping}
        className="flex px-4 py-2 font-semibold gap-x-1 items-center rounded-full hover:text-green-600 shadow"
      >
        {isTipping ? <FiLoader /> : <FiDollarSign />}
        <span>Tip</span>
      </button>
    </div>
  );
};

const VideoCard = () => {
  return (
    <div className="flex items-center gap-x-4 justify-start">
      <img
        src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        className="rounded-lg shadow w-[128px] h-auto"
        alt="video"
      />
      <p className="text-md">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit nam
        totam possimus sunt quia, natus fugiat
      </p>
    </div>
  );
};

const VideoPost = () => {
  return (
    <div className="flex flex-col gap-y-3 rounded-xl">
      <AspectRatio.Root ratio={16 / 9}>
        <video className="w-full h-full object-cover rounded-xl" controls>
          <source
            src="https://storage.googleapis.com/media-session/elephants-dream/the-wires.webm"
            type="video/webm"
          />
        </video>
      </AspectRatio.Root>
      <TipBar />
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit nam
        totam possimus sunt quia, natus fugiat corrupti magni, voluptate
        consectetur, dolore saepe tempore adipisci dolorem repellendus quos
        sequi harum vitae?
      </p>
    </div>
  );
};

export const ContentPage = () => {
  const { distribute, isDistrubuting, totalTipped } = useDistributeTip();
  const { mintAccess, isMinting, isLoading, isTokenHolder } =
    useMintAccessNFT();
  const { contract } = useContext(ArnenContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isTokenHolder) {
    return (
      <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center">
        <h1>Get Access</h1>
        <button
          onClick={() => mintAccess()}
          className="flex px-4 py-2 font-semibold gap-x-1 items-center rounded-full hover:text-green-600 shadow"
        >
          Mint Access
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <nav className="h-[84px] flex items-center px-8 justify-between">
        <h1 className="font-semibold text-gray-600 text-lg">
          Platform Tips: {totalTipped} ether
        </h1>

        <img
          src="https://images.pexels.com/photos/2709388/pexels-photo-2709388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          className="w-11 h-11 hover:shadow-xl hover:scale-105 transition-all rounded-full object-cover"
        />
      </nav>
      <div className="grid sm:grid-cols-1 mt-10  gap-x-6 lg:grid-cols-[1fr,432px] px-6">
        <VideoPost />

        <div className="flex flex-col gap-y-4 overflow-y-auto max-h-screen">
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
        </div>
      </div>
    </div>
  );
};

const Base = (props) => {
  return <ContentPage />;
};
