document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Authenticate Officer
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "login.html";
        return;
    }

    // 2. Helper function for styling the load badges matching department.html IDs
    const updateLoadBadge = (badgeElement, count) => {
        if (!badgeElement) return;
        if (count >= 10) {
            badgeElement.className = "px-2 py-1 text-xs font-bold bg-red-50 text-red-700 rounded border border-red-200";
            badgeElement.innerText = "High Load";
        } else if (count >= 5) {
            badgeElement.className = "px-2 py-1 text-xs font-bold bg-yellow-50 text-yellow-700 rounded border border-yellow-200";
            badgeElement.innerText = "Medium Load";
        } else {
            badgeElement.className = "px-2 py-1 text-xs font-bold bg-green-50 text-green-700 rounded border border-green-200";
            badgeElement.innerText = "Optimal";
        }
    };

    try {
        const response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch data from server.");

        const allGrievances = await response.json();
        
        // 3. Initialize counts matching your department categories
        const counts = {
            Water: 0, Roads: 0, Electrical: 0, Waste: 0, 
            Health: 0, Encroachment: 0, Parks: 0, Tax: 0, Admin: 0
        };

        // 4. Calculate stats client-side from the master list
        allGrievances.forEach(ticket => {
            const deptName = (ticket.department || "").toLowerCase();
            
            if (deptName.includes("water") || deptName.includes("drainage")) counts.Water++;
            else if (deptName.includes("road") || deptName.includes("pwd") || deptName.includes("public works")) counts.Roads++;
            else if (deptName.includes("electric") || deptName.includes("light") || deptName.includes("power")) counts.Electrical++;
            else if (deptName.includes("waste") || deptName.includes("solid")) counts.Waste++;
            else if (deptName.includes("health") || deptName.includes("animal") || deptName.includes("dog")) counts.Health++;
            else if (deptName.includes("encroach") || deptName.includes("illegal")) counts.Encroachment++;
            else if (deptName.includes("park") || deptName.includes("garden") || deptName.includes("tree")) counts.Parks++;
            else if (deptName.includes("tax") || deptName.includes("property")) counts.Tax++;
            else counts.Admin++;
        });

        // 5. Array mapping department.html ID keys to counts
        const deptMap = [
            { key: "Water", count: counts.Water },
            { key: "Roads", count: counts.Roads },
            { key: "Electrical", count: counts.Electrical },
            { key: "Waste", count: counts.Waste },
            { key: "Health", count: counts.Health },
            { key: "Encroachment", count: counts.Encroachment },
            { key: "Parks", count: counts.Parks },
            { key: "Tax", count: counts.Tax },
            { key: "Admin", count: counts.Admin }
        ];

        // 6. Loop through and update UI using your exact HTML element IDs (`count-X` and `badge-X`)
        deptMap.forEach(d => {
            const countEl = document.getElementById(`count-${d.key}`);
            const badgeEl = document.getElementById(`badge-${d.key}`);
            
            if (countEl) countEl.innerText = d.count;
            if (badgeEl) updateLoadBadge(badgeEl, d.count);
        });

    } catch (error) {
        console.error("Failed to load department stats:", error);
        
        // Visual error state if backend is down
        const badges = document.querySelectorAll('[id^="badge-"]');
        badges.forEach(badge => {
            badge.innerText = "Error";
            badge.className = "px-2 py-1 text-xs font-bold bg-red-50 text-red-600 rounded border border-red-200";
        });
    }
});