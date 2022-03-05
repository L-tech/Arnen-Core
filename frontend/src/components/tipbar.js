import React from "react";
import { useTip } from "../utils/tip";
import { FiRadio, FiHeart, FiLoader, FiDollarSign } from "react-icons/fi";
export const TipBar = () => {
  const { tip, isTipping } = useTip();

  return (
    <div className="flex gap-x-2 py-1">
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
