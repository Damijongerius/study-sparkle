const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText, identifyChaptersAdvanced, extractEnrichedText } = require('../utils/pdfProcessor');
const { generateFlashcards, generateTest, dissectChapterContent } = require('../utils/aiAssistant');
const { ScannedPDF } = require('../models');
const { requireAuth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { parsePdfWithDocling } = require('../utils/doclingParser');

const upload = multer({ storage: multer.memoryStorage() });

// Get all scanned PDFs for a user
router.get('/', requireAuth, async (req, res) => {
    try {
        const pdfs = await ScannedPDF.find({ userId: req.session.userId })
            .select('originalName indexedAt metadata chapters.title status progress')
            .sort({ indexedAt: -1 });
        res.json(pdfs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed PDF content
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const pdf = await ScannedPDF.findOne({ _id: req.params.id, userId: req.session.userId });
        if (!pdf) return res.status(404).json({ error: 'PDF not found' });
        res.json(pdf);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function for background processing
const processInBackground = async (pdfId, buffer, originalName) => {
    let tempFilePath = null;
    const outputDir = path.join(__dirname, '..', 'public', 'scanned_images');
    
    try {
        await ScannedPDF.updateOne({ _id: pdfId }, { $set: { progress: 5 } });

        tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${originalName}`);
        fs.writeFileSync(tempFilePath, buffer);

        // 1. Convert PDF using Docling (Incremental Page Processing)
        const doclingResult = await parsePdfWithDocling(
            tempFilePath, 
            outputDir, 
            'json',
            async (percent, message, stage) => {
                await ScannedPDF.updateOne(
                    { _id: pdfId }, 
                    { $set: { 
                        progress: percent, 
                        statusMessage: message,
                        currentStage: stage 
                    } }
                );
            }
        );

        const blocks = doclingResult.blocks || [];
        const images = doclingResult.images || [];

        // 2. Identify Chapters based on Docling's structured blocks
        let chapters = [];
        let currentChapter = { title: 'Introduction', blocks: [] };

        blocks.forEach(block => {
            if (block.type === 'heading') {
                if (currentChapter.blocks.length > 0) chapters.push(currentChapter);
                currentChapter = { 
                    title: block.content, 
                    isAiDissected: false,
                    blocks: [] 
                };
            } else {
                // Map Docling block types to our model
                let type = 'text';
                if (block.type === 'image') type = 'image';
                
                currentChapter.blocks.push({
                    type: type,
                    content: block.content,
                    style: { isBold: false, isSpecial: block.type === 'table' } // Mark tables as special
                });
            }
        });
        
        if (currentChapter.blocks.length > 0) chapters.push(currentChapter);
        if (chapters.length === 0) {
            chapters.push({
                title: 'Full Document',
                isAiDissected: false,
                blocks: [{ type: 'text', content: 'No content identified.', style: { isBold: false, isSpecial: false } }]
            });
        }

        // Save structure to BOTH chapters and rawChapters
        await ScannedPDF.updateOne({ _id: pdfId }, { 
            $set: { 
                chapters: chapters,
                rawChapters: chapters,
                images: images,
                'metadata.totalBlocks': chapters.reduce((acc, c) => acc + c.blocks.length, 0),
                'metadata.source': 'docling-structured',
                status: 'completed',
                progress: 100
            } 
        });

        console.log(`Docling structured extraction completed for: ${originalName}.`);

    } catch (error) {
        console.error('Background processing failed:', error);
        await ScannedPDF.updateOne({ _id: pdfId }, { 
            $set: { status: 'failed', progress: 0 } 
        });
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }
    }
};



// Upload PDF and extract chapters with dissection
router.post('/upload', requireAuth, upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        console.log('Queuing PDF for Docling processing:', req.file.originalname);
        
        const newPdf = new ScannedPDF({
            userId: req.session.userId,
            originalName: req.file.originalname,
            status: 'processing',
            progress: 5,
            metadata: { totalBlocks: 0 }
        });

        await newPdf.save();

        // Start background processing
        processInBackground(newPdf._id, req.file.buffer, req.file.originalname);

        res.json({
            message: 'Upload successful. Processing in background.',
            id: newPdf._id,
            status: 'processing'
        });

    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({ error: error.message });
    }
});



// Manually dissect a chapter using AI
router.post('/dissect-chapter', requireAuth, async (req, res) => {
    const { pdfId, chapterIdx } = req.body;
    try {
        const pdf = await ScannedPDF.findOne({ _id: pdfId, userId: req.session.userId });
        if (!pdf) return res.status(404).json({ error: 'PDF not found' });
        
        const chapter = pdf.chapters[chapterIdx];
        const combinedText = chapter.blocks.map(b => b.content).join('\n');
        
        const dissectedBlocks = await dissectChapterContent(combinedText);
        pdf.chapters[chapterIdx].blocks = dissectedBlocks;
        
        await pdf.save();
        res.json({ blocks: dissectedBlocks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate flashcards for a specific text block or chapter
router.post('/generate-flashcards', requireAuth, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    try {
        const flashcards = await generateFlashcards(text);
        res.json({ flashcards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate a test for a specific text block or chapter
router.post('/generate-test', requireAuth, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    try {
        const questions = await generateTest(text);
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a scanned PDF
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const result = await ScannedPDF.deleteOne({ _id: req.params.id, userId: req.session.userId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'PDF not found' });
        res.json({ message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
