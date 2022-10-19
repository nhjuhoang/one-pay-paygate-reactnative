export const getQueryParamsFromUrl = string => {
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    // params = {},
    match;
  let params = {};
  while (match = regex.exec(string)) {
    params[match[1]] = match[2];
  }
  return params;
};
//# sourceMappingURL=utils.js.map