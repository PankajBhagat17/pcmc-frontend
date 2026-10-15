document.addEventListener("DOMContentLoaded", () => {
    const trackForm = document.getElementById("trackForm");
    const searchInput = document.getElementById("searchInput");
    const trackSubmitBtn = document.getElementById("trackSubmitBtn");
    const searchError = document.getElementById("searchError");
    const resultContainer = document.getElementById("resultContainer");

    // Display elements
    const displayTicketId = document.getElementById("displayTicketId");
    const displayDept = document.getElementById("displayDept");
    const displayUrgency = document.getElementById("displayUrgency");
    const displayDescription = document.getElementById("displayDescription");
    const displayDate = document.getElementById("displayDate");
    const displayLocation = document.getElementById("displayLocation");

    // Timeline elements
    const stepInProgress = document.getElementById("stepInProgress");
    const stepResolved = document.getElementById("stepResolved");
    
    // Feedback elements
    const feedbackBox = document.getElementById("feedbackBox");
    const btnSatisfied = document.getElementById("btnSatisfied");
    const btnUnsatisfied = document.getElementById("btnUnsatisfied");
    const feedbackContent = document.getElementById("feedbackContent");

    let currentTicketId = null;

    // Helper: Reset Timeline styling
    const resetTimeline = () => {
        stepInProgress.classList.add("opacity-40");
        stepInProgress.querySelector("div").classList.replace("bg-blue-950", "bg-gray-300");
        
        stepResolved.classList.add("opacity-40");
        stepResolved.querySelector("div").classList.replace("bg-blue-950", "bg-gray-300");
        
        feedbackBox.classList.add("hidden");
    };

    trackForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const searchTerm = searchInput.value.trim().replace(/^PCMC-/i, ''); // Strip PCMC- if user typed it
        
        if (searchTerm.length < 5) {
            searchError.innerText = "Please enter a valid Ticket ID.";
            searchError.classList.remove("hidden");
            return;
        }

        searchError.classList.add("hidden");
        resultContainer.classList.add("hidden");
        trackSubmitBtn.innerText = "Searching...";
        trackSubmitBtn.disabled = true;

        try {
            // Fetch all grievances using the dynamic BASE_URL from api.js
            const response = await fetch(`${BASE_URL}/grievances`);

            if (!response.ok) throw new Error("Database connection failed.");

            const grievances = await response.json();
            
            // Find the ticket that includes the search term (case-insensitive)
            const ticket = grievances.find(g => g._id.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!ticket) {
                searchError.innerText = "No grievance found with that Ticket ID. Please check and try again.";
                searchError.classList.remove("hidden");
                trackSubmitBtn.innerText = "Track Status";
                trackSubmitBtn.disabled = false;
                return;
            }

            currentTicketId = ticket._id;

            // 1. Populate Ticket Details
            const formattedId = "PCMC-" + ticket._id.substring(0, 8).toUpperCase();
            displayTicketId.innerText = formattedId;
            displayDept.innerText = ticket.department || "Unassigned";
            displayDescription.innerText = ticket.rawText || "No description provided.";
            displayLocation.innerText = ticket.location || "Location not provided";
            
            const d = new Date(ticket.createdAt);
            displayDate.innerText = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            // Urgency Badge Styling
            displayUrgency.innerText = ticket.urgency + " Urgency";
            if (ticket.urgency === 'High' || ticket.urgency === 'Critical') {
                displayUrgency.className = "px-3 py-1 rounded-md text-sm font-medium border text-red-700 bg-red-50 border-red-200";
            } else {
                displayUrgency.className = "px-3 py-1 rounded-md text-sm font-medium border text-gray-700 bg-gray-50 border-gray-200";
            }

            // 2. Update Timeline based on Status
            resetTimeline();
            
            if (ticket.status === 'In-Progress' || ticket.status === 'Resolved') {
                stepInProgress.classList.remove("opacity-40");
                stepInProgress.querySelector("div").classList.replace("bg-gray-300", "bg-blue-950");
            }
            
            if (ticket.status === 'Resolved') {
                stepResolved.classList.remove("opacity-40");
                stepResolved.querySelector("div").classList.replace("bg-gray-300", "bg-blue-950");
                feedbackBox.classList.remove("hidden"); // Show accountability feedback loop
            }

            // Reveal results
            resultContainer.classList.remove("hidden");

        } catch (error) {
            console.error(error);
            searchError.innerText = "Error fetching status. Please ensure the backend server is running.";
            searchError.classList.remove("hidden");
        } finally {
            trackSubmitBtn.innerText = "Track Status";
            trackSubmitBtn.disabled = false;
        }
    });

    // 3. Handle Citizen Feedback (Resolved Tickets)
    btnSatisfied.addEventListener("click", () => {
        feedbackContent.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Thank you!</h3>
            <p class="text-sm text-blue-200">Your confirmation helps us maintain high standards for Pimpri-Chinchwad.</p>
        `;
    });

    btnUnsatisfied.addEventListener("click", async () => {
        if (!currentTicketId) return;
        
        btnUnsatisfied.innerText = "Escalating...";
        btnUnsatisfied.disabled = true;

        try {
            // Reopen ticket API call using BASE_URL and auth headers if available
            const updateUrl = `${BASE_URL}/grievances/${currentTicketId}/status`;
            const res = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('pcmc_token') || ''}`
                },
                body: JSON.stringify({ status: 'Reopened' })
            });

            if (!res.ok) throw new Error("Failed to escalate");

            feedbackContent.innerHTML = `
                <h3 class="text-lg font-bold text-red-400 mb-2">Ticket Reopened & Escalated</h3>
                <p class="text-sm text-blue-200">We apologize for the inconvenience. This issue has been pushed back to the Zonal Head for immediate review.</p>
            `;
            
            // Adjust timeline visually to reflect reopened state
            stepResolved.classList.add("opacity-40");
            stepResolved.querySelector("div").classList.replace("bg-blue-950", "bg-gray-300");

        } catch (error) {
            console.error(error);
            alert("Error escalating ticket. Please try again later.");
            btnUnsatisfied.innerText = "No, reopen & escalate ticket";
            btnUnsatisfied.disabled = false;
        }
    });
});