async function delayCalls(ms = 1000) {
  await new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, undefined), ms);
  });
}
exports.delayCalls = delayCalls;
