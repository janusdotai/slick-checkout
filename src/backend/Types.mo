import Array "mo:base/Array";

module Types {  

    public type CheckoutProfile = {
        owner: Principal;    
        updated_at: Int;    
        wallet: Text;
        notification_channels: [NotificationChannel];
    };    

    public type NotificationChannel = {
        service: Text; //ifttt
        url: Text; //your ifttt webhook url
        api_key: Text; //ifttt ignored
        enabled: Bool;
    };

    public type Timestamp = Nat64;

    //1. Type that describes the Request arguments for an HTTPS Outcall
    //See: https://internetcomputer.org/docs/current/references/ic-interface-spec/#ic-http_request
    public type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformRawResponseFunction;
    };

    public type HttpHeader = {
        name : Text;
        value : Text;
    };

    public type HttpMethod = {
        #get;
        #post;
        #head;
    };

    public type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];        
    };
  
    public type TransformRawResponseFunction = {
        function : shared query TransformArgs -> async HttpResponsePayload;
        context : Blob;
    };

    //2.2 This type describes the arguments the transform function needs
    public type TransformArgs = {
        response : HttpResponsePayload;
        context : Blob;
    };

    //3. Declaring the IC management canister which we use to make the HTTPS outcall
    public type IC = actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    };

    public type IC_ICP_Canister = actor {
        get_transaction : Text -> async Text;
        get_transactions : [Text] -> async [Text];
    };


};