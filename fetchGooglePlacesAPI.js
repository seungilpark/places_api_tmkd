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
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
require("dotenv").config();
const key = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_DIR = "./GooglePlacesResult";


// SETUP
// RADIUS: distance from a city the API will return places from (unit in meters)
const RADIUS = 75000
//Types: types of places
//https://developers.google.com/places/web-service/supported_types
const TYPES = [ 
  "park", 
  "library", 
  "amusement_park", 
  "museum", 
  "zoo", 
  "movie_theater", 
  "campground",  
] // uncomment type to fetch the given type of places

const CITIES = { // cities in bc
  "Abbotsford":{
    location: {
      lat:49.049999,
      lng:-122.316666
    },
    items:{}
  },
  "Armstrong":{
    location: {
      lat: 50.448334,
      lng:-119.196114
    },
    items:{}
  },
  "Burnaby":{
    location: {
      lat: 49.267132,
      lng:-122.968941
    },
    items:{}
  },
  "Campbell River":{
    location: {
      lat: 50.024445,
      lng: -125.247498
    },
    items:{}
  },
  "Castlegar":{
    location: {
      lat: 49.325558,
      lng:-117.666115
    },
    items:{}
  },
  "Chilliwack":{
    location: {
      lat: 49.157940,
      lng:-121.951469
    },
    items:{}
  },
  "Colwood":{
    location: {
      lat: 48.423611,
      lng:-123.495834
    },
    items:{}
  },
  "Coquitlam":{
    location: {
      lat: 49.283764,
      lng:-122.79320
    },
    items:{}
  },
  "Courtenay":{
    location: {
      lat: 49.687778,
      lng:-124.994446
    },
    items:{}
  },
  "Cranbrook":{
    location: {
      lat: 49.509724,
      lng:-115.766670
    },
    items:{}
  },
  "Dawson Creek":{
    location: {
      lat:55.760555,
      lng:-120.235558
    },
    items:{}
  },
  "Delta":{
    location: {
      lat: 49.084721,
      lng:-123.058609
    },
    items:{}
  },
  "Duncan":{
    location: {
      lat: 48.7786908,
      lng: -123.7079416
    },
    items:{}
  },
  "Enderby":{
    location: {
      lat: 50.550835,
      lng: -119.139725
    },
    items:{}
  },
  "Fernie":{
    location: {
      lat: 49.504166,
      lng: -115.062775
    },
    items:{}
  },
  "Fort St. John":{
    location: {
      lat: 56.246464,
      lng: -120.847633
    },
    items:{}
  },
  "Grand Forks":{
    location: {
      lat: 49.033333,
      lng:-118.440002
    },
    items:{}
  },
  "Greenwood":{
    location: {
      lat: 49.091110,
      lng: -118.676941
    },
    items:{}
  },
  "Kamloops":{
    location: {
      lat: 50.676109,
      lng:-120.340836
    },
    items:{}
  },
  "Kelowna":{
    location: {
      lat: 49.882114,
      lng: -119.477829
    },
    items:{}
  },
  "Kimberley":{
    location: {
      lat: 49.669724,
      lng: -115.977501
    },
    items:{}
  },
  "Langford":{
    location: {
      lat: 48.450558,
      lng:-123.505836
    },
    items:{}
  },
  "Langley":{
    location: {
      lat: 49.074329,
      lng: -122.559319
    },
    items:{}
  },
  "Maple Ridge":{
    location: {
      lat: 49.216667,
      lng: -122.599998
    },
    items:{}
  },
  "Merritt":{
    location: {
      lat: 50.111308,
      lng: -120.786222,
    },
    items: {},
  },
  "Nanaimo": {
    location: {
      lat:  49.165882,
      lng: -123.940063,
    },
    items: {},
  },
  "Nelson": {
    location: {
      lat: 49.500000,
      lng: -117.283333,
    },
    items: {},
  },
  "New Westminster": {
    location: {
      lat: 49.206944,
      lng: -122.911110,
    },
    items: {},
  },
  "North Vancouver":{
    location: {
      lat: 49.316666,
      lng: -123.066666,
    },
    items: {},
  },

  "Parksville":{
    location: {
      lat: 49.314999,
      lng: -124.311996,
    },
    items: {},
  },

  "Penticton":{
    location: {
      lat: 49.489536,
      lng: -119.589615,
    },
    items: {},
  },
  "Pitt Meadows":{
    location: {
      lat: 49.233334,
      lng: -122.683334,
    },
    items: {},
  },
  "Port Alberni":{
    location: {
      lat: 49.233891,
      lng: -124.805000,
    },
    items: {},
  },
  "Port Coquitlam":{
    location: {
      lat: 49.262501,
      lng: -122.781113,
    },
    items: {},
  },
  "Port Moody": {
    location: {
      lat: 49.283054,
      lng: -122.831665,
    },
    items:{},
  },
  "Powell River": {
    location: {
      lat: 49.830452,
      lng: -124.513893,
    },
    items:{},
  },
  "Prince George": {
    location: {
      lat:  53.916943,
      lng: -122.749443,
    },
    items:{},
  },
  "Quesnel": {
    location: {
      lat: 52.978443,
      lng: -122.492668,
    },
    items:{},
  },
  "Revelstoke": {
    location: {
      lat: 50.9832,
      lng: -118.2023,
    },
    items:{},
  },
  "Richmond": {
    location: {
      lat: 49.166592,
      lng: -123.133568,
    },
    items:{},
  },
  "Rossland": {
    location: {
      lat: 49.076809,
      lng: -117.802017,
    },
    items:{},
  },
  "Salmon Arm": {
    location: {
      lat: 50.702221,
      lng: -119.272224,
    },
    items:{},
  },
  "Surrey": {
    location: {
      lat: 49.104431,
      lng: -122.801094,
    },
    items:{},
  },
  "Terrace": {
    location: {
      lat: 54.515102,
      lng: -128.610764,
    },
    items:{},
  },
  "Trail": {
    location: {
      lat: 49.095001,
      lng: -117.709999,
    },
    items:{},
  },
  "Vancouver": {
    location: {
      lat: 49.246292,
      lng: -123.116226,
    },
    items:{},
  },
  "Vernon": {
    location: {
      lat: 50.271790,
      lng: -119.276505,
    },
    items:{},
  },
  "Victoria": {
    location: {
      lat: 48.407326,
      lng:  -123.329773,
    },
    items:{},
  },
  
  "West Kelowna": {
    location: {
      lat: 49.863613,
      lng: -119.564461,
    },
    items:{},
  },
  "Williams Lake": {
    location: {
      lat: 52.128429,
      lng: -122.130203,
    },
    items:{},
  },
  "White Rock": {
    location: {
      lat: 49.019917,
      lng: -122.802612,
    },
    items:{},
  },

}


