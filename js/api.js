// ==========================================
// API CONFIGURATION
// ==========================================

// Automatically detect if we are running locally or on the live Vercel site
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Points to your live pcmc-admin Render backend
const BASE_URL = IS_LOCAL 
    ? "http://localhost:3000/api" 
    : "https://pcmc-admin.onrender.com/api"; 

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('pcmc_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Tells the backend WHO is submitting
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
        // FIXED: Removed /submit to perfectly match backend router.post('/')
        const response = await fetch(`${BASE_URL}/grievances`, {
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
        // FIXED: Removed /all to perfectly match backend router.get('/')
        const response = await fetch(`${BASE_URL}/grievances`, {
            method: 'GET',
            headers: getAuthHeaders() 
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

async function updateTicketStatus(ticketId, status) {
    try {
        // FIXED: Changed method from PUT to PATCH to match backend router.patch('/:id/status')
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