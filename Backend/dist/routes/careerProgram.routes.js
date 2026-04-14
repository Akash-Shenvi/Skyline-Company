"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const careerProgram_controller_1 = require("../controllers/careerProgram.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get('/', careerProgram_controller_1.getPublicCareerPrograms);
router.get('/admin', auth_middleware_1.protect, auth_middleware_1.isAdmin, careerProgram_controller_1.getAdminCareerPrograms);
router.post('/admin', auth_middleware_1.protect, auth_middleware_1.isAdmin, careerProgram_controller_1.createCareerProgram);
router.put('/admin/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, careerProgram_controller_1.updateCareerProgram);
router.delete('/admin/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, careerProgram_controller_1.deleteCareerProgram);
router.get('/:slug', careerProgram_controller_1.getCareerProgramBySlug);
exports.default = router;
