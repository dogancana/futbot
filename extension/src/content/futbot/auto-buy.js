export async function addTargetToAutoBuy(
  assetId,
  resourceId,
  maxPrice,
  sellPrice,
  itemData
) {
  try {
    const query = {
      assetId,
      resourceId,
      maxPrice,
      sellPrice,
      discardValue: itemData ? itemData.discardValue : null
    };
    const resp = await fetch(
      `http://localhost:9999/auto-buyer/add-target?${Object.keys(query)
        .map(key => (!!query[key] ? `${key}=${query[key]}` : null))
        .filter(v => !!v)
        .join('&')}`
    );
    const body = await resp.json();
    return `There are ${body.length} players in your list.`;
  } catch (e) {
    return e;
  }
}
