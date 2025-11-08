"""
NOUFAL ERP - System Monitoring Module
نظام مراقبة الأداء - مراقبة CPU, RAM, Disk, Network

Features:
- Real-time CPU and RAM monitoring
- System health checks
- Resource usage tracking
- Performance metrics collection
- Alert system for high resource usage
"""

import psutil
import os
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from threading import Thread, Lock
import json

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class SystemMetrics:
    """System metrics data structure"""
    timestamp: str
    cpu_percent: float
    cpu_count: int
    cpu_freq_current: float
    ram_total_gb: float
    ram_used_gb: float
    ram_available_gb: float
    ram_percent: float
    disk_total_gb: float
    disk_used_gb: float
    disk_free_gb: float
    disk_percent: float
    swap_total_gb: float
    swap_used_gb: float
    swap_percent: float
    network_bytes_sent: int
    network_bytes_recv: int
    process_count: int
    boot_time: str


@dataclass
class ProcessMetrics:
    """Process-level metrics"""
    pid: int
    name: str
    cpu_percent: float
    memory_mb: float
    memory_percent: float
    status: str
    create_time: str


class SystemMonitor:
    """
    System monitoring class for tracking CPU, RAM, Disk, and Network usage
    مراقب النظام لتتبع استخدام المعالج والذاكرة والقرص والشبكة
    """
    
    def __init__(self, warning_threshold: Dict[str, float] = None):
        """
        Initialize system monitor
        
        Args:
            warning_threshold: Dict with keys 'cpu', 'ram', 'disk' and percentage values
        """
        self.warning_threshold = warning_threshold or {
            'cpu': 80.0,    # 80% CPU usage warning
            'ram': 85.0,    # 85% RAM usage warning
            'disk': 90.0,   # 90% Disk usage warning
        }
        self.metrics_history: List[SystemMetrics] = []
        self.max_history_size = 1000  # Keep last 1000 readings
        self._lock = Lock()
        self._monitoring = False
        self._monitor_thread: Optional[Thread] = None
        
        logger.info("SystemMonitor initialized with thresholds: %s", self.warning_threshold)
    
    def get_current_metrics(self) -> SystemMetrics:
        """
        Get current system metrics
        الحصول على مقاييس النظام الحالية
        """
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        cpu_freq_current = cpu_freq.current if cpu_freq else 0.0
        
        # Memory metrics
        memory = psutil.virtual_memory()
        ram_total_gb = memory.total / (1024 ** 3)
        ram_used_gb = memory.used / (1024 ** 3)
        ram_available_gb = memory.available / (1024 ** 3)
        ram_percent = memory.percent
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_total_gb = disk.total / (1024 ** 3)
        disk_used_gb = disk.used / (1024 ** 3)
        disk_free_gb = disk.free / (1024 ** 3)
        disk_percent = disk.percent
        
        # Swap metrics
        swap = psutil.swap_memory()
        swap_total_gb = swap.total / (1024 ** 3)
        swap_used_gb = swap.used / (1024 ** 3)
        swap_percent = swap.percent
        
        # Network metrics
        network = psutil.net_io_counters()
        network_bytes_sent = network.bytes_sent
        network_bytes_recv = network.bytes_recv
        
        # Process count
        process_count = len(psutil.pids())
        
        # Boot time
        boot_time = datetime.fromtimestamp(psutil.boot_time()).isoformat()
        
        metrics = SystemMetrics(
            timestamp=datetime.now().isoformat(),
            cpu_percent=cpu_percent,
            cpu_count=cpu_count,
            cpu_freq_current=cpu_freq_current,
            ram_total_gb=round(ram_total_gb, 2),
            ram_used_gb=round(ram_used_gb, 2),
            ram_available_gb=round(ram_available_gb, 2),
            ram_percent=ram_percent,
            disk_total_gb=round(disk_total_gb, 2),
            disk_used_gb=round(disk_used_gb, 2),
            disk_free_gb=round(disk_free_gb, 2),
            disk_percent=disk_percent,
            swap_total_gb=round(swap_total_gb, 2),
            swap_used_gb=round(swap_used_gb, 2),
            swap_percent=swap_percent,
            network_bytes_sent=network_bytes_sent,
            network_bytes_recv=network_bytes_recv,
            process_count=process_count,
            boot_time=boot_time
        )
        
        # Store in history
        with self._lock:
            self.metrics_history.append(metrics)
            if len(self.metrics_history) > self.max_history_size:
                self.metrics_history.pop(0)
        
        # Check thresholds and log warnings
        self._check_thresholds(metrics)
        
        return metrics
    
    def _check_thresholds(self, metrics: SystemMetrics):
        """Check if any metrics exceed warning thresholds"""
        if metrics.cpu_percent > self.warning_threshold['cpu']:
            logger.warning(
                "⚠️ HIGH CPU USAGE: %.1f%% (threshold: %.1f%%)",
                metrics.cpu_percent,
                self.warning_threshold['cpu']
            )
        
        if metrics.ram_percent > self.warning_threshold['ram']:
            logger.warning(
                "⚠️ HIGH RAM USAGE: %.1f%% (threshold: %.1f%%) - Used: %.2f GB / Total: %.2f GB",
                metrics.ram_percent,
                self.warning_threshold['ram'],
                metrics.ram_used_gb,
                metrics.ram_total_gb
            )
        
        if metrics.disk_percent > self.warning_threshold['disk']:
            logger.warning(
                "⚠️ HIGH DISK USAGE: %.1f%% (threshold: %.1f%%) - Used: %.2f GB / Total: %.2f GB",
                metrics.disk_percent,
                self.warning_threshold['disk'],
                metrics.disk_used_gb,
                metrics.disk_total_gb
            )
    
    def get_process_metrics(self, top_n: int = 10) -> List[ProcessMetrics]:
        """
        Get top N processes by CPU usage
        الحصول على أعلى N عملية حسب استخدام المعالج
        """
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'status', 'create_time']):
            try:
                pinfo = proc.info
                processes.append(ProcessMetrics(
                    pid=pinfo['pid'],
                    name=pinfo['name'],
                    cpu_percent=pinfo['cpu_percent'] or 0.0,
                    memory_mb=round(pinfo['memory_info'].rss / (1024 * 1024), 2),
                    memory_percent=proc.memory_percent(),
                    status=pinfo['status'],
                    create_time=datetime.fromtimestamp(pinfo['create_time']).isoformat()
                ))
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        # Sort by CPU usage and return top N
        processes.sort(key=lambda x: x.cpu_percent, reverse=True)
        return processes[:top_n]
    
    def get_health_status(self) -> Dict:
        """
        Get overall system health status
        الحصول على حالة صحة النظام الشاملة
        """
        metrics = self.get_current_metrics()
        
        # Determine health status
        status = "healthy"
        warnings = []
        
        if metrics.cpu_percent > self.warning_threshold['cpu']:
            status = "warning"
            warnings.append(f"High CPU usage: {metrics.cpu_percent}%")
        
        if metrics.ram_percent > self.warning_threshold['ram']:
            status = "warning"
            warnings.append(f"High RAM usage: {metrics.ram_percent}%")
        
        if metrics.disk_percent > self.warning_threshold['disk']:
            status = "critical" if metrics.disk_percent > 95 else "warning"
            warnings.append(f"High disk usage: {metrics.disk_percent}%")
        
        return {
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "metrics": asdict(metrics),
            "warnings": warnings,
            "thresholds": self.warning_threshold
        }
    
    def get_metrics_summary(self, last_n: int = 60) -> Dict:
        """
        Get summary of last N metrics (averages, min, max)
        الحصول على ملخص آخر N قياس (المتوسطات والحد الأدنى والأقصى)
        """
        with self._lock:
            recent_metrics = self.metrics_history[-last_n:] if self.metrics_history else []
        
        if not recent_metrics:
            return {"error": "No metrics available"}
        
        # Calculate statistics
        cpu_values = [m.cpu_percent for m in recent_metrics]
        ram_values = [m.ram_percent for m in recent_metrics]
        disk_values = [m.disk_percent for m in recent_metrics]
        
        return {
            "period": f"Last {len(recent_metrics)} readings",
            "cpu": {
                "avg": round(sum(cpu_values) / len(cpu_values), 2),
                "min": round(min(cpu_values), 2),
                "max": round(max(cpu_values), 2),
                "current": cpu_values[-1]
            },
            "ram": {
                "avg": round(sum(ram_values) / len(ram_values), 2),
                "min": round(min(ram_values), 2),
                "max": round(max(ram_values), 2),
                "current": ram_values[-1]
            },
            "disk": {
                "avg": round(sum(disk_values) / len(disk_values), 2),
                "min": round(min(disk_values), 2),
                "max": round(max(disk_values), 2),
                "current": disk_values[-1]
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def start_monitoring(self, interval: int = 60):
        """
        Start continuous monitoring in background thread
        بدء المراقبة المستمرة في خلفية
        
        Args:
            interval: Monitoring interval in seconds (default: 60)
        """
        if self._monitoring:
            logger.warning("Monitoring already running")
            return
        
        self._monitoring = True
        
        def monitor_loop():
            logger.info(f"Started monitoring with {interval}s interval")
            while self._monitoring:
                try:
                    self.get_current_metrics()
                    time.sleep(interval)
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {e}")
                    time.sleep(interval)
        
        self._monitor_thread = Thread(target=monitor_loop, daemon=True)
        self._monitor_thread.start()
        logger.info("Monitoring thread started")
    
    def stop_monitoring(self):
        """Stop continuous monitoring"""
        if self._monitoring:
            self._monitoring = False
            if self._monitor_thread:
                self._monitor_thread.join(timeout=5)
            logger.info("Monitoring stopped")
    
    def export_metrics(self, filepath: str):
        """
        Export metrics history to JSON file
        تصدير سجل المقاييس إلى ملف JSON
        """
        with self._lock:
            metrics_data = [asdict(m) for m in self.metrics_history]
        
        with open(filepath, 'w') as f:
            json.dump(metrics_data, f, indent=2)
        
        logger.info(f"Exported {len(metrics_data)} metrics to {filepath}")
    
    def clear_history(self):
        """Clear metrics history"""
        with self._lock:
            self.metrics_history.clear()
        logger.info("Metrics history cleared")


# Flask integration
def init_monitoring(app):
    """
    Initialize monitoring for Flask app
    تهيئة المراقبة لتطبيق Flask
    """
    monitor = SystemMonitor()
    
    # Store monitor in app config
    app.config['SYSTEM_MONITOR'] = monitor
    
    # Start monitoring if enabled in config
    if app.config.get('ENABLE_MONITORING', True):
        interval = app.config.get('MONITORING_INTERVAL', 60)
        monitor.start_monitoring(interval=interval)
        logger.info("System monitoring initialized and started")
    
    # Add monitoring endpoints
    @app.route('/api/monitoring/health')
    def monitoring_health():
        """Get system health status"""
        return monitor.get_health_status()
    
    @app.route('/api/monitoring/metrics')
    def monitoring_metrics():
        """Get current system metrics"""
        metrics = monitor.get_current_metrics()
        return asdict(metrics)
    
    @app.route('/api/monitoring/summary')
    def monitoring_summary():
        """Get metrics summary"""
        last_n = int(app.request.args.get('last', 60))
        return monitor.get_metrics_summary(last_n=last_n)
    
    @app.route('/api/monitoring/processes')
    def monitoring_processes():
        """Get top processes"""
        top_n = int(app.request.args.get('top', 10))
        processes = monitor.get_process_metrics(top_n=top_n)
        return {"processes": [asdict(p) for p in processes]}
    
    return monitor


# Standalone usage example
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create monitor
    monitor = SystemMonitor(warning_threshold={
        'cpu': 70.0,
        'ram': 80.0,
        'disk': 85.0
    })
    
    # Get current metrics
    print("=" * 80)
    print("SYSTEM METRICS")
    print("=" * 80)
    metrics = monitor.get_current_metrics()
    print(f"CPU Usage: {metrics.cpu_percent}%")
    print(f"RAM Usage: {metrics.ram_percent}% ({metrics.ram_used_gb:.2f} GB / {metrics.ram_total_gb:.2f} GB)")
    print(f"Disk Usage: {metrics.disk_percent}% ({metrics.disk_used_gb:.2f} GB / {metrics.disk_total_gb:.2f} GB)")
    print(f"Process Count: {metrics.process_count}")
    
    # Get top processes
    print("\n" + "=" * 80)
    print("TOP 5 PROCESSES BY CPU USAGE")
    print("=" * 80)
    processes = monitor.get_process_metrics(top_n=5)
    for i, proc in enumerate(processes, 1):
        print(f"{i}. {proc.name} (PID: {proc.pid})")
        print(f"   CPU: {proc.cpu_percent}% | RAM: {proc.memory_mb:.2f} MB ({proc.memory_percent:.2f}%)")
    
    # Get health status
    print("\n" + "=" * 80)
    print("HEALTH STATUS")
    print("=" * 80)
    health = monitor.get_health_status()
    print(f"Status: {health['status'].upper()}")
    if health['warnings']:
        print("Warnings:")
        for warning in health['warnings']:
            print(f"  - {warning}")
    else:
        print("No warnings - System is healthy!")
