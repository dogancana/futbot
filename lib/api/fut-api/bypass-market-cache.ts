import * as NodeCache from 'node-cache';
import { fut } from './service';

const TTL = 30;
const marketQueryCache = new NodeCache({
  stdTTL: TTL,
  checkperiod: 15,
  useClones: true,
  deleteOnExpire: true
});

type EditableKey = 'micr' | 'macr' | 'minb' | 'maxb';
const EDITABLE_FILTER_KEYS: EditableKey[] = ['micr', 'macr', 'minb', 'maxb'];

export function mapMarketQueryToBypassCache(
  q: fut.MarketQueryFilter
): fut.MarketQueryFilter {
  const key = queryKey(q);
  const value = marketQueryCache.get<fut.MarketQueryFilter[]>('key');

  // console.log('mapMarketQueryToBypassCache', { key, value });

  if (!value) {
    marketQueryCache.set(key, [q], TTL);
    // console.log('Set it?', marketQueryCache.get(key));
    return q;
  } else {
    const ttl = marketQueryCache.getTtl(key);
    const newQ = getNewFilters(q, value);
    const newValue: fut.MarketQueryFilter[] = [...value, newQ];

    // console.log('mapMarketQueryToBypassCache', {
    //   key,
    //   value,
    //   ttl,
    //   newQ,
    //   newValue
    // });
    marketQueryCache.set(key, newValue, ttl);
    return newQ;
  }
}

function getNewFilters(
  q: fut.MarketQueryFilter,
  usedQueries: fut.MarketQueryFilter[]
): fut.MarketQueryFilter {
  const actualFilterKeys = EDITABLE_FILTER_KEYS.filter(key => !!q[key]);
  const editableFilterKeys = EDITABLE_FILTER_KEYS.filter(key => !q[key]);

  if (actualFilterKeys.length === 4) {
    return q;
  }

  const usedQueryValues = getEmptyFilterValues();

  for (const used of usedQueries) {
    for (const key of editableFilterKeys) {
      if (used[key]) {
        usedQueryValues[key].count++;
        usedQueryValues[key].values.push(used[key]);
      }
    }
  }

  const nextKey = Object.keys(usedQueryValues)
    .filter((key: EditableKey) => actualFilterKeys.indexOf(key) === -1)
    .map<typeof usedQueryValues[EditableKey]>(key => usedQueryValues[key])
    .sort((a, b) => a.count - b.count)[0].key as EditableKey;

  if (!nextKey) {
    throw new Error(`Something went wrong on bypass query.`);
  }

  // console.log('nextkey', nextKey);

  switch (nextKey) {
    case 'micr':
      return q;
    case 'macr':
      return q;
    case 'minb':
      return q;
    case 'maxb':
      return q;
  }

  return q;
}

function getEmptyFilterValues() {
  const usedQueryValues: {
    [key in EditableKey]?: {
      key: EditableKey;
      count: number;
      values: number[];
    };
  } = {};
  for (const key of EDITABLE_FILTER_KEYS) {
    usedQueryValues[key] = { key, count: 0, values: [] };
  }
  return usedQueryValues;
}

function queryKey(q: fut.MarketQueryFilter): string {
  // yes
  return JSON.stringify(JSON.parse(JSON.stringify(q)));
}
