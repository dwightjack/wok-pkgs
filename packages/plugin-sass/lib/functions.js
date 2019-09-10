module.exports = function sassFunctions({ production, target, publicPath }) {
  const { resolve } = require('path');
  const fs = require('fs');
  const sizeOf = require('image-size');
  const datauri = require('datauri').sync;
  const { types } = require('node-sass');

  function getFilePath(filepath) {
    const imagePath = resolve(process.cwd(), filepath.getValue());
    if (!fs.existsSync(imagePath)) {
      console.warn(`File  ${imagePath} not found`);
      return false;
    }
    return imagePath;
  }

  function imageUrlFn(filepath) {
    let imageUrl = `${publicPath}/${filepath.getValue()}`.replace(/\/+/g, '/');

    if (!production) {
      imageUrl += '?' + Date.now();
    }
    return new types.String(`url('${imageUrl}')`);
  }

  function encodeSVG(str) {
    return str
      .replace(
        '<svg',
        str.includes('xmlns')
          ? '<svg'
          : '<svg xmlns="http://www.w3.org/2000/svg"',
      )
      .replace(/'/g, '"')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/&/g, '%26')
      .replace(/#/g, '%23');
  }

  return {
    'build-env()': function buildEnv() {
      return new types.String(production ? 'production' : 'development');
    },
    'target-env()': function targetEnv() {
      return new types.String(target);
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
        if (imagePath.endsWith('.svg')) {
          const contents = fs.readFileSync(imagePath, 'utf8');
          return new types.String(
            `url('data:image/svg+xml;charset=utf8,${encodeSVG(contents)}')`,
          );
        }
        return new types.String(`url('${datauri(imagePath)}')`);
      }
      return null;
    },
  };
};
