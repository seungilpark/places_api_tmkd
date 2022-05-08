const fs = require("fs");

function generateJson(data = [], outputDir = ".", subDir, fileName = "") {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const subdir = outputDir + subDir;
  if (!fs.existsSync(subdir)) fs.mkdirSync(subdir);
  fs.writeFileSync(
    `${subdir}/${fileName}.json`,
    JSON.stringify(data, undefined, 4)
  );
}
module.exports = { generateJson };
