/**
 * NOUFAL Scheduling System - Critical Path Method (CPM) Engine
 * محرك حساب المسار الحرج
 * 
 * Calculates Early Start, Early Finish, Late Start, Late Finish, Total Float, and Critical Path
 */

import { AdvancedScheduleActivity, CPMAnalysisResult, DependencyType } from '../types';

export class CPMEngine {
    /**
     * Perform complete CPM analysis on activities
     */
    static performCPM(
        activities: AdvancedScheduleActivity[],
        projectStartDate: Date
    ): CPMAnalysisResult {
        // Clone activities to avoid mutation
        const workingActivities = this.cloneActivities(activities);

        // Step 1: Forward Pass - Calculate Early Start and Early Finish
        this.forwardPass(workingActivities, projectStartDate);

        // Step 2: Backward Pass - Calculate Late Start and Late Finish
        const projectDuration = this.backwardPass(workingActivities);

        // Step 3: Calculate Float and identify Critical Path
        const { criticalPath, floatAnalysis } = this.calculateFloatAndCriticalPath(workingActivities);

        // Step 4: Get project finish date
        const projectFinish = this.addDays(projectStartDate, projectDuration);

        // Step 5: Get critical activities
        const criticalActivities = workingActivities.filter(act => 
            criticalPath.includes(act.id)
        );

        return {
            criticalPath,
            projectDuration,
            projectStart: projectStartDate.toISOString().split('T')[0],
            projectFinish: projectFinish.toISOString().split('T')[0],
            criticalActivities,
            floatAnalysis
        };
    }

    /**
     * Forward Pass - Calculate Early Start and Early Finish
     */
    private static forwardPass(
        activities: AdvancedScheduleActivity[],
        projectStartDate: Date
    ): void {
        // Sort activities by dependencies (topological sort)
        const sorted = this.topologicalSort(activities);

        for (const activity of sorted) {
            let earlyStart = projectStartDate;

            // Check all dependencies
            if (activity.dependencies.length > 0) {
                for (const dep of activity.dependencies) {
                    const predecessor = activities.find(a => a.id === dep.predecessorId);
                    if (!predecessor) continue;

                    let dependencyDate: Date;

                    switch (dep.type) {
                        case 'FS': // Finish-to-Start
                            dependencyDate = this.parseDate(predecessor.earlyFinish);
                            dependencyDate = this.addDays(dependencyDate, dep.lag);
                            break;
                        case 'SS': // Start-to-Start
                            dependencyDate = this.parseDate(predecessor.earlyStart);
                            dependencyDate = this.addDays(dependencyDate, dep.lag);
                            break;
                        case 'FF': // Finish-to-Finish
                            dependencyDate = this.parseDate(predecessor.earlyFinish);
                            dependencyDate = this.addDays(dependencyDate, dep.lag - activity.duration);
                            break;
                        case 'SF': // Start-to-Finish
                            dependencyDate = this.parseDate(predecessor.earlyStart);
                            dependencyDate = this.addDays(dependencyDate, dep.lag - activity.duration);
                            break;
                        default:
                            dependencyDate = projectStartDate;
                    }

                    if (dependencyDate > earlyStart) {
                        earlyStart = dependencyDate;
                    }
                }
            }

            const earlyFinish = this.addDays(earlyStart, activity.duration);

            activity.earlyStart = earlyStart.toISOString().split('T')[0];
            activity.earlyFinish = earlyFinish.toISOString().split('T')[0];
            activity.startDate = activity.earlyStart;
            activity.endDate = activity.earlyFinish;
        }
    }

