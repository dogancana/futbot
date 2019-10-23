# Clear
rm -rf ./futbot
rm -rf ./futbot.zip

# Build server
yarn
yarn build
./node_modules/.bin/pkg --out-path=futbot --targets=node8-macos,node8-win --options max_old_space_size=4096 build/server.js
cp .env.local futbot/.env

# Build extension
cd extension
nvm use 8 #https://github.com/YuraDev/vue-chrome-extension-template/issues/17
yarn
yarn build
cp -R build ../futbot/extension
cd ..

# Execution Perms
chmod +x futbot/server-macos
chmod +x futbot/server-win.exe

# Zip and clear
zip -r futbot.zip futbot
rm -rf ./futbot