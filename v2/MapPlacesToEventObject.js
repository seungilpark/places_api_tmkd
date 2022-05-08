require("dotenv").config({ path: __dirname + "/./../.env" });
const key = process.env.GOOGLE_PLACES_API_KEY;
const fs = require("fs");
const axios = require("axios");
const BASE_DIR = "./PlacesDetailResult";
const OUTPUT_DIR = "./MappedGooglePlacesItems";
const OUTPUT_FILENAME = "MappedGoogleEvents.json";
const OUTPUT_FILENAME2 = "MappedGoogleEventsWithTown.json";
const TYPES = require("./types");
const END_DATE = "2032-12-31";
const VENDOR_ID = 14;
const EVENT_TYPE = "amenity";
const SOURCE_PLATFORM = "google";

const ITEMS = TYPES.reduce((typeNameDictionary, typeName) => {
  typeNameDictionary[typeName] = [];
  return typeNameDictionary;
}, {});
const ITEMS_TMKD = TYPES.reduce((typeNameDictionary, typeName) => {
  typeNameDictionary[typeName] = [];
  return typeNameDictionary;
}, {});
const MAPPED = JSON.parse(
  fs.readFileSync(OUTPUT_DIR + "/" + OUTPUT_FILENAME, "utf-8")
);

const cities = fs.readdirSync(BASE_DIR);

const groupEventDetailsByType = async (eventDetailsBuffer, filename) => {
  const eventDetails = JSON.parse(eventDetailsBuffer);
  const typeName = filename.split(".")[0];
  if (TYPES.includes(typeName))
    ITEMS[typeName] = ITEMS[typeName].concat(eventDetails);
};
/**
 * @param  { string } dirname
 * @param  { fn } onFileContent
 * read all files in /dirname and call onFileContent for each of their file content
 */
function readFiles(dirname, onFileContent) {
  const files = fs.readdirSync(dirname);

  files.forEach(function (filename) {
    onFileContent(fs.readFileSync(dirname + "/" + filename, "utf-8"), filename);
  });
}

