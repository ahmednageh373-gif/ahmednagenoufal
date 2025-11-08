"use strict";
/**
 * استيراد مشروع القصيم الحقيقي
 * Import Real Qassim Project BOQ Data
 *
 * يقوم بـ:
 * 1. قراءة 469 بند من ملف qassim-boq-parsed.json
 * 2. تحويلها إلى IntegratedBOQItem
 * 3. إضافتها إلى ProjectContext
 * 4. اختبار المزامنة التلقائية
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importQassimProject = importQassimProject;
exports.convertToIntegratedBOQItem = convertToIntegratedBOQItem;
exports.mapWorkTypeToCategory = mapWorkTypeToCategory;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
/**
 * تحويل نوع العمل إلى category string
 */
function mapWorkTypeToCategory(workType) {
    var mappings = {
        'أعمال خرسانية': 'concrete',
        'أعمال الحديد': 'steel',
        'أعمال الشدات': 'formwork',
        'أعمال المباني': 'blockwork',
        'أعمال كهربائية': 'electrical',
        'أعمال أخرى': 'other'
    };
    return mappings[workType] || 'other';
}
/**
 * تحويل بند من الملف المحلل إلى IntegratedBOQItem
 */
function convertToIntegratedBOQItem(parsedItem, projectId) {
    var category = mapWorkTypeToCategory(parsedItem.workType);
    var itemId = "BOQ-".concat(parsedItem.serialNo.toString().padStart(4, '0'));
    var taskId = "TASK-".concat(parsedItem.serialNo.toString().padStart(4, '0'));
    // Calculate cost breakdown (rough estimate)
    var totalCost = parsedItem.total;
    var materialCost = totalCost * 0.50; // 50% materials
    var laborCost = totalCost * 0.30; // 30% labor
    var equipmentCost = totalCost * 0.20; // 20% equipment
    return {
        id: itemId,
        projectId: projectId,
        code: parsedItem.itemCode,
        description: parsedItem.description,
        quantity: parsedItem.quantity,
        unit: parsedItem.unit,
        category: category,
        // Schedule Integration
        scheduleIntegration: {
            linkedTaskId: taskId,
            productivityRate: parsedItem.productivityRate,
            calculatedDuration: parsedItem.estimatedDuration,
            resources: {
                labor: {
                    skilled: Math.ceil(parsedItem.quantity / (parsedItem.productivityRate * 10)),
                    unskilled: Math.ceil(parsedItem.quantity / (parsedItem.productivityRate * 20)),
                    supervisor: 1,
                    totalCost: 0, // Will be calculated by IntegrationService
                    dailyCost: 0
                },
                equipment: [],
                materials: []
            },
            syncStatus: 'pending',
            lastSyncDate: new Date()
        },
        // Financial Integration
        financialIntegration: {
            pricing: {
                unitPrice: parsedItem.unitPrice,
                currency: 'SAR',
                priceDate: new Date()
            },
            comparison: {
                estimated: {
                    materialCost: materialCost,
                    laborCost: laborCost,
                    equipmentCost: equipmentCost,
                    totalCost: totalCost
                },
                actual: {
                    materialCost: 0,
                    laborCost: 0,
                    equipmentCost: 0,
                    totalCost: 0
                },
                variance: {
                    materialVariance: 0,
                    laborVariance: 0,
                    equipmentVariance: 0,
                    totalVariance: 0,
                    percentageVariance: 0
                }
            },
            suppliers: [],
            paymentStatus: 'pending'
        },
        // Engineering Standards
        engineeringStandards: {
            applicableCode: 'SBC',
            codeReference: 'SBC 304-2018',
            allowance: 5,
            safetyFactor: 1.15,
            qualityRequirements: [],
            testingRequirements: [],
            complianceStatus: true
        },
        // Progress Tracking
        actualProgress: {
            completedQuantity: 0,
            percentageComplete: 0,
            completionDate: null,
            siteUpdates: []
        },
        // Metadata
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        createdBy: 'Import Script',
        notes: "Imported from Qassim project - ".concat(parsedItem.workType)
    };
}
/**
 * استيراد مشروع القصيم
 */
