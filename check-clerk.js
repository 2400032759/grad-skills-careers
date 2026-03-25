const clerk = require('@clerk/nextjs');
const { useSignIn, useSignUp, useClerk } = clerk;
// Check what's exported
console.log('Has useClerk:', !!useClerk);
console.log('Has useSignIn:', !!useSignIn);

// Check resource types via node_modules
const fs = require('fs');
const path = require('path');
// Find the types
const typeFiles = [];
function walk(dir) {
  try {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      if (e.endsWith('.d.ts') && (e.includes('signIn') || e.includes('SignIn') || e.includes('sign-in'))) {
        typeFiles.push(full);
      }
    }
  } catch {}
}
walk('node_modules/@clerk/nextjs/dist');
walk('node_modules/@clerk/clerk-js/dist');
console.log('Type files:', typeFiles.slice(0, 5));
