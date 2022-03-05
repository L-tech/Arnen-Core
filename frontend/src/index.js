import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./components/Dapp";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Dapp />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
