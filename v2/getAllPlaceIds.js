const fs = require("fs");
const { query } = require("./dbConfig");

async function getAllPlaceIds() {
  const allPlaceIds = await query(
    "select source_id from event where source_platform = 'google' limit 0, 1000000"
  );
  const placeIds = allPlaceIds.map((e) => e.source_id);
  console.log({ placeIds });
  fs.writeFileSync("./placeIds.js", JSON.stringify(placeIds, null, 2));
  process.exit(0);
}
exports.getAllPlaceIds = getAllPlaceIds;
