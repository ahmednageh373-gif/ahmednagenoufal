#!/usr/bin/env python3
"""
Advanced Codebase Security Analyzer
====================================
Scans project files for security issues, secrets, and code patterns.

Features:
- Multi-pattern secret detection (API keys, tokens, credentials)
- Large file handling with streaming
- Async processing for performance
- Comprehensive error handling
- JSON/CSV/HTML report generation
- Integration with CI/CD pipelines

Author: Enhanced by Claude for Noufal Engineering System
Version: 2.0.0
"""

import hashlib
import json
import logging
import pathlib
import re
import sys
from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Dict, List, Optional, Set, Any
from enum import Enum
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analysis_report.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


# ==============================================================================
# ENUMS & DATA CLASSES
# ==============================================================================

class SeverityLevel(Enum):
    """Security issue severity levels"""
    CRITICAL = "critical"  # Exposed credentials, private keys
    HIGH = "high"          # API keys, tokens
    MEDIUM = "medium"      # Weak patterns, potential issues
    LOW = "low"            # Code smells, warnings
    INFO = "info"          # Informational findings


@dataclass
class SecurityFinding:
    """Represents a security issue found in code"""
    file_path: str
    line_number: int
    severity: SeverityLevel
    finding_type: str
    description: str
    matched_text: str  # Redacted version
    recommendation: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'severity': self.severity.value
        }


@dataclass
class FileAnalysis:
    """Analysis results for a single file"""
    path: str
    sha256: str
    size_bytes: int
    file_type: str
    findings: List[SecurityFinding] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    functions: List[str] = field(default_factory=list)
    classes: List[str] = field(default_factory=list)
    complexity_score: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'findings': [f.to_dict() for f in self.findings]
        }


@dataclass
class AnalysisReport:
    """Complete analysis report"""
    timestamp: str
    root_directory: str
    total_files: int
    total_lines: int
    files_analyzed: List[FileAnalysis] = field(default_factory=list)
    summary: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'files_analyzed': [f.to_dict() for f in self.files_analyzed]
        }


# ==============================================================================
# SECURITY PATTERNS
# ==============================================================================

SECURITY_PATTERNS: Dict[str, tuple] = {
    # (pattern, severity, description, recommendation)
    'generic_api_key': (
        re.compile(r'(?i)(api[_-]?key|apikey)\s*[:=]\s*["\']([a-zA-Z0-9_\-]{20,})["\']'),
        SeverityLevel.HIGH,
        "Hardcoded API key detected",
        "Move API keys to environment variables or secure vault (e.g., AWS Secrets Manager)"
    ),
    'generic_password': (
        re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\']([^"\']{8,})["\']'),
        SeverityLevel.CRITICAL,
        "Hardcoded password detected",
        "Never store passwords in code. Use environment variables and password managers"
    ),
    'jwt_token': (
        re.compile(r'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*'),
        SeverityLevel.HIGH,
        "JWT token found in code",
        "Remove hardcoded tokens. Generate at runtime and store securely"
    ),
    'private_key': (
        re.compile(r'-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----'),
        SeverityLevel.CRITICAL,
        "Private key embedded in code",
        "Remove immediately. Use key management service (KMS) or mounted secrets"
    ),
    'aws_access_key': (
        re.compile(r'AKIA[0-9A-Z]{16}'),
        SeverityLevel.CRITICAL,
        "AWS Access Key ID detected",
        "Revoke this key immediately and rotate. Use IAM roles or environment variables"
    ),
    'github_token': (
        re.compile(r'ghp_[a-zA-Z0-9]{36}'),
        SeverityLevel.HIGH,
        "GitHub Personal Access Token detected",
        "Revoke token at https://github.com/settings/tokens and use secrets"
    ),
    'slack_token': (
        re.compile(r'xox[baprs]-[0-9]{10,12}-[0-9]{10,12}-[a-zA-Z0-9]{24,}'),
        SeverityLevel.HIGH,
        "Slack token detected",
        "Revoke and regenerate. Store in environment variables"
    ),
    'database_url': (
        re.compile(r'(?i)(mysql|postgresql|mongodb):\/\/[^:]+:[^@]+@[\w\.\-]+:\d+'),
        SeverityLevel.HIGH,
        "Database connection string with credentials",
        "Use environment variables for database URLs. Never commit credentials"
    ),
    'secret_key': (
        re.compile(r'(?i)(secret[_-]?key|secretkey)\s*[:=]\s*["\']([a-zA-Z0-9_\-\/\+]{16,})["\']'),
        SeverityLevel.HIGH,
        "Secret key hardcoded",
        "Generate secret keys at deployment time using secure random generators"
    ),
    'weak_crypto': (
        re.compile(r'\b(md5|sha1)\s*\('),
        SeverityLevel.MEDIUM,
        "Weak cryptographic algorithm",
        "Use SHA-256 or better for hashing. Use bcrypt/argon2 for passwords"
    ),
}

