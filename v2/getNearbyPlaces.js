require("dotenv").config({ path: __dirname + "/./../.env" });
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const axios = require("axios");
const { delayCalls } = require("./delayCalls");

async function getNearbyPlaces({ lat, lng, type, radius }, nextPageToken = "") {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&fields=place_id&key=${apiKey}`;
  if (nextPageToken) {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&key=${apiKey}&pagetoken=${nextPageToken}`;
  }
  const response = await axios.get(url);
  return response.data;
}

async function getNearybyPlaces({ coords, cityName, typeName, radius }) {
  console.log(
    `started fetching places data (type: ${typeName}) around ${cityName}`
  );
  await delayCalls(1500);
  const options = {
    lat: coords.lat,
    lng: coords.lng,
    type: typeName,
    radius,
  };
  let nearbyPlacesResponse = await getNearbyPlaces(options);
  let nearbyQueryResult = [...nearbyPlacesResponse.results];
  let nextPageToken = nearbyPlacesResponse.next_page_token;
  while (nextPageToken) {
    await delayCalls(1500);
    console.log("had nextpage");
    nearbyPlacesResponse = await getNearbyPlaces(options, nextPageToken);
    nearbyQueryResult = nearbyQueryResult.concat(nearbyPlacesResponse.results);
    nextPageToken = nearbyPlacesResponse.next_page_token;
  }
  console.log(
    `finished fetching places data (type: ${typeName}) around ${cityName}`
  );
  return nearbyQueryResult;
}
exports.getNearybyPlaces = getNearybyPlaces;
