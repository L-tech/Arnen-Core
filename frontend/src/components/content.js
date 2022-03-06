import { sample, range } from "lodash";
import React from "react";

import { FiVideo } from "react-icons/fi";
import { useHistory } from "react-router-dom";

const images = [
  "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  "https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  "https://images.pexels.com/photos/4385547/pexels-photo-4385547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
];

export const ContentPage = () => {
  const history = useHistory();
  return (
    <div className="w-screen h-screen grid grid-rows-[82px,1fr] bg-gradient-to-t from-gray-200">
      <nav className="sticky top-0 flex h-20 shadow items-center z-50 bg-white">
        <div className="max-w-7xl mx-auto w-full items-center flex px-8">
          <h1 className="text-2xl font-semibold flex gap-x-2 items-center">
            <span className="w-11 h-11 rounded-full flex text-white justify-center items-center bg-gray-900">
              <FiVideo />
            </span>
            <div className=" -skew-y-2 transform-gpu">Arnen</div>
          </h1>
          <div className="flex-1" />
          <div className="px-2 py-1 rounded-xl border border-gray-100 font-semibold">
            Subscription validty: 3 days
          </div>
        </div>
      </nav>
      <div className="relative w-screen overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto">
          <h1 className="w-full max-w-7xl mx-auto px-10 lg:px-20 font-semibold text-3xl pt-10">
            Top Streams
          </h1>
          <div className="max-w-7xl pb-10 px-10 grid-cols-1 justify-center inset-0 pt-10 gap-12 mx-auto grid lg:grid-cols-[340px,340px,340px]">
            {range(3).map((i) => {
              return (
                <div
                  onClick={() => {
                    history.push("/stream");
                  }}
                  key={i}
                  className="w-full cursor-pointer hover:shadow-xl rounded-xl gap-4 bg-white grid grid-rows-[220px,1fr] gap-x-2 items-center shadow"
                >
                  <img className="rounded-md" src={images[i]} />
                  <div className="px-2 pb-4">
                    <h1 className="font-semibold">Stream {i}</h1>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <h1 className="w-full max-w-7xl mx-auto px-10 lg:px-20 font-semibold text-3xl pt-10">
            Recent Articles
          </h1>
          <div className="grid-cols-1 justify-center pt-10 gap-12 w-full grid mx-auto lg:grid-cols-[560px,510px]">
            {range(30).map((i) => {
              return (
                <div key={i} className="bg-white p-4 w-full col-span-1">
                  <h1 className="font-semibold text-xl">Lorem Ipsum</h1>
                  <p>
                    dolor sit amet, consectetur adipiscing elit. lolrem ipsum
                    dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
