#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting KIMU Transport Development Server with Auto-Updating...');
console.log('📝 Changes to your files will automatically refresh the browser');
console.log('⏳ Starting server...\n');

// Set environment variables for optimal development
process.env.NODE_ENV = 'development';
process.env.FAST_REFRESH = 'true';
process.env.WATCHPACK_POLLING = 'true';
process.env.CHOKIDAR_USEPOLLING = 'true';
process.env.CHOKIDAR_INTERVAL = '1000';

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle process exit
devProcess.on('close', (code) => {
  console.log(`\n🔴 Development server stopped with code ${code}`);
  process.exit(code);
});

// Handle errors
devProcess.on('error', (error) => {
  console.error('❌ Error starting development server:', error);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  devProcess.kill('SIGINT');
});
