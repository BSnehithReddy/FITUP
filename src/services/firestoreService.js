import { 
    db, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where 
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
        razorpayKeyId: "rzp_test_TYwrtzZ7ROjR5s",
        defaultPlatformSplit: 20,
        defaultGymSplit: 30,
        defaultTrainerSplit: 50
    },
    gyms: [
        {
            gymId: "gym-1",
            name: "GS Fitness Studio",
            location: "Chengicherla, Hyderabad",
            address: "Main Commercial Rd, Chengicherla, Hyderabad",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            reviewCount: 38,
            startingPrice: 280,
            amenities: ["AC", "Free Locker", "Steam Bath", "Protein Bar", "Heavy Lifting Zone"],
            ownerName: "Vinay Reddy",
            ownerPhone: "9123456780",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=280&cu=INR"
        },
        {
            gymId: "gym-2",
            name: "Fusion Fitness Arena",
            location: "Madhapur, Hyderabad",
            address: "Plot 14, Near Metro Pillar 1740, Madhapur, Hyderabad",
            image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviewCount: 45,
            startingPrice: 250,
            amenities: ["Crossfit Zone", "Cardio Deck", "Sauna", "Certified Trainers", "AC"],
            ownerName: "Rahul Sharma",
            ownerPhone: "9876500001",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
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
            reviewCount: 62,
            startingPrice: 280,
            amenities: ["Heavy Powerlifting", "Physio Zone", "Valet Parking", "Juice Bar", "Steam Bath"],
            ownerName: "Karan Singh",
            ownerPhone: "9876500002",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=280&cu=INR"
        },
        {
            gymId: "gym-4",
            name: "Apex Performance Club",
            location: "Gachibowli, Hyderabad",
            address: "Opp. Bio-Diversity Park, Gachibowli, Hyderabad",
            image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            reviewCount: 29,
            startingPrice: 260,
            amenities: ["Olympic Turf", "HIIT Studio", "AC", "Shower & Lockers", "Free WiFi"],
            ownerName: "Sameer Joshi",
            ownerPhone: "9876500003",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=260&cu=INR"
        },
        {
            gymId: "gym-5",
            name: "Titan Strength & Conditioning",
            location: "Kondapur, Hyderabad",
            address: "Near RTA Office, Kondapur, Hyderabad",
            image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviewCount: 34,
            startingPrice: 240,
            amenities: ["Squat Racks", "Dumbbells up to 60kg", "AC", "Steam Room"],
            ownerName: "Deepak Rao",
            ownerPhone: "9876500004",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=240&cu=INR"
        },
        {
            gymId: "gym-6",
            name: "Pulse 24/7 Fitness Center",
            location: "Hitech City, Hyderabad",
            address: "Cyber Towers Intersection, Hitech City, Hyderabad",
            image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            reviewCount: 51,
            startingPrice: 280,
            amenities: ["Open till Midnight", "Cardio Deck", "Steam & Sauna", "Protein Bar", "AC"],
            ownerName: "Sneha Nair",
            ownerPhone: "9876500005",
            ownerPassword: "Owner@123",
            gymSplitPercent: 30,
            walletBalance: 0,
            ownerUpiId: "9030118909@ybl",
            ownerQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=280&cu=INR"
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
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Hypertrophy & Strength Coach",
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
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Fat Loss & HIIT Transformation",
            experience: "5+ Years • K11 Certified",
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
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Functional Mobility & Core",
            experience: "6+ Years • ACE Specialist",
            rating: 5.0,
            price: 280,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "04:00 PM - 06:00 PM", "08:00 PM - 10:00 PM"]
        },
        {
            trainerId: "tr-4",
            gymId: "gym-4",
            name: "Karthik Gowda",
            phone: "9876500104",
            password: "Trainer@123",
            upiId: "karthik@upi",
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Powerlifting & Deadlift Specialist",
            experience: "4+ Years • IPF State Athlete",
            rating: 4.9,
            price: 260,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["07:00 AM - 09:00 AM", "05:00 PM - 07:00 PM", "07:00 PM - 09:00 PM"]
        },
        {
            trainerId: "tr-5",
            gymId: "gym-5",
            name: "Rohan Kapoor",
            phone: "9876500105",
            password: "Trainer@123",
            upiId: "rohan@upi",
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Bodybuilding & Muscle Sculpting",
            experience: "8+ Years • ISSA Certified",
            rating: 4.8,
            price: 240,
            image: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["06:00 AM - 08:00 AM", "10:00 AM - 12:00 PM", "06:00 PM - 08:00 PM"]
        },
        {
            trainerId: "tr-6",
            gymId: "gym-6",
            name: "Pooja Hegde",
            phone: "9876500106",
            password: "Trainer@123",
            upiId: "pooja@upi",
            walletBalance: 0,
            trainerSplitPercent: 50,
            specialization: "Calisthenics & Endurance HIIT",
            experience: "5+ Years • Crossfit L1",
            rating: 5.0,
            price: 280,
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
            availableTimings: ["08:00 AM - 10:00 AM", "04:00 PM - 06:00 PM", "07:00 PM - 09:00 PM"]
        }
    ],
    bookings: [],
    reviews: [
        {
            reviewId: "rev-1",
            gymId: "gym-1",
            userName: "Aditya Verma",
            rating: 5,
            comment: "Booked a 2-hour slot for ₹280. Trainer Vikram guided my deadlift form. Clean lockers and AC was great!",
            date: "2026-09-02"
        },
        {
            reviewId: "rev-2",
            gymId: "gym-3",
            userName: "Manish Reddy",
            rating: 5,
            comment: "Best heavy lifting setup in Jubilee Hills. Super seamless QR scan at reception.",
            date: "2026-09-05"
        },
        {
            reviewId: "rev-3",
            gymId: "gym-2",
            userName: "Priya S.",
            rating: 5,
            comment: "Clean steam room and great cardio equipment. Zero monthly lock-in is revolutionary.",
            date: "2026-09-06"
        }
    ],
    payoutRequests: [],
    users: [
        {
            uid: "usr-owner-snehith",
            name: "SNEHITH",
            phone: "9030118909",
            email: "snehith@fitup.com",
            role: "owner",
            createdAt: "2026-08-01T00:00:00.000Z",
            lastLogin: new Date().toISOString()
        }
    ]
};