// detail query example
// https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name,rating,formatted_phone_number&key=YOUR_API_KEY

//photo request
// https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key=YOUR_API_KEY
// https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${ref}&key=${key}

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
  // console.log({ results });
  if (type in city.items) {
    city.items[type] = city.items[type].concat(results.map(place => place.place_id))
    
  } else {
    city.items[type] = Array.isArray(results) ? results.map(place => place.place_id) : [results.map(place => place.place_id)] 
    
  }
  
  
  
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
        console.log(`start fetching places data (type: ${type}) around ${city}`)
        const result = await getPlacesIDs(CITIES[city], type);
        let nextPageToken = result.next_page_token;
        // console.log({nextPageToken})
        
        while (nextPageToken) {
          await new Promise((resolve, reject) => {
            setTimeout(resolve.bind(null, undefined), 2000);
          }); // there must be some timeout otherwise places api returns same
          
          const result = await getPlacesIDs(CITIES[city], type, nextPageToken);
          nextPageToken = result.next_page_token;
          // console.log({ nextPageToken });
        }
        console.log(`finished fetching places data (type: ${type}) around ${city}`)
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
    if (!fs.existsSync(OUTPUT_DIR)){
      fs.mkdirSync(OUTPUT_DIR);
    }
    for (let city in CITIES) {
      let subdir = OUTPUT_DIR + '/' + city
      
      if (!fs.existsSync(subdir)){
        fs.mkdirSync(subdir);
      }

      for (let type in CITIES[city].items) {
        fs.writeFileSync(subdir +`/${type}.json`, JSON.stringify(CITIES[city].items[type], undefined, 4))

      }
    }  

    process.exit(0);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
