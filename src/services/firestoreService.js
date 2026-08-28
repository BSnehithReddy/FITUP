import { 
    db, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    deleteDoc 
} from "../firebase";

const emitDataSync = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fitup_data_sync'));
    }
};

const INITIAL_DATA = {
    ownerConfig: {
        ownerUpiId: "9030118909@ybl",
        ownerPhone: "9030118909",
        ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=200&cu=INR"
    },
    gyms: [
        {
            gymId: "gym-1",
            name: "GS - Gym & Fitness Arena",
            location: "Hitec City, Hyderabad",
            address: "Plot 42, Mindspace Road, Hitec City, Hyderabad",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            startingPrice: 200,
            amenities: ["AC", "Free Locker", "Steam Bath", "Protein Bar"],
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=200&cu=INR"
        },
        {
            gymId: "gym-2",
            name: "Pulse Fitness Club",
            location: "Gachibowli, Hyderabad",
            address: "Opposite DLF Cyber City, Gachibowli, Hyderabad",
            image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            startingPrice: 220,
            amenities: ["Crossfit Zone", "Cardio Deck", "Sauna", "Certified Trainers"],
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=220&cu=INR"
        },
        {
            gymId: "gym-3",
            name: "Iron Temple Heavy Gym",
            location: "Jubilee Hills, Hyderabad",
            address: "Road No. 36, Jubilee Hills, Hyderabad",
            image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            startingPrice: 250,
            amenities: ["Heavy Powerlifting", "Physio Zone", "Valet Parking", "Juice Bar"],
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=200&cu=INR"
        }
    ],
    trainers: [
        {
            trainerId: "tr-1",
            gymId: "gym-1",
            name: "Vikram Sharma",
            phone: "9030118909",
            password: "Trainer@123",
            upiId: "vikram@upi",
            walletBalance: 450,
            specialization: "Hypertrophy & Strength",
            experience: "7+ Years • Certified CSCS",
            price: 200,
            image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]
        },
        {
            trainerId: "tr-2",
            gymId: "gym-1",
            name: "Rahul Verma",
            phone: "9876543210",
            password: "Trainer@123",
            upiId: "rahul@upi",
            walletBalance: 300,
            specialization: "Fat Loss & HIIT Transformation",
            experience: "4+ Years • K11 Certified",
            price: 200,
            image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "06:00 PM - 08:00 PM"]
        },
        {
            trainerId: "tr-3",
            gymId: "gym-2",
            name: "Ananya Reddy",
            phone: "9701122334",
            password: "Trainer@123",
            upiId: "ananya@upi",
            walletBalance: 600,
            specialization: "Functional Strength & Mobility",
            experience: "5+ Years • ACE Certified Specialist",
            price: 220,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "02:00 PM - 04:00 PM", "08:00 PM - 10:00 PM"]
        }
    ],
    bookings: [
        {
            bookingId: "FT-903001",
            userId: "usr-client-1",
            userName: "Karthik Raja",
            userPhone: "9876500112",
            gymId: "gym-1",
            gymName: "GS - Gym & Fitness Arena",
            trainerId: "tr-1",
            trainerName: "Vikram Sharma",
            slotTime: "09:00 AM - 11:00 AM",
            date: "2026-08-28",
            amount: 200,
            status: "VERIFIED",
            txnId: "UTR-903011890111",
            screenshotUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date().toISOString()
        }
    ],
    payoutRequests: [
        {
            requestId: "PO-1001",
            trainerId: "tr-1",
            trainerName: "Vikram Sharma",
            amountRequested: 300,
            status: "PENDING",
            requestedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            availableAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString()
        }
    ]
};

const STORAGE_KEYS = {
    OWNER_CONFIG: "fitup_owner_config",
    GYMS: "fitup_gyms",
    TRAINERS: "fitup_trainers",
    BOOKINGS: "fitup_bookings",
    PAYOUT_REQUESTS: "fitup_payout_requests"
};

const initLocalStore = () => {
    if (!localStorage.getItem(STORAGE_KEYS.OWNER_CONFIG)) {
        localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(INITIAL_DATA.ownerConfig));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GYMS)) {
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(INITIAL_DATA.gyms));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRAINERS)) {
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(INITIAL_DATA.trainers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_DATA.bookings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYOUT_REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(INITIAL_DATA.payoutRequests));
    }
};

initLocalStore();

