/* find places using google places api */
/* 
    input: search words e.g. "swimming pool" 
    output: returned json of Google Places API 
*/

require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

// some configuration
const KEY = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_DIR = "./GooglePlacesResult";
const RADIUS_IN_METERS = 75000

// some constants
// const CITIES = require("./cities")
const CITIES = require("./cities_mini")
const SEARCH_WORDS = require("./searchWords");
const SEARCH_WORDS_DICT = require("./searchWordsDictionary");


const _makeURL_placeId = (searchWord, lat,lng) => `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchWord}&location=${lat},${lng}&radius=${RADIUS_IN_METERS}&key=${KEY}`
// const _getLatLnt = city => ({ lat: city.location.lat, lng: city.location.lng}) // city is from CITIES


async function getPlaceIDs(city, searchWord, nextPageToken="") {
    const url = _makeURL_placeId(escape( searchWord ), city.location.lat, city.location.lng) + (nextPageToken && `&pagetoken=${nextPageToken}`)
    console.log({url})
    const response = await axios.get(url);

    // console.log({ response })
    const { results } = response.data
    // console.log({ results })
    // console.log({resultLength: results.length})
    SEARCH_WORDS_DICT[searchWord] = SEARCH_WORDS_DICT[searchWord].concat(results ? results : [])

    // return (Array.isArray(results)) ? results.length : 0 
    return response.data
}
async function _sleep(ms) {
    await new Promise((resolve, reject) => {
        setTimeout(resolve.bind(null, undefined), ms)
    })
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


function _writeOutput() {
        if (!fs.existsSync(OUTPUT_DIR)){
            fs.mkdirSync(OUTPUT_DIR)
        }

        for (const searchWord in SEARCH_WORDS_DICT) {
            fs.writeFileSync(OUTPUT_DIR + `/${searchWord}.json`, JSON.stringify(SEARCH_WORDS_DICT[searchWord], undefined, 4))
        }
}


async function main() {
    try {

        console.time("fetching")
        for (const searchWord of SEARCH_WORDS) {
            for (const city in CITIES) {
                console.log(`fetching places with searchTerm: ${searchWord} in city: ${city}`)
                const result = await getPlaceIDs(CITIES[city], searchWord )
                // let nextPageToken = result.next_page_token

                // while (nextPageToken) {
                //     await _sleep(2500)
                //     const result = await getPlaceIDs(CITIES[city], searchWord, nextPageToken)
                //     nextPageToken = result.next_page_token
                // }
                console.log(`finished fetching places with searchTerm: ${searchWord} in city: ${city}`)
                console.log(`items count: ${SEARCH_WORDS_DICT[searchWord].length}`)
            }
        }



        console.timeEnd("fetching")
        _writeOutput()
        let count = 0 
        for (const w in SEARCH_WORDS_DICT) {
             count += SEARCH_WORDS_DICT[w].length
        }
        console.log({count})
        process.exit(0)
    } catch (error) {
        console.error(error.message) 
        process.exit(1)
    }

}

main()