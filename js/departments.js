document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Helper function for styling the load badges
    const updateLoadBadge = (badgeElement, count) => {
        if (!badgeElement) return;
        if (count >= 10) {
            badgeElement.className = "bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200";
            badgeElement.innerText = "High Load";
        } else if (count >= 5) {
            badgeElement.className = "bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200";
            badgeElement.innerText = "Medium Load";
        } else {
            badgeElement.className = "bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200";
            badgeElement.innerText = "Optimal";
        }
    };

    try {
        // 2. Fetch the live stats directly from your backend
        let response = await fetch('https://pcmc-admin.onrender.com/api/stats');
        
        // Fallback route just in case
        if (response.status === 404) {
            response = await fetch('https://pcmc-admin.onrender.com/stats');
        }

        if (!response.ok) throw new Error("Failed to fetch stats from server.");

        const stats = await response.json();
        
        // 3. Initialize counts
        const counts = {
            water: 0, road: 0, electric: 0, waste: 0, 
            health: 0, encroachment: 0, parks: 0, tax: 0, admin: 0
        };

        // 4. Map MongoDB stats to our variables (Using .includes() makes it safer if names vary slightly)
        if (stats && stats.deptCounts) {
            stats.deptCounts.forEach(dept => {
                const deptName = (dept._id || "").toLowerCase();
                
                if (deptName.includes("water") || deptName.includes("drainage")) counts.water += dept.count;
                else if (deptName.includes("road") || deptName.includes("pwd") || deptName.includes("public works")) counts.road += dept.count;
                else if (deptName.includes("electric")) counts.electric += dept.count;
                else if (deptName.includes("waste") || deptName.includes("solid")) counts.waste += dept.count;
                else if (deptName.includes("health")) counts.health += dept.count;
                else if (deptName.includes("encroach")) counts.encroachment += dept.count;
                else if (deptName.includes("park") || deptName.includes("garden")) counts.parks += dept.count;
                else if (deptName.includes("tax") || deptName.includes("property")) counts.tax += dept.count;
                else counts.admin += dept.count;
            });
        }

        // 5. Array mapping UI IDs to the count variables
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

        // 6. Loop through and update UI
        deptMap.forEach(d => {
            const ticketEl = document.getElementById(`${d.id}Tickets`);
            const badgeEl = document.getElementById(`${d.id}Badge`);
            
            if (ticketEl) ticketEl.innerText = d.count;
            if (badgeEl) updateLoadBadge(badgeEl, d.count);
        });

    } catch (error) {
        console.error("Failed to load department stats:", error);
        
        // Visual error state if backend is down
        const badges = document.querySelectorAll('[id$="Badge"]');
        badges.forEach(badge => {
            badge.innerText = "Error";
            badge.className = "bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-200";
        });
    }
});