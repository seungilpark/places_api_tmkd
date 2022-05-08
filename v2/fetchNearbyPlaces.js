const CITIES = require("./cities");
const TYPES = require("./types");
const RADIUS = 5000;
const OUTPUT_DIR = "./NearbySearchResult/";
const { generateJson } = require("./GenerateOutput");
const { getNearybyPlaces } = require("./getNearbyPlaces");
const { formatOutput } = require("./formatOutput");

async function main() {
  try {
    for (let cityName in CITIES) {
      for (let typeName of TYPES) {
        const coords = CITIES[cityName];
        const result = [];
        for (let coordSet of coords) {
          result.push(
            await getNearybyPlaces({
              coords: coordSet,
              cityName,
              typeName,
              radius: RADIUS,
            })
          );
        }
        const arr = formatOutput(result);
        generateJson(arr, OUTPUT_DIR, cityName, typeName);
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
