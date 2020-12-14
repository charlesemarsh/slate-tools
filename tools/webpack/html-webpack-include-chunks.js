class HtmlWebpackIncludeLiquidStylesPlugin {
  constructor(options) {
    this.options = options;
    this.files = [];
    this.chunks = [];
  }

  apply(compiler) {
    compiler.hooks.emit.tap("ChunksFromEntryPlugin", compilation => {
      const stats = compilation.getStats().toJson();

      compilation.hooks.htmlWebpackPluginAlterChunks.tap(
        "htmlWebpackIncludeChunksPlugin",
        (_, { plugin }) => {
          // takes entry name passed via HTMLWebpackPlugin's options
          const entry = plugin.options.entry;

          this.chunks = stats.entrypoints[entry].chunks
        }
      );
    });
    compiler.hooks.compilation.tap(
      'htmlWebpackIncludeChunksPlugin',
      this.onCompilation.bind(this),
    );
  }

  onCompilation(compilation) {
    this.compilation = compilation;

    compilation.hooks.htmlWebpackPluginAlterChunks.tap(
      'htmlWebpackIncludeChunksPlugin',
      this.onAlterChunks.bind(this),
    );

    compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(
      'htmlWebpackIncludeChunksPlugin',
      this.onBeforeHtmlGeneration.bind(this),
    );
  }

  onAlterChunks(chunks) {
    
  }

  onBeforeHtmlGeneration(htmlPluginData) {
    const assets = htmlPluginData.assets;
    const publicPath = assets.publicPath;

    this.chunks.forEach((chunk) => {
      const name = chunk.names[0];
      const chunkFiles = []
        .concat(chunk.files)
        .map((chunkFile) => publicPath + chunkFile);

      const css = chunkFiles
        .filter((chunkFile) => /.(css|scss)\.liquid($|\?)/.test(chunkFile))
        .map((chunkFile) => chunkFile.replace(/(\.css)?\.liquid$/, '.css'));

      assets.chunks[name].css = css;
      assets.css = assets.css.concat(css);
    });
  }
}

module.exports = HtmlWebpackIncludeLiquidStylesPlugin;