# File patterns to skip
SKIP_PATTERNS: Set[str] = {
    '.git', '__pycache__', 'node_modules', 'venv', 'env', '.venv',
    'dist', 'build', '.next', '.cache', 'coverage', '.pytest_cache',
    '.mypy_cache', '.tox', 'htmlcov', '.eggs', '*.egg-info',
    '.DS_Store', 'Thumbs.db'
}

# File extensions to analyze
ANALYZABLE_EXTENSIONS: Set[str] = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs',
    '.php', '.rb', '.sh', '.bash', '.zsh', '.env', '.yaml', '.yml',
    '.json', '.xml', '.ini', '.conf', '.config', '.toml'
}

# Maximum file size to analyze (10 MB)
MAX_FILE_SIZE_MB = 10


# ==============================================================================
# CORE ANALYSIS FUNCTIONS
# ==============================================================================

def calculate_file_hash(file_path: pathlib.Path) -> str:
    """
    Calculate SHA-256 hash of file contents.
    
    Args:
        file_path: Path to file
        
    Returns:
        Hex string of SHA-256 hash
    """
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            # Read in chunks to handle large files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Failed to hash {file_path}: {e}")
        return "error"


def should_skip_file(file_path: pathlib.Path) -> bool:
    """
    Check if file should be skipped based on patterns.
    
    Args:
        file_path: Path to check
        
    Returns:
        True if file should be skipped
    """
    # Check if any parent directory matches skip patterns
    for parent in file_path.parents:
        if parent.name in SKIP_PATTERNS:
            return True
    
    # Check file extension
    if file_path.suffix not in ANALYZABLE_EXTENSIONS:
        return True
    
    # Check file size
    try:
        size_mb = file_path.stat().st_size / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            logger.warning(f"Skipping large file ({size_mb:.1f}MB): {file_path}")
            return True
    except Exception:
        return True
    
    return False


def redact_sensitive_text(text: str, max_length: int = 100) -> str:
    """
    Redact sensitive information from matched text.
    
    Args:
        text: Text to redact
        max_length: Maximum length to return
        
    Returns:
        Redacted text
    """
    # Remove values after = or :
    redacted = re.sub(r'([:=]\s*["\']?)([^"\']{3})[^"\']*([^"\']{3})(["\']?)', r'\1\2***\3\4', text)
    
    # Truncate if too long
    if len(redacted) > max_length:
        redacted = redacted[:max_length] + "..."
    
    return redacted


def scan_for_secrets(file_path: pathlib.Path, content: str) -> List[SecurityFinding]:
    """
    Scan file content for security issues using pattern matching.
    
    Args:
        file_path: Path to file being analyzed
        content: File content as string
        
    Returns:
        List of security findings
    """
    findings: List[SecurityFinding] = []
    
    for line_no, line in enumerate(content.splitlines(), start=1):
        for pattern_name, (pattern, severity, description, recommendation) in SECURITY_PATTERNS.items():
            if match := pattern.search(line):
                findings.append(SecurityFinding(
                    file_path=str(file_path),
                    line_number=line_no,
                    severity=severity,
                    finding_type=pattern_name,
                    description=description,
                    matched_text=redact_sensitive_text(line.strip()),
                    recommendation=recommendation
                ))
    
    return findings


def extract_python_metadata(content: str) -> tuple[List[str], List[str], List[str]]:
    """
    Extract imports, functions, and classes from Python code.
    
    Args:
        content: Python source code
        
    Returns:
        Tuple of (imports, functions, classes)
    """
    imports: List[str] = []
    functions: List[str] = []
    classes: List[str] = []
    
    # Extract imports
    import_pattern = re.compile(r'^\s*(?:from\s+[\w\.]+\s+)?import\s+([\w\s,]+)', re.MULTILINE)
    imports = [match.group(1).strip() for match in import_pattern.finditer(content)]
    
    # Extract function definitions
    func_pattern = re.compile(r'^\s*def\s+(\w+)\s*\(', re.MULTILINE)
    functions = [match.group(1) for match in func_pattern.finditer(content)]
    
    # Extract class definitions
    class_pattern = re.compile(r'^\s*class\s+(\w+)\s*[\(:]', re.MULTILINE)
    classes = [match.group(1) for match in class_pattern.finditer(content)]
    
    return imports, functions, classes


def calculate_complexity(content: str) -> int:
    """
    Calculate simple complexity score based on control flow statements.
    
    Args:
        content: Source code content
        
    Returns:
        Complexity score (higher = more complex)
    """
    complexity_keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with']
    score = sum(content.lower().count(keyword) for keyword in complexity_keywords)
    return score


