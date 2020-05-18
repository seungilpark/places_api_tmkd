// convert the json into sql script
const fs = require("fs");
const mysql = require("mysql");
const SOURCE = JSON.parse(fs.readFileSync("./output/events.json", "utf-8"))



const sql = `
    INSERT INTO event_test2 SET ?
`


for (let type in SOURCE) {
    SOURCE[type] = SOURCE[type].map(ev => mysql.format(sql, ev))
    console.log({data: SOURCE[type]})
}

if (!fs.existsSync("./output")){
    console.log(4)
    fs.mkdirSync("./output");
}

fs.writeFileSync("./output/output.sql", JSON.stringify(SOURCE, undefined, 4))


