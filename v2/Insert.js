// convert tmkd event json into sql to insert them into tmkd db
const fs = require("fs");
const mysql = require("mysql");
require("dotenv").config({ path: __dirname + "/./../.env" });
const SOURCE = JSON.parse(
  fs.readFileSync("./MappedGoogleItemsSQL/output.js", "utf-8")
);
const { query } = require("./dbConfig");
const cityNames = require("./cityNames");
const neighborhoods = require("./neighborhoods");

async function insertNewTags() {
  try {
    await Promise.all(
      cityNames.map((c) =>
        query(
          mysql.format(
            "INSERT INTO subcategory (name, category_id) VALUES(?, 13)",
            [c]
          )
        )
      )
    );
    await Promise.all(
      neighborhoods.map((n) =>
        query(
          mysql.format(
            "INSERT INTO subcategory (name, category_id) VALUES(?, 13)",
            [n]
          )
        )
      )
    );
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    console.time("inserting");
    for (let key in SOURCE) {
      console.log(`initiating inserting events data of ${key} type`);
      await Promise.all(SOURCE[key].map((sql) => query(sql)));
      console.log(`finishing inserting events data of ${key} type`);
    }
    console.timeEnd("inserting");

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// main();
// insertNewTags();
