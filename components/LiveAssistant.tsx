import React, { useState, useRef, useCallback, useEffect } from 'react';
// Fix: The 'LiveSession' type is not exported from the '@google/genai' package. It has been removed.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Mic, Square, AlertTriangle, Wifi, WifiOff, Settings } from 'lucide-react';
// Fix: Removed .ts extension from import path.
import type { Project, AssistantSettings } from '../types';
import { AssistantSettingsModal } from './AssistantSettingsModal';

// --- Audio Helper Functions (as per Gemini API guidelines) ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

const constructSystemInstruction = (project: Project): string => {
    const settings = project.data.assistantSettings;
    
    // Default settings if none are provided
    const persona = settings?.persona || 'projectManager';
    const tone = settings?.tone || 'formal';
    const style = settings?.style || 'concise';

    const personaMap = {
        projectManager: "an expert project manager",
        technicalAssistant: "a technical assistant focused on facts and data",
        educationalConsultant: "an educational consultant who explains concepts clearly"
    };

    const toneMap = {
        formal: "formal and professional",
        friendly: "friendly and approachable"
    };

    const styleMap = {
        concise: "concise and to the point",
        detailed: "detailed and comprehensive"
    };
    
    const financials = project.data.financials || [];
    let financialContext = '';
    if (financials.length > 0) {
        const totalCost = financials.reduce((acc, item) => acc + item.total, 0);
        const topItems = [...financials]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(item => `- ${item.item}: ${item.total.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}`)
            .join('\n');
        
        financialContext = `

Here is a summary of the project's Bill of Quantities for context:
- Total Estimated Cost: ${totalCost.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
- Total Number of Items: ${financials.length}
- Top 5 Cost Drivers:
${topItems}

Use this financial data to answer questions about budget, costs, and scope.`;
    }

    return `You are a helpful project management assistant for AN.AI Ahmed Nageh. You are assisting with the project named "${project.name}", which is about "${project.description}".
Your persona is: ${personaMap[persona]}.
Your tone should be: ${toneMap[tone]}.
Your response style should be: ${styleMap[style]}.
${financialContext}
Directly answer questions related to project management. All your responses must be in Arabic.`;
};


// --- Main Component ---

type ConnectionState = "idle" | "connecting" | "connected" | "error";
type TranscriptionEntry = { type: 'user' | 'model'; text: string; isFinal: boolean };

