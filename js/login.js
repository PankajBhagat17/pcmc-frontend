document.addEventListener("DOMContentLoaded", () => {
    const tabCitizen = document.getElementById("tabCitizen");
    const tabOfficer = document.getElementById("tabOfficer");
    const citizenFormContainer = document.getElementById("citizenFormContainer");
    const officerFormContainer = document.getElementById("officerFormContainer");
    const citizenForm = document.getElementById("citizenForm");
    const officerForm = document.getElementById("officerForm");
    const citizenError = document.getElementById("citizenError");
    const citizenSubmitBtn = document.getElementById("citizenSubmitBtn");

    // Tab Switching Logic
    tabCitizen.addEventListener("click", () => {
        tabCitizen.className = "flex-1 pb-3 text-sm font-bold text-blue-900 border-b-2 border-blue-900 transition-colors";
        tabOfficer.className = "flex-1 pb-3 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-blue-900 transition-colors";
        citizenFormContainer.classList.remove("hidden");
        citizenFormContainer.classList.add("block");
        officerFormContainer.classList.remove("block");
        officerFormContainer.classList.add("hidden");
    });

    tabOfficer.addEventListener("click", () => {
        tabOfficer.className = "flex-1 pb-3 text-sm font-bold text-blue-900 border-b-2 border-blue-900 transition-colors";
        tabCitizen.className = "flex-1 pb-3 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-blue-900 transition-colors";
        officerFormContainer.classList.remove("hidden");
        officerFormContainer.classList.add("block");
        citizenFormContainer.classList.remove("block");
        citizenFormContainer.classList.add("hidden");
    });

    // Citizen Login API Logic
    citizenForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const mobile = document.getElementById("citizenMobile").value;
        const password = document.getElementById("citizenPassword").value;

        // Show loading state
        citizenError.classList.add("hidden");
        citizenSubmitBtn.innerHTML = "Authenticating...";
        citizenSubmitBtn.disabled = true;
        citizenSubmitBtn.classList.add("opacity-75");

        try {
            // Send data to backend using api.js function
            const response = await loginUser({ mobile, password });
            
            // Save token
            localStorage.setItem('pcmc_token', response.token);
            
            // Redirect to home page
            window.location.href = "index.html";
        } catch (error) {
            citizenError.textContent = error.message;
            citizenError.classList.remove("hidden");
            
            citizenSubmitBtn.innerHTML = "<span>Login</span> <span>→</span>";
            citizenSubmitBtn.disabled = false;
            citizenSubmitBtn.classList.remove("opacity-75");
        }
    });

    // Officer Form 
    officerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        window.location.href = "admin.html"; 
    });
});