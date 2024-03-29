const fs = require("fs");
const CITIES = require("./config/google_places_cities");
const TYPES = require("./config/google_places_types");
const { getPlacesIDs } = require("./getPlacesIDs");
const { getPlaceDetail } = require("./getPlaceDetail");
const OUTPUT_DIR = "./GooglePlacesResult";
const NEARBY_SEARCH_OUTPUT_DIR = "./NearbySearchResults";

async function main() {
  try {
    console.time("fetching nearby places");
    for (let type of TYPES) {
      for (let cityName in CITIES) {
        CITIES[cityName].items[type] = await getPlacesIDs(cityName, type);
      }
    }
    console.timeEnd("fetching nearby places");

    if (!fs.existsSync(NEARBY_SEARCH_OUTPUT_DIR))
      fs.mkdirSync(NEARBY_SEARCH_OUTPUT_DIR);

    for (let city in CITIES) {
      let subdir = NEARBY_SEARCH_OUTPUT_DIR + "/" + city;

      if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
      }

      for (let type in CITIES[city].items) {
        fs.writeFileSync(
          subdir + `/${type}.json`,
          JSON.stringify(CITIES[city].items[type], undefined, 4)
        );
      }
    }

    console.time("fetching places details");
    for (let city in CITIES) {
      for (let type in CITIES[city].items) {
        CITIES[city].items[type] = await Promise.all(
          CITIES[city].items[type].map(async (city) => {
            await new Promise((resolve, reject) => {
              setTimeout(resolve.bind(null, undefined), 1000);
            });
            return await getPlaceDetail(city.place_id);
          })
        );
      }
    }
    console.timeEnd("fetching places details");

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

    for (let city in CITIES) {
      let subdir = OUTPUT_DIR + "/" + city;

      if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
      }

      for (let type in CITIES[city].items) {
        fs.writeFileSync(
          subdir + `/${type}.json`,
          JSON.stringify(CITIES[city].items[type], undefined, 4)
        );
      }
    }
    process.exit(0);
  } catch (error) {
    console.error({ error });
    console.error(error.message);
    process.exit(1);
  }
}

main();

module.exports = {
  getPlaceDetail,
};
