const values = new Map();
module.exports.createAsyncStorage = () => ({
  getItem: async key => values.get(key) ?? null,
  setItem: async (key, value) => { values.set(key, value); },
});
