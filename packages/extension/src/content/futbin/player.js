import { request } from './request';

export async function searchPlayer(name, rating, specialTypeStr) {
  try {
    const players = await request(
      `futbin.com/search?year=21&extra=1&term=${name}`,
      {
        method: 'GET'
      }
    );
    const result = players.filter(p => p.rating === rating);

    return result;
  } catch (e) {
    console.error('exception searching player', e);
    return [];
  }
}
