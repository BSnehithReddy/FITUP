/* ==========================================================================
   FITUP - Authentication Module (Live Fast2SMS OTP Integration)
   ========================================================================== */

const API_SEND_OTP = "https://us-central1-fitup-ccb95.cloudfunctions.net/apiSendCustomOtp";
const API_VERIFY_OTP = "https://us-central1-fitup-ccb95.cloudfunctions.net/apiVerifyCustomOtp";

const auth = {
    currentAuthMode: "login",
    otpSent: false,

    openAuthModal(mode = "login") {
        this.otpSent = false;
        this.switchAuthMode(mode);
        document.getElementById('authModal').classList.add('active');
    },

    closeAuthModal() {
        this.otpSent = false;
        document.getElementById('authModal').classList.remove('active');
        document.getElementById('authErrorMessage').style.display = 'none';
        document.getElementById('authForm').reset();
        this.resetOtpUi();
    },

    switchAuthMode(mode) {
        this.currentAuthMode = mode;
        this.otpSent = false;
        const nameGroup = document.getElementById('nameGroup');
        const loginTabBtn = document.getElementById('loginTabBtn');
        const registerTabBtn = document.getElementById('registerTabBtn');
        const submitBtn = document.getElementById('authSubmitBtn');

        if (mode === 'register') {
            nameGroup.style.display = 'block';
            loginTabBtn.classList.remove('active');
            registerTabBtn.classList.add('active');
            submitBtn.textContent = 'Send Registration OTP';
        } else {
            nameGroup.style.display = 'none';
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            submitBtn.textContent = 'Send Sign-In OTP';
        }

        this.resetOtpUi();
        document.getElementById('authErrorMessage').style.display = 'none';
    },

    resetOtpUi() {
        const passwordInput = document.getElementById('authPassword');
        const passwordLabel = passwordInput?.previousElementSibling;
        const submitBtn = document.getElementById('authSubmitBtn');

        if (passwordInput) {
            passwordInput.placeholder = "Enter 6-digit OTP or Owner Password";
            passwordInput.value = "";
        }
        if (passwordLabel) passwordLabel.textContent = "OTP Code / Password";
        if (submitBtn && !this.otpSent) {
            submitBtn.textContent = this.currentAuthMode === 'register' ? 'Send Registration OTP' : 'Send Sign-In OTP';
        }
    },

    async handleAuthSubmit(e) {
        e.preventDefault();
        const phone = document.getElementById('authPhone').value.trim();
        const otpOrPassword = document.getElementById('authPassword').value.trim();
        const name = document.getElementById('authName').value.trim();
        const errorEl = document.getElementById('authErrorMessage');
        const submitBtn = document.getElementById('authSubmitBtn');

        errorEl.style.display = 'none';

        if (!phone) {
            errorEl.textContent = 'Please enter a valid phone number.';
            errorEl.style.display = 'block';
            return;
        }

        // 1. OWNER BYPASS (Immediate login without requiring SMS credits)
        if (phone === "9030118909" && (otpOrPassword === "Snehith@020777" || name.toUpperCase() === "SNEHITH")) {
            store.setCurrentUser({ name: "SNEHITH", phone: "9030118909", role: "owner" });
            this.updateNavState();
            this.closeAuthModal();
            app.showToast("Logged in as Gym Owner (SNEHITH) ✅");
            app.showSection('owner');
            return;
        }

        if (this.currentAuthMode === 'register' && !name) {
            errorEl.textContent = 'Please enter your full name.';
            errorEl.style.display = 'block';
            return;
        }

        // 2. STEP 1: REQUEST SMS OTP
        if (!this.otpSent) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending OTP...";

            try {
                const response = await fetch(API_SEND_OTP, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to send SMS OTP");
                }

                this.otpSent = true;
                submitBtn.disabled = false;
                submitBtn.textContent = "Verify OTP & Continue";

                const passwordInput = document.getElementById('authPassword');
                if (passwordInput) {
                    passwordInput.value = "";
                    passwordInput.placeholder = "Enter 6-digit OTP";
                    passwordInput.focus();
                }

                app.showToast("6-digit OTP sent to your phone! 📲");
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.textContent = this.currentAuthMode === 'register' ? 'Send Registration OTP' : 'Send Sign-In OTP';
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
            return;
        }

        // 3. STEP 2: VERIFY ENTERED OTP CODE
        if (!otpOrPassword) {
            errorEl.textContent = 'Please enter the 6-digit OTP sent to your mobile.';
            errorEl.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";

        try {
            const response = await fetch(API_VERIFY_OTP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, otp: otpOrPassword })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid or expired OTP");
            }

            const authenticatedUser = {
                name: name || (this.currentAuthMode === 'register' ? "New Member" : "Client User"),
                phone: phone,
                role: 'client',
                token: data.token || null
            };

            store.setCurrentUser(authenticatedUser);
            this.updateNavState();
            this.closeAuthModal();

            const toastMessage = this.currentAuthMode === 'register'
                ? "Account verified and created! Welcome to FITUP 🎉"
                : "OTP verified! Logged in successfully 🚀";
            app.showToast(toastMessage);
            app.showSection('search');
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Verify OTP & Continue";
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    },

    logout() {
        store.setCurrentUser(null);
        this.updateNavState();
        app.showToast("Logged out of FITUP.");
        app.showSection('home');
    },

    updateNavState() {
        const user = store.getCurrentUser();
        const loggedOutView = document.getElementById('loggedOutView');
        const loggedInView = document.getElementById('loggedInView');
        const myBookingsNav = document.getElementById('myBookingsNav');
        const ownerDashboardNav = document.getElementById('ownerDashboardNav');

        if (user) {
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'flex';

            document.getElementById('navUserName').textContent = user.name;
            document.getElementById('navUserAvatar').textContent = user.name.charAt(0).toUpperCase();

            const roleBadge = document.getElementById('navUserRole');

            if (user.role === 'owner') {
                roleBadge.textContent = 'Owner';
                roleBadge.style.color = 'var(--primary)';
                if (ownerDashboardNav) ownerDashboardNav.style.display = 'flex';
                if (myBookingsNav) myBookingsNav.style.display = 'flex';
            } else {
                roleBadge.textContent = 'Client';
                roleBadge.style.color = '#FFF';
                if (ownerDashboardNav) ownerDashboardNav.style.display = 'none';
                if (myBookingsNav) myBookingsNav.style.display = 'flex';
            }
        } else {
            loggedOutView.style.display = 'flex';
            loggedInView.style.display = 'none';
            if (myBookingsNav) myBookingsNav.style.display = 'none';
            if (ownerDashboardNav) ownerDashboardNav.style.display = 'none';
        }
    }
};