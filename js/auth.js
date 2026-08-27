/* ==========================================================================
   FITUP - Authentication Module (Clean & Secure Owner / Client Login)
   ========================================================================== */

const auth = {
    currentAuthMode: "login",

    openAuthModal(mode = "login") {
        this.switchAuthMode(mode);
        document.getElementById('authModal').classList.add('active');
    },

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
        document.getElementById('authErrorMessage').style.display = 'none';
        document.getElementById('authForm').reset();
    },

    switchAuthMode(mode) {
        this.currentAuthMode = mode;
        const nameGroup = document.getElementById('nameGroup');
        const loginTabBtn = document.getElementById('loginTabBtn');
        const registerTabBtn = document.getElementById('registerTabBtn');
        const submitBtn = document.getElementById('authSubmitBtn');

        if (mode === 'register') {
            nameGroup.style.display = 'block';
            loginTabBtn.classList.remove('active');
            registerTabBtn.classList.add('active');
            submitBtn.textContent = 'Create FITUP Account';
        } else {
            nameGroup.style.display = 'none';
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            submitBtn.textContent = 'Sign In to FITUP';
        }

        document.getElementById('authErrorMessage').style.display = 'none';
    },

    handleAuthSubmit(e) {
        e.preventDefault();
        const phone = document.getElementById('authPhone').value.trim();
        const password = document.getElementById('authPassword').value.trim();
        const name = document.getElementById('authName').value.trim();
        const errorEl = document.getElementById('authErrorMessage');

        if (!phone || !password) {
            errorEl.textContent = 'Please enter phone number and password.';
            errorEl.style.display = 'block';
            return;
        }

        // CHECK FOR OWNER CREDENTIALS (SNEHITH)
        if (phone === "9030118909" && (password === "Snehith@020777" || name.toUpperCase() === "SNEHITH")) {
            const ownerUser = {
                name: "SNEHITH",
                phone: "9030118909",
                role: "owner"
            };
            store.setCurrentUser(ownerUser);
            this.updateNavState();
            this.closeAuthModal();
            app.showToast("Logged in as Gym Owner (SNEHITH) ✅");
            app.showSection('owner');
            return;
        }

        // CLIENT LOGIN / REGISTER
        if (this.currentAuthMode === 'register') {
            if (!name) {
                errorEl.textContent = 'Please enter your full name.';
                errorEl.style.display = 'block';
                return;
            }
            const newUser = { name, phone, role: 'client' };
            store.setCurrentUser(newUser);
            this.updateNavState();
            this.closeAuthModal();
            app.showToast("Account created successfully! Welcome to FITUP 🎉");
            app.showSection('search');
        } else {
            const user = { name: name || "Client User", phone, role: 'client' };
            store.setCurrentUser(user);
            this.updateNavState();
            this.closeAuthModal();
            app.showToast("Logged in successfully! 🚀");
            app.showSection('search');
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
