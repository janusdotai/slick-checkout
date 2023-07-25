# Slick Checkout

Slick Checkout is a simple dapp that enables a merchant to quickly setup a point of sale "terminal" 
to accept ICP or ckBTC transactions directly into their wallet.  The app supports both ICP and ckBTC using the IRC-1 standard.

![slick1](/docs/slick1.PNG)

![slick2](/docs/slick2.PNG)

![slick3](/docs/slick3.PNG)

![slick4](/docs/slick4.PNG)

# Features

## Anon mode

Simply open the app and enter your principal wallet address. The app will poll for ICP/ckBTC transactions on the client side waiting for new transactions. Once detected a notification will be displayed.

## Authenticated mode

Login with Internet Identity and save a profile.  Optionally add your https://www.courier.com/ API
key and have email/sms notifications anytime a new transaction lands in the monitored wallet.

# Notes

Unfortuantely courier is not working in this release as there are CORS limitations for sending notifications client side. We tested server-side notifications using https-outcalls but since courier does not support IPV6 this feature does not work right now.

We decided to poll for transactions on the client side to save cycles, doing it on the server works and also talking directly to the canisters but we found using existing API's (rosetta etc) seemed to be more performant and cost effective.  The downside of this approach is if you close the app, the notifications will not land. As we build this out this will be a configurable option.

## Live Demo

https://aupl6-yaaaa-aaaak-ae3eq-cai.icp0.io/

## Setting up for local development

To get started, start a local dfx development environment in this directory with the following steps:

```bash
git clone git@github.com:janusdotai/slick-checkout.git
cd slick-checkout/
npm install
npm run generate
dfx start --background --clean
dfx deploy
npm run start:react
```

Once deployed, start the development server with `npm run start:react`.

You can now access the app at `http://localhost:5173`.

## Missing Features

- Logged in users cannot create new addresses
- Courier notifications not working

## Authors

- Dimi - https://github.com/janusdotai - https://supercart.ai
- Max - https://github.com/f1lth

We're both ICP newbs and this is our first project. We learned a tremendous amount about Motoko, ckBTC, https-outcalls and the Internet computer while bulding this and will continue to work on it.  Please submit pull requests if you wish!