"""
PDF Manager - Upload, View, and Analyze PDF Documents
Supports PDF text extraction, AI analysis, and document management
"""

from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from pathlib import Path
import mimetypes

# PDF processing libraries
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    print("⚠️ PyPDF2 not installed. Installing...")
    os.system("pip install PyPDF2 -q")
    import PyPDF2
    HAS_PYPDF2 = True

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("⚠️ pdfplumber not installed. Installing...")
    os.system("pip install pdfplumber -q")
    import pdfplumber
    HAS_PDFPLUMBER = True

pdf_manager_api = Blueprint('pdf_manager_api', __name__)

# Configuration
UPLOAD_FOLDER = Path(__file__).parent / 'uploads' / 'pdfs'
METADATA_FILE = UPLOAD_FOLDER / 'metadata.json'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Ensure upload directory exists
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_metadata():
    """Load PDF metadata from JSON file"""
    if METADATA_FILE.exists():
        try:
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_metadata(metadata):
    """Save PDF metadata to JSON file"""
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

def extract_text_pypdf2(pdf_path):
    """Extract text from PDF using PyPDF2"""
    text = ""
    page_texts = []
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                page_texts.append({
                    'page': page_num + 1,
                    'text': page_text
                })
                text += page_text + "\n"
        
        return {
            'success': True,
            'text': text,
            'pages': page_texts,
            'num_pages': num_pages,
            'method': 'PyPDF2'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'method': 'PyPDF2'
        }

def extract_text_pdfplumber(pdf_path):
    """Extract text from PDF using pdfplumber (more accurate)"""
    text = ""
    page_texts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                page_texts.append({
                    'page': page_num + 1,
                    'text': page_text,
                    'width': page.width,
                    'height': page.height
                })
                text += page_text + "\n"
        
        return {
            'success': True,
            'text': text,
            'pages': page_texts,
            'num_pages': num_pages,
            'method': 'pdfplumber'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'method': 'pdfplumber'
        }

