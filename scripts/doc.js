const documentation = require('documentation');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = require('make-dir');
const glob = require('fast-glob');
const rimraf = require('rimraf');
const cpy = require('cpy');

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

  // sidebar sorce
  const sidebar = await readAsync(path.join(docs, '_sidebar.md'), 'utf8');

  packages.forEach(packageTraverse);

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

    rimraf.sync(dest);

    await mkdir(dest);
    await mkdir(destApi);

    if (!fs.existsSync(docsFolder)) {
      await cpy(['README.md', 'images/**/*.*'], dest, {
        parents: true,
        cwd: baseFolder,
      });
      console.log('-> Base documentation copied!');
    } else {
      await cpy(['**/*.*', '!_sidebar.partial.md'], dest, {
        parents: true,
        cwd: docsFolder,
      });

      //compose a custom sidebar
      if (fs.existsSync(path.join(docsFolder, '_sidebar.partial.md'))) {
        let partial = await readAsync(
          path.join(docsFolder, '_sidebar.partial.md'),
          'utf8',
        );
        partial = partial.trim().replace(/^/gm, '  ');
        partial = sidebar.replace(`  <!-- guides:${pkg.name} -->`, partial);
        await writeAsync(path.join(dest, '_sidebar.md'), partial, 'utf8');
      }
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

    // generate API
    const files = await glob('{lib/,tasks/,}*.js', {
      cwd: baseFolder,
      absolute: true,
    });

    const moduleLinks = files
      .map((f) => {
        const base = path.basename(f, '.js');
        let dirname = path.relative(baseFolder, path.dirname(f));
        if (dirname.length > 0) {
          dirname += '/';
        }
        return ` - [${dirname}${base}](packages/${package}/api/${base})`;
      })
      .join('\n');

    //create a readme
    const readme = `
  # ${pkg.name}

  ### Exposed modules

  ${moduleLinks}
  `.trim();

    await writeAsync(path.join(destApi, 'README.md'), readme, 'utf8');

    // create a custom sidebar

    await writeAsync(
      path.join(destApi, '_sidebar.md'),
      sidebar.replace(`<!-- ${pkg.name} -->`, moduleLinks.trim()),
      'utf8',
    );

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
