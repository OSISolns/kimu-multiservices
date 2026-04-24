import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const dirToRefine = path.join(process.cwd(), 'src/app/staff');

let updateCount = 0;
walkDir(dirToRefine, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Fix layouts where `flex-col flex"` was injected by accident
  newContent = newContent.replace(/flex-col\s+flex"/g, 'flex"');
  
  // Fix layouts where `flex-col flex overflow-x-hidden`
  newContent = newContent.replace(/flex-col\s+flex\s+overflow-x-hidden/g, 'flex overflow-x-hidden');
  
  // Clean up any stray `flex-col"` at the end of class strings
  newContent = newContent.replace(/flex-col"/g, '"');

  if(newContent !== content) {
     fs.writeFileSync(filePath, newContent, 'utf8');
     console.log(`Fixed layout structure for ${path.relative(process.cwd(), filePath)}`);
     updateCount++;
  }
});

console.log(`Successfully fixed layout on ${updateCount} files.`);
