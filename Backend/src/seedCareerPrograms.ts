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
    {
        title: 'German Ausbildung Program - Multiple Career Pathways',
        slug: 'german-ausbildung-program',
        shortDescription: 'Start a paid vocational training pathway in Germany with language support, employer placement, visa assistance, and relocation guidance across technical, healthcare, hospitality, IT, and commercial fields.',
        overview: 'Start your international career in Germany through the Ausbildung vocational training program, a structured earn-while-you-learn pathway with industry exposure, recognized certification, and end-to-end support from language preparation to placement and relocation. Available pathways include technical and engineering roles, healthcare, hospitality, IT, office careers, and commercial fields.',
        country: 'Germany',
        eligibleProfiles: [
            '12th Pass (Any Stream)',
            'Age 18 - 30',
            'Basic Interest in Chosen Field',
            'Willingness to Learn German',
        ],
        whyChoose: [
            'Earn while you learn through paid vocational training.',
            'No heavy tuition fees like traditional degree pathways.',
            'High demand across multiple sectors in Germany.',
            'Opportunity to settle and build a long-term career.',
            'Globally recognized certification after completion.',
        ],
        salary: {
            adaptation: {
                min: 800,
                max: 1500,
                currency: 'EUR',
                periodLabel: 'per month during Ausbildung training',
                hasPlus: false,
            },
            fullRecognition: {
                min: 2500,
                max: 3500,
                currency: 'EUR',
                periodLabel: 'per month after Ausbildung completion',
                hasPlus: true,
            },
            additionalBenefits: [
                '1st year stipend: EUR 800 - EUR 1,200 per month.',
                '2nd year stipend: EUR 1,000 - EUR 1,300 per month.',
                '3rd year stipend: EUR 1,200 - EUR 1,500 per month.',
                'Practical and theoretical training with monthly stipend support.',
            ],
        },
        processSteps: [
            {
                title: 'Counseling & Profile Evaluation',
                points: [
                    'Career guidance based on interest and eligibility.',
                    'Selection of the most suitable Ausbildung field.',
                ],
                order: 1,
            },
            {
                title: 'German Language Training (A1 - B2)',
                points: [
                    'Structured training with certified trainers.',
                    'Focus on reading, writing, listening, and speaking.',
                    'Regular mock tests and assessments.',
                ],
                order: 2,
            },
            {
                title: 'B1 / B2 Certification',
                points: [
                    'Appear for Goethe or TELC exams.',
                    'Required for Ausbildung applications in Germany.',
                ],
                order: 3,
            },
            {
                title: 'Interview Preparation & Applications',
                points: [
                    'German CV creation.',
                    'Interview preparation and training.',
                    'Applications to German companies.',
                ],
                order: 4,
            },
            {
                title: 'Employer Interviews & Offer Letter',
                points: [
                    'Direct interviews with employers.',
                    'Receive the Ausbildung contract or offer letter.',
                ],
                order: 5,
            },
            {
                title: 'Documentation & Visa Process',
                points: [
                    'Complete document preparation support.',
                    'Visa filing and embassy guidance.',
                ],
                order: 6,
            },
            {
                title: 'Travel & Relocation',
                points: [
                    'Flight assistance.',
                    'Accommodation guidance.',
                    'Pre-departure briefing.',
                ],
                order: 7,
            },
            {
                title: 'Start Ausbildung in Germany',
                points: [
                    'Join the work and study program.',
                    'Receive monthly stipend during training.',
                    'Complete practical and theoretical learning modules.',
                ],
                order: 8,
            },
        ],
        timelines: [
            {
                title: 'Pathway 1: From Scratch (No German Language)',
                intro: 'For candidates starting without prior German language preparation.',
                phases: [
                    { label: 'Language Training (A1 - B2)', durationLabel: '6 - 8 months' },
                    { label: 'Certification & Applications', durationLabel: '1 - 2 months' },
                    { label: 'Interviews & Offer Letter', durationLabel: '1 - 2 months' },
                    { label: 'Visa Processing', durationLabel: '2 - 3 months' },
                ],
                totalDurationLabel: '10 - 14 months',
                note: 'This pathway covers full language preparation before employer placement.',
                order: 1,
            },
            {
                title: 'Pathway 2: Fast-Track for Candidates With B1 / B2 Certification',
                intro: 'For candidates who already hold valid German certification.',
                phases: [
                    { label: 'Profile Evaluation & Applications', durationLabel: '2 - 4 weeks' },
                    { label: 'Interviews & Offer Letter', durationLabel: '1 - 2 months' },
                    { label: 'Documentation & Visa', durationLabel: '2 - 3 months' },
                ],
                totalDurationLabel: '5 - 8 months',
                note: 'Candidates with B1 or B2 certification can move faster into interviews and placement.',
                order: 2,
            },
        ],
        documentsRequired: [
            'Updated Resume / CV',
            'Valid Passport',
            '10th & 12th Certificates',
            'German Language Certificate (if available)',
            'Birth Certificate',
            'Police Clearance Certificate',
            'Medical Fitness Certificate',
        ],
        ctaDescription: 'Connect with our counselors today to explore the best Ausbildung program for your profile. Applications on this page are coming soon; counselor guidance is available now.',
        tags: ['Germany', 'Ausbildung', 'Vocational Training', 'Paid Training', 'Career Abroad'],
        isActive: true,
        sortOrder: 2,
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
