import { API_BASE_URL, getHeaders } from './api.config';

export const investmentService = {
    getProducts: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/investment-products`, { headers: getHeaders() });
            const data = await res.json();
            return Array.isArray(data.data) ? data.data : [];
        } catch (error) {
            console.error('Failed to fetch investment products:', error);
            return [];
        }
    },

    getInvestments: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/investments`, { headers: getHeaders() });
            const data = await res.json();
            return Array.isArray(data.data) ? data.data : [];
        } catch (error) {
            console.error('Failed to fetch investments:', error);
            return [];
        }
    },

    getPayouts: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/investments/payouts`, { headers: getHeaders() });
            const data = await res.json();
            return Array.isArray(data.data) ? data.data : [];
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
            return [];
        }
    },

    createInvestment: async (data: any) => {
        const res = await fetch(`${API_BASE_URL}/investments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message || 'Failed to create investment');
        return responseData;
    },

    previewReturn: async (id: number, currentTerm?: number) => {
        const url = new URL(`${API_BASE_URL}/investments/${id}/preview-return`);
        if (currentTerm) url.searchParams.append('current_term', String(currentTerm));
        const res = await fetch(url.toString(), { headers: getHeaders() });
        const data = await res.json();
        return data.data;
    },

    initiatePayout: async (id: number, type: string, remarks?: string) => {
        const res = await fetch(`${API_BASE_URL}/investments/${id}/payout`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ payout_type: type, remarks })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to initiate payout');
        return data;
    },

    approvePayout: async (payoutId: number) => {
        const res = await fetch(`${API_BASE_URL}/payouts/${payoutId}/approve`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to approve payout');
        return data;
    },

    settlePayout: async (payoutId: number, referenceCode: string) => {
        const res = await fetch(`${API_BASE_URL}/payouts/${payoutId}/settle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reference_code: referenceCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to settle payout');
        return data;
    },

    renewInvestment: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/investments/${id}/renew`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to renew investment');
        return data;
    }
};
