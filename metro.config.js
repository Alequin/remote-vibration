const blacklist = require("metro-config/src/defaults/blacklist");

// exclusionList is a function that takes an array of regexes and combines
// them with the default exclusions to return a single regex.

module.exports = {
  resolver: {
    blacklistRE: blacklist([/.*icon-html.*|.*google-play.*/]),
  },
};
