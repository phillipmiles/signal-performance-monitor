const fs = require('fs');

const createJSExportFile = (contentString, distFilePath) => {
  // The newline character (\n) is just to satisfy prettify. Not actually needed.
  const js = `export default ${contentString};\n`;
  fs.writeFileSync(`${distFilePath}`, js);
};

// Takes the contents of srcFilePath and turns it into an exportable string from a
// javascript file of which it creates at distFilePath.
const convertFileContentsToJSExportFile = (srcFilePath, distFilePath) => {
  const bundle = fs.readFileSync(srcFilePath, 'utf8');
  const escaped = JSON.stringify(bundle);
  createJSExportFile(escaped, distFilePath);
};

module.exports = {
  convertFileContentsToJSExportFile,
  createJSExportFile,
};
