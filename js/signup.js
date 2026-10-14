document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const submitBtn = document.getElementById("signupSubmitBtn");
        const errorBox = document.getElementById("signupError");
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;

        // Check passwords match
        if (password !== confirmPassword) {
            errorBox.innerText = "Passwords do not match!";
            errorBox.classList.remove("hidden");
            return;
        }

        // Show loading state
        submitBtn.innerHTML = `Creating Account...`;
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-75", "cursor-not-allowed");
        errorBox.classList.add("hidden");

        const mobileNumber = document.getElementById("signupMobile").value;

        // Prepare data to send to backend
        const payload = {
            fullName: document.getElementById("signupName").value,
            email: document.getElementById("signupEmail").value,
            mobile: mobileNumber,
            address: {
                flat: document.getElementById("signupFlat").value,
                street: document.getElementById("signupStreet").value,
                landmark: document.getElementById("signupLandmark").value,
                pincode: document.getElementById("signupPincode").value,
                ward: document.getElementById("signupWard").value
            },
            password: password
        };

        try {
            // Send data to backend (using the function from api.js)
            const response = await registerUser(payload);
            
            // Save token to browser storage
            localStorage.setItem('pcmc_token', response.token);
            
            alert("✅ Account created successfully!\n\nYour address details have been saved to your profile for faster grievance filing.");
            window.location.href = "login.html"; 

        } catch (error) {
            // Show error message if something fails
            errorBox.innerText = error.message;
            errorBox.classList.remove("hidden");
            
            // Reset button
            submitBtn.innerHTML = `Sign Up`;
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
        }
    });
});