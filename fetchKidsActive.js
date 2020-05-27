/* 
    a script to fetch events from activeacess.com
    const url = http://api.amp.active.com/v2/search?kids=true&category=event&start_date=2020-05-26..&near=Vancouver,BC,CA&radius=200&per_page=100&current_page=0&api_key=pyjj9te7dvz59wdf2ag3m9ms
*/

const fs = require("fs");
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
// const API_KEY = config.KIDSACTIVE;

require("dotenv").config();
const axios = require("axios");
const API_KEY = process.env.ACTIVE_DOT_COM_API_KEY;
const OUTPUT_DIR = "./KidsActiveResult";
const OUTPUT_FILENAME ="/KidsActiveEventsResult"
const mysql = require("mysql");

let dbConfig = {
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const pool = mysql.createPool(dbConfig);



// Reference

// General Query ( GET ALL )
// http://api.amp.active.com/v2/search?kids=true&category=event&start_date=2020-05-26..&near=Surrey,BC,CA&radius=40&per_page=100&current_page=0&api_key=pyjj9te7dvz59wdf2ag3m9ms
// Detail Query Example
// GET by id
// http://api.amp.active.com/v2/search?place_id="PLACE_ID"&api_key=pyjj9te7dvz59wdf2ag3m9ms


// configure params here
const VENDOR_ID = 21
const today = new Date()
const STR_TODAY = `${today.getFullYear()}-${today.getMonth() >9 ? today.getMonth() % 12 + 1: "0"+ (today.getMonth()+1)}-${today.getDate()}`
const RADIUS = 40
const CITIES = [
  "Vancouver",
  "Kootenays",
  "Kamloops",
  "Kelowna",
  "North%20Vancouver",
  "West%20Vancouver",
  "Port%20Moody",
  "Vancouver%20West",
  "Nelson",
  "Surrey",
  "Burnaby",
  "Coquitlam",
  "Richmond",
  "Langley",
  "Abbotsford"
]
 
const RESULT_ITEMS = []
const RESULT_DICT = {}
// type TMKD event {
//   vendor_id : int,
//   name: string,
//   event_type: string,
//   start_date: datetime,
//   end_date: datetime,
//   link: string,
//   address:
//   city:
//   province:
//   lat:
//   lng:
//   description
//   image_url
//   source_id
//   source_platform
//   source_endpoint
// }
        
function mapper(kidsActivityEventObject) {
  try {

    const tmkd_event = {}
    tmkd_event.vendor_id = VENDOR_ID
    tmkd_event.name = kidsActivityEventObject.assetName
    tmkd_event.event_type = kidsActivityEventObject.place.placeName === "ONLINE" ? "virtual" : "activity"
    tmkd_event.start_date = kidsActivityEventObject.salesStartDate
    tmkd_event.end_date = kidsActivityEventObject.salesEndDate
    tmkd_event.link = kidsActivityEventObject.registrationUrlAdr
    tmkd_event.address = kidsActivityEventObject.place.addressLine1Txt
    tmkd_event.city = kidsActivityEventObject.place.cityName
    tmkd_event.province = kidsActivityEventObject.place.stateProvinceCode
    tmkd_event.lat = kidsActivityEventObject.place.latitude
    tmkd_event.lng = kidsActivityEventObject.place.longitude
    tmkd_event.description = (kidsActivityEventObject.assetDescriptions&& kidsActivityEventObject.assetDescriptions[0].description) || "no description found"
    tmkd_event.image_url = kidsActivityEventObject.logoUrlAdr
    tmkd_event.source_id = kidsActivityEventObject.assetGuid
    tmkd_event.source_platform = "active.com"
    tmkd_event.source_endpoint = `http://api.amp.active.com/v2/search?place_id=${kidsActivityEventObject.assetGuid}`
    return tmkd_event

  } catch(err) {
    console.error("item of id = ", kidsActivityEventObject.assetGuid)
    return null
    
  }  

  
}




/**
 * @param  { string } cityName
 * @param  { int } pageNum
 * fetch kidsactivity_events []
 * return tmkd_events[] || []
 */
async function fetchEvents(cityName) {
  // const output = []
  
  let pageNum = 0;
  let url = `http://api.amp.active.com/v2/search?kids=true&category=event&start_date=${STR_TODAY}..&near=${cityName},BC,CA&radius=40&per_page=100&current_page=${pageNum}&api_key=${API_KEY}`
  console.log({ url });
  let response = await axios.get(url);
  let { results } = response.data
  
  // console.log({results})
  
  while (results.length) {
    
    for (let event of results) {
      // console.log(`fetched event: ${JSON.stringify(event, undefined, 4)}`)

      if (event.assetRegistrableStatus !== "reg-open" || event.localeCd !== "en_CA" || event.salesStatus !== "registration-open") {
        continue
      } // check invalid event                                    

      if (RESULT_DICT[event.assetGuid]) {
        continue
      } else {
        RESULT_DICT[event.assetGuid] = 1
      }
      //check duplicated                    

      const tmkdEvent = mapper(event)
      // output.push(tmkdEvent)
      if (tmkdEvent) RESULT_ITEMS.push(tmkdEvent)
      // else continue

    }
    // await new Promise((resolve, reject) => {
    //   setTimeout(resolve.bind(null, undefined), 2500);
    // }); // some padding
    await _Sleep(2500)
    try {
      pageNum++
      url = `http://api.amp.active.com/v2/search?kids=true&category=event&start_date=${STR_TODAY}..&near=${cityName},BC,CA&radius=40&per_page=100&current_page=${pageNum}&api_key=${API_KEY}`
      response = await axios.get(url);
      results = response.data.results
      console.log({pageNum, url})

    } catch(err) {
      console.error(err)
      continue
    }
  } 

  // return output

}

function _Sleep(ms) {
 return new Promise((resolve, reject) => {
  setTimeout(resolve.bind(null, undefined), ms);
});
}

async function main() {
  try {
  // loop through each of cities and fetch events near the city
  // filter each event if not Canada/BC, or if closed, ....
  // filter duplicated event using assetIGuid field
  // enter event to items []
  // write items as result.json
    for (let cityName of CITIES) {
      await fetchEvents(cityName)
      console.log(`fetching events for ${cityName}...`, "\nRESULT_ITEMS.length", RESULT_ITEMS.length)
      await _Sleep(2500) // some padding
    }
    // console.log({ RESULT_ITEMS })
    
    
    // loop through tmkdEventObjects and insert each one to db
    const sql = `
        INSERT INTO event_test3 SET ?
    `
    for (let tmkdEvent of RESULT_ITEMS) {
      try {
        const insertResult = await new Promise((resolve, reject) => {
          pool.query(mysql.format(sql, [tmkdEvent]), (err, rows ) => {
            if (err) reject(err)
            else resolve(rows)
          })
        }) 
        console.log({"inserted id": insertResult.insertId})
        
      } catch (error) {
        console.error("error while inserting to db,...")
        console.error("error message:", error)
        continue
      }

    }
    
    // write the array of tmkd objects into json
    
    if (!fs.existsSync(OUTPUT_DIR)){
      fs.mkdirSync(OUTPUT_DIR);
    }

    fs.writeFileSync(OUTPUT_DIR +`${OUTPUT_FILENAME}_${STR_TODAY}.json`, JSON.stringify(RESULT_ITEMS, undefined, 4))

  } catch (error) {
    console.error(error.message);
  }
}

main();
