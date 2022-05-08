const CITIES = require("./cities");
const TYPES = require("./types");
const fs = require("fs");
const placeIds = require("./placeIds");
const { getPlaceDetail } = require("./getPlaceDetail");
const { delayCalls } = require("./delayCalls");
const { generateJson } = require("./GenerateOutput");
const SOURCE_DIR = "./NearbySearchResult/";
const OUTPUT_DIR = "./PlacesDetailResult/";

async function getDetails() {
  try {
    let totalCount = 0;
    // loop through CITIES subfolders
    for (const cityName in CITIES) {
      for (const typeName of TYPES) {
        const pathName = `${SOURCE_DIR}${cityName}/${typeName}.json`;
        const nearbyPlaces = JSON.parse(fs.readFileSync(pathName, "utf-8"));
        const filteredNearbyPlaces = nearbyPlaces.filter(
          (p) => !placeIds.includes(p.place_id)
        );
        totalCount += filteredNearbyPlaces.length;
        const result = await Promise.all(
          filteredNearbyPlaces.map(async (place) => {
            await delayCalls(1000);
            return await getPlaceDetail(place.place_id);
          })
        );
        generateJson(result, OUTPUT_DIR, cityName, typeName);
        console.log(
          `Total ${totalCount} item detail has been fetched and saved...`
        );
      }
    }
    console.log(`total ${totalCount} details have been fetched`);
    process.exit(0);
  } catch (error) {
    console.error({ error });
    process.exit(1);
  }
}

getDetails();
