import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, CheckCircle2, ChevronRight, Brain, HelpCircle, Layers, ArrowLeft, Image as ImageIcon, Search, Loader2, Scissors, Cpu, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Block {
    type: 'text' | 'image';
    content: string;
    style?: { isBold: boolean; isSpecial: boolean };
    imageDescription?: string;
}

interface Chapter {
    _id: string;
    title: string;
    isAiDissected: boolean;
    blocks: Block[];
}

interface ScannedPDF {
    _id: string;
    originalName: string;
    indexedAt: string;
    chapters: Chapter[];
    metadata: { totalBlocks: number };
}

const PdfScanner = () => {
    const [pdfs, setPdfs] = useState<ScannedPDF[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<ScannedPDF | null>(null);
    const [selectedChapterIdx, setSelectedChapterIdx] = useState<number | null>(null);
    
    const [uploadStatus, setUploadStatus] = useState<{ step: string; progress: number } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDissecting, setIsDissecting] = useState(false);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [testQuestions, setTestQuestions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPdfs();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this PDF?')) return;
        
        try {
            await axios.delete(`${API_URL}/api/scanner/${id}`, { withCredentials: true });
            toast.success('PDF deleted');
            fetchPdfs();
            if (selectedPdf?._id === id) setSelectedPdf(null);
        } catch (error) {
            toast.error('Failed to delete PDF');
        }
    };

    // Polling for background AI updates
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedPdf && selectedPdf.chapters.some(c => !c.isAiDissected)) {
            interval = setInterval(() => {
                fetchPdfDetail(selectedPdf._id, true);
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [selectedPdf]);

    const fetchPdfs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/scanner`, { withCredentials: true });
            setPdfs(response.data);
        } catch (error) {
            console.error('Failed to fetch PDFs', error);
        }
    };

    const fetchPdfDetail = async (id: string, silent = false) => {
        try {
            const response = await axios.get(`${API_URL}/api/scanner/${id}`, { withCredentials: true });
            setSelectedPdf(response.data);
            if (!silent) setSelectedChapterIdx(0);
        } catch (error) {
            if (!silent) toast.error('Failed to load PDF details');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadPdf(e.target.files[0]);
        }
    };

    const uploadPdf = async (file: File) => {
        setUploadStatus({ step: 'Uploading and analyzing structure...', progress: 40 });
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${API_URL}/api/scanner/upload`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setUploadStatus({ step: 'Done! Showing results...', progress: 100 });
            setTimeout(() => {
                toast.success('PDF indexed! AI processing continues in background.');
                fetchPdfs();
                fetchPdfDetail(response.data.id);
                setUploadStatus(null);
            }, 800);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Upload failed');
            setUploadStatus(null);
        }
    };

    const dissectWithAi = async () => {
        if (!selectedPdf || selectedChapterIdx === null) return;
        
        setIsDissecting(true);
        try {
            const response = await axios.post(`${API_URL}/api/scanner/dissect-chapter`, {
                pdfId: selectedPdf._id,
                chapterIdx: selectedChapterIdx
            }, { withCredentials: true });
            
            const updatedPdf = { ...selectedPdf };
            updatedPdf.chapters[selectedChapterIdx].blocks = response.data.blocks;
            updatedPdf.chapters[selectedChapterIdx].isAiDissected = true;
            setSelectedPdf(updatedPdf);
            
            toast.success('Chapter dissected with AI!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Dissection failed');
        } finally {
            setIsDissecting(false);
        }
    };

    const generateContent = async (type: 'flashcards' | 'test') => {
        if (selectedPdf === null || selectedChapterIdx === null) return;

        setIsGenerating(true);
        const endpoint = type === 'flashcards' ? 'generate-flashcards' : 'generate-test';
        const text = selectedPdf.chapters[selectedChapterIdx].blocks.map(b => b.content).join('\n');

        try {
            const response = await axios.post(`${API_URL}/api/scanner/${endpoint}`, {
                text: text
            }, { withCredentials: true });

            if (type === 'flashcards') setFlashcards(response.data.flashcards);
            else setTestQuestions(response.data.questions);
            toast.success(`AI generated your ${type}!`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredPdfs = pdfs.filter(p => p.originalName.toLowerCase().includes(searchQuery.toLowerCase()));

    // --- Render Components ---

    const LoadingOverlay = () => (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
        >
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-glow">
                <CardContent className="pt-8 space-y-6 text-center">
                    <div className="relative w-20 h-20 mx-auto">
                        <Loader2 className="w-20 h-20 text-primary animate-spin" />
                        <FileText className="w-8 h-8 text-primary absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold font-fredoka">{uploadStatus?.step}</h3>
                        <p className="text-xs text-muted-foreground">Showing structural dissection in a moment...</p>
                    </div>
                    <Progress value={uploadStatus?.progress} className="h-2" />
                </CardContent>
            </Card>
        </motion.div>
    );

    const ListView = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search your library..." className="pl-10 bg-card/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto gap-2">
                    <Upload className="w-4 h-4" /> Upload New PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPdfs.map(pdf => (
                    <motion.div key={pdf._id} layoutId={pdf._id} onClick={() => fetchPdfDetail(pdf._id)}>
                        <Card className="cursor-pointer hover:border-primary/50 transition-all group hover:shadow-soft relative overflow-hidden">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleDelete(e, pdf._id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg truncate pr-8">{pdf.originalName}</CardTitle>
                                <CardDescription>Indexed {new Date(pdf.indexedAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {pdf.chapters?.length || 0} Chapters</span>
                                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {pdf.metadata?.totalBlocks || 0} Blocks</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const DetailView = () => {
        if (!selectedPdf) return null;
        const currentChapter = selectedChapterIdx !== null ? selectedPdf.chapters[selectedChapterIdx] : null;

        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setSelectedPdf(null)} className="gap-2 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Library
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Chapter Sidebar */}
                    <Card className="lg:col-span-1 h-fit sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Index</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
                            {selectedPdf.chapters.map((chapter, idx) => (
                                <Button
                                    key={idx} variant={selectedChapterIdx === idx ? "cute" : "ghost"}
                                    className="w-full justify-start text-left truncate text-xs relative overflow-hidden"
                                    onClick={() => { setSelectedChapterIdx(idx); setFlashcards([]); setTestQuestions([]); }}
                                >
                                    <ChevronRight className={cn("w-3 h-3 mr-2 shrink-0 transition-transform", selectedChapterIdx === idx ? "rotate-90" : "")} />
                                    {chapter.title}
                                    {!chapter.isAiDissected && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6 mb-6">
                                <div>
                                    <CardTitle className="text-2xl font-bold">{currentChapter?.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        {currentChapter?.isAiDissected ? (
                                            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 flex items-center gap-1">
                                                <Sparkles className="w-2 h-2" /> AI Dissected
                                            </div>
                                        ) : (
                                            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary flex items-center gap-1 animate-pulse">
                                                <Cpu className="w-2 h-2" /> AI Processing...
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => generateContent('flashcards')} disabled={isGenerating} className="gap-2">
                                        <Brain className="w-4 h-4" /> Flashcards
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => generateContent('test')} disabled={isGenerating} className="gap-2">
                                        <HelpCircle className="w-4 h-4" /> Test
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="content">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="content">Dissected PDF</TabsTrigger>
                                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                        <TabsTrigger value="test">Practice Test</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="content" className="space-y-4">
                                        {currentChapter?.blocks.map((block, i) => (
                                            <motion.div 
                                                key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "p-4 rounded-xl border-l-4 transition-all",
                                                    block.type === 'image' ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted/30",
                                                    block.style?.isSpecial ? "bg-yellow-400/5 border-yellow-400/50" : ""
                                                )}
                                            >
                                                {block.type === 'text' ? (
                                                    <p className={cn(
                                                        "text-sm leading-relaxed whitespace-pre-wrap",
                                                        block.style?.isBold ? "font-bold" : "",
                                                        block.style?.isSpecial ? "text-primary italic" : ""
                                                    )}>
                                                        {block.content}
                                                    </p>
                                                ) : (
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-primary" /></div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold uppercase text-primary">AI Insight: Image / Figure</p>
                                                            <p className="text-sm italic text-muted-foreground">{block.imageDescription || block.content}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="flashcards" className="space-y-4">
                                        {isGenerating ? <div className="py-20 text-center animate-pulse">AI is crafting flashcards...</div> : flashcards.length > 0 ? flashcards.map((card, i) => (
                                            <Card key={i} className="bg-primary/5 border-primary/10"><CardContent className="pt-6 space-y-2"><p className="font-bold text-sm text-primary">Q: {card.question}</p><p className="text-sm">A: {card.answer}</p></CardContent></Card>
                                        )) : <div className="text-center py-12 text-muted-foreground">Click the Flashcards button above to generate.</div>}
                                    </TabsContent>

                                    <TabsContent value="test" className="space-y-6">
                                        {isGenerating ? <div className="py-20 text-center animate-pulse">AI is creating a test...</div> : testQuestions.length > 0 ? testQuestions.map((q, i) => (
                                            <div key={i} className="space-y-3 p-4 bg-muted/20 rounded-xl"><p className="font-bold">{i + 1}. {q.question}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{q.options.map((opt: string, j: number) => (<Button key={j} variant="outline" className="justify-start text-left text-xs h-auto py-2">{opt}</Button>))}</div></div>
                                        )) : <div className="text-center py-12 text-muted-foreground">Click the Practice Test button above to generate.</div>}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen relative">
            <AnimatePresence>{uploadStatus && <LoadingOverlay />}</AnimatePresence>
            <header className="flex items-center justify-between">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-fredoka font-bold text-primary flex items-center gap-3">Study Library <Sparkles className="w-8 h-8 text-yellow-400" /></motion.h1>
                    <p className="text-muted-foreground">Your indexed documents and AI-powered study tools.</p>
                </div>
                {!selectedPdf && (
                    <div className="hidden md:block">
                        <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} /><Button onClick={() => fileInputRef.current?.click()} size="lg" className="cute-shadow">New Scan</Button>
                    </div>
                )}
            </header>
            <AnimatePresence mode="wait">
                {selectedPdf ? <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><DetailView /></motion.div> : <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><ListView /></motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default PdfScanner;
