#!/usr/bin/env node
/**
 * Theme Synchronization Validator
 * Compares theme values across web and mobile apps
 * Ensures both platforms use identical design tokens
 */

const fs = require('fs');
const path = require('path');

const COLORS_FILE = path.join(__dirname, 'theme', 'colors.json');
const WEB_CSS_FILE = path.join(__dirname, 'app', 'globals.css');
const MOBILE_THEME_FILE = path.join(__dirname, 'GroceryMob_app', 'services', 'theme.js');

console.log('\n='.repeat(60));
console.log('🎨 THEME SYNCHRONIZATION VALIDATOR');
console.log('='.repeat(60));

// Load the source of truth
const colors = JSON.parse(fs.readFileSync(COLORS_FILE, 'utf-8'));

// Expected mappings from colors.json to globals.css
const expectedWebVariables = {
  '--bg': colors.light.background,
  '--surface': colors.light.surface,
  '--fg': colors.light.foreground,
  '--muted': colors.light.muted,
  '--border': colors.light.border,
  '--g-from': colors.brand.primary.from,
  '--g-to': colors.brand.primary.to,
  '--g-accent': colors.brand.primary.accent,
  '--orange': colors.brand.accent.orange,
  '--yellow': colors.brand.accent.yellow,
  '--radius-card': colors.radius.card,
  '--radius-btn': colors.radius.button,
};

const expectedDarkVariables = {
  '--bg': colors.dark.background,
  '--surface': colors.dark.surface,
  '--fg': colors.dark.foreground,
  '--muted': colors.dark.muted,
  '--border': colors.dark.border,
};

// Read web CSS
const webCss = fs.readFileSync(WEB_CSS_FILE, 'utf-8');

// Check light mode variables
console.log('\n📋 Checking Light Mode Variables in globals.css...');
let lightModeValid = true;
Object.entries(expectedWebVariables).forEach(([varName, expectedValue]) => {
  const regex = new RegExp(`${varName}\\s*:\\s*([^;]+);`);
  const match = webCss.match(regex);
  if (!match) {
    console.log(`  ❌ Missing: ${varName}`);
    lightModeValid = false;
  } else {
    const actualValue = match[1].trim();
    if (actualValue === expectedValue) {
      console.log(`  ✅ ${varName}: ${actualValue}`);
    } else {
      console.log(`  ❌ ${varName}: Expected ${expectedValue}, got ${actualValue}`);
      lightModeValid = false;
    }
  }
});

// Check dark mode variables
console.log('\n📋 Checking Dark Mode Variables in globals.css...');
let darkModeValid = true;
const darkModeSection = webCss.match(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?:root \{([\s\S]*?)\}/)[1];
Object.entries(expectedDarkVariables).forEach(([varName, expectedValue]) => {
  const regex = new RegExp(`${varName}\\s*:\\s*([^;]+);`);
  const match = darkModeSection.match(regex);
  if (!match) {
    console.log(`  ❌ Missing: ${varName}`);
    darkModeValid = false;
  } else {
    const actualValue = match[1].trim();
    if (actualValue === expectedValue) {
      console.log(`  ✅ ${varName}: ${actualValue}`);
    } else {
      console.log(`  ❌ ${varName}: Expected ${expectedValue}, got ${actualValue}`);
      darkModeValid = false;
    }
  }
});

// Check mobile theme
console.log('\n📋 Checking Mobile Theme Imports in theme.js...');
const mobileTheme = fs.readFileSync(MOBILE_THEME_FILE, 'utf-8');
const expectedMobileImports = [
  { import: 'colors.brand.primary.from', expected: colors.brand.primary.from },
  { import: 'colors.brand.primary.to', expected: colors.brand.primary.to },
  { import: 'colors.light.background', expected: colors.light.background },
  { import: 'colors.light.surface', expected: colors.light.surface },
  { import: 'colors.light.foreground', expected: colors.light.foreground },
  { import: 'colors.light.muted', expected: colors.light.muted },
  { import: 'colors.light.border', expected: colors.light.border },
  { import: 'colors.dark.background', expected: colors.dark.background },
  { import: 'colors.dark.surface', expected: colors.dark.surface },
];

let mobileValid = true;
expectedMobileImports.forEach(({ import: importPath, expected }) => {
  if (mobileTheme.includes(importPath)) {
    console.log(`  ✅ ${importPath}`);
  } else {
    console.log(`  ❌ Missing: ${importPath}`);
    mobileValid = false;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SYNCHRONIZATION SUMMARY');
console.log('='.repeat(60));

const allValid = lightModeValid && darkModeValid && mobileValid;

console.log(`\n✅ Light Mode:  ${lightModeValid ? 'SYNCED' : 'OUT OF SYNC'}`);
console.log(`✅ Dark Mode:   ${darkModeValid ? 'SYNCED' : 'OUT OF SYNC'}`);
console.log(`✅ Mobile App:  ${mobileValid ? 'SYNCED' : 'OUT OF SYNC'}`);

console.log('\n' + (allValid ? '✅ ALL THEMES ARE SYNCHRONIZED!' : '❌ THEME SYNCHRONIZATION ISSUES DETECTED'));
console.log('='.repeat(60) + '\n');

// Source information
console.log('📁 Theme Source Files:');
console.log(`  • Master Theme: ${COLORS_FILE}`);
console.log(`  • Web CSS: ${WEB_CSS_FILE}`);
console.log(`  • Mobile Theme: ${MOBILE_THEME_FILE}`);
console.log('\n💡 To update theme: Edit theme/colors.json and restart both dev servers\n');

process.exit(allValid ? 0 : 1);