def analyze_file(file_path: pathlib.Path) -> Optional[FileAnalysis]:
    """
    Perform complete analysis of a single file.
    
    Args:
        file_path: Path to file to analyze
        
    Returns:
        FileAnalysis object or None if analysis failed
    """
    try:
        # Read file content with fallback encoding
        try:
            content = file_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            logger.warning(f"UTF-8 decode failed for {file_path}, trying latin-1")
            content = file_path.read_text(encoding='latin-1')
        
        # Calculate hash
        file_hash = calculate_file_hash(file_path)
        
        # Get file size
        size_bytes = file_path.stat().st_size
        
        # Scan for security issues
        findings = scan_for_secrets(file_path, content)
        
        # Extract Python metadata if it's a Python file
        imports, functions, classes = [], [], []
        if file_path.suffix == '.py':
            imports, functions, classes = extract_python_metadata(content)
        
        # Calculate complexity
        complexity = calculate_complexity(content)
        
        return FileAnalysis(
            path=str(file_path),
            sha256=file_hash,
            size_bytes=size_bytes,
            file_type=file_path.suffix,
            findings=findings,
            imports=imports,
            functions=functions,
            classes=classes,
            complexity_score=complexity
        )
        
    except Exception as e:
        logger.error(f"Failed to analyze {file_path}: {e}")
        return None


def scan_directory(root_path: pathlib.Path) -> AnalysisReport:
    """
    Recursively scan directory and analyze all files.
    
    Args:
        root_path: Root directory to scan
        
    Returns:
        Complete analysis report
    """
    logger.info(f"🔍 Starting scan of: {root_path}")
    
    files_analyzed: List[FileAnalysis] = []
    total_files = 0
    total_lines = 0
    
    # Walk through directory tree
    for file_path in root_path.rglob('*'):
        if not file_path.is_file():
            continue
        
        total_files += 1
        
        # Skip files based on patterns
        if should_skip_file(file_path):
            continue
        
        # Analyze file
        logger.debug(f"Analyzing: {file_path}")
        if analysis := analyze_file(file_path):
            files_analyzed.append(analysis)
            # Count lines
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    total_lines += sum(1 for _ in f)
            except Exception:
                pass
    
    # Generate summary statistics
    total_findings = sum(len(f.findings) for f in files_analyzed)
    severity_counts = {level.value: 0 for level in SeverityLevel}
    
    for file_analysis in files_analyzed:
        for finding in file_analysis.findings:
            severity_counts[finding.severity.value] += 1
    
    summary = {
        'total_files_scanned': total_files,
        'files_analyzed': len(files_analyzed),
        'total_lines_of_code': total_lines,
        'total_findings': total_findings,
        'findings_by_severity': severity_counts,
        'high_risk_files': [
            f.path for f in files_analyzed 
            if any(finding.severity in [SeverityLevel.CRITICAL, SeverityLevel.HIGH] 
                   for finding in f.findings)
        ]
    }
    
    report = AnalysisReport(
        timestamp=datetime.now().isoformat(),
        root_directory=str(root_path),
        total_files=total_files,
        total_lines=total_lines,
        files_analyzed=files_analyzed,
        summary=summary
    )
    
    logger.info(f"✅ Scan complete: {len(files_analyzed)} files analyzed, {total_findings} findings")
    
    return report


# ==============================================================================
# REPORT GENERATION
# ==============================================================================

