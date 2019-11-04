export async function getPlayerPrice(assetId, resourceId) {
  const resp = await fetch(
    `http://localhost:9999/player?assetId=${assetId}&resourceId=${resourceId}`
  );
  const body = await resp.json();
  return body;
}
