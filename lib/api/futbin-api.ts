import Axios from 'axios';

export namespace futbin {
  export async function getPrice (resourceId) {
    const response = await Axios.get(`https://www.futbin.com/19/playerPrices?player=${resourceId}`);
    return response.data[resourceId].prices;
  }
}
