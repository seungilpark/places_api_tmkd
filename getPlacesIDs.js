const axios = require("axios");
require("dotenv").config();
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const CITIES = require("./config/google_places_cities");
// RADIUS: distance from a city the API will return places from (unit in meters)
const RADIUS = 75000;
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=49.049999,-122.316666&radius=75000&type=${type}&key=

async function getNearbyPlacesByType({ city, type }, nextPageToken = "") {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${city.location.lat},${city.location.lng}&radius=${RADIUS}&type=${type}&fields=place_id&key=${apiKey}`;

  if (nextPageToken) {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&key=${apiKey}&pagetoken=${nextPageToken}`;
  }
  const response = await axios.get(url);
  return response.data;
}

async function getPlacesIDs(city, type) {
  console.time("fetch nearby");
  console.log(`start fetching places data (type: ${type}) around ${city}`);
  const options = { city: CITIES[city], type };
  let nearbyPlacesResponse = await getNearbyPlacesByType(options);
  let nearbyQueryResult = [...nearbyPlacesResponse.results];
  let nextPageToken = nearbyPlacesResponse.next_page_token;
  while (nextPageToken) {
    // there must be some timeout otherwise places api returns same
    await new Promise((resolve, reject) => {
      setTimeout(resolve.bind(null, undefined), 1000);
    });

    nearbyPlacesResponse = await getNearbyPlacesByType(options, nextPageToken);
    nearbyQueryResult = nearbyQueryResult.concat(nearbyPlacesResponse.results);
    nextPageToken = nearbyPlacesResponse.next_page_token;
  }
  console.log(`finished fetching places data (type: ${type}) around ${city}`);
  console.timeEnd("fetch nearby");

  return nearbyQueryResult;
}

exports.getPlacesIDs = getPlacesIDs;
