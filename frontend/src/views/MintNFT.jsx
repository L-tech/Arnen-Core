const NFTOption = props => {
  return (
    <div className="px-6 py-6 bg-white border border-gray-100 rounded">
      <h1 className="text-3xl leading-none font-semibold text-blue-500">{props.title}</h1>
      <p className="text-gray-700 text-lg ">{props.description}</p>
      <button className="font-semibold w-full px-4 py-2 bg-gray-600 text-white rounded-xl">Subscribe</button>
    </div>
  );
};

export const MintNFT = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="grid grid-rows-[84px,400px,1fr] px-6 h-full overflow-y-auto">
        <nav className="items-center max-w-6xl mx-auto w-full flex justify-end gap-x-6 text-gray-500">
          <h1 className="font-serif text-3xl font-bold text-gray-500">_</h1>
          <div className="flex-1" />
        </nav>

        <div className="max-w-6xl mx-auto w-full flex justify-center flex-col ">
          <h1 className="text-4xl text-center font-bold text-gray-800 flex flex-col">
            Get ready to access the best content, and support your favorite creators
          </h1>

          <div className="grid mx-auto grid-cols-2 gap-x-4 pt-2 w-full">
            <NFTOption
              title="Traditional"
              description="Subscribe for a set period of time and optionally renew once the period ends"
            />
            <NFTOption
              title="Activity Based"
              description="Interact with the platform, tip, and support your favorite creators to extend your subscription"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
