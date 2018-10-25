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
Login to fut web app so that the extension can stole your session and inject it into node server.
Since this server is not intented to be deployed somewhere, there is no session in node server. Instead, your Fut web app session will be shared for any task in the server.

# Existing features:

http://localhost:3000/club/players
This just returns your players in club, not in tradepile

http://localhost:3000/trade-bot/start-selling
This will start 2 jobs: Clearing transfer pile and selling players who are not in your active squad. 
Once in a while it gets your players from club, figures a good price according to futbin/fut market data. And sells them if prices are trustable enough.  
`Mindstet:` Probably you have 100s of unwanted players with a price range of 0-5000. Quickselling them actually means loosing money. You can start this selling feature and get rid of them for lowest futbin prices/lowest market buyNow prices.

http://localhost:3000/trade-bot/clear-pile
This will clear transfer list from sold/expired items
It's best to use prior to sell  


There are many more endpoints to use. But I don't think they are worth to mention in this point. You can read them in files named ```*.*-app.ts``` 

# Disclaimer and Notes

I'm pretty sure this would violate some terms and conditions. Use on your own risk  
The requests against fut api and futbin api are limited per minute. The values should be good enough to execute the bot for couple of ours. You can check request stats from http://localhost:9999/stats  
If you get auth errors, just refresh fut web app or click to some features to update sid, so extension can send new auth information to server  
I'm trying all the features from my profile. I generally try it with all quality (including specials). But still there might be weird edge cases which can cause bugs. 

# Sync issues

FUT Web app is making requests with an incremental timestamp/id. If you execute actions in this bot, your FUT Web app and this server might be out of sync after some time and you'd see weird transfer lists, player lists etc. To sync it again just refresh FUT Web App.  
It's better to not use FUT Web App if you are planning to auto sell/buy for a long time from this bot.

# Auth errors

On the first auth error this bot gets from EA servers, it'll invalidate the auth tokens and stop working till you send new sid from FUT Web App (via extension)

# Roadmap

- Invest  
  A feature to enable investing X amount of coins for players in [Y-Z] price range.  
  It would read player prices with given range from futbin, and start bidding them in game.

- Buy SBC players  
  Purpose of this feature will be to read completed SBC challanges from futbin and autobuy related players under futbin prices