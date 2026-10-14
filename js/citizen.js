document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("complaintInput");
    const aiBox = document.getElementById("aiBox");
    const grievanceForm = document.getElementById("grievanceForm");

    // Only run this if we are on the page with the grievance form
    if (textarea && aiBox && grievanceForm) {
        
        // 1. Simulate AI analyzing context as the user types
        textarea.addEventListener("input", function () {
            if (this.value.length > 20) {
                if (aiBox.classList.contains("hidden")) {
                    aiBox.classList.remove("hidden");
                    aiBox.classList.add("flex", "fade-in");
                }
            } else {
                aiBox.classList.add("hidden");
                aiBox.classList.remove("flex", "fade-in");
            }
        });

        // 2. Handle the REAL submission flow to the backend!
        grievanceForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const textValue = textarea.value.trim();

            if (textValue.length === 0) {
                alert("Please describe your grievance first.");
                return;
            }

            // Check if the user has a token from logging in
            const token = localStorage.getItem("pcmc_token");
            if (!token) {
                alert("You must be logged in to submit a grievance. Redirecting to login...");
                window.location.href = "login.html";
                return;
            }

            // Decode the JWT token to get the user's ID for the backend
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

            // Set loading state
            btn.disabled = true;
            btn.classList.add("opacity-75", "cursor-not-allowed");
            btnText.innerText = "Submitting to PCMC...";
            btnLoader.classList.remove("hidden");

            try {
                // Call the function from api.js WITH the new GPS coordinates
                const response = await submitGrievance({
                    rawText: textValue,
                    userId: currentUserId,
                    latitude: window.currentLat || null,
                    longitude: window.currentLng || null
                });

                // Show success message
                alert("Grievance Submitted Successfully! Ticket ID: " + response.grievance._id);

                // Reset the form
                grievanceForm.reset();
                aiBox.classList.add("hidden");
                aiBox.classList.remove("flex", "fade-in");
                
                // Reset the location UI and global variables
                const locationStatus = document.getElementById('locationStatus');
                if(locationStatus) locationStatus.innerText = "";
                window.currentLat = null;
                window.currentLng = null;

            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                // Restore button state
                btn.disabled = false;
                btn.classList.remove("opacity-75", "cursor-not-allowed");
                btnText.innerText = "Submit Grievance";
                btnLoader.classList.add("hidden");
            }
        });
    }
});