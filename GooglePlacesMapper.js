// each folder is a name of city
// each file name is a type of the event (can be used for taggin)

// make a array of event
// map eventDetail object with tmkdEvent
// make a unique array of event details grouped by type 

// make arrays of unique objects
// 

const fs = require("fs");
const axios = require("axios")
const BASE_DIR = "./GooglePlacesResult"
const OUTPUT_DIR = "./MappedGooglePlacesItems";
const OUTPUT_FILENAME = "MappedGoogleEvents.json"
require("dotenv").config();
const key = process.env.GOOGLE_PLACES_API_KEY
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
// const key = config.key;
const VENDOR_ID = 14
const EVENT_TYPE = "amenity"
const SOURCE_PLATFORM = "google"
const ITEMS = {
    "park":[], 
  "library":[], 
  "amusement_park":[], 
  "museum":[], 
  "zoo":[],
  "movie_theater":[],
  "campground":[],  
}

const ITEMS_TMKD = {
    "park":[], 
  "library":[], 
  "amusement_park":[], 
  "museum":[], 
  "zoo":[],
  "movie_theater":[],
  "campground":[],  
} 


const cities = fs.readdirSync(BASE_DIR)

const groupEventDetailsByType = async (eventDetailsBuffer, filename) => {
    const eventDetails = JSON.parse(eventDetailsBuffer)
    
    switch (filename) {
        case "park.json":
            ITEMS.park = (eventDetails)
            break;
        case "library.json":
            ITEMS.library = (eventDetails)
            break;
        case "amusement_park.json":
            ITEMS.amusement_park = (eventDetails)
            break;
        case "museum.json":
            ITEMS.museum = (eventDetails)
            break;
        case "zoo.json":
            ITEMS.zoo = (eventDetails)
            break;
        case "movie_theater.json":
            ITEMS.movie_theater = (eventDetails)
            break;
        case "campground.json":
            ITEMS.campground = (eventDetails)
            break;
    
        default:
            break;
    }
}
/**
 * @param  { string } dirname
 * @param  { fn } onFileContent
 * read all files in /dirname and call onFileContent for each of their file content
 */
function readFiles(dirname, onFileContent) {
    const files = fs.readdirSync(dirname)
    
    files.forEach(function(filename) {
       onFileContent(fs.readFileSync(dirname +"/"+ filename, "utf-8"), filename) 
    });
}

