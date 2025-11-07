/**
 * NOUFAL Backend API Service
 * التواصل مع الـ 10 أنظمة في Backend Python
 */

// Auto-detect backend URL based on current origin
const BACKEND_URL = typeof window !== 'undefined' 
  ? window.location.origin.replace('3000', '5000')
  : 'http://localhost:5000';

interface BackendResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  error?: string;
}

interface SystemStatus {
  systems: {
    excel_intelligence: boolean;
    item_classifier: boolean;
    productivity_database: boolean;
    item_analyzer: boolean;
    relationship_engine: boolean;
    scheduler: boolean;
    compliance_checker: boolean;
    s_curve_generator: boolean;
    request_parser: boolean;
    request_executor: boolean;
  };
  cache: {
    last_uploaded_file: boolean;
    last_analysis: boolean;
    last_schedule: boolean;
    last_s_curve: boolean;
  };
  database: {
    path: string;
    connected: boolean;
  };
}

interface ScheduleData {
  project_start: string;
  project_finish: string;
  total_duration: number;
  activities: Activity[];
  milestones: Milestone[];
  statistics: any;
}

interface Activity {
  id: string;
  description: string;
  start_date: string;
  finish_date: string;
  duration: number;
  resources?: any;
  predecessors?: string[];
}

interface Milestone {
  name: string;
  date: string;
  activities: string[];
}

interface SCurveData {
  project_info: {
    start_date: string;
    end_date: string;
    total_duration: number;
    total_activities: number;
  };
  time_periods: Array<{
    period: number;
    start_date: string;
    end_date: string;
    planned_progress: number;
    planned_activities: number;
  }>;
  statistics: any;
}

interface ComplianceResult {
  total_items: number;
  compliant_items: number;
  non_compliant_items: number;
  compliance_rate: number;
  total_violations: number;
  total_warnings: number;
  items_results: any[];
}

class NOUFALBackendAPI {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck(): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * الحصول على حالة جميع الأنظمة
   */
  async getSystemStatus(): Promise<BackendResponse<SystemStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/system-status`);
      return await response.json();
    } catch (error) {
      console.error('System status check failed:', error);
      throw error;
    }
  }

  /**
   * رفع ملف Excel
   */
  async uploadFile(file: File): Promise<BackendResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * تحليل BOQ كامل
   */
  async analyzeBOQ(items: any[]): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-boq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      return await response.json();
    } catch (error) {
      console.error('BOQ analysis failed:', error);
      throw error;
    }
  }

  /**
   * تحليل عميق للبنود
   */
  async analyzeItems(items: any[]): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      return await response.json();
    } catch (error) {
      console.error('Deep items analysis failed:', error);
      throw error;
    }
  }

  /**
   * بناء شبكة التبعيات
   */
  async buildRelationships(activities: any[]): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/build-relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      });

      return await response.json();
    } catch (error) {
      console.error('Relationship building failed:', error);
      throw error;
    }
  }

  /**
   * توليد جدول زمني شامل
   */
  async generateSchedule(
    activities: any[],
    startDate: string,
    constraints: any = {}
  ): Promise<BackendResponse<{ schedule: ScheduleData }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities,
          start_date: startDate,
          constraints,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Schedule generation failed:', error);
      throw error;
    }
  }

  /**
   * الحصول على بيانات Gantt Chart
   */
  async getGanttData(schedule: any): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/gantt-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });

      return await response.json();
    } catch (error) {
      console.error('Gantt data retrieval failed:', error);
      throw error;
    }
  }

  /**
   * فحص الامتثال لكود البناء السعودي
   */
  async checkSBCCompliance(
    items: any[],
    category: string = 'all'
  ): Promise<BackendResponse<{ results: ComplianceResult; report: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/check-sbc-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, category }),
      });

      return await response.json();
    } catch (error) {
      console.error('SBC compliance check failed:', error);
      throw error;
    }
  }

  /**
   * توليد منحنى S
   */
  async generateSCurve(
    schedule: any,
    interval: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<BackendResponse<{ s_curve: SCurveData }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-s-curve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, interval }),
      });

      return await response.json();
    } catch (error) {
      console.error('S-Curve generation failed:', error);
      throw error;
    }
  }

  /**
   * توليد منحنى S المالي
   */
  async generateFinancialSCurve(
    schedule: any,
    itemCosts: { [key: string]: number },
    interval: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/financial-s-curve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule,
          item_costs: itemCosts,
          interval,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Financial S-Curve generation failed:', error);
      throw error;
    }
  }

  /**
   * تحليل طلب لغوي
   */
  async parseRequest(requestText: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/parse-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: requestText }),
      });

      return await response.json();
    } catch (error) {
      console.error('Request parsing failed:', error);
      throw error;
    }
  }

  /**
   * تنفيذ طلب لغوي
   */
  async executeRequest(
    requestText: string,
    context: any = {}
  ): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/execute-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: requestText,
          context,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Request execution failed:', error);
      throw error;
    }
  }

  /**
   * الحصول على اقتراحات للطلبات
   */
  async getSuggestions(partialText: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: partialText }),
      });

      return await response.json();
    } catch (error) {
      console.error('Suggestions retrieval failed:', error);
      throw error;
    }
  }

  /**
   * تصنيف بنود
   */
  async classifyItems(items: string[]): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      return await response.json();
    } catch (error) {
      console.error('Item classification failed:', error);
      throw error;
    }
  }

  /**
   * حساب مدة نشاط
   */
  async calculateDuration(
    activityType: string,
    quantity: number,
    unit: string,
    category?: string
  ): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calculate-duration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: activityType,
          quantity,
          unit,
          category,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Duration calculation failed:', error);
      throw error;
    }
  }

  /**
   * الحصول على معدلات الإنتاجية
   */
  async getProductivityRates(): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/productivity-rates`);
      return await response.json();
    } catch (error) {
      console.error('Productivity rates retrieval failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const noufalAPI = new NOUFALBackendAPI();
export default NOUFALBackendAPI;
