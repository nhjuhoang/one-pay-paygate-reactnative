"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getQueryParamsFromUrl = void 0;
const getQueryParamsFromUrl = string => {
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    // params = {},
    match;
  let params = {};
  while (match = regex.exec(string)) {
    params[match[1]] = match[2];
  }
  return params;
};
exports.getQueryParamsFromUrl = getQueryParamsFromUrl;
//# sourceMappingURL=utils.js.map