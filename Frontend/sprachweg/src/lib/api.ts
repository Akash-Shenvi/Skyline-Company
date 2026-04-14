import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const getAssetUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanPath.startsWith('/uploads')) {
        return `${API_BASE_URL}/api${cleanPath}`;
    }
    return `${API_BASE_URL}${cleanPath}`;
};

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const nextAuthPath = window.location.pathname.startsWith('/institution')
                ? '/institution/login'
                : '/login';
            window.location.href = nextAuthPath;
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    async resetPassword(data: { email: string; otp: string; newPassword: string }) {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
    async forgotPassword(email: string) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
};

// Dashboard API
export const dashboardAPI = {
    getStudentData: async () => {
        const response = await api.get('/dashboard/student');
        return response.data;
    },
    getTrainerData: async () => {
        const response = await api.get('/dashboard/trainer');
        return response.data;
    }
};

export const notificationsAPI = {
    async list(params?: { page?: number; limit?: number }) {
        const searchParams = new URLSearchParams();

        if (params?.page) {
            searchParams.set('page', String(params.page));
        }

        if (params?.limit) {
            searchParams.set('limit', String(params.limit));
        }

        const queryString = searchParams.toString();
        const response = await api.get(`/notifications${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },
    async getUnreadCount() {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },
    async markRead(notificationId: string) {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },
    async markAllRead() {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },
};

export const pushAPI = {
    async getPublicKey() {
        const response = await api.get('/push/public-key');
        return response.data;
    },
    async saveSubscription(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
        const response = await api.post('/push/subscriptions', { subscription });
        return response.data;
    },
    async deleteSubscription(endpoint: string) {
        const response = await api.delete('/push/subscriptions', {
            data: { endpoint },
        });
        return response.data;
    },
};

export const chatAPI = {
    async getHistory(studentId: string, trainerId?: string | null) {
        const response = await api.get(`/chat/${studentId}`, {
            params: trainerId ? { trainerId } : undefined,
        });
        return response.data;
    },
    async getUnreadConversations() {
        const response = await api.get('/chat/conversations/unread');
        return response.data;
    },
    async markConversationRead(studentId: string, trainerId?: string | null) {
        const response = await api.patch(`/chat/${studentId}/read`, trainerId ? { trainerId } : {});
        return response.data;
    },
};

export const enrollmentAPI = {
    enroll: async (courseId: string) => {
        const response = await api.post('/enrollment/enroll', { courseId });
        return response.data;
    },
    getPending: async () => {
        const response = await api.get('/enrollment/pending');
        return response.data;
    },
    accept: async (enrollmentId: string) => {
        const response = await api.post('/enrollment/accept', { enrollmentId });
        return response.data;
    },
    reject: async (enrollmentId: string) => {
        const response = await api.post('/enrollment/reject', { enrollmentId });
        return response.data;
    }
};

// Language Course API
export const languageAPI = {
    async getAll() {
        const response = await api.get('/languages');
        return response.data;
    },

    async create(data: FormData) {
        const response = await api.post('/languages', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async update(id: string, data: FormData) {
        const response = await api.put(`/languages/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/languages/${id}`);
        return response.data;
    },
};

export const trainingCheckoutAPI = {
    async create(data: {
        origin: string;
        selectedLevel?: string;
        payerName?: string;
        payerEmail?: string;
        payerPhone?: string;
    }) {
        const response = await api.post('/training-checkout/create', data);
        return response.data;
    },
    async getAllPaymentAttemptsAdmin(params?: { page?: number; limit?: number; issuesOnly?: boolean; status?: string }) {
        const searchParams = new URLSearchParams();

        if (params?.page) {
            searchParams.set('page', String(params.page));
        }

        if (params?.limit) {
            searchParams.set('limit', String(params.limit));
        }

        if (params?.issuesOnly) {
            searchParams.set('issuesOnly', 'true');
        }

        if (params?.status) {
            searchParams.set('status', params.status);
        }

        const queryString = searchParams.toString();
        const response = await api.get(
            `/training-checkout/admin/payment-attempts${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },
    async deletePaymentAttemptAdmin(paymentAttemptId: string) {
        const response = await api.delete(`/training-checkout/admin/payment-attempts/${paymentAttemptId}`);
        return response.data;
    },
};

export const careerProgramsAPI = {
    async getAll() {
        const response = await api.get('/careers');
        return response.data;
    },
    async getBySlug(slug: string) {
        const response = await api.get(`/careers/${slug}`);
        return response.data;
    },
    async getAllAdmin() {
        const response = await api.get('/careers/admin');
        return response.data;
    },
    async create(data: FormData) {
        const response = await api.post('/careers/admin', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    async update(id: string, data: FormData) {
        const response = await api.put(`/careers/admin/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/careers/admin/${id}`);
        return response.data;
    },
};

export const institutionAPI = {
    async getDashboard() {
        const response = await api.get('/institutions/dashboard');
        return response.data;
    },
    async getSubmissions() {
        const response = await api.get('/institutions/submissions');
        return response.data;
    },
    async createSubmission(data: {
        language: 'German';
        courseTitle: string;
        levelName: string;
        students: Array<{ name: string; email: string; password: string }>;
    }) {
        const response = await api.post('/institutions/submissions', data);
        return response.data;
    },
    async getAdminRequests(params?: { page?: number; limit?: number; status?: string; search?: string }) {
        const searchParams = new URLSearchParams();

        if (params?.page) {
            searchParams.set('page', String(params.page));
        }

        if (params?.limit) {
            searchParams.set('limit', String(params.limit));
        }

        if (params?.status) {
            searchParams.set('status', params.status);
        }

        if (params?.search) {
            searchParams.set('search', params.search);
        }

        const queryString = searchParams.toString();
        const response = await api.get(`/admin/institutions/requests${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },
    async approveRequest(id: string) {
        const response = await api.post(`/admin/institutions/requests/${id}/approve`);
        return response.data;
    },
    async rejectRequest(id: string, reason?: string) {
        const response = await api.post(`/admin/institutions/requests/${id}/reject`, reason ? { reason } : {});
        return response.data;
    },
    async deleteRequest(id: string) {
        const response = await api.delete(`/admin/institutions/requests/${id}`);
        return response.data;
    },
};

export default api;