interface LiveAssistantProps {
    project: Project;
    onUpdateSettings: (projectId: string, newSettings: AssistantSettings) => void;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ project, onUpdateSettings }) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Fix: Changed 'LiveSession' to 'any' because it's not an exported type from the library.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioRefs = useRef<{
        inputAudioContext: AudioContext | null,
        outputAudioContext: AudioContext | null,
        mediaStream: MediaStream | null,
        mediaStreamSource: MediaStreamAudioSourceNode | null,
        scriptProcessor: ScriptProcessorNode | null,
        nextStartTime: number,
        sources: Set<AudioBufferSourceNode>
    }>({
        inputAudioContext: null, outputAudioContext: null, mediaStream: null,
        mediaStreamSource: null, scriptProcessor: null, nextStartTime: 0, sources: new Set()
    });

    const cleanup = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;

        const ar = audioRefs.current;
        ar.mediaStream?.getTracks().forEach(track => track.stop());
        ar.scriptProcessor?.disconnect();
        ar.mediaStreamSource?.disconnect();
        ar.inputAudioContext?.close();
        ar.outputAudioContext?.close();
        ar.sources.forEach(source => source.stop());

        audioRefs.current = {
             inputAudioContext: null, outputAudioContext: null, mediaStream: null,
            mediaStreamSource: null, scriptProcessor: null, nextStartTime: 0, sources: new Set()
        };
    }, []);

    const startSession = async () => {
        setConnectionState("connecting");
        setError(null);
        setTranscriptionHistory([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRefs.current.mediaStream = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const systemInstruction = constructSystemInstruction(project);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        const ar = audioRefs.current;
                        ar.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        ar.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        
                        ar.mediaStreamSource = ar.inputAudioContext.createMediaStreamSource(stream);
                        ar.scriptProcessor = ar.inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        ar.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        ar.mediaStreamSource.connect(ar.scriptProcessor);
                        ar.scriptProcessor.connect(ar.inputAudioContext.destination);

                        setConnectionState("connected");
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         // --- Handle Transcription ---
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscriptionHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.type === 'user' && !last.isFinal) {
                                    const updatedLast = { ...last, text: last.text + text };
                                    return [...prev.slice(0, -1), updatedLast];
                                }
                                return [...prev, { type: 'user', text, isFinal: false }];
                            });
                        }
                         if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                             setTranscriptionHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.type === 'model' && !last.isFinal) {
                                    const updatedLast = { ...last, text: last.text + text };
                                    return [...prev.slice(0, -1), updatedLast];
                                }
                                return [...prev, { type: 'model', text, isFinal: false }];
                            });
                        }
                        if (message.serverContent?.turnComplete) {
                             setTranscriptionHistory(prev => prev.map(entry => ({ ...entry, isFinal: true })));
                        }

                        // --- Handle Audio Playback ---
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const ar = audioRefs.current;
                            if (!ar.outputAudioContext) return;

                            ar.nextStartTime = Math.max(ar.nextStartTime, ar.outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ar.outputAudioContext, 24000, 1);
                            const source = ar.outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ar.outputAudioContext.destination);
                            
                            source.addEventListener('ended', () => { ar.sources.delete(source); });
                            source.start(ar.nextStartTime);
                            ar.nextStartTime += audioBuffer.duration;
                            ar.sources.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Connection error: ${e.message}`);
                        setConnectionState("error");
                        cleanup();
                    },
                    onclose: () => {
                        setConnectionState("idle");
                        cleanup();
                    },
                }
            });

        } catch (err) {
            setError(`Failed to start session: ${(err as Error).message}. Please ensure microphone permissions are granted.`);
            setConnectionState("error");
            cleanup();
        }
    };
    
    const stopSession = () => {
        sessionPromiseRef.current?.then(session => session.close());
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const renderTranscription = () => (
        <div className="flex-grow bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4 overflow-y-auto">
            {transcriptionHistory.map((entry, index) => (
                <div key={index} className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-prose p-3 rounded-xl ${entry.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700'} ${!entry.isFinal ? 'opacity-70' : ''}`}>
                        <p>{entry.text}</p>
                    </div>
                </div>
            ))}
             {transcriptionHistory.length === 0 && connectionState === 'connected' && (
                <div className="text-center text-gray-500 pt-16">
                    <Mic size={48} className="mx-auto mb-4 animate-pulse text-indigo-500" />
                    <p className="text-lg font-semibold">جارٍ الاستماع...</p>
                    <p>ابدأ التحدث لطرح سؤال حول مشروعك.</p>
                </div>
             )}
        </div>
    );
    
    const getStatusIndicator = () => {
        switch (connectionState) {
            case 'idle': return <><WifiOff size={16} /><span>غير متصل</span></>;
            case 'connecting': return <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div><span>جاري الاتصال...</span></>;
            case 'connected': return <><Wifi size={16} className="text-green-500" /><span>متصل</span></>;
            case 'error': return <><AlertTriangle size={16} className="text-red-500" /><span>خطأ</span></>;
        }
    }


    return (
        <div className="flex flex-col h-full">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المساعد المباشر</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        تحدث مباشرة مع مساعد الذكاء الاصطناعي حول مشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings size={18} />
                        <span>تخصيص الشخصية</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {getStatusIndicator()}
                    </div>
                </div>
            </header>
            
             <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm flex-grow flex flex-col">
                {renderTranscription()}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded" role="alert"><p>{error}</p></div>}
                <div className="pt-6 text-center">
                    {connectionState === "connected" || connectionState === "connecting" ? (
                        <button onClick={stopSession} disabled={connectionState !== 'connected'} className="bg-red-600 text-white rounded-full p-4 hover:bg-red-700 transition-colors disabled:bg-gray-400">
                            <Square size={24} />
                        </button>
                    ) : (
                        <button onClick={startSession} className="bg-indigo-600 text-white rounded-full p-4 hover:bg-indigo-700 transition-colors">
                            <Mic size={24} />
                        </button>
                    )}
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {connectionState === "connected" || connectionState === "connecting" ? 'إيقاف المحادثة' : 'بدء المحادثة'}
                    </p>
                </div>
            </div>
            <AssistantSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                currentSettings={project.data.assistantSettings}
                onSave={(newSettings) => onUpdateSettings(project.id, newSettings)}
            />
        </div>
    );
};