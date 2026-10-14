document.addEventListener("DOMContentLoaded", async () => {
    const updateLoadBadge = (badgeElement, count) => {
        if (!badgeElement) return;
        if (count >= 10) {
            badgeElement.className = "bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-100";
            badgeElement.innerText = "High Load";
        } else if (count >= 5) {
            badgeElement.className = "bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-100";
            badgeElement.innerText = "Medium Load";
        } else {
            badgeElement.className = "bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100";
            badgeElement.innerText = "Optimal";
        }
    };

    try {
        const stats = await getPublicStats();
        
        // Initialize counts
        const counts = {
            water: 0, road: 0, electric: 0, waste: 0, 
            health: 0, encroachment: 0, parks: 0, tax: 0, admin: 0
        };

        // Map MongoDB stats to our variables
        stats.deptCounts.forEach(dept => {
            if (dept._id === "Water Supply & Drainage") counts.water = dept.count;
            if (dept._id === "Public Works (PWD)") counts.road = dept.count;
            if (dept._id === "Electrical Department") counts.electric = dept.count;
            if (dept._id === "Solid Waste Management") counts.waste = dept.count;
            if (dept._id === "Public Health") counts.health = dept.count;
            if (dept._id === "Encroachment") counts.encroachment = dept.count;
            if (dept._id === "Parks & Gardens") counts.parks = dept.count;
            if (dept._id === "Property Tax") counts.tax = dept.count;
            if (dept._id === "General Administration") counts.admin = dept.count;
        });

        // Array mapping UI IDs to the count variables
        const deptMap = [
            { id: "water", count: counts.water },
            { id: "road", count: counts.road },
            { id: "electric", count: counts.electric },
            { id: "waste", count: counts.waste },
            { id: "health", count: counts.health },
            { id: "encroachment", count: counts.encroachment },
            { id: "parks", count: counts.parks },
            { id: "tax", count: counts.tax },
            { id: "admin", count: counts.admin }
        ];

        // Loop through and update UI
        deptMap.forEach(d => {
            const ticketEl = document.getElementById(`${d.id}Tickets`);
            const badgeEl = document.getElementById(`${d.id}Badge`);
            if (ticketEl) ticketEl.innerText = d.count;
            if (badgeEl) updateLoadBadge(badgeEl, d.count);
        });

    } catch (error) {
        console.error("Failed to load department stats:", error);
    }
});