/* 
    a script to automate inserting and managing amenities for tmkd
    get parks, beaches, etc. along with detail, photo 
    insert ammenity events in events table  
*/

/* 
  "You may occasionally receive a NOT_FOUND status code when you use a saved place ID. 
  Best practice is to refresh your stored place IDs periodically. 
  You can refresh Place IDs free of charge, by making a Place Details request, 
    specifying only the ID field in the fields parameter."
  - from https://developers.google.com/places/web-service/place-id#save-id
*/


//make an array of locations you want to search nearby places
//make an array of place ids based on the locations array
//check if there is duplicate
//make an array of place details by looping through places array
//make event objects to be inserted to db
//insert db
// 1. make sql file for inserting
// 2. run db function to insert the array of objects

const fs = require("fs");
const axios = require("axios");
// const mysql = require("mysql")

// config.json : 
/* 
  { 
    key: Google places API key 
  }

*/
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const key = config.key;
const dir = "./result";


// SETUP
// RADIUS: distance from a city the API will return places from (unit in meters)
const RADIUS = 150000
//Types: types of places
//https://developers.google.com/places/web-service/supported_types
const TYPES = [ 
  "park", 
  // "library", 
  // "amusement_park", 
  // "museum", 
  // "zoo", 
  // "movie_theater", 
  // "campground",  
] // uncomment type to fetch the given type of places

const CITIES = {
  "Vancouver":{
    location: {
      lat: 49.246292,
      lng: -123.116226,
    },
    items: {},
  },

  "Nelson":{
    location: {
      lat: 49.5,
      lng: -117.283333,
    },
    items: {},
  }
}


// detail query example
// https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name,rating,formatted_phone_number&key=YOUR_API_KEY

//photo request
// https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key=YOUR_API_KEY

/**
 * @param  {city{ location, items }} location
 * @param  {string} nextPageToken="" a key with which the places api returns next page items if exists
 */
async function getPlacesIDs(city, type, nextPageToken = "") {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${city.location.lat},${city.location.lng}&radius=${RADIUS}&type=${type}&fields=place_id&key=${key}`;

  if (nextPageToken) {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&key=${key}&pagetoken=${nextPageToken}`;
  }

  console.log({ url });
  const response = await axios.get(url);
  // const data = response.data;
  const { results } = response.data
  // data.results.map((item, idx) => console.log("idx: ", idx, "id: ", item.id))
  // const arr = data.results.map((item, idx) => ({ id: item.place_id }));
  console.log({ results });
  if (type in city.items) city.items[type] = city.items[type].concat(results.map(place => place.place_id))
  else city.items[type] = Array.isArray(results) ? results.map(place => place.place_id) : [results.map(place => place.place_id)] 


  
  // console.log({length: data.results.length})
  // console.log({status: data.status})
  // console.log(JSON.stringify(data, undefined, 4))

  return response.data;
}

async function getPlaceDetail(placeId){
  let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}`

  // console.log({ url });
  const response = await axios.get(url);
  const { data } = response;
  // const { results } = response.data
  // console.log({data: JSON.stringify(data, null, 4)})
  return data
}



async function main() {
  try {
    for (let type of TYPES) {
      for (let city in CITIES) {
        const result = await getPlacesIDs(CITIES[city], type);
        let nextPageToken = result.next_page_token;
        // console.log({nextPageToken})
  
        while (nextPageToken) {
          await new Promise((resolve, reject) => {
            setTimeout(resolve.bind(null, undefined), 2000);
          }); // there must be some timeout otherwise places api returns same
  
          const result = await getPlacesIDs(CITIES[city], type, nextPageToken);
          nextPageToken = result.next_page_token;
          console.log({ nextPageToken });
        }
      }
    }

    for (let city in CITIES) {
      for (let type in CITIES[city].items) {
        CITIES[city].items[type] = await Promise.all(CITIES[city].items[type].map(async pid => {
          return await getPlaceDetail(pid)
        }))
      }
    }  

    
    // console.log(JSON.stringify(CITIES))
    
    // await getPlaceDetail("ChIJnQdtaiLPfFMRrRDt-V3wtZ8")
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    for (let city in CITIES) {
      let subdir = dir + '/' + city
      
      if (!fs.existsSync(subdir)){
        fs.mkdirSync(subdir);
      }

      for (let type in CITIES[city].items) {
        fs.writeFileSync(subdir +`/${type}.json`, JSON.stringify(CITIES[city].items[type], undefined, 4))

      }
    }  

   

  } catch (error) {
    console.error(error.message);
  }
}

main();