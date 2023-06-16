const { normal } = require("./normal");

function test(words) {
  const normalArray = new Array(words.length);
  let index = 0;
  for (let w of words) {
    normalArray[index++] = normal(w);
  }
  return normalArray;
}

module.exports = { test };
