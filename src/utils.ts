export const getQueryParamsFromUrl = (string: string) => {
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    // params = {},
    match;
  let params: { [key: string]: any } = {};
  while ((match = regex.exec(string))) {
    params[match[1]] = match[2];
  }
  return params;
};
