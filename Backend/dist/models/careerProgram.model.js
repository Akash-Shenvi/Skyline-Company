"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CareerSalaryRangeSchema = new mongoose_1.Schema({
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
    periodLabel: { type: String, required: true, trim: true },
    hasPlus: { type: Boolean, default: false },
}, {
    _id: false,
});
const CareerTimelinePhaseSchema = new mongoose_1.Schema({
    label: { type: String, required: true, trim: true },
    durationLabel: { type: String, required: true, trim: true },
}, {
    _id: false,
});
const CareerTimelineSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    intro: { type: String, trim: true },
    phases: { type: [CareerTimelinePhaseSchema], default: [] },
    totalDurationLabel: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    order: { type: Number, default: 0 },
}, {
    _id: false,
});
const CareerProcessStepSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    points: { type: [String], default: [] },
    order: { type: Number, default: 0 },
}, {
    _id: false,
});
const CareerProgramSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    heroImage: { type: String, trim: true },
    cardImage: { type: String, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    eligibleProfiles: { type: [String], default: [] },
    whyChoose: { type: [String], default: [] },
    salary: {
        adaptation: { type: CareerSalaryRangeSchema, required: true },
        fullRecognition: { type: CareerSalaryRangeSchema, required: true },
        additionalBenefits: { type: [String], default: [] },
    },
    processSteps: { type: [CareerProcessStepSchema], default: [] },
    timelines: { type: [CareerTimelineSchema], default: [] },
    documentsRequired: { type: [String], default: [] },
    ctaDescription: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, {
    timestamps: true,
});
CareerProgramSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });
exports.default = mongoose_1.default.model('CareerProgram', CareerProgramSchema);
