// SkillCourse type — used by language course detail pages (English, German, Japanese)
export interface SkillCourse {
    _id: string;
    title: string;
    description?: string;
    language?: string;
    levels?: {
        name: string;
        duration: string;
        price: string;
        features: string[];
        outcome: string;
        examPrep?: {
            title: string;
            details: string;
        };
    }[];
    createdAt?: string;
    updatedAt?: string;
}
