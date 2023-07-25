export const idlFactory = ({ IDL }) => {
  const NotificationChannel = IDL.Record({
    'url' : IDL.Text,
    'service' : IDL.Text,
    'api_key' : IDL.Text,
    'enabled' : IDL.Bool,
  });
  const CheckoutProfile = IDL.Record({
    'updated_at' : IDL.Int,
    'owner' : IDL.Principal,
    'notification_channels' : IDL.Vec(NotificationChannel),
    'wallet' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const PaymentWatcher = IDL.Service({
    'addCheckout' : IDL.Func([CheckoutProfile], [Result], []),
    'clearCheckouts' : IDL.Func([], [IDL.Bool], []),
    'deleteCheckout' : IDL.Func([], [IDL.Bool], []),
    'getCheckoutCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getCheckouts' : IDL.Func([], [IDL.Vec(CheckoutProfile)], ['query']),
    'getCheckoutsOwner' : IDL.Func([], [IDL.Vec(CheckoutProfile)], ['query']),
    'owner' : IDL.Func([], [IDL.Principal], ['query']),
    'send_notification_test' : IDL.Func([], [IDL.Text], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return PaymentWatcher;
};
export const init = ({ IDL }) => { return [IDL.Opt(IDL.Vec(IDL.Principal))]; };
