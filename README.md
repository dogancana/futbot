# FutBot

This is a very simple data source/trade bot for FIFA 20 fut api written in Typescript/Javascript for node.js.  
The main purpose is to automate simple activities. There is no intention to create a complete api as futapi.  
To inject your session into node server, there is a chrome extension in the project.  This extension is also drawing on fut web app, so that you can access features easily. 
It's tested with FIFA 20

## Table of contents

**[Prepare](#prepare)**<br>
**[Start](#start)**<br>
**[Existing features](#existing-features)**<br>
**[Existing UI Features](#existing-ui-features)**<br>
**[What to do on errors](#what-to-do-on-errors)**<br>
**[Disclaimer and Notes](#disclaimer-and-notes)**<br>
**[Known Bugs](#known-bugs)**<br>
**[Discord](#discord)**<br>


## Prepare
```Node and yarn```  
Install [node](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/lang/en/docs/install/). Installing yarn via installation scripts are generally easier. 
 
```Config```  
The project needs a configuration file (.env) in order to get some user preferences and region based api endpoint (I was lazy to figure it out automatically). You can copy .env.local file as .env file if you are in europe.  If you are outside of europe, there is a really small change you need to make. In order to figure out your corresponding ea server, you should open developer tools in your browser and refresh fut web application. It'll stop you from debugging by adding infinite debuggers. Just click to deactive debug points and click play. Then go to network tab and search for a url similar to 'https://utas.external.s2.fut.ea.com/ut/game/fifa20'. Only different part should be 's2'. Once you find your url, change it in .env file and you are good to go. Note: any change in .env file requires app to restart.

## Start

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
Login to fut web app so that the extension can steal your session and inject it into node server.
Since this server is not intented to be deployed somewhere, there is no session in node server. Instead, your Fut web app session will be shared for any task in the server.

## Existing features:

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
The job figures investment targets from most popular futbin players in 1000 - 5000 price range (can be overwritten with min max query params).
Once the job finds a player with a safe price to buy, it'll buy and resell it. Sometimes you get errors on reselling because processing player time takes more than expected (5s). If you also have trade-bot/sell job running, it'll catch these players and sell for same price.
The job will continue to spend all the budget for buying players. 
Sell prices won't be added back to actual budget.  
If you start this job in the night with parameters I provided, you might have ~10-20k profit in the morning.

http://localhost:9999/invest/good-auctions?budget=50000&min=5000&max=10000  
This is similar to low players investor job. Only difference is, this job is focused on expensive players with low current bid amounts. This job searches market for auctions, which will expire soon. In these auctions, the task will try to find players for 20% profit margin and bid accordingly.

http://localhost:9999/jobs/start-favourites  
You can start a set of jobs from one endpoint. You can configure this in .env file. There is an example in .env.local file. Look for FUTBOT_FAVOURITE_JOBS value in there and configure for your own needs.

http://localhost:9999/jobs/list  
http://localhost:9999/jobs/stop-all  
http://localhost:9999/jobs/resume-all  
These endpoints are pretty straitghforward. They show an overall look of currently running tasks/jobs. They also include their individual reports.

http://localhost:9999/stats
Shows statistics about api usage for fut & futbin.

There are more endpoints to use. But I don't think they are worth to mention in this point. You can read them in files named ```*.*-app.ts``` 

## Existing UI Features

```Player prices:``` The extension will add small visual components to players. Example below:
![](doc/gifs/player-price.gif)

## What to do on errors
Once in a while you'll get authentication errors from futbin and fut. The reason would be either fut session expired (401,403), fut requires validation (458) or futbin temporary ban (403).  
The application stops after receiving these errors. But you need to refresh fut web app and login again, so that the extension can send new auth token to the server. After this, the jobs should automatically restart. You can validate if jobs are still in 'stoped' state by checking http://localhost/jobs/list. If they didn't start automatically, just call http://localhost/jobs/resume-all.  
Futbin servers ban your IP address for 6-12 hours. Once you get banned from futbin, application will still work but it will be really slow. If you wish to continue, you can change your IP address (restart modem, use different VPN server) and restart the app.

## Disclaimer and Notes

I'm pretty sure this would violate some terms and conditions. Use on your own risk  
The requests against fut api and futbin api are limited per minute. The values should be good enough to execute the bot for couple of hours. You can check request stats from http://localhost:9999/stats  
In case of temporary ban from fut api, jobs will be stopped automatically. If you are banned from futbin, bot won't make any requests to futbin for next couple of hours.
I'm trying all the features from my profile. I generally try it with all quality (including specials). But still there might be weird edge cases which can cause bugs or losses. 

## Known Bugs

- Currently, the server gets wrong rating value for special cards. So, parameters such as maxRating is effected. (Nothing wrong with prices.) 

## Discord

Join [this](https://discord.gg/FqtRXZ) discord server if you have any questions/suggestions. You can also share some feedback for possible enhancements to the bot. 
