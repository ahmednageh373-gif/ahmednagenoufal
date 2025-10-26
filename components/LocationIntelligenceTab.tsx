import React, { useState } from 'react';
import { queryWithMaps } from '../services/geminiService';
import { MapPin, Search, ExternalLink, File, Printer, Save } from 'lucide-react';
import type { LocationContact } from '../types';

declare var XLSX: any;

const createVCard = (contact: LocationContact): string => {
    let vCard = 'BEGIN:VCARD\n';
    vCard += 'VERSION:3.0\n';
    vCard += `FN:${contact.name}\n`;
    vCard += `ORG:${contact.type || 'Contact'}\n`;
    if (contact.phone) {
        vCard += `TEL;TYPE=WORK,VOICE:${contact.phone}\n`;
    }
    if (contact.address) {
        vCard += `ADR;TYPE=WORK:;;${contact.address.replace(/,/g, ';')}\n`;
    }
    if (contact.mapsUri) {
        vCard += `URL:${contact.mapsUri}\n`;
    }
    vCard += 'END:VCARD\n';
    return vCard;
};


export const LocationIntelligenceTab: React.FC = () => {
    const [prompt, setPrompt] = useState('موردين مواد بناء');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<LocationContact[] | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const getLocation = () => {
        setIsGettingLocation(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            (err) => {
                setError(`خطأ في تحديد الموقع: ${err.message}. يرجى تفعيل خدمات الموقع في متصفحك.`);
                setIsGettingLocation(false);
            }
        );
    };

    const handleQuery = async () => {
        if (!prompt.trim() || !location) {
            setError('يرجى تقديم استعلام والسماح بالوصول إلى الموقع.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await queryWithMaps(prompt, location);
            setResult(response);
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveContact = (contact: LocationContact) => {
        const vCardData = createVCard(contact);
        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contact.name.replace(/\s/g, '_')}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportXLSX = () => {
        if (!result) return;
        const dataToExport = result.map(contact => ({
            'الاسم': contact.name,
            'النوع': contact.type,
            'الهاتف': contact.phone,
            'العنوان': contact.address,
            'رابط الخريطة': contact.mapsUri
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Location Results");
        XLSX.writeFile(workbook, `location_query_${prompt.replace(/\s/g, '_')}.xlsx`);
    };

    const handlePrint = () => window.print();

    return (
        <div className="space-y-8 printable-area">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm no-print">
                 <div className="flex items-start gap-4">
                    <div className="bg-cyan-100 dark:bg-cyan-900/50 p-3 rounded-full">
                        <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">الاستعلام الجغرافي</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           ابحث عن موردين، مقاولين، أو أي خدمات أخرى بالقرب من موقعك الحالي.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="location-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ما الذي تبحث عنه؟</label>
                    <input
                        id="location-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: مقاولين تشطيبات، موردي خرسانة جاهزة"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {location ? (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                           <MapPin size={16} /><span>تم تحديد الموقع. أنت جاهز للبحث.</span>
                        </div>
                    ) : (
                         <button onClick={getLocation} disabled={isGettingLocation} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                            {isGettingLocation ? '...جاري التحديد' : 'الحصول على موقعي الحالي'}
                         </button>
                    )}
                     <button onClick={handleQuery} disabled={isLoading || !prompt.trim() || !location} className="flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 w-full sm:w-auto">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search size={16} />}
                        <span>{isLoading ? '...جاري البحث' : 'بحث'}</span>
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded no-print"><p>{error}</p></div>}

            {result && (
                 <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">النتائج</h3>
                         <div className="flex items-center gap-2 no-print">
                            <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg text-sm"><File size={16} /><span>Excel</span></button>
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg text-sm"><Printer size={16} /><span>Print</span></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm responsive-table">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="p-2">الاسم</th><th className="p-2">النوع</th><th className="p-2">الهاتف</th>
                                    <th className="p-2">العنوان</th><th className="p-2 no-print">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((contact, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700 last:border-0">
                                        <td className="p-2 font-medium" data-label="الاسم">{contact.name}</td>
                                        <td className="p-2" data-label="النوع">{contact.type}</td>
                                        <td className="p-2 font-mono" data-label="الهاتف">{contact.phone || '-'}</td>
                                        <td className="p-2" data-label="العنوان">{contact.address || '-'}</td>
                                        <td className="p-2 no-print" data-label="إجراءات">
                                            <div className="flex items-center gap-2">
                                                {contact.mapsUri && <a href={contact.mapsUri} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md" title="Open in Maps"><ExternalLink size={16}/></a>}
                                                <button onClick={() => handleSaveContact(contact)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md" title="Save to Contacts"><Save size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};