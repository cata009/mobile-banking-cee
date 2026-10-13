const upstream = require('@react-native/metro-babel-transformer');

/** Bundle original SVG XML without rasterization, keeping paths and viewBox intact. */
module.exports.transform = function transform(args) {
  if (!args.filename.endsWith('.svg')) return upstream.transform(args);
  return upstream.transform({
    ...args,
    src: `module.exports = ${JSON.stringify(
      'data:image/svg+xml;utf8,' + encodeURIComponent(args.src),
    )};`,
  });
};
