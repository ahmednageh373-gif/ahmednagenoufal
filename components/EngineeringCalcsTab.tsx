import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { analyzeBeam } from '../services/geminiService';
import type { BeamSupport, BeamLoad, BeamAnalysisInput, BeamAnalysisResult } from '../types';
import { Bot, Calculator, Plus, Trash2, Loader2 } from 'lucide-react';
import { marked } from 'marked';

export const EngineeringCalcsTab: React.FC = () => {
    const [length, setLength] = useState(10);
    const [supports, setSupports] = useState<BeamSupport[]>([
        { id: uuidv4(), type: 'Pin', position: 0 },
        { id: uuidv4(), type: 'Roller', position: 10 },
    ]);
    const [loads, setLoads] = useState<BeamLoad[]>([
        { id: uuidv4(), type: 'UDL', magnitude: 20, position: 0, endPosition: 10 },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<BeamAnalysisResult | null>(null);
    
    const handleUpdateSupport = (id: string, field: keyof Omit<BeamSupport, 'id'>, value: string | number) => {
        setSupports(s => s.map(sup => sup.id === id ? { ...sup, [field]: value } : sup));
    };

    const handleUpdateLoad = (id: string, field: keyof Omit<BeamLoad, 'id'>, value: string | number) => {
        setLoads(l => l.map(load => load.id === id ? { ...load, [field]: value } : load));
    };

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const analysisInput: BeamAnalysisInput = {
                length,
                supports: supports.map(({ id, ...rest }) => rest),
                loads: loads.map(({ id, ...rest }) => rest),
            };
            const analysisResult = await analyzeBeam(analysisInput);
            setResult(analysisResult);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const ResultCard: React.FC<{title: string, value: number, unit: string, position: number}> = ({title, value, unit, position}) => (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value.toFixed(2)} <span className="text-base font-normal">{unit}</span></p>
            <p className="text-xs text-gray-500">at {position.toFixed(2)} m</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                        <Calculator className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">محلل العوارض (Beam Calculator)</h3>
                        <p className="text-sm text-slate-500">
                            قم بتعريف خصائص العارضة والدعامات والأحمال للحصول على تحليل إنشائي فوري.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">طول العارضة (متر)</label>
                    <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2">الدعامات</h4>
                    {supports.map(s => (
                        <div key={s.id} className="grid grid-cols-3 gap-2 items-center mb-2">
                            <select value={s.type} onChange={e => handleUpdateSupport(s.id, 'type', e.target.value)} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700">
                                <option>Pin</option><option>Roller</option><option>Fixed</option>
                            </select>
                            <input type="number" value={s.position} onChange={e => handleUpdateSupport(s.id, 'position', Number(e.target.value))} placeholder="الموقع (م)" className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                            <button onClick={() => setSupports(sup => sup.filter(x => x.id !== s.id))} className="text-red-500 hover:bg-red-100 p-2 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    <button onClick={() => setSupports(s => [...s, {id: uuidv4(), type: 'Roller', position: length}])} className="text-sm text-indigo-600 flex items-center gap-1"><Plus size={14}/> إضافة دعامة</button>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">الأحمال</h4>
                    {loads.map(l => (
                         <div key={l.id} className="grid grid-cols-5 gap-2 items-center mb-2">
                            <select value={l.type} onChange={e => handleUpdateLoad(l.id, 'type', e.target.value)} className="col-span-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700">
                                <option value="Point">Point</option><option value="UDL">UDL</option>
                            </select>
                            <input type="number" value={l.magnitude} onChange={e => handleUpdateLoad(l.id, 'magnitude', Number(e.target.value))} placeholder={`القوة (${l.type === 'Point' ? 'kN' : 'kN/m'})`} className="col-span-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                            <input type="number" value={l.position} onChange={e => handleUpdateLoad(l.id, 'position', Number(e.target.value))} placeholder="الموقع (م)" className="col-span-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                            <input type="number" value={l.endPosition || ''} onChange={e => handleUpdateLoad(l.id, 'endPosition', Number(e.target.value))} placeholder="النهاية (م)" className={`col-span-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700 ${l.type === 'Point' ? 'opacity-50' : ''}`} disabled={l.type === 'Point'} />
                            <button onClick={() => setLoads(lds => lds.filter(x => x.id !== l.id))} className="col-span-1 text-red-500 hover:bg-red-100 p-2 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    <button onClick={() => setLoads(l => [...l, {id: uuidv4(), type: 'Point', magnitude: 10, position: length/2}])} className="text-sm text-indigo-600 flex items-center gap-1"><Plus size={14}/> إضافة حمل</button>
                </div>

                <div className="border-t pt-6">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                        <span>{isLoading ? 'جاري التحليل...' : 'تحليل العارضة'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">نتائج التحليل</h3>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
                {isLoading && !result && <div className="text-center p-8"><p>جاري إجراء الحسابات الهندسية...</p></div>}
                {!isLoading && !result && !error && <div className="text-center p-8 text-slate-500"><p>ستظهر نتائج التحليل هنا.</p></div>}
                {result && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ResultCard title="أقصى عزم انحناء" value={result.maxBendingMoment.value} unit="kNm" position={result.maxBendingMoment.position} />
                            <ResultCard title="أقصى قوة قص" value={result.maxShearForce.value} unit="kN" position={result.maxShearForce.position} />
                            <ResultCard title="أقصى انحراف" value={result.maxDeflection.value} unit="mm" position={result.maxDeflection.position} />
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2">ملخص التحليل</h4>
                             <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(result.summary) }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};