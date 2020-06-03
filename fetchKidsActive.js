/* 
    a script to fetch events from activeacess.com, to map them into tmkd objects, to insert into tmkd db, and to write the result into json
*/

const fs = require("fs");
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
// const API_KEY = config.KIDSACTIVE;

require("dotenv").config();
const axios = require("axios");
const API_KEY = process.env.ACTIVE_DOT_COM_API_KEY;
const OUTPUT_DIR = "./KidsActiveResult";
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
// event object from the api
// https://developer.active.com/io-docs

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
const RESULT_ITEMS_TAG_INFO = []
const RESULT_DICT = {}

        
/**
 * @param  {} kidsActivityEventObject
 * input: event fetched from the api
 * output tmkd event  
 */
function mapper(kidsActivityEventObject) {
  try {
    const tmkd_event = {}
    tmkd_event.vendor_id = VENDOR_ID
    tmkd_event.name = kidsActivityEventObject.assetName
    tmkd_event.event_type = kidsActivityEventObject.place.placeName === "ONLINE" ? "virtual" : "activity"
    // tmkd_event.start_date = kidsActivityEventObject.salesStartDate
    tmkd_event.start_date = kidsActivityEventObject.activityStartDate
    // tmkd_event.end_date = kidsActivityEventObject.salesEndDate
    tmkd_event.end_date = kidsActivityEventObject.activityEndDate
    tmkd_event.start_time = kidsActivityEventObject.activityRecurrences[0].startTime
    tmkd_event.end_time = kidsActivityEventObject.activityRecurrences[0].endtime
    tmkd_event.link = kidsActivityEventObject.registrationUrlAdr
    tmkd_event.address = kidsActivityEventObject.place.addressLine1Txt
    tmkd_event.city = kidsActivityEventObject.place.cityName
    tmkd_event.province = kidsActivityEventObject.place.stateProvinceCode
    tmkd_event.lat = kidsActivityEventObject.place.latitude
    tmkd_event.lng = kidsActivityEventObject.place.longitude
    
    tmkd_event.description = (kidsActivityEventObject.assetDescriptions&& kidsActivityEventObject.assetDescriptions[0].description) || "no description found"
    // tmkd_event.description = (kidsActivityEventObject.organization && kidsActivityEventObject.organization.organizationDsc) || "no description found"
    // console.log("assetDesc:", kidsActivityEventObject.assetDescriptions && kidsActivityEventObject.assetDescriptions[0].description)
    // console.log("organizationDsc:", kidsActivityEventObject.organization && kidsActivityEventObject.organization.organizationDsc)
    tmkd_event.image_url = kidsActivityEventObject.logoUrlAdr
    tmkd_event.source_id = kidsActivityEventObject.assetGuid
    tmkd_event.source_platform = "active.com"
    tmkd_event.source_endpoint = `http://api.amp.active.com/v2/search?place_id=${kidsActivityEventObject.assetGuid}`
    
    // TODO: do something with the tags
    const tags = kidsActivityEventObject.assetTags.map(t => t.tag && ({key: t.tag.tagDescription, value: t.tag.tagName }))
    const categories = kidsActivityEventObject.assetCategories.map(c => c.category && c.category.categoryName)
    const topics = kidsActivityEventObject.assetTopics.map(t => t.topic && ({ topicTaxonomy: t.topic.topicTaxonomy, topicName:  t.topic.topicName}))
    console.log ( { id: tmkd_event.source_id, tags, categories, topics, idInDb: null } )
    
    RESULT_DICT[tmkd_event.source_id] = 1
    RESULT_ITEMS_TAG_INFO.push({ id: tmkd_event.source_id, tags, categories, topics, idInDb: null })
    return tmkd_event

  } catch(err) {
    console.error("Error in mapper()")
    console.error("assetGuid = ", kidsActivityEventObject.assetGuid) 
    
    return null
    
  }  
}


/**
 * @param  { string } cityName
 * @param  { int } pageNum
 * fetch kidsactivity_events []
 * update RESULT_ITEMS, RESULT_ITEMS_TAG_INFO global variables
 */
