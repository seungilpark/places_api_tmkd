const axios = require("axios");
require("dotenv").config();
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

async function getPlaceDetail(placeId) {
  let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
  const response = await axios.get(url);
  const { data } = response;
  return data;
}

module.exports = {
  getPlaceDetail,
};