def extract_pdf_info(pdf_path):
    """Extract PDF metadata and information"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            info = pdf_reader.metadata
            
            return {
                'title': info.get('/Title', ''),
                'author': info.get('/Author', ''),
                'subject': info.get('/Subject', ''),
                'creator': info.get('/Creator', ''),
                'producer': info.get('/Producer', ''),
                'creation_date': info.get('/CreationDate', ''),
                'num_pages': len(pdf_reader.pages)
            }
    except Exception as e:
        return {'error': str(e)}

def analyze_pdf_with_ai(text, filename):
    """Analyze PDF content using AI (placeholder for Gemini integration)"""
    # This will be integrated with existing Gemini service
    # For now, return basic analysis
    
    word_count = len(text.split())
    char_count = len(text)
    line_count = len(text.split('\n'))
    
    # Detect document type based on keywords
    doc_type = "General Document"
    keywords_lower = text.lower()
    
    if any(word in keywords_lower for word in ['contract', 'agreement', 'party', 'hereby']):
        doc_type = "Contract/Agreement"
    elif any(word in keywords_lower for word in ['invoice', 'payment', 'total', 'amount']):
        doc_type = "Invoice/Financial"
    elif any(word in keywords_lower for word in ['report', 'analysis', 'findings', 'conclusion']):
        doc_type = "Report/Analysis"
    elif any(word in keywords_lower for word in ['specification', 'requirement', 'technical']):
        doc_type = "Technical Specification"
    elif any(word in keywords_lower for word in ['drawing', 'plan', 'section', 'elevation']):
        doc_type = "Drawing/Plan"
    
    return {
        'document_type': doc_type,
        'word_count': word_count,
        'character_count': char_count,
        'line_count': line_count,
        'summary': f"Document contains {word_count} words across {line_count} lines. Identified as {doc_type}.",
        'key_sections': [],  # Will be populated by AI
        'entities': [],  # Will be populated by AI (dates, amounts, names)
    }

@pdf_manager_api.route('/api/pdf/upload', methods=['POST'])
def upload_pdf():
    """Upload a PDF file"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Only PDF files are allowed'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'success': False, 'error': f'File too large. Max size is {MAX_FILE_SIZE / (1024*1024)}MB'}), 400
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{original_filename}"
        file_path = UPLOAD_FOLDER / unique_filename
        
        # Save file
        file.save(file_path)
        
        # Extract text (try pdfplumber first, fallback to PyPDF2)
        text_extraction = extract_text_pdfplumber(file_path)
        if not text_extraction['success']:
            text_extraction = extract_text_pypdf2(file_path)
        
        # Extract PDF info
        pdf_info = extract_pdf_info(file_path)
        
        # Analyze content
        analysis = {}
        if text_extraction['success']:
            analysis = analyze_pdf_with_ai(text_extraction['text'], original_filename)
        
        # Get additional metadata from request
        project_id = request.form.get('project_id', '')
        category = request.form.get('category', 'Uncategorized')
        tags = request.form.get('tags', '').split(',') if request.form.get('tags') else []
        
        # Create metadata entry
        metadata = load_metadata()
        file_id = f"pdf_{timestamp}"
        
        metadata[file_id] = {
            'id': file_id,
            'filename': unique_filename,
            'original_filename': original_filename,
            'upload_date': datetime.now().isoformat(),
            'file_size': file_size,
            'project_id': project_id,
            'category': category,
            'tags': tags,
            'pdf_info': pdf_info,
            'text_extracted': text_extraction['success'],
            'num_pages': text_extraction.get('num_pages', 0),
            'extraction_method': text_extraction.get('method', 'none'),
            'analysis': analysis
        }
        
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'metadata': metadata[file_id],
            'text_preview': text_extraction.get('text', '')[:500] if text_extraction['success'] else None
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/list', methods=['GET'])
def list_pdfs():
    """List all uploaded PDFs"""
    try:
        project_id = request.args.get('project_id')
        category = request.args.get('category')
        
        metadata = load_metadata()
        pdfs = list(metadata.values())
        
        # Filter by project_id if provided
        if project_id:
            pdfs = [pdf for pdf in pdfs if pdf.get('project_id') == project_id]
        
        # Filter by category if provided
        if category:
            pdfs = [pdf for pdf in pdfs if pdf.get('category') == category]
        
        # Sort by upload date (newest first)
        pdfs.sort(key=lambda x: x.get('upload_date', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'pdfs': pdfs,
            'total': len(pdfs)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>', methods=['GET'])
def get_pdf_info(file_id):
    """Get PDF metadata and info"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        return jsonify({
            'success': True,
            'pdf': metadata[file_id]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>/download', methods=['GET'])
def download_pdf(file_id):
    """Download PDF file"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        pdf_data = metadata[file_id]
        file_path = UPLOAD_FOLDER / pdf_data['filename']
        
        if not file_path.exists():
            return jsonify({'success': False, 'error': 'File not found on disk'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=pdf_data['original_filename']
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>/view', methods=['GET'])
def view_pdf(file_id):
    """View PDF file in browser"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        pdf_data = metadata[file_id]
        file_path = UPLOAD_FOLDER / pdf_data['filename']
        
        if not file_path.exists():
            return jsonify({'success': False, 'error': 'File not found on disk'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=False
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>/extract-text', methods=['GET'])
def extract_text(file_id):
    """Extract text from PDF"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        pdf_data = metadata[file_id]
        file_path = UPLOAD_FOLDER / pdf_data['filename']
        
        if not file_path.exists():
            return jsonify({'success': False, 'error': 'File not found on disk'}), 404
        
        # Try pdfplumber first
        text_extraction = extract_text_pdfplumber(file_path)
        if not text_extraction['success']:
            text_extraction = extract_text_pypdf2(file_path)
        
        return jsonify({
            'success': text_extraction['success'],
            'text': text_extraction.get('text', ''),
            'pages': text_extraction.get('pages', []),
            'num_pages': text_extraction.get('num_pages', 0),
            'method': text_extraction.get('method', 'none'),
            'error': text_extraction.get('error')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>/analyze', methods=['POST'])
def analyze_pdf(file_id):
    """Analyze PDF content with AI"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        pdf_data = metadata[file_id]
        file_path = UPLOAD_FOLDER / pdf_data['filename']
        
        if not file_path.exists():
            return jsonify({'success': False, 'error': 'File not found on disk'}), 404
        
        # Extract text
        text_extraction = extract_text_pdfplumber(file_path)
        if not text_extraction['success']:
            text_extraction = extract_text_pypdf2(file_path)
        
        if not text_extraction['success']:
            return jsonify({'success': False, 'error': 'Failed to extract text from PDF'}), 500
        
        # Get analysis requirements from request
        request_data = request.get_json() or {}
        analysis_type = request_data.get('analysis_type', 'general')  # general, contract, technical, financial
        
        # Perform analysis
        analysis = analyze_pdf_with_ai(text_extraction['text'], pdf_data['original_filename'])
        
        # Update metadata with analysis
        pdf_data['analysis'] = analysis
        pdf_data['last_analyzed'] = datetime.now().isoformat()
        metadata[file_id] = pdf_data
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>', methods=['DELETE'])
def delete_pdf(file_id):
    """Delete PDF file"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        pdf_data = metadata[file_id]
        file_path = UPLOAD_FOLDER / pdf_data['filename']
        
        # Delete file from disk
        if file_path.exists():
            os.remove(file_path)
        
        # Remove from metadata
        del metadata[file_id]
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'message': 'PDF deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pdf_manager_api.route('/api/pdf/<file_id>/update', methods=['PUT'])
def update_pdf_metadata(file_id):
    """Update PDF metadata (category, tags, etc.)"""
    try:
        metadata = load_metadata()
        
        if file_id not in metadata:
            return jsonify({'success': False, 'error': 'PDF not found'}), 404
        
        request_data = request.get_json()
        pdf_data = metadata[file_id]
        
        # Update allowed fields
        if 'category' in request_data:
            pdf_data['category'] = request_data['category']
        if 'tags' in request_data:
            pdf_data['tags'] = request_data['tags']
        if 'project_id' in request_data:
            pdf_data['project_id'] = request_data['project_id']
        
        pdf_data['last_modified'] = datetime.now().isoformat()
        metadata[file_id] = pdf_data
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'pdf': pdf_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

print("✅ PDF Manager API initialized")
print(f"📁 Upload folder: {UPLOAD_FOLDER}")
print(f"✅ PyPDF2: {'Available' if HAS_PYPDF2 else 'Not available'}")
print(f"✅ pdfplumber: {'Available' if HAS_PDFPLUMBER else 'Not available'}")