async function fetchEvents(cityName) {
  
  let pageNum = 1;
  let url = `http://api.amp.active.com/v2/search?kids=true&category=event&start_date=${STR_TODAY}..&near=${cityName},BC,CA&radius=${RADIUS}&per_page=100&current_page=${pageNum}&api_key=${API_KEY}`
  // console.log({ url });
  console.log(`fetching events for ${cityName}...`, "\nRESULT_ITEMS.length", RESULT_ITEMS.length)
  let response = await axios.get(url);
  let { results } = response.data
  // console.log({results})
  
  
  while (results.length) {
    console.log(`${results.length} events fetched!`)  
    for (let event of results) {
      // console.log(`fetched event: ${JSON.stringify(event, undefined, 4)}`)

      if (event.assetRegistrableStatus !== "reg-open" || event.place.countryCode !== "CAN" || event.salesStatus !== "registration-open") {
        // console.log({ status: event.assetRegistrableStatus, localeCd: event.localeCd, countryCode: event.place.countryCode, salesStatus: event.salesStatus  })
        continue
      } // check invalid event                                    

      if (RESULT_DICT[event.assetGuid]) {
        continue
      } //check duplicated                    

      const tmkdEvent = mapper(event)
      if (tmkdEvent) RESULT_ITEMS.push(tmkdEvent)

    }

    await _Sleep(2500)
    
    try {
      pageNum++
      url = `http://api.amp.active.com/v2/search?kids=true&category=event&start_date=${STR_TODAY}..&near=${cityName},BC,CA&radius=40&per_page=100&current_page=${pageNum}&api_key=${API_KEY}`
      console.log(`fetching events for ${cityName}...`, "\nRESULT_ITEMS.length", RESULT_ITEMS.length)
      response = await axios.get(url);
      results = response.data.results
      // console.log({pageNum, url})

    } catch(err) {
      console.error(err)
      continue
    }
  } 
}


/**
 * @param  {} ms
 * used to give interval between requests
 */
function _Sleep(ms) {
 return new Promise((resolve, reject) => {
  setTimeout(resolve.bind(null, undefined), ms);
});
}

async function main() {
  try {
    console.time("FETCHING PROCESS");
    for (let cityName of CITIES) {
      await fetchEvents(cityName)
      await _Sleep(2500) // some padding
    }
    console.timeEnd("FETCHING PROCESS");
    
    console.log("START INSERTING TO DB...")
    const sql = `INSERT INTO event_test4 SET ?`
    for (let tmkdEvent of RESULT_ITEMS) {
      try {
        const insertResult = await new Promise((resolve, reject) => {
          pool.query(mysql.format(sql, [tmkdEvent]), (err, rows ) => {
            if (err) reject(err)
            else resolve(rows)
          })
        }) 
        
        RESULT_ITEMS_TAG_INFO.find( item => item.id === tmkdEvent.source_id ).idInDb = insertResult.insertId
        
      } catch (error) {
        console.error("error while inserting to db,...")
        console.error("error message:", error)
        continue
      }

    }
    console.log("FINISHED INSERTING TO DB...")
    console.log(`WRITING JSONS`)
    if (!fs.existsSync(OUTPUT_DIR)){
      fs.mkdirSync(OUTPUT_DIR);
    }
    
    if (!fs.existsSync(OUTPUT_DIR + '/' + STR_TODAY)){
      fs.mkdirSync(OUTPUT_DIR + '/' + STR_TODAY);
    }
    
    fs.writeFileSync(OUTPUT_DIR + '/' + STR_TODAY + '/' + "RESULT_ITEMS.json", JSON.stringify(RESULT_ITEMS, undefined, 4))
    fs.writeFileSync(OUTPUT_DIR + '/' + STR_TODAY + '/' + "RESULT_ITEMS_TAG_INFO.json", JSON.stringify(RESULT_ITEMS_TAG_INFO, undefined, 4))
    
    console.log(`FINISHED WRITING JSONS`)
    console.log("JOB FINISHED...")
    process.exit(0);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