export const firestoreService = {
    // 0ms Synchronous Reads with Background Firestore Sync
    getOwnerConfigSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_CONFIG) || JSON.stringify(INITIAL_DATA.ownerConfig));
    },

    async getOwnerConfig() {
        return this.getOwnerConfigSync();
    },

    async updateOwnerConfig(configData) {
        const current = this.getOwnerConfigSync();
        const updated = { ...current, ...configData };
        localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(updated));
        emitDataSync();
        
        // Non-blocking Firestore Sync
        setDoc(doc(db, "config", "owner_settings"), configData, { merge: true }).catch(() => {});
        return updated;
    },

    // GYMS
    getGymsSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.GYMS) || "[]");
    },

    async getGyms() {
        return this.getGymsSync();
    },

    async getGymById(gymId) {
        const gyms = this.getGymsSync();
        return gyms.find(g => g.gymId === gymId);
    },

    async saveGym(gymData) {
        let savedGym = { ...gymData };
        if (!savedGym.gymId) {
            savedGym.gymId = 'gym-' + Date.now();
        }
        
        // Synchronous Local Update (0ms latency)
        const gyms = this.getGymsSync();
        const idx = gyms.findIndex(g => g.gymId === savedGym.gymId);
        if (idx !== -1) gyms[idx] = savedGym;
        else gyms.push(savedGym);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
        emitDataSync();

        // Non-blocking Firestore Sync
        setDoc(doc(db, "gyms", savedGym.gymId), savedGym).catch(() => {});
        return savedGym;
    },

    async deleteGym(gymId) {
        let gyms = this.getGymsSync().filter(g => g.gymId !== gymId);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));

        let trainers = this.getTrainersSync().filter(t => t.gymId !== gymId);
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        // Non-blocking Firestore Delete
        deleteDoc(doc(db, "gyms", gymId)).catch(() => {});
    },

    // TRAINERS
    getTrainersSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAINERS) || "[]");
    },

    async getTrainers() {
        return this.getTrainersSync();
    },

    async saveTrainer(trainerData) {
        let savedTrainer = { ...trainerData };
        if (!savedTrainer.trainerId) {
            savedTrainer.trainerId = 'tr-' + Date.now();
            if (savedTrainer.walletBalance === undefined) savedTrainer.walletBalance = 0;
        }

        // Synchronous Local Update (0ms latency)
        const trainers = this.getTrainersSync();
        const idx = trainers.findIndex(t => t.trainerId === savedTrainer.trainerId);
        if (idx !== -1) trainers[idx] = savedTrainer;
        else trainers.push(savedTrainer);
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        // Non-blocking Firestore Sync
        setDoc(doc(db, "trainers", savedTrainer.trainerId), savedTrainer).catch(() => {});
        return savedTrainer;
    },

    async deleteTrainer(trainerId) {
        let trainers = this.getTrainersSync().filter(t => t.trainerId !== trainerId);
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        // Non-blocking Firestore Delete
        deleteDoc(doc(db, "trainers", trainerId)).catch(() => {});
    },

    // BOOKINGS
    getBookingsSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
    },

    async getBookings() {
        return this.getBookingsSync();
    },

    async createBooking(bookingData) {
        let newBooking = {
            ...bookingData,
            bookingId: 'FT-' + Math.floor(100000 + Math.random() * 900000),
            createdAt: new Date().toISOString(),
            status: "VERIFIED"
        };

        const bookings = this.getBookingsSync();
        bookings.unshift(newBooking);
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

        // Credit 75% to Trainer Digital Wallet
        const trainers = this.getTrainersSync();
        const trainerIndex = trainers.findIndex(t => t.trainerId === newBooking.trainerId);
        if (trainerIndex !== -1) {
            const sessionEarnings = (newBooking.amount || 200) * 0.75;
            trainers[trainerIndex].walletBalance = (trainers[trainerIndex].walletBalance || 0) + sessionEarnings;
            localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        }
        emitDataSync();

        // Non-blocking Firestore Sync
        setDoc(doc(db, "bookings", newBooking.bookingId), newBooking).catch(() => {});
        return newBooking;
    },

    // PAYOUT REQUESTS
    getPayoutRequestsSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYOUT_REQUESTS) || "[]");
    },

    async getPayoutRequests() {
        return this.getPayoutRequestsSync();
    },

    async requestPayout(trainerId, trainerName, amountRequested) {
        const trainers = this.getTrainersSync();
        const trainerIndex = trainers.findIndex(t => t.trainerId === trainerId);
        
        if (trainerIndex === -1) throw new Error("Trainer not found");
        if ((trainers[trainerIndex].walletBalance || 0) < amountRequested) {
            throw new Error("Insufficient wallet balance for withdrawal");
        }

        // Auto-debit wallet balance synchronously
        trainers[trainerIndex].walletBalance -= amountRequested;
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));

        const now = new Date();
        const availableAt = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();

        const newRequest = {
            requestId: 'PO-' + Math.floor(1000 + Math.random() * 9000),
            trainerId,
            trainerName,
            amountRequested,
            status: "PENDING",
            requestedAt: now.toISOString(),
            availableAt
        };

        const requests = this.getPayoutRequestsSync();
        requests.unshift(newRequest);
        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
        emitDataSync();

        // Non-blocking Firestore Sync
        setDoc(doc(db, "payoutRequests", newRequest.requestId), newRequest).catch(() => {});
        return newRequest;
    },

    async approvePayout(requestId) {
        let requests = this.getPayoutRequestsSync();
        const reqIdx = requests.findIndex(r => r.requestId === requestId);
        if (reqIdx !== -1) {
            requests[reqIdx].status = "APPROVED";
            localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
            emitDataSync();
            setDoc(doc(db, "payoutRequests", requestId), requests[reqIdx], { merge: true }).catch(() => {});
        }
        return requests[reqIdx];
    }
};
