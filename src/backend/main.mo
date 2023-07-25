import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Types "Types";
import Ifttt "Ifttt";

/// Simple ICP / ckBTC Checkout
/// Registered users can keep a profile and load saved addressess and notification channels
shared( init_owner ) actor class PaymentWatcher() {

  type CheckoutProfile = Types.CheckoutProfile;
  type NotificationChannel = Types.NotificationChannel;  
  
  private let CONFIG_TEST_MODE : Bool = true;
  private let OWNER : Principal = init_owner.caller;
  
  stable var data_backup : [CheckoutProfile] = [];
  var checkoutStorage = Buffer.fromIter<CheckoutProfile>(data_backup.vals());  

  system func preupgrade() {
    data_backup := Iter.toArray(checkoutStorage.vals());    
  };

  system func postupgrade() {
    data_backup := [];
  };

  private func _findCheckout(checkouts : Buffer.Buffer<CheckoutProfile>, checkoutOwner: Principal) : ?Nat{      
      var checkoutArray = Iter.toArray(checkouts.vals());
      for (i in checkoutArray.keys()) {
        if(checkoutArray[i].owner == checkoutOwner){
          return ?i;
        };          
      };        
      return null;
  };

  public query func owner() : async Principal {
    	return OWNER;      
  };

  public query ({ caller }) func whoami() : async Principal {
    	return caller;
  };
 
  //upsert a checkout
  public shared ({ caller }) func addCheckout(checkoutProfile : CheckoutProfile) : async Result.Result<Text, Text> {
    var isAnon = Principal.isAnonymous(caller);
    Debug.print("isAnon " # debug_show(isAnon));
    if(isAnon){            
      return #err("no anon cart storage - please login");
    };

    let clone : CheckoutProfile = { 
        owner = caller;
        updated_at = Time.now();
        wallet = checkoutProfile.wallet;      
        notification_channels = checkoutProfile.notification_channels;
    };
  
    let checkoutIndex = _findCheckout(checkoutStorage, caller);
    switch(checkoutIndex){
        case null{              
            checkoutStorage.add(clone);
            Debug.print("did not find checkout, adding new")
        };
        case(?checkoutIndex){            
            checkoutStorage.put(checkoutIndex, clone);
            Debug.print("checkout exists, updating");
        };
    };
    return #ok("updated existing profile");    
    
  };

  // delete my checkout
  public shared ({ caller }) func deleteCheckout() : async Bool {
    var isAnon = Principal.isAnonymous(caller);   
    if(isAnon){
      Debug.print("anon can't delete checkout");
      return false;
    };
    let idx = _findCheckout(checkoutStorage, caller);
    switch(idx){
      case null{       
        return false;
      };
      case(?idx){
        let x = checkoutStorage.remove(idx);
        return true;       
      };
    };
  };

  // get my checkouts
  public shared query ({ caller }) func getCheckouts() : async [CheckoutProfile] {    
    let b = Buffer.Buffer<CheckoutProfile>(10);    
    b.append(checkoutStorage);
    b.filterEntries(func(x : Nat, yo : CheckoutProfile){
      return yo.owner == caller;
    });    
    Iter.toArray(b.vals());
  };  

  // get checkout count
  public query func getCheckoutCount() : async Nat {
    Iter.toArray(checkoutStorage.vals()).size();
  };

  // trigger https-outcall webhook (only ipv6 supported service)
  public shared ({ caller }) func ifttt_webhook() : async Text {
    var isAnon = Principal.isAnonymous(caller);      
    if(isAnon){
      Debug.print("anon can't execute tasks");
      return "error";
    };
    let idx = _findCheckout(checkoutStorage, caller);
    switch(idx){
      case null{       
        return "No IFTTT found";
      };
      case(?idx){
        let profile = ?checkoutStorage.get(idx);
        let ifttt = Ifttt.Ifttt(profile);
        let result = await ifttt.run_webhook();
        return result;
      };
    };
  };

  
};