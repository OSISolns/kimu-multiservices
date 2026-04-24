import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes('/login') && !dirPath.includes('/logout')) {
         walkDir(dirPath, callback);
      }
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
  if (content.includes('bg-white ')) {
      let newContent = content;

      // Replace bg-white cards with custom utility chains
      // Regex looks for className="... bg-white ... p-6 ... rounded-* ..."
      newContent = newContent.replace(/bg-white\s+p-6\s+rounded-2xl\s+shadow-sm\s+border\s+border-gray-100/g, "bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60");
      newContent = newContent.replace(/bg-white\s+p-4\s+rounded-xl\s+shadow-sm\s+border\s+border-gray-100\/80/g, "bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-gray-200/50 border border-white/60");
      newContent = newContent.replace(/bg-gray-100\s+rounded-xl\s+p-4/g, "bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm");
      
      if(newContent !== content) {
         fs.writeFileSync(filePath, newContent, 'utf8');
         console.log(`Upgraded nuanced UI for ${path.relative(process.cwd(), filePath)}`);
         updateCount++;
      }
  }
});

console.log(`Successfully upgraded nuanced UI on ${updateCount} files.`);
