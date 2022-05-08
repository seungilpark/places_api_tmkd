function formatOutput(result) {
  // result is array of array of places
  const flattenedResult = result.reduce((acc, curr) => acc.concat(curr), []);
  const uniqueResultDictionary = flattenedResult.reduce(
    (placeDict, place) => {
      if (!placeDict[place.place_id]) placeDict[place.place_id] = place;
      return placeDict;
    },
    {} // place_id dictionary
  );
  const outputArray = Object.keys(uniqueResultDictionary).map(
    (k) => uniqueResultDictionary[k]
  );
  return outputArray;
}
exports.formatOutput = formatOutput;
