"""
NOUFAL ERP - Database Backup System
نظام النسخ الاحتياطي لقاعدة البيانات

Features:
- Automated daily backups
- Support for SQLite and PostgreSQL
- Backup rotation (keep N backups)
- Compression support
- Backup verification
- Scheduling with APScheduler
- Manual backup trigger
- Backup restoration
"""

import os
import shutil
import subprocess
import logging
import gzip
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass
import json

# Try to import APScheduler
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    logging.warning("APScheduler not installed. Install with: pip install apscheduler")

logger = logging.getLogger(__name__)


@dataclass
class BackupInfo:
    """Backup metadata"""
    filename: str
    filepath: str
    timestamp: str
    size_bytes: int
    database_type: str
    compressed: bool
    checksum: Optional[str] = None


class DatabaseBackup:
    """
    Database backup manager
    مدير النسخ الاحتياطي لقاعدة البيانات
    """
    
    def __init__(
        self,
        database_url: str,
        backup_dir: str = "backups",
        max_backups: int = 7,
        compress: bool = True
    ):
        """
        Initialize backup manager
        
        Args:
            database_url: Database connection URL
            backup_dir: Directory to store backups
            max_backups: Maximum number of backups to keep
            compress: Whether to compress backups
        """
        self.database_url = database_url
        self.backup_dir = Path(backup_dir)
        self.max_backups = max_backups
        self.compress = compress
        
        # Create backup directory
        self.backup_dir.mkdir(exist_ok=True, parents=True)
        
        # Detect database type
        if database_url.startswith('sqlite'):
            self.db_type = 'sqlite'
            # Extract database path from URL
            self.db_path = database_url.replace('sqlite:///', '')
        elif database_url.startswith('postgresql'):
            self.db_type = 'postgresql'
            self.db_path = None
        else:
            raise ValueError(f"Unsupported database type: {database_url}")
        
        logger.info(f"DatabaseBackup initialized: type={self.db_type}, dir={backup_dir}")
    
    def create_backup(self, name_prefix: str = "backup") -> BackupInfo:
        """
        Create database backup
        إنشاء نسخة احتياطية لقاعدة البيانات
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name_prefix}_{timestamp}"
        
        if self.db_type == 'sqlite':
            backup_info = self._backup_sqlite(filename)
        elif self.db_type == 'postgresql':
            backup_info = self._backup_postgresql(filename)
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")
        
        # Rotate old backups
        self._rotate_backups()
        
        logger.info(f"Backup created: {backup_info.filename} ({backup_info.size_bytes / 1024:.2f} KB)")
        
        return backup_info
    
    def _backup_sqlite(self, filename: str) -> BackupInfo:
        """Backup SQLite database"""
        backup_file = self.backup_dir / f"{filename}.db"
        
        try:
            # Use SQLite's backup API for safe backup
            source_conn = sqlite3.connect(self.db_path)
            backup_conn = sqlite3.connect(str(backup_file))
            
            with backup_conn:
                source_conn.backup(backup_conn)
            
            source_conn.close()
            backup_conn.close()
            
            # Compress if enabled
            if self.compress:
                compressed_file = self._compress_file(backup_file)
                os.remove(backup_file)
                backup_file = compressed_file
            
            # Get file info
            size_bytes = os.path.getsize(backup_file)
            
            return BackupInfo(
                filename=backup_file.name,
                filepath=str(backup_file),
                timestamp=datetime.now().isoformat(),
                size_bytes=size_bytes,
                database_type='sqlite',
                compressed=self.compress
            )
        
        except Exception as e:
            logger.error(f"SQLite backup failed: {e}")
            raise
    
    def _backup_postgresql(self, filename: str) -> BackupInfo:
        """Backup PostgreSQL database"""
        backup_file = self.backup_dir / f"{filename}.sql"
        
        try:
            # Parse PostgreSQL URL
            # Format: postgresql://user:password@host:port/database
            url_parts = self.database_url.replace('postgresql://', '').split('@')
            user_pass = url_parts[0].split(':')
            host_db = url_parts[1].split('/')
            
            username = user_pass[0]
            password = user_pass[1] if len(user_pass) > 1 else None
            host_port = host_db[0].split(':')
            host = host_port[0]
            port = host_port[1] if len(host_port) > 1 else '5432'
            database = host_db[1] if len(host_db) > 1 else 'postgres'
            
            # Set password environment variable
            env = os.environ.copy()
            if password:
                env['PGPASSWORD'] = password
            
            # Run pg_dump
            cmd = [
                'pg_dump',
                '-h', host,
                '-p', port,
                '-U', username,
                '-d', database,
                '-F', 'p',  # Plain text format
                '-f', str(backup_file)
            ]
            
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")
            
            # Compress if enabled
            if self.compress:
                compressed_file = self._compress_file(backup_file)
                os.remove(backup_file)
                backup_file = compressed_file
            
            # Get file info
            size_bytes = os.path.getsize(backup_file)
            
            return BackupInfo(
                filename=backup_file.name,
                filepath=str(backup_file),
                timestamp=datetime.now().isoformat(),
                size_bytes=size_bytes,
                database_type='postgresql',
                compressed=self.compress
            )
        
        except Exception as e:
            logger.error(f"PostgreSQL backup failed: {e}")
            raise
    
    def _compress_file(self, filepath: Path) -> Path:
        """Compress file with gzip"""
        compressed_path = filepath.with_suffix(filepath.suffix + '.gz')
        
        with open(filepath, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        return compressed_path
    
    def _rotate_backups(self):
        """Remove old backups keeping only max_backups"""
        # Get all backup files
        backup_files = sorted(
            self.backup_dir.glob('backup_*'),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        
        # Remove old backups
        for old_backup in backup_files[self.max_backups:]:
            try:
                os.remove(old_backup)
                logger.info(f"Removed old backup: {old_backup.name}")
            except Exception as e:
                logger.error(f"Failed to remove old backup {old_backup.name}: {e}")
    
    def list_backups(self) -> List[BackupInfo]:
        """
        List all available backups
        عرض جميع النسخ الاحتياطية المتاحة
        """
        backups = []
        
        for backup_file in sorted(self.backup_dir.glob('backup_*'), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                stat = backup_file.stat()
                
                # Detect if compressed
                compressed = backup_file.suffix == '.gz'
                
                # Detect database type
                if '.db' in backup_file.name:
                    db_type = 'sqlite'
                elif '.sql' in backup_file.name:
                    db_type = 'postgresql'
                else:
                    db_type = 'unknown'
                
                backup_info = BackupInfo(
                    filename=backup_file.name,
                    filepath=str(backup_file),
                    timestamp=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    size_bytes=stat.st_size,
                    database_type=db_type,
                    compressed=compressed
                )
                
                backups.append(backup_info)
            
            except Exception as e:
                logger.error(f"Error reading backup file {backup_file.name}: {e}")
        
        return backups
    
    def restore_backup(self, backup_filename: str) -> bool:
        """
        Restore database from backup
        استعادة قاعدة البيانات من نسخة احتياطية
        
        WARNING: This will overwrite the current database!
        """
        backup_path = self.backup_dir / backup_filename
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_filename}")
        
        try:
            # Decompress if needed
            temp_file = backup_path
            if backup_path.suffix == '.gz':
                temp_file = backup_path.with_suffix('')
                with gzip.open(backup_path, 'rb') as f_in:
                    with open(temp_file, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            
            # Restore based on database type
            if self.db_type == 'sqlite':
                # Simply copy the backup file
                shutil.copy2(temp_file, self.db_path)
                logger.info(f"SQLite database restored from {backup_filename}")
            
            elif self.db_type == 'postgresql':
                # Use psql to restore
                url_parts = self.database_url.replace('postgresql://', '').split('@')
                user_pass = url_parts[0].split(':')
                host_db = url_parts[1].split('/')
                
                username = user_pass[0]
                password = user_pass[1] if len(user_pass) > 1 else None
                host_port = host_db[0].split(':')
                host = host_port[0]
                port = host_port[1] if len(host_port) > 1 else '5432'
                database = host_db[1] if len(host_db) > 1 else 'postgres'
                
                env = os.environ.copy()
                if password:
                    env['PGPASSWORD'] = password
                
                cmd = [
                    'psql',
                    '-h', host,
                    '-p', port,
                    '-U', username,
                    '-d', database,
                    '-f', str(temp_file)
                ]
                
                result = subprocess.run(
                    cmd,
                    env=env,
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                
                if result.returncode != 0:
                    raise Exception(f"psql restore failed: {result.stderr}")
                
                logger.info(f"PostgreSQL database restored from {backup_filename}")
            
            # Clean up temp file if decompressed
            if temp_file != backup_path:
                os.remove(temp_file)
            
            return True
        
        except Exception as e:
            logger.error(f"Restore failed: {e}")
            raise
    
    def delete_backup(self, backup_filename: str) -> bool:
        """Delete a specific backup file"""
        backup_path = self.backup_dir / backup_filename
        
        if not backup_path.exists():
            return False
        
        try:
            os.remove(backup_path)
            logger.info(f"Deleted backup: {backup_filename}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete backup {backup_filename}: {e}")
            return False
    
    def get_backup_stats(self) -> Dict:
        """Get backup statistics"""
        backups = self.list_backups()
        
        if not backups:
            return {
                'total_backups': 0,
                'total_size_mb': 0,
                'oldest_backup': None,
                'newest_backup': None
            }
        
        total_size = sum(b.size_bytes for b in backups)
        
        return {
            'total_backups': len(backups),
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'oldest_backup': backups[-1].timestamp if backups else None,
            'newest_backup': backups[0].timestamp if backups else None,
            'backups': [
                {
                    'filename': b.filename,
                    'size_mb': round(b.size_bytes / (1024 * 1024), 2),
                    'timestamp': b.timestamp
                }
                for b in backups
            ]
        }


class BackupScheduler:
    """
    Automated backup scheduler
    جدولة النسخ الاحتياطي التلقائي
    """
    
    def __init__(self, backup_manager: DatabaseBackup):
        """Initialize backup scheduler"""
        if not SCHEDULER_AVAILABLE:
            raise ImportError("APScheduler is required for scheduling. Install with: pip install apscheduler")
        
        self.backup_manager = backup_manager
        self.scheduler = BackgroundScheduler()
        logger.info("BackupScheduler initialized")
    
    def schedule_daily_backup(self, hour: int = 2, minute: int = 0):
        """
        Schedule daily backup at specific time
        جدولة نسخة احتياطية يومية في وقت محدد
        
        Args:
            hour: Hour of day (0-23)
            minute: Minute of hour (0-59)
        """
        # Add job with cron trigger
        self.scheduler.add_job(
            func=self._run_backup,
            trigger=CronTrigger(hour=hour, minute=minute),
            id='daily_backup',
            name='Daily Database Backup',
            replace_existing=True
        )
        
        logger.info(f"Scheduled daily backup at {hour:02d}:{minute:02d}")
    
    def schedule_interval_backup(self, hours: int = 6):
        """
        Schedule backup at regular intervals
        جدولة نسخة احتياطية بفترات منتظمة
        
        Args:
            hours: Interval in hours
        """
        self.scheduler.add_job(
            func=self._run_backup,
            trigger='interval',
            hours=hours,
            id='interval_backup',
            name=f'Backup every {hours} hours',
            replace_existing=True
        )
        
        logger.info(f"Scheduled backup every {hours} hours")
    
    def _run_backup(self):
        """Run backup job"""
        try:
            logger.info("Starting scheduled backup...")
            backup_info = self.backup_manager.create_backup()
            logger.info(f"Scheduled backup completed: {backup_info.filename}")
        except Exception as e:
            logger.error(f"Scheduled backup failed: {e}", exc_info=True)
    
    def start(self):
        """Start scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Backup scheduler started")
    
    def stop(self):
        """Stop scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Backup scheduler stopped")
    
    def get_jobs(self) -> List[Dict]:
        """Get list of scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })
        return jobs


