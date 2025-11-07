/**
 * Advanced Document Management System
 * نظام إدارة المستندات المتقدم
 * 
 * Features:
 * - Drag & Drop file upload
 * - File preview (PDF, Images, Word, Excel)
 * - Version control and history
 * - File sharing and permissions
 * - Smart search and filtering
 * - Categories and tags
 * - File size management
 * - Download and export
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  Archive,
  Download,
  Eye,
  Edit3,
  Trash2,
  Share2,
  Lock,
  Unlock,
  Clock,
  User,
  Search,
  Filter,
  Grid,
  List,
  FolderPlus,
  Folder,
  ChevronRight,
  Star,
  Tag,
  MoreVertical,
  Copy,
  Move,
  History,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: DocumentCategory;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  modifiedAt: Date;
  version: number;
  versions: DocumentVersion[];
  permissions: DocumentPermission[];
  starred: boolean;
  url?: string;
  thumbnailUrl?: string;
  description?: string;
  folderId?: string;
}

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  changes?: string;
  url: string;
}

export interface DocumentPermission {
  userId: string;
  userName: string;
  role: 'viewer' | 'editor' | 'admin';
}

export type DocumentCategory = 
  | 'drawings'
  | 'reports'
  | 'contracts'
  | 'specifications'
  | 'photos'
  | 'calculations'
  | 'correspondence'
  | 'other';

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  documents: Document[];
  subfolders: DocumentFolder[];
  color?: string;
}

interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes('image')) return <Image className="w-5 h-5 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5 text-yellow-500" />;
  if (type.includes('code') || type.includes('text')) return <FileCode className="w-5 h-5 text-purple-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const getCategoryColor = (category: DocumentCategory): string => {
  const colors = {
    drawings: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    reports: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    contracts: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    specifications: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    photos: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    calculations: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    correspondence: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  };
  return colors[category];
};

// ============================================================================
// Mock Data
// ============================================================================

const generateMockDocuments = (): Document[] => {
  return [
    {
      id: '1',
      name: 'Structural Drawings Rev.3.pdf',
      type: 'application/pdf',
      size: 5242880, // 5MB
      category: 'drawings',
      tags: ['structural', 'phase-1', 'approved'],
      uploadedBy: 'Ahmed Hassan',
      uploadedAt: new Date('2025-11-05'),
      modifiedAt: new Date('2025-11-07'),
      version: 3,
      versions: [
        { version: 1, uploadedBy: 'Ahmed Hassan', uploadedAt: new Date('2025-11-01'), size: 4800000, url: '#' },
        { version: 2, uploadedBy: 'Sara Ali', uploadedAt: new Date('2025-11-03'), size: 5000000, changes: 'Updated foundation details', url: '#' },
        { version: 3, uploadedBy: 'Ahmed Hassan', uploadedAt: new Date('2025-11-07'), size: 5242880, changes: 'Final approval', url: '#' }
      ],
      permissions: [
        { userId: '1', userName: 'Ahmed Hassan', role: 'admin' },
        { userId: '2', userName: 'Sara Ali', role: 'editor' },
        { userId: '3', userName: 'Mohamed Ali', role: 'viewer' }
      ],
      starred: true
    },
    {
      id: '2',
      name: 'Monthly Progress Report - October.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1048576, // 1MB
      category: 'reports',
      tags: ['monthly', 'progress', 'october'],
      uploadedBy: 'Sara Ali',
      uploadedAt: new Date('2025-11-01'),
      modifiedAt: new Date('2025-11-01'),
      version: 1,
      versions: [
        { version: 1, uploadedBy: 'Sara Ali', uploadedAt: new Date('2025-11-01'), size: 1048576, url: '#' }
      ],
      permissions: [
        { userId: '2', userName: 'Sara Ali', role: 'admin' }
      ],
      starred: false
    },
    {
      id: '3',
      name: 'Site Photos - Week 45.zip',
      type: 'application/zip',
      size: 52428800, // 50MB
      category: 'photos',
      tags: ['site-photos', 'week-45', 'documentation'],
      uploadedBy: 'Mohamed Ali',
      uploadedAt: new Date('2025-11-06'),
      modifiedAt: new Date('2025-11-06'),
      version: 1,
      versions: [
        { version: 1, uploadedBy: 'Mohamed Ali', uploadedAt: new Date('2025-11-06'), size: 52428800, url: '#' }
      ],
      permissions: [],
      starred: false
    },
    {
      id: '4',
      name: 'Contract Agreement - Phase 1.pdf',
      type: 'application/pdf',
      size: 3145728, // 3MB
      category: 'contracts',
      tags: ['contract', 'phase-1', 'legal'],
      uploadedBy: 'Ahmed Hassan',
      uploadedAt: new Date('2025-10-15'),
      modifiedAt: new Date('2025-10-20'),
      version: 2,
      versions: [
        { version: 1, uploadedBy: 'Ahmed Hassan', uploadedAt: new Date('2025-10-15'), size: 3000000, url: '#' },
        { version: 2, uploadedBy: 'Legal Team', uploadedAt: new Date('2025-10-20'), size: 3145728, changes: 'Added appendix', url: '#' }
      ],
      permissions: [
        { userId: '1', userName: 'Ahmed Hassan', role: 'admin' }
      ],
      starred: true
    },
    {
      id: '5',
      name: 'BOQ Calculations.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 2097152, // 2MB
      category: 'calculations',
      tags: ['boq', 'quantities', 'budget'],
      uploadedBy: 'Sara Ali',
      uploadedAt: new Date('2025-11-02'),
      modifiedAt: new Date('2025-11-05'),
      version: 4,
      versions: [
        { version: 1, uploadedBy: 'Sara Ali', uploadedAt: new Date('2025-11-02'), size: 1800000, url: '#' },
        { version: 2, uploadedBy: 'Sara Ali', uploadedAt: new Date('2025-11-03'), size: 1900000, changes: 'Updated rates', url: '#' },
        { version: 3, uploadedBy: 'Ahmed Hassan', uploadedAt: new Date('2025-11-04'), size: 2000000, changes: 'Added Phase 2', url: '#' },
        { version: 4, uploadedBy: 'Sara Ali', uploadedAt: new Date('2025-11-05'), size: 2097152, changes: 'Final revision', url: '#' }
      ],
      permissions: [
        { userId: '2', userName: 'Sara Ali', role: 'admin' },
        { userId: '1', userName: 'Ahmed Hassan', role: 'editor' }
      ],
      starred: true
    }
  ];
};

// ============================================================================
// Subcomponents
// ============================================================================

interface DocumentCardProps {
  document: Document;
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onStar: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDownload, onDelete, onStar }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileIcon(document.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {document.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(document.size)} • v{document.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onStar(document)}
            className={`p-1 rounded ${document.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
          >
            <Star className={`w-4 h-4 ${document.starred ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-2 top-12 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-48">
            <button
              onClick={() => { onView(document); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => { onDownload(document); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <History className="w-4 h-4" />
              Version History
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => { onDelete(document); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryColor(document.category)}`}>
          {document.category}
        </span>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {document.uploadedBy}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {document.uploadedAt.toLocaleDateString()}
        </div>
      </div>

      {/* Quick Actions (show on hover) */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={() => onView(document)}
          className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDownload(document)}
          className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface DropZoneProps {
  onFilesSelected: (files: FileList) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
        }
      `}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Drop files here or click to upload
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Support for PDF, Word, Excel, Images, and more (Max 100MB)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(generateMockDocuments());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);

  // Handle file upload
  const handleFilesSelected = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    
    // Initialize upload progress
    const progressArray: FileUploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    setUploadProgress(progressArray);

    // Simulate upload
    fileArray.forEach((file, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress: 100, status: 'success' };
            return updated;
          });

          // Add document to list
          setTimeout(() => {
            const newDoc: Document = {
              id: `doc_${Date.now()}_${index}`,
              name: file.name,
              type: file.type,
              size: file.size,
              category: 'other',
              tags: [],
              uploadedBy: 'Current User',
              uploadedAt: new Date(),
              modifiedAt: new Date(),
              version: 1,
              versions: [{
                version: 1,
                uploadedBy: 'Current User',
                uploadedAt: new Date(),
                size: file.size,
                url: '#'
              }],
              permissions: [],
              starred: false
            };
            setDocuments(prev => [newDoc, ...prev]);
          }, 500);
        } else {
          setUploadProgress(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
        }
      }, 200);
    });

    // Clear progress after upload
    setTimeout(() => {
      setUploadProgress([]);
      setShowUpload(false);
    }, 5000);
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort: starred first, then by date
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });

  // Actions
  const handleView = (doc: Document) => {
    console.log('View document:', doc.name);
    alert(`Viewing: ${doc.name}\n\nIn a real application, this would open a preview modal.`);
  };

  const handleDownload = (doc: Document) => {
    console.log('Download document:', doc.name);
    alert(`Downloading: ${doc.name}\n\nFile size: ${formatFileSize(doc.size)}`);
  };

  const handleDelete = (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    }
  };

  const handleStar = (doc: Document) => {
    setDocuments(prev =>
      prev.map(d => d.id === doc.id ? { ...d, starred: !d.starred } : d)
    );
  };

  // Statistics
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const categoryCount = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📁 Document Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {documents.length} documents • {formatFileSize(totalSize)} total
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Files
        </button>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <DropZone onFilesSelected={handleFilesSelected} />
          
          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadProgress.map((file, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.fileName}
                    </span>
                    {file.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : file.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{Math.round(file.progress)}%</span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        file.status === 'success' ? 'bg-green-500' :
                        file.status === 'error' ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, tags..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="drawings">Drawings</option>
            <option value="reports">Reports</option>
            <option value="contracts">Contracts</option>
            <option value="specifications">Specifications</option>
            <option value="photos">Photos</option>
            <option value="calculations">Calculations</option>
            <option value="correspondence">Correspondence</option>
            <option value="other">Other</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Size</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatFileSize(totalSize)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Starred</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {documents.filter(d => d.starred).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Object.keys(categoryCount).length}
          </p>
        </div>
      </div>

      {/* Documents Grid/List */}
      {sortedDocuments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No documents found
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first document to get started'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {sortedDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onStar={handleStar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
