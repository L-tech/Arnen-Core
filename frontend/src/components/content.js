import { sample, range } from "lodash";
import React from "react";
import { FiVideo } from "react-icons/fi";
import { useHistory } from "react-router-dom";

export const ContentPage = () => {
  const history = useHistory();
  return (
    <div className="w-screen h-screen grid grid-rows-[82px,1fr] bg-gray-100">
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
          <h1 className="w-full max-w-7xl mx-auto px-20 font-semibold text-3xl pt-10">
            Platform Content
          </h1>
          <div className="max-w-7xl justify-center inset-0 pt-10 gap-12 mx-auto grid grid-cols-[340px,340px,340px]">
            {range(200).map((i) => {
              return (
                <div
                  onClick={() => {
                    history.push("/stream");
                  }}
                  className="w-full cursor-pointer hover:shadow-xl rounded-xl  bg-white grid grid-cols-[120px,1fr] gap-x-2 items-center shadow"
                >
                  <img
                    className="rounded-md"
                    src="https://images.pexels.com/photos/1181529/pexels-photo-1181529.jpeg?cs=srgb&dl=pexels-christina-morillo-1181529.jpg&fm=jpg"
                  />
                  <div className="">
                    <h1 className="font-semibold">Stream {i}</h1>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
