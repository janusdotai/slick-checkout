import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface CheckoutProfile {
  'updated_at' : bigint,
  'owner' : Principal,
  'notification_channels' : Array<NotificationChannel>,
  'wallet' : string,
}
export interface NotificationChannel {
  'url' : string,
  'service' : string,
  'api_key' : string,
  'enabled' : boolean,
}
export interface PaymentWatcher {
  'addCheckout' : ActorMethod<[CheckoutProfile], Result>,
  'clearCheckouts' : ActorMethod<[], boolean>,
  'deleteCheckout' : ActorMethod<[], boolean>,
  'getCheckoutCount' : ActorMethod<[], bigint>,
  'getCheckouts' : ActorMethod<[], Array<CheckoutProfile>>,
  'getCheckoutsOwner' : ActorMethod<[], Array<CheckoutProfile>>,
  'owner' : ActorMethod<[], Principal>,
  'send_notification_test' : ActorMethod<[], string>,
  'whoami' : ActorMethod<[], Principal>,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE extends PaymentWatcher {}
