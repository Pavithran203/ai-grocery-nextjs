const fs = require('fs');
const path = require('path');

const colorsPath = path.join(__dirname, '..', 'theme', 'colors.json');
const outPath = path.join(__dirname, '..', 'app', 'theme-vars.css');

function toCssVars(obj, prefix=''){
  let lines = [];
  for(const key of Object.keys(obj)){
    const val = obj[key];
    const name = prefix ? `${prefix}-${key}` : key;
    if(typeof val === 'string'){
      lines.push(`  --${name}: ${val};`);
    } else if(typeof val === 'object'){
      lines = lines.concat(toCssVars(val, name));
    }
  }
  return lines;
}

function build(){
  if(!fs.existsSync(colorsPath)){
    console.error('colors.json not found at', colorsPath);
    process.exit(1);
  }
  const colors = JSON.parse(fs.readFileSync(colorsPath,'utf8'));
  // Light mode
  const lightVars = toCssVars(colors).join('\n');
  // Dark mode - use colors.dark if present
  const darkObj = colors.dark || {};
  const darkVars = toCssVars(darkObj).join('\n');

  const content = `/* GENERATED - Do not edit directly. Run npm run sync-theme */\n:root {\n${lightVars}\n}\n\n@media (prefers-color-scheme: dark) {\n:root {\n${darkVars}\n}\n}\n`;

  fs.writeFileSync(outPath, content, 'utf8');
  console.log('Wrote theme vars to', outPath);
}

build();
