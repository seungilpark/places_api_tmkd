require("dotenv").config();
const fs = require("fs");
const axios = require("axios")
const BASE_DIR = "./GooglePlacesResultDetail"
const OUTPUT_DIR = "./MappedGooglePlacesItems";
const OUTPUT_FILENAME = "MappedGoogleEvents.json"
const KEY = process.env.GOOGLE_PLACES_API_KEY


const VENDOR_ID = 14
const EVENT_TYPE = "amenity"
const SOURCE_PLATFORM = "google"
const ITEMS = require("./searchWordsDictionary") 
const ITEMS_TMKD = JSON.parse(JSON.stringify(ITEMS))



let MAPPED_ITEMS_COUNT = 0

async function getPlacePhoto(ref) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${ref}&key=${KEY}`
    const response = await axios.get(url);
    // console.log(response.request._redirectable._options.href)
    

    // TODO: will the response always have these properties?
    return response.request._redirectable._options.href || ""
}

function mapAddress(address_components){

    if (!Array.isArray(address_components) || !(address_components.length)) return { address: null, city: null, province: null }

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
    // console.log({addr})
    return addr
}

function mapDesc({reviews, opening_hours, formatted_address }) {
    let desc=""
    let formattedReviews=""
    let formattedSchedules=""
    
    if (reviews && Array.isArray(reviews)) {
        formattedReviews = reviews.reduce((acc, curr) => {
            if (curr.text) acc += `${curr.text} - ${curr.author_name}\n`
            return acc
        },"")
    }

    if (opening_hours) {
        if (opening_hours.weekday_text && Array.isArray(opening_hours.weekday_text)) {
            formattedSchedules = opening_hours.weekday_text.reduce((acc, curr) => {
                acc += curr + "\n"
                return acc
            }, "")
        }
    }                
    
    desc += 
    formatted_address
    + '\n' +
    formattedSchedules 
    //  + formattedReviews

    if (!desc) desc = "No Description Found..."

    return desc
}

async function mapper(src, output){
    try {
        const ids = {}

        for (let key in src) { // should be the type of events e.g. park
            console.log({key})
            for (let eventDetailObject of src[key]) {
                if (!eventDetailObject.result) {
                    console.log({eventDetailObject})
                    continue
                } 
                
                if (ids[eventDetailObject.result.id]) continue // duplicates
                if (eventDetailObject.result.business_status !== "OPERATIONAL" || !(eventDetailObject.result.formatted_address.includes("BC"))) continue
                const event_TMKD = {}
                event_TMKD.vendor_id = VENDOR_ID
                event_TMKD.name = eventDetailObject.result.name
                event_TMKD.event_type = EVENT_TYPE
                const today = new Date()
                // event_TMKD.start_time = null 
                // event_TMKD.end_time = null
                event_TMKD.start_date = new Date()
                event_TMKD.end_date = new Date(today.getFullYear(), 12, 0)
        
                event_TMKD.link = eventDetailObject.result.website
                const addr = mapAddress(eventDetailObject.result.address_components)
                event_TMKD.address = addr.address
                event_TMKD.city = addr.city
                event_TMKD.province = addr.province
                // console.log({addr: `${event_TMKD.address} ${event_TMKD.city} ${event_TMKD.province}`})
                
                event_TMKD.lat = eventDetailObject.result.geometry.location.lat
                event_TMKD.lng = eventDetailObject.result.geometry.location.lng
                
                event_TMKD.description = mapDesc(eventDetailObject.result)
        

                if (eventDetailObject.result.photos && Array.isArray(eventDetailObject.result.photos)) {
                    photoRef = eventDetailObject.result.photos[0].photo_reference;
                
                    event_TMKD.image_url = await getPlacePhoto(eventDetailObject.result.photos[0].photo_reference)
                } else {
                    event_TMKD.image_url = null
                    
                }
                
                event_TMKD.source_id = eventDetailObject.result.id
                event_TMKD.source_platform = SOURCE_PLATFORM
                event_TMKD.source_endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${eventDetailObject.result.place_id}`
                event_TMKD.isApproved = "Pending"
                // console.log(event_TMKD)
                
                output[key].push(event_TMKD)
                MAPPED_ITEMS_COUNT++
                console.log({MAPPED_ITEMS_COUNT})
                ids[eventDetailObject.result.id] = 1
            }
            
        }    
    } catch (error) {
        console.error(error)    
    }
    
}


async function main() {
    try {
            
        console.time("mapping") 
        const files = fs.readdirSync(BASE_DIR)
        files.forEach( filename => {
            const searchWord = filename.split(".json")[0]
            const placeItems = fs.readFileSync(BASE_DIR + "/" + filename, "utf-8")
            ITEMS[searchWord] = ITEMS[searchWord].concat(JSON.parse(placeItems))
        })
        
        console.log("places fetched count:",  Object.keys(ITEMS).reduce((acc, curr) => acc + ITEMS[curr].length, 0))
        
        await mapper(ITEMS, ITEMS_TMKD)

        console.log("ptmkd object mapped count:",  Object.keys(ITEMS_TMKD).reduce((acc, curr) => acc + ITEMS_TMKD[curr].length, 0))
        console.log({MAPPED_ITEMS_COUNT})    
        
        if (!fs.existsSync(OUTPUT_DIR)){
            fs.mkdirSync(OUTPUT_DIR);
        }
        
        fs.writeFileSync(OUTPUT_DIR + '/' + OUTPUT_FILENAME, JSON.stringify(ITEMS_TMKD, undefined, 4))
        
        console.timeEnd("mapping") 

        process.exit(0)
    } catch (error) {
        process.exit(1)        
    }
}
main()