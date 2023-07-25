import React from 'react';
import { IcrcLedgerCanister } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import { useAuth } from "./use-auth-client";

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;
const CKBTC_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";
/**
 *
 * @param goBack - function to return to main screen 
 * 
 */
function Send({ goBack }) {
  const [to, setTo] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity

  const { actor, logout } = useAuth();

  async function  handleTransfer () { 

    const whoami = await actor.whoami();  

    if (to !== "" || 1==1) {
      if (WALLET_PATTERN.test(to) || 1==1) {
        
        setTo(to)
        setIsValid(true); // Set input validity to true if the address is valid

        const ckBtcCanister = IcrcLedgerCanister.create({
          actor,
          canisterId: Principal.fromText(CKBTC_CANISTER_ID)
        });      
  
        var thing = await ckBtcCanister.balance({
            owner: whoami,
            certified: false,
        });        
        //console.log(thing) 

        const pamount = Number.parseFloat(amount);
        if(pamount < 0){
          throw "Invalid amount"
        }
        //console.log("amount being sent " + pamount)

        var amount_to_send = BigInt(Math.round(pamount * 100_000_000));       
        console.log("amount being sent as bigint" + amount_to_send)

        const response = await ckBtcCanister.transfer({
          to: {
            owner: Principal.fromText(to),
            subaccount: [],
          },
          amount: amount_to_send,
        });
  
        if(response){
          console.log("ckbtc sent");
        }else{
          console.log("there was a problem sending the ckBTC");
        }

      } else {
        setIsValid(false); // Set input validity to false if the address is invalid
      }
    }
  }
  
  return (
    <div className="container">
      <h2>Transfer ckBTC</h2>
         <input
            placeholder="Send ckBTC to..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="button" id="addressButton" onClick={handleTransfer}>
            Transfer Funds
          </button>
        <button type="button" id="back" onClick={goBack}>
          Go back
        </button>
    </div>
  );
}

export default Send;
