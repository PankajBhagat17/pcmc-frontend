document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch real data from your backend
        const statsResponse = await fetch(`${BASE_URL}/grievances/stats`);
        const stats = await statsResponse.json();

        // 1. Render Department Load Chart (Doughnut)
        const deptLabels = stats.deptCounts.map(d => d._id);
        const deptData = stats.deptCounts.map(d => d.count);

        const catCtx = document.getElementById('categoryChart').getContext('2d');
        new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: deptLabels,
                datasets: [{
                    data: deptData,
                    backgroundColor: [
                        '#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false } // Hidden for cleaner presentation look
                }
            }
        });

        // 2. Render Resolution Trend (Line Chart - Mocked for presentation impact)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Avg Resolution Time (Days)',
                    data: [14.5, 12.0, 10.2, 8.5], // Downward trend looks great for a pitch
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

    } catch (error) {
        console.error("Error loading charts:", error);
    }

    // 3. CSV Export Logic
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${BASE_URL}/grievances/all`);
                const grievances = await response.json();

                if (grievances.length === 0) {
                    alert("No data available to export.");
                    return;
                }

                // Create CSV Headers
                let csvContent = "Ticket ID,Date,Department,Urgency,Status,Location\n";

                // Loop through data and build CSV rows
                grievances.forEach(g => {
                    const date = new Date(g.createdAt).toLocaleDateString('en-IN');
                    // Escape commas in location string
                    const location = `"${g.location || 'Unknown'}"`; 
                    csvContent += `${g._id},${date},${g.department},${g.urgency},${g.status},${location}\n`;
                });

                // Trigger file download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "PCMC_Grievance_Report.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (error) {
                console.error("Export failed:", error);
                alert("Failed to export data.");
            }
        });
    }
});