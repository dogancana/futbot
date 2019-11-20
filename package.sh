rm -rf futbot.zip
rm -rf futbot
mkdir futbot

cp packages/server/.env.local futbot/.env
cp -R packages/extension/build futbot/extension
cp -R packages/server/dist/* futbot
chmod +x futbot/server/server-macos
chmod +x futbot/server/server-win.exe

apt-get update
apt-get install zip
zip -r futbot.zip futbot
