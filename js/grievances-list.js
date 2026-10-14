document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("grievancesTableBody");
    const searchInput = document.getElementById("grievanceSearch");
    const statusFilter = document.getElementById("grievanceStatusFilter");
    const applyBtn = document.getElementById("applyGrievanceFilters");

    let allGrievances = [];

    // 1. Authenticate Officer
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "login.html";
        return;
    }

    // 2. Render Table Function
    const renderTable = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500 font-medium">No grievances found matching your search.</td></tr>`;
            return;
        }

        data.forEach(ticket => {
            // Badges styling
            const urgencyColor = (ticket.urgency === 'High' || ticket.urgency === 'Critical') 
                ? 'text-red-600 bg-red-50 border-red-100' 
                : 'text-blue-600 bg-blue-50 border-blue-100';
            
            let statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
            if (ticket.status === 'Resolved') statusColor = 'text-green-600 bg-green-50 border-green-200';
            if (ticket.status === 'In-Progress') statusColor = 'text-orange-600 bg-orange-50 border-orange-200';
            if (ticket.status === 'New') statusColor = 'text-blue-600 bg-blue-50 border-blue-200';

            // Clean ID & Description
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();
            const shortDesc = ticket.rawText.length > 50 ? ticket.rawText.substring(0, 50) + "..." : ticket.rawText;

            const row = document.createElement("tr");
            row.className = "hover:bg-slate-50 transition-colors";
            row.innerHTML = `
                <td class="px-6 py-4 font-bold text-slate-900">${formattedId}</td>
                <td class="px-6 py-4">
                    <p class="font-bold text-slate-700">${ticket.department}</p>
                    <p class="text-xs text-slate-500 mt-1 truncate max-w-xs" title="${ticket.rawText}">${shortDesc}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded border ${urgencyColor}">${ticket.urgency}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded border ${statusColor}">${ticket.status}</span>
                </td>
                <td class="px-6 py-4">
                    <a href="ticket-detail.html?id=${ticket._id}" class="text-blue-600 font-semibold hover:underline">Manage →</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    // 3. Fetch live data
    try {
        let response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
            response = await fetch('https://pcmc-admin.onrender.com/grievances', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        if (!response.ok) throw new Error("Failed to fetch live data");

        allGrievances = await response.json();
        
        // Initial render
        renderTable(allGrievances);

    } catch (error) {
        console.error(error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-bold">Failed to load live data. Check backend connection.</td></tr>`;
    }

    // 4. Filtering Logic
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        const filtered = allGrievances.filter(t => {
            const matchesSearch = t._id.toLowerCase().includes(searchTerm) || 
                                  t.department.toLowerCase().includes(searchTerm) ||
                                  t.rawText.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusValue === "All" || 
                                  (statusValue === "Pending" && (t.status === "New" || t.status === "In-Progress")) || 
                                  t.status === statusValue;
            
            return matchesSearch && matchesStatus;
        });

        renderTable(filtered);
    };

    // Listeners for live filtering
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);
    if (applyBtn) applyBtn.addEventListener("click", applyFilters);
});