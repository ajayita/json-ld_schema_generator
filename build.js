#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, 'src');
const distDir = join(__dirname, 'dist');

async function copyFile(src, dest) {
    await fs.mkdir(dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
}

async function copyDirectory(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    await fs.mkdir(dest, { recursive: true });
    
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await copyFile(srcPath, destPath);
        }
    }
}

async function build() {
    console.log('🏗️  Building for Cloudflare Pages...');
    
    // Clean dist directory
    try {
        await fs.rm(distDir, { recursive: true, force: true });
    } catch (err) {
        // Directory doesn't exist, that's fine
    }
    
    // Copy all source files to dist
    await copyDirectory(srcDir, distDir);
    
    // Copy Cloudflare Pages config files
    await copyFile(join(__dirname, '_headers'), join(distDir, '_headers'));
    await copyFile(join(__dirname, '_redirects'), join(distDir, '_redirects'));
    
    // Move index.html to root of dist
    await copyFile(join(distDir, 'index.html'), join(distDir, 'index.html'));
    
    console.log('✅ Build complete! Files ready in ./dist');
    console.log('📁 Deploy the ./dist folder to Cloudflare Pages');
}

build().catch(console.error);