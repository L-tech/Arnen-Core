import React, { useState } from "react";
import { useArnenContext } from "./context";
import { ethers } from "ethers";

export const useTip = () => {
  const { address, contract } = useArnenContext();
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
