import { createRoot } from "react-dom/client";
import App from "./App";

// import Wallet from helper file
import { Wallet } from "./near-wallet";
import * as nearAPI from "near-api-js";

// Store the contract address
const CONTRACT_ADDRESS = "donations.primerlabs.testnet";

// Instantiate a wallet object
const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS });

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Setup on page load
window.onload = async () => {
  const isSignedIn = await wallet.startUp();
  const connectionConfig = await wallet.walletSelector.options.network;
  const nearConnection = await nearAPI.connect(connectionConfig);

  root.render(
    <App
      isSignedIn={isSignedIn}
      contractId={CONTRACT_ADDRESS}
      wallet={wallet}
      nearConnection={nearConnection}
    />
  );
};
