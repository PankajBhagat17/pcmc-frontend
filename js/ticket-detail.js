document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verify Authentication
    const token = localStorage.getItem("pcmc_token");
    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    // 2. Extract Ticket ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');
    if (!ticketId) {
        alert("No ticket ID provided.");
        window.location.href = "admin.html";
        return;
    }

    // DOM Elements
    const ticketTitle = document.getElementById('ticketTitle');
    const ticketIdDisplay = document.getElementById('ticketIdDisplay');
    const statusBadge = document.getElementById('ticketStatusBadge');
    const urgencyBadge = document.getElementById('ticketUrgency');
    const citizenName = document.getElementById('ticketCitizenName');
    const citizenMobile = document.getElementById('ticketCitizenMobile');
    const ticketDate = document.getElementById('ticketDate');
    const departmentDisplay = document.getElementById('ticketDepartment');
    const locationDisplay = document.getElementById('ticketLocation');
    const descriptionDisplay = document.getElementById('ticketDescription');
    const statusSelect = document.getElementById('statusUpdateSelect');

    try {
        // 3. Fetch specific ticket data from backend
        let response = await fetch(`https://pcmc-admin.onrender.com/api/grievances/${ticketId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 404) {
            response = await fetch(`https://pcmc-admin.onrender.com/grievances/${ticketId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        if (!response.ok) throw new Error("Failed to fetch ticket details.");

        const ticket = await response.json();

        // 4. Populate HTML with data
        const formattedId = ticket._id.substring(0, 8).toUpperCase();
        ticketIdDisplay.innerText = `PCMC-${formattedId}`;
        ticketTitle.innerText = `${ticket.department} Grievance`;
        
        const d = new Date(ticket.createdAt);
        ticketDate.innerText = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        departmentDisplay.innerText = ticket.department;
        locationDisplay.innerText = ticket.location || "Location not provided";
        descriptionDisplay.innerText = ticket.rawText;

        // Citizen Details
        if (ticket.citizenId && ticket.citizenId.name) {
            citizenName.innerText = ticket.citizenId.name;
            citizenMobile.innerText = ticket.citizenId.mobile || "--";
        } else {
            citizenName.innerText = "Citizen User";
            citizenMobile.innerText = "--";
        }

        // Status Badge Styling
        statusBadge.innerText = ticket.status;
        if (ticket.status === 'Resolved') {
            statusBadge.className = "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200";
        } else if (ticket.status === 'In-Progress') {
            statusBadge.className = "bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold border border-orange-200";
        } else {
            statusBadge.className = "bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-bold border border-slate-200";
        }

        // Urgency Badge Styling
        urgencyBadge.innerText = ticket.urgency;
        if (ticket.urgency === 'High' || ticket.urgency === 'Critical') {
            urgencyBadge.className = "bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold border border-red-200";
        } else {
            urgencyBadge.className = "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200";
        }

        if (statusSelect) statusSelect.value = ticket.status;

    } catch (error) {
        console.error("Error loading ticket:", error);
        if (ticketTitle) ticketTitle.innerText = "Error Loading Ticket";
        if (descriptionDisplay) descriptionDisplay.innerText = "Could not fetch details. Please check connection.";
    }

    // 5. Handle Status Update from Dropdown
    if (statusSelect) {
        statusSelect.addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            if (!confirm(`Are you sure you want to mark this ticket as ${newStatus}?`)) return;

            try {
                let updateUrl = `https://pcmc-admin.onrender.com/api/grievances/${ticketId}/status`;
                let res = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status: newStatus })
                });

                if (res.status === 404) {
                    updateUrl = `https://pcmc-admin.onrender.com/grievances/${ticketId}/status`;
                    res = await fetch(updateUrl, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ status: newStatus })
                    });
                }

                if (!res.ok) throw new Error("Status update failed");

                alert(`Ticket successfully updated to ${newStatus}`);
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Error updating ticket status. Ensure backend is running.");
            }
        });
    }
});