require("dotenv").config({ path: __dirname + "/./../.env" });
const fs = require("fs");
const mysql = require("mysql");
const { getAllPlaceIds } = require("./getAllPlaceIds");
const { query, format } = require("./dbConfig");
const NearbyResultDir = "./NearbySearchResult";
const BASE_DIR = "./PlacesDetailResult";
const cities = fs.readdirSync(BASE_DIR);

async function insertEventCategory(eid, cid) {
  const sql = mysql.format(
    `REPLACE INTO event_category (event_id, category_id) VALUES (?, ?)`,
    [eid, cid]
  );
  await query(sql);
}
async function insertEventSubcategory(eid, sid) {
  const sql = mysql.format(
    `REPLACE INTO event_subcategory (event_id, subcategory_id) VALUES (?, ?)`,
    [eid, sid]
  );
  await query(sql);
}
async function insertEventTags(eid, tid) {
  const sql = mysql.format(
    `REPLACE INTO event_tags (event_id, tag_id) VALUES (?, ?)`,
    [eid, tid]
  );
  await query(sql);
}

async function mapTownToTags(eventObj) {
  const { town, event_id } = eventObj;
  if (town) {
    const sql = mysql.format(
      "select subcategory_id from subcategory where name = ?",
      [town]
    );
    const subcategory = await query(sql);
    if (subcategory.length) {
      const sid = subcategory[0].subcategory_id;
      await insertEventSubcategory(event_id, sid);
    }
  }
}

async function mapCityToTags(eventObj) {
  const { event_id, city } = eventObj;
  if (city) {
    const sql = mysql.format(
      "select subcategory_id from subcategory where name = ?",
      [city]
    );
    const subcategory = await query(sql);
    if (subcategory.length) {
      const sid = subcategory[0].subcategory_id;
      await insertEventSubcategory(event_id, sid);
    }
  }
}

