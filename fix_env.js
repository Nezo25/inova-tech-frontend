const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('${process.env.NEXT_PUBLIC_API_URL}')) {
    content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, '${process.env.NEXT_PUBLIC_API_URL || "https://annually-mounted-carol.ngrok-free.dev"}');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', f);
  }
});
console.log('Done.');
