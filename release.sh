# Clear
rm -rf ./dist

# Build server
yarn
yarn build
./node_modules/.bin/pkg --out-path=futbot build/server.js
cp .env.local futbot/.env

# Build extension
cd extension
nvm use 8 #https://github.com/YuraDev/vue-chrome-extension-template/issues/17
yarn
yarn build
cp -R build ../futbot/extension
cd ..

# Zip
zip -r futbot.zip futbot
rm -rf ./futbot