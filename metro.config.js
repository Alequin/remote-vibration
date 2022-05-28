const exclusionList = require("metro-config/src/defaults/exclusionList");

module.exports = {
  resolver: {
    // Exclude files from the final app bundle
    blacklistRE: exclusionList([
      /.*assets\/icon-html.*/,
      /.*assets\/google-play.*/,
      /.*test.js/,
      /.*package-lock.json/,
      /.*yarn.lock/,
    ]),
  },
};