function importQassimProject() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var errors, importedItems, filePath, fileContent, qassimData, itemsToImport, projectId, _i, itemsToImport_1, item, integratedItem, errorMsg, outputPath;
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            errors = [];
            importedItems = [];
            try {
                filePath = path.join(__dirname, 'qassim-boq-parsed.json');
                fileContent = fs.readFileSync(filePath, 'utf-8');
                qassimData = JSON.parse(fileContent);
                console.log('═══════════════════════════════════════════════════════════');
                console.log('🏗️  استيراد مشروع القصيم');
                console.log('═══════════════════════════════════════════════════════════\n');
                console.log('📋 معلومات المشروع:');
                console.log("   \u2022 \u0627\u0644\u0627\u0633\u0645: ".concat(qassimData.projectInfo.name));
                console.log("   \u2022 \u0627\u0644\u0645\u062F\u0629: ".concat(qassimData.projectInfo.duration));
                console.log("   \u2022 \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629: ".concat(qassimData.projectInfo.budget.toLocaleString('ar-SA'), " \u0631\u064A\u0627\u0644"));
                console.log("   \u2022 \u0639\u062F\u062F \u0627\u0644\u0628\u0646\u0648\u062F: ".concat(qassimData.boqItems.length));
                console.log("   \u2022 \u062D\u062F \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F: ".concat(limit, " \u0628\u0646\u062F\n"));
                itemsToImport = qassimData.boqItems.slice(0, limit);
                projectId = 'qassim-project-001';
                for (_i = 0, itemsToImport_1 = itemsToImport; _i < itemsToImport_1.length; _i++) {
                    item = itemsToImport_1[_i];
                    try {
                        integratedItem = convertToIntegratedBOQItem(item, projectId);
                        importedItems.push(integratedItem);
                        console.log("\u2705 \u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0628\u0646\u062F ".concat(item.serialNo, ": ").concat(item.description.substring(0, 40), "..."));
                    }
                    catch (error) {
                        errorMsg = "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u0646\u062F ".concat(item.serialNo, ": ").concat(error);
                        errors.push(errorMsg);
                        console.error("\u274C ".concat(errorMsg));
                    }
                }
                outputPath = path.join(__dirname, "qassim-imported-".concat(limit, "-items.json"));
                fs.writeFileSync(outputPath, JSON.stringify({
                    projectInfo: qassimData.projectInfo,
                    projectId: projectId,
                    items: importedItems,
                    summary: {
                        totalItems: importedItems.length,
                        totalValue: importedItems.reduce(function (sum, item) { var _a, _b; return sum + (((_b = (_a = item.financialIntegration.comparison) === null || _a === void 0 ? void 0 : _a.estimated) === null || _b === void 0 ? void 0 : _b.totalCost) || 0); }, 0),
                        totalDuration: importedItems.reduce(function (sum, item) {
                            return sum + item.scheduleIntegration.calculatedDuration;
                        }, 0)
                    }
                }, null, 2));
                console.log('\n═══════════════════════════════════════════════════════════');
                console.log('✅ نتائج الاستيراد:');
                console.log("   \u2022 \u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F: ".concat(importedItems.length, " \u0628\u0646\u062F"));
                console.log("   \u2022 \u0627\u0644\u0623\u062E\u0637\u0627\u0621: ".concat(errors.length));
                console.log("   \u2022 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629: ".concat(importedItems.reduce(function (sum, item) { var _a, _b; return sum + (((_b = (_a = item.financialIntegration.comparison) === null || _a === void 0 ? void 0 : _a.estimated) === null || _b === void 0 ? void 0 : _b.totalCost) || 0); }, 0).toLocaleString('ar-SA'), " \u0631\u064A\u0627\u0644"));
                console.log("   \u2022 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062F\u0631\u0629: ".concat(importedItems.reduce(function (sum, item) {
                    return sum + item.scheduleIntegration.calculatedDuration;
                }, 0), " \u064A\u0648\u0645"));
                console.log("   \u2022 \u062D\u0641\u0638 \u0641\u064A: ".concat(outputPath));
                console.log('═══════════════════════════════════════════════════════════\n');
                return [2 /*return*/, {
                        projectInfo: qassimData.projectInfo,
                        importedItems: importedItems,
                        errors: errors
                    }];
            }
            catch (error) {
                console.error('❌ خطأ في استيراد المشروع:', error);
                errors.push("\u062E\u0637\u0623 \u0639\u0627\u0645: ".concat(error));
                return [2 /*return*/, {
                        projectInfo: null,
                        importedItems: [],
                        errors: errors
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * تشغيل الاستيراد
 */
if (require.main === module) {
    var limit = process.argv[2] ? parseInt(process.argv[2]) : 10;
    importQassimProject(limit)
        .then(function (result) {
        if (result.errors.length > 0) {
            console.error('\n⚠️ حدثت أخطاء:');
            result.errors.forEach(function (error) { return console.error("   \u2022 ".concat(error)); });
            process.exit(1);
        }
        else {
            console.log('\n✅ تم الاستيراد بنجاح!');
            console.log('\n💡 الخطوة التالية:');
            console.log('   1. افتح واجهة المشروع');
            console.log('   2. استورد الملف: qassim-imported-*-items.json');
            console.log('   3. راقب المزامنة التلقائية بين BOQ ↔ Schedule ↔ Finance\n');
            process.exit(0);
        }
    })
        .catch(function (error) {
        console.error('❌ فشل الاستيراد:', error);
        process.exit(1);
    });
}
