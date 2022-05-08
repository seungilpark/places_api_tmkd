// convert the json into sql script
const fs = require("fs");
const mysql = require("mysql");
const SOURCE = JSON.parse(
  fs.readFileSync(
    "./MappedGooglePlacesItems/MappedGoogleEventsWithTown.json",
    "utf-8"
  )
);
const OUTPUT_DIR = "./MappedGoogleItemsSQL";
const OUTPUT_FILENAME = "output.js";

const sql = `
    INSERT INTO event SET ?
`;
// const ids = [];
// for (let type in SOURCE) {
//   SOURCE[type] = SOURCE[type].map((e) => ids.push(e.source_id));
// }
// fs.writeFileSync(
//   OUTPUT_DIR + "/" + "ids.json",
//   JSON.stringify(ids, undefined, 4)
// );
// process.exit(0);

for (let type in SOURCE) {
  SOURCE[type] = SOURCE[type]
    .map((ev) => {
      ev.end_date = "2032-12-31T00:00:00.000Z";
      ev.isApproved = "Approved";
      switch (ev.city) {
        case "Abbotsford":
          ev.vendor_id = 536;
          break;
        case "Armstrong":
          ev.vendor_id = 537;
          break;
        case "Burnaby":
          ev.vendor_id = 538;
          break;
        case "Campbell River":
          ev.vendor_id = 539;
          break;
        case "Castlegar":
          ev.vendor_id = 540;
          break;
        case "Chilliwack":
          ev.vendor_id = 541;
          break;
        case "Colwood":
          ev.vendor_id = 542;
          break;
        case "Coquitlam":
          ev.vendor_id = 543;
          break;
        case "Courtenay":
          ev.vendor_id = 544;
          break;
        case "Cranbrook":
          ev.vendor_id = 545;
          break;
        case "Dawson Creek":
          ev.vendor_id = 546;
          break;
        case "Delta":
          ev.vendor_id = 547;
          break;
        case "Duncan":
          ev.vendor_id = 548;
          break;
        case "Enderby":
          ev.vendor_id = 549;
          break;
        case "Fernie":
          ev.vendor_id = 550;
          break;
        case "Fort St. John":
          ev.vendor_id = 551;
          break;
        case "Grand Forks":
          ev.vendor_id = 552;
          break;
        case "Greenwood":
          ev.vendor_id = 553;
          break;
        case "Kamloops":
          ev.vendor_id = 554;
          break;
        case "Kelowna":
          ev.vendor_id = 555;
          break;
        case "Kimberley":
          ev.vendor_id = 556;
          break;
        case "Langford":
          ev.vendor_id = 557;
          break;
        case "Langley":
          ev.vendor_id = 558;
          break;
        case "Maple Ridge":
          ev.vendor_id = 559;
          break;
        case "Merritt":
          ev.vendor_id = 560;
          break;
        case "Nanaimo":
          ev.vendor_id = 561;
          break;
        case "Nelson":
          ev.vendor_id = 562;
          break;
        case "New Westminster":
          ev.vendor_id = 563;
          break;
        case "North Vancouver":
          ev.vendor_id = 564;
          break;
        case "Parksville":
          ev.vendor_id = 565;
          break;
        case "Penticton":
          ev.vendor_id = 566;
          break;
        case "Pitt Meadows":
          ev.vendor_id = 567;
          break;
        case "Port Alberni":
          ev.vendor_id = 568;
          break;
        case "Port Coquitlam":
          ev.vendor_id = 569;
          break;
        case "Port Moody":
          ev.vendor_id = 570;
          break;
        case "Powell River":
          ev.vendor_id = 571;
          break;
        case "Prince George":
          ev.vendor_id = 572;
          break;
        case "Quesnel":
          ev.vendor_id = 573;
          break;
        case "Revelstoke":
          ev.vendor_id = 574;
          break;
        case "Richmond":
          ev.vendor_id = 575;
          break;
        case "Rossland":
          ev.vendor_id = 576;
          break;
        case "Salmon Arm":
          ev.vendor_id = 577;
          break;
        case "Surrey":
          ev.vendor_id = 578;
          break;
        case "Terrace":
          ev.vendor_id = 579;
          break;
        case "Trail":
          ev.vendor_id = 580;
          break;
        case "Vancouver":
          ev.vendor_id = 581;
          break;
        case "Vernon":
          ev.vendor_id = 582;
          break;
        case "Victoria":
          ev.vendor_id = 583;
          break;
        case "West Kelowna":
          ev.vendor_id = 584;
          break;
        case "White Rock":
          ev.vendor_id = 585;
          break;
        case "Williams Lake":
          ev.vendor_id = 586;
          break;
        default:
          ev.vendor_id = 535;
          break;
      }
      return ev;
    })
    .map((ev) => mysql.format(sql, ev));
  // console.log({data: SOURCE[type]})
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

fs.writeFileSync(
  OUTPUT_DIR + "/" + OUTPUT_FILENAME,
  JSON.stringify(SOURCE, undefined, 4)
);

process.exit(0);
