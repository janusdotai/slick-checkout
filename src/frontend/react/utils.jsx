import { sha224 } from "js-sha256";
import crc32 from "crc-32";
import { CourierClient } from "@trycourier/courier";

export async function fetchTransactionsCKBTC(principalId, limit) {  
    const response = await fetch(`https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/${principalId}/transactions?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}  

export async function fetchTransactionsICP(accountId, limit) {  
  let url = "https://rosetta-api.internetcomputer.org/search/transactions";  
  let data = {"network_identifier": { "blockchain" : "Internet Computer", "network": "00000000000000020101"}, "account_identifier": { "address": accountId  } };
  const response = await fetch(url, {
    method: "POST", 
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",      
      "Content-Type": "application/json; charset=utf-8"
    },    
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json(); // parses JSON response into native JavaScript objects 
}

//https://github.com/ninegua/tipjar/blob/main/src/tipjar_assets/src/agent.js#L2
function principalToAccountId(principal, subaccount) {
  const shaObj = sha224.create();
  shaObj.update("\x0Aaccount-id");
  shaObj.update(principal.toUint8Array());
  shaObj.update(subaccount ? subaccount : new Uint8Array(32));
  const hash = new Uint8Array(shaObj.array());
  const crc = crc32.buf(hash);
  return [
    (crc >> 24) & 0xff,
    (crc >> 16) & 0xff,
    (crc >> 8) & 0xff,
    crc & 0xff,
    ...hash,
  ];
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

export function PrincipalToAccountIdText(principal){
  var p = principalToAccountId(principal);
  return toHexString(p);
}


export async function NotificationEmail(email){
  if(!email) throw "Invalid email";

  console.log("sending NotificationEmail " + email)
  const courier = CourierClient({ authorizationToken: import.meta.env.VITE_COURIER_KEY }); // get from the Courier UI

  const { requestId } = await courier.send({
    message: {
      to: {
        data: {
          name: "Internet Computer Enjoyer",
        },
        email: email,
      },
      content: {
        title: "A new transaction has been detected",
        body: "Hey {{name}}, check your wallet for recent payments",
      },
      routing: {
        method: "single",
        channels: ["email"],
      },
    },
  });
  return requestId;

}

export async function NotificationSMS(sms){
  if(!sms) throw "Invalid email";
  console.log("sending NotificationSMS " + sms)
  
  const courier = CourierClient({ authorizationToken: import.meta.env.VITE_COURIER_KEY });

  const { requestId } = await courier.send({
    message: {
      to: {
        data: {
          name: "Internet Computer Enjoyer",
        },
        phone_number: sms,
      },
      content: {
        title: "A new transaction has been detected",
        body: "Hey {{name}}, check your wallet for recent payments",
      },
      routing: {
        method: "single",
        channels: ["sms"],
      },
    },
  });

  return requestId;
}

