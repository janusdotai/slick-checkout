import React from "react";
import { useAuth } from "./use-auth-client";
import Recieve from './Recieve';
import { Principal } from "@dfinity/principal";
import { PrincipalToAccountIdText } from "./utils";

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;

function LoggedOut() {
  const { login } = useAuth();
  const [principalId, setPrincipalId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [showRecievePortal, setShowRecievePortal] = React.useState(false);
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity
  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data

  // return to main screen
  function goBack () {
    setShowRecievePortal(false);
  }

  // display transactions
  function displayTransactions () {
    setShowTransactions(!showTransactions);
  }

  // set only valid addresses
  function handleAddress () {
    if (principalId !== "") {
      if (WALLET_PATTERN.test(principalId)) {
        setIsValid(true); // Set input validity to true if the address is valid
        setShowRecievePortal(true);
        var p = Principal.fromText(principalId);
        let account_id = PrincipalToAccountIdText(p);
        //console.log("account id is: " + account_id);
        setAccountId(account_id);
      } else {
        setIsValid(false); // Set input validity to false if the address is invalid
      }
    }
  }

  return (
    <>
    {showRecievePortal ? 
      <Recieve 
        principalId={principalId} 
        accountId={accountId}
        showTransactions={showTransactions} 
        displayTransactions={displayTransactions} 
        goBack={goBack} 
      />
    :
    <div className="container">
      <h2>Slick Checkout</h2>
        <h3>Enter a wallet or login to continue:</h3>  
         <input
            placeholder="Wallet principal address"
            value={principalId}
            onChange={(e) => setPrincipalId(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <button type="button" id="addressButton" onClick={handleAddress}>
            Submit
          </button>
        <button type="button" id="loginButton" onClick={login}>
          Log in
        </button>
    </div>
    }
    </>
  );
}

export default LoggedOut;
