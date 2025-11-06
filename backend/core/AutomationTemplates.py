"""
NOUFAL Automation Templates
Pre-built automation templates for common use cases
"""

from typing import Dict, List


class AutomationTemplates:
    """
    Pre-defined automation templates for quick setup
    Organized by categories: Reminders, Recurring, IFTTT, Forms, etc.
    """
    
    @staticmethod
    def get_all_templates() -> Dict[str, List[Dict]]:
        """Get all automation templates organized by category"""
        return {
            'reminders': AutomationTemplates.get_reminder_templates(),
            'recurring': AutomationTemplates.get_recurring_templates(),
            'ifttt': AutomationTemplates.get_ifttt_templates(),
            'forms': AutomationTemplates.get_form_templates(),
            'notifications': AutomationTemplates.get_notification_templates(),
            'engineering': AutomationTemplates.get_engineering_templates()
        }
    
    @staticmethod
    def get_reminder_templates() -> List[Dict]:
        """Templates for reminders"""
        return [
            {
                'id': 'remind_before_deadline',
                'name': 'Remind assignees before deadline',
                'description': 'Send notification to assignees X time before task deadline',
                'category': 'reminders',
                'icon': '⏰',
                'template': {
                    'trigger': {
                        'type': 'DATE_ARRIVES',
                        'config': {
                            'attribute': 'due_date',
                            'offset': -1,
                            'unit': 'days'
                        }
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
                                'message': 'Task "{{task_name}}" is due {{time_remaining}}!'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'remind_meeting',
                'name': 'Meeting reminder',
                'description': 'Send notification before meeting starts',
                'category': 'reminders',
                'icon': '📅',
                'template': {
                    'trigger': {
                        'type': 'DATE_ARRIVES',
                        'config': {
                            'attribute': 'meeting_date',
                            'offset': -10,
                            'unit': 'minutes'
                        }
                    },
                    'conditions': [
                        {'field': 'type', 'operator': '==', 'value': 'meeting'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'attendees',
                                'message': 'Meeting "{{meeting_title}}" starts in 10 minutes at {{meeting_location}}'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'remind_overdue',
                'name': 'Overdue task reminder',
                'description': 'Daily reminder for overdue tasks',
                'category': 'reminders',
                'icon': '🔴',
                'template': {
                    'trigger': {
                        'type': 'EVERY_TIME_PERIOD',
                        'config': {
                            'interval': 'daily',
                            'time': '09:00'
                        }
                    },
                    'conditions': [
                        {'field': 'status', 'operator': '!=', 'value': 'Done'},
                        {'field': 'due_date', 'operator': '<', 'value': 'today'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'assignees',
                                'message': 'You have overdue task: "{{task_name}}" (Due: {{due_date}})'
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_recurring_templates() -> List[Dict]:
        """Templates for recurring tasks"""
        return [
            {
                'id': 'daily_standup',
                'name': 'Daily standup meeting',
                'description': 'Create daily standup task every morning',
                'category': 'recurring',
                'icon': '🌅',
                'template': {
                    'trigger': {
                        'type': 'EVERY_TIME_PERIOD',
                        'config': {
                            'interval': 'daily',
                            'time': '09:00',
                            'weekdays': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                        }
                    },
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'meetings',
                                'item_data': {
                                    'name': 'Daily Standup - {{date}}',
                                    'description': 'Team daily standup meeting',
                                    'type': 'meeting',
                                    'start_time': '09:00',
                                    'duration': '15 minutes'
                                }
                            }
                        }
                    ]
                }
            },
            {
                'id': 'weekly_report',
                'name': 'Weekly progress report',
                'description': 'Create weekly report task every Friday',
                'category': 'recurring',
                'icon': '📊',
                'template': {
                    'trigger': {
                        'type': 'EVERY_TIME_PERIOD',
                        'config': {
                            'interval': 'weekly',
                            'weekday': 'Friday',
                            'time': '16:00'
                        }
                    },
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'reports',
                                'item_data': {
                                    'name': 'Weekly Progress Report - Week {{week_number}}',
                                    'description': 'Submit weekly progress report',
                                    'type': 'report',
                                    'due_date': '{{next_monday}}'
                                }
                            }
                        },
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'team_leads',
                                'message': 'Weekly report task has been created. Due Monday.'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'monthly_review',
                'name': 'Monthly project review',
                'description': 'Create monthly review task on first day of month',
                'category': 'recurring',
                'icon': '📅',
                'template': {
                    'trigger': {
                        'type': 'EVERY_TIME_PERIOD',
                        'config': {
                            'interval': 'monthly',
                            'day': 1,
                            'time': '10:00'
                        }
                    },
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'reviews',
                                'item_data': {
                                    'name': 'Monthly Project Review - {{month}} {{year}}',
                                    'description': 'Review project progress, budget, and risks',
                                    'type': 'review',
                                    'priority': 'high'
                                }
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_ifttt_templates() -> List[Dict]:
        """Templates for If-This-Then-That automations"""
        return [
            {
                'id': 'status_done_archive',
                'name': 'Archive when done',
                'description': 'Move task to archive when status changes to Done',
                'category': 'ifttt',
                'icon': '📦',
                'template': {
                    'trigger': {
                        'type': 'STATUS_CHANGES',
                        'config': {
                            'attribute': 'status'
                        }
                    },
                    'conditions': [
                        {'field': 'status', 'operator': '==', 'value': 'Done'}
                    ],
                    'actions': [
                        {
                            'type': 'MOVE_ITEM',
                            'config': {
                                'target_folder': 'archive'
                            }
                        },
                        {
                            'type': 'LEAVE_COMMENT',
                            'config': {
                                'comment': '✅ Task completed and archived automatically'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'status_approved_assign',
                'name': 'Assign when approved',
                'description': 'Assign task to specific members when status changes to Approved',
                'category': 'ifttt',
                'icon': '✅',
                'template': {
                    'trigger': {
                        'type': 'STATUS_CHANGES',
                        'config': {
                            'attribute': 'status'
                        }
                    },
                    'conditions': [
                        {'field': 'status', 'operator': '==', 'value': 'Approved'}
                    ],
                    'actions': [
                        {
                            'type': 'ASSIGN_MEMBERS',
                            'config': {
                                'members': ['editor', 'reviewer']
                            }
                        },
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'assignees',
                                'message': 'Task "{{task_name}}" has been approved and assigned to you'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'priority_high_notify',
                'name': 'Notify on high priority',
                'description': 'Send notification when task priority changes to High',
                'category': 'ifttt',
                'icon': '🔴',
                'template': {
                    'trigger': {
                        'type': 'ATTRIBUTE_VALUE_CHANGES',
                        'config': {
                            'attribute': 'priority'
                        }
                    },
                    'conditions': [
                        {'field': 'priority', 'operator': '==', 'value': 'High'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['project_manager', 'team_lead'],
                                'message': '🔴 Task "{{task_name}}" marked as HIGH PRIORITY'
                            }
                        },
                        {
                            'type': 'ADD_LABEL',
                            'config': {
                                'label': 'urgent'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'budget_exceeded_alert',
                'name': 'Budget exceeded alert',
                'description': 'Send alert when budget exceeds threshold',
                'category': 'ifttt',
                'icon': '💰',
                'template': {
                    'trigger': {
                        'type': 'ATTRIBUTE_VALUE_CHANGES',
                        'config': {
                            'attribute': 'actual_cost'
                        }
                    },
                    'conditions': [
                        {'field': 'actual_cost', 'operator': '>', 'value': '{{budget}}'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['finance_manager', 'project_manager'],
                                'message': '⚠️ Budget exceeded for "{{task_name}}" - Actual: {{actual_cost}}, Budget: {{budget}}'
                            }
                        },
                        {
                            'type': 'CHANGE_STATUS',
                            'config': {
                                'status': 'On Hold'
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_form_templates() -> List[Dict]:
        """Templates for form submissions"""
        return [
            {
                'id': 'form_create_task',
                'name': 'Create task from form',
                'description': 'Create new task when form is submitted',
                'category': 'forms',
                'icon': '📝',
                'template': {
                    'trigger': {
                        'type': 'FORM_SUBMITTED',
                        'config': {
                            'form_id': 'request_form'
                        }
                    },
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'requests',
                                'item_data': {
                                    'name': '{{form.title}}',
                                    'description': '{{form.description}}',
                                    'requester': '{{form.email}}',
                                    'status': 'New',
                                    'priority': '{{form.priority}}'
                                }
                            }
                        },
                        {
                            'type': 'SEND_EMAIL',
                            'config': {
                                'recipients': ['{{form.email}}'],
                                'subject': 'Request Received: {{form.title}}',
                                'body': 'Thank you for your request. We will review it shortly.'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'form_bug_report',
                'name': 'Bug report from form',
                'description': 'Create bug ticket and notify support team',
                'category': 'forms',
                'icon': '🐛',
                'template': {
                    'trigger': {
                        'type': 'FORM_SUBMITTED',
                        'config': {
                            'form_id': 'bug_report'
                        }
                    },
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'bugs',
                                'item_data': {
                                    'name': 'Bug: {{form.bug_title}}',
                                    'description': '{{form.description}}\\n\\nSteps to reproduce:\\n{{form.steps}}',
                                    'reporter': '{{form.email}}',
                                    'status': 'Open',
                                    'priority': '{{form.severity}}'
                                }
                            }
                        },
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'support_team',
                                'message': '🐛 New bug report: {{form.bug_title}} ({{form.severity}})'
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_notification_templates() -> List[Dict]:
        """Templates for notifications"""
        return [
            {
                'id': 'item_created_notify',
                'name': 'Notify on new item',
                'description': 'Send notification when new item is created',
                'category': 'notifications',
                'icon': '🔔',
                'template': {
                    'trigger': {
                        'type': 'ITEM_CREATED',
                        'config': {}
                    },
                    'conditions': [
                        {'field': 'folder_id', 'operator': '==', 'value': 'critical_tasks'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['project_manager', 'team_lead'],
                                'message': '📌 New critical task created: "{{task_name}}"'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'comment_added_notify',
                'name': 'Notify on comment',
                'description': 'Notify assignees when comment is added',
                'category': 'notifications',
                'icon': '💬',
                'template': {
                    'trigger': {
                        'type': 'ATTRIBUTE_VALUE_CHANGES',
                        'config': {
                            'attribute': 'comments_count'
                        }
                    },
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'assignees',
                                'message': '💬 {{commenter}} commented on "{{task_name}}": {{comment_preview}}'
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_engineering_templates() -> List[Dict]:
        """Templates specific to engineering/construction projects"""
        return [
            {
                'id': 'sbc_violation_alert',
                'name': 'SBC violation alert',
                'description': 'Alert when SBC compliance check fails',
                'category': 'engineering',
                'icon': '⚠️',
                'template': {
                    'trigger': {
                        'type': 'ATTRIBUTE_VALUE_CHANGES',
                        'config': {
                            'attribute': 'sbc_compliance'
                        }
                    },
                    'conditions': [
                        {'field': 'sbc_compliance', 'operator': '==', 'value': 'Failed'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['safety_officer', 'project_manager'],
                                'message': '⚠️ SBC Compliance FAILED for "{{item_name}}": {{violation_details}}'
                            }
                        },
                        {
                            'type': 'CHANGE_STATUS',
                            'config': {
                                'status': 'On Hold'
                            }
                        },
                        {
                            'type': 'ADD_LABEL',
                            'config': {
                                'label': 'SBC Violation'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'rfi_response_overdue',
                'name': 'RFI response overdue',
                'description': 'Escalate when RFI response is overdue',
                'category': 'engineering',
                'icon': '📋',
                'template': {
                    'trigger': {
                        'type': 'DATE_ARRIVES',
                        'config': {
                            'attribute': 'response_due_date',
                            'offset': 0,
                            'unit': 'days'
                        }
                    },
                    'conditions': [
                        {'field': 'type', 'operator': '==', 'value': 'RFI'},
                        {'field': 'status', 'operator': '!=', 'value': 'Responded'}
                    ],
                    'actions': [
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['consultant', 'project_manager'],
                                'message': '🔴 RFI Response OVERDUE: "{{rfi_title}}" (Issued: {{issue_date}})'
                            }
                        },
                        {
                            'type': 'CHANGE_STATUS',
                            'config': {
                                'status': 'Escalated'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'submittal_auto_assign',
                'name': 'Auto-assign submittal review',
                'description': 'Assign submittal to reviewer based on category',
                'category': 'engineering',
                'icon': '📑',
                'template': {
                    'trigger': {
                        'type': 'ITEM_CREATED',
                        'config': {}
                    },
                    'conditions': [
                        {'field': 'type', 'operator': '==', 'value': 'Submittal'}
                    ],
                    'actions': [
                        {
                            'type': 'ASSIGN_MEMBERS',
                            'config': {
                                'members': 'get_reviewer_by_category({{category}})'
                            }
                        },
                        {
                            'type': 'SET_DUE_DATE',
                            'config': {
                                'due_date': 'today + 7 days'
                            }
                        },
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': 'assignees',
                                'message': 'New submittal assigned: "{{submittal_title}}" - Review due in 7 days'
                            }
                        }
                    ]
                }
            },
            {
                'id': 'delay_recovery_plan',
                'name': 'Trigger delay recovery',
                'description': 'Create recovery plan when schedule delay detected',
                'category': 'engineering',
                'icon': '🔄',
                'template': {
                    'trigger': {
                        'type': 'ATTRIBUTE_VALUE_CHANGES',
                        'config': {
                            'attribute': 'schedule_variance'
                        }
                    },
                    'conditions': [
                        {'field': 'schedule_variance', 'operator': '>', 'value': '7'},
                        {'field': 'critical_path', 'operator': '==', 'value': true}
                    ],
                    'actions': [
                        {
                            'type': 'CREATE_ITEM',
                            'config': {
                                'folder_id': 'recovery_plans',
                                'item_data': {
                                    'name': 'Recovery Plan - {{activity_name}}',
                                    'description': 'Activity is {{schedule_variance}} days behind schedule',
                                    'type': 'recovery_plan',
                                    'priority': 'High'
                                }
                            }
                        },
                        {
                            'type': 'SEND_NOTIFICATION',
                            'config': {
                                'recipients': ['project_manager', 'planning_engineer'],
                                'message': '🔴 Schedule Delay: "{{activity_name}}" is {{schedule_variance}} days behind (Critical Path)'
                            }
                        }
                    ]
                }
            }
        ]
    
    @staticmethod
    def get_template_by_id(template_id: str) -> Dict:
        """Get specific template by ID"""
        all_templates = AutomationTemplates.get_all_templates()
        
        for category_templates in all_templates.values():
            for template in category_templates:
                if template['id'] == template_id:
                    return template
        
        return None
    
    @staticmethod
    def search_templates(query: str) -> List[Dict]:
        """Search templates by name or description"""
        query_lower = query.lower()
        results = []
        
        all_templates = AutomationTemplates.get_all_templates()
        
        for category_templates in all_templates.values():
            for template in category_templates:
                if (query_lower in template['name'].lower() or 
                    query_lower in template['description'].lower() or
                    query_lower in template['category']):
                    results.append(template)
        
        return results