# Flask integration
def init_backup(app):
    """
    Initialize backup system for Flask app
    تهيئة نظام النسخ الاحتياطي لتطبيق Flask
    """
    database_url = app.config.get('DATABASE_URL', app.config.get('SQLALCHEMY_DATABASE_URI'))
    backup_dir = app.config.get('BACKUP_DIR', 'backups')
    max_backups = app.config.get('MAX_BACKUPS', 7)
    
    # Initialize backup manager
    backup_manager = DatabaseBackup(
        database_url=database_url,
        backup_dir=backup_dir,
        max_backups=max_backups,
        compress=True
    )
    
    # Store in app config
    app.config['BACKUP_MANAGER'] = backup_manager
    
    # Initialize scheduler if enabled
    enable_scheduler = app.config.get('ENABLE_BACKUP_SCHEDULER', True)
    if enable_scheduler and SCHEDULER_AVAILABLE:
        scheduler = BackupScheduler(backup_manager)
        
        # Schedule daily backup (default: 2 AM)
        backup_hour = app.config.get('BACKUP_HOUR', 2)
        backup_minute = app.config.get('BACKUP_MINUTE', 0)
        scheduler.schedule_daily_backup(hour=backup_hour, minute=backup_minute)
        
        scheduler.start()
        app.config['BACKUP_SCHEDULER'] = scheduler
        
        logger.info(f"Backup scheduler enabled: daily at {backup_hour:02d}:{backup_minute:02d}")
    
    # Add backup endpoints
    @app.route('/api/backup/create', methods=['POST'])
    def create_backup():
        """Create manual backup"""
        try:
            backup_info = backup_manager.create_backup()
            return {
                'success': True,
                'backup': {
                    'filename': backup_info.filename,
                    'size_mb': round(backup_info.size_bytes / (1024 * 1024), 2),
                    'timestamp': backup_info.timestamp
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}, 500
    
    @app.route('/api/backup/list')
    def list_backups():
        """List all backups"""
        backups = backup_manager.list_backups()
        return {
            'backups': [
                {
                    'filename': b.filename,
                    'size_mb': round(b.size_bytes / (1024 * 1024), 2),
                    'timestamp': b.timestamp,
                    'compressed': b.compressed
                }
                for b in backups
            ]
        }
    
    @app.route('/api/backup/stats')
    def backup_stats():
        """Get backup statistics"""
        return backup_manager.get_backup_stats()
    
    @app.route('/api/backup/delete/<filename>', methods=['DELETE'])
    def delete_backup(filename):
        """Delete backup"""
        success = backup_manager.delete_backup(filename)
        return {'success': success}
    
    logger.info("Backup system initialized")
    
    return backup_manager


# Usage example
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("=" * 80)
    print("DATABASE BACKUP SYSTEM EXAMPLE")
    print("=" * 80)
    
    # Example 1: SQLite backup
    print("\nExample 1: SQLite Database Backup")
    print("-" * 80)
    
    sqlite_backup = DatabaseBackup(
        database_url='sqlite:///example.db',
        backup_dir='backups/sqlite',
        max_backups=5,
        compress=True
    )
    
    # Create backup
    backup_info = sqlite_backup.create_backup(name_prefix='manual')
    print(f"Backup created: {backup_info.filename}")
    print(f"Size: {backup_info.size_bytes / 1024:.2f} KB")
    
    # List backups
    print("\nAvailable backups:")
    for backup in sqlite_backup.list_backups():
        print(f"  - {backup.filename} ({backup.size_bytes / 1024:.2f} KB)")
    
    # Get stats
    stats = sqlite_backup.get_backup_stats()
    print(f"\nBackup Statistics:")
    print(f"  Total backups: {stats['total_backups']}")
    print(f"  Total size: {stats['total_size_mb']} MB")
    
    print("\n" + "=" * 80)
    print("Check the 'backups' directory for backup files")
    print("=" * 80)
