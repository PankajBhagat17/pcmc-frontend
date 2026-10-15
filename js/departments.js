document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Authenticate Officer
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "login.html";
        return;
    }

    // 2. Helper function for styling the load badges
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
        // FIXED: Removed /all to match your live backend router
        const response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch data from server.");

        const allGrievances = await response.json();
        
        // 4. Initialize counts
        const counts = {
            water: 0, road: 0, electric: 0, waste: 0, 
            health: 0, encroachment: 0, parks: 0, tax: 0, admin: 0
        };

        // 5. Calculate stats client-side from the master list
        allGrievances.forEach(ticket => {
            const deptName = (ticket.department || "").toLowerCase();
            
            if (deptName.includes("water") || deptName.includes("drainage")) counts.water++;
            else if (deptName.includes("road") || deptName.includes("pwd") || deptName.includes("public works")) counts.road++;
            else if (deptName.includes("electric") || deptName.includes("light") || deptName.includes("power")) counts.electric++;
            else if (deptName.includes("waste") || deptName.includes("solid")) counts.waste++;
            else if (deptName.includes("health") || deptName.includes("animal") || deptName.includes("dog")) counts.health++;
            else if (deptName.includes("encroach") || deptName.includes("illegal")) counts.encroachment++;
            else if (deptName.includes("park") || deptName.includes("garden") || deptName.includes("tree")) counts.parks++;
            else if (deptName.includes("tax") || deptName.includes("property")) counts.tax++;
            else counts.admin++;
        });

        // 6. Array mapping UI IDs to the count variables
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

        // 7. Loop through and update UI
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