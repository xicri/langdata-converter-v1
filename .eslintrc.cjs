"use strict";

module.exports = {
  root: true,
  extends: "xicri/node",

  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    sourceType: "module",
  },
  overrides: [{
    files: [ "**/*.test.js", "**/*.test.cjs", "**/*.test.mjs" ],
    extends: "xicri/jest",
  }],
};
