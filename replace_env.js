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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('192.168.1.11:8080')) {
    content = content.replace(/(["'`])http:\/\/192\.168\.1\.11:8080(.*?)(\1)/g, function(match, quote, pathPart) {
        return '`${process.env.NEXT_PUBLIC_API_URL}' + pathPart + '`';
    });
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
