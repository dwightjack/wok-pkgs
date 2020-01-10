import app from './app';

app();

if (module.hot) {
  module.hot.accept('./app.js', () => {
    // eslint-disable-next-line global-require
    require('./app').default();
  });
}
