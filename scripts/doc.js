const documentation = require('documentation');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = require('make-dir');
const glob = require('fast-glob');
const del = require('del');
const cpy = require('cpy');
const Handlebars = require('handlebars');

Handlebars.registerHelper('ifeq', function ifeq(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);

const root = path.join(__dirname, '..', 'packages');
const docs = path.join(__dirname, '..', 'docs');
const src = path.join(__dirname, '..', '.docs');

const packages = fs
  .readdirSync(root)
  .filter((item) => fs.lstatSync(path.join(root, item)).isDirectory());

function printParams(params) {
  return params
    .map(({ name, type = {} }) =>
      type.type === 'OptionalType' ? `${name}?` : name,
    )
    .join(', ');
}

(async function() {
  //copy some files
  await cpy(['*.*'], docs, {
    parents: true,
    dot: true,
    cwd: src,
  });

  // sidebar source
  const sidebars = {
    core: [],
    tasks: [],
    plugins: [],
    apis: [],
  };

  await Promise.all(packages.map(packageTraverse));

  const sidebar = await readAsync(path.join(docs, '_sidebar.md'), 'utf8');

  const sidebarTmpl = Handlebars.compile(sidebar);

  await writeAsync(
    path.join(docs, '_sidebar.md'),
    sidebarTmpl(sidebars),
    'utf8',
  );

  Object.entries(sidebars).forEach(([key, data]) => {
    data.forEach(({ folder, children, name }) => {
      if (children) {
        writeAsync(
          path.join(folder, '_sidebar.md'),
          sidebarTmpl({ ...sidebars, [`current${key}`]: name }),
          'utf8',
        );
      }
    });
  });

  async function packageTraverse(package) {
    const baseFolder = path.join(root, package);
    const docsFolder = path.join(baseFolder, 'docs');
    const dest = path.join(docs, 'packages', package);
    const destApi = path.join(dest, 'api');
    const pkg = require(path.join(baseFolder, 'package.json'));

    if (!fs.existsSync(path.join(baseFolder, 'README.md'))) {
      console.log(`-> No README.md file in ${package}. Skipping...`);
      return;
    }

    await del(dest);

    await mkdir(dest);
    await mkdir(destApi);

    if (!fs.existsSync(docsFolder)) {
      await cpy(['README.md', 'images/**/*.*'], dest, {
        parents: true,
        cwd: baseFolder,
      });
      console.log('-> Base documentation copied!');
    } else {
      const tasks = [];

      if (!fs.existsSync(path.join(docsFolder, 'README.md'))) {
        tasks.push(
          cpy(['README.md'], dest, {
            cwd: baseFolder,
          }),
        );
      }
      tasks.push(
        cpy(['**/*.*', '!**/_*.*'], dest, {
          parents: true,
          cwd: docsFolder,
        }),
      );

      await Promise.all(tasks);
      console.log('-> Documentation files copied!');
    }

    //add the version number to the main readme
    const readmeFile = path.join(dest, 'README.md');
    const readmeSrc = await readAsync(readmeFile, 'utf8');
    writeAsync(
      readmeFile,
      readmeSrc.replace(/^(# .+)/, `$1 <sub>${pkg.version}<sub>`),
      'utf8',
    );

    const guide = {
      name: pkg.name,
      url: `packages/${package}/`,
      folder: dest,
    };

    // add to the guide list
    const summary = path.join(docsFolder, '_summary.js');
    if (fs.existsSync(summary)) {
      guide.children = require(summary);
    }

    if (package.includes('task-')) {
      sidebars.tasks.push(guide);
    } else if (package.includes('plugin-')) {
      sidebars.plugins.push(guide);
    } else {
      sidebars.core.push(guide);
    }

    // generate API
    const files = await glob('{lib/,tasks/,}*.js', {
      cwd: baseFolder,
      absolute: true,
    });

    const modules = files.map((f) => {
      const base = path.basename(f, '.js');
      let dirname = path.relative(baseFolder, path.dirname(f));
      if (dirname.length > 0) {
        dirname += '/';
      }
      return { name: dirname + base, url: `packages/${package}/api/${base}` };
    });

    sidebars.apis.push({
      ...guide,
      folder: destApi,
      children: modules,
    });

    const moduleLinks = modules.map(({ name, url }) => `- [${name}](${url})`);

    //create a readme
    const readme = `
  # ${pkg.name}

### Exposed modules

${moduleLinks.join('\n')}
  `.trim();

    await writeAsync(path.join(destApi, 'README.md'), readme, 'utf8');

    const renders = files.map(async (file) => {
      const basename = path.basename(file, '.js');
      const filepath = path.join(destApi, `${basename}.md`);

      try {
        const raw = await documentation.build(file, {
          shallow: true,
        });

        raw.forEach((part) => {
          if (part.scope === 'static') {
            part.name = `<static> ${part.name}`;
          }
          if (part.kind === 'function') {
            const params = printParams(part.params);
            part.name += `(${params})`;
          }
          if (part.members) {
            part.members.static.concat(part.members.instance).forEach((m) => {
              if (m.kind === 'function') {
                const params = printParams(m.params);
                m.name += `(${params})`;
              }
            });
          }
        });

        let output = await documentation.formats.md(raw);

        // output = output.replace(/^##/gm, '#');
        output = output.replace(/^## Parameters/gm, '### Parameters');

        await writeAsync(filepath, output);
        console.log(`-> File ${filepath} generated.`);
      } catch (e) {
        console.error(e);
      }
    });

    await Promise.all(renders);
    console.log(`Documentation build complete for ${package}!`);
  }
})();
