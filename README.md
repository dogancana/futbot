# FutBot

This is a very simple data source/trade bot for FIFA 20 fut api written in Typescript/Javascript for node.js.  
The main purpose is automate simple activities. There is no intention to create a complete api as futapi.  
To inject your session into node server, there is a chrome extension in the project.  
It's tested with FIFA 20

# Prepare

```Config```  
The project needs a configuration file (.env) in order to get some user preferences and region based api endpoint (I was lazy to figure it out automatically). You can copy .env.local file as .env file if you are in europe.  
Without the file, server won't work.


# Start

Start the server

```sh
$ yarn
$ yarn dev
```
Go to ui folder and build extension first (use node version 8-9)  
```sh
$ yarn
$ yarn build
```
Load the extension in developer mode to chrome. Build output should be under /ui/build  
Login to fut web app so that the extension can stole your session and inject it into node server.
Since this server is not intented to be deployed somewhere, there is no session in node server. Instead, your Fut web app session will be shared for any task in the server.

# Existing features:

http://localhost:9999/club/players
This just returns your players in club, not in tradepile

http://localhost:9999/trade-bot/start-selling
This will start 2 jobs: Clearing transfer pile and selling players who are not in your active squad. 
Once in a while it gets your players from club, figures a good price according to futbin/fut market data. And sells them if prices are trustable enough.  
```Query Paramters: ``` maxRating  
`Mindstet:` Probably you have 100s of unwanted players with a price range of 0-5000. Quickselling them actually means loosing money. You can start this selling feature and get rid of them for lowest futbin prices/lowest market buyNow prices.

http://localhost:9999/trade-bot/clear-pile
This will clear transfer list from sold/expired items
It's best to use prior to sell  
  
http://localhost:9999/invest/low-players?budget=50000&min=1000&max=5000&maxTargetPool=150
When you start investing with a budget, a job will start to buy cheap players for cheaper (<80%) futbin prices. Since players are already cheap, it will try to use buyNow feature all the time. 
The job figures investment targets from most popular futbin players in 1000 - 2500 range (can be overwritten with min max query params).
Once the job finds a player with a safe price to buy, it'll buy and resell it. Sometimes you get errors on reselling because processing player time takes more than expected (5s). If you also have trade-bot/sell job running, it'll catch these players and sell for same price.
The job will continue to spend all the budget for buying players. 
Sell prices won't be added back to actual budget.  
If you start this job in the night with parameters I provided, you might have ~10-20k profit in the morning.


There are many more endpoints to use. But I don't think they are worth to mention in this point. You can read them in files named ```*.*-app.ts``` 

# Existing UI Features

```Player prices:``` The extension will add small visual components to players. Example below:
![](doc/gifs/player-price.gif)

# Disclaimer and Notes

I'm pretty sure this would violate some terms and conditions. Use on your own risk  
The requests against fut api and futbin api are limited per minute. The values should be good enough to execute the bot for couple of ours. You can check request stats from http://localhost:9999/stats  
If you get auth errors, just refresh fut web app or click to some features to update sid, so extension can send new auth information to server  
I'm trying all the features from my profile. I generally try it with all quality (including specials). But still there might be weird edge cases which can cause bugs. 

# Known Bugs

- Currently, the server gets wrong rating value for special cards. So, parameters such as maxRating is effected. (Nothing wrong with prices.) 

# Sync issues

FUT Web app is making requests with an incremental timestamp/id. If you execute actions in this bot, your FUT Web app and this server might be out of sync after some time and you'd see weird transfer lists, player lists etc. To sync it again just refresh FUT Web App.  
It's better to not use FUT Web App if you are planning to auto sell/buy for a long time from this bot.

# Auth errors

On the first auth error this bot gets from EA servers, it'll invalidate the auth tokens and stop working till you send new sid from FUT Web App (via extension)
