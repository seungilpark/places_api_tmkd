// convert the json into sql script
const fs = require("fs");
const mysql = require("mysql");
const SOURCE = JSON.parse(fs.readFileSync("./MappedGooglePlacesItems/MappedGoogleEvents.json", "utf-8"))
const OUTPUT_DIR = "./MappedGoogleItemsSQL"
const OUTPUT_FILENAME = "output.sql"

const sql = `
    INSERT INTO event_test4 SET ?
`


for (let type in SOURCE) {
    SOURCE[type] = SOURCE[type].map(ev => mysql.format(sql, ev))
    console.log({data: SOURCE[type]})
}

if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR);
}

// FIXME: should write sql file not json
fs.writeFileSync(OUTPUT_DIR + '/' + OUTPUT_FILENAME , JSON.stringify(SOURCE, undefined, 4))


process.exit(0)