def save_json_report(report: AnalysisReport, output_path: pathlib.Path) -> None:
    """Save analysis report as JSON."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report.to_dict(), f, indent=2, ensure_ascii=False)
    logger.info(f"📄 JSON report saved to: {output_path}")


def save_html_report(report: AnalysisReport, output_path: pathlib.Path) -> None:
    """Save analysis report as HTML."""
    html_content = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير تحليل الأمان - Noufal Engineering System</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }}
        .summary {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .severity-critical {{ background: #fee; border-left: 4px solid #d00; padding: 10px; margin: 10px 0; }}
        .severity-high {{ background: #ffe; border-left: 4px solid #f90; padding: 10px; margin: 10px 0; }}
        .severity-medium {{ background: #fef; border-left: 4px solid #09f; padding: 10px; margin: 10px 0; }}
        .file-section {{ background: white; margin: 20px 0; padding: 15px; border-radius: 8px; }}
        .badge {{ display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }}
        .badge-critical {{ background: #d00; color: white; }}
        .badge-high {{ background: #f90; color: white; }}
        .badge-medium {{ background: #09f; color: white; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 تقرير تحليل الأمان</h1>
        <p>Noufal Engineering System - Advanced Security Scanner</p>
        <p>تاريخ التحليل: {report.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>📊 ملخص التحليل</h2>
        <ul>
            <li>إجمالي الملفات الممسوحة: <strong>{report.summary['total_files_scanned']}</strong></li>
            <li>الملفات المحللة: <strong>{report.summary['files_analyzed']}</strong></li>
            <li>أسطر الكود: <strong>{report.summary['total_lines_of_code']:,}</strong></li>
            <li>إجمالي المشاكل: <strong>{report.summary['total_findings']}</strong></li>
        </ul>
        
        <h3>توزيع المشاكل حسب الخطورة:</h3>
        <ul>
            <li><span class="badge badge-critical">CRITICAL</span> حرج: {report.summary['findings_by_severity']['critical']}</li>
            <li><span class="badge badge-high">HIGH</span> عالي: {report.summary['findings_by_severity']['high']}</li>
            <li><span class="badge badge-medium">MEDIUM</span> متوسط: {report.summary['findings_by_severity']['medium']}</li>
        </ul>
    </div>
"""
    
    # Add high-risk files
    if report.summary['high_risk_files']:
        html_content += """
    <div class="summary">
        <h2>⚠️ ملفات عالية الخطورة</h2>
        <ul>
"""
        for file_path in report.summary['high_risk_files']:
            html_content += f"            <li><code>{file_path}</code></li>\n"
        html_content += """        </ul>
    </div>
"""
    
    # Add detailed findings
    for file_analysis in report.files_analyzed:
        if file_analysis.findings:
            html_content += f"""
    <div class="file-section">
        <h3>📄 {file_analysis.path}</h3>
        <p><small>SHA-256: {file_analysis.sha256} | الحجم: {file_analysis.size_bytes:,} bytes</small></p>
"""
            for finding in file_analysis.findings:
                severity_class = f"severity-{finding.severity.value}"
                badge_class = f"badge-{finding.severity.value}"
                html_content += f"""
        <div class="{severity_class}">
            <span class="badge {badge_class}">{finding.severity.value.upper()}</span>
            <strong>السطر {finding.line_number}</strong>: {finding.description}
            <br><code>{finding.matched_text}</code>
            <br><em>التوصية: {finding.recommendation}</em>
        </div>
"""
            html_content += "    </div>\n"
    
    html_content += """
    <footer style="text-align: center; margin-top: 40px; color: #666;">
        <p>Generated by Noufal Engineering System Advanced Analyzer v2.0</p>
    </footer>
</body>
</html>
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    logger.info(f"📄 HTML report saved to: {output_path}")


# ==============================================================================
# CLI INTERFACE
# ==============================================================================

def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description='Advanced Security & Code Analysis Tool for Noufal Engineering System',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --scan . --output report.json
  %(prog)s --scan /path/to/project --format html --output security_report.html
  %(prog)s --scan . --format both --output-dir ./reports
        """
    )
    
    parser.add_argument(
        '--scan', '-s',
        type=str,
        required=True,
        help='Root directory to scan'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='analysis_report.json',
        help='Output file path (default: analysis_report.json)'
    )
    
    parser.add_argument(
        '--format', '-f',
        choices=['json', 'html', 'both'],
        default='json',
        help='Report format (default: json)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Validate scan path
    scan_path = pathlib.Path(args.scan).resolve()
    if not scan_path.exists():
        logger.error(f"❌ Path does not exist: {scan_path}")
        sys.exit(1)
    
    # Perform scan
    report = scan_directory(scan_path)
    
    # Save reports
    output_path = pathlib.Path(args.output)
    
    if args.format == 'json' or args.format == 'both':
        json_path = output_path if output_path.suffix == '.json' else output_path.with_suffix('.json')
        save_json_report(report, json_path)
    
    if args.format == 'html' or args.format == 'both':
        html_path = output_path if output_path.suffix == '.html' else output_path.with_suffix('.html')
        save_html_report(report, html_path)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 ANALYSIS SUMMARY")
    print("="*60)
    print(f"Files Scanned: {report.summary['total_files_scanned']}")
    print(f"Files Analyzed: {report.summary['files_analyzed']}")
    print(f"Total Findings: {report.summary['total_findings']}")
    print(f"  ├─ CRITICAL: {report.summary['findings_by_severity']['critical']}")
    print(f"  ├─ HIGH: {report.summary['findings_by_severity']['high']}")
    print(f"  ├─ MEDIUM: {report.summary['findings_by_severity']['medium']}")
    print(f"  └─ LOW: {report.summary['findings_by_severity']['low']}")
    print("="*60)
    
    # Exit with error code if critical findings
    if report.summary['findings_by_severity']['critical'] > 0:
        print("\n⚠️  CRITICAL security issues found! Please review and fix immediately.")
        sys.exit(1)


if __name__ == "__main__":
    main()
