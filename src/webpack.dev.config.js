require('babel-register');

import webpack from 'webpack';
import deepAssign from 'deep-assign';

import gulpOptionsBuilder from './gulp-options-builder';
const options = gulpOptionsBuilder();

const env = deepAssign({}, options.env, {
  __DEV_MODE__: true,
  NODE_ENV: '"development"'
});

delete options.webpack.entry;
const config = deepAssign({
  entry: [
    'webpack-dev-server/client/index.js?http://' + (options.devServerHost || 'localhost') + ':' + (options.devServerPort || '8080'),
    'webpack/hot/dev-server',
    './' + options.mainJs
  ],

  output: {
    filename: 'index.js',
    path: options.dist,
    publicPath: '/'
  },

  devtool: 'eval'

}, options.webpack);

// Ensure dev loaders are used.
config.module.loaders = config.module.loaders.map(loader => {
  if (loader.test.test('.jsx')) {
    loader.loader = `react-hot!babel`;
  } else if (loader.test.test('.scss')) {
    // returns style!css?sourceMap!sass?sourceMap&outputStyle...
    loader.loader = loader.loader.replace(/css/, 'css?sourceMap');
    loader.loader = loader.loader.replace(/(outputStyle)/, 'sourceMap&$1');
  }

  return loader;
});

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.DefinePlugin(env)
];

if (options.webpack.plugins) {
  options.webpack.plugins.forEach((plugin) =>
    config.plugins.push(plugin)
  );
}

config.resolve.extensions = deepAssign(
  config.resolve.extensions || [],
  ['', '.js', '.json', '.htm', '.html', '.scss', '.md', '.svg']
);

config.resolve.modulesDirectories = deepAssign(
  config.resolve.modulesDirectories || [],
  ['node_modules/grommet/node_modules', 'node_modules']
);

config.resolveLoader.modulesDirectories = deepAssign(
  config.resolveLoader.modulesDirectories || [],
  ['node_modules/grommet/node_modules', 'node_modules']
);

export default config;
module.exports = config;
