import React, { useState } from "react";
import { useArnenContext } from "./context";
import { ethers } from "ethers";

export const useTip = () => {
  const { address, contract } = useArnenContext();
  const [isTipping, setIsTipping] = useState(false);

  const tipPlatform = async () => {
    setIsTipping(true);

    const res = await contract.tipPlatform({
      value: ethers.utils.parseEther("0.5"),
    });
    setIsTipping(false);
  };

  const tipCreator = async (creatorAddress) => {
    setIsTipping(true);
    const res = await contract.tipCreator(creatorAddress, {
      value: ethers.utils.parseEther("0.5"),
    });
    setIsTipping(false);
  };

  return {
    tipPlatform,
    tipCreator,
    isTipping,
  };
};
