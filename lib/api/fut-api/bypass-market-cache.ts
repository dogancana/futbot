import * as NodeCache from 'node-cache';
import { getLogger } from '../../logger';
import { tradePrice } from '../../trader/trade-utils';
import { fut } from './service';

const logger = getLogger('ByPassMarketCache');
const TTL = 30;
const marketQueryCache = new NodeCache({
  stdTTL: TTL,
  checkperiod: 15,
  useClones: true,
  deleteOnExpire: true
});

type EditableKey = 'micr' | 'macr' | 'minb' | 'maxb';
const EDITABLE_FILTER_KEYS: EditableKey[] = ['micr', 'macr', 'minb', 'maxb'];

// don't touch this
const micrMinbPairs = [
  { micr: 150 },
  { micr: 150, minb: 200 },
  { micr: 200 },
  { micr: 150, minb: 250 },
  { micr: 200, minb: 250 },
  { minb: 200 },
  { micr: 250 },
  { minb: 250 },
  { micr: 150, minb: 300 },
  { micr: 200, minb: 300 },
  { micr: 300 },
  { micr: 250, minb: 300 },
  { minb: 300 },
  { micr: 150, minb: 350 },
  { micr: 200, minb: 350 },
  { micr: 250, minb: 350 },
  { micr: 300, minb: 350 },
  { minb: 350 }
];

export function mapMarketQueryToBypassCache(
  q: fut.MarketQueryFilter
): fut.MarketQueryFilter {
  const key = queryKey(q);
  const value = marketQueryCache.get<fut.MarketQueryFilter[]>(key);

  if (!value) {
    marketQueryCache.set(key, [], TTL);
    return q;
  } else {
    const ttl = marketQueryCache.getTtl(key);
    const newQ = getNewFilters(q, value);
    const newValue: fut.MarketQueryFilter[] = [...value, newQ];

    marketQueryCache.set(key, newValue, (ttl - new Date().getTime()) / 1000);
    return {
      ...q,
      ...newQ
    };
  }
}

function getNewFilters(
  q: fut.MarketQueryFilter,
  usedQueries: fut.MarketQueryFilter[]
): fut.MarketQueryFilter {
  const actualFilterKeys = EDITABLE_FILTER_KEYS.filter(
    key => !!q[key] || (key === 'macr' && q.maxb)
  );
  const editableKeys = EDITABLE_FILTER_KEYS.filter(
    key => actualFilterKeys.indexOf(key) === -1
  );

  if (editableKeys.length === 0) {
    return q;
  }

  if (editableKeys.indexOf('maxb') > -1) {
    const lastValue = getKeyValues('maxb', usedQueries)[0] || 15000000;
    return validateAndReturnResult({
      maxb: tradePrice(lastValue - 1, 'floor')
    });
  }

  // At this point, possible remaining editable key sets are:
  // { micr }
  // { minb }
  // { micr, minb }

  if (editableKeys.length === 1) {
    const key = editableKeys[0];
    const lastValue = getKeyValues(key, usedQueries).sort((a, b) => b - a)[0];
    switch (key) {
      case 'micr':
        const newMicr = lastValue ? tradePrice(lastValue + 1, 'ceil') : 150;
        return validateAndReturnResult({ micr: newMicr });
      case 'minb':
        const newMinb = lastValue ? tradePrice(lastValue + 1, 'ceil') : 200;
        return validateAndReturnResult({ minb: newMinb });
      default:
        throw new Error(
          `Unexpected bypass case for query. Details: ${JSON.stringify({
            q,
            usedQueries,
            editableKeys,
            key
          })}`
        );
    }
  }

  const count = usedQueries.length;
  return validateAndReturnResult(micrMinbPairs[count]);

  function validateAndReturnResult(r: fut.MarketQueryFilter) {
    try {
      validateQuery({ ...q, ...r });
      return r;
    } catch (e) {
      logger.warn(
        `Cannot bypass cache for this query ${JSON.stringify(
          q
        )}. Please report this to Discord`
      );
      return q;
    }
  }
}

function getKeyValues(
  key: EditableKey,
  usedQueries: fut.MarketQueryFilter[]
): number[] {
  return usedQueries.map(q => q[key]).filter(v => !!v);
}

function queryKey(q: fut.MarketQueryFilter): string {
  // yes
  return encodeURIComponent(JSON.stringify(JSON.parse(JSON.stringify(q))));
}

function validateQuery(q: fut.MarketQueryFilter) {
  const { micr, macr, minb, maxb } = q;
  if (micr && macr && micr >= macr) {
    throw new Error(
      `micr cannot be equal or greater than macr. ${JSON.stringify(q)}`
    );
  }

  if (minb && maxb && minb >= maxb) {
    throw new Error(
      `minb cannot be equal or greater than maxb. ${JSON.stringify(q)}`
    );
  }

  if (macr && maxb && macr >= maxb) {
    throw new Error(
      `macr cannot be equal or greater than maxb. ${JSON.stringify(q)}`
    );
  }
}
