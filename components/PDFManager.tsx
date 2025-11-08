import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSearch,
  Calendar,
  Tag,
  Folder,
  BarChart3,
  FileType,
  ArrowUpDown
} from 'lucide-react';

interface PDF {
  id: string;
  filename: string;
  original_filename: string;
  upload_date: string;
  file_size: number;
  project_id: string;
  category: string;
  tags: string[];
  pdf_info: {
    title?: string;
    author?: string;
    num_pages: number;
  };
  text_extracted: boolean;
  num_pages: number;
  analysis?: {
    document_type: string;
    word_count: number;
    summary: string;
  };
}

const PDFManager: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  // Form fields
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadTags, setUploadTags] = useState('');

  const API_BASE_URL = window.location.origin.replace(/300[01]/, '5000');

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/pdf/list`);
      const data = await response.json();

      if (data.success) {
        setPdfs(data.pdfs);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch PDFs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', uploadCategory);
      formData.append('tags', uploadTags);

      const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`PDF uploaded successfully: ${selectedFile.name}`);
        setSelectedFile(null);
        setShowUploadModal(false);
        setUploadCategory('General');
        setUploadTags('');
        fetchPDFs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to upload PDF');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pdfId: string) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf/${pdfId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('PDF deleted successfully');
        fetchPDFs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete PDF');
      console.error(err);
    }
  };

  const handleView = async (pdf: PDF) => {
    setSelectedPDF(pdf);
    setShowViewModal(true);
    setExtractedText('');
  };

  const handleExtractText = async (pdfId: string) => {
    try {
      setExtractedText('Loading...');
      const response = await fetch(`${API_BASE_URL}/api/pdf/${pdfId}/extract-text`);
      const data = await response.json();

      if (data.success) {
        setExtractedText(data.text);
      } else {
        setExtractedText(`Error: ${data.error}`);
      }
    } catch (err) {
      setExtractedText('Failed to extract text');
      console.error(err);
    }
  };

  const handleAnalyze = async (pdfId: string) => {
    try {
      setAnalyzing(true);
      const response = await fetch(`${API_BASE_URL}/api/pdf/${pdfId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_type: 'general' }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Analysis completed successfully');
        fetchPDFs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to analyze PDF');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredPDFs = pdfs
    .filter((pdf) => {
      const matchesSearch =
        pdf.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === 'all' || pdf.category === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
        case 'name':
          return a.original_filename.localeCompare(b.original_filename);
        case 'size':
          return b.file_size - a.file_size;
        default:
          return 0;
      }
    });

  const categories = ['all', ...Array.from(new Set(pdfs.map((pdf) => pdf.category)))];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-r-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة ملفات PDF</h1>
                <p className="text-gray-600 mt-1">رفع وعرض وتحليل مستندات PDF</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">رفع PDF</span>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{pdfs.length}</span>
              </div>
              <p className="text-blue-100 mt-2">إجمالي الملفات</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {pdfs.filter((p) => p.text_extracted).length}
                </span>
              </div>
              <p className="text-green-100 mt-2">تم استخراج النص</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <BarChart3 className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {pdfs.filter((p) => p.analysis).length}
                </span>
              </div>
              <p className="text-purple-100 mt-2">تم التحليل</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <FileType className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{categories.length - 1}</span>
              </div>
              <p className="text-orange-100 mt-2">التصنيفات</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="mr-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
            <button onClick={() => setSuccess(null)} className="mr-auto">
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الملفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'جميع التصنيفات' : cat}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">التاريخ</option>
              <option value="name">الاسم</option>
              <option value="size">الحجم</option>
            </select>
          </div>
        </div>

        {/* PDF Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : filteredPDFs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد ملفات PDF</h3>
            <p className="text-gray-600">ابدأ برفع ملف PDF الأول</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPDFs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="p-6">
                  {/* File Icon and Title */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate" title={pdf.original_filename}>
                        {pdf.original_filename}
                      </h3>
                      <p className="text-sm text-gray-500">{pdf.num_pages} صفحة</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Folder className="w-4 h-4" />
                      <span>{pdf.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(pdf.upload_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileType className="w-4 h-4" />
                      <span>{formatFileSize(pdf.file_size)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {pdf.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pdf.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Analysis Badge */}
                  {pdf.analysis && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {pdf.analysis.document_type}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 line-clamp-2">{pdf.analysis.summary}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(pdf)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      عرض
                    </button>
                    <a
                      href={`${API_BASE_URL}/api/pdf/${pdf.id}/download`}
                      download
                      className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(pdf.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">رفع ملف PDF</h2>
                <button onClick={() => setShowUploadModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختر ملف PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">عام</option>
                    <option value="Contract">عقد</option>
                    <option value="Invoice">فاتورة</option>
                    <option value="Report">تقرير</option>
                    <option value="Technical">تقني</option>
                    <option value="Drawing">مخطط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوسوم (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="مثال: عقد, 2024, مشروع1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        رفع
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedPDF && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPDF.original_filename}</h2>
                <button onClick={() => setShowViewModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="flex gap-2 p-4 border-b bg-gray-50">
                <button
                  onClick={() => handleExtractText(selectedPDF.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileSearch className="w-4 h-4" />
                  استخراج النص
                </button>
                <button
                  onClick={() => handleAnalyze(selectedPDF.id)}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                  تحليل بالذكاء الاصطناعي
                </button>
                <a
                  href={`${API_BASE_URL}/api/pdf/${selectedPDF.id}/download`}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  تحميل
                </a>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {extractedText ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">النص المستخرج:</h3>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {extractedText}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <iframe
                      src={`${API_BASE_URL}/api/pdf/${selectedPDF.id}/view`}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      title={selectedPDF.original_filename}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFManager;
