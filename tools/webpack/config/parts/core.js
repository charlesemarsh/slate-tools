const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SlateConfig = require('@shopify/slate-config');
const SlateSectionsPlugin = require('@shopify/slate-sections-plugin');
const config = new SlateConfig(require('../../../../slate-tools.schema'));
const injectLocalesIntoSettingsSchema = require('../utilities/inject-locales-into-settings-schema');

const extractLiquidStyles = new MiniCssExtractPlugin({
  filename: '[name].styleLiquid.scss.liquid',
  chunkFilename: '[name].styleLiquid.scss.liquid',
});

module.exports = {
  context: config.get('paths.theme.src'),

  output: {
    filename: '[name].js',
    path: config.get('paths.theme.dist.assets'),
    jsonpFunction: 'shopifySlateJsonp',
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, '../../../../node_modules'),
      path.resolve(__dirname, '../../../../../../node_modules'),
      path.resolve(__dirname, '../../'),
      path.join(config.get('paths.theme'), 'node_modules'),
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: config.get('webpack.commonExcludes'),
        loader: 'hmr-alamo-loader',
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2|otf)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: config.get('webpack.commonExcludes'),
        use: [
          {loader: 'file-loader', options: {name: '[name].[ext]'}},
          {loader: 'img-loader'},
        ],
      },
      {
        test: /\.(liquid|json)$/,
        exclude: [
          /(css|scss|sass)\.liquid$/,
          ...config.get('webpack.commonExcludes'),
        ],
        loader: 'file-loader',
        options: {
          name: '../[path][name].[ext]',
        },
      },
      {
        test: /(css|scss|sass)\.liquid$/,
        exclude: config.get('webpack.commonExcludes'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // only enable hot in development
              hmr: process.env.NODE_ENV === 'development',
              // if hmr does not work, this is a forceful method.
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin({
      root: config.get('paths.theme'),
    }),

    extractLiquidStyles,

    new CopyWebpackPlugin({
      patterns: [
        {
          from: config.get('paths.theme.src.assets'),
          to: config.get('paths.theme.dist.assets'),
          flatten: true,
        },
        {
          from: config.get('paths.theme.src.config'),
          to: config.get('paths.theme.dist.config'),
          globOptions: {
            ignore: ['locales/*.json']
          },
          transform(content, filePath) {
            return injectLocalesIntoSettingsSchema(content, filePath);
          },
        },
        {
          from: config.get('paths.theme.src.layout'),
          to: config.get('paths.theme.dist.layout'),
        },
        {
          from: config.get('paths.theme.src.locales'),
          to: config.get('paths.theme.dist.locales'),
        },
        {
          from: config.get('paths.theme.src.snippets'),
          to: config.get('paths.theme.dist.snippets'),
        },
        {
          from: config.get('paths.theme.src.templates'),
          to: config.get('paths.theme.dist.templates'),
        }
      ],
      options: {

      }
    }),

    new SlateSectionsPlugin({
      from: config.get('paths.theme.src.sections'),
      to: config.get('paths.theme.dist.sections'),
    }),
  ],
};
