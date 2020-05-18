// convert tmkd event json into sql to insert them into tmkd db
const fs = require("fs");
const mysql = require("mysql");
require("dotenv").config();
const SOURCE = JSON.parse(fs.readFileSync("./output/output.sql", "utf-8"))

let dbConfig = {
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const pool = mysql.createPool(dbConfig);
const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };
      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
async function main () {
  // const db = await connection();
  try {
      // await db.query("START TRANSACTION")
       
      for (let key in SOURCE) {
        console.log(`initiating inserting events data of ${key} type`)
        await Promise.all(SOURCE[key].map(sql => query(sql)))
        console.log(`finishing inserting events data of ${key} type`)
      }
  
  
      return "done"
      // await db.query("COMMIT")
  } catch (error) {
    console.error(error);
    return "error"
    // db.query("ROLL BACK");
  } 
  // finally {
  //   await db.release();
  // }

}

main()