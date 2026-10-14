document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch real data from MongoDB
        const stats = await getPublicStats();
        
        // 1. Update the Total Counter in the UI
        document.getElementById('totalProcessedStat').innerText = stats.total;

        // 2. Format Data for Department Bar Chart
        const deptLabels = stats.deptCounts.map(d => d._id);
        const deptData = stats.deptCounts.map(d => d.count);

        const deptCtx = document.getElementById('deptChart').getContext('2d');
        new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: deptLabels,
                datasets: [{
                    label: 'Active Grievances',
                    data: deptData,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        });

        // 3. Format Data for Status Doughnut Chart
        // Map the MongoDB statuses to specific colors and arrays
        let resolved = 0, inProgress = 0, pending = 0;
        
        stats.statusCounts.forEach(statusObj => {
            if (statusObj._id === 'Resolved') resolved = statusObj.count;
            else if (statusObj._id === 'In-Progress') inProgress = statusObj.count;
            else pending += statusObj.count; // Groups 'New', 'Pending', 'Reopened'
        });

        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Resolved', 'In Progress', 'Pending/New'],
                datasets: [{
                    data: [resolved, inProgress, pending],
                    backgroundColor: ['#10b981', '#f59e0b', '#94a3b8'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, boxWidth: 8 } }
                }
            }
        });

    } catch (error) {
        console.error("Failed to render charts:", error);
    }
});