import React from "react";
import Recieve from "./Recieve";
import Send from "./Send";
import EditStore from "./EditStore";
import icLogo from "./assets/ic.png";
import { useAuth } from "./use-auth-client";
import { Principal } from "@dfinity/principal";
import { PrincipalToAccountIdText } from "./utils";

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};

function LoggedIn() {
  const [activeComponent, setActiveComponent] = React.useState('default');
  const [principalId, setPrincipalId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [showPopup, setShowPopup] = React.useState(false);
  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data
  const { actor, logout } = useAuth();

  // on first launch, fetch store data
  React.useEffect(() => {
    const fetch = async () => {
      //const whoami = await actor.whoami();
      const stores = await actor.getCheckouts();
      // if there's no store lets make one
      console.log(stores);
      if (stores.length == 0){
        setShowPopup(true)
        setActiveComponent('edit')
      } else {
        var store = stores[0];
        var wallet = store.wallet;
        if(!wallet || wallet.length < 10){
          throw Error("Invalid wallet");
        }       
        setShowPopup(false);
      }      
      //let pid = whoami.toString();
      let pid = wallet;
      setPrincipalId(pid)
      var p = Principal.fromText(pid);
      let account_id = PrincipalToAccountIdText(p);
      console.log("account id is: " + account_id);
      setAccountId(account_id);

    }
    fetch()
    .catch(console.error)
  }, []);
    
  // show transactions on gui
  function displayTransactions () {
    setShowTransactions(!showTransactions);
  }

  // return to main screen
  const goBack = () => {
    setActiveComponent('default')
  }

  // chose which of the menu screens to show
  const renderComponent = () => {
    switch (activeComponent) {
      // main page
      case 'default':
        return <div className='container'> <h1>Slick Checkout</h1>
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3 title={principalId}>{principalId.slice(0, 10) + "..."}</h3>
        </div>
        <p>Monitor incoming payments and setup your store</p>
        <button id="recieve" onClick={() => setActiveComponent('recieve')} > Recieve </button>
        <button id="send"    onClick={() => setActiveComponent('send')} >    Send ckBTC </button>
        <button id="edit"    onClick={() => setActiveComponent('edit')} >    Edit store profile </button>
        <button id="logout" onClick={logout}>
          Log out
        </button></div>
      // poll for payments and check recent transations
      case 'recieve':
        return <Recieve 
          principalId={principalId} 
          accountId={accountId} 
          showTransactions={showTransactions} 
          displayTransactions={displayTransactions} 
          goBack={goBack} 
          />;
      // do a transfer
      case 'send':
        return <Send
          goBack={goBack}
          />
      // edit your storefront
      case 'edit':
        return <EditStore
        goBack={goBack}
        initPopup={showPopup}
        principalId={principalId}/>
      default:
        return null;
    }
  };

  return (
    <> 
      {renderComponent()} 
    </>
  );
}

export default LoggedIn;
