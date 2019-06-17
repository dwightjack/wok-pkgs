const { createPlugin } = require('wok-core/utils');

const nunjucksEnv = (viewPath, options) => {
  const nunjucks = require('nunjucks');
  const marked = require('marked');
  const Markdown = require('nunjucks-markdown/lib/markdown_tag');
  const env = nunjucks.configure(viewPath, {
    noCache: true,
    ...options,
  });

  const markdownTag = new Markdown(env, marked);

  markdownTag.fileTag = (context, file) => {
    return new nunjucks.runtime.SafeString(marked(env.render(file, context)));
  };

  // Markdown rendering for the block. Pretty simple, just get the body text and pass
  // it through the markdown renderer.
  markdownTag.blockTag = (context, bodFn, tabStartFn) => {
    let body = bodFn(); //eslint-disable-line no-var
    const tabStart = tabStartFn(); // The column options of the {% markdown %} tag.

    if (tabStart > 0) {
      // If the {% markdown %} tag is tabbed in, normalize the content to the same depth.
      body = body.split(/\r?\n/); // Split into lines.
      // Subtract the column options from the start of the string.
      body = body.map((line) => line.slice(tabStart));
      body = body.join('\n'); // Rejoin into one string.
    }

    return new nunjucks.runtime.SafeString(marked(body));
  };

  env.addExtension('markdown', markdownTag);

  return env;
};

function nunjucks(engines, env, api, opts) {
  return engines.set('nunjucks', function createRenderer() {
    let _env;

    const { root, helpers, ...options } = opts;

    return {
      name: 'nunjucks',
      test: /\.(njk|nunjucks)$/,
      render(string, locals) {
        try {
          // lazy load renderer
          if (!_env) {
            _env = nunjucksEnv(root && api.pattern(root), options);
            _env.addGlobal(
              'helpers',
              typeof helpers === 'function' ? helpers(options) : {},
            );
            _env.addGlobal('_', require('lodash'));
            _env.addGlobal('faker', require('faker'));
          }
          return _env.renderString(string, locals);
        } catch (e) {
          console.error(e);
        }
      },
    };
  });
}

module.exports = createPlugin({
  name: 'nunjucks',
  plugin: nunjucks,
});
