// ==========================================
// API CONFIGURATION
// ==========================================

// Automatically detect if we are running locally or on the live Vercel site
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// TODO: Replace 'https://pcmc-backend.onrender.com/api' with your actual live backend URL after Step 2
const BASE_URL = IS_LOCAL 
    ? "https://pcmc-admin.onrender.com" 
    : "https://pcmc-backend.onrender.com/api"; 

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('pcmc_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // This tells the backend WHO is submitting
    };
}

// ==========================================
// AUTHENTICATION API CALLS
// ==========================================
async function loginUser(credentials) {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed.');
        return data;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed.');
        return data;
    } catch (error) {
        console.error("Registration Error:", error);
        throw error;
    }
}

// ==========================================
// GRIEVANCE API CALLS
// ==========================================
async function submitGrievance(grievanceData) {
    try {
        const response = await fetch(`${BASE_URL}/grievances/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(grievanceData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit grievance.');
        return data;
    } catch (error) {
        console.error("Submission Error:", error);
        throw error;
    }
}

async function getAllGrievances() {
    try {
        const response = await fetch(`${BASE_URL}/grievances/all`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch grievances.');
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}

async function trackGrievance(ticketId) {
    try {
        const response = await fetch(`${BASE_URL}/grievances/${ticketId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Ticket not found.');
        return data;
    } catch (error) {
        console.error("Tracking Error:", error);
        throw error;
    }
}

async function submitGrievanceFeedback(ticketId, isSatisfied) {
    try {
        const response = await fetch(`${BASE_URL}/grievances/${ticketId}/feedback`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isSatisfied })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit feedback.');
        return data;
    } catch (error) {
        console.error("Feedback Error:", error);
        throw error;
    }
}

async function updateTicketStatus(ticketId, status) {
    try {
        const response = await fetch(`${BASE_URL}/grievances/${ticketId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update status.');
        return data;
    } catch (error) {
        console.error("Status Update Error:", error);
        throw error;
    }
}

async function getPublicStats() {
    try {
        const response = await fetch(`${BASE_URL}/grievances/stats`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load stats.');
        return data;
    } catch (error) {
        console.error("Stats API Error:", error);
        throw error;
    }
}