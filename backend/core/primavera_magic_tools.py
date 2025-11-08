"""
Primavera Magic Tools - نظام الأدوات السحرية لـ Primavera P6
===============================================================

مجموعة من 7 أدوات متكاملة للعمل مع Primavera P6 وExcel:
1. SDK Magic Tool - التكامل مع Primavera SDK
2. XER Magic Tool - قراءة وتحليل ملفات XER
3. XLS Magic Tool - تحويل وتصدير لـ Excel
4. SQL Magic Tool - الاستعلامات المباشرة من قاعدة البيانات
5. WBS Magic Tool - إنشاء وإدارة WBS
6. RSC Magic Tool - إدارة الموارد
7. BOQ Magic Tool - ربط BOQ مع Primavera
"""

import re
import json
import sqlite3
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
import xml.etree.ElementTree as ET


# ============================================
# Data Classes
# ============================================

@dataclass
class PrimaveraActivity:
    """نشاط Primavera"""
    activity_id: str
    activity_name: str
    wbs_id: str
    original_duration: float
    remaining_duration: float
    actual_start: Optional[str] = None
    actual_finish: Optional[str] = None
    planned_start: Optional[str] = None
    planned_finish: Optional[str] = None
    percent_complete: float = 0.0
    activity_type: str = "Task Dependent"
    status: str = "Not Started"
    calendar_id: str = "Standard"
    predecessors: List[str] = None
    successors: List[str] = None
    resources: List[Dict] = None
    
    def __post_init__(self):
        if self.predecessors is None:
            self.predecessors = []
        if self.successors is None:
            self.successors = []
        if self.resources is None:
            self.resources = []


@dataclass
class PrimaveraWBS:
    """هيكل تقسيم العمل WBS"""
    wbs_id: str
    wbs_name: str
    parent_wbs_id: Optional[str] = None
    wbs_short_name: Optional[str] = None
    seq_num: int = 1
    level: int = 1


@dataclass
class PrimaveraResource:
    """مورد Primavera"""
    resource_id: str
    resource_name: str
    resource_type: str = "Labor"  # Labor, Material, Nonlabor
    unit_of_measure: str = "Hour"
    normal_units_per_time: float = 1.0
    max_units_per_time: float = 1.0
    unit_price: float = 0.0


@dataclass
class ResourceAssignment:
    """تعيين مورد لنشاط"""
    activity_id: str
    resource_id: str
    budgeted_units: float
    actual_units: float = 0.0
    remaining_units: float = 0.0
    budgeted_cost: float = 0.0
    actual_cost: float = 0.0


# ============================================
# 1. SDK Magic Tool
# ============================================

