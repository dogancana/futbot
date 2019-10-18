# Clear
rm -rf ./dist

# Build server
yarn
yarn build
cp .env.local dist/.env

# Build extension
cd extension
yarn
yarn build
cp -R build ../dist/extension