// File: scripts/increment-build.js
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const buildJsonPath = path.join(projectRoot, 'build-version.json');
const pkgPath = path.join(projectRoot, 'package.json');
const outPath = path.join(projectRoot, 'src', 'buildVersion.ts');

function readInitialVersion() {
    if (fs.existsSync(buildJsonPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(buildJsonPath, 'utf8'));
            if (data && data.version) return String(data.version);
        } catch (_) {}
    }
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.version) return String(pkg.version);
        } catch (_) {}
    }
    return '1.0.0';
}

function incrementLastSegment(version) {
    const parts = version.split('.');
    const lastIdx = parts.length - 1;
    const last = parseInt(parts[lastIdx], 10);
    if (Number.isNaN(last)) {
        parts[lastIdx] = '1';
    } else {
        parts[lastIdx] = String(last + 1);
    }
    return parts.join('.');
}

const current = readInitialVersion();
const next = incrementLastSegment(current);

// persist back to build-version.json
fs.writeFileSync(buildJsonPath, JSON.stringify({ version: next }, null, 2));

// generate TypeScript file that exports the build version
const tsContent = `// generated file — do not edit\nexport const BUILD_VERSION = "${next}";\n`;
fs.writeFileSync(outPath, tsContent);

// log for CI/dev visibility
console.log('Updated build version:', next);