class SDKMagicTool:
    """
    أداة SDK السحرية - التكامل مع Primavera SDK
    
    الوظائف:
    - Import/Export من وإلى Primavera P6
    - قراءة وكتابة الأنشطة والموارد
    - التعامل مع User Defined Fields (UDF)
    - Batch operations
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """تهيئة قاعدة بيانات Primavera"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # جدول المشاريع
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_projects (
                project_id TEXT PRIMARY KEY,
                project_name TEXT,
                project_short_name TEXT,
                project_start_date TEXT,
                project_finish_date TEXT,
                status TEXT,
                created_date TEXT,
                last_update_date TEXT
            )
        """)
        
        # جدول WBS
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_wbs (
                wbs_id TEXT PRIMARY KEY,
                project_id TEXT,
                wbs_name TEXT,
                parent_wbs_id TEXT,
                wbs_short_name TEXT,
                seq_num INTEGER,
                level INTEGER,
                FOREIGN KEY (project_id) REFERENCES primavera_projects(project_id)
            )
        """)
        
        # جدول الأنشطة
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_activities (
                activity_id TEXT PRIMARY KEY,
                project_id TEXT,
                wbs_id TEXT,
                activity_name TEXT,
                activity_type TEXT,
                status TEXT,
                original_duration REAL,
                remaining_duration REAL,
                percent_complete REAL,
                planned_start TEXT,
                planned_finish TEXT,
                actual_start TEXT,
                actual_finish TEXT,
                calendar_id TEXT,
                FOREIGN KEY (project_id) REFERENCES primavera_projects(project_id),
                FOREIGN KEY (wbs_id) REFERENCES primavera_wbs(wbs_id)
            )
        """)
        
        # جدول الموارد
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_resources (
                resource_id TEXT PRIMARY KEY,
                project_id TEXT,
                resource_name TEXT,
                resource_type TEXT,
                unit_of_measure TEXT,
                normal_units_per_time REAL,
                max_units_per_time REAL,
                unit_price REAL,
                FOREIGN KEY (project_id) REFERENCES primavera_projects(project_id)
            )
        """)
        
        # جدول تعيينات الموارد
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_resource_assignments (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_id TEXT,
                resource_id TEXT,
                budgeted_units REAL,
                actual_units REAL,
                remaining_units REAL,
                budgeted_cost REAL,
                actual_cost REAL,
                FOREIGN KEY (activity_id) REFERENCES primavera_activities(activity_id),
                FOREIGN KEY (resource_id) REFERENCES primavera_resources(resource_id)
            )
        """)
        
        # جدول العلاقات (Predecessors/Successors)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS primavera_relationships (
                relationship_id INTEGER PRIMARY KEY AUTOINCREMENT,
                predecessor_id TEXT,
                successor_id TEXT,
                relationship_type TEXT,
                lag_value REAL,
                FOREIGN KEY (predecessor_id) REFERENCES primavera_activities(activity_id),
                FOREIGN KEY (successor_id) REFERENCES primavera_activities(activity_id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def import_activities_from_excel(self, activities_data: List[Dict]) -> Dict:
        """استيراد الأنشطة من Excel إلى قاعدة البيانات"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        imported_count = 0
        errors = []
        
        for activity in activities_data:
            try:
                cursor.execute("""
                    INSERT OR REPLACE INTO primavera_activities 
                    (activity_id, project_id, wbs_id, activity_name, activity_type, 
                     status, original_duration, remaining_duration, percent_complete,
                     planned_start, planned_finish, actual_start, actual_finish, calendar_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    activity.get('activity_id'),
                    activity.get('project_id', 'DEFAULT_PROJECT'),
                    activity.get('wbs_id', 'WBS_ROOT'),
                    activity.get('activity_name'),
                    activity.get('activity_type', 'Task Dependent'),
                    activity.get('status', 'Not Started'),
                    float(activity.get('original_duration', 0)),
                    float(activity.get('remaining_duration', 0)),
                    float(activity.get('percent_complete', 0)),
                    activity.get('planned_start'),
                    activity.get('planned_finish'),
                    activity.get('actual_start'),
                    activity.get('actual_finish'),
                    activity.get('calendar_id', 'Standard')
                ))
                imported_count += 1
            except Exception as e:
                errors.append({
                    'activity_id': activity.get('activity_id'),
                    'error': str(e)
                })
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'imported_count': imported_count,
            'total_count': len(activities_data),
            'errors': errors
        }
    
    def export_activities_to_excel(self, project_id: str = None) -> List[Dict]:
        """تصدير الأنشطة إلى Excel"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute("""
                SELECT * FROM primavera_activities WHERE project_id = ?
            """, (project_id,))
        else:
            cursor.execute("SELECT * FROM primavera_activities")
        
        columns = [desc[0] for desc in cursor.description]
        activities = []
        
        for row in cursor.fetchall():
            activity = dict(zip(columns, row))
            activities.append(activity)
        
        conn.close()
        return activities
    
    def create_project(self, project_data: Dict) -> Dict:
        """إنشاء مشروع جديد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO primavera_projects 
                (project_id, project_name, project_short_name, project_start_date,
                 project_finish_date, status, created_date, last_update_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                project_data['project_id'],
                project_data['project_name'],
                project_data.get('project_short_name', project_data['project_id']),
                project_data.get('project_start_date'),
                project_data.get('project_finish_date'),
                project_data.get('status', 'Active'),
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'project_id': project_data['project_id'],
                'message': 'تم إنشاء المشروع بنجاح'
            }
        except Exception as e:
            conn.close()
            return {
                'success': False,
                'error': str(e)
            }


# ============================================
# 2. XER Magic Tool
# ============================================

class XERMagicTool:
    """
    أداة XER السحرية - قراءة وتحليل ملفات XER
    
    الوظائف:
    - قراءة ملفات XER (Primavera P6 Export format)
    - تحليل البيانات
    - تحويل إلى Excel
    - Clean and optimize XER files
    """
    
    @staticmethod
    def parse_xer_file(file_path: str) -> Dict:
        """تحليل ملف XER"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # XER format: %T TABLE_NAME followed by %F FIELDS and %R RECORDS
        tables = {}
        current_table = None
        current_fields = []
        
        for line in content.split('\n'):
            line = line.strip()
            
            if line.startswith('%T'):
                # New table
                current_table = line.split('\t')[1] if '\t' in line else line.split()[1]
                tables[current_table] = {
                    'fields': [],
                    'records': []
                }
            
            elif line.startswith('%F') and current_table:
                # Fields definition
                fields = line.split('\t')[1:]
                tables[current_table]['fields'] = fields
                current_fields = fields
            
            elif line.startswith('%R') and current_table:
                # Record data
                values = line.split('\t')[1:]
                if len(values) == len(current_fields):
                    record = dict(zip(current_fields, values))
                    tables[current_table]['records'].append(record)
        
        return {
            'success': True,
            'tables': tables,
            'table_count': len(tables),
            'parsed_date': datetime.now().isoformat()
        }
    
    @staticmethod
    def extract_activities_from_xer(xer_data: Dict) -> List[Dict]:
        """استخراج الأنشطة من ملف XER"""
        activities = []
        
        if 'TASK' in xer_data['tables']:
            for record in xer_data['tables']['TASK']['records']:
                activity = {
                    'activity_id': record.get('task_code', ''),
                    'activity_name': record.get('task_name', ''),
                    'wbs_id': record.get('wbs_id', ''),
                    'original_duration': float(record.get('target_drtn_hr_cnt', 0)) / 8,  # Convert hours to days
                    'remaining_duration': float(record.get('remain_drtn_hr_cnt', 0)) / 8,
                    'percent_complete': float(record.get('phys_complete_pct', 0)),
                    'status': record.get('status_code', ''),
                    'activity_type': record.get('task_type', ''),
                }
                activities.append(activity)
        
        return activities
    
    @staticmethod
    def extract_wbs_from_xer(xer_data: Dict) -> List[Dict]:
        """استخراج WBS من ملف XER"""
        wbs_list = []
        
        if 'PROJWBS' in xer_data['tables']:
            for record in xer_data['tables']['PROJWBS']['records']:
                wbs = {
                    'wbs_id': record.get('wbs_id', ''),
                    'wbs_name': record.get('wbs_name', ''),
                    'parent_wbs_id': record.get('parent_wbs_id', ''),
                    'wbs_short_name': record.get('wbs_short_name', ''),
                    'seq_num': int(record.get('seq_num', 0)),
                }
                wbs_list.append(wbs)
        
        return wbs_list
    
    @staticmethod
    def extract_resources_from_xer(xer_data: Dict) -> List[Dict]:
        """استخراج الموارد من ملف XER"""
        resources = []
        
        if 'RSRC' in xer_data['tables']:
            for record in xer_data['tables']['RSRC']['records']:
                resource = {
                    'resource_id': record.get('rsrc_id', ''),
                    'resource_name': record.get('rsrc_name', ''),
                    'resource_type': record.get('rsrc_type', 'Labor'),
                    'unit_price': float(record.get('unit_price', 0)),
                }
                resources.append(resource)
        
        return resources


# ============================================
# 3. XLS Magic Tool
# ============================================

class XLSMagicTool:
    """
    أداة XLS السحرية - التحويل والتصدير لـ Excel
    
    الوظائف:
    - تحويل بيانات Primavera إلى Excel بتنسيقات مختلفة
    - إنشاء تقارير Excel احترافية
    - Gantt charts في Excel
    - Resource histograms
    """
    
    @staticmethod
    def generate_activity_report(activities: List[Dict]) -> Dict:
        """توليد تقرير الأنشطة لـ Excel"""
        report = {
            'columns': [
                'Activity ID',
                'Activity Name',
                'Original Duration',
                'Remaining Duration',
                '% Complete',
                'Planned Start',
                'Planned Finish',
                'Status'
            ],
            'data': []
        }
        
        for activity in activities:
            row = [
                activity.get('activity_id', ''),
                activity.get('activity_name', ''),
                activity.get('original_duration', 0),
                activity.get('remaining_duration', 0),
                activity.get('percent_complete', 0),
                activity.get('planned_start', ''),
                activity.get('planned_finish', ''),
                activity.get('status', '')
            ]
            report['data'].append(row)
        
        return report
    
    @staticmethod
    def generate_resource_report(resources: List[Dict], assignments: List[Dict]) -> Dict:
        """توليد تقرير الموارد لـ Excel"""
        # تجميع الموارد مع تعييناتها
        resource_map = {}
        
        for resource in resources:
            resource_id = resource['resource_id']
            resource_map[resource_id] = {
                'resource_name': resource['resource_name'],
                'resource_type': resource['resource_type'],
                'unit_price': resource.get('unit_price', 0),
                'total_budgeted_units': 0,
                'total_actual_units': 0,
                'total_cost': 0,
                'assignments': []
            }
        
        for assignment in assignments:
            resource_id = assignment['resource_id']
            if resource_id in resource_map:
                resource_map[resource_id]['total_budgeted_units'] += assignment.get('budgeted_units', 0)
                resource_map[resource_id]['total_actual_units'] += assignment.get('actual_units', 0)
                resource_map[resource_id]['total_cost'] += assignment.get('budgeted_cost', 0)
                resource_map[resource_id]['assignments'].append(assignment)
        
        report = {
            'columns': [
                'Resource ID',
                'Resource Name',
                'Type',
                'Unit Price',
                'Total Units',
                'Actual Units',
                'Total Cost'
            ],
            'data': []
        }
        
        for resource_id, data in resource_map.items():
            row = [
                resource_id,
                data['resource_name'],
                data['resource_type'],
                data['unit_price'],
                data['total_budgeted_units'],
                data['total_actual_units'],
                data['total_cost']
            ]
            report['data'].append(row)
        
        return report


# ============================================
# 4. SQL Magic Tool
# ============================================

class SQLMagicTool:
    """
    أداة SQL السحرية - الاستعلامات المباشرة
    
    الوظائف:
    - تنفيذ استعلامات SQL مباشرة على قاعدة بيانات Primavera
    - Custom queries
    - Data extraction
    - Bulk updates
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def execute_query(self, query: str, params: Tuple = None) -> Dict:
        """تنفيذ استعلام SQL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # Check if it's a SELECT query
            if query.strip().upper().startswith('SELECT'):
                columns = [desc[0] for desc in cursor.description]
                results = []
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
                
                conn.close()
                return {
                    'success': True,
                    'query_type': 'SELECT',
                    'columns': columns,
                    'results': results,
                    'row_count': len(results)
                }
            else:
                # INSERT, UPDATE, DELETE
                conn.commit()
                rows_affected = cursor.rowcount
                conn.close()
                
                return {
                    'success': True,
                    'query_type': 'MODIFY',
                    'rows_affected': rows_affected
                }
        
        except Exception as e:
            conn.close()
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_project_statistics(self, project_id: str) -> Dict:
        """الحصول على إحصائيات المشروع"""
        stats_query = """
            SELECT 
                COUNT(*) as total_activities,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_activities,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_activities,
                SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started_activities,
                AVG(percent_complete) as avg_completion,
                SUM(original_duration) as total_duration,
                SUM(remaining_duration) as remaining_duration
            FROM primavera_activities
            WHERE project_id = ?
        """
        
        result = self.execute_query(stats_query, (project_id,))
        
        if result['success'] and result['results']:
            return result['results'][0]
        else:
            return {}


# ============================================
# 5. WBS Magic Tool
# ============================================

class WBSMagicTool:
    """
    أداة WBS السحرية - إنشاء وإدارة WBS
    
    الوظائف:
    - تصميم WBS في Excel
    - إرسال WBS إلى Primavera
    - Auto-numbering
    - WBS templates
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def create_wbs_from_excel(self, wbs_data: List[Dict], project_id: str) -> Dict:
        """إنشاء WBS من Excel"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        created_count = 0
        errors = []
        
        for wbs in wbs_data:
            try:
                cursor.execute("""
                    INSERT OR REPLACE INTO primavera_wbs 
                    (wbs_id, project_id, wbs_name, parent_wbs_id, wbs_short_name, seq_num, level)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    wbs['wbs_id'],
                    project_id,
                    wbs['wbs_name'],
                    wbs.get('parent_wbs_id'),
                    wbs.get('wbs_short_name', wbs['wbs_id']),
                    wbs.get('seq_num', created_count + 1),
                    wbs.get('level', 1)
                ))
                created_count += 1
            except Exception as e:
                errors.append({
                    'wbs_id': wbs.get('wbs_id'),
                    'error': str(e)
                })
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'created_count': created_count,
            'errors': errors
        }
    
    def get_wbs_hierarchy(self, project_id: str) -> List[Dict]:
        """الحصول على هيكل WBS الكامل"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM primavera_wbs 
            WHERE project_id = ?
            ORDER BY level, seq_num
        """, (project_id,))
        
        columns = [desc[0] for desc in cursor.description]
        wbs_list = []
        
        for row in cursor.fetchall():
            wbs = dict(zip(columns, row))
            wbs_list.append(wbs)
        
        conn.close()
        return wbs_list
    
    def auto_number_wbs(self, project_id: str) -> Dict:
        """ترقيم WBS تلقائياً"""
        wbs_list = self.get_wbs_hierarchy(project_id)
        
        # Build hierarchy tree
        wbs_tree = {}
        for wbs in wbs_list:
            wbs_tree[wbs['wbs_id']] = {
                'data': wbs,
                'children': []
            }
        
        # Assign numbers
        root_nodes = []
        for wbs in wbs_list:
            parent_id = wbs.get('parent_wbs_id')
            if not parent_id or parent_id not in wbs_tree:
                root_nodes.append(wbs['wbs_id'])
            else:
                wbs_tree[parent_id]['children'].append(wbs['wbs_id'])
        
        # Number nodes
        numbering_map = {}
        
        def number_node(node_id, prefix=""):
            if node_id not in wbs_tree:
                return
            
            node = wbs_tree[node_id]
            children = node['children']
            
            for idx, child_id in enumerate(children, 1):
                new_prefix = f"{prefix}.{idx}" if prefix else str(idx)
                numbering_map[child_id] = new_prefix
                number_node(child_id, new_prefix)
        
        for idx, root_id in enumerate(root_nodes, 1):
            numbering_map[root_id] = str(idx)
            number_node(root_id, str(idx))
        
        return {
            'success': True,
            'numbering_map': numbering_map,
            'total_nodes': len(numbering_map)
        }


