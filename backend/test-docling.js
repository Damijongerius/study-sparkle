const { parsePdfWithDocling } = require('./utils/doclingParser');
const path = require('path');
const fs = require('fs');

async function test() {
    // You can put a test PDF in the backend folder or provide a path
    const testPdfPath = process.argv[2];
    
    if (!testPdfPath) {
        console.log('Please provide a path to a PDF file: node test-docling.js <path-to-pdf>');
        return;
    }

    const absolutePath = path.resolve(testPdfPath);
    console.log(`Starting Docling extraction for: ${absolutePath}`);
    console.time('Docling Extraction');

    try {
        const result = await parsePdfWithDocling(absolutePath);
        console.timeEnd('Docling Extraction');
        
        console.log('\n--- Extraction Result (First 500 chars) ---');
        console.log(result.content.substring(0, 500) + '...');
        
        // Save to a markdown file for review
        const outputPath = 'extraction_result.md';
        fs.writeFileSync(outputPath, result.content);
        console.log(`\nFull extraction saved to: ${outputPath}`);
        
    } catch (error) {
        console.error('Extraction failed:', error.message);
    }
}

test();
