import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, CheckCircle2, Brain, HelpCircle, Layers, ArrowLeft, Search, Loader2, Cpu, Trash2, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
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
    type: 'text' | 'image' | 'heading' | 'table';
    content: string;
    page?: number;
    metadata?: {
        label?: string;
        is_bullet?: boolean;
        visual_metrics?: {
            left: number;
            top: number;
            font_size?: number;
            indent_level?: number;
            color?: number[];
            is_bold?: boolean;
            font_name?: string;
        }
    };
    style?: { isBold: boolean; isSpecial: boolean };
    imageDescription?: string;
}

interface Chapter {
    _id: string;
    title: string;
    isAiDissected: boolean;
    page: number;
    level?: number;
    blocks: Block[];
    rawBlocks?: Block[];
}

interface ScannedPDF {
    _id: string;
    originalName: string;
    indexedAt: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    statusMessage?: string;
    currentStage?: string;
    chapters: Chapter[];
    rawChapters?: Chapter[];
    images: any[];
    metadata: { totalBlocks: number };
}

const PdfScanner = () => {
    const { user } = useAuth();
    const [pdfs, setPdfs] = useState<ScannedPDF[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<ScannedPDF | null>(null);
    const [selectedChapterIdx, setSelectedChapterIdx] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'raw' | 'ai'>('raw');
    
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDissecting, setIsDissecting] = useState(false);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [testQuestions, setTestQuestions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPdfs();
    }, []);

    useEffect(() => {
        if (contentAreaRef.current) {
            contentAreaRef.current.scrollTo(0, 0);
        }
    }, [selectedChapterIdx]);

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

    useEffect(() => {
        if (!user?.id) return;
        const socket = io(API_URL, { withCredentials: true });
        socket.on('connect', () => socket.emit('join', user.id));
        socket.on('scanner_progress', (data) => {
            setPdfs(prev => prev.map(p => p._id === data.pdfId ? { ...p, ...data, status: 'processing' } : p));
            if (selectedPdf?._id === data.pdfId) setSelectedPdf(prev => prev ? { ...prev, ...data } : null);
        });
        socket.on('scanner_complete', (data) => {
            toast.success('Scan complete!');
            fetchPdfs();
            if (selectedPdf?._id === data.pdfId) fetchPdfDetail(data.pdfId, true);
        });
        socket.on('scanner_failed', (data) => {
            toast.error(`Scan failed: ${data.error}`);
            fetchPdfs();
        });
        return () => { socket.disconnect(); };
    }, [user?.id, selectedPdf?._id]);

    const fetchPdfs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/scanner`, { withCredentials: true });
            setPdfs(response.data);
        } catch (error) { console.error('Failed to fetch PDFs', error); }
    };

    const fetchPdfDetail = async (id: string, silent = false) => {
        try {
            const response = await axios.get(`${API_URL}/api/scanner/${id}`, { withCredentials: true });
            const pdf = response.data;
            if (pdf.status === 'completed' || silent) {
                setSelectedPdf(pdf);
                if (!silent && selectedChapterIdx === null) setSelectedChapterIdx(0);
                if (!silent) setViewMode(pdf.chapters.some((c: any) => c.isAiDissected) ? 'ai' : 'raw');
            } else { toast.info(`Still processing: ${pdf.progress}%`); }
        } catch (error) { if (!silent) toast.error('Failed to load PDF details'); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) uploadPdf(e.target.files[0]);
    };

    const uploadPdf = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('pdf', file);
        try {
            await axios.post(`${API_URL}/api/scanner/upload`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Upload successful! Processing in background.');
            fetchPdfs();
        } catch (error: any) { toast.error(error.response?.data?.error || 'Upload failed'); }
        finally { setIsUploading(false); }
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
        } catch (error: any) { toast.error(error.response?.data?.error || 'Dissection failed'); }
        finally { setIsDissecting(false); }
    };

    const generateContent = async (type: 'flashcards' | 'test') => {
        if (selectedPdf === null || selectedChapterIdx === null) return;
        setIsGenerating(true);
        const endpoint = type === 'flashcards' ? 'generate-flashcards' : 'generate-test';
        const chapters = viewMode === 'raw' && selectedPdf.rawChapters ? selectedPdf.rawChapters : selectedPdf.chapters;
        const text = chapters[selectedChapterIdx].blocks.map(b => b.content).join('\n');
        try {
            const response = await axios.post(`${API_URL}/api/scanner/${endpoint}`, { text }, { withCredentials: true });
            if (type === 'flashcards') setFlashcards(response.data.flashcards);
            else setTestQuestions(response.data.questions);
            toast.success(`AI generated your ${type}!`);
        } catch (error: any) { toast.error(error.response?.data?.error || 'AI generation failed'); }
        finally { setIsGenerating(false); }
    };

    const filteredPdfs = pdfs.filter(p => p.originalName.toLowerCase().includes(searchQuery.toLowerCase()));
    const activeChapters = selectedPdf ? (viewMode === 'raw' && selectedPdf.rawChapters ? selectedPdf.rawChapters : selectedPdf.chapters) : [];
    const currentChapter = selectedChapterIdx !== null ? activeChapters[selectedChapterIdx] : null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen relative">
            <header className="flex items-center justify-between">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-fredoka font-bold text-primary flex items-center gap-3">
                        Study Library <Sparkles className="w-8 h-8 text-yellow-400" />
                    </motion.h1>
                    <p className="text-muted-foreground">Your indexed documents and AI-powered study tools.</p>
                </div>
                {!selectedPdf && (
                    <div className="hidden md:block">
                        <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        <Button onClick={() => fileInputRef.current?.click()} size="lg" className="cute-shadow" disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isUploading ? 'Uploading...' : 'New Scan'}
                        </Button>
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {selectedPdf ? (
                    <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => setSelectedPdf(null)} className="gap-2 -ml-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Library
                            </Button>
                            <div className="flex bg-muted/50 p-1 rounded-xl border border-primary/10">
                                <Button variant={viewMode === 'raw' ? 'cute' : 'ghost'} size="sm" onClick={() => setViewMode('raw')} className="text-[10px] uppercase font-bold tracking-widest h-8">Raw Docling</Button>
                                <Button variant={viewMode === 'ai' ? 'cute' : 'ghost'} size="sm" onClick={() => setViewMode('ai')} className="text-[10px] uppercase font-bold tracking-widest h-8" disabled={!selectedPdf.chapters.some(c => c.isAiDissected)}>AI Refined</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <Card className="lg:col-span-1 h-fit sticky top-24 border-primary/10 shadow-soft">
                                <CardHeader className="pb-3 border-b border-primary/5">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center justify-between">
                                        Index <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] lowercase font-medium tracking-normal">{activeChapters.length} items</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    {(() => {
                                        const grouped: Record<number, number[]> = {};
                                        activeChapters.forEach((c, i) => {
                                            const p = c.page || 1;
                                            if (!grouped[p]) grouped[p] = [];
                                            grouped[p].push(i);
                                        });
                                        return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([page, indices]) => (
                                            <div key={`page-${page}`} className="border-b border-primary/5 last:border-0">
                                                <div className="bg-muted/30 px-4 py-2 text-[10px] font-bold text-muted-foreground/60 sticky top-0 z-10 backdrop-blur-sm">PAGE {page}</div>
                                                <div className="p-1 space-y-0.5">
                                                    {indices.map(idx => {
                                                        const chapter = activeChapters[idx];
                                                        const isActive = selectedChapterIdx === idx;
                                                        const level = chapter.level || 1;
                                                        return (
                                                            <Button key={idx} variant={isActive ? "cute" : "ghost"} className={cn("w-full justify-start text-left truncate rounded-lg transition-all", isActive ? "shadow-sm translate-x-1" : "hover:bg-primary/5", level === 1 ? "text-xs font-semibold h-9" : "text-[10px] h-8 font-medium text-muted-foreground/80")} style={{ paddingLeft: `${(level - 1) * 12 + 12}px` }} onClick={() => { setSelectedChapterIdx(idx); setFlashcards([]); setTestQuestions([]); }}>
                                                                <div className={cn("w-1 h-1 rounded-full mr-2 shrink-0 transition-colors", isActive ? "bg-primary" : level === 1 ? "bg-muted-foreground/30" : "bg-muted-foreground/10")} />
                                                                <span className="truncate">{chapter.title}</span>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-3 space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between border-b pb-6 mb-6">
                                        <div className="max-w-[60%]">
                                            <CardTitle className="text-2xl font-bold truncate">{currentChapter?.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                {viewMode === 'raw' ? <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 flex items-center gap-1"><FileText className="w-2 h-2" /> Original</div> : <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 flex items-center gap-1"><Sparkles className="w-2 h-2" /> AI Refined</div>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {viewMode === 'raw' && !currentChapter?.isAiDissected && <Button size="sm" variant="outline" onClick={dissectWithAi} disabled={isDissecting} className="gap-2 border-primary/20 hover:bg-primary/10">{isDissecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-500" />} AI Refine</Button>}
                                            <Button size="sm" onClick={() => generateContent('flashcards')} disabled={isGenerating} className="gap-2"><Brain className="w-4 h-4" /> Flashcards</Button>
                                            <Button size="sm" variant="ghost" onClick={() => generateContent('test')} disabled={isGenerating} className="gap-2"><HelpCircle className="w-4 h-4" /> Test</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent ref={contentAreaRef} className="max-h-[80vh] overflow-y-auto custom-scrollbar pt-6">
                                        <Tabs defaultValue="content">
                                            <TabsList className="mb-4">
                                                <TabsTrigger value="content">Document</TabsTrigger>
                                                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                                <TabsTrigger value="test">Test</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="content" className="space-y-4">
                                                {currentChapter?.blocks.map((block: any, i: number) => {
                                                    const metrics = block.metadata?.visual_metrics;
                                                    const indent = (metrics?.indent_level || 0) * 24;
                                                    // Scale PDF font size (pts) to browser pixels and ensure a legible minimum
                                                    const fontSize = metrics?.font_size ? Math.max(14, metrics.font_size * 1.1) : 16;
                                                    const color = metrics?.color ? `rgb(${metrics.color[0]}, ${metrics.color[1]}, ${metrics.color[2]})` : 'inherit';
                                                    const isBold = metrics?.is_bold || block.style?.isBold;
                                                    const isHeading = block.type === 'heading' || block.metadata?.label?.includes('heading');
                                                    const isBullet = block.metadata?.is_bullet;
                                                    
                                                    return (
                                                        <motion.div 
                                                            key={i} 
                                                            initial={{ opacity: 0, y: 10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            className={cn(
                                                                "py-1 rounded-xl transition-all relative group flex gap-3", 
                                                                block.type === 'image' ? "bg-primary/5 p-4 border border-primary/10 my-4" : "hover:bg-muted/30 px-2",
                                                                isHeading && "mt-6 mb-2"
                                                            )} 
                                                            style={{ paddingLeft: `${indent}px` }}
                                                        >
                                                            {isBullet && <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />}
                                                            {block.type !== 'image' ? (
                                                                <div 
                                                                    className={cn(
                                                                        "leading-relaxed whitespace-pre-wrap flex-1", 
                                                                        (isBold || isHeading) ? "font-bold" : "font-medium",
                                                                        isHeading && "text-primary tracking-tight"
                                                                    )} 
                                                                    style={{ 
                                                                        fontSize: isHeading ? `${fontSize * 1.2}px` : `${fontSize}px`, 
                                                                        color: color 
                                                                    }}
                                                                >
                                                                    {block.content}
                                                                </div>
                                                            ) : (
                                                                <div className="relative group max-w-2xl mx-auto flex-1">
                                                                    <img src={`${API_URL}${block.content}`} alt="PDF Element" className="rounded-xl shadow-md border-2 border-primary/10 max-h-[500px] object-contain bg-white" />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </TabsContent>
                                            <TabsContent value="flashcards" className="space-y-4">
                                                {isGenerating ? <div className="py-20 text-center animate-pulse text-primary font-bold">AI is crafting flashcards...</div> : flashcards.length > 0 ? flashcards.map((card, i) => (
                                                    <Card key={i} className="bg-primary/5 border-primary/10"><CardContent className="pt-6 space-y-2"><p className="font-bold text-sm text-primary">Q: {card.question}</p><p className="text-sm">A: {card.answer}</p></CardContent></Card>
                                                )) : <div className="text-center py-12 text-muted-foreground">Click Flashcards to generate.</div>}
                                            </TabsContent>
                                            <TabsContent value="test" className="space-y-6">
                                                {isGenerating ? <div className="py-20 text-center animate-pulse text-primary font-bold">AI is creating a test...</div> : testQuestions.length > 0 ? testQuestions.map((q, i) => (
                                                    <div key={i} className="space-y-3 p-4 bg-muted/20 rounded-xl"><p className="font-bold">{i + 1}. {q.question}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{q.options.map((opt: string, j: number) => (<Button key={j} variant="outline" className="justify-start text-left text-xs h-auto py-2">{opt}</Button>))}</div></div>
                                                )) : <div className="text-center py-12 text-muted-foreground">Click Practice Test to generate.</div>}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search your library..." className="pl-10 bg-card/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto gap-2 cute-shadow" disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isUploading ? 'Uploading...' : 'Upload New PDF'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPdfs.map(pdf => (
                                <motion.div key={pdf._id} layoutId={pdf._id} onClick={() => pdf.status === 'completed' && fetchPdfDetail(pdf._id)}>
                                    <Card className={cn("cursor-pointer transition-all group hover:shadow-soft relative overflow-hidden h-full flex flex-col", pdf.status === 'completed' ? "hover:border-primary/50" : "opacity-80 cursor-wait bg-muted/30")}>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(e, pdf._id)}><Trash2 className="w-4 h-4" /></Button>
                                        <CardHeader className="pb-2">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors", pdf.status === 'completed' ? "bg-primary/10 group-hover:bg-primary group-hover:text-white" : "bg-muted text-muted-foreground")}>
                                                {pdf.status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <CardTitle className="text-lg truncate pr-8">{pdf.originalName}</CardTitle>
                                            <CardDescription>{pdf.status === 'completed' ? `Indexed ${new Date(pdf.indexedAt).toLocaleDateString()}` : (pdf.statusMessage || 'Processing...')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="mt-auto pt-4 border-t border-primary/5 bg-primary/[0.02]">
                                            {pdf.status === 'processing' ? (
                                                <div className="space-y-4">
                                                    {['metadata', 'conversion', 'finalizing'].map((stage) => {
                                                        const isActive = pdf.currentStage === stage;
                                                        const isDone = (pdf.currentStage === 'conversion' && stage === 'metadata') || (pdf.currentStage === 'finalizing' && (stage === 'metadata' || stage === 'conversion'));
                                                        return (
                                                            <div key={stage} className={cn("flex flex-col gap-2 transition-opacity", isActive || isDone ? "opacity-100" : "opacity-40")}>
                                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", isDone ? "bg-green-500 border-green-500 text-white" : isActive ? "border-primary text-primary animate-pulse" : "border-muted")}>{isDone ? <CheckCircle2 className="w-3 h-3" /> : null}</div>
                                                                        <span className={isActive ? "text-primary" : isDone ? "text-green-600" : ""}>{stage}</span>
                                                                    </div>
                                                                    {isActive && <span className="text-primary">{pdf.progress}%</span>}
                                                                </div>
                                                                {isActive && <Progress value={pdf.progress} className="h-1" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : pdf.status === 'failed' ? (
                                                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded-lg"><AlertCircle className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Failed</span></div>
                                            ) : (
                                                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{pdf.chapters?.length || 0} Chapters</span><span>{pdf.metadata?.totalBlocks || 0} Blocks</span></div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PdfScanner;
