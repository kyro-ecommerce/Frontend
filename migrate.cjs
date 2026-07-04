const fs = require('fs');
const path = require('path');

const adminSrc = path.resolve('d:/TTTN/FrontEnd-Admin/src');
const customerSrc = path.resolve('d:/TTTN/FrontEnd-Customer/src');
const destSrc = path.resolve('d:/TTTN/Frontend/src');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const fileMap = new Map(); // old absolute path -> new absolute path

function addMapping(oldAbs, newAbs) {
    fileMap.set(oldAbs.replace(/\\/g, '/'), newAbs.replace(/\\/g, '/'));
}

function scanAdmin() {
    const walk = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else {
                let rel = path.relative(adminSrc, fullPath).replace(/\\/g, '/');
                let newRel = '';

                if (rel === 'AppRouter.jsx') newRel = 'routes/admin/AppRouter.jsx';
                else if (rel === 'main.jsx') newRel = null; // Skip main.jsx from admin, use frontend's
                else if (rel.startsWith('components/layout/')) newRel = rel.replace('components/layout/', 'layouts/admin/');
                else if (rel.startsWith('components/features/')) newRel = rel.replace('components/features/', 'features/admin/');
                else if (rel.startsWith('components/')) newRel = rel.replace('components/', 'components/admin/');
                else if (rel.startsWith('contexts/')) newRel = rel.replace('contexts/', 'store/admin/');
                else if (rel.startsWith('hooks/')) newRel = rel.replace('hooks/', 'hooks/admin/');
                else if (rel.startsWith('pages/')) newRel = rel.replace('pages/', 'pages/admin/');
                else if (rel.startsWith('services/')) newRel = rel.replace('services/', 'services/admin/');
                else if (rel.startsWith('styles/')) newRel = rel.replace('styles/', 'assets/admin/styles/');
                else if (rel.startsWith('utils/')) newRel = rel.replace('utils/', 'utils/admin/');
                else newRel = rel; // fallback

                if (newRel) {
                    addMapping(fullPath, path.join(destSrc, newRel));
                }
            }
        }
    };
    walk(adminSrc);
}

function scanCustomer() {
    const walk = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else {
                let rel = path.relative(customerSrc, fullPath).replace(/\\/g, '/');
                let newRel = '';

                if (rel === 'App.jsx') newRel = 'routes/user/AppUser.jsx';
                else if (rel === 'main.jsx' || rel === 'vite-env.d.ts') newRel = null; // Skip
                else if (rel.startsWith('Routers/')) newRel = rel.replace('Routers/', 'routes/user/');
                else if (rel.startsWith('components/layout/')) newRel = rel.replace('components/layout/', 'layouts/user/');
                else if (rel.startsWith('components/features/')) newRel = rel.replace('components/features/', 'features/user/');
                else if (rel.startsWith('components/')) newRel = rel.replace('components/', 'components/user/');
                else if (rel.startsWith('contexts/')) newRel = rel.replace('contexts/', 'store/user/');
                else if (rel.startsWith('hooks/')) newRel = rel.replace('hooks/', 'hooks/user/');
                else if (rel.startsWith('pages/')) newRel = rel.replace('pages/', 'pages/user/');
                else if (rel.startsWith('services/')) newRel = rel.replace('services/', 'services/user/');
                else if (rel.startsWith('assets/')) newRel = rel.replace('assets/', 'assets/user/');
                else if (rel.startsWith('config/')) newRel = rel.replace('config/', 'config/user/');
                else newRel = rel;

                if (newRel) {
                    addMapping(fullPath, path.join(destSrc, newRel));
                }
            }
        }
    };
    walk(customerSrc);
}

scanAdmin();
scanCustomer();

// Now perform the copy and transform
for (const [oldAbs, newAbs] of fileMap.entries()) {
    ensureDir(path.dirname(newAbs));

    if (oldAbs.endsWith('.js') || oldAbs.endsWith('.jsx')) {
        let content = fs.readFileSync(oldAbs, 'utf8');
        const oldDir = path.posix.dirname(oldAbs);
        const newDir = path.posix.dirname(newAbs);

        const importRegex = /(import\s+.*?(?:from\s+)?['"])([^'"]+)(['"])/g;
        
        content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
            if (!importPath.startsWith('.')) return match;

            let targetOldPath = path.posix.join(oldDir, importPath);
            
            // Try to find the exact target or target with extension
            let foundTarget = fileMap.get(targetOldPath) || 
                              fileMap.get(targetOldPath + '.js') || 
                              fileMap.get(targetOldPath + '.jsx') ||
                              fileMap.get(targetOldPath + '.css');
            
            // Handle folder imports (index.js)
            if (!foundTarget) {
                foundTarget = fileMap.get(path.posix.join(targetOldPath, 'index.js')) ||
                              fileMap.get(path.posix.join(targetOldPath, 'index.jsx'));
            }

            if (foundTarget) {
                let newImportPath = path.posix.relative(newDir, foundTarget);
                if (!newImportPath.startsWith('.')) {
                    newImportPath = './' + newImportPath;
                }

                if (!importPath.endsWith('.js') && !importPath.endsWith('.jsx') && !importPath.endsWith('.css') && !importPath.endsWith('.svg') && !importPath.endsWith('.png') && !importPath.endsWith('.jpg')) {
                    newImportPath = newImportPath.replace(/\.jsx?$/, '');
                }

                return prefix + newImportPath + suffix;
            }

            return match;
        });

        fs.writeFileSync(newAbs, content, 'utf8');
    } else {
        fs.copyFileSync(oldAbs, newAbs);
    }
}

console.log("Migration and import update complete!");
