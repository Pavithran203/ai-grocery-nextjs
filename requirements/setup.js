const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI Escape codes for pretty colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function logHeader(message) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✔ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✘ ${message}${colors.reset}`);
}

function checkNodeVersion() {
  logHeader('Checking System Prerequisites');
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
    
    console.log(`Detected Node.js version: ${colors.bright}${nodeVersion}${colors.reset}`);
    
    if (majorVersion < 18) {
      logWarning('Node.js version is lower than recommended (v18+). You may encounter dependency issues.');
    } else {
      logSuccess('Node.js version is compatible.');
    }
  } catch (err) {
    logError('Could not verify Node.js version.');
  }
}

function setupEnvironmentFiles() {
  logHeader('Setting up Environment Files');
  
  const rootDir = path.resolve(__dirname, '..');
  
  // 1. Next.js Web App .env.local
  const webEnvPath = path.join(rootDir, '.env.local');
  const webEnvTemplate = path.join(__dirname, 'env-templates', 'frontend.env.example');
  
  if (!fs.existsSync(webEnvPath)) {
    if (fs.existsSync(webEnvTemplate)) {
      fs.copyFileSync(webEnvTemplate, webEnvPath);
      logSuccess('Created root frontend .env.local from template.');
    } else {
      logError('Frontend environment template not found.');
    }
  } else {
    logWarning('root frontend .env.local already exists. Skipping copy to prevent overwriting.');
  }
  
  // 2. Express Backend .env
  const backendEnvPath = path.join(rootDir, 'GroceryMob_backend', 'backend', '.env');
  const backendEnvTemplate = path.join(__dirname, 'env-templates', 'backend.env.example');
  
  if (!fs.existsSync(backendEnvPath)) {
    if (fs.existsSync(backendEnvTemplate)) {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(backendEnvPath), { recursive: true });
      fs.copyFileSync(backendEnvTemplate, backendEnvPath);
      logSuccess('Created backend .env from template.');
    } else {
      logError('Backend environment template not found.');
    }
  } else {
    logWarning('backend .env already exists. Skipping copy to prevent overwriting.');
  }
}

function installDirectoryDependencies(dirName, relativePath) {
  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.join(rootDir, relativePath);
  
  logHeader(`Installing Dependencies for: ${dirName}`);
  
  if (!fs.existsSync(targetDir)) {
    logError(`Directory not found: ${relativePath}`);
    return;
  }
  
  console.log(`Navigating to: ${colors.blue}${relativePath}${colors.reset}`);
  console.log('Running: npm install...');
  
  try {
    execSync('npm install --legacy-peer-deps', {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });
    logSuccess(`Successfully installed dependencies in ${relativePath}`);
  } catch (err) {
    logError(`Failed to install dependencies in ${relativePath}. Error: ${err.message}`);
  }
}

// Main Runner
function run() {
  console.log(`\n${colors.bright}${colors.green}=========================================`);
  console.log('       NEARMART DEVELOPMENT SETUP        ');
  console.log(`=========================================${colors.reset}\n`);
  
  checkNodeVersion();
  setupEnvironmentFiles();
  
  // Install for root (Web Frontend)
  installDirectoryDependencies('Next.js Web Frontend (Root)', '.');
  
  // Install for backend
  installDirectoryDependencies('Express.js Backend', 'GroceryMob_backend/backend');
  
  // Install for mobile app
  installDirectoryDependencies('Expo Mobile Application', 'GroceryMob_app');
  
  logHeader('Setup Complete!');
  console.log(`${colors.bright}${colors.green}All dependencies installed and environments configured!${colors.reset}`);
  console.log(`\nTo run the projects:\n`);
  console.log(`  ${colors.bright}Next.js Frontend:${colors.reset} npm run dev`);
  console.log(`  ${colors.bright}Express Backend:${colors.reset}  npm run backend`);
  console.log(`  ${colors.bright}Expo Mobile App:${colors.reset}  cd GroceryMob_app && npx expo start`);
  console.log('\n=========================================\n');
}

run();
