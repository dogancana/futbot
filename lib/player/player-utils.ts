import { fut } from "../api";

interface IPlyaerFilter {
  quality?: fut.Quality;
  rare?: boolean;
  tradeableOnly?: boolean;
}
export function filterPlayers(players, filters: IPlyaerFilter) {
  return players.filter((player) => {
    let result = true;

    if (filters.quality) {
      const maxRatings = {bronze: 64, silver: 74, gold: 100};
      let rating = "bronze";
      if (player.rating > maxRatings.bronze) { rating = "silver"; }
      if (player.rating > maxRatings.silver) { rating = "gold"; }

      result = result && rating === filters.quality;
    }

    if (filters.rare) {
      const isRare = player.rareflag === 1;
      result = result && isRare;
    }

    if (filters.tradeableOnly) {
      result = result && !player.untradeable;
    }

    return result;
  });
}
