"""
NOUFAL Automation Engine
Comprehensive automation system with triggers, conditions, and actions
Inspired by Infinity but with enhanced capabilities for engineering projects
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import re
from enum import Enum
import schedule
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class TriggerType(Enum):
    """Available trigger types"""
    DATE_ARRIVES = "date_arrives"
    ATTRIBUTE_VALUE_CHANGES = "attribute_value_changes"
    FOLDER_CREATED = "folder_created"
    FOLDER_DELETED = "folder_deleted"
    ITEM_CREATED = "item_created"
    ITEM_DELETED = "item_deleted"
    EVERY_TIME_PERIOD = "every_time_period"
    BUTTON_CLICKED = "button_clicked"
    FORM_SUBMITTED = "form_submitted"
    STATUS_CHANGES = "status_changes"
    SUBITEMS_UPDATED = "subitems_updated"
    REFERENCE_CREATED = "reference_created"


class ActionType(Enum):
    """Available action types"""
    LEAVE_COMMENT = "leave_comment"
    SEND_NOTIFICATION = "send_notification"
    UPDATE_ITEM = "update_item"
    MOVE_ITEM = "move_item"
    CREATE_ITEM = "create_item"
    CREATE_FOLDER = "create_folder"
    SEND_EMAIL = "send_email"
    SEND_SLACK_MESSAGE = "send_slack"
    TRIGGER_WEBHOOK = "trigger_webhook"
    ASSIGN_MEMBERS = "assign_members"
    CHANGE_STATUS = "change_status"
    ADD_LABEL = "add_label"
    SET_DUE_DATE = "set_due_date"
    ARCHIVE_ITEM = "archive_item"


class ConditionOperator(Enum):
    """Comparison operators for conditions"""
    EQUALS = "=="
    NOT_EQUALS = "!="
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    GREATER_THAN = ">"
    LESS_THAN = "<"
    GREATER_OR_EQUAL = ">="
    LESS_OR_EQUAL = "<="
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"


class AutomationEngine:
    """
    Core automation engine for NOUFAL system
    Handles triggers, conditions, and actions
    """
    
    def __init__(self, db_path: str = "database/noufal.db"):
        self.db_path = db_path
        self.active_automations = []
        self.automation_history = []
        self.webhook_clients = {}
        self._init_database()
        self._load_active_automations()
    
    def _init_database(self):
        """Initialize automation tables in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Automations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS automations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                trigger_type TEXT NOT NULL,
                trigger_config TEXT,
                conditions TEXT,
                actions TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                board_id TEXT,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                execution_count INTEGER DEFAULT 0,
                last_executed TIMESTAMP
            )
        ''')
        
        # Automation execution history
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS automation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                automation_id INTEGER,
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                trigger_data TEXT,
                conditions_met BOOLEAN,
                actions_executed TEXT,
                success BOOLEAN,
                error_message TEXT,
                execution_time_ms INTEGER,
                FOREIGN KEY (automation_id) REFERENCES automations(id)
            )
        ''')
        
        # Scheduled automations (for recurring tasks)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scheduled_automations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                automation_id INTEGER,
                schedule_type TEXT,
                schedule_config TEXT,
                next_run TIMESTAMP,
                last_run TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (automation_id) REFERENCES automations(id)
            )
        ''')
        
        # Webhook configurations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS webhooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                secret TEXT,
                events TEXT,
                headers TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_automation(self, automation_data: Dict) -> Dict:
        """
        Create a new automation rule
        
        Args:
            automation_data: {
                'name': 'Send notification before deadline',
                'description': 'Notify assignees 1 day before task deadline',
                'trigger': {
                    'type': 'DATE_ARRIVES',
                    'config': {'attribute': 'due_date', 'offset': -1, 'unit': 'days'}
                },
                'conditions': [
                    {'field': 'status', 'operator': '!=', 'value': 'Done'},
                    {'field': 'assignees', 'operator': 'is_not_empty'}
                ],
                'actions': [
                    {
                        'type': 'SEND_NOTIFICATION',
                        'config': {
                            'recipients': 'assignees',
                            'message': 'Task {{task_name}} is due tomorrow!'
                        }
                    }
                ],
                'board_id': 'board_123',
                'created_by': 'user@example.com'
            }
        
        Returns:
            dict: Created automation with ID
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO automations 
            (name, description, trigger_type, trigger_config, conditions, actions, board_id, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            automation_data['name'],
            automation_data.get('description', ''),
            automation_data['trigger']['type'],
            json.dumps(automation_data['trigger'].get('config', {})),
            json.dumps(automation_data.get('conditions', [])),
            json.dumps(automation_data['actions']),
            automation_data.get('board_id'),
            automation_data.get('created_by')
        ))
        
        automation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Reload active automations
        self._load_active_automations()
        
        return {
            'success': True,
            'automation_id': automation_id,
            'message': f'Automation "{automation_data["name"]}" created successfully'
        }
    
    def trigger_event(self, event_type: str, event_data: Dict) -> List[Dict]:
        """
        Trigger an event and execute matching automations
        
        Args:
            event_type: Type of event (e.g., 'ITEM_CREATED', 'STATUS_CHANGES')
            event_data: Data associated with the event
        
        Returns:
            list: Results of executed automations
        """
        results = []
        
        # Find automations matching this trigger type
        matching_automations = [
            auto for auto in self.active_automations 
            if auto['trigger_type'] == event_type
        ]
        
        for automation in matching_automations:
            start_time = datetime.now()
            
            try:
                # Check conditions
                conditions_met = self._evaluate_conditions(
                    automation['conditions'],
                    event_data
                )
                
                if conditions_met:
                    # Execute actions
                    action_results = self._execute_actions(
                        automation['actions'],
                        event_data
                    )
                    
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    
                    # Log execution
                    self._log_execution(
                        automation['id'],
                        event_data,
                        conditions_met=True,
                        actions_executed=action_results,
                        success=True,
                        execution_time_ms=int(execution_time)
                    )
                    
                    # Update execution count
                    self._update_execution_count(automation['id'])
                    
                    results.append({
                        'automation_id': automation['id'],
                        'automation_name': automation['name'],
                        'triggered': True,
                        'actions_executed': action_results,
                        'execution_time_ms': int(execution_time)
                    })
                else:
                    results.append({
                        'automation_id': automation['id'],
                        'automation_name': automation['name'],
                        'triggered': False,
                        'reason': 'Conditions not met'
                    })
            
            except Exception as e:
                execution_time = (datetime.now() - start_time).total_seconds() * 1000
                
                self._log_execution(
                    automation['id'],
                    event_data,
                    conditions_met=False,
                    actions_executed=[],
                    success=False,
                    error_message=str(e),
                    execution_time_ms=int(execution_time)
                )
                
                results.append({
                    'automation_id': automation['id'],
                    'automation_name': automation['name'],
                    'triggered': False,
                    'error': str(e)
                })
        
        return results
    
    def _evaluate_conditions(self, conditions: List[Dict], data: Dict) -> bool:
        """
        Evaluate if conditions are met
        
        Args:
            conditions: List of condition dictionaries
            data: Event data to check against
        
        Returns:
            bool: True if all conditions are met
        """
        if not conditions:
            return True
        
        for condition in conditions:
            field = condition['field']
            operator = condition['operator']
            expected_value = condition.get('value')
            
            # Get actual value from data
            actual_value = data.get(field)
            
            # Evaluate based on operator
            if operator == '==':
                if actual_value != expected_value:
                    return False
            elif operator == '!=':
                if actual_value == expected_value:
                    return False
            elif operator == 'contains':
                if not (actual_value and expected_value in str(actual_value)):
                    return False
            elif operator == 'not_contains':
                if actual_value and expected_value in str(actual_value):
                    return False
            elif operator == '>':
                if not (actual_value and actual_value > expected_value):
                    return False
            elif operator == '<':
                if not (actual_value and actual_value < expected_value):
                    return False
            elif operator == '>=':
                if not (actual_value and actual_value >= expected_value):
                    return False
            elif operator == '<=':
                if not (actual_value and actual_value <= expected_value):
                    return False
            elif operator == 'is_empty':
                if actual_value:
                    return False
            elif operator == 'is_not_empty':
                if not actual_value:
                    return False
        
        return True
    
    def _execute_actions(self, actions: List[Dict], event_data: Dict) -> List[Dict]:
        """
        Execute automation actions
        
        Args:
            actions: List of action dictionaries
            event_data: Event data for context
        
        Returns:
            list: Results of each action
        """
        results = []
        
        for action in actions:
            action_type = action['type']
            config = action.get('config', {})
            
            try:
                if action_type == 'SEND_NOTIFICATION':
                    result = self._action_send_notification(config, event_data)
                elif action_type == 'SEND_EMAIL':
                    result = self._action_send_email(config, event_data)
                elif action_type == 'CREATE_ITEM':
                    result = self._action_create_item(config, event_data)
                elif action_type == 'UPDATE_ITEM':
                    result = self._action_update_item(config, event_data)
                elif action_type == 'MOVE_ITEM':
                    result = self._action_move_item(config, event_data)
                elif action_type == 'LEAVE_COMMENT':
                    result = self._action_leave_comment(config, event_data)
                elif action_type == 'TRIGGER_WEBHOOK':
                    result = self._action_trigger_webhook(config, event_data)
                elif action_type == 'SEND_SLACK_MESSAGE':
                    result = self._action_send_slack(config, event_data)
                elif action_type == 'ASSIGN_MEMBERS':
                    result = self._action_assign_members(config, event_data)
                elif action_type == 'CHANGE_STATUS':
                    result = self._action_change_status(config, event_data)
                elif action_type == 'ADD_LABEL':
                    result = self._action_add_label(config, event_data)
                elif action_type == 'SET_DUE_DATE':
                    result = self._action_set_due_date(config, event_data)
                elif action_type == 'ARCHIVE_ITEM':
                    result = self._action_archive_item(config, event_data)
                elif action_type == 'CREATE_FOLDER':
                    result = self._action_create_folder(config, event_data)
                else:
                    result = {'success': False, 'error': f'Unknown action type: {action_type}'}
                
                results.append({
                    'action_type': action_type,
                    'result': result
                })
            
            except Exception as e:
                results.append({
                    'action_type': action_type,
                    'result': {'success': False, 'error': str(e)}
                })
        
        return results
    
    # Action implementations
    def _action_send_notification(self, config: Dict, data: Dict) -> Dict:
        """Send in-app notification"""
        recipients = config.get('recipients', [])
        message = self._interpolate_template(config.get('message', ''), data)
        
        # In production, this would integrate with a notification service
        return {
            'success': True,
            'recipients': recipients,
            'message': message
        }
    
    def _action_send_email(self, config: Dict, data: Dict) -> Dict:
        """Send email notification"""
        recipients = config.get('recipients', [])
        subject = self._interpolate_template(config.get('subject', ''), data)
        body = self._interpolate_template(config.get('body', ''), data)
        
        # In production, integrate with SMTP server
        return {
            'success': True,
            'recipients': recipients,
            'subject': subject,
            'body': body
        }
    
    def _action_create_item(self, config: Dict, data: Dict) -> Dict:
        """Create new item"""
        folder_id = config.get('folder_id')
        item_data = config.get('item_data', {})
        
        # Interpolate template variables
        for key, value in item_data.items():
            if isinstance(value, str):
                item_data[key] = self._interpolate_template(value, data)
        
        return {
            'success': True,
            'folder_id': folder_id,
            'item_data': item_data
        }
    
    def _action_update_item(self, config: Dict, data: Dict) -> Dict:
        """Update existing item"""
        item_id = data.get('item_id') or config.get('item_id')
        updates = config.get('updates', {})
        
        return {
            'success': True,
            'item_id': item_id,
            'updates': updates
        }
    
    def _action_move_item(self, config: Dict, data: Dict) -> Dict:
        """Move item to different folder"""
        item_id = data.get('item_id')
        target_folder = config.get('target_folder')
        
        return {
            'success': True,
            'item_id': item_id,
            'target_folder': target_folder
        }
    
    def _action_leave_comment(self, config: Dict, data: Dict) -> Dict:
        """Leave comment on item"""
        item_id = data.get('item_id')
        comment_text = self._interpolate_template(config.get('comment', ''), data)
        
        return {
            'success': True,
            'item_id': item_id,
            'comment': comment_text
        }
    
    def _action_trigger_webhook(self, config: Dict, data: Dict) -> Dict:
        """Trigger external webhook"""
        webhook_url = config.get('url')
        payload = config.get('payload', data)
        
        # In production, make HTTP POST request
        return {
            'success': True,
            'webhook_url': webhook_url,
            'payload': payload
        }
    
    def _action_send_slack(self, config: Dict, data: Dict) -> Dict:
        """Send Slack message"""
        channel = config.get('channel')
        message = self._interpolate_template(config.get('message', ''), data)
        
        return {
            'success': True,
            'channel': channel,
            'message': message
        }
    
    def _action_assign_members(self, config: Dict, data: Dict) -> Dict:
        """Assign members to item"""
        item_id = data.get('item_id')
        members = config.get('members', [])
        
        return {
            'success': True,
            'item_id': item_id,
            'members': members
        }
    
    def _action_change_status(self, config: Dict, data: Dict) -> Dict:
        """Change item status"""
        item_id = data.get('item_id')
        new_status = config.get('status')
        
        return {
            'success': True,
            'item_id': item_id,
            'status': new_status
        }
    
    def _action_add_label(self, config: Dict, data: Dict) -> Dict:
        """Add label to item"""
        item_id = data.get('item_id')
        label = config.get('label')
        
        return {
            'success': True,
            'item_id': item_id,
            'label': label
        }
    
    def _action_set_due_date(self, config: Dict, data: Dict) -> Dict:
        """Set item due date"""
        item_id = data.get('item_id')
        due_date = config.get('due_date')
        
        return {
            'success': True,
            'item_id': item_id,
            'due_date': due_date
        }
    
    def _action_archive_item(self, config: Dict, data: Dict) -> Dict:
        """Archive item"""
        item_id = data.get('item_id')
        
        return {
            'success': True,
            'item_id': item_id,
            'archived': True
        }
    
    def _action_create_folder(self, config: Dict, data: Dict) -> Dict:
        """Create new folder"""
        parent_folder = config.get('parent_folder')
        folder_name = self._interpolate_template(config.get('name', ''), data)
        
        return {
            'success': True,
            'parent_folder': parent_folder,
            'folder_name': folder_name
        }
    
    def _interpolate_template(self, template: str, data: Dict) -> str:
        """
        Replace template variables with actual values
        Example: "Task {{task_name}} is due!" -> "Task Write Report is due!"
        """
        result = template
        for key, value in data.items():
            placeholder = f'{{{{{key}}}}}'
            if placeholder in result:
                result = result.replace(placeholder, str(value))
        return result
    
    def _load_active_automations(self):
        """Load all active automations from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM automations WHERE is_active = 1
        ''')
        
        rows = cursor.fetchall()
        self.active_automations = [
            {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'trigger_type': row['trigger_type'],
                'trigger_config': json.loads(row['trigger_config'] or '{}'),
                'conditions': json.loads(row['conditions'] or '[]'),
                'actions': json.loads(row['actions']),
                'board_id': row['board_id']
            }
            for row in rows
        ]
        
        conn.close()
    
    def _log_execution(self, automation_id: int, trigger_data: Dict, 
                       conditions_met: bool, actions_executed: List, 
                       success: bool, execution_time_ms: int = 0,
                       error_message: str = ''):
        """Log automation execution to history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO automation_history 
            (automation_id, trigger_data, conditions_met, actions_executed, 
             success, error_message, execution_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            automation_id,
            json.dumps(trigger_data),
            conditions_met,
            json.dumps(actions_executed),
            success,
            error_message,
            execution_time_ms
        ))
        
        conn.commit()
        conn.close()
    
    def _update_execution_count(self, automation_id: int):
        """Update automation execution count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE automations 
            SET execution_count = execution_count + 1,
                last_executed = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (automation_id,))
        
        conn.commit()
        conn.close()
    
    def get_automation_stats(self, automation_id: Optional[int] = None) -> Dict:
        """Get automation statistics"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if automation_id:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_executions,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
                    AVG(execution_time_ms) as avg_execution_time,
                    MAX(triggered_at) as last_execution
                FROM automation_history
                WHERE automation_id = ?
            ''', (automation_id,))
        else:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_executions,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
                    AVG(execution_time_ms) as avg_execution_time
                FROM automation_history
            ''')
        
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else {}
    
    def get_all_automations(self, board_id: Optional[str] = None) -> List[Dict]:
        """Get all automations, optionally filtered by board"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if board_id:
            cursor.execute('''
                SELECT * FROM automations WHERE board_id = ? ORDER BY created_at DESC
            ''', (board_id,))
        else:
            cursor.execute('''
                SELECT * FROM automations ORDER BY created_at DESC
            ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def toggle_automation(self, automation_id: int, is_active: bool) -> Dict:
        """Enable or disable automation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE automations SET is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (is_active, automation_id))
        
        conn.commit()
        conn.close()
        
        # Reload active automations
        self._load_active_automations()
        
        return {
            'success': True,
            'automation_id': automation_id,
            'is_active': is_active
        }
    
    def delete_automation(self, automation_id: int) -> Dict:
        """Delete automation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM automations WHERE id = ?', (automation_id,))
        cursor.execute('DELETE FROM automation_history WHERE automation_id = ?', (automation_id,))
        cursor.execute('DELETE FROM scheduled_automations WHERE automation_id = ?', (automation_id,))
        
        conn.commit()
        conn.close()
        
        # Reload active automations
        self._load_active_automations()
        
        return {
            'success': True,
            'automation_id': automation_id,
            'message': 'Automation deleted successfully'
        }
