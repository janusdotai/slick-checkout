import React from 'react';
import Popup from './Popup';
import { useAuth } from './use-auth-client';
import { ToggleCheckbox } from "./Toggle";

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;

/**
 *
 * @param goBack - function to return to main screen
 * @param initPopup - show a popup when the component mounts for first time 
 * 
 */
function EditStore({ goBack, initPopup, principalId }) {
  const [apiKey, setApiKey] = React.useState("");
  const [serviceUrl, setServiceUrl] = React.useState("");
  const [service, setService] = React.useState("");
  const [wallet, setWallet] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity
  const [showPopup, setShowPopup] = React.useState(false);
  const [serviceEnabled, setServiceEnabled] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(0);
  const [lastUpdatedFriendly, setLastUpdatedFriendly] = React.useState("");
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationResult, setNotificationResult] = React.useState("");
  //const [defaultId, setDefaultId] = React.useState('');
  
  const { actor } = useAuth();

  // on mount check if there's a store
  React.useEffect(() => {
    
    const fetch = async () => {
      const store = await actor.getCheckouts();
      if (store.length == 0) {  
        //setDefaultId(principalId);
        initPopup = true;
      }else{
        //console.log("pre pop")
        var storeInstance = store[0];      
        //console.log(storeInstance)
        setLastUpdated(storeInstance.updated_at);        
        const updated_at_ns = Number(storeInstance.updated_at);        
        var updated_at = toDateTime(updated_at_ns)        
        setLastUpdatedFriendly(updated_at.toString());
        setWallet(storeInstance.wallet);
        var channel = storeInstance.notification_channels[0];
        //console.log(channel)
        setService(channel.service);
        setServiceUrl(channel.url);
        setApiKey(channel.api_key);  
        setServiceEnabled(channel.enabled);        
      }
    };
    fetch().catch((err) => console.log(err));
  }, []);

  // push a store update to backend 
  const updateStore = async  () => {
    setLoading(true);
    // enter a valid wallet
    if (!WALLET_PATTERN.test(wallet)) {
      setIsValid(false);
      return;
    } 
    setIsValid(true);

    const whoami = await actor.whoami();
    const channel = {
      api_key : apiKey,
      url : serviceUrl, //https://api.courier.com
      service : service, //courier
      enabled : serviceEnabled, //turn notifications on/off
    }
    const newStore = {
      updated_at: Date.now(),
      owner: whoami,
      wallet: wallet,
      notification_channels: [channel]
    }
    
    console.log('store upsert');
    const response = await actor.addCheckout(newStore);
    // check if store set, if so display update modal
    if (response.ok == 'updated existing profile'){
      setLoading(false);
      setShowPopup(true)
      // close the popup after a few seconds
      setTimeout(() => {
        setShowPopup(false)
      }, 6000);
    }
  }

  const testNotification = async () =>{
    console.log("testing notification")    
    const thing = await actor.ifttt_webhook().catch(ex => {
      alert(ex);
      return false;
    }).then(x => {
      setLoading(false);
      setNotificationResult(x);
      setShowNotification(true)      
      setTimeout(() => {
        setShowNotification(false)
      }, 6000);
    });
    //console.log(thing);    
  }

  const toggleNotifications = async (toggle_state) =>{    
    setServiceEnabled(toggle_state);        
  }

 const toDateTime = (nano_secs) => {    
    var t = new Date(Date.UTC(1970, 0, 1));
    var secs = nano_secs / 1_000_000_000;
    t.setUTCSeconds(secs);
    return t;
  }
    
  return (
    <div className="container">
      {initPopup && <Popup 
        header_text='Please set up your store profile'
        body_text='You need to set up your store profile before you can start accepting payments and receiving notifications.'
      />}
      {showPopup && <Popup 
        header_text='Success!'
        body_text='Your store settings were updated.'
      />}
      {showNotification && <Popup 
        header_text='Notification!'
        body_text={notificationResult}
      />}
      <h2>{loading ? "Updating..." : "Edit profile"}</h2>
        <p>Store settings: </p>
         <input
            placeholder="Wallet principal"
            defaultValue={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }}
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>}
          <div>
            <p>Notification Settings:</p>
          </div>
          <input
            placeholder="Service"
            defaultValue={service}
            onChange={(e) => setService(e.target.value)}
          />          
          <input
            placeholder="Service Url"
            defaultValue={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
          />
          <input
            placeholder="API key"
            defaultValue={apiKey}
            onChange={(e) => setApiKey(e.target.value)}            
          />
          <div>
            <ToggleCheckbox label={serviceEnabled ? "notifications on" : "notifications off"} toggled={serviceEnabled} onClick={toggleNotifications} />
          </div>
          <button type="button" id="addressButton" onClick={updateStore}>
            Save
          </button>
          <button type="button" id="back" onClick={goBack}>
            Go back
          </button>
          <button type="button" id="test" onClick={testNotification}>
            Test Notification
          </button>
          <div className="small_text">
            last updated: { lastUpdatedFriendly }
          </div>
    </div>
  );
}

export default EditStore;