async function getPlacePhoto(ref) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${ref}&key=${key}`;
  const response = await axios.get(url);
  // other way to use this api is to store the buffer of the image
  // since response.data is buffer of the image
  return response.request._redirectable._options.href || "";
}

function mapAddress(address_components) {
  if (!Array.isArray(address_components) || !address_components.length)
    return { address: null, city: null, province: null };

  const addr = {};

  const addressComponent = address_components.reduce((acc, curr) => {
    const type = curr.types && curr.types[0];
    if (type) {
      if (type === "administrative_area_level_1") {
        acc[type] = curr.short_name;
      } else {
        acc[type] = curr.long_name;
      }
    }
    return acc;
  }, {});

  const floor = addressComponent.floor || "";
  const street_number = addressComponent.street_number || "";
  const route = addressComponent.route || "";
  const locality = addressComponent.locality || "";
  const administrative_area_level_1 =
    addressComponent.administrative_area_level_1 || "";

  addr.address = `${floor} ${street_number} ${route}`;
  addr.city = locality;
  addr.province = administrative_area_level_1;
  return addr;
}

function mapDesc({ reviews, opening_hours, formatted_address }) {
  let desc = "";
  let formattedReviews = "";
  let formattedSchedules = "";
  if (reviews && Array.isArray(reviews)) {
    formattedReviews = reviews.reduce((acc, curr) => {
      if (curr.text) acc += `${curr.text} - ${curr.author_name}\n`;
      return acc;
    }, "");
  }
  if (opening_hours) {
    if (
      opening_hours.weekday_text &&
      Array.isArray(opening_hours.weekday_text)
    ) {
      formattedSchedules = opening_hours.weekday_text.reduce((acc, curr) => {
        acc += curr + "\n";
        return acc;
      }, "");
    }
  }
  desc += formatted_address + "\n" + formattedSchedules;
  return desc;
}
async function mapNeighborhood(src, dest) {
  try {
    let n = 0;
    const ids = {};
    for (let typeName in src) {
      console.log(`mapping ${typeName} type places started...`);
      console.time(`mapping ${typeName} type`);
      for (let eventDetailObject of src[typeName]) {
        console.log(`${++n}th item is getting mapped`);
        if (!eventDetailObject.result) continue;
        if (ids[eventDetailObject.result.place_id]) continue; // remove duplicates
        if (
          eventDetailObject.result.business_status !== "OPERATIONAL" ||
          !eventDetailObject.result.formatted_address.includes("BC")
        )
          continue;
        const event_TMKD = dest[typeName].find(
          (tmkdObj) => tmkdObj.source_id === eventDetailObject.result.place_id
        );
        if (!event_TMKD) continue;
        if (eventDetailObject.result?.address_components?.length) {
          const neighborhood =
            eventDetailObject.result.address_components.find((addrComp) =>
              addrComp.types.includes("neighborhood")
            ) || null;
          if (neighborhood) event_TMKD.town = neighborhood.long_name;
        }
      }
      console.timeEnd(`mapping ${typeName} type`);
    }
  } catch (error) {
    console.error(error);
  }
}
async function mapper(src, output) {
  try {
    let n = 0;
    const ids = {};
    for (let key in src) {
      console.log(`mapping ${key} type places started...`);
      console.time(`mapping ${key} type`);
      for (let eventDetailObject of src[key]) {
        console.log(`${++n}th item is getting mapped`);
        if (!eventDetailObject.result) continue;
        if (ids[eventDetailObject.result.place_id]) continue; // remove duplicates
        if (
          eventDetailObject.result.business_status !== "OPERATIONAL" ||
          !eventDetailObject.result.formatted_address.includes("BC")
        )
          continue;
        const event_TMKD = {};
        event_TMKD.vendor_id = VENDOR_ID;
        event_TMKD.name = eventDetailObject.result.name;
        event_TMKD.event_type = EVENT_TYPE;
        event_TMKD.start_date = new Date();
        event_TMKD.end_date = new Date(END_DATE);
        event_TMKD.link = eventDetailObject.result.website;
        const addr = mapAddress(eventDetailObject.result.address_components);
        event_TMKD.address = addr.address;
        event_TMKD.city = addr.city;
        event_TMKD.province = addr.province;
        event_TMKD.lat = eventDetailObject.result.geometry.location.lat;
        event_TMKD.lng = eventDetailObject.result.geometry.location.lng;
        event_TMKD.description = mapDesc(eventDetailObject.result);

        if (
          eventDetailObject.result.photos &&
          Array.isArray(eventDetailObject.result.photos) &&
          eventDetailObject.result.photos.length
        ) {
          photoRef = eventDetailObject.result.photos[0].photo_reference;
          // if the photos[0].html_attributions: [] has an tag, u must add to your app
          // add html_attribution varchar column onto events table and use it on details page
          event_TMKD.html_attributions =
            eventDetailObject.result.photos[0].html_attributions &&
            eventDetailObject.result.photos[0].html_attributions.length
              ? JSON.stringify(
                  eventDetailObject.result.photos[0].html_attributions
                )
              : null;
          await new Promise((resolve, reject) => {
            setTimeout(resolve.bind(null, undefined), 1000);
          });
          event_TMKD.image_url = await getPlacePhoto(photoRef);
        } else {
          event_TMKD.image_url = null;
        }
        event_TMKD.source_id = eventDetailObject.result.place_id;
        event_TMKD.source_types = eventDetailObject.result.types.join(", ");
        event_TMKD.source_platform = SOURCE_PLATFORM;
        event_TMKD.source_endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${eventDetailObject.result.place_id}`;
        event_TMKD.isApproved = "Pending";
        // console.log(event_TMKD)
        output[key].push(event_TMKD);
        ids[eventDetailObject.result.place_id] = 1;
      }
      console.timeEnd(`mapping ${key} type`);
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  for (let city of cities) {
    readFiles(BASE_DIR + "/" + city, groupEventDetailsByType);
  }
  // const neighborhoodNames = [];
  // const cityNames = [];
  // for (const typeName in ITEMS) {
  //   for (const placeObj of ITEMS[typeName]) {
  //     if (placeObj.result?.address_components?.length) {
  //       const neighborhood =
  //         placeObj.result.address_components.find((addrComp) =>
  //           addrComp.types.includes("neighborhood")
  //         ) || null;
  //       if (neighborhood) neighborhoodNames.push(neighborhood);
  //       const city =
  //         placeObj.result.address_components.find((addrComp) =>
  //           addrComp.types.includes("locality")
  //         ) || null;
  //       if (city) cityNames.push(city);
  //     }
  //   }
  // }

  // const filteredCityNamesObj = cityNames.reduce((arr, city) => {
  //   if (!arr.includes(city.long_name)) arr.push(city.long_name);
  //   return arr;
  // }, []);

  // const filteredNeighborhoods = neighborhoodNames.reduce((arr, n) => {
  //   if (!arr.includes(n.long_name)) arr.push(n.long_name);
  //   return arr;
  // }, []);
  // console.log({ filteredCityNamesObj, filteredNeighborhoods });

  // fs.writeFileSync(
  //   "./cityNames.js",
  //   JSON.stringify(filteredCityNamesObj, undefined, 2)
  // );
  // fs.writeFileSync(
  //   "./neighborhoods.js",
  //   JSON.stringify(filteredNeighborhoods, undefined, 2)
  // );
  // process.exit(0);

  // comment below line when actually running
  // let totalPlaceCount = 0;
  // for (const type in ITEMS) totalPlaceCount += ITEMS[type].filter(p => p.status === 'OK').length;
  // console.log(totalPlaceCount);
  // return;
  //add neighbnorhoood only
  await mapNeighborhood(ITEMS, MAPPED);
  fs.writeFileSync(
    OUTPUT_DIR + "/" + OUTPUT_FILENAME2,
    JSON.stringify(MAPPED, undefined, 4)
  );
  process.exit(0);
  //mapper
  console.time("mapping");
  await mapper(ITEMS, ITEMS_TMKD);
  console.timeEnd("mapping");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  fs.writeFileSync(
    OUTPUT_DIR + "/" + OUTPUT_FILENAME,
    JSON.stringify(ITEMS_TMKD, undefined, 4)
  );

  process.exit(0);
}

main();

module.exports = {
  mapper,
  readFiles,
  groupEventDetailsByType,
};
