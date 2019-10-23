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

export async function addTargetQueryToAutoBuy(query, sellPrice) {
  try {
    const q = {
      sellPrice,
      query
    };
    const resp = await fetch(
      `http://localhost:9999/auto-buyer/add-query-target?${Object.keys(q)
        .map(key => (!!q[key] ? `${key}=${encodeURIComponent(q[key])}` : null))
        .filter(v => !!v)
        .join('&')}`
    );
    const body = await resp.json();
    return `There are ${body.length} queries in your list.`;
  } catch (e) {
    return e;
  }
}
