require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const KEY = process.env.GOOGLE_PLACES_API_KEY
const SRC_DIR = "./GooglePlacesResult";
const OUTPUT_DIR = "./GooglePlacesResultDetail";
const ITEMS = require("./searchWordsDictionary"); 
const { filter } = require("./searchWords");





const IDS = {} // to check duplicates
let FETCH_COUNT = 0

function _loadPlaces() {
    const files = fs.readdirSync(SRC_DIR)
    files.forEach( filename => {
        const searchWord = filename.split(".json")[0]
        const placeItems = fs.readFileSync(SRC_DIR + "/" + filename, "utf-8")
        ITEMS[searchWord] = ITEMS[searchWord].concat(JSON.parse(placeItems))
    })
    // console.log({ITEMS})
}


function _filter(arr) {
    // remove place with "business_status" is not "OPERATIONAL" and not BC place 
    // if (eventDetailObject.result.business_status !== "OPERATIONAL" || !(eventDetailObject.result.formatted_address.includes("BC"))) continue
    let filtered = arr.filter( p => p["business_status"] === "OPERATIONAL" && p["formatted_address"].includes("BC"))
    filtered = filtered.filter(p => {
        let isNew = true
        if (IDS[p.place_id]) isNew = false
        else IDS[p.place_id] = 1
        return isNew
    })
    return filtered
}

async function getPlaceDetail(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${KEY}`
  const response = await axios.get(url);
  const { data } = response;
  if (data.status === "OK") FETCH_COUNT++
  console.log({FETCH_COUNT})
  return data
}


async function getDetails() {
    for (const searchWord in ITEMS) {
        ITEMS[searchWord] = await Promise.all(ITEMS[searchWord].map(async p => await getPlaceDetail(p.place_id)))
    }
}

function _writeOutput() {
        if (!fs.existsSync(OUTPUT_DIR)){
            fs.mkdirSync(OUTPUT_DIR)
        }

        for (const searchWord in ITEMS) {
            fs.writeFileSync(OUTPUT_DIR + `/${searchWord}.json`, JSON.stringify(ITEMS[searchWord], undefined, 4))
        }
}


async function Program() {
    try {
        /* load and filter items */ 
        let count = 0
        _loadPlaces() // load places into ITEMS
        for (const searchWord in ITEMS) {
            ITEMS[searchWord] = _filter(ITEMS[searchWord])
            count += ITEMS[searchWord].length
        } // filter each array in ITEMS

        /* fetching details */
        console.time("fetch detail")
        console.log({count}) 
        await getDetails()
        console.timeEnd("fetch detail")


        _writeOutput()
        process.exit(0) 
    } catch (error) {
        console.error(error)
       process.exit(1) 
    }

}


Program()