document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("profileTableBody");
    const token = localStorage.getItem("pcmc_token");
    
    if (!token) {
        alert("Please log in to view your profile tracking.");
        window.location.href = "login.html";
        return;
    }

    let currentUserId = null;
    try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = tokenPayload.id || tokenPayload.userId;
    } catch (error) {
        console.error("Invalid token.");
    }

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    try {
        let response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
            response = await fetch('https://pcmc-admin.onrender.com/grievances', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        if (!response.ok) throw new Error("Failed to load");

        const allGrievances = await response.json();
        
        // Filter the database to only show tickets submitted by the logged-in user
        const myGrievances = allGrievances.filter(g => {
            if (g.citizenId && typeof g.citizenId === 'object') return g.citizenId._id === currentUserId;
            return g.citizenId === currentUserId;
        });

        tableBody.innerHTML = "";

        if (myGrievances.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500 font-medium">You haven't submitted any grievances yet.</td></tr>`;
            return;
        }

        myGrievances.forEach(ticket => {
            let statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
            if (ticket.status === 'Resolved') statusColor = 'text-green-600 bg-green-50 border-green-200';
            if (ticket.status === 'In-Progress') statusColor = 'text-orange-600 bg-orange-50 border-orange-200';

            // FORMAT PROPER ID
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();

            const row = document.createElement("tr");
            row.className = "hover:bg-slate-50 transition-colors";
            row.innerHTML = `
                <td class="px-6 py-4 font-bold text-slate-900">${formattedId}</td>
                <td class="px-6 py-4 text-slate-500">${formatDate(ticket.createdAt)}</td>
                <td class="px-6 py-4 font-medium text-slate-700">${ticket.department}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded border ${statusColor}">${ticket.status}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading your profile data.</td></tr>`;
    }
});