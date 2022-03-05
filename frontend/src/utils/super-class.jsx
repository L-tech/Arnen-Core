import { useArnenContext } from "./context";
import { useEffect, useState } from "react";
import useInterval from "use-interval";
import { ethers } from "ethers";

export const useStreams = () => {
  const { address, contentContract } = useArnenContext();
  const [contentCreators, setContentCreators] = useState([]);

  useEffect(() => {
    if (address) {
      (async () => {
        const creatorsResponse = await contentContract.getStreams();
        setContentCreators(
          creatorsResponse.map((s) => {
            console.log(s);
            return {
              name: s[0],
              niche: s[3],
              streamURL: s[2],
            };
          })
        );
      })();
    }
  }, [address]);

  return contentCreators;
};

export const useContractService = () => {
  const { address, contract, contentContract } = useArnenContext();

  const subscribe = async () => {
    return await contract.mint(1, 0, "fake uri", {
      value: ethers.utils.parseEther("1"),
    });
  };

  const signUpAsContentCreator = async (name, niche, streamURL) => {
    // Need to figure out how upload NFT to ipfs from here
    // probably a small server
    const nft = await subscribe();
    const creatorId = await contentContract.addCreator(name, niche, streamURL);
    const creator = await contentContract.getCreator();
    const stream = await contentContract.addStream(name, streamURL);

    return {
      creatorId,
      creator,
      stream,
      nft,
    };
  };

  return {
    signUpAsContentCreator,
    subscribe,
  };
};
