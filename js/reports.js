document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in.");
        return window.location.href = "login.html";
    }

    let allGrievances = [];

    const convertToCSV = (data) => {
        const headers = ["Ticket ID", "Date Submitted", "Department", "Urgency", "Status", "Location", "Description"];
        const rows = data.map(ticket => {
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();
            const dateStr = new Date(ticket.createdAt).toLocaleDateString('en-IN');
            const cleanLocation = (ticket.location || "Not Provided").replace(/"/g, '""');
            const cleanDesc = (ticket.rawText || "").replace(/"/g, '""');
            
            return [
                formattedId, dateStr, ticket.department || "Unassigned", ticket.urgency || "Normal",
                ticket.status || "New", `"${cleanLocation}"`, `"${cleanDesc}"`
            ].join(",");
        });
        return [headers.join(","), ...rows].join("\n");
    };

    try {
        // Fetch ONLY from the reliable master list, bypassing the broken stats route
        const response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load data");
        allGrievances = await response.json();

        // 1. Calculate Departmental Load Manually for the Doughnut Chart
        const deptCountsMap = {};
        allGrievances.forEach(ticket => {
            const dept = ticket.department || 'Unassigned';
            deptCountsMap[dept] = (deptCountsMap[dept] || 0) + 1;
        });

        const deptLabels = Object.keys(deptCountsMap);
        const deptData = Object.values(deptCountsMap);

        if (document.getElementById('categoryChart') && deptLabels.length > 0) {
            const categoryCtx = document.getElementById('categoryChart').getContext('2d');
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: deptLabels,
                    datasets: [{
                        data: deptData,
                        backgroundColor: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#f87171', '#fbbf24', '#34d399', '#94a3b8'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 2. Render Submission Trend (Line Chart)
        if (document.getElementById('trendChart') && allGrievances.length > 0) {
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            }).reverse();

            const trendCounts = new Array(7).fill(0);
            
            allGrievances.forEach(ticket => {
                const ticketDate = new Date(ticket.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                const index = last7Days.indexOf(ticketDate);
                if (index !== -1) {
                    trendCounts[index]++;
                }
            });

            const trendCtx = document.getElementById('trendChart').getContext('2d');
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Grievances Submitted',
                        data: trendCounts,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, suggestedMax: 10 } }
                }
            });
        }

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }

    // CSV Export Logic
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            if (allGrievances.length === 0) return alert("No data available to export.");
            const csvString = convertToCSV(allGrievances);
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `PCMC_Official_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});