"""
NOUFAL ERP - Advanced Financial & Time Analytics
=================================================
التحليلات المالية والزمنية المتقدمة

This module provides comprehensive analytics for:
- Earned Value Management (EVM)
- Financial Performance Analysis
- Schedule Performance Analysis
- Cost Forecasting
- Risk Analytics
- Productivity Analysis
- Trend Analysis
- KPI Dashboard
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict
import statistics


# ==================== Data Models ====================

@dataclass
class EVMAnalysis:
    """تحليل القيمة المكتسبة (Earned Value Management)"""
    project_id: int
    analysis_date: datetime
    
    # القيم الأساسية
    planned_value: float  # PV - القيمة المخططة
    earned_value: float  # EV - القيمة المكتسبة
    actual_cost: float  # AC - التكلفة الفعلية
    budget_at_completion: float  # BAC - الميزانية عند الاكتمال
    
    # المؤشرات المحسوبة
    cost_variance: float = 0.0  # CV = EV - AC
    schedule_variance: float = 0.0  # SV = EV - PV
    cost_performance_index: float = 0.0  # CPI = EV / AC
    schedule_performance_index: float = 0.0  # SPI = EV / PV
    
    # التوقعات
    estimate_at_completion: float = 0.0  # EAC
    estimate_to_complete: float = 0.0  # ETC
    variance_at_completion: float = 0.0  # VAC = BAC - EAC
    to_complete_performance_index: float = 0.0  # TCPI
    
    def __post_init__(self):
        """حساب المؤشرات تلقائياً"""
        self.cost_variance = self.earned_value - self.actual_cost
        self.schedule_variance = self.earned_value - self.planned_value
        
        self.cost_performance_index = self.earned_value / self.actual_cost if self.actual_cost > 0 else 0
        self.schedule_performance_index = self.earned_value / self.planned_value if self.planned_value > 0 else 0
        
        # حساب EAC بطريقة CPI
        self.estimate_at_completion = self.budget_at_completion / self.cost_performance_index if self.cost_performance_index > 0 else self.budget_at_completion
        self.estimate_to_complete = self.estimate_at_completion - self.actual_cost
        self.variance_at_completion = self.budget_at_completion - self.estimate_at_completion
        
        # حساب TCPI
        work_remaining = self.budget_at_completion - self.earned_value
        funds_remaining = self.budget_at_completion - self.actual_cost
        self.to_complete_performance_index = work_remaining / funds_remaining if funds_remaining > 0 else 0


@dataclass
class FinancialMetrics:
    """المقاييس المالية"""
    revenue: float
    costs: float
    profit: float
    profit_margin: float
    roi: float  # Return on Investment
    cash_flow: float
    
    def __post_init__(self):
        self.profit = self.revenue - self.costs
        self.profit_margin = (self.profit / self.revenue * 100) if self.revenue > 0 else 0
        self.roi = (self.profit / self.costs * 100) if self.costs > 0 else 0


@dataclass
class ScheduleMetrics:
    """مقاييس الجدول الزمني"""
    planned_duration: int  # days
    actual_duration: int  # days
    remaining_duration: int  # days
    planned_progress: float  # percentage
    actual_progress: float  # percentage
    schedule_variance: float  # percentage
    critical_path_delay: int  # days


# ==================== Earned Value Management Analyzer ====================

class EVMAnalyzer:
    """
    محلل القيمة المكتسبة
    ====================
    
    يوفر تحليلات متقدمة لإدارة القيمة المكتسبة
    """
    
    def __init__(self):
        self.historical_data: List[EVMAnalysis] = []
    
    def calculate_evm(
        self,
        project_id: int,
        planned_value: float,
        earned_value: float,
        actual_cost: float,
        budget_at_completion: float
    ) -> EVMAnalysis:
        """
        حساب تحليل القيمة المكتسبة
        
        Returns:
            تحليل EVM كامل مع جميع المؤشرات
        """
        analysis = EVMAnalysis(
            project_id=project_id,
            analysis_date=datetime.now(),
            planned_value=planned_value,
            earned_value=earned_value,
            actual_cost=actual_cost,
            budget_at_completion=budget_at_completion
        )
        
        self.historical_data.append(analysis)
        return analysis
    
    def get_performance_status(self, evm: EVMAnalysis) -> Dict:
        """
        تحديد حالة الأداء
        
        Returns:
            تقييم شامل لأداء المشروع
        """
        # تقييم التكلفة
        if evm.cost_performance_index >= 1.0:
            cost_status = "excellent" if evm.cost_performance_index >= 1.1 else "good"
            cost_message = "ضمن الميزانية"
        elif evm.cost_performance_index >= 0.95:
            cost_status = "acceptable"
            cost_message = "تجاوز طفيف للميزانية"
        elif evm.cost_performance_index >= 0.90:
            cost_status = "warning"
            cost_message = "تجاوز متوسط للميزانية"
        else:
            cost_status = "critical"
            cost_message = "تجاوز حرج للميزانية"
        
        # تقييم الجدول الزمني
        if evm.schedule_performance_index >= 1.0:
            schedule_status = "excellent" if evm.schedule_performance_index >= 1.1 else "good"
            schedule_message = "متقدم عن الجدول"
        elif evm.schedule_performance_index >= 0.95:
            schedule_status = "acceptable"
            schedule_message = "تأخير طفيف"
        elif evm.schedule_performance_index >= 0.90:
            schedule_status = "warning"
            schedule_message = "تأخير متوسط"
        else:
            schedule_status = "critical"
            schedule_message = "تأخير حرج"
        
        # تقييم شامل
        overall_status = "good"
        if cost_status in ["critical", "warning"] or schedule_status in ["critical", "warning"]:
            overall_status = "at_risk"
        if cost_status == "critical" and schedule_status == "critical":
            overall_status = "critical"
        
        return {
            "overall_status": overall_status,
            "cost_status": cost_status,
            "cost_message": cost_message,
            "schedule_status": schedule_status,
            "schedule_message": schedule_message,
            "cpi": round(evm.cost_performance_index, 3),
            "spi": round(evm.schedule_performance_index, 3),
            "cost_variance_amount": evm.cost_variance,
            "schedule_variance_amount": evm.schedule_variance,
            "estimated_overrun": evm.estimate_at_completion - evm.budget_at_completion,
            "completion_forecast": evm.estimate_at_completion
        }
    
    def get_trend_analysis(self, project_id: int, periods: int = 6) -> Dict:
        """
        تحليل الاتجاهات للمشروع
        
        Args:
            project_id: معرّف المشروع
            periods: عدد الفترات للتحليل
        
        Returns:
            تحليل اتجاهات CPI و SPI
        """
        project_data = [
            evm for evm in self.historical_data
            if evm.project_id == project_id
        ][-periods:]
        
        if not project_data:
            return {"error": "No historical data"}
        
        cpi_values = [evm.cost_performance_index for evm in project_data]
        spi_values = [evm.schedule_performance_index for evm in project_data]
        
        # حساب الاتجاه
        cpi_trend = "improving" if cpi_values[-1] > cpi_values[0] else "declining"
        spi_trend = "improving" if spi_values[-1] > spi_values[0] else "declining"
        
        return {
            "project_id": project_id,
            "periods_analyzed": len(project_data),
            "cpi_trend": {
                "direction": cpi_trend,
                "current": cpi_values[-1],
                "average": statistics.mean(cpi_values),
                "min": min(cpi_values),
                "max": max(cpi_values),
                "values": cpi_values
            },
            "spi_trend": {
                "direction": spi_trend,
                "current": spi_values[-1],
                "average": statistics.mean(spi_values),
                "min": min(spi_values),
                "max": max(spi_values),
                "values": spi_values
            }
        }
    
    def forecast_completion_date(
        self,
        evm: EVMAnalysis,
        original_duration: int  # days
    ) -> Dict:
        """
        توقع تاريخ الاكتمال
        
        Args:
            evm: تحليل EVM الحالي
            original_duration: المدة الأصلية بالأيام
        
        Returns:
            توقع تاريخ الاكتمال
        """
        if evm.schedule_performance_index == 0:
            return {"error": "Invalid SPI"}
        
        # حساب المدة المتوقعة
        forecasted_duration = original_duration / evm.schedule_performance_index
        delay_days = forecasted_duration - original_duration
        
        # حساب التواريخ
        project_start = datetime.now() - timedelta(days=original_duration * (evm.earned_value / evm.budget_at_completion))
        original_end = project_start + timedelta(days=original_duration)
        forecasted_end = project_start + timedelta(days=forecasted_duration)
        
        return {
            "original_duration_days": original_duration,
            "forecasted_duration_days": round(forecasted_duration, 1),
            "delay_days": round(delay_days, 1),
            "original_end_date": original_end.date().isoformat(),
            "forecasted_end_date": forecasted_end.date().isoformat(),
            "confidence_level": "medium" if 0.9 <= evm.schedule_performance_index <= 1.1 else "low"
        }


# ==================== Financial Performance Analyzer ====================

class FinancialAnalyzer:
    """
    محلل الأداء المالي
    ==================
    
    يوفر تحليلات مالية شاملة
    """
    
    def analyze_profitability(
        self,
        revenue: float,
        costs: float,
        initial_investment: float = 0
    ) -> Dict:
        """
        تحليل الربحية
        
        Returns:
            مؤشرات الربحية الشاملة
        """
        profit = revenue - costs
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0
        roi = ((profit - initial_investment) / initial_investment * 100) if initial_investment > 0 else 0
        
        # تصنيف الربحية
        if profit_margin >= 25:
            profitability_rating = "excellent"
        elif profit_margin >= 15:
            profitability_rating = "good"
        elif profit_margin >= 10:
            profitability_rating = "acceptable"
        elif profit_margin >= 5:
            profitability_rating = "poor"
        else:
            profitability_rating = "loss"
        
        return {
            "revenue": revenue,
            "costs": costs,
            "gross_profit": profit,
            "profit_margin_percentage": round(profit_margin, 2),
            "roi_percentage": round(roi, 2),
            "profitability_rating": profitability_rating,
            "break_even_point": costs,
            "profit_per_day": profit / 365 if revenue > 0 else 0
        }
    
    def analyze_cash_flow(
        self,
        cash_inflows: List[Dict],
        cash_outflows: List[Dict]
    ) -> Dict:
        """
        تحليل التدفق النقدي
        
        Args:
            cash_inflows: قائمة التدفقات الداخلة [{date, amount}, ...]
            cash_outflows: قائمة التدفقات الخارجة [{date, amount}, ...]
        
        Returns:
            تحليل التدفق النقدي
        """
        total_inflows = sum(item["amount"] for item in cash_inflows)
        total_outflows = sum(item["amount"] for item in cash_outflows)
        net_cash_flow = total_inflows - total_outflows
        
        # حساب التدفق النقدي التراكمي
        all_transactions = []
        for item in cash_inflows:
            all_transactions.append({"date": item["date"], "amount": item["amount"], "type": "inflow"})
        for item in cash_outflows:
            all_transactions.append({"date": item["date"], "amount": -item["amount"], "type": "outflow"})
        
        all_transactions.sort(key=lambda x: x["date"])
        
        cumulative = 0
        cumulative_flow = []
        for trans in all_transactions:
            cumulative += trans["amount"]
            cumulative_flow.append({
                "date": trans["date"],
                "cumulative_balance": cumulative
            })
        
        # تحديد نقاط النقص النقدي
        cash_shortages = [item for item in cumulative_flow if item["cumulative_balance"] < 0]
        
        return {
            "total_inflows": total_inflows,
            "total_outflows": total_outflows,
            "net_cash_flow": net_cash_flow,
            "current_balance": cumulative,
            "cash_flow_status": "positive" if net_cash_flow > 0 else "negative",
            "cash_shortages_count": len(cash_shortages),
            "cumulative_flow": cumulative_flow[-10:],  # آخر 10 معاملات
            "average_monthly_inflow": total_inflows / 12,
            "average_monthly_outflow": total_outflows / 12
        }
    
    def analyze_cost_breakdown(
        self,
        cost_categories: Dict[str, float]
    ) -> Dict:
        """
        تحليل توزيع التكاليف
        
        Args:
            cost_categories: قاموس التكاليف حسب الفئة
        
        Returns:
            تحليل توزيع التكاليف
        """
        total_cost = sum(cost_categories.values())
        
        breakdown = []
        for category, amount in cost_categories.items():
            percentage = (amount / total_cost * 100) if total_cost > 0 else 0
            breakdown.append({
                "category": category,
                "amount": amount,
                "percentage": round(percentage, 2)
            })
        
        # ترتيب حسب النسبة
        breakdown.sort(key=lambda x: x["percentage"], reverse=True)
        
        # تحديد أكبر 3 فئات
        top_3_categories = breakdown[:3]
        top_3_total = sum(item["percentage"] for item in top_3_categories)
        
        return {
            "total_cost": total_cost,
            "categories_count": len(cost_categories),
            "breakdown": breakdown,
            "top_3_categories": top_3_categories,
            "top_3_percentage": round(top_3_total, 2),
            "cost_concentration": "high" if top_3_total > 75 else "moderate" if top_3_total > 50 else "distributed"
        }


# ==================== Schedule Performance Analyzer ====================

class ScheduleAnalyzer:
    """
    محلل الأداء الزمني
    ==================
    
    يوفر تحليلات متقدمة للجدول الزمني
    """
    
    def analyze_schedule_performance(
        self,
        planned_start: datetime,
        planned_end: datetime,
        actual_start: datetime,
        current_date: datetime,
        completion_percentage: float
    ) -> Dict:
        """
        تحليل أداء الجدول الزمني
        
        Returns:
            مؤشرات أداء الجدول الزمني
        """
        # حساب المدد
        planned_duration = (planned_end - planned_start).days
        elapsed_time = (current_date - actual_start).days
        
        # التقدم المخطط
        planned_progress = (elapsed_time / planned_duration * 100) if planned_duration > 0 else 0
        planned_progress = min(planned_progress, 100)
        
        # الانحراف
        schedule_variance_percentage = completion_percentage - planned_progress
        
        # حالة الجدول
        if schedule_variance_percentage >= 5:
            schedule_status = "ahead"
        elif schedule_variance_percentage >= -5:
            schedule_status = "on_track"
        elif schedule_variance_percentage >= -10:
            schedule_status = "slightly_delayed"
        else:
            schedule_status = "critically_delayed"
        
        # توقع الاكتمال
        if completion_percentage > 0:
            rate_of_progress = completion_percentage / elapsed_time  # percentage per day
            days_to_completion = (100 - completion_percentage) / rate_of_progress if rate_of_progress > 0 else 0
            forecasted_end = current_date + timedelta(days=days_to_completion)
        else:
            forecasted_end = planned_end
            days_to_completion = planned_duration
        
        delay_days = (forecasted_end - planned_end).days
        
        return {
            "planned_duration_days": planned_duration,
            "elapsed_days": elapsed_time,
            "remaining_days_planned": (planned_end - current_date).days,
            "remaining_days_forecast": round(days_to_completion, 1),
            "planned_progress_percentage": round(planned_progress, 2),
            "actual_progress_percentage": completion_percentage,
            "schedule_variance_percentage": round(schedule_variance_percentage, 2),
            "schedule_status": schedule_status,
            "planned_end_date": planned_end.date().isoformat(),
            "forecasted_end_date": forecasted_end.date().isoformat(),
            "delay_days": delay_days,
            "rate_of_progress_per_day": round(completion_percentage / elapsed_time, 3) if elapsed_time > 0 else 0
        }
    
    def analyze_critical_path(
        self,
        activities: List[Dict]
    ) -> Dict:
        """
        تحليل المسار الحرج
        
        Args:
            activities: قائمة الأنشطة [{"id", "duration", "float", "status", ...}, ...]
        
        Returns:
            تحليل المسار الحرج
        """
        critical_activities = [act for act in activities if act.get("float", 0) == 0]
        near_critical = [act for act in activities if 0 < act.get("float", 100) <= 5]
        
        total_critical_duration = sum(act["duration"] for act in critical_activities)
        completed_critical = [act for act in critical_activities if act.get("status") == "completed"]
        completed_duration = sum(act["duration"] for act in completed_critical)
        
        critical_path_progress = (completed_duration / total_critical_duration * 100) if total_critical_duration > 0 else 0
        
        return {
            "total_activities": len(activities),
            "critical_activities_count": len(critical_activities),
            "near_critical_count": len(near_critical),
            "critical_path_duration": total_critical_duration,
            "critical_path_progress": round(critical_path_progress, 2),
            "critical_activities": [
                {
                    "id": act["id"],
                    "name": act.get("name", "Unknown"),
                    "duration": act["duration"],
                    "status": act.get("status", "pending")
                }
                for act in critical_activities[:10]  # أول 10
            ],
            "risk_level": "high" if len(critical_activities) > 20 else "medium" if len(critical_activities) > 10 else "low"
        }


# ==================== KPI Dashboard ====================

class KPIDashboard:
    """
    لوحة مؤشرات الأداء الرئيسية
    ===========================
    
    يجمع جميع المؤشرات الرئيسية في مكان واحد
    """
    
    def __init__(self):
        self.evm_analyzer = EVMAnalyzer()
        self.financial_analyzer = FinancialAnalyzer()
        self.schedule_analyzer = ScheduleAnalyzer()
    
    def get_project_kpis(
        self,
        project_id: int,
        project_data: Dict
    ) -> Dict:
        """
        الحصول على جميع مؤشرات الأداء للمشروع
        
        Args:
            project_id: معرّف المشروع
            project_data: بيانات المشروع الشاملة
        
        Returns:
            لوحة مؤشرات أداء شاملة
        """
        # تحليل EVM
        evm = self.evm_analyzer.calculate_evm(
            project_id=project_id,
            planned_value=project_data["planned_value"],
            earned_value=project_data["earned_value"],
            actual_cost=project_data["actual_cost"],
            budget_at_completion=project_data["budget_at_completion"]
        )
        
        evm_status = self.evm_analyzer.get_performance_status(evm)
        
        # تحليل مالي
        profitability = self.financial_analyzer.analyze_profitability(
            revenue=project_data["revenue"],
            costs=project_data["actual_cost"]
        )
        
        # تحليل جدول زمني
        schedule_perf = self.schedule_analyzer.analyze_schedule_performance(
            planned_start=project_data["planned_start"],
            planned_end=project_data["planned_end"],
            actual_start=project_data["actual_start"],
            current_date=datetime.now(),
            completion_percentage=project_data["completion_percentage"]
        )
        
        return {
            "project_id": project_id,
            "generated_at": datetime.now().isoformat(),
            
            # المؤشرات الرئيسية
            "key_metrics": {
                "overall_health_score": self._calculate_health_score(evm_status, profitability, schedule_perf),
                "completion_percentage": project_data["completion_percentage"],
                "cost_performance_index": evm.cost_performance_index,
                "schedule_performance_index": evm.schedule_performance_index,
                "profit_margin": profitability["profit_margin_percentage"],
                "days_to_completion": schedule_perf["remaining_days_forecast"]
            },
            
            # تفاصيل EVM
            "earned_value_analysis": {
                "planned_value": evm.planned_value,
                "earned_value": evm.earned_value,
                "actual_cost": evm.actual_cost,
                "cost_variance": evm.cost_variance,
                "schedule_variance": evm.schedule_variance,
                "estimate_at_completion": evm.estimate_at_completion,
                "variance_at_completion": evm.variance_at_completion,
                "status": evm_status
            },
            
            # التحليل المالي
            "financial_analysis": profitability,
            
            # أداء الجدول
            "schedule_analysis": schedule_perf,
            
            # التوصيات
            "recommendations": self._generate_recommendations(evm_status, profitability, schedule_perf)
        }
    
    def _calculate_health_score(
        self,
        evm_status: Dict,
        profitability: Dict,
        schedule_perf: Dict
    ) -> int:
        """حساب درجة صحة المشروع (0-100)"""
        score = 100
        
        # خصم نقاط بناءً على الحالة
        if evm_status["cost_status"] == "critical":
            score -= 25
        elif evm_status["cost_status"] == "warning":
            score -= 15
        elif evm_status["cost_status"] == "acceptable":
            score -= 5
        
        if evm_status["schedule_status"] == "critical":
            score -= 25
        elif evm_status["schedule_status"] == "warning":
            score -= 15
        elif evm_status["schedule_status"] == "acceptable":
            score -= 5
        
        if profitability["profitability_rating"] == "poor":
            score -= 10
        elif profitability["profitability_rating"] == "loss":
            score -= 20
        
        return max(0, min(100, score))
    
    def _generate_recommendations(
        self,
        evm_status: Dict,
        profitability: Dict,
        schedule_perf: Dict
    ) -> List[str]:
        """توليد توصيات بناءً على التحليلات"""
        recommendations = []
        
        if evm_status["cpi"] < 0.95:
            recommendations.append("مراجعة التكاليف واتخاذ إجراءات تصحيحية للسيطرة على تجاوز الميزانية")
        
        if evm_status["spi"] < 0.95:
            recommendations.append("تسريع وتيرة العمل لتعويض التأخير في الجدول الزمني")
        
        if profitability["profit_margin_percentage"] < 10:
            recommendations.append("مراجعة استراتيجية التسعير وتحسين كفاءة التكلفة")
        
        if schedule_perf["schedule_status"] in ["slightly_delayed", "critically_delayed"]:
            recommendations.append("إعادة تخطيط الموارد وتحديد أولويات الأنشطة الحرجة")
        
        if not recommendations:
            recommendations.append("المشروع على المسار الصحيح - الاستمرار في المراقبة الدورية")
        
        return recommendations


# ==================== Analytics Manager ====================

class AnalyticsManager:
    """
    مدير التحليلات الرئيسي
    ======================
    ينسق جميع أنواع التحليلات
    """
    
    def __init__(self):
        self.evm_analyzer = EVMAnalyzer()
        self.financial_analyzer = FinancialAnalyzer()
        self.schedule_analyzer = ScheduleAnalyzer()
        self.kpi_dashboard = KPIDashboard()
    
    def get_comprehensive_analysis(
        self,
        project_id: int,
        project_data: Dict
    ) -> Dict:
        """
        تحليل شامل للمشروع
        
        Returns:
            تحليلات متقدمة شاملة
        """
        return {
            "project_id": project_id,
            "analysis_date": datetime.now().isoformat(),
            "kpi_dashboard": self.kpi_dashboard.get_project_kpis(project_id, project_data),
            "trend_analysis": self.evm_analyzer.get_trend_analysis(project_id),
            "completion_forecast": self.evm_analyzer.forecast_completion_date(
                self.evm_analyzer.calculate_evm(
                    project_id,
                    project_data["planned_value"],
                    project_data["earned_value"],
                    project_data["actual_cost"],
                    project_data["budget_at_completion"]
                ),
                project_data.get("planned_duration", 365)
            )
        }


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير التحليلات
    analytics_manager = AnalyticsManager()
    
    # بيانات مشروع مثالية
    project_data = {
        "planned_value": 6_750_000.00,
        "earned_value": 6_600_000.00,
        "actual_cost": 6_825_000.00,
        "budget_at_completion": 15_000_000.00,
        "revenue": 15_000_000.00,
        "completion_percentage": 44.0,
        "planned_start": datetime(2024, 1, 15),
        "planned_end": datetime(2025, 6, 30),
        "actual_start": datetime(2024, 1, 15),
        "planned_duration": 530
    }
    
    # الحصول على تحليل شامل
    print("=== Comprehensive Project Analysis ===")
    analysis = analytics_manager.get_comprehensive_analysis(
        project_id=1,
        project_data=project_data
    )
    
    kpi = analysis["kpi_dashboard"]["key_metrics"]
    print(f"\nProject Health Score: {kpi['overall_health_score']}/100")
    print(f"CPI: {kpi['cost_performance_index']:.3f}")
    print(f"SPI: {kpi['schedule_performance_index']:.3f}")
    print(f"Profit Margin: {kpi['profit_margin']:.2f}%")
    print(f"Days to Completion: {kpi['days_to_completion']:.1f}")
    
    print("\nRecommendations:")
    for i, rec in enumerate(analysis["kpi_dashboard"]["recommendations"], 1):
        print(f"{i}. {rec}")