    /**
     * Backward Pass - Calculate Late Start and Late Finish
     */
    private static backwardPass(activities: AdvancedScheduleActivity[]): number {
        // Find the latest Early Finish date (project end)
        let projectEnd = new Date(0);
        for (const activity of activities) {
            const activityEnd = this.parseDate(activity.earlyFinish);
            if (activityEnd > projectEnd) {
                projectEnd = activityEnd;
            }
        }

        // Calculate project duration in days
        const projectStart = this.parseDate(
            activities.reduce((earliest, act) => 
                act.earlyStart < earliest ? act.earlyStart : earliest, 
                activities[0]?.earlyStart || ''
            )
        );
        const projectDuration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

        // Sort activities in reverse topological order
        const sorted = this.topologicalSort(activities).reverse();

        for (const activity of sorted) {
            // Initialize late finish to project end
            let lateFinish = projectEnd;

            // Find all successors
            const successors = activities.filter(other => 
                other.dependencies.some(dep => dep.predecessorId === activity.id)
            );

            if (successors.length > 0) {
                // Calculate based on successor constraints
                for (const successor of successors) {
                    const dep = successor.dependencies.find(d => d.predecessorId === activity.id);
                    if (!dep) continue;

                    let constraintDate: Date;

                    switch (dep.type) {
                        case 'FS': // Finish-to-Start
                            constraintDate = this.parseDate(successor.lateStart);
                            constraintDate = this.addDays(constraintDate, -dep.lag);
                            break;
                        case 'SS': // Start-to-Start
                            constraintDate = this.parseDate(successor.lateStart);
                            constraintDate = this.addDays(constraintDate, -dep.lag);
                            constraintDate = this.addDays(constraintDate, -activity.duration);
                            break;
                        case 'FF': // Finish-to-Finish
                            constraintDate = this.parseDate(successor.lateFinish);
                            constraintDate = this.addDays(constraintDate, -dep.lag);
                            break;
                        case 'SF': // Start-to-Finish
                            constraintDate = this.parseDate(successor.lateFinish);
                            constraintDate = this.addDays(constraintDate, -dep.lag);
                            constraintDate = this.addDays(constraintDate, -activity.duration);
                            break;
                        default:
                            constraintDate = projectEnd;
                    }

                    if (constraintDate < lateFinish) {
                        lateFinish = constraintDate;
                    }
                }
            }

            const lateStart = this.addDays(lateFinish, -activity.duration);

            activity.lateFinish = lateFinish.toISOString().split('T')[0];
            activity.lateStart = lateStart.toISOString().split('T')[0];
        }

        return projectDuration;
    }