# ============================================
# 6. RSC Magic Tool
# ============================================

class RSCMagicTool:
    """
    أداة RSC السحرية - إدارة الموارد
    
    الوظائف:
    - Resource loading and leveling
    - Resource histograms
    - Cost analysis
    - Resource assignment optimization
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def get_resource_loading(self, project_id: str, start_date: str, end_date: str) -> Dict:
        """حساب تحميل الموارد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all resource assignments
        cursor.execute("""
            SELECT 
                ra.resource_id,
                r.resource_name,
                r.resource_type,
                SUM(ra.budgeted_units) as total_units,
                SUM(ra.budgeted_cost) as total_cost,
                COUNT(ra.activity_id) as activity_count
            FROM primavera_resource_assignments ra
            JOIN primavera_resources r ON ra.resource_id = r.resource_id
            WHERE r.project_id = ?
            GROUP BY ra.resource_id
        """, (project_id,))
        
        columns = [desc[0] for desc in cursor.description]
        loading_data = []
        
        for row in cursor.fetchall():
            loading_data.append(dict(zip(columns, row)))
        
        conn.close()
        
        return {
            'success': True,
            'loading_data': loading_data,
            'resource_count': len(loading_data)
        }
    
    def create_resource_histogram(self, resource_id: str) -> Dict:
        """إنشاء Histogram للمورد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get resource assignments over time
        cursor.execute("""
            SELECT 
                a.activity_id,
                a.activity_name,
                a.planned_start,
                a.planned_finish,
                ra.budgeted_units,
                ra.budgeted_cost
            FROM primavera_resource_assignments ra
            JOIN primavera_activities a ON ra.activity_id = a.activity_id
            WHERE ra.resource_id = ?
            ORDER BY a.planned_start
        """, (resource_id,))
        
        columns = [desc[0] for desc in cursor.description]
        assignments = []
        
        for row in cursor.fetchall():
            assignments.append(dict(zip(columns, row)))
        
        conn.close()
        
        # Build histogram data
        histogram = {
            'resource_id': resource_id,
            'assignments': assignments,
            'total_units': sum(a['budgeted_units'] for a in assignments),
            'total_cost': sum(a['budgeted_cost'] for a in assignments)
        }
        
        return {
            'success': True,
            'histogram': histogram
        }


# ============================================
# 7. BOQ Magic Tool
# ============================================

class BOQMagicTool:
    """
    أداة BOQ السحرية - ربط BOQ مع Primavera
    
    الوظائف:
    - Load BOQ to Primavera Resource Dictionary
    - Link BOQ items with activities
    - Cost tracking and reporting
    - BOQ vs. Resource comparison
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def import_boq_as_resources(self, boq_items: List[Dict], project_id: str) -> Dict:
        """استيراد BOQ كموارد في Primavera"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        imported_count = 0
        errors = []
        
        for item in boq_items:
            try:
                resource_id = f"BOQ_{item.get('item_id', imported_count+1)}"
                
                cursor.execute("""
                    INSERT OR REPLACE INTO primavera_resources 
                    (resource_id, project_id, resource_name, resource_type, 
                     unit_of_measure, unit_price)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    resource_id,
                    project_id,
                    item.get('description', ''),
                    'Material',
                    item.get('unit', 'LS'),
                    float(item.get('rate', 0))
                ))
                
                imported_count += 1
            except Exception as e:
                errors.append({
                    'item': item.get('description'),
                    'error': str(e)
                })
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'imported_count': imported_count,
            'errors': errors
        }
    
    def link_boq_to_activities(self, boq_links: List[Dict]) -> Dict:
        """ربط بنود BOQ بالأنشطة"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        linked_count = 0
        errors = []
        
        for link in boq_links:
            try:
                cursor.execute("""
                    INSERT INTO primavera_resource_assignments 
                    (activity_id, resource_id, budgeted_units, budgeted_cost)
                    VALUES (?, ?, ?, ?)
                """, (
                    link['activity_id'],
                    f"BOQ_{link['boq_item_id']}",
                    float(link.get('quantity', 0)),
                    float(link.get('cost', 0))
                ))
                
                linked_count += 1
            except Exception as e:
                errors.append({
                    'activity_id': link.get('activity_id'),
                    'error': str(e)
                })
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'linked_count': linked_count,
            'errors': errors
        }
    
    def generate_boq_cost_report(self, project_id: str) -> Dict:
        """توليد تقرير تكاليف BOQ"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                r.resource_id,
                r.resource_name,
                r.unit_price,
                SUM(ra.budgeted_units) as total_quantity,
                SUM(ra.budgeted_cost) as total_cost,
                SUM(ra.actual_units) as actual_quantity,
                SUM(ra.actual_cost) as actual_cost
            FROM primavera_resources r
            LEFT JOIN primavera_resource_assignments ra ON r.resource_id = ra.resource_id
            WHERE r.project_id = ? AND r.resource_id LIKE 'BOQ_%'
            GROUP BY r.resource_id
        """, (project_id,))
        
        columns = [desc[0] for desc in cursor.description]
        report_data = []
        
        for row in cursor.fetchall():
            report_data.append(dict(zip(columns, row)))
        
        conn.close()
        
        # Calculate totals
        total_budgeted = sum(item['total_cost'] for item in report_data)
        total_actual = sum(item['actual_cost'] for item in report_data)
        variance = total_budgeted - total_actual
        
        return {
            'success': True,
            'report_data': report_data,
            'summary': {
                'total_budgeted_cost': total_budgeted,
                'total_actual_cost': total_actual,
                'variance': variance,
                'item_count': len(report_data)
            }
        }


# ============================================
# Unified Magic Tools Manager
# ============================================

class PrimaveraMagicToolsManager:
    """مدير أدوات Primavera Magic Tools"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        
        # Initialize all tools
        self.sdk_tool = SDKMagicTool(db_path)
        self.xer_tool = XERMagicTool()
        self.xls_tool = XLSMagicTool()
        self.sql_tool = SQLMagicTool(db_path)
        self.wbs_tool = WBSMagicTool(db_path)
        self.rsc_tool = RSCMagicTool(db_path)
        self.boq_tool = BOQMagicTool(db_path)
    
    def get_available_tools(self) -> List[Dict]:
        """الحصول على قائمة الأدوات المتاحة"""
        return [
            {
                'id': 'sdk',
                'name': 'SDK Magic Tool',
                'name_ar': 'أداة SDK السحرية',
                'description': 'Import/Export to Primavera P6, UDF handling',
                'icon': '🔌'
            },
            {
                'id': 'xer',
                'name': 'XER Magic Tool',
                'name_ar': 'أداة XER السحرية',
                'description': 'Read, analyze and clean XER files',
                'icon': '📄'
            },
            {
                'id': 'xls',
                'name': 'XLS Magic Tool',
                'name_ar': 'أداة XLS السحرية',
                'description': 'Convert and export to Excel with formatting',
                'icon': '📊'
            },
            {
                'id': 'sql',
                'name': 'SQL Magic Tool',
                'name_ar': 'أداة SQL السحرية',
                'description': 'Direct SQL queries and bulk operations',
                'icon': '🔍'
            },
            {
                'id': 'wbs',
                'name': 'WBS Magic Tool',
                'name_ar': 'أداة WBS السحرية',
                'description': 'Design and create WBS in Excel',
                'icon': '🌳'
            },
            {
                'id': 'rsc',
                'name': 'RSC Magic Tool',
                'name_ar': 'أداة RSC السحرية',
                'description': 'Resource management and histograms',
                'icon': '👥'
            },
            {
                'id': 'boq',
                'name': 'BOQ Magic Tool',
                'name_ar': 'أداة BOQ السحرية',
                'description': 'Link BOQ with Primavera activities',
                'icon': '💰'
            }
        ]


print("✅ Primavera Magic Tools System Initialized")
