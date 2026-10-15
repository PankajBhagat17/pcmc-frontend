try {
        let response = await fetch('https://pcmc-admin.onrender.com/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert("Your session has expired. Redirecting to login.");
                localStorage.removeItem("pcmc_token");
                window.location.href = "login.html";
                return;
            }
            throw new Error("Failed to fetch grievances");
        }
        
        allGrievances = await response.json();
        
        // Populate the top cards with live numbers (Master stats)
        updateStats(allGrievances);
        
        // CHECK URL FOR DEPARTMENT FILTER
        const urlParams = new URLSearchParams(window.location.search);
        const deptFilter = urlParams.get('dept');
        
        let displayData = allGrievances;
        if (deptFilter) {
            displayData = allGrievances.filter(t => {
                const deptName = (t.department || "").toLowerCase();
                return deptName.includes(deptFilter.toLowerCase());
            });
            // Optional: put the filter text into the search bar so officers know it's filtered
            if (searchInput) searchInput.value = deptFilter;
        }

        // Populate the table with filtered or all data
        renderTable(displayData);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Failed to load live data. Ensure backend is running.</td></tr>`;
    }