async function mapNameToTags(eventObj) {
  const { event_id, name } = eventObj;
  if (name.toLowerCase().includes("art")) {
    await insertEventCategory(event_id, 2);
    await insertEventSubcategory(event_id, 6);
  }
  if (
    name.toLowerCase().includes("movie") ||
    name.toLowerCase().includes("theatre") ||
    name.toLowerCase().includes("cinema")
  ) {
    await insertEventCategory(event_id, 2);
    await insertEventSubcategory(event_id, 9);
    await insertEventSubcategory(event_id, 4);
  }
  if (name.toLowerCase().includes("dance")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 7);
  }
  if (
    name.toLowerCase().includes("homeschool") ||
    name.toLowerCase().includes("home-school")
  ) {
    await insertEventCategory(event_id, 3);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 124);
  }
  if (
    name.toLowerCase().includes("swim") ||
    name.toLowerCase().includes("pool")
  ) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 57);
    await insertEventSubcategory(event_id, 130);
    await insertEventSubcategory(event_id, 131);
  }
  if (
    name.toLowerCase().includes("elementary") ||
    name.toLowerCase().includes("primary")
  ) {
    await insertEventCategory(event_id, 3);
    await insertEventSubcategory(event_id, 18);
    await insertEventSubcategory(event_id, 19);
  }
  if (
    name.toLowerCase().includes("highschool") ||
    name.toLowerCase().includes("high school") ||
    name.toLowerCase().includes("secondary")
  ) {
    await insertEventCategory(event_id, 3);
    await insertEventSubcategory(event_id, 19);
    await insertEventSubcategory(event_id, 14);
    await insertEventSubcategory(event_id, 13);
  }
  if (
    name.toLowerCase().includes("science") ||
    name.toLowerCase().includes("technology")
  ) {
    await insertEventCategory(event_id, 4);
    await insertEventSubcategory(event_id, 36);
  }
  if (name.toLowerCase().includes("cooking")) {
    await insertEventCategory(event_id, 2);
    await insertEventSubcategory(event_id, 53);
  }
  if (
    name.toLowerCase().includes("zara") ||
    name.toLowerCase().includes("h&m") ||
    name.toLowerCase().includes("gucci") ||
    name.toLowerCase().includes("clothing")
  ) {
    await insertEventCategory(event_id, 12);
    await insertEventSubcategory(event_id, 108);
    await insertEventSubcategory(event_id, 129);
  }
  if (
    (name.toLowerCase().includes("park") ||
      name.toLowerCase().includes("parks")) &&
    !name.toLowerCase().includes("parking")
  ) {
    await insertEventCategory(event_id, 9);
    await insertEventCategory(event_id, 10);
    await insertEventSubcategory(event_id, 117);
    await insertEventSubcategory(event_id, 45);
    await insertEventSubcategory(event_id, 115);
  }
  if (
    name.toLowerCase().includes("toys") ||
    name.toLowerCase().includes("toy")
  ) {
    await insertEventCategory(event_id, 12);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 112);
    await insertEventSubcategory(event_id, 113);
  }
  if (
    name.toLowerCase().includes("superstore") ||
    name.toLowerCase().includes("walmart") ||
    name.toLowerCase().includes("shoppers") ||
    name.toLowerCase().includes("london drugs")
  ) {
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 129);
    await insertEventSubcategory(event_id, 3);
    await insertEventSubcategory(event_id, 114);
    await insertEventSubcategory(event_id, 113);
  }
  if (
    name.toLowerCase().includes("music") ||
    name.toLowerCase().includes("piano") ||
    name.toLowerCase().includes("guitar") ||
    name.toLowerCase().includes("drum") ||
    name.toLowerCase().includes("musical instrument")
  ) {
    await insertEventCategory(event_id, 2);
    await insertEventSubcategory(event_id, 8);
  }
  if (
    name.toLowerCase().includes("daycare") ||
    name.toLowerCase().includes("preschool") ||
    name.toLowerCase().includes("pre-school")
  ) {
    await insertEventSubcategory(event_id, 17);
  }
  if (name.toLowerCase().includes("yoga")) {
    await insertEventSubcategory(event_id, 64);
  }
  if (name.toLowerCase().includes("soccer")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 70);
  }
  if (name.toLowerCase().includes("tennis")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 80);
    await insertEventTags(event_id, 177);
  }
  if (name.toLowerCase().includes("football")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 67);
  }
  if (name.toLowerCase().includes("travel")) {
    await insertEventSubcategory(event_id, 63);
  }
  if (name.toLowerCase().includes("basketball")) {
    await insertEventSubcategory(event_id, 65);
  }
  if (name.toLowerCase().includes("lacrosse")) {
    await insertEventSubcategory(event_id, 68);
  }
  if (
    name.toLowerCase().includes("hockey") ||
    name.toLowerCase().includes("rink")
  ) {
    await insertEventSubcategory(event_id, 95);
    await insertEventSubcategory(event_id, 72);
  }
  if (name.toLowerCase().includes("beach")) {
    await insertEventCategory(event_id, 9);
    await insertEventSubcategory(event_id, 83);
    await insertEventSubcategory(event_id, 84);
  }
  if (
    name.toLowerCase().includes("animal") ||
    name.toLowerCase().includes("pet") ||
    name.toLowerCase().includes("veterinarian")
  ) {
    await insertEventCategory(event_id, 5);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 41);
  }
  if (name.toLowerCase().includes("gym")) {
    await insertEventCategory(event_id, 8);
    await insertEventSubcategory(event_id, 54);
  }
  if (
    name.toLowerCase().includes("martial arts") ||
    name.toLowerCase().includes("judo") ||
    name.toLowerCase().includes("taekwondo") ||
    name.toLowerCase().includes("ufc") ||
    name.toLowerCase().includes("boxing")
  ) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 59);
  }
  if (name.toLowerCase().includes("judo")) {
    await insertEventTags(event_id, 139);
  }
  if (name.toLowerCase().includes("taekowndo")) {
    await insertEventTags(event_id, 143);
  }
  if (name.toLowerCase().includes("books")) {
    await insertEventTags(event_id, 146);
  }
  if (name.toLowerCase().includes("resort")) {
    await insertEventTags(event_id, 127);
  }
  if (name.toLowerCase().includes("bowling")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 49);
  }
  if (name.toLowerCase().includes("biking")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 50);
  }
  if (name.toLowerCase().includes("skateboard")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 51);
  }
  if (name.toLowerCase().includes("snowboarding")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 56);
  }
  if (name.toLowerCase().includes("ski")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 55);
  }
  if (name.toLowerCase().includes("gynmastics")) {
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 54);
  }
  if (name.toLowerCase().includes("reading")) {
    await insertEventCategory(event_id, 3);
    await insertEventSubcategory(event_id, 60);
  }
  if (name.toLowerCase().includes("library")) {
    await insertEventCategory(event_id, 3);
    await insertEventCategory(event_id, 9);
    await insertEventSubcategory(event_id, 90);
  }
  if (name.toLowerCase().includes("lesson")) {
    await insertEventCategory(event_id, 3);
    await insertEventSubcategory(event_id, 127);
    await insertEventSubcategory(event_id, 128);
  }
  if (name.toLowerCase().includes("robotics")) {
    await insertEventCategory(event_id, 3);
    await insertEventSubcategory(event_id, 35);
  }
  if (name.toLowerCase().includes("museum")) {
    await insertEventCategory(event_id, 9);
    await insertEventCategory(event_id, 2);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 6);
    await insertEventSubcategory(event_id, 103);
  }
  if (name.toLowerCase().includes("tutor")) {
    await insertEventCategory(event_id, 3);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 21);
    await insertEventSubcategory(event_id, 22);
  }
  if (name.toLowerCase().includes("science world")) {
    await insertEventSubcategory(event_id, 118);
    await insertEventCategory(event_id, 4);
  }
  if (
    name.toLowerCase().includes("starbucks") ||
    name.toLowerCase().includes("tim horton") ||
    name.toLowerCase().includes("coffee") ||
    name.toLowerCase().includes("cafe")
  ) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 14);
    await insertEventSubcategory(event_id, 246);
    await insertEventSubcategory(event_id, 248);
    await insertEventSubcategory(event_id, 250);
    await insertEventSubcategory(event_id, 199);
  }
  if (
    name.toLowerCase().includes("starbucks") ||
    name.toLowerCase().includes("tim horton") ||
    name.toLowerCase().includes("restaurant") ||
    name.toLowerCase().includes("brunch") ||
    name.toLowerCase().includes("dining")
  ) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 14);
    await insertEventSubcategory(event_id, 246);
    await insertEventSubcategory(event_id, 248);
    await insertEventSubcategory(event_id, 250);
    await insertEventSubcategory(event_id, 199);
  }
  if (
    name.toLowerCase().includes("camping") ||
    name.toLowerCase().includes("camp site") ||
    name.toLowerCase().includes("campsite") ||
    name.toLowerCase().includes("camp-site") ||
    name.toLowerCase().includes("campground")
  ) {
    await insertEventSubcategory(event_id, 9);
    await insertEventSubcategory(event_id, 117);
    await insertEventSubcategory(event_id, 45);
    await insertEventTags(event_id, 185);
    await insertEventTags(event_id, 186);
  }
}

