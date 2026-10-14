document.addEventListener("DOMContentLoaded", async () => {
    // 1. Authenticate Officer
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "login.html";
        return;
    }

    let allGrievances = [];

    // Helper: Convert array of objects to CSV string
    const convertToCSV = (data) => {
        const headers = ["Ticket ID", "Date Submitted", "Department", "Urgency", "Status", "Location", "Description"];
        const rows = data.map(ticket => {
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();
            const dateStr = new Date(ticket.createdAt).toLocaleDateString('en-IN');
            
            // Escape quotes to handle commas inside text fields safely
            const cleanLocation = (ticket.location || "Not Provided").replace(/"/g, '""');
            const cleanDesc = (ticket.rawText || "").replace(/"/g, '""');
            
            return [
                formattedId,
                dateStr,
                ticket.department || "Unassigned",
                ticket.urgency || "Normal",
                ticket.status || "New",
                `"${cleanLocation}"`,
                `"${cleanDesc}"`
            ].join(",");
        });
        
        return [headers.join(","), ...rows].join("\n");
    };

    try {
        // 2. Fetch Stats and Grievances
        let [statsRes, grievancesRes] = await Promise.all([
            fetch('https://pcmc-admin.onrender.com/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => fetch('https://pcmc-admin.onrender.com/stats')),
            fetch('https://pcmc-admin.onrender.com/api/grievances', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => fetch('https://pcmc-admin.onrender.com/grievances', { headers: { 'Authorization': `Bearer ${token}` } }))
        ]);

        if (!statsRes.ok || !grievancesRes.ok) throw new Error("Failed to load data");

        const stats = await statsRes.json();
        allGrievances = await grievancesRes.json();

        // 3. Render Live Departmental Load (Doughnut Chart)
        if (stats.deptCounts && document.getElementById('categoryChart')) {
            const sortedDepts = stats.deptCounts.sort((a, b) => b.count - a.count);
            const deptLabels = sortedDepts.map(d => d._id || 'Unassigned');
            const deptData = sortedDepts.map(d => d.count);

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
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
                }
            });
        }

        // 4. Render Submission Trend (Line Chart)
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

    // 5. Handle CSV Export
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            if (allGrievances.length === 0) {
                alert("No data available to export.");
                return;
            }

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