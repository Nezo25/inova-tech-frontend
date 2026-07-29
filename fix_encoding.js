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
  // Check if it contains corrupted characters
  if (content.includes('Ã')) {
    // Restore the double-encoded UTF-8
    let fixedContent = Buffer.from(content, 'binary').toString('utf8');
    // But wait, what if it was interpreted as Windows-1252 instead of latin1? 
    // Buffer 'binary' is latin1. Windows-1252 is slightly different but mostly same.
    // Let's manually replace the common ones just to be safe if buffer doesn't work perfectly.
    const map = {
      'Ã­': 'í',
      'Ã§': 'ç',
      'Ã³': 'ó',
      'Ã£': 'ã',
      'Ãª': 'ê',
      'Ãµ': 'õ',
      'Ã¡': 'á',
      'Ã©': 'é',
      'Ã¢': 'â',
      'Ãº': 'ú',
      'Ã§Ã£o': 'ção',
      'Ã§Ãµes': 'ções',
      'Ãº': 'ú',
      'Ã': 'í' // fallback
    };
    
    let isCorrupted = false;
    for (let key in map) {
        if (content.includes(key)) isCorrupted = true;
    }
    
    if(isCorrupted) {
        // Try buffer method first, if it produces replacement character , then use manual
        let tryBuffer = Buffer.from(content, 'binary').toString('utf8');
        if (tryBuffer.includes('')) {
             for (let key in map) {
                content = content.split(key).join(map[key]);
             }
             fs.writeFileSync(f, content, 'utf8');
        } else {
             fs.writeFileSync(f, tryBuffer, 'utf8');
        }
        console.log('Fixed encoding in', f);
    }
  }
});
