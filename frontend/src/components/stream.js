import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { FiStar, FiVideo } from "react-icons/fi";
import ReactHlsPlayer from "react-hls-player";
import { TipBar } from "./tipbar";
import { useArnenContext } from "../utils/context";
import { useStreams } from "../utils/super-class";

export const Stream = () => {
  const name = "brogrammer94";
  const niche = "programming";
  const { address, contract } = useArnenContext();
  const streams = useStreams();

  const history = useHistory();
  useEffect(() => {
    if (!address) {
      history.replace("/");
    }
  }, [address]);

  console.log(streams);
  const main = streams[0] ?? {
    name: "",
    streamURL: "",
  };

  const [, ...others] = streams;
  console.log(main);

  return (
    <div className="bg-white">
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

      <div className=" max-w-2xl rounded-xl overflow-hidden mx-auto sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="border shadow-sm mt-10 rounded-xl overflow-hidden">
          <ReactHlsPlayer
            src={main.streamURL}
            autoPlay={false}
            controls={true}
            width="100%"
            height="auto"
          />
        </div>
        <div className="pt-5">
          <TipBar />
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-16 px-4 sm:px-6 lg:max-w-7xl  lg:pb-24 lg:px-8 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8">
        <div className="lg:pb-16 lg:col-start-1 lg:col-span-2 lg:pr-8 pt-6">
          {/* Description and details */}
          <div className="lg:col-span-2 lg:pr-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-500 sm:text-3xl">
              @{main.name}
            </h1>
          </div>

          <div className="flex items-start flex-col gap-y-2">
            <h3 className="sr-only">Description</h3>
            <p className="text-sm rounded-full mt-2 bg-indigo-500 text-white font-semibold px-3 py-1">
              {main.niche}
            </p>
            <div className="space-y-6">
              <p className="text-base text-gray-900">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus nec iaculis mauris. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Phasellus nec iaculis mauris.
              </p>
            </div>
          </div>
        </div>
        <ul className="col-span-1">
          <h1 className="font-semibold pb-2 text-lg">All Streams</h1>
          {streams.map((stream) => (
            <li key={stream.name} className="shadow px-4 py-2 rounded-xl">
              <div className="flex items-center">
                <h1 className="font-semibold">@{stream.name}</h1>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
