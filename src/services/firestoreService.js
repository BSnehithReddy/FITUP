import { 
    db, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    onSnapshot 
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
        ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=280&cu=INR",
        razorpayKeyId: "rzp_test_FITUPDemoKey",
        defaultPlatformSplit: 20,
        defaultGymSplit: 30,
        defaultTrainerSplit: 50
    },
    gyms: [
        {
            gymId: "gym-1",
            name: "GS fitness studio",
            location: "chengicherla , Hyderabad",
            address: "Main Road, Chengicherla, Hyderabad",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            reviewCount: 42,
            startingPrice: 280,
            amenities: ["AC", "Free Locker", "Steam Bath", "Protein Bar"],
            ownerName: "Vinay",
            ownerPhone: "9123456780",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 350,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=280&cu=INR"
        },
        {
            gymId: "gym-2",
            name: "fusion fitness",
            location: "chengicherla, Hyderabad",
            address: "Opposite Commercial Complex, Chengicherla, Hyderabad",
            image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviewCount: 38,
            startingPrice: 250,
            amenities: ["Crossfit Zone", "Cardio Deck", "Sauna", "Certified Trainers"],
            ownerName: "Rahul Sharma",
            ownerPhone: "9876500001",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 240,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=250&cu=INR"
        },
        {
            gymId: "gym-3",
            name: "Iron Temple Heavy Gym",
            location: "Jubilee Hills, Hyderabad",
            address: "Road No. 36, Jubilee Hills, Hyderabad",
            image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            reviewCount: 56,
            startingPrice: 250,
            amenities: ["Heavy Powerlifting", "Physio Zone", "Valet Parking", "Juice Bar"],
            ownerName: "Karan Singh",
            ownerPhone: "9876500002",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 420,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=250&cu=INR"
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
            trainerSplitPercent: 50,
            specialization: "Hypertrophy & Strength",
            experience: "7+ Years • Certified CSCS",
            rating: 4.9,
            price: 280,
            image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]
        },
        {
            trainerId: "tr-2",
            gymId: "gym-2",
            name: "Rahul Verma",
            phone: "9876543210",
            password: "Trainer@123",
            upiId: "rahul@upi",
            walletBalance: 300,
            trainerSplitPercent: 50,
            specialization: "Fat Loss & HIIT Transformation",
            experience: "4+ Years • K11 Certified",
            rating: 4.8,
            price: 250,
            image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "06:00 PM - 08:00 PM"]
        },
        {
            trainerId: "tr-3",
            gymId: "gym-3",
            name: "Ananya Reddy",
            phone: "9701122334",
            password: "Trainer@123",
            upiId: "ananya@upi",
            walletBalance: 600,
            trainerSplitPercent: 50,
            specialization: "Functional Mobility & Core",
            experience: "5+ Years • ACE Specialist",
            rating: 5.0,
            price: 250,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "04:00 PM - 06:00 PM", "08:00 PM - 10:00 PM"]
        }
    ],
    bookings: [
        {
            bookingId: "FT-903001",
            userId: "usr-client-1",
            userName: "Karthik Raja",
            userPhone: "9876500112",
            gymId: "gym-1",
            gymName: "GS fitness studio",
            gymLocation: "chengicherla , Hyderabad",
            gymOwnerName: "Vinay",
            gymOwnerPhone: "9123456780",
            trainerId: "tr-1",
            trainerName: "Vikram Sharma",
            slotTime: "09:00 AM - 11:00 AM",
            date: "2026-09-02",
            amount: 280,
            trainerShare: 140,
            gymShare: 84,
            platformShare: 56,
            trainerPercent: 50,
            gymPercent: 30,
            platformPercent: 20,
            status: "VERIFIED",
            paymentMethod: "RAZORPAY",
            paymentId: "pay_Nzv890FITUP111",
            txnId: "pay_Nzv890FITUP111",
            qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PASS-FT-903001-VERIFIED",
            createdAt: new Date().toISOString()
        }
    ],
    reviews: [
        {
            reviewId: "rev-1",
            targetId: "gym-1",
            targetType: "gym",
            userName: "Karthik Raja",
            userPhone: "9876500112",
            rating: 5,
            comment: "Outstanding facilities at GS Fitness. The weights and AC were top notch for my 2-hour session!",
            date: "2026-09-01"
        },
        {
            reviewId: "rev-2",
            targetId: "gym-2",
            targetType: "gym",
            userName: "Suresh P.",
            userPhone: "9848022334",
            rating: 5,
            comment: "Super smooth check-in with the QR pass. Trainer Rahul was very knowledgeable!",
            date: "2026-08-30"
        }
    ],
    payoutRequests: []
};

