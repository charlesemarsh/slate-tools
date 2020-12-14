const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const SlateConfig = require('@shopify/slate-config');

const core = require('./parts/core');
const babel = require('./parts/babel');
const entry = require('./parts/entry');
const sass = require('./parts/sass');
const css = require('./parts/css');
const srcPath = path.join(__dirname, 'src');

const getLayoutEntrypoints = require('./utilities/get-layout-entrypoints');
const getTemplateEntrypoints = require('./utilities/get-template-entrypoints');
const HtmlWebpackIncludeLiquidStylesPlugin = require('../html-webpack-include-chunks');
const config = new SlateConfig(require('../../../slate-tools.schema'));

// add hot-reload related code to entry chunks
Object.keys(entry.entry).forEach((name) => {
  entry.entry[name] = [path.join(__dirname, '../hot-client.js')].concat(
    entry.entry[name],
  );
});

module.exports = merge([
  core,
  entry,
  babel,
  sass,
  css,
  {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),

      new HtmlWebpackPlugin({
        excludeChunks: ['static'],
        context: srcPath,
        output: {
          path: path.join(__dirname, "../dist"),
          filename: `../snippets/script-tags.liquid`,
        },
        template: path.resolve(__dirname, '../script-tags.html'),
        inject: true,
        minify: {
          removeComments: true,
          removeAttributeQuotes: false,
          collapseWhitespace: true,
        },
        isDevServer: true,
        liquidTemplates: getTemplateEntrypoints(),
        liquidLayouts: getLayoutEntrypoints(),
      }),

      new HtmlWebpackPlugin({
        excludeChunks: ['static'],
        filename: `../snippets/style-tags.liquid`,
        template: path.resolve(__dirname, '../style-tags.html'),
        inject: true,
        minify: {
          removeComments: true,
          removeAttributeQuotes: false,
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        isDevServer: true,
        liquidTemplates: getTemplateEntrypoints(),
        liquidLayouts: getLayoutEntrypoints(),
      }),

      new HtmlWebpackIncludeLiquidStylesPlugin(),
    ],
  },
  config.get('webpack.extend'),
]);
