# FutBot

This is a very simple data source/trade bot for fifa fut api written in Typescript/Javascript for node.js. 

To inject your session into node server, there is a chrome extension in the project.

It's tested with FIFA 19

# Start

Start the server
```sh
$ yarn
$ yarn dev
```
Load the extension in chrome://extensions with developer mode.

Login to fut web app. This will get your token to node server.

# Existing features:
http://localhost:3000/club/players
This just returns your players in club, not in tradepile

http://localhost:3000/trade-bot/sell?batch=10http://localhost:3000/trade-bot/sell?batch=10&quality=gold
This finds players to sell in your club (not in your active squad, tradable).

Filters will come in future

After finding players, it checks the prices in market (max 100 different auctions) and sells players

batch and quality is optional

http://localhost:3000/trade-bot/clear-pile
This will send evvery inactive player in your transfer list to your club.

It's best to use prior to sell

# Disclaimer and Notes
I'm pretty sure this would violate some terms and conditions. Use on your own risk

Whenever you make a call to the server, it'd make around 5 requests per second. If you use it more frequently, most probably your session will be reset.

If you get auth errors, just  refresh fut web app so extension can send new auth information to server