const STORAGE_KEYS = {
    OWNER_CONFIG: "fitup_owner_config",
    GYMS: "fitup_gyms",
    TRAINERS: "fitup_trainers",
    BOOKINGS: "fitup_bookings",
    REVIEWS: "fitup_reviews",
    PAYOUT_REQUESTS: "fitup_payout_requests",
    REGISTERED_CLIENTS: "fitup_registered_clients"
};

const safeJsonParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return fallback;
        const parsed = JSON.parse(item);
        return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
        return fallback;
    }
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
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_DATA.reviews));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYOUT_REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(INITIAL_DATA.payoutRequests));
    }
};

initLocalStore();

export const firestoreService = {
    // ----------------------------------------------------
    // REAL-TIME FIRESTORE SUBSCRIPTIONS (onSnapshot)
    // ----------------------------------------------------
    subscribeGyms(callback) {
        callback(this.getGymsSync());
        try {
            const unsub = onSnapshot(collection(db, "gyms"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreGyms = [];
                    snapshot.forEach(doc => firestoreGyms.push({ ...doc.data(), gymId: doc.id }));
                    if (firestoreGyms.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(firestoreGyms));
                        callback(firestoreGyms);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribeTrainers(callback) {
        callback(this.getTrainersSync());
        try {
            const unsub = onSnapshot(collection(db, "trainers"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreTrainers = [];
                    snapshot.forEach(doc => firestoreTrainers.push({ ...doc.data(), trainerId: doc.id }));
                    if (firestoreTrainers.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(firestoreTrainers));
                        callback(firestoreTrainers);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribeBookings(callback) {
        callback(this.getBookingsSync());
        try {
            const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreBookings = [];
                    snapshot.forEach(doc => firestoreBookings.push({ ...doc.data(), bookingId: doc.id }));
                    if (firestoreBookings.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(firestoreBookings));
                        callback(firestoreBookings);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribeReviews(callback) {
        callback(this.getReviewsSync());
        try {
            const unsub = onSnapshot(collection(db, "reviews"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreReviews = [];
                    snapshot.forEach(doc => firestoreReviews.push({ ...doc.data(), reviewId: doc.id }));
                    if (firestoreReviews.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(firestoreReviews));
                        callback(firestoreReviews);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribeOwnerConfig(callback) {
        callback(this.getOwnerConfigSync());
        try {
            const unsub = onSnapshot(doc(db, "config", "owner_settings"), (docSnap) => {
                if (docSnap && docSnap.exists && docSnap.exists()) {
                    const data = docSnap.data();
                    if (data) {
                        localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(data));
                        callback(data);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribePayoutRequests(callback) {
        callback(this.getPayoutRequestsSync());
        try {
            const unsub = onSnapshot(collection(db, "payoutRequests"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreRequests = [];
                    snapshot.forEach(doc => firestoreRequests.push({ ...doc.data(), requestId: doc.id }));
                    if (firestoreRequests.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(firestoreRequests));
                        callback(firestoreRequests);
                    }
                }
            }, () => {});
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    forceMasterSync() {
        emitDataSync();
        return true;
    },

    // ----------------------------------------------------
    // OWNER CONFIG
    // ----------------------------------------------------
    getOwnerConfigSync() {
        return safeJsonParse(STORAGE_KEYS.OWNER_CONFIG, INITIAL_DATA.ownerConfig);
    },

    async getOwnerConfig() {
        return this.getOwnerConfigSync();
    },

    async updateOwnerConfig(configData) {
        const current = this.getOwnerConfigSync();
        const updated = { ...current, ...configData };
        localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(updated));
        emitDataSync();
        
        try {
            await setDoc(doc(db, "config", "owner_settings"), configData, { merge: true });
        } catch (e) {}
        return updated;
    },

    // ----------------------------------------------------
    // GYMS & PER-GYM CONFIGURATION (30% SPLIT / WALLET)
    // ----------------------------------------------------
    getGymsSync() {
        const res = safeJsonParse(STORAGE_KEYS.GYMS, INITIAL_DATA.gyms);
        return Array.isArray(res) ? res : INITIAL_DATA.gyms;
    },

    async getGyms() {
        return this.getGymsSync();
    },

    async getGymById(gymId) {
        const gyms = this.getGymsSync();
        return gyms.find(g => g.gymId === gymId);
    },

    async saveGym(gymData, currentUser = null) {
        let savedGym = { ...gymData };
        if (!savedGym.gymId) {
            savedGym.gymId = 'gym-' + Date.now();
            if (savedGym.gymSplitPercent === undefined) savedGym.gymSplitPercent = 30;
            if (savedGym.walletBalance === undefined) savedGym.walletBalance = 0;
            if (savedGym.ownerPassword === undefined) savedGym.ownerPassword = "Owner@123";
        }

        const gyms = this.getGymsSync();
        const existingIdx = gyms.findIndex(g => g.gymId === savedGym.gymId);
        
        if (existingIdx !== -1) {
            const existing = gyms[existingIdx];
            // Preserve wallet balance if not explicitly provided
            if (savedGym.walletBalance === undefined) {
                savedGym.walletBalance = existing.walletBalance || 0;
            }
            if (savedGym.startingPrice !== existing.startingPrice) {
                const isSuperAdmin = currentUser?.phone === "9030118909" && currentUser?.role === "owner";
                if (!isSuperAdmin) {
                    savedGym.startingPrice = existing.startingPrice;
                    console.warn("Security Alert: Unauthorized pricing modification blocked.");
                }
            }
        }
        
        if (existingIdx !== -1) gyms[existingIdx] = savedGym;
        else gyms.push(savedGym);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
        emitDataSync();

        try {
            await setDoc(doc(db, "gyms", savedGym.gymId), savedGym);
        } catch (e) {}
        return savedGym;
    },

    async updateGymPrice(gymId, newPrice, currentUser) {
        const isSuperAdmin = currentUser?.phone === "9030118909" && currentUser?.role === "owner";
        if (!isSuperAdmin) {
            throw new Error("Permission Denied: Only Super Admin Snehith (9030118909) can modify trial slot fees.");
        }

        const gyms = this.getGymsSync();
        const gymIdx = gyms.findIndex(g => g.gymId === gymId);
        if (gymIdx === -1) throw new Error("Gym not found");

        gyms[gymIdx].startingPrice = Number(newPrice);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
        emitDataSync();

        try {
            await updateDoc(doc(db, "gyms", gymId), { startingPrice: Number(newPrice) });
        } catch (e) {}
        return gyms[gymIdx];
    },

    async deleteGym(gymId) {
        let gyms = this.getGymsSync().filter(g => g.gymId !== gymId);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));

        let trainers = this.getTrainersSync().filter(t => t.gymId !== gymId);
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        try {
            await deleteDoc(doc(db, "gyms", gymId));
        } catch (e) {}
    },

    // ----------------------------------------------------
    // TRAINERS & PER-TRAINER CONFIGURATION (50% SPLIT / WALLET)
    // ----------------------------------------------------
    getTrainersSync() {
        const res = safeJsonParse(STORAGE_KEYS.TRAINERS, INITIAL_DATA.trainers);
        return Array.isArray(res) ? res : INITIAL_DATA.trainers;
    },

    async getTrainers() {
        return this.getTrainersSync();
    },

    async saveTrainer(trainerData) {
        let savedTrainer = { ...trainerData };
        if (!savedTrainer.trainerId) {
            savedTrainer.trainerId = 'tr-' + Date.now();
            if (savedTrainer.walletBalance === undefined) savedTrainer.walletBalance = 0;
            if (savedTrainer.rating === undefined) savedTrainer.rating = 5.0;
            if (savedTrainer.trainerSplitPercent === undefined) savedTrainer.trainerSplitPercent = 50;
        }

        const trainers = this.getTrainersSync();
        const idx = trainers.findIndex(t => t.trainerId === savedTrainer.trainerId);
        if (idx !== -1) {
            if (savedTrainer.walletBalance === undefined) {
                savedTrainer.walletBalance = trainers[idx].walletBalance || 0;
            }
            trainers[idx] = savedTrainer;
        } else {
            trainers.push(savedTrainer);
        }
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        try {
            await setDoc(doc(db, "trainers", savedTrainer.trainerId), savedTrainer);
        } catch (e) {}
        return savedTrainer;
    },

    async deleteTrainer(trainerId) {
        let trainers = this.getTrainersSync().filter(t => t.trainerId !== trainerId);
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
        emitDataSync();

        try {
            await deleteDoc(doc(db, "trainers", trainerId));
        } catch (e) {}
    },

    // ----------------------------------------------------
    // 20 / 30 / 50 REVENUE DISTRIBUTION ENGINE
    // ----------------------------------------------------
    getBookingsSync() {
        const res = safeJsonParse(STORAGE_KEYS.BOOKINGS, INITIAL_DATA.bookings);
        return Array.isArray(res) ? res : INITIAL_DATA.bookings;
    },

    async getBookings() {
        return this.getBookingsSync();
    },

    async createBooking(bookingData) {
        const bookingId = 'FT-' + Math.floor(100000 + Math.random() * 900000);
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PASS-${bookingId}-${encodeURIComponent(bookingData.gymName || 'FITUP')}`;
        const totalAmount = Number(bookingData.amount) || 280;

        // Retrieve Gym and Trainer configuration for split calculations
        const gyms = this.getGymsSync();
        const gymIndex = gyms.findIndex(g => g.gymId === bookingData.gymId);
        const gym = gymIndex !== -1 ? gyms[gymIndex] : null;

        const trainers = this.getTrainersSync();
        const trainerIndex = trainers.findIndex(t => t.trainerId === bookingData.trainerId);
        const trainer = trainerIndex !== -1 ? trainers[trainerIndex] : null;

        // Determine percentage splits (Defaults: Gym 30%, Trainer 50%, Platform 20%)
        const gymPercent = (gym && typeof gym.gymSplitPercent === 'number') ? gym.gymSplitPercent : 30;
        const trainerPercent = (trainer && typeof trainer.trainerSplitPercent === 'number') ? trainer.trainerSplitPercent : 50;
        const platformPercent = Math.max(0, 100 - gymPercent - trainerPercent);

        const trainerShare = Math.round((totalAmount * trainerPercent) / 100);
        const gymShare = Math.round((totalAmount * gymPercent) / 100);
        const platformShare = totalAmount - trainerShare - gymShare;

        let newBooking = {
            ...bookingData,
            bookingId,
            qrCodeUrl,
            amount: totalAmount,
            trainerShare,
            gymShare,
            platformShare,
            trainerPercent,
            gymPercent,
            platformPercent,
            gymOwnerName: gym?.ownerName || "Gym Partner",
            gymOwnerPhone: gym?.ownerPhone || "",
            createdAt: new Date().toISOString(),
            status: "VERIFIED",
            paymentMethod: bookingData.paymentMethod || "RAZORPAY",
            paymentId: bookingData.paymentId || bookingData.txnId || ('pay_rzp_' + Date.now())
        };

        const bookings = this.getBookingsSync();
        bookings.unshift(newBooking);
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

        // Credit 50% (or custom) to Trainer Digital Wallet
        if (trainerIndex !== -1) {
            trainers[trainerIndex].walletBalance = (trainers[trainerIndex].walletBalance || 0) + trainerShare;
            localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
            try {
                await updateDoc(doc(db, "trainers", trainers[trainerIndex].trainerId), { 
                    walletBalance: trainers[trainerIndex].walletBalance 
                });
            } catch (e) {}
        }

        // Credit 30% (or custom) to Gym Owner Digital Wallet
        if (gymIndex !== -1) {
            gyms[gymIndex].walletBalance = (gyms[gymIndex].walletBalance || 0) + gymShare;
            localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
            try {
                await updateDoc(doc(db, "gyms", gyms[gymIndex].gymId), { 
                    walletBalance: gyms[gymIndex].walletBalance 
                });
            } catch (e) {}
        }

        emitDataSync();

        try {
            await setDoc(doc(db, "bookings", newBooking.bookingId), newBooking);
        } catch (e) {}
        return newBooking;
    },

    async cancelBooking(bookingId, reason = "User Request") {
        const bookings = this.getBookingsSync();
        const idx = bookings.findIndex(b => b.bookingId === bookingId);
        if (idx === -1) throw new Error("Booking not found");

        bookings[idx].status = "CANCELLED";
        bookings[idx].cancellationReason = reason;
        bookings[idx].refundStatus = "REFUND_INITIATED_100%";
        bookings[idx].cancelledAt = new Date().toISOString();

        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        emitDataSync();

        try {
            await updateDoc(doc(db, "bookings", bookingId), {
                status: "CANCELLED",
                cancellationReason: reason,
                refundStatus: "REFUND_INITIATED_100%",
                cancelledAt: bookings[idx].cancelledAt
            });
        } catch (e) {}
        return bookings[idx];
    },

    // ----------------------------------------------------
    // RATINGS & REVIEWS
    // ----------------------------------------------------
    getReviewsSync() {
        const res = safeJsonParse(STORAGE_KEYS.REVIEWS, INITIAL_DATA.reviews);
        return Array.isArray(res) ? res : INITIAL_DATA.reviews;
    },

    async getReviews() {
        return this.getReviewsSync();
    },

    async addReview(reviewData) {
        const reviewId = 'rev-' + Date.now();
        const newReview = {
            ...reviewData,
            reviewId,
            date: new Date().toISOString().split('T')[0]
        };

        const reviews = this.getReviewsSync();
        reviews.unshift(newReview);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

        if (reviewData.targetType === 'gym') {
            const gyms = this.getGymsSync();
            const gIdx = gyms.findIndex(g => g.gymId === reviewData.targetId);
            if (gIdx !== -1) {
                const gymReviews = reviews.filter(r => r.targetId === reviewData.targetId);
                const avgRating = Number((gymReviews.reduce((sum, r) => sum + r.rating, 0) / gymReviews.length).toFixed(1));
                gyms[gIdx].rating = avgRating;
                gyms[gIdx].reviewCount = gymReviews.length;
                localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
                try {
                    await updateDoc(doc(db, "gyms", reviewData.targetId), { rating: avgRating, reviewCount: gymReviews.length });
                } catch (e) {}
            }
        }

        emitDataSync();
        try {
            await setDoc(doc(db, "reviews", reviewId), newReview);
        } catch (e) {}
        return newReview;
    },

    // ----------------------------------------------------
    // PAYOUT REQUESTS & WITHDRAWALS (TRAINER & GYM OWNER)
    // ----------------------------------------------------
    getPayoutRequestsSync() {
        const res = safeJsonParse(STORAGE_KEYS.PAYOUT_REQUESTS, []);
        return Array.isArray(res) ? res : [];
    },

    async getPayoutRequests() {
        return this.getPayoutRequestsSync();
    },

    // Trainer 12-Hour Withdrawal
    async requestTrainerPayout(trainerId, trainerName, amountRequested, upiId = "") {
        const trainers = this.getTrainersSync();
        const trainerIndex = trainers.findIndex(t => t.trainerId === trainerId);
        
        if (trainerIndex === -1) throw new Error("Trainer not found");
        if ((trainers[trainerIndex].walletBalance || 0) < amountRequested) {
            throw new Error("Insufficient wallet balance for withdrawal");
        }

        trainers[trainerIndex].walletBalance -= amountRequested;
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));

        const now = new Date();
        const availableAt = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();

        const newRequest = {
            requestId: 'TPO-' + Math.floor(1000 + Math.random() * 9000),
            type: "TRAINER",
            trainerId,
            beneficiaryName: trainerName,
            trainerName,
            amountRequested: Number(amountRequested),
            upiId: upiId || trainers[trainerIndex].upiId || "trainer@upi",
            status: "PENDING",
            requestedAt: now.toISOString(),
            availableAt,
            estimatedSettlement: "Processing in 12 Hours"
        };

        const requests = this.getPayoutRequestsSync();
        requests.unshift(newRequest);
        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
        emitDataSync();

        try {
            await setDoc(doc(db, "payoutRequests", newRequest.requestId), newRequest);
            await updateDoc(doc(db, "trainers", trainerId), { walletBalance: trainers[trainerIndex].walletBalance });
        } catch (e) {}
        return newRequest;
    },

    // Gym Owner 24-48 Hour Withdrawal (e.g. Vinay)
    async requestGymOwnerPayout(gymId, gymName, ownerName, ownerPhone, amountRequested, upiId) {
        const gyms = this.getGymsSync();
        const gymIndex = gyms.findIndex(g => g.gymId === gymId);

        if (gymIndex === -1) throw new Error("Gym not found");
        if ((gyms[gymIndex].walletBalance || 0) < amountRequested) {
            throw new Error("Insufficient accumulated 30% wallet balance for withdrawal");
        }

        gyms[gymIndex].walletBalance -= amountRequested;
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));

        const now = new Date();
        const newRequest = {
            requestId: 'GPO-' + Math.floor(1000 + Math.random() * 9000),
            type: "GYM_OWNER",
            gymId,
            gymName,
            beneficiaryName: ownerName || "Gym Owner",
            ownerName: ownerName || "Gym Owner",
            ownerPhone: ownerPhone || "",
            amountRequested: Number(amountRequested),
            upiId: upiId || "owner@upi",
            status: "PENDING",
            requestedAt: now.toISOString(),
            estimatedSettlement: "Pending Payout - Processing in 24-48 hours"
        };

        const requests = this.getPayoutRequestsSync();
        requests.unshift(newRequest);
        localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
        emitDataSync();

        try {
            await setDoc(doc(db, "payoutRequests", newRequest.requestId), newRequest);
            await updateDoc(doc(db, "gyms", gymId), { walletBalance: gyms[gymIndex].walletBalance });
        } catch (e) {}
        return newRequest;
    },

    async approvePayout(requestId) {
        let requests = this.getPayoutRequestsSync();
        const reqIdx = requests.findIndex(r => r.requestId === requestId);
        if (reqIdx !== -1) {
            requests[reqIdx].status = "APPROVED";
            requests[reqIdx].approvedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
            emitDataSync();
            try {
                await updateDoc(doc(db, "payoutRequests", requestId), { 
                    status: "APPROVED",
                    approvedAt: requests[reqIdx].approvedAt
                });
            } catch (e) {}
        }
        return requests[reqIdx];
    },

    // ----------------------------------------------------
    // ACCOUNT DELETION (Google Play Policy Compliance)
    // ----------------------------------------------------
    async deleteAccountData(phone) {
        // 1. Remove from registered clients
        let clients = safeJsonParse(STORAGE_KEYS.REGISTERED_CLIENTS, []);
        clients = clients.filter(c => c.phone !== phone);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_CLIENTS, JSON.stringify(clients));

        // 2. Anonymize past booking names
        let bookings = this.getBookingsSync();
        bookings = bookings.map(b => {
            if (b.userPhone === phone) {
                return { ...b, userName: "Deleted User", userPhone: "DELETED" };
            }
            return b;
        });
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

        emitDataSync();
        return { success: true };
    }
};
