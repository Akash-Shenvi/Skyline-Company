import mongoose from 'mongoose';
import CareerProgram from './models/careerProgram.model';
import { env } from './config/env';

const careerPrograms = [
    {
        title: 'German Nursing Program - B.Sc / GNM Recruitment',
        slug: 'german-nursing-program',
        shortDescription: 'Build a nursing career in Germany with structured language training, employer placement, qualification recognition, visa support, and relocation guidance.',
        overview: 'Build a successful international nursing career in Germany with complete end-to-end support. From German language training to employer placement and relocation, the program follows a structured, transparent, and result-driven pathway.',
        country: 'Germany',
        eligibleProfiles: ['B.Sc Nurses', 'GNM Nurses'],
        whyChoose: [
            'Direct pathway to work as a Registered Nurse in Germany.',
            'High demand with long-term career stability.',
            'Complete support from training to placement and relocation.',
            'Opportunity to work in top hospitals and healthcare institutions in Germany.',
            'Step-by-step guidance with expert assistance at every stage.',
        ],
        salary: {
            adaptation: {
                min: 1900,
                max: 2500,
                currency: 'EUR',
                periodLabel: 'per month during adaptation period',
                hasPlus: false,
            },
            fullRecognition: {
                min: 2800,
                max: 3500,
                currency: 'EUR',
                periodLabel: 'per month after full recognition',
                hasPlus: true,
            },
            additionalBenefits: [
                'Paid leaves and overtime support.',
                'Health insurance coverage.',
                'Accommodation support in some cases.',
                'Strong career growth and job security.',
            ],
        },
        processSteps: [
            {
                title: 'Eligibility Check & Counseling',
                points: [
                    'Profile evaluation for B.Sc and GNM nurses.',
                    'Clear roadmap and process explanation.',
                ],
                order: 1,
            },
            {
                title: 'German Language Training (A1 - B2)',
                points: [
                    'Structured training with certified trainers when required.',
                    'Covers reading, writing, listening, and speaking.',
                    'Regular assessments and mock exams.',
                ],
                order: 2,
            },
            {
                title: 'B2 Certification',
                points: [
                    'Appear for Goethe or TELC B2 exam.',
                    'Mandatory requirement for nursing jobs in Germany.',
                ],
                order: 3,
            },
            {
                title: 'Interview Preparation & Placement',
                points: [
                    'German-style CV creation.',
                    'Mock interviews and preparation sessions.',
                    'Direct interviews with German employers.',
                ],
                order: 4,
            },
            {
                title: 'Documentation & Recognition Process',
                points: [
                    'Complete assistance with document preparation.',
                    'Application support for nursing qualification recognition in Germany.',
                ],
                order: 5,
            },
            {
                title: 'Visa Processing',
                points: [
                    'End-to-end visa application support.',
                    'Embassy guidance and appointment booking.',
                    'Documentation verification.',
                ],
                order: 6,
            },
            {
                title: 'Travel & Relocation',
                points: [
                    'Flight and travel guidance.',
                    'Accommodation assistance.',
                    'Pre-departure briefing.',
                ],
                order: 7,
            },
            {
                title: 'Adaptation Period in Germany',
                points: [
                    'Work under supervision as a nurse.',
                    'Complete any pending recognition requirements.',
                ],
                order: 8,
            },
            {
                title: 'Full Recognition & Permanent Job',
                points: [
                    'Become a fully recognized nurse in Germany.',
                    'Start earning full salary with long-term career growth.',
                ],
                order: 9,
            },
        ],
        timelines: [
            {
                title: 'Pathway 1: From Scratch (No German Language)',
                intro: 'For candidates who need complete language preparation before placement.',
                phases: [
                    { label: 'Language Training (A1 - B2)', durationLabel: '6 - 8 months' },
                    { label: 'B2 Certification', durationLabel: '~1 month' },
                    { label: 'Interviews & Documentation', durationLabel: '1 - 2 months' },
                    { label: 'Visa Processing', durationLabel: '2 - 3 months' },
                ],
                totalDurationLabel: '10 - 14 months',
                note: 'This is the full pathway for candidates starting without German language readiness.',
                order: 1,
            },
            {
                title: 'Pathway 2: Fast-Track for Candidates With B1 / B2 Certification',
                intro: 'For candidates who already hold valid Goethe or TELC B1/B2 certification.',
                phases: [
                    { label: 'Profile Evaluation & Preparation', durationLabel: '2 - 4 weeks' },
                    { label: 'Employer Interviews & Selection', durationLabel: '1 - 2 months' },
                    { label: 'Documentation & Recognition', durationLabel: '1 - 2 months' },
                    { label: 'Visa Processing', durationLabel: '2 - 3 months' },
                ],
                totalDurationLabel: '5 - 8 months',
                note: 'Candidates with valid B1/B2 certification can skip language training and move directly into placement.',
                order: 2,
            },
        ],
        documentsRequired: [
            'Updated Resume / CV',
            'Valid Passport',
            '10th & 12th Certificates',
            'Nursing Qualification Certificate (B.Sc / GNM)',
            'Nursing Registration Certificate',
            'Experience Certificate (if available)',
            'German Language Certificate (if available)',
            'Birth Certificate',
            'Police Clearance Certificate',
            'Medical Fitness Certificate',
        ],
        ctaDescription: 'Connect with our counselors to begin your Germany nursing journey. Applications on this page are coming soon; counselor guidance is available now.',
        tags: ['Germany', 'Nursing', 'B.Sc', 'GNM', 'Abroad Placement'],
        isActive: true,
        sortOrder: 1,
    },
];

const seedCareerPrograms = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        await CareerProgram.deleteMany({
            slug: { $in: careerPrograms.map((program) => program.slug) },
        });
        console.log('Cleared existing career programs');

        await CareerProgram.insertMany(careerPrograms);
        console.log('Database seeded with career programs');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding career programs:', error);
        process.exit(1);
    }
};

seedCareerPrograms();
