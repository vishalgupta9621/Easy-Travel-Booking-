// Simple test script to run the booking seeder
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedScript = join(__dirname, 'src', 'scripts', 'seedBookings.js');

console.log('Running booking seeder...');
exec(`node ${seedScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error running seeder:', error);
    return;
  }
  
  if (stderr) {
    console.error('Seeder stderr:', stderr);
  }
  
  console.log('Seeder output:', stdout);
});
