/* ==========================================================================
   FITUP - LocalStorage & Cloud Firebase Firestore Hybrid Sync Store
   ========================================================================== */

const store = {
    KEYS: {
        GYMS: "fitup_gyms_v1",
        TRAINERS: "fitup_trainers_v1",
        SLOTS: "fitup_slots_v1",
        BOOKINGS: "fitup_bookings_v1",
        CURRENT_USER: "fitup_current_user_v1"
    },

    init() {
        if (!localStorage.getItem(this.KEYS.GYMS)) {
            localStorage.setItem(this.KEYS.GYMS, JSON.stringify(INITIAL_DATA.gyms));
        }
        if (!localStorage.getItem(this.KEYS.TRAINERS)) {
            localStorage.setItem(this.KEYS.TRAINERS, JSON.stringify(INITIAL_DATA.trainers));
        }
        if (!localStorage.getItem(this.KEYS.SLOTS)) {
            localStorage.setItem(this.KEYS.SLOTS, JSON.stringify(INITIAL_DATA.slots));
        }
        if (!localStorage.getItem(this.KEYS.BOOKINGS)) {
            localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(INITIAL_DATA.bookings));
        }
    },

    // GYMS
    getGyms() {
        return JSON.parse(localStorage.getItem(this.KEYS.GYMS) || "[]");
    },
    getGymById(id) {
        return this.getGyms().find(g => g.id === id);
    },
    saveGym(gymData) {
        const gyms = this.getGyms();
        if (gymData.id) {
            const idx = gyms.findIndex(g => g.id === gymData.id);
            if (idx !== -1) gyms[idx] = { ...gyms[idx], ...gymData };
        } else {
            gymData.id = 'gym-' + Date.now();
            gyms.push(gymData);
        }
        localStorage.setItem(this.KEYS.GYMS, JSON.stringify(gyms));
        this.notifyChange();
        return gymData;
    },
    deleteGym(gymId) {
        let gyms = this.getGyms().filter(g => g.id !== gymId);
        localStorage.setItem(this.KEYS.GYMS, JSON.stringify(gyms));
        
        let trainers = this.getTrainers().filter(t => t.gymId !== gymId);
        localStorage.setItem(this.KEYS.TRAINERS, JSON.stringify(trainers));
        this.notifyChange();
    },

    // TRAINERS
    getTrainers() {
        return JSON.parse(localStorage.getItem(this.KEYS.TRAINERS) || "[]");
    },
    getTrainersByGym(gymId) {
        return this.getTrainers().filter(t => t.gymId === gymId);
    },
    getTrainerById(id) {
        return this.getTrainers().find(t => t.id === id);
    },
    saveTrainer(trainerData) {
        const trainers = this.getTrainers();
        if (trainerData.id) {
            const idx = trainers.findIndex(t => t.id === trainerData.id);
            if (idx !== -1) trainers[idx] = { ...trainers[idx], ...trainerData };
        } else {
            trainerData.id = 'tr-' + Date.now();
            trainers.push(trainerData);
        }
        localStorage.setItem(this.KEYS.TRAINERS, JSON.stringify(trainers));
        this.notifyChange();
        return trainerData;
    },
    deleteTrainer(trainerId) {
        let trainers = this.getTrainers().filter(t => t.id !== trainerId);
        localStorage.setItem(this.KEYS.TRAINERS, JSON.stringify(trainers));
        this.notifyChange();
    },

    // SLOTS
    getSlots() {
        return JSON.parse(localStorage.getItem(this.KEYS.SLOTS) || "[]");
    },
    saveSlot(slotData) {
        const slots = this.getSlots();
        slotData.id = 'slot-' + Date.now();
        slots.push(slotData);
        localStorage.setItem(this.KEYS.SLOTS, JSON.stringify(slots));
        this.notifyChange();
        return slotData;
    },
    deleteSlot(slotId) {
        let slots = this.getSlots().filter(s => s.id !== slotId);
        localStorage.setItem(this.KEYS.SLOTS, JSON.stringify(slots));
        this.notifyChange();
    },

    // BOOKINGS
    getBookings() {
        return JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS) || "[]");
    },
    saveBooking(bookingData) {
        const bookings = this.getBookings();
        bookingData.id = 'FT-' + Math.floor(100000 + Math.random() * 900000);
        bookingData.createdAt = new Date().toISOString();
        bookings.unshift(bookingData);
        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
        
        this.notifyChange();
        return bookingData;
    },
    updateBookingStatus(bookingId, newStatus) {
        const bookings = this.getBookings();
        const b = bookings.find(item => item.id === bookingId);
        if (b) {
            b.status = newStatus;
            localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
            this.notifyChange();
        }
    },

    // USER SESSION
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER) || "null");
    },
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.KEYS.CURRENT_USER);
        }
    },

    notifyChange() {
        if (window.app && typeof window.app.renderOwnerDashboard === 'function') {
            window.app.renderOwnerDashboard();
        }
    }
};

// Initialize store on script load
store.init();