    /**
     * Calculate Float and identify Critical Path
     */
    private static calculateFloatAndCriticalPath(
        activities: AdvancedScheduleActivity[]
    ): {
        criticalPath: number[];
        floatAnalysis: { activityId: number; totalFloat: number; freeFloat: number }[];
    } {
        const criticalPath: number[] = [];
        const floatAnalysis: { activityId: number; totalFloat: number; freeFloat: number }[] = [];

        for (const activity of activities) {
            // Calculate Total Float
            const lateStart = this.parseDate(activity.lateStart);
            const earlyStart = this.parseDate(activity.earlyStart);
            const totalFloat = Math.round((lateStart.getTime() - earlyStart.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate Free Float
            let freeFloat = totalFloat;
            const successors = activities.filter(other => 
                other.dependencies.some(dep => dep.predecessorId === activity.id)
            );

            if (successors.length > 0) {
                const minSuccessorES = Math.min(...successors.map(s => 
                    this.parseDate(s.earlyStart).getTime()
                ));
                const activityEF = this.parseDate(activity.earlyFinish).getTime();
                freeFloat = Math.round((minSuccessorES - activityEF) / (1000 * 60 * 60 * 24));
            }

            activity.totalFloat = totalFloat;
            activity.freeFloat = freeFloat;
            activity.isCritical = totalFloat === 0;

            if (activity.isCritical) {
                criticalPath.push(activity.id);
            }

            floatAnalysis.push({
                activityId: activity.id,
                totalFloat,
                freeFloat
            });
        }

        return { criticalPath, floatAnalysis };
    }

    /**
     * Topological sort of activities based on dependencies
     */
    private static topologicalSort(activities: AdvancedScheduleActivity[]): AdvancedScheduleActivity[] {
        const sorted: AdvancedScheduleActivity[] = [];
        const visited = new Set<number>();
        const temp = new Set<number>();

        const visit = (activity: AdvancedScheduleActivity) => {
            if (temp.has(activity.id)) {
                // Circular dependency detected - break it
                return;
            }
            if (visited.has(activity.id)) {
                return;
            }

            temp.add(activity.id);

            // Visit all dependencies first
            for (const dep of activity.dependencies) {
                const predecessor = activities.find(a => a.id === dep.predecessorId);
                if (predecessor) {
                    visit(predecessor);
                }
            }

            temp.delete(activity.id);
            visited.add(activity.id);
            sorted.push(activity);
        };

        for (const activity of activities) {
            if (!visited.has(activity.id)) {
                visit(activity);
            }
        }

        return sorted;
    }

    /**
     * Clone activities array to avoid mutation
     */
    private static cloneActivities(activities: AdvancedScheduleActivity[]): AdvancedScheduleActivity[] {
        return activities.map(act => ({ ...act }));
    }

    /**
     * Parse date string to Date object
     */
    private static parseDate(dateString: string): Date {
        if (!dateString) return new Date();
        return new Date(dateString);
    }

    /**
     * Add days to a date
     */
    private static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Auto-generate dependencies based on WBS codes and activity types
     */
    static autoGenerateDependencies(activities: AdvancedScheduleActivity[]): void {
        // Group activities by WBS parent
        const wbsGroups = new Map<string, AdvancedScheduleActivity[]>();
        
        for (const activity of activities) {
            const parentWBS = activity.wbsCode.split('.').slice(0, -1).join('.');
            if (!wbsGroups.has(parentWBS)) {
                wbsGroups.set(parentWBS, []);
            }
            wbsGroups.get(parentWBS)!.push(activity);
        }

        // Add sequential dependencies within each WBS group
        wbsGroups.forEach((group) => {
            const sortedGroup = group.sort((a, b) => 
                a.wbsCode.localeCompare(b.wbsCode)
            );

            for (let i = 1; i < sortedGroup.length; i++) {
                const current = sortedGroup[i];
                const previous = sortedGroup[i - 1];

                // Add FS dependency if not already exists
                if (!current.dependencies.some(d => d.predecessorId === previous.id)) {
                    current.dependencies.push({
                        predecessorId: previous.id,
                        type: 'FS',
                        lag: 0
                    });
                }

                // Update successors
                if (!previous.successors.includes(current.id)) {
                    previous.successors.push(current.id);
                }
            }
        });

        // Add logical construction sequence dependencies
        this.addConstructionLogicDependencies(activities);
    }

    /**
     * Add construction logic dependencies (e.g., formwork before concrete)
     */
    private static addConstructionLogicDependencies(activities: AdvancedScheduleActivity[]): void {
        const logicalSequences = [
            { before: 'Formwork', after: 'Rebar', type: 'FS' as DependencyType },
            { before: 'Rebar', after: 'Concrete Pour', type: 'FS' as DependencyType },
            { before: 'Concrete Pour', after: 'Curing', type: 'FS' as DependencyType },
            { before: 'Curing', after: 'Formwork Stripping', type: 'FS' as DependencyType },
            { before: 'Blockwork', after: 'Plastering', type: 'FS' as DependencyType },
            { before: 'Plastering', after: 'Tiling', type: 'FS' as DependencyType },
            { before: 'Plastering', after: 'Painting', type: 'FS' as DependencyType }
        ];

        for (const sequence of logicalSequences) {
            const beforeActivities = activities.filter(a => 
                a.name.includes(sequence.before) || a.description.includes(sequence.before)
            );
            const afterActivities = activities.filter(a => 
                a.name.includes(sequence.after) || a.description.includes(sequence.after)
            );

            // Match activities with same BOQ item or adjacent WBS codes
            for (const before of beforeActivities) {
                for (const after of afterActivities) {
                    if (before.boqItemId === after.boqItemId || 
                        this.areWBSCodesAdjacent(before.wbsCode, after.wbsCode)) {
                        
                        if (!after.dependencies.some(d => d.predecessorId === before.id)) {
                            after.dependencies.push({
                                predecessorId: before.id,
                                type: sequence.type,
                                lag: 0
                            });
                        }

                        if (!before.successors.includes(after.id)) {
                            before.successors.push(after.id);
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if two WBS codes are adjacent
     */
    private static areWBSCodesAdjacent(wbs1: string, wbs2: string): boolean {
        const parts1 = wbs1.split('.');
        const parts2 = wbs2.split('.');

        // Same parent
        if (parts1.slice(0, -1).join('.') === parts2.slice(0, -1).join('.')) {
            return true;
        }

        return false;
    }
}

export default CPMEngine;
