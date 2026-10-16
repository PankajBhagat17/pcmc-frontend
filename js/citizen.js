document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("complaintInput");
    const locationInput = document.getElementById("locationInput");
    const grievanceForm = document.getElementById("grievanceForm");

    if (textarea && grievanceForm) {
        
        grievanceForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const textValue = textarea.value.trim();
            const locationValue = locationInput ? locationInput.value.trim() : "";

            if (textValue.length === 0) {
                alert("Please describe your grievance first.");
                return;
            }

            if (locationValue.length === 0) {
                alert("Please enter a location or landmark.");
                return;
            }

            const token = localStorage.getItem("pcmc_token");
            if (!token) {
                alert("You must be logged in to submit a grievance. Redirecting to login...");
                window.location.href = "login.html";
                return;
            }

            let currentUserId = null;
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                currentUserId = tokenPayload.id || tokenPayload.userId;
            } catch (error) {
                console.error("Could not decode user token.");
            }

            const btn = document.getElementById("submitBtn");
            const btnText = document.getElementById("btnText");
            const btnLoader = document.getElementById("btnLoader");

            btn.disabled = true;
            btn.classList.add("opacity-75", "cursor-not-allowed");
            btnText.innerText = "Submitting to PCMC...";
            btnLoader.classList.remove("hidden");

            try {
                // Ensure submitGrievance returns the parsed JSON from the backend
                const response = await submitGrievance({
                    rawText: textValue,
                    userId: currentUserId,
                    location: locationValue
                });

                // FIXED: Look for response.ticket since backend returns res.json({ ticket: newGrievance })
                const ticketData = response.ticket || response.grievance || response;
                
                const cleanId = ticketData._id ? ticketData._id.substring(0, 8).toUpperCase() : "SUCCESS";                
                
                // Formatted multi-line alert for the citizen
                alert(`Grievance Submitted Successfully!\n\nYour Tracking Ticket ID is: PCMC-${cleanId}\n\nPlease save this ID to track your status.`);

                grievanceForm.reset();

            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                btn.disabled = false;
                btn.classList.remove("opacity-75", "cursor-not-allowed");
                btnText.innerText = "Submit Grievance";
                btnLoader.classList.add("hidden");
            }
        });
    }
});