import * as fs from 'fs';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Package name: ', (name) => {
  rl.question('Package description: ', (desc) => {
    // Update README
    let readme = fs.readFileSync('README.md').toString();
    readme = readme.replace(/<PACKAGE_NAME>/g, name);
    readme = readme.replace(/<PACKAGE_DESCRIPTION>/g, desc);
    fs.writeFileSync('README.md', readme);

    // Update mkdocs
    let mkdocs = fs.readFileSync('mkdocs.yml').toString();
    mkdocs = mkdocs.replace(/<PACKAGE_NAME>/g, name);
    mkdocs = mkdocs.replace(/<PACKAGE_DESCRIPTION>/g, desc);
    mkdocs = mkdocs.replace(/<REPO_NAME>/g, name.replace('_', '-'));
    fs.writeFileSync('mkdocs.yml', mkdocs);

    // Update package.json
    let data = fs.readFileSync('package.json').toString();
    data = data.replace(/<PACKAGE_NAME>/g, name);
    data = data.replace(/<REPO_NAME>/g, name.replace('_', '-'));
    data = data.replace(/<PACKAGE_DESCRIPTION>/g, desc);
    data = data.replace('    "init": "node scripts/init.js",\n', '');
    fs.writeFileSync('package.json', data);
    rl.close();
  });
});
