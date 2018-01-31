const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  contentBase: 'build/',
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  disableHostCheck: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 100,
  },
}).listen(80, '0.0.0.0', (err, result) => {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost');
});
