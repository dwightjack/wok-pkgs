module.exports = ({ publicPath = '/', basePath = '', production }) => {
  const { join } = require('path');
  const fs = require('fs');
  const sizeOf = require('image-size');
  const datauri = require('datauri').sync;
  const { types } = require('node-sass');

  const getFilePath = (filepath) => {
    const imagePath = join(basePath, filepath.getValue());
    if (!fs.existsSync(imagePath)) {
      console.warn('File %s not found', imagePath); //eslint-disable-line no-console
      return false;
    }
    return imagePath;
  };

  function imageUrlFn(filepath) {
    const imagePath = getFilePath(filepath);
    if (imagePath) {
      let imageUrl = imagePath.replace(basePath, publicPath);

      if (!production) {
        imageUrl += '?' + Date.now();
      }
      return new types.String("url('" + imageUrl + "')");
    }
    return null;
  }

  return {
    'build-env()': function buildEnv() {
      return new types.String(production ? 'production' : 'development');
    },
    'map-to-JSON($map)': function toJSON(map) {
      const obj = {};
      for (let i = 0; i < map.getLength(); i += 1) {
        const key = map
          .getKey(i)
          .getValue()
          .toString();
        obj[key] = map.getValue(i).getValue();
      }
      return new types.String(JSON.stringify(obj));
    },

    'image-url($path)': (filepath) => {
      console.warn('"image-url()" is deprecated. Please use "asset-url()"');
      return imageUrlFn(filepath);
    },
    'asset-url($path)': imageUrlFn,
    'image-width($path)': function imageWidth(filepath) {
      const imagePath = getFilePath(filepath);
      if (imagePath) {
        return new types.Number(sizeOf(imagePath).width, 'px');
      }
      return null;
    },
    'image-height($path)': function imageHeight(filepath) {
      const imagePath = getFilePath(filepath);
      if (imagePath) {
        return new types.Number(sizeOf(imagePath).height, 'px');
      }
      return null;
    },
    'inline-image($path)': function inlineImage(filepath) {
      const imagePath = getFilePath(filepath);
      if (imagePath) {
        return new types.String("url('" + datauri(imagePath) + "')");
      }
      return null;
    },
  };
};
