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

function refineTailwind(content) {
  let newContent = content;

  // Improve generic page background if not already using the prism svg
  if (!newContent.includes('bg-[url') && newContent.match(/min-h-screen\s+bg-gray-50/)) {
      newContent = newContent.replace(/min-h-screen\s+bg-gray-50/g, "min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex-col");
  }

  // Improve cards and panels
  newContent = newContent.replace(/bg-white\s+rounded-lg\s+shadow-md/g, "bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/60");
  newContent = newContent.replace(/bg-white\s+rounded-lg\s+shadow\b/g, "bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/60");
  newContent = newContent.replace(/bg-white\s+rounded-xl\s+shadow/g, "bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60");
  newContent = newContent.replace(/bg-white\s+shadow/g, "bg-white/90 backdrop-blur-md shadow-xl border border-white/60");
  
  // Specific borders
  newContent = newContent.replace(/border-gray-200/g, "border-gray-100/80");

  // Improve standard inputs
  newContent = newContent.replace(/border-gray-300\s+rounded-lg\s+focus:ring-2\s+focus:ring-blue-500\s+focus:border-transparent/g, "border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300");
  newContent = newContent.replace(/border-gray-300\s+rounded-md\s+focus:ring-blue-500/g, "border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300");

  // Modernize standard primary buttons
  newContent = newContent.replace(/bg-blue-600\s+text-white\s+hover:bg-blue-700/g, "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 active:scale-95");
  newContent = newContent.replace(/bg-green-600\s+text-white\s+hover:bg-green-700/g, "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 active:scale-95");

  // Lists/Rows hover
  newContent = newContent.replace(/hover:bg-gray-50([^/])/g, "hover:bg-blue-50/50 transition-colors$1");

  return newContent;
}

const dirToRefine = path.join(process.cwd(), 'src/app/staff');

let updateCount = 0;
walkDir(dirToRefine, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('bg-')) {
      const refined = refineTailwind(content);
      if(refined !== content) {
         fs.writeFileSync(filePath, refined, 'utf8');
         console.log(`Updated UI for ${path.relative(process.cwd(), filePath)}`);
         updateCount++;
      }
  }
});

console.log(`Successfully upgraded UI on ${updateCount} files in the /staff directory.`);
