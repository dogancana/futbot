export async function addTargetToAutoBuy(assetId, resourceId, maxPrice) {
  const resp = await fetch(
    `http://localhost:9999/auto-buyer/add-target?assetId=${assetId}&resourceId=${resourceId}&maxPrice=${maxPrice}`
  );
  const body = await resp.json();
  return body;
}
