document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("tableBody");
    const searchInput = document.getElementById("searchInput");
    const urgencyFilter = document.getElementById("urgencyFilter");

    let allGrievances = [];

    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Calculate dynamic stats for the top cards
    const updateStats = (data) => {
        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statResolved = document.getElementById('statResolved');
        const statUrgent = document.getElementById('statUrgent');

        if (statTotal) {
            statTotal.innerText = data.length;
        }
        if (statPending) {
            statPending.innerText = data.filter(g => g.status === 'New' || g.status === 'In-Progress' || g.status === 'Reopened').length;
        }
        if (statResolved) {
            statResolved.innerText = data.filter(g => g.status === 'Resolved').length;
        }
        if (statUrgent) {
            statUrgent.innerText = data.filter(g => g.urgency === 'High' || g.urgency === 'Critical').length;
        }
    };

    const renderTable = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = ""; 

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-slate-500 font-medium">No grievances found matching criteria.</td></tr>`;
            return;
        }

        data.forEach(ticket => {
            const urgencyColor = (ticket.urgency === 'High' || ticket.urgency === 'Critical') ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100';
            let statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
            if (ticket.status === 'Resolved') statusColor = 'text-green-600 bg-green-50 border-green-200';
            if (ticket.status === 'In-Progress') statusColor = 'text-orange-600 bg-orange-50 border-orange-200';

            const displayLocation = ticket.location || 'Location not provided';
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();

            const row = document.createElement("tr");
            row.className = "hover:bg-slate-50 transition-colors";
            row.innerHTML = `
                <td class="px-6 py-4 font-bold text-slate-900">${formattedId}</td>
                <td class="px-6 py-4 text-slate-500">${formatDate(ticket.createdAt)}</td>
                <td class="px-6 py-4 text-slate-500 truncate max-w-xs" title="${displayLocation}">${displayLocation}</td>
                <td class="px-6 py-4 font-medium text-slate-700">${ticket.department || 'Unassigned'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded border ${urgencyColor}">${ticket.urgency}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded border ${statusColor}">${ticket.status}</span>
                </td>
                <td class="px-6 py-4">
                    <a href="ticket-detail.html?id=${ticket._id}" class="text-blue-600 font-semibold hover:underline">View →</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    try {
        // FIXED: Added /all to match your backend routes
        let response = await fetch('https://pcmc-admin.onrender.com/api/grievances/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert("Your session has expired. Redirecting to login.");
                localStorage.removeItem("pcmc_token");
                window.location.href = "login.html";
                return;
            }
            throw new Error("Failed to fetch grievances");
        }
        
        allGrievances = await response.json();
        
        // Populate the top cards with live numbers
        updateStats(allGrievances);
        
        // Populate the table
        renderTable(allGrievances);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Failed to load live data. Ensure backend is running.</td></tr>`;
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allGrievances.filter(t => 
                t._id.toLowerCase().includes(term) || 
                (t.department && t.department.toLowerCase().includes(term)) ||
                (t.location && t.location.toLowerCase().includes(term))
            );
            renderTable(filtered);
        });
    }

    if (urgencyFilter) {
        urgencyFilter.addEventListener("change", (e) => {
            const val = e.target.value;
            const filtered = val === 'All' ? allGrievances : allGrievances.filter(t => t.urgency === val);
            renderTable(filtered);
        });
    }
});