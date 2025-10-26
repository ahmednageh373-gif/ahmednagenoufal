// ============================================================================
// نظام الذكاء الاصطناعي للتنبؤ والتحسين في المشاريع الإنشائية
// AI Prediction & Optimization System for Construction Projects
// ============================================================================

import * as tf from '@tensorflow/tfjs';

// ============================================================================
// 1. أنواع البيانات الأساسية (Core Types)
// ============================================================================

interface Project {
  id: string;
  name: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure';
  location: Location;
  totalArea: number;
  budget: number;
  duration: number;
  complexity: number; // 1-10
}

interface Location {
  city: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface HistoricalProject extends Project {
  actualCost: number;
  actualDuration: number;
  delayReasons: string[];
  costOverrunReasons: string[];
  weatherImpact: number;
  qualityScore: number;
  safetyScore: number;
}

interface CostFeature {
  projectType: number;
  area: number;
  complexity: number;
  location: number;
  seasonality: number;
  materialPriceIndex: number;
  laborAvailability: number;
}

interface PredictionResult {
  predictedCost: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  factors: InfluenceFactor[];
}

interface InfluenceFactor {
  name: string;
  impact: number; // -100 to +100
  description: string;
}

interface MaintenanceRecord {
  date: Date;
  description: string;
  engineHoursAtMaintenance: number;
}

// ============================================================================
// 2. محرك التنبؤ بالتكاليف (Cost Prediction Engine)
// ============================================================================

export class CostPredictionEngine {
  private model: tf.LayersModel | null = null;
  private scaler: { mean: number[]; std: number[] } | null = null;
  
