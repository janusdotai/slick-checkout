import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Char "mo:base/Char";

import Types "Types";

// https://ifttt.com/ automation supports ipv6
// https://ifttt.com/activity/service/maker_webhooks
// https://maker.ifttt.com/trigger/${eventName}/with/key/${apiKey}
module {

    type CheckoutProfile = Types.CheckoutProfile;   
    type NotificationChannel = Types.NotificationChannel;    

    public class Ifttt(p : ?CheckoutProfile) {

        private let CONFIG_TEST_MODE : Bool = true;       
        let profile : ?CheckoutProfile = p;       

        private func _getDefaultProfile() : CheckoutProfile {
            var anon = Principal.fromText("2vxsx-fae");
            let clone : CheckoutProfile = { 
                owner = anon;
                updated_at = Time.now();
                wallet = "";
                notification_channels = [];
            };
            return clone;
        };
        
        private func _unwrapNullable(value : ?CheckoutProfile) : CheckoutProfile {
            let profile : CheckoutProfile = Option.get<CheckoutProfile>(value, _getDefaultProfile());
            return profile;
        };
       
        public func run_webhook() : async Text {
            Debug.print("ifttt run_webhook");
            if(profile == null){
                return "Profile required";
            };
          
            let ic : Types.IC = actor ("aaaaa-aa");
            let p : CheckoutProfile = _unwrapNullable(profile);

            let max_response_bytes : Nat64 = 10000;

            Debug.print("ifttt run_webhook " # debug_show(p));
            let ifttt_hooks = Array.filter<NotificationChannel>(p.notification_channels, func(x) = x.service == "ifttt");
            if(ifttt_hooks.size() == 0){
                return "No ifttt service found";
            };

            var hook = ifttt_hooks[0];      
            if(hook.enabled == false){
                return "The notification is disabled - please enable";
            };

            var key = hook.api_key; //ignored for now url has key in it
            Debug.print("ifttt run_webhook hook: " # debug_show(hook));
            var url = hook.url;
            Debug.print("HTTP REQUEST URL: " # debug_show(url));

            let request_headers = [                                
                { name = "Content-Type"; value = "application/json" },                
                { name = "Cache-Control"; value = "no-cache, no-store, must-revalidate" },                
                { name = "Pragma"; value = "no-cache" },
                { name = "User-Agent"; value = "Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1"}
            ];
            let wallet = subText(p.wallet, 0, 8);
            let request_body_json = "{\"wallet\":\"" # wallet # "\"}";
            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_json); 
            let request_body_as_nat8: [Nat8] = Blob.toArray(request_body_as_Blob); // e.g [34, 34,12, 0]
            
            Debug.print("ifttt json " # debug_show(request_body_json));
          
             let http_request : Types.HttpRequestArgs = {
                url = url;
                max_response_bytes = ?max_response_bytes; //optional for request
                headers = request_headers;
                body = ?request_body_as_nat8;
                method = #post;
                transform = null; //optional for request
            };
           
            Cycles.add(220_131_200_000); //minimum cycles needed to pass the CI tests. Cycles needed will vary on many things size of http response, subnetc, etc...).
                        
            let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
            Debug.print("HTTP http_response: " # debug_show(http_response));            
            let response_body: Blob = Blob.fromArray(http_response.body);
            Debug.print("HTTP response_body: " # debug_show(response_body));     
            let status: Nat = http_response.status;
            Debug.print("HTTP status: " # debug_show(status));
            let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
                case (null) { "send_notification No value returned" };
                case (?y) { y };
            };            
            return decoded_text;
        };
    };

    private func subText(value : Text, indexStart : Nat, indexEnd : Nat) : Text {
        if (indexStart == 0 and indexEnd >= value.size()) {
            return value;
        }
        else if (indexStart >= value.size()) {
            return "";
        };        
        var indexEndValid = indexEnd;
        if (indexEnd > value.size()) {
            indexEndValid := value.size();
        };
        var result : Text = "";
        var iter = Iter.toArray<Char>(Text.toIter(value));
        for (index in Iter.range(indexStart, indexEndValid - 1)) {
            result := result # Char.toText(iter[index]);
        };
        return result;
    };

};
