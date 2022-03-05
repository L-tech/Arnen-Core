import React from "react";

export const ArnenContext = React.createContext({
  address: null,
  contract: null,
  contentContract: null,
});

export const useArnenContext = () => React.useContext(ArnenContext);
