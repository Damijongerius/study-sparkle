const pdfjsLib = require('pdfjs-dist/build/pdf.js');

/**
 * Extracts text and metadata (like font size) from a PDF buffer.
 * @param {Buffer} dataBuffer 
 * @returns {Promise<Array<{text: string, fontSize: number, isBold: boolean}>>}
 */
const extractEnrichedText = async (dataBuffer) => {
    const data = new Uint8Array(dataBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    let enrichedItems = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        textContent.items.forEach(item => {
            // item.transform[0] and [3] are scale factors (often height)
            const fontSize = Math.abs(item.transform[0] || item.transform[3] || 0);
            const isBold = item.fontName ? item.fontName.toLowerCase().includes('bold') : false;
            
            enrichedItems.push({
                text: item.str,
                fontSize: fontSize,
                isBold: isBold
            });
        });
    }
    
    return enrichedItems;
};

/**
 * Advanced Chapter Identification using font size heuristics.
 * @param {Array<{text: string, fontSize: number, isBold: boolean}>} enrichedItems
 * @returns {Array<{title: string, content: string}>}
 */
const identifyChaptersAdvanced = (enrichedItems) => {
    if (enrichedItems.length === 0) return [];

    // Find the most frequent font size (likely body text)
    const sizeCounts = {};
    enrichedItems.forEach(item => {
        if (item.text.trim()) {
            const size = Math.round(item.fontSize);
            sizeCounts[size] = (sizeCounts[size] || 0) + 1;
        }
    });

    const bodySize = parseInt(Object.keys(sizeCounts).reduce((a, b) => sizeCounts[a] > sizeCounts[b] ? a : b));
    
    let chapters = [];
    let currentChapter = { title: 'Introduction', content: '' };
    
    // Heuristic: A chapter title is usually significantly larger than body text
    // and often bold, or starts with "Chapter" / "Hoofdstuk"
    enrichedItems.forEach(item => {
        const text = item.text.trim();
        if (!text) return;

        const isLarge = item.fontSize > bodySize * 1.3;
        const isChapterPattern = /^(Chapter|Hoofdstuk|Section|Deel)\s+\d+/i.test(text);
        
        if ((isLarge || isChapterPattern) && text.length < 100) {
            if (currentChapter.content.trim()) {
                chapters.push(currentChapter);
            }
            currentChapter = { title: text, content: '' };
        } else {
            currentChapter.content += item.text + (item.hasEOL ? '\n' : ' ');
        }
    });

    if (currentChapter.content.trim()) {
        chapters.push(currentChapter);
    }

    return chapters;
};

// Keep old export for backward compatibility but update the implementation
const { extractText: oldExtractText } = require('pdf-parse'); // Fallback

const extractText = async (buffer) => {
    try {
        const enriched = await extractEnrichedText(buffer);
        return enriched.map(i => i.text).join(' ');
    } catch (e) {
        console.warn('Advanced extraction failed, falling back to basic:', e.message);
        const data = await oldExtractText(buffer);
        return data.text;
    }
};

module.exports = {
    extractText,
    extractEnrichedText,
    identifyChaptersAdvanced
};
