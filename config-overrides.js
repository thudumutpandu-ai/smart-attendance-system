// face-api.js references Node's `fs` module, which doesn't exist in the browser.
module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
  };
  return config;
};
