import React from "react";
import { FiHeart, FiDollarSign, FiRadio } from "react-icons/fi";

import * as AspectRatio from "@radix-ui/react-aspect-ratio";
const TipBar = () => {
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
      <button className="flex px-4 py-2 font-semibold gap-x-1 items-center rounded-full hover:text-green-600 shadow">
        <FiDollarSign />
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
  return (
    <div className="w-screen h-screen overflow-hidden">
      <nav className="h-[84px] flex items-center px-8 justify-between">
        <h1 className="font-bold text-blue-600 text-2xl">_</h1>

        <img
          src="https://images.pexels.com/photos/2709388/pexels-photo-2709388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          className="w-16 h-16 hover:shadow-xl hover:scale-105 transition-all rounded-full object-cover"
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