async function mapTypesToTags(eventObj) {
  const { event_id, source_types } = eventObj;
  if (!source_types) return;
  if (source_types.includes("aquarium")) {
    await insertEventCategory(event_id, 9);
    await insertEventCategory(event_id, 5);
    await insertEventCategory(event_id, 10);
    await insertEventSubcategory(event_id, 99);
  }
  if (source_types.includes("art_gallery")) {
    await insertEventCategory(event_id, 2);
    await insertEventCategory(event_id, 10);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 6);
    await insertEventSubcategory(event_id, 44);
    await insertEventTags(event_id, 37);
    await insertEventTags(event_id, 36);
  }
  if (source_types.includes("bakery")) {
    await insertEventCategory(event_id, 11);
    await insertEventTags(event_id, 121);
    await insertEventTags(event_id, 122);
  }
  if (source_types.includes("lodging")) {
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 245);
  }
  if (source_types.includes("meal_takeaway")) {
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 246);
  }
  if (source_types.includes("bar")) {
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 247);
  }
  if (source_types.includes("movie_theater")) {
    await insertEventCategory(event_id, 2);
    await insertEventCategory(event_id, 6);
    await insertEventSubcategory(event_id, 4);
    await insertEventSubcategory(event_id, 9);
    await insertEventTags(event_id, 94);
    await insertEventTags(event_id, 95);
    await insertEventTags(event_id, 96);
  }
  if (source_types.includes("museum")) {
    await insertEventCategory(event_id, 9);
    await insertEventCategory(event_id, 2);
    await insertEventCategory(event_id, 10);
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 6);
    await insertEventSubcategory(event_id, 103);
  }
  if (source_types.includes("cafe")) {
    await insertEventCategory(event_id, 11);
    await insertEventSubcategory(event_id, 248);
  }
  if (source_types.includes("campground")) {
    await insertEventSubcategory(event_id, 9);
    await insertEventCategory(event_id, 10);
    await insertEventSubcategory(event_id, 117);
    await insertEventSubcategory(event_id, 45);
    await insertEventTags(event_id, 185);
    await insertEventTags(event_id, 186);
  }
  if (source_types.includes("casino")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 10);
    await insertEventSubcategory(event_id, 249);
  }
  if (source_types.includes("restaurant")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 14);
    await insertEventSubcategory(event_id, 246);
    await insertEventSubcategory(event_id, 250);
    await insertEventSubcategory(event_id, 199);
  }

  if (source_types.includes("spa")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 6);
    await insertEventCategory(event_id, 10);
  }
  if (source_types.includes("stadium")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 6);
    await insertEventCategory(event_id, 10);
  }
  if (source_types.includes("tourist_attraction")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 6);
    await insertEventCategory(event_id, 10);
    await insertEventSubcategory(event_id, 63);
  }
  if (source_types.includes("zoo")) {
    await insertEventCategory(event_id, 10);
    await insertEventCategory(event_id, 5);
    await insertEventCategory(event_id, 1);
  }
  if (source_types.includes("food")) {
    await insertEventCategory(event_id, 11);
    await insertEventCategory(event_id, 14);
    await insertEventSubcategory(event_id, 246);
    await insertEventSubcategory(event_id, 250);
    await insertEventSubcategory(event_id, 199);
  }
}

async function mapTags() {
  try {
    const events = await query("SELECT * FROM event");
    for (const ev of events) {
      console.log(`adding tags for event_id: ${ev.event_id}`);
      await mapCityToTags(ev);
      await mapTownToTags(ev);
      await mapNameToTags(ev);
      await mapTypesToTags(ev);
    }
    process.exit(0);
  } catch (error) {
    console.error({ error });
    process.exit(0);
  }
}

mapTags();
