document.addEventListener("DOMContentLoaded", () => {
    const trackForm = document.getElementById("trackForm");
    let currentTicketId = null;

    trackForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const input = document.getElementById("searchInput").value.trim();
        const errorBox = document.getElementById("searchError");
        const btn = document.getElementById("trackSubmitBtn");
        
        if (input === '') return;

        // Reset UI
        errorBox.classList.add("hidden");
        document.getElementById("resultContainer").classList.add("hidden");
        document.getElementById("feedbackBox").classList.add("hidden");
        
        btn.innerText = "Searching...";
        btn.disabled = true;

        try {
            const ticket = await trackGrievance(input);
            currentTicketId = ticket._id;
            renderTicketDetails(ticket);
        } catch (error) {
            errorBox.innerText = error.message;
            errorBox.classList.remove("hidden");
        } finally {
            btn.innerText = "Track Status";
            btn.disabled = false;
        }
    });

    function renderTicketDetails(ticket) {
        // Unhide container
        document.getElementById("resultContainer").classList.remove("hidden");

        // Populate Text Fields
        document.getElementById("displayTicketId").innerText = ticket._id.substring(ticket._id.length - 8).toUpperCase();
        document.getElementById("displayDept").innerText = ticket.department;
        document.getElementById("displayDescription").innerText = `"${ticket.rawText}"`;
        document.getElementById("displayDate").innerText = new Date(ticket.createdAt).toLocaleString();
        document.getElementById("displayLocation").innerText = ticket.location;

        // Populate Urgency Badge
        const urgencyBadge = document.getElementById("displayUrgency");
        urgencyBadge.innerText = `${ticket.urgency} Priority`;
        if (ticket.urgency === 'High' || ticket.urgency === 'Critical') {
            urgencyBadge.className = "px-3 py-1 rounded-md text-sm font-medium border bg-red-50 text-red-700 border-red-100";
        } else if (ticket.urgency === 'Medium') {
            urgencyBadge.className = "px-3 py-1 rounded-md text-sm font-medium border bg-yellow-50 text-yellow-700 border-yellow-100";
        } else {
            urgencyBadge.className = "px-3 py-1 rounded-md text-sm font-medium border bg-green-50 text-green-700 border-green-100";
        }

        // Timeline Logic
        const stepInProgress = document.getElementById("stepInProgress");
        const dotInProgress = stepInProgress.querySelector("div");
        const stepResolved = document.getElementById("stepResolved");
        const dotResolved = stepResolved.querySelector("div");

        // Reset Timeline
        stepInProgress.className = "relative opacity-40 transition-opacity";
        dotInProgress.className = "absolute -left-[31px] bg-gray-300 h-4 w-4 rounded-full border-4 border-white shadow-sm";
        stepResolved.className = "relative opacity-40 transition-opacity";
        dotResolved.className = "absolute -left-[31px] bg-gray-300 h-4 w-4 rounded-full border-4 border-white";

        if (ticket.status === 'In-Progress' || ticket.status === 'Resolved' || ticket.status === 'Reopened') {
            stepInProgress.classList.remove("opacity-40");
            dotInProgress.className = "absolute -left-[31px] bg-yellow-500 h-4 w-4 rounded-full border-4 border-white shadow-sm animate-pulse";
        }
        
        if (ticket.status === 'Resolved') {
            dotInProgress.className = "absolute -left-[31px] bg-blue-950 h-4 w-4 rounded-full border-4 border-white shadow-sm";
            stepResolved.classList.remove("opacity-40");
            dotResolved.className = "absolute -left-[31px] bg-green-500 h-4 w-4 rounded-full border-4 border-white";
            
            // Accountability Loop Trigger
            if (ticket.feedbackVerification === 'Pending') {
                document.getElementById("feedbackBox").classList.remove("hidden");
                document.getElementById("feedbackBox").classList.add("fade-in");
            }
        }
    }

    // Feedback Event Listeners
    document.getElementById("btnSatisfied").addEventListener("click", () => handleFeedback(true));
    document.getElementById("btnUnsatisfied").addEventListener("click", () => handleFeedback(false));

    async function handleFeedback(isSatisfied) {
        const feedbackContent = document.getElementById("feedbackContent");
        
        try {
            await submitGrievanceFeedback(currentTicketId, isSatisfied);
            
            if (isSatisfied) {
                feedbackContent.innerHTML = `
                    <div class="text-center py-4 fade-in">
                        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 class="font-bold text-white mb-1">Thank You!</h3>
                        <p class="text-sm text-blue-200">Ticket officially closed.</p>
                    </div>
                `;
            } else {
                feedbackContent.innerHTML = `
                    <div class="text-center py-4 fade-in">
                        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 class="font-bold text-white mb-1">Ticket Reopened</h3>
                        <p class="text-sm text-blue-200">This has been escalated to higher administration.</p>
                    </div>
                `;
                
                // Visually update timeline to show reopened status
                document.querySelector('#stepResolved div').className = "absolute -left-[31px] bg-red-500 h-4 w-4 rounded-full border-4 border-white";
                document.querySelector('#stepResolved h4').innerText = "Reopened";
                document.querySelector('#stepInProgress div').className = "absolute -left-[31px] bg-yellow-500 h-4 w-4 rounded-full border-4 border-white shadow-sm animate-pulse";
            }
        } catch (error) {
            alert("Error submitting feedback: " + error.message);
        }
    }
});