  /**
   * تدريب نموذج التنبؤ بالتكاليف
   * Train the cost prediction model
   */
  async trainModel(historicalProjects: HistoricalProject[]): Promise<void> {
    console.log('🤖 بدء تدريب نموذج الذكاء الاصطناعي...');
    
    // 1. تحضير البيانات (Data Preparation)
    const features = historicalProjects.map(p => this.extractFeatures(p));
    const labels = historicalProjects.map(p => p.actualCost);
    
    // 2. تطبيع البيانات (Data Normalization)
    const { normalizedFeatures, scaler } = this.normalizeData(features);
    this.scaler = scaler;
    
    // 3. تحويل إلى Tensors
    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor2d(labels.map(l => [l]));
    
    // 4. بناء الشبكة العصبية (Neural Network Architecture)
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [features[0].length], 
          units: 64, 
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu' 
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu' 
        }),
        tf.layers.dense({ 
          units: 1,
          activation: 'linear'
        })
      ]
    });
    
    // 5. تجميع النموذج (Compile Model)
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    // 6. تدريب النموذج (Train Model)
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`📊 Epoch ${epoch}: Loss = ${logs?.loss.toFixed(4)}`);
          }
        }
      }
    });
    
    console.log('✅ اكتمل تدريب النموذج بنجاح!');
    
    // تنظيف الذاكرة
    xs.dispose();
    ys.dispose();
  }
  
  /**
   * استخراج الميزات من المشروع
   * Extract features from project
   */
  private extractFeatures(project: HistoricalProject): number[] {
    return [
      this.encodeProjectType(project.type),
      project.totalArea,
      project.complexity,
      this.encodeLocation(project.location),
      this.getSeasonality(new Date()),
      this.getMaterialPriceIndex(),
      this.getLaborAvailability(project.location),
      project.duration,
      project.budget / project.totalArea // Cost per sqm baseline
    ];
  }
  
  /**
   * ترميز نوع المشروع
   */
  private encodeProjectType(type: string): number {
    const mapping: Record<string, number> = {
      'Residential': 1,
      'Commercial': 2,
      'Industrial': 3,
      'Infrastructure': 4
    };
    return mapping[type] || 0;
  }
  
  /**
   * ترميز الموقع
   */
  private encodeLocation(location: Location): number {
    // يمكن استخدام خوارزمية أكثر تعقيداً
    const cities: Record<string, number> = {
      'الرياض': 1.0,
      'جدة': 1.1,
      'الدمام': 1.05,
      'مكة': 1.15,
      'المدينة': 1.12
    };
    return cities[location.city] || 1.0;
  }
  
  /**
   * الحصول على عامل الموسمية
   */
  private getSeasonality(date: Date): number {
    const month = date.getMonth();
    // الصيف (يونيو - أغسطس): إنتاجية أقل
    if (month >= 5 && month <= 7) return 0.85;
    // الشتاء (ديسمبر - فبراير): إنتاجية أعلى
    if (month >= 11 || month <= 1) return 1.1;
    return 1.0;
  }
  
  /**
   * الحصول على مؤشر أسعار المواد
   */
  private getMaterialPriceIndex(): number {
    // في الواقع، يجب جلب هذا من API خارجي
    return 1.08; // ارتفاع 8%
  }
  
  /**
   * الحصول على توفر العمالة
   */
  private getLaborAvailability(location: Location): number {
    // 1.0 = متوفر بشكل جيد، 0.8 = نقص
    return 0.95;
  }
  
  /**
   * تطبيع البيانات (Normalization)
   */
  private normalizeData(features: number[][]): {
    normalizedFeatures: number[][];
    scaler: { mean: number[]; std: number[] };
  } {
    const numFeatures = features[0].length;
    const mean: number[] = [];
    const std: number[] = [];
    
    // حساب المتوسط والانحراف المعياري
    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      mean[i] = column.reduce((a, b) => a + b, 0) / column.length;
      const variance = column.reduce((a, b) => a + Math.pow(b - mean[i], 2), 0) / column.length;
      std[i] = Math.sqrt(variance);
    }
    
    // تطبيع البيانات
    const normalizedFeatures = features.map(row =>
      row.map((val, i) => (val - mean[i]) / (std[i] || 1))
    );
    
    return { normalizedFeatures, scaler: { mean, std } };
  }
  
  /**
   * التنبؤ بتكلفة مشروع جديد
   * Predict cost for new project
   */
  async predict(project: Project): Promise<PredictionResult> {
    if (!this.model || !this.scaler) {
      throw new Error('النموذج غير مدرب! يرجى تدريب النموذج أولاً.');
    }
    
    // 1. استخراج الميزات
    const features = this.extractFeatures(project as any);
    
    // 2. تطبيع الميزات
    const normalized = features.map(
      (val, i) => (val - this.scaler!.mean[i]) / (this.scaler!.std[i] || 1)
    );
    
    // 3. التنبؤ
    const input = tf.tensor2d([normalized]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const predictedCost = (await prediction.data())[0];
    
    // 4. حساب فترة الثقة (Confidence Interval)
    // استخدام Monte Carlo Dropout
    const predictions: number[] = [];
    for (let i = 0; i < 100; i++) {
      const pred = this.model.predict(input, { training: true }) as tf.Tensor;
      predictions.push((await pred.data())[0]);
      pred.dispose();
    }
    
    const sortedPredictions = predictions.sort((a, b) => a - b);
    const lowerBound = sortedPredictions[Math.floor(predictions.length * 0.05)];
    const upperBound = sortedPredictions[Math.floor(predictions.length * 0.95)];
    const confidence = 1 - (upperBound - lowerBound) / predictedCost;
    
    // تنظيف الذاكرة
    input.dispose();
    prediction.dispose();
    
    // 5. تحليل العوامل المؤثرة
    const factors = this.analyzeInfluenceFactors(project, predictedCost);
    
    return {
      predictedCost,
      confidence: Math.max(0, Math.min(1, confidence)),
      lowerBound,
      upperBound,
      factors
    };
  }
  
  /**
   * تحليل العوامل المؤثرة
   */
  private analyzeInfluenceFactors(project: Project, predictedCost: number): InfluenceFactor[] {
    const factors: InfluenceFactor[] = [];
    
    // عامل الموقع
    const locationFactor = this.encodeLocation(project.location);
    if (locationFactor > 1.05) {
      factors.push({
        name: 'الموقع الجغرافي',
        impact: (locationFactor - 1) * 100,
        description: `موقع المشروع في ${project.location.city} يزيد التكلفة بنسبة ${((locationFactor - 1) * 100).toFixed(1)}%`
      });
    }
    
    // عامل التعقيد
    if (project.complexity > 7) {
      factors.push({
        name: 'تعقيد المشروع',
        impact: (project.complexity - 5) * 5,
        description: `التعقيد العالي للمشروع يزيد التكلفة بنسبة ${((project.complexity - 5) * 5).toFixed(1)}%`
      });
    }
    
    // عامل الموسمية
    const seasonality = this.getSeasonality(new Date());
    if (seasonality < 1) {
      factors.push({
        name: 'الموسم',
        impact: (seasonality - 1) * 100,
        description: 'التنفيذ في فصل الصيف يقلل الإنتاجية بنسبة 15%'
      });
    }
    
    // عامل أسعار المواد
    const materialIndex = this.getMaterialPriceIndex();
    if (materialIndex > 1.05) {
      factors.push({
        name: 'أسعار المواد',
        impact: (materialIndex - 1) * 100,
        description: `ارتفاع أسعار المواد بنسبة ${((materialIndex - 1) * 100).toFixed(1)}%`
      });
    }
    
    return factors;
  }
}

// ============================================================================
// 3. محرك التنبؤ بالمدد الزمنية (Duration Prediction Engine)
// ============================================================================

export class DurationPredictionEngine {
  /**
   * التنبؤ بمدة المشروع
   */
  async predictDuration(project: Project, historicalData: HistoricalProject[]): Promise<{
    estimatedDuration: number;
    optimistic: number;
    mostLikely: number;
    pessimistic: number;
    risks: RiskFactor[];
  }> {
    // استخدام PERT (Program Evaluation and Review Technique)
    
    // 1. حساب متوسط الإنتاجية من المشاريع السابقة
    const similarProjects = historicalData.filter(p =>
      p.type === project.type &&
      Math.abs(p.totalArea - project.totalArea) / project.totalArea < 0.3
    );
    
    const avgProductivity = similarProjects.length > 0
      ? similarProjects.reduce((sum, p) => sum + p.totalArea / p.actualDuration, 0) / similarProjects.length
      : 100; // قيمة افتراضية: 100 م² في اليوم
    
    // 2. حساب المدة الأساسية
    const baseDuration = project.totalArea / avgProductivity;
    
    // 3. تطبيق عوامل التعديل
    let complexityFactor = 1 + (project.complexity - 5) * 0.05;
    let weatherFactor = this.getWeatherImpactFactor(project.location);
    let seasonFactor = this.getSeasonality(new Date());
    
    // 4. حساب التقديرات الثلاثة (PERT)
    const optimistic = baseDuration * 0.8;
    const mostLikely = baseDuration * complexityFactor * weatherFactor * seasonFactor;
    const pessimistic = baseDuration * 1.5 * complexityFactor;
    
    const estimatedDuration = (optimistic + 4 * mostLikely + pessimistic) / 6;
    
    // 5. تحديد المخاطر
    const risks = this.identifyDurationRisks(project, historicalData);
    
    return {
      estimatedDuration: Math.round(estimatedDuration),
      optimistic: Math.round(optimistic),
      mostLikely: Math.round(mostLikely),
      pessimistic: Math.round(pessimistic),
      risks
    };
  }
  
  private getWeatherImpactFactor(location: Location): number {
    // المناطق الساحلية: رطوبة عالية
    const coastalCities = ['جدة', 'الدمام', 'الخبر'];
    if (coastalCities.includes(location.city)) {
      return 1.08;
    }
    return 1.0;
  }
  
  private getSeasonality(date: Date): number {
    const month = date.getMonth();
    if (month >= 5 && month <= 7) return 1.15; // صيف
    if (month >= 11 || month <= 1) return 0.95; // شتاء
    return 1.0;
  }
  
  private identifyDurationRisks(project: Project, historicalData: HistoricalProject[]): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    // مخاطر الطقس
    const weatherRisk = this.assessWeatherRisk(project.location);
    if (weatherRisk.probability > 0.3) {
      risks.push(weatherRisk);
    }
    
    // مخاطر التعقيد
    if (project.complexity > 7) {
      risks.push({
        type: 'Technical',
        description: 'تعقيد فني عالي قد يسبب تأخيرات',
        probability: 0.4,
        impact: 15, // أيام
        mitigation: 'تعيين مهندسين ذوي خبرة عالية'
      });
    }
    
    // مخاطر التوريد
    risks.push({
      type: 'Supply',
      description: 'احتمال تأخير توريد المواد',
      probability: 0.25,
      impact: 10,
      mitigation: 'التعاقد مع موردين احتياطيين'
    });
    
    return risks;
  }
  
  private assessWeatherRisk(location: Location): RiskFactor {
    const month = new Date().getMonth();
    
    if (month >= 5 && month <= 7) {
      return {
        type: 'Weather',
        description: 'درجات حرارة عالية تقلل ساعات العمل',
        probability: 0.7,
        impact: 20,
        mitigation: 'العمل في فترات الصباح الباكر والمساء'
      };
    }
    
    return {
      type: 'Weather',
      description: 'طقس مناسب للعمل',
      probability: 0.1,
      impact: 2,
      mitigation: 'لا يوجد'
    };
  }
}

interface RiskFactor {
  type: 'Weather' | 'Technical' | 'Supply' | 'Labor';
  description: string;
  probability: number; // 0-1
  impact: number; // أيام
  mitigation: string;
}

// ============================================================================
// 4. محرك تحسين الجدولة (Schedule Optimization Engine)
// ============================================================================

export class ScheduleOptimizationEngine {
  /**
   * تحسين الجدول الزمني باستخدام الخوارزمية الجينية
   * Optimize schedule using Genetic Algorithm
   */
  optimizeSchedule(activities: Activity[], constraints: Constraint[]): OptimizedSchedule {
    console.log('🧬 بدء تحسين الجدول الزمني...');
    
    const POPULATION_SIZE = 50;
    const GENERATIONS = 100;
    const MUTATION_RATE = 0.1;
    
    // 1. إنشاء المجموعة الأولية
    let population = this.initializePopulation(activities, POPULATION_SIZE);
    
    // 2. التطور عبر الأجيال
    for (let gen = 0; gen < GENERATIONS; gen++) {
      // تقييم اللياقة
      const fitness = population.map(schedule => 
        this.calculateFitness(schedule, constraints)
      );
      
      // الاختيار
      const selected = this.selection(population, fitness);
      
      // التزاوج
      const offspring = this.crossover(selected);
      
      // الطفرة
      const mutated = this.mutation(offspring, MUTATION_RATE);
      
      population = mutated;
      
      if (gen % 20 === 0) {
        const bestFitness = Math.max(...fitness);
        console.log(`🔄 الجيل ${gen}: أفضل لياقة = ${bestFitness.toFixed(2)}`);
      }
    }
    
    // 3. اختيار أفضل حل
    const finalFitness = population.map(s => this.calculateFitness(s, constraints));
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    const bestSchedule = population[bestIndex];
    
    const originalDuration = this.calculateTotalDuration(activities);
    const optimizedDuration = this.calculateTotalDuration(bestSchedule);
    const improvement = ((originalDuration - optimizedDuration) / originalDuration) * 100;
    
    console.log(`✅ اكتمل التحسين! تحسين بنسبة ${improvement.toFixed(1)}%`);
    
    return {
      activities: bestSchedule,
      totalDuration: optimizedDuration,
      improvement: improvement,
      resourceUtilization: this.calculateResourceUtilization(bestSchedule),
      criticalPath: this.findCriticalPath(bestSchedule)
    };
  }
  
  private initializePopulation(activities: Activity[], size: number): Activity[][] {
    const population: Activity[][] = [];
    
    for (let i = 0; i < size; i++) {
      const schedule = [...activities];
      // تبديل عشوائي للأنشطة غير الحرجة
      for (let j = 0; j < schedule.length; j++) {
        if (Math.random() < 0.3) {
          const k = Math.floor(Math.random() * schedule.length);
          [schedule[j], schedule[k]] = [schedule[k], schedule[j]];
        }
      }
      population.push(schedule);
    }
    
    return population;
  }
  
  private calculateFitness(schedule: Activity[], constraints: Constraint[]): number {
    let fitness = 1000;
    
    // عقوبة على المدة الطويلة
    const duration = this.calculateTotalDuration(schedule);
    fitness -= duration * 0.5;
    
    // عقوبة على انتهاك القيود
    for (const constraint of constraints) {
      if (!this.checkConstraint(schedule, constraint)) {
        fitness -= 100;
      }
    }
    
    // مكافأة على استخدام الموارد بكفاءة
    const utilization = this.calculateResourceUtilization(schedule);
    fitness += utilization * 50;
    
    return Math.max(0, fitness);
  }
  
  private selection(population: Activity[][], fitness: number[]): Activity[][] {
    // Tournament Selection
    const selected: Activity[][] = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < population.length; i++) {
      const tournament: number[] = [];
      for (let j = 0; j < tournamentSize; j++) {
        tournament.push(Math.floor(Math.random() * population.length));
      }
      const winner = tournament.reduce((best, curr) => 
        fitness[curr] > fitness[best] ? curr : best
      );
      selected.push([...population[winner]]);
    }
    
    return selected;
  }
  
  private crossover(population: Activity[][]): Activity[][] {
    const offspring: Activity[][] = [];
    
    for (let i = 0; i < population.length; i += 2) {
      if (i + 1 < population.length) {
        const parent1 = population[i];
        const parent2 = population[i + 1];
        
        // Single-point crossover
        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
        const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)];
        
        offspring.push(child1, child2);
      } else {
        offspring.push([...population[i]]);
      }
    }
    
    return offspring;
  }
  
  private mutation(population: Activity[][], rate: number): Activity[][] {
    return population.map(schedule => {
      if (Math.random() < rate) {
        const mutated = [...schedule];
        const i = Math.floor(Math.random() * mutated.length);
        const j = Math.floor(Math.random() * mutated.length);
        [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
        return mutated;
      }
      return schedule;
    });
  }
  
  private calculateTotalDuration(activities: Activity[]): number {
    // حساب المدة الإجمالية مع مراعاة التبعيات
    let totalDuration = 0;
    const endTimes: Map<string, number> = new Map();
    
    for (const activity of activities) {
      let startTime = 0;
      
      // التحقق من التبعيات
      if (activity.predecessors && activity.predecessors.length > 0) {
        startTime = Math.max(...activity.predecessors.map(p => endTimes.get(p) || 0));
      }
      
      const endTime = startTime + activity.duration;
      endTimes.set(activity.id, endTime);
      totalDuration = Math.max(totalDuration, endTime);
    }
    
    return totalDuration;
  }
  
  private calculateResourceUtilization(activities: Activity[]): number {
    // حساب كفاءة استخدام الموارد (0-1)
    const resourceLoad: Map<string, number[]> = new Map();
    
    for (const activity of activities) {
      if (activity.resources) {
        for (const resource of activity.resources) {
          if (!resourceLoad.has(resource)) {
            resourceLoad.set(resource, []);
          }
          resourceLoad.get(resource)!.push(activity.duration);
        }
      }
    }
    
    let totalUtilization = 0;
    let resourceCount = 0;
    
    for (const [resource, loads] of resourceLoad) {
      const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
      totalUtilization += Math.min(1, avgLoad / 8); // 8 ساعات عمل يومياً
      resourceCount++;
    }
    
    return resourceCount > 0 ? totalUtilization / resourceCount : 0;
  }
  
  private findCriticalPath(activities: Activity[]): string[] {
    // خوارزمية CPM بسيطة
    const criticalPath: string[] = [];
    const endTimes: Map<string, number> = new Map();
    
    for (const activity of activities) {
      let startTime = 0;
      if (activity.predecessors && activity.predecessors.length > 0) {
        startTime = Math.max(...activity.predecessors.map(p => endTimes.get(p) || 0));
      }
      endTimes.set(activity.id, startTime + activity.duration);
    }
    
    // إيجاد الأنشطة في المسار الحرج
    const maxDuration = Math.max(...Array.from(endTimes.values()));
    
    for (const [activityId, endTime] of endTimes) {
      if (Math.abs(endTime - maxDuration) < 0.1) {
        criticalPath.push(activityId);
      }
    }
    
    return criticalPath;
  }
  
  private checkConstraint(schedule: Activity[], constraint: Constraint): boolean {
    // التحقق من القيود
    switch (constraint.type) {
      case 'MaxDuration':
        return this.calculateTotalDuration(schedule) <= constraint.value;
      case 'ResourceLimit':
        return this.calculateResourceUtilization(schedule) <= constraint.value;
      default:
        return true;
    }
  }
}

export interface Activity {
  id: string;
  name: string;
  duration: number;
  predecessors?: string[];
  resources?: string[];
}

export interface Constraint {
  type: 'MaxDuration' | 'ResourceLimit' | 'Precedence';
  value: number;
  description: string;
}

export interface OptimizedSchedule {
  activities: Activity[];
  totalDuration: number;
  improvement: number;
  resourceUtilization: number;
  criticalPath: string[];
}