async function getPlacePhoto(ref) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${ref}&key=${key}`
    const response = await axios.get(url);
    // console.log(response.request._redirectable._options.href)
    

    // TODO: will the response always have these properties?
    return response.request._redirectable._options.href || ""
}
/**
 * @param  { object of arrays of event detail objects
 *   whose key is in object[result][id]} src
 *  filter others arrays using index array's ids
 */
function filterDuplicates(src){
    for (let indexArr in src) {
        const ids = src[indexArr].map(ev => ev.result.id)
        
        for (let otherArr in src) {
            if (indexArr === otherArr) continue
            else {
                src[otherArr] = src[otherArr].filter(ev => !ids.includes(ev.result.id))
            }

        }
    }
}

/**
 * @param  {} placeObj.address_components
 * input: google api object's address_components
 * output tmkd address obj 
 *  address
 *  city
 *  province
 * 
 * FIXME: the return value of address_components varies
 */
function mapAddress(address_components){

    if (!Array.isArray(address_components) || !address_components.length) return { address: null, city: null, province: null }

    const addr = {}

    const addressComponent = address_components.reduce((acc, curr) => {
        const type = curr.types && curr.types[0]
        if (type) {
            if (type === "administrative_area_level_1") {
                acc[type] = curr.short_name
            }
            else {
                acc[type] = curr.long_name
            }
        }
        return acc
    }, {})

    const floor = addressComponent.floor || ""
    const street_number = addressComponent.street_number || ""
    const route = addressComponent.route || ""
    const locality = addressComponent.locality || ""
    const administrative_area_level_1 = addressComponent.administrative_area_level_1 || ""

    addr.address = `${floor} ${street_number} ${route}`
    addr.city = locality
    addr.province = administrative_area_level_1
    console.log({addr})
    return addr
}



async function mapper(src, output){
    try {
        for (let key in src) {
        
            for (let eventDetailObject of src[key]) {
                const event_TMKD = {}
                if (eventDetailObject.result.business_status !== "OPERATIONAL" || !(eventDetailObject.result.formatted_address.includes("BC"))) continue
                event_TMKD.vendor_id = VENDOR_ID
                event_TMKD.name = eventDetailObject.result.name
                event_TMKD.event_type = EVENT_TYPE
                // event_TMKD.start_time = null 
                // event_TMKD.end_time = null
                // event_TMKD.start_date = null
                // event_TMKD.end_date = null
        
                event_TMKD.link = eventDetailObject.result.website
                const addr = mapAddress(eventDetailObject.result.address_components)
                event_TMKD.address = addr.address
                event_TMKD.city = addr.city
                event_TMKD.province = addr.province
                console.log({addr: `${event_TMKD.address} ${event_TMKD.city} ${event_TMKD.province}`})
                
                event_TMKD.lat = eventDetailObject.result.geometry.location.lat
                event_TMKD.lng = eventDetailObject.result.geometry.location.lng
                
        
        
                if (eventDetailObject.result.reviews && Array.isArray(eventDetailObject.result.reviews)) {
                    event_TMKD.description =  eventDetailObject.result.reviews.reduce((acc, curr) => {
                        if (curr.text) acc += `${curr.text} - ${curr.author_name}\n`
                        return acc
                    }, "")
                    if (eventDetailObject.result.opening_hours) {
                        if (eventDetailObject.result.opening_hours.weekday_text && Array.isArray(eventDetailObject.result.opening_hours.weekday_text)) {
                            const schedules = eventDetailObject.result.opening_hours.weekday_text.reduce((acc, curr) => {
                                acc += curr + "\n"
                                return acc
                            }, "")

                            event_TMKD.description += schedules        
                        }
                    }
        
                } else {

                    if (eventDetailObject.result.opening_hours) {
                        if (eventDetailObject.result.opening_hours.weekday_text && Array.isArray(eventDetailObject.result.opening_hours.weekday_text)) {
                            const schedules = eventDetailObject.result.opening_hours.weekday_text.reduce((acc, curr) => {
                                acc += curr + "\n"
                                return acc
                            }, "")

                            event_TMKD.description = schedules        
                        }
                    } else {
                        event_TMKD.description = "Description Not Found"

                    }

                }
        
                if (eventDetailObject.result.photos && Array.isArray(eventDetailObject.result.photos)) {
                    photoRef = eventDetailObject.result.photos[0].photo_reference;
                
                    event_TMKD.image_url = await getPlacePhoto(eventDetailObject.result.photos[0].photo_reference)
                } else {
                    event_TMKD.image_url = null
                    
                }
        
                event_TMKD.source_id = eventDetailObject.result.id
                event_TMKD.source_platform = SOURCE_PLATFORM
                event_TMKD.source_endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${eventDetailObject.result.place_id}`
                // console.log(event_TMKD)
                
                output[key].push(event_TMKD)
            }
            
        }    
    } catch (error) {
        console.error(error)    
    }
    
}



async function main() {
    
    for (let city of cities) {
        readFiles(BASE_DIR + "/" + city, groupEventDetailsByType)
        // console.log("in cities loop")
    }

    filterDuplicates(ITEMS)

    await mapper(ITEMS, ITEMS_TMKD)
    
    
    if (!fs.existsSync(OUTPUT_DIR)){
        console.log(4)
        fs.mkdirSync(OUTPUT_DIR);
    }

    fs.writeFileSync(OUTPUT_DIR + '/' + OUTPUT_FILENAME, JSON.stringify(ITEMS_TMKD, undefined, 4))
        
        //    const a = JSON.parse(fs.readFileSync("./output/events.json", "utf-8"))
        //     for (let type in a) {
        //         console.log(`${type}'s length: ${a[type].length}` )
        
        //     }
        process.exit(0)
}

main()