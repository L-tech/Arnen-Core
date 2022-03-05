import { useArnenContext } from "./context";

export const useCreator = () => {
  const { contentContract } = useArnenContext();

  // check if the user is already a creator
  const [creator, setCreator] = React.useState(null);

  const [isLoading, setIsLoading] = React.useState(false);

  // this is messy, but it works
  const loginOrRegister = async (name, niche, avatar) => {
    setIsLoading(true);
    let creator = await contentContract.getCreator();
    if (creator === null) {
      await contentContract.addCreator(name, niche, avatar);
      creator = await contentContract.getCreator();
    }
    setCreator(creator);
    setIsLoading(false);
  };

  return {
    creator,
    isLoading,
    loginOrRegister,
  };
};