const STORAGE_KEYS = {
    OWNER_CONFIG: "fitup_owner_config",
    GYMS: "fitup_gyms",
    TRAINERS: "fitup_trainers",
    BOOKINGS: "fitup_bookings",
    REVIEWS: "fitup_reviews",
    PAYOUT_REQUESTS: "fitup_payout_requests",
    REGISTERED_CLIENTS: "fitup_registered_clients",
    USERS: "fitup_users"
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
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
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

    subscribeUsers(callback) {
        callback(this.getUsersSync());
        try {
            const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
                if (snapshot && !snapshot.empty) {
                    const firestoreUsers = [];
                    snapshot.forEach(doc => firestoreUsers.push({ ...doc.data(), uid: doc.id }));
                    if (firestoreUsers.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(firestoreUsers));
                        callback(firestoreUsers);
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
        return (Array.isArray(res) && res.length > 0) ? res : INITIAL_DATA.gyms;
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
            gyms[existingIdx] = savedGym;
        } else {
            gyms.push(savedGym);
        }
        
        localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
        emitDataSync();

        try {
            await setDoc(doc(db, "gyms", savedGym.gymId), savedGym, { merge: true });
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
    // USER PROFILES & FIRESTORE SYNC (users/{uid})
    // ----------------------------------------------------
    getUsersSync() {
        const res = safeJsonParse(STORAGE_KEYS.USERS, INITIAL_DATA.users);
        return Array.isArray(res) ? res : INITIAL_DATA.users;
    },

    async getUsers() {
        return this.getUsersSync();
    },

    async getUserProfile(uid) {
        if (!uid) return null;
        const users = this.getUsersSync();
        const localUser = users.find(u => u.uid === uid);

        try {
            const snap = await getDoc(doc(db, "users", uid));
            if (snap && snap.exists && snap.exists()) {
                const cloudUser = { ...snap.data(), uid: snap.id };
                // Cache locally
                const idx = users.findIndex(u => u.uid === uid);
                if (idx !== -1) users[idx] = cloudUser;
                else users.push(cloudUser);
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                return cloudUser;
            }
        } catch (e) {
            console.warn("Firestore getUserProfile fallback to cache:", e?.message);
        }

        return localUser || null;
    },

    async getUserByEmail(email) {
        if (!email) return null;
        const normalized = email.toLowerCase().trim();
        const users = this.getUsersSync();
        const localUser = users.find(u => u.email && u.email.toLowerCase().trim() === normalized);
        if (localUser) return localUser;

        try {
            const q = query(collection(db, "users"), where("email", "==", normalized));
            const snap = await getDocs(q);
            if (snap && !snap.empty) {
                const cloudUser = { ...snap.docs[0].data(), uid: snap.docs[0].id };
                users.push(cloudUser);
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                return cloudUser;
            }
        } catch (e) {}

        return null;
    },

    async getUserByPhone(phone) {
        if (!phone) return null;
        const cleanPhone = phone.trim();
        const users = this.getUsersSync();
        const localUser = users.find(u => u.phone && u.phone.trim() === cleanPhone);
        if (localUser) return localUser;

        try {
            const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
            const snap = await getDocs(q);
            if (snap && !snap.empty) {
                const cloudUser = { ...snap.docs[0].data(), uid: snap.docs[0].id };
                users.push(cloudUser);
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                return cloudUser;
            }
        } catch (e) {}

        return null;
    },

    async saveUserProfile(userData) {
        if (!userData || !userData.uid) return null;
        const cleanData = {
            ...userData,
            email: (userData.email || "").toLowerCase().trim(),
            updatedAt: new Date().toISOString()
        };
        if (!cleanData.createdAt) {
            cleanData.createdAt = new Date().toISOString();
        }

        const users = this.getUsersSync();
        const idx = users.findIndex(u => u.uid === cleanData.uid);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...cleanData };
        } else {
            users.push(cleanData);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        emitDataSync();

        try {
            await setDoc(doc(db, "users", cleanData.uid), cleanData, { merge: true });
        } catch (e) {
            console.warn("Firestore saveUserProfile error (saved locally):", e?.message);
        }

        return cleanData;
    },

    async updateUserLastLogin(uid, metadata = {}) {
        if (!uid) return null;
        const lastLogin = new Date().toISOString();
        const users = this.getUsersSync();
        const idx = users.findIndex(u => u.uid === uid);
        let updatedUser = null;

        if (idx !== -1) {
            users[idx] = { ...users[idx], ...metadata, lastLogin, updatedAt: lastLogin };
            updatedUser = users[idx];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        emitDataSync();

        try {
            await setDoc(doc(db, "users", uid), { ...metadata, lastLogin, updatedAt: lastLogin }, { merge: true });
        } catch (e) {
            console.warn("Firestore updateUserLastLogin error:", e?.message);
        }

        return updatedUser;
    },

    async updateUserPasswordByPhone(phone, newPassword) {
        if (!phone || !newPassword) throw new Error("Phone number and new password are required.");
        const cleanPhone = phone.trim();
        let matched = false;

        // 1. Update in Firestore users collection & local store
        const users = this.getUsersSync();
        const userIdx = users.findIndex(u => u.phone === cleanPhone);
        if (userIdx !== -1) {
            users[userIdx].password = newPassword;
            users[userIdx].updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            matched = true;
            try {
                await updateDoc(doc(db, "users", users[userIdx].uid), {
                    password: newPassword,
                    updatedAt: users[userIdx].updatedAt
                });
            } catch (e) {}
        }

        // 2. Update Gym Owner password if matches gym owner phone
        const gyms = this.getGymsSync();
        const gymIdx = gyms.findIndex(g => g.ownerPhone === cleanPhone);
        if (gymIdx !== -1) {
            gyms[gymIdx].ownerPassword = newPassword;
            localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));
            matched = true;
            try {
                await updateDoc(doc(db, "gyms", gyms[gymIdx].gymId), { ownerPassword: newPassword });
            } catch (e) {}
        }

        // 3. Update Trainer password if matches trainer phone
        const trainers = this.getTrainersSync();
        const trIdx = trainers.findIndex(t => t.phone === cleanPhone);
        if (trIdx !== -1) {
            trainers[trIdx].password = newPassword;
            localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
            matched = true;
            try {
                await updateDoc(doc(db, "trainers", trainers[trIdx].trainerId), { password: newPassword });
            } catch (e) {}
        }

        // 4. Update Registered Clients local store
        const clients = safeJsonParse(STORAGE_KEYS.REGISTERED_CLIENTS, []);
        const cIdx = clients.findIndex(c => c.phone === cleanPhone);
        if (cIdx !== -1) {
            clients[cIdx].password = newPassword;
            localStorage.setItem(STORAGE_KEYS.REGISTERED_CLIENTS, JSON.stringify(clients));
            matched = true;
        }

        emitDataSync();
        return { success: true, matched };
    },

    // ----------------------------------------------------
    // ACCOUNT DELETION (Google Play Policy Compliance)
    // ----------------------------------------------------
    async deleteAccountData(phoneOrUid) {
        // 1. Remove from registered clients
        let clients = safeJsonParse(STORAGE_KEYS.REGISTERED_CLIENTS, []);
        clients = clients.filter(c => c.phone !== phoneOrUid && c.uid !== phoneOrUid);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_CLIENTS, JSON.stringify(clients));

        // 2. Remove from users collection
        let users = this.getUsersSync().filter(u => u.phone !== phoneOrUid && u.uid !== phoneOrUid);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // 3. Anonymize past booking names
        let bookings = this.getBookingsSync();
        bookings = bookings.map(b => {
            if (b.userPhone === phoneOrUid || b.userId === phoneOrUid) {
                return { ...b, userName: "Deleted User", userPhone: "DELETED", userId: "DELETED" };
            }
            return b;
        });
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

        emitDataSync();

        try {
            await deleteDoc(doc(db, "users", phoneOrUid));
        } catch (e) {}

        return { success: true };
    },

    // ----------------------------------------------------
    // CLOUD FIRESTORE BOOTSTRAP & SYNC UTILITIES
    // ----------------------------------------------------
    async initCloudFirestore() {
        try {
            console.log("🔥 FITUP Cloud Firestore (fitup-ccb95): Checking database status...");

            // 1. Config / Owner Settings
            try {
                const configSnap = await getDoc(doc(db, "config", "owner_settings"));
                if (!configSnap.exists()) {
                    console.log("🔥 Bootstrapping config/owner_settings to Firestore...");
                    await setDoc(doc(db, "config", "owner_settings"), INITIAL_DATA.ownerConfig);
                }
            } catch (e) {}

            // 2. Master Admin Profile
            try {
                const adminSnap = await getDoc(doc(db, "users", "usr-owner-snehith"));
                if (!adminSnap.exists()) {
                    console.log("🔥 Bootstrapping Master Admin profile in users/usr-owner-snehith...");
                    await setDoc(doc(db, "users", "usr-owner-snehith"), INITIAL_DATA.users[0]);
                }
            } catch (e) {}

            console.log("🔥 FITUP Cloud Firestore: Database ready for fresh live registrations.");
            return { success: true, message: "Cloud Firestore ready for live launch." };
        } catch (err) {
            console.warn("Firestore init notice:", err?.message);
            return { success: false, error: err?.message };
        }
    },

    async syncAllToCloud() {
        try {
            console.log("🔥 Syncing all local FITUP data directly to Cloud Firestore (fitup-ccb95)...");
            const config = this.getOwnerConfigSync();
            await setDoc(doc(db, "config", "owner_settings"), config, { merge: true });

            const gyms = this.getGymsSync();
            for (const g of gyms) {
                await setDoc(doc(db, "gyms", g.gymId), g, { merge: true });
            }

            const trainers = this.getTrainersSync();
            for (const t of trainers) {
                await setDoc(doc(db, "trainers", t.trainerId), t, { merge: true });
            }

            const users = this.getUsersSync();
            for (const u of users) {
                if (u.uid) {
                    await setDoc(doc(db, "users", u.uid), u, { merge: true });
                }
            }

            const bookings = this.getBookingsSync();
            for (const b of bookings) {
                if (b.bookingId) {
                    await setDoc(doc(db, "bookings", b.bookingId), b, { merge: true });
                }
            }

            const payoutRequests = this.getPayoutRequestsSync();
            for (const p of payoutRequests) {
                if (p.requestId) {
                    await setDoc(doc(db, "payoutRequests", p.requestId), p, { merge: true });
                }
            }

            const reviews = this.getReviewsSync();
            for (const r of reviews) {
                if (r.reviewId) {
                    await setDoc(doc(db, "reviews", r.reviewId), r, { merge: true });
                }
            }

            emitDataSync();
            return { 
                success: true, 
                syncedAt: new Date().toISOString(),
                counts: { 
                    gyms: gyms.length, 
                    trainers: trainers.length, 
                    users: users.length, 
                    bookings: bookings.length,
                    payoutRequests: payoutRequests.length,
                    reviews: reviews.length
                } 
            };
        } catch (err) {
            console.error("syncAllToCloud error:", err);
            throw err;
        }
    },

    clearAllTestData() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.REGISTERED_CLIENTS, JSON.stringify([]));
            
            // Reset gym wallets and review counts to 0
            const gyms = INITIAL_DATA.gyms.map(g => ({ ...g, walletBalance: 0, reviewCount: 0, rating: 5.0 }));
            localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms));

            // Reset trainer wallets to 0
            const trainers = INITIAL_DATA.trainers.map(t => ({ ...t, walletBalance: 0, rating: 5.0 }));
            localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));

            // Reset users to Master Admin only
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));

            emitDataSync();
            return true;
        }
        return false;
    },

    getCloudSyncStatus() {
        return {
            projectId: "fitup-ccb95",
            status: "CONNECTED",
            database: "Cloud Firestore (Native)",
            collections: ["users", "gyms", "trainers", "bookings", "reviews", "payoutRequests", "config"]
        };
    }
};

// Automatically run cloud bootstrap on app start
if (typeof window !== 'undefined') {
    setTimeout(() => {
        firestoreService.initCloudFirestore();
    }, 1000);
}



