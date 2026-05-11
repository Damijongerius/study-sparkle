const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText, identifyChaptersAdvanced, extractEnrichedText } = require('../utils/pdfProcessor');
const { generateFlashcards, generateTest, dissectChapterContent } = require('../utils/aiAssistant');
const { ScannedPDF } = require('../models');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Get all scanned PDFs for a user
router.get('/', requireAuth, async (req, res) => {
    try {
        const pdfs = await ScannedPDF.find({ userId: req.session.userId })
            .select('originalName indexedAt metadata chapters.title')
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

// Upload PDF and extract chapters with dissection
router.post('/upload', requireAuth, upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        console.log('Processing PDF (Advanced Mode):', req.file.originalname);
        const enrichedItems = await extractEnrichedText(req.file.buffer);
        const rawChapters = identifyChaptersAdvanced(enrichedItems);
        // Structural dissection (Instant, no AI)
        const chapters = rawChapters.map(raw => ({
            title: raw.title,
            isAiDissected: false,
            blocks: raw.content.split('\n\n').filter(b => b.trim()).map(block => ({
                type: 'text',
                content: block.trim(),
                style: { isBold: false, isSpecial: false }
            }))
        }));

        const newPdf = new ScannedPDF({
            userId: req.session.userId,
            originalName: req.file.originalname,
            chapters: chapters,
            metadata: {
                pageCount: 0,
                totalBlocks: chapters.reduce((acc, c) => acc + c.blocks.length, 0)
            }
        });

        await newPdf.save();

        // Fire and forget AI dissection in the background
        const processBackgroundAi = async () => {
            try {
                for (let i = 0; i < newPdf.chapters.length; i++) {
                    const chapter = newPdf.chapters[i];
                    const combinedText = chapter.blocks.map(b => b.content).join('\n');
                    const dissectedBlocks = await dissectChapterContent(combinedText);
                    
                    // Update database
                    await ScannedPDF.updateOne(
                        { _id: newPdf._id, 'chapters._id': chapter._id },
                        { 
                            $set: { 
                                'chapters.$.blocks': dissectedBlocks,
                                'chapters.$.isAiDissected': true 
                            }
                        }
                    );
                    console.log(`Background AI dissection complete for: ${chapter.title}`);
                }
            } catch (err) {
                console.error('Background AI dissection failed:', err);
            }
        };

        processBackgroundAi(); // Trigger but don't await

        res.json({
            message: 'PDF uploaded and structurally indexed. AI processing in background.',
            id: newPdf._id,
            chapters: newPdf.chapters.map(c => ({
                title: c.title,
                blockCount: c.blocks.length
            }))
        });
    } catch (error) {
        console.error('Upload error:', error);
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
