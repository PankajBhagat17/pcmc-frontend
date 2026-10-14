document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("tableBody");
    const searchInput = document.getElementById("searchInput");
    const urgencyFilter = document.getElementById("urgencyFilter");

    let allGrievances = [];

    // Helper to format dates
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Helper to render the table rows
    const renderTable = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = ""; // Clear existing

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-slate-500">No grievances found.</td></tr>`;
            return;
        }

        data.forEach(ticket => {
            // Determine styling for Urgency and Status
            const urgencyColor = (ticket.urgency === 'High' || ticket.urgency === 'Critical') ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100';
            let statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
            if (ticket.status === 'Resolved') statusColor = 'text-green-600 bg-green-50 border-green-200';
            if (ticket.status === 'In-Progress') statusColor = 'text-orange-600 bg-orange-50 border-orange-200';

            const row = document.createElement("tr");
            row.className = "hover:bg-slate-50 transition-colors";
            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-slate-900">${ticket._id.substring(0, 8).toUpperCase()}</td>
                <td class="px-6 py-4 text-slate-500">${formatDate(ticket.createdAt)}</td>
                <td class="px-6 py-4 text-slate-500">Auto-detected</td>
                <td class="px-6 py-4 font-medium text-slate-700">${ticket.department}</td>
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
        // Fetch live data from MongoDB
        const response = await fetch('https://pcmc-admin.onrender.com');
        if (!response.ok) throw new Error("Failed to fetch grievances");
        
        allGrievances = await response.json();
        renderTable(allGrievances);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Failed to load data. Ensure backend is running.</td></tr>`;
    }

    // Optional: Add simple filtering logic
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allGrievances.filter(t => 
                t._id.toLowerCase().includes(term) || 
                t.department.toLowerCase().includes(term)
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