"""
RelationshipEngine System - محرك العلاقات والتبعيات
يقوم ببناء شبكة علاقات معقدة بين الأنشطة والبنود:
- Finish-to-Start (FS): نشاط B يبدأ عند انتهاء نشاط A
- Start-to-Start (SS): نشاط B يبدأ مع بدء نشاط A
- Finish-to-Finish (FF): نشاط B ينتهي عند انتهاء نشاط A
- Start-to-Finish (SF): نشاط B ينتهي عند بدء نشاط A
- Lead/Lag Times: تأخير أو تقديم بين الأنشطة
"""

import sqlite3
from typing import Dict, List, Tuple, Optional, Set
from datetime import datetime, timedelta
import json


class RelationshipEngine:
    """محرك العلاقات والتبعيات بين الأنشطة"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.relationship_rules = self._load_relationship_rules()
        self.graph = {}  # Activity dependency graph
        
        print("✅ RelationshipEngine System Initialized")
    
    def _load_relationship_rules(self) -> Dict:
        """تحميل قواعد العلاقات من قاعدة البيانات أو القواعد المحددة مسبقاً"""
        
        # قواعد العلاقات الأساسية (Rule-Based)
        rules = {
            # الخرسانة
            'concrete': {
                'prerequisites': [
                    {'activity': 'excavation', 'type': 'FS', 'lag': 0},
                    {'activity': 'formwork', 'type': 'FS', 'lag': 0},
                    {'activity': 'reinforcement', 'type': 'FS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'curing', 'type': 'FS', 'lag': 1},
                    {'activity': 'backfill', 'type': 'FS', 'lag': 7}
                ]
            },
            
            # الحفر
            'excavation': {
                'prerequisites': [
                    {'activity': 'site_preparation', 'type': 'FS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'concrete', 'type': 'FS', 'lag': 0},
                    {'activity': 'formwork', 'type': 'SS', 'lag': 2}
                ]
            },
            
            # النجارة (الشدة والفرم)
            'formwork': {
                'prerequisites': [
                    {'activity': 'excavation', 'type': 'FS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'reinforcement', 'type': 'FS', 'lag': 0}
                ]
            },
            
            # التسليح
            'reinforcement': {
                'prerequisites': [
                    {'activity': 'formwork', 'type': 'FS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'concrete', 'type': 'FS', 'lag': 0}
                ]
            },
            
            # البناء (الطوب/البلوك)
            'masonry': {
                'prerequisites': [
                    {'activity': 'concrete', 'type': 'FS', 'lag': 7},  # انتظار معالجة الخرسانة
                    {'activity': 'curing', 'type': 'FS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'plastering', 'type': 'FS', 'lag': 3}
                ]
            },
            
            # اللياسة
            'plastering': {
                'prerequisites': [
                    {'activity': 'masonry', 'type': 'FS', 'lag': 3},
                    {'activity': 'electrical', 'type': 'SS', 'lag': 0},  # يمكن البدء معاً
                    {'activity': 'plumbing', 'type': 'SS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'tiling', 'type': 'FS', 'lag': 7},
                    {'activity': 'painting', 'type': 'FS', 'lag': 7}
                ]
            },
            
            # البلاط
            'tiling': {
                'prerequisites': [
                    {'activity': 'plastering', 'type': 'FS', 'lag': 7}
                ],
                'successors': [
                    {'activity': 'finishing', 'type': 'FS', 'lag': 2}
                ]
            },
            
            # الدهان
            'painting': {
                'prerequisites': [
                    {'activity': 'plastering', 'type': 'FS', 'lag': 7},
                    {'activity': 'tiling', 'type': 'FS', 'lag': 2}
                ],
                'successors': [
                    {'activity': 'finishing', 'type': 'FS', 'lag': 1}
                ]
            },
            
            # العزل
            'waterproofing': {
                'prerequisites': [
                    {'activity': 'concrete', 'type': 'FS', 'lag': 3}
                ],
                'successors': [
                    {'activity': 'backfill', 'type': 'FS', 'lag': 1},
                    {'activity': 'tiling', 'type': 'FS', 'lag': 1}
                ]
            },
            
            # السباكة
            'plumbing': {
                'prerequisites': [
                    {'activity': 'excavation', 'type': 'SS', 'lag': 1},
                    {'activity': 'masonry', 'type': 'SS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'testing', 'type': 'FS', 'lag': 0},
                    {'activity': 'plastering', 'type': 'FF', 'lag': -2}
                ]
            },
            
            # الكهرباء
            'electrical': {
                'prerequisites': [
                    {'activity': 'masonry', 'type': 'SS', 'lag': 0}
                ],
                'successors': [
                    {'activity': 'testing', 'type': 'FS', 'lag': 0},
                    {'activity': 'plastering', 'type': 'FF', 'lag': -2}
                ]
            }
        }
        
        return rules
    
    def build_dependency_graph(self, activities: List[Dict]) -> Dict:
        """
        بناء شبكة التبعيات الكاملة
        
        Args:
            activities: قائمة الأنشطة مع تصنيفاتها
            
        Returns:
            شبكة التبعيات مع جميع العلاقات
        """
        
        # إعادة تعيين الشبكة
        self.graph = {}
        
        # بناء العقد (Nodes)
        for activity in activities:
            activity_id = activity['id']
            self.graph[activity_id] = {
                'activity': activity,
                'predecessors': [],
                'successors': [],
                'level': 0,  # سيتم حسابه لاحقاً
                'critical': False
            }
        
        # بناء الأضلاع (Edges) بناءً على القواعد
        for activity in activities:
            activity_id = activity['id']
            activity_type = self._identify_activity_type(activity)
            
            if activity_type in self.relationship_rules:
                rules = self.relationship_rules[activity_type]
                
                # إضافة المتطلبات المسبقة (Prerequisites)
                for prereq in rules.get('prerequisites', []):
                    prereq_activities = self._find_activities_by_type(
                        activities, prereq['activity']
                    )
                    
                    for prereq_activity in prereq_activities:
                        self._add_relationship(
                            prereq_activity['id'],
                            activity_id,
                            prereq['type'],
                            prereq['lag']
                        )
                
                # إضافة الأنشطة اللاحقة (Successors)
                for succ in rules.get('successors', []):
                    succ_activities = self._find_activities_by_type(
                        activities, succ['activity']
                    )
                    
                    for succ_activity in succ_activities:
                        self._add_relationship(
                            activity_id,
                            succ_activity['id'],
                            succ['type'],
                            succ['lag']
                        )
        
        # حساب المستويات (Levels) في الشبكة
        self._calculate_levels()
        
        # تحديد المسار الحرج (Critical Path)
        self._identify_critical_path()
        
        return self.graph
    
    def _identify_activity_type(self, activity: Dict) -> str:
        """تحديد نوع النشاط بناءً على التصنيف أو الوصف"""
        
        description = activity.get('description', '').lower()
        classification = activity.get('classification', {})
        
        # خريطة الكلمات المفتاحية لأنواع الأنشطة
        type_keywords = {
            'excavation': ['حفر', 'حفريات'],
            'concrete': ['خرسانة', 'صب'],
            'formwork': ['نجارة', 'شدة', 'فرم'],
            'reinforcement': ['تسليح', 'حديد', 'حدادة'],
            'masonry': ['بناء', 'طوب', 'بلوك'],
            'plastering': ['لياسة', 'محارة'],
            'tiling': ['بلاط', 'سيراميك', 'رخام'],
            'painting': ['دهان', 'طلاء'],
            'waterproofing': ['عزل', 'عازل'],
            'plumbing': ['سباكة', 'صحي'],
            'electrical': ['كهرباء', 'كهربائي']
        }
        
        for activity_type, keywords in type_keywords.items():
            for keyword in keywords:
                if keyword in description:
                    return activity_type
        
        return 'general'
    
    def _find_activities_by_type(self, activities: List[Dict], activity_type: str) -> List[Dict]:
        """البحث عن أنشطة من نوع محدد"""
        
        matching_activities = []
        for activity in activities:
            if self._identify_activity_type(activity) == activity_type:
                matching_activities.append(activity)
        
        return matching_activities
    
    def _add_relationship(self, predecessor_id: str, successor_id: str, 
                         rel_type: str, lag: int):
        """إضافة علاقة بين نشاطين"""
        
        if predecessor_id not in self.graph or successor_id not in self.graph:
            return
        
        relationship = {
            'type': rel_type,  # FS, SS, FF, SF
            'lag': lag,
            'from': predecessor_id,
            'to': successor_id
        }
        
        # إضافة للسابق (Predecessor)
        self.graph[predecessor_id]['successors'].append(relationship)
        
        # إضافة للاحق (Successor)
        self.graph[successor_id]['predecessors'].append(relationship)
    
    def _calculate_levels(self):
        """حساب مستوى كل نشاط في الشبكة (Topological Ordering)"""
        
        # حساب عدد المتطلبات المسبقة لكل نشاط
        in_degree = {activity_id: len(node['predecessors']) 
                     for activity_id, node in self.graph.items()}
        
        # الأنشطة التي ليس لها متطلبات مسبقة
        queue = [activity_id for activity_id, degree in in_degree.items() if degree == 0]
        
        level = 0
        while queue:
            next_queue = []
            for activity_id in queue:
                self.graph[activity_id]['level'] = level
                
                # تقليل درجة الأنشطة اللاحقة
                for relationship in self.graph[activity_id]['successors']:
                    successor_id = relationship['to']
                    in_degree[successor_id] -= 1
                    if in_degree[successor_id] == 0:
                        next_queue.append(successor_id)
            
            queue = next_queue
            level += 1
    
    def _identify_critical_path(self):
        """تحديد المسار الحرج (Critical Path Method - CPM)"""
        
        # Forward Pass: حساب Early Start (ES) و Early Finish (EF)
        for activity_id in sorted(self.graph.keys(), 
                                 key=lambda x: self.graph[x]['level']):
            node = self.graph[activity_id]
            activity = node['activity']
            duration = activity.get('duration', 1)
            
            if not node['predecessors']:
                node['early_start'] = 0
            else:
                max_ef = 0
                for pred_rel in node['predecessors']:
                    pred_id = pred_rel['from']
                    pred_node = self.graph[pred_id]
                    pred_ef = pred_node.get('early_finish', 0)
                    
                    if pred_rel['type'] == 'FS':
                        max_ef = max(max_ef, pred_ef + pred_rel['lag'])
                    elif pred_rel['type'] == 'SS':
                        max_ef = max(max_ef, pred_node.get('early_start', 0) + pred_rel['lag'])
                
                node['early_start'] = max_ef
            
            node['early_finish'] = node['early_start'] + duration
        
        # Backward Pass: حساب Late Start (LS) و Late Finish (LF)
        max_ef = max(node.get('early_finish', 0) for node in self.graph.values())
        
        for activity_id in sorted(self.graph.keys(), 
                                 key=lambda x: self.graph[x]['level'], 
                                 reverse=True):
            node = self.graph[activity_id]
            activity = node['activity']
            duration = activity.get('duration', 1)
            
            if not node['successors']:
                node['late_finish'] = max_ef
            else:
                min_ls = float('inf')
                for succ_rel in node['successors']:
                    succ_id = succ_rel['to']
                    succ_node = self.graph[succ_id]
                    succ_ls = succ_node.get('late_start', max_ef)
                    
                    if succ_rel['type'] == 'FS':
                        min_ls = min(min_ls, succ_ls - succ_rel['lag'])
                    elif succ_rel['type'] == 'SS':
                        min_ls = min(min_ls, succ_node.get('late_start', max_ef) - succ_rel['lag'])
                
                node['late_finish'] = min_ls
            
            node['late_start'] = node['late_finish'] - duration
            
            # حساب الوقت الاحتياطي (Float/Slack)
            node['total_float'] = node['late_start'] - node['early_start']
            
            # تحديد إذا كان النشاط على المسار الحرج
            node['critical'] = (node['total_float'] == 0)
    
    def get_critical_path(self) -> List[Dict]:
        """الحصول على الأنشطة على المسار الحرج"""
        
        critical_activities = []
        for activity_id, node in self.graph.items():
            if node.get('critical', False):
                critical_activities.append({
                    'id': activity_id,
                    'description': node['activity'].get('description'),
                    'early_start': node.get('early_start'),
                    'early_finish': node.get('early_finish'),
                    'duration': node['activity'].get('duration'),
                    'level': node['level']
                })
        
        # ترتيب حسب المستوى
        critical_activities.sort(key=lambda x: x['level'])
        
        return critical_activities
    
    def get_activity_schedule(self, activity_id: str) -> Dict:
        """الحصول على جدول نشاط محدد"""
        
        if activity_id not in self.graph:
            return {'error': 'Activity not found'}
        
        node = self.graph[activity_id]
        
        return {
            'activity_id': activity_id,
            'description': node['activity'].get('description'),
            'duration': node['activity'].get('duration'),
            'early_start': node.get('early_start'),
            'early_finish': node.get('early_finish'),
            'late_start': node.get('late_start'),
            'late_finish': node.get('late_finish'),
            'total_float': node.get('total_float'),
            'critical': node.get('critical'),
            'level': node['level'],
            'predecessors': [
                {
                    'id': rel['from'],
                    'type': rel['type'],
                    'lag': rel['lag']
                }
                for rel in node['predecessors']
            ],
            'successors': [
                {
                    'id': rel['to'],
                    'type': rel['type'],
                    'lag': rel['lag']
                }
                for rel in node['successors']
            ]
        }
    
    def export_to_json(self) -> str:
        """تصدير الشبكة إلى JSON"""
        
        export_data = {
            'activities': {},
            'relationships': []
        }
        
        for activity_id, node in self.graph.items():
            export_data['activities'][activity_id] = {
                'description': node['activity'].get('description'),
                'duration': node['activity'].get('duration'),
                'early_start': node.get('early_start'),
                'early_finish': node.get('early_finish'),
                'late_start': node.get('late_start'),
                'late_finish': node.get('late_finish'),
                'total_float': node.get('total_float'),
                'critical': node.get('critical'),
                'level': node['level']
            }
            
            for rel in node['successors']:
                export_data['relationships'].append({
                    'from': rel['from'],
                    'to': rel['to'],
                    'type': rel['type'],
                    'lag': rel['lag']
                })
        
        return json.dumps(export_data, ensure_ascii=False, indent=2)
    
    def detect_cycles(self) -> List[List[str]]:
        """اكتشاف الدورات في الشبكة (Circular Dependencies)"""
        
        visited = set()
        rec_stack = set()
        cycles = []
        
        def dfs(node_id, path):
            visited.add(node_id)
            rec_stack.add(node_id)
            path.append(node_id)
            
            for rel in self.graph[node_id]['successors']:
                succ_id = rel['to']
                
                if succ_id not in visited:
                    if dfs(succ_id, path[:]):
                        return True
                elif succ_id in rec_stack:
                    cycle_start = path.index(succ_id)
                    cycles.append(path[cycle_start:] + [succ_id])
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        for activity_id in self.graph:
            if activity_id not in visited:
                dfs(activity_id, [])
        
        return cycles


# اختبار سريع
if __name__ == "__main__":
    print("✅ RelationshipEngine System Loaded")
    
    # اختبار بسيط
    engine = RelationshipEngine("test.db")
    
    test_activities = [
        {
            'id': 'ACT-001',
            'description': 'حفر أساسات',
            'duration': 3
        },
        {
            'id': 'ACT-002',
            'description': 'صب خرسانة عادية',
            'duration': 2
        },
        {
            'id': 'ACT-003',
            'description': 'نجارة شدة أساسات',
            'duration': 2
        },
        {
            'id': 'ACT-004',
            'description': 'تسليح أساسات',
            'duration': 2
        }
    ]
    
    graph = engine.build_dependency_graph(test_activities)
    critical_path = engine.get_critical_path()
    
    print(f"\n📊 نتيجة بناء الشبكة:")
    print(f"- عدد الأنشطة: {len(graph)}")
    print(f"- المسار الحرج: {len(critical_path)} نشاط")
