import * as Axios from 'axios';

// Overwrites for /api/cache-adapter.ts
declare module 'axios' {
  interface AxiosResponse<T> {
    fromCache?: boolean;
  }
}
