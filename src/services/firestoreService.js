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
        razorpayKeyId: "rzp_test_FITUPDemoKey"
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
            trainerId: "tr-1",
            trainerName: "Vikram Sharma",
            slotTime: "09:00 AM - 11:00 AM",
            date: "2026-09-02",
            amount: 280,
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
            targetId: "gym-1", // gymId or trainerId
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
        // Immediate local callback
        callback(this.getGymsSync());

        // Firestore real-time listener with error safety
        try {
            const unsub = onSnapshot(collection(db, "gyms"), (snapshot) => {
                if (!snapshot.empty) {
                    const firestoreGyms = [];
                    snapshot.forEach(doc => firestoreGyms.push({ ...doc.data(), gymId: doc.id }));
                    localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(firestoreGyms));
                    callback(firestoreGyms);
                }
            }, (error) => {
                console.info("Firestore live listener in offline fallback mode:", error?.message || error);
            });
            return unsub;
        } catch (e) {
            return () => {};
        }
    },

    subscribeTrainers(callback) {
        callback(this.getTrainersSync());
        try {
            const unsub = onSnapshot(collection(db, "trainers"), (snapshot) => {
                if (!snapshot.empty) {
                    const firestoreTrainers = [];
                    snapshot.forEach(doc => firestoreTrainers.push({ ...doc.data(), trainerId: doc.id }));
                    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(firestoreTrainers));
                    callback(firestoreTrainers);
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
                if (!snapshot.empty) {
                    const firestoreBookings = [];
                    snapshot.forEach(doc => firestoreBookings.push({ ...doc.data(), bookingId: doc.id }));
                    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(firestoreBookings));
                    callback(firestoreBookings);
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
                if (!snapshot.empty) {
                    const firestoreReviews = [];
                    snapshot.forEach(doc => firestoreReviews.push({ ...doc.data(), reviewId: doc.id }));
                    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(firestoreReviews));
                    callback(firestoreReviews);
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
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(data));
                    callback(data);
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
        
        try {
            await setDoc(doc(db, "config", "owner_settings"), configData, { merge: true });
        } catch (e) {}
        return updated;
    },

    // ----------------------------------------------------
    // GYMS & SUPER ADMIN PRICE LOCK
    // ----------------------------------------------------
    getGymsSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.GYMS) || JSON.stringify(INITIAL_DATA.gyms));
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
        }

        // Check if existing gym is having price modified
        const gyms = this.getGymsSync();
        const existingIdx = gyms.findIndex(g => g.gymId === savedGym.gymId);
        
        // Super Admin Price Enforcement Check
        if (existingIdx !== -1) {
            const existing = gyms[existingIdx];
            if (savedGym.startingPrice !== existing.startingPrice) {
                const isSuperAdmin = currentUser?.phone === "9030118909" && currentUser?.role === "owner";
                if (!isSuperAdmin) {
                    // Revert to original admin price if unauthorized
                    savedGym.startingPrice = existing.startingPrice;
                    console.warn("Security Alert: Unauthorized pricing modification blocked. Super Admin credentials required.");
                }
            }
        }
        
        // Local Optimistic Update
        if (existingIdx !== -1) gyms[existingIdx] = savedGym;
        else gyms.push(savedGym);
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
        emitDataSync();

        // Direct Firestore Write
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
    // TRAINERS
    // ----------------------------------------------------
    getTrainersSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAINERS) || JSON.stringify(INITIAL_DATA.trainers));
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
        }

        const trainers = this.getTrainersSync();
        const idx = trainers.findIndex(t => t.trainerId === savedTrainer.trainerId);
        if (idx !== -1) trainers[idx] = savedTrainer;
        else trainers.push(savedTrainer);
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
    // BOOKINGS & RAZORPAY SETTLEMENT
    // ----------------------------------------------------
    getBookingsSync() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || JSON.stringify(INITIAL_DATA.bookings));
    },

    async getBookings() {
        return this.getBookingsSync();
    },

    async createBooking(bookingData) {
        const bookingId = 'FT-' + Math.floor(100000 + Math.random() * 900000);
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PASS-${bookingId}-${encodeURIComponent(bookingData.gymName || 'FITUP')}`;
        
        let newBooking = {
            ...bookingData,
            bookingId,
            qrCodeUrl,
            createdAt: new Date().toISOString(),
            status: "VERIFIED",
            paymentMethod: bookingData.paymentMethod || "RAZORPAY",
            paymentId: bookingData.paymentId || bookingData.txnId || ('pay_rzp_' + Date.now())
        };

        const bookings = this.getBookingsSync();
        bookings.unshift(newBooking);
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

        // Credit 75% to Trainer Digital Wallet & 25% Platform Share
        const trainers = this.getTrainersSync();
        const trainerIndex = trainers.findIndex(t => t.trainerId === newBooking.trainerId);
        if (trainerIndex !== -1) {
            const sessionEarnings = (newBooking.amount || 280) * 0.75;
            trainers[trainerIndex].walletBalance = (trainers[trainerIndex].walletBalance || 0) + sessionEarnings;
            localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
            try {
                await updateDoc(doc(db, "trainers", trainers[trainerIndex].trainerId), { walletBalance: trainers[trainerIndex].walletBalance });
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
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || JSON.stringify(INITIAL_DATA.reviews));
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

        // Dynamically update average rating on target Gym
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
    // PAYOUT REQUESTS
    // ----------------------------------------------------
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

        try {
            await setDoc(doc(db, "payoutRequests", newRequest.requestId), newRequest);
        } catch (e) {}
        return newRequest;
    },

    async approvePayout(requestId) {
        let requests = this.getPayoutRequestsSync();
        const reqIdx = requests.findIndex(r => r.requestId === requestId);
        if (reqIdx !== -1) {
            requests[reqIdx].status = "APPROVED";
            localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(requests));
            emitDataSync();
            try {
                await updateDoc(doc(db, "payoutRequests", requestId), { status: "APPROVED" });
            } catch (e) {}
        }
        return requests[reqIdx];
    }
};
