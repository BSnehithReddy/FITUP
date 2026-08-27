/* ==========================================================================
   FITUP - Restored Seed Data (Gyms, Trainers, Slots, Bookings)
   ========================================================================== */

const INITIAL_DATA = {
    // Default Gyms Directory
    gyms: [
        {
            id: "gym-1",
            name: "GS - Gym",
            location: "Downtown",
            address: "Plot 42, Main Road, Downtown Fitness Hub",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            startingPrice: 200,
            amenities: ["AC", "Free Weights", "Steam Room", "Cardio Zone", "Personal Training"],
            description: "GS-Gym is an elite strength & conditioning facility equipped with international grade machines and top certified trainers."
        },
        {
            id: "gym-2",
            name: "Cult Fit Center",
            location: "Westside",
            address: "Building 9, Westside Commercial Complex",
            image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            startingPrice: 200,
            amenities: ["CrossFit", "HRX Workout", "Yoga Studio", "AC"],
            description: "Modern fitness studio offering group workouts, functional fitness, and dedicated 1-on-1 personal coaching slots."
        },
        {
            id: "gym-3",
            name: "Gold's Gym Elite",
            location: "Central",
            address: "Block B, Central Park Avenue",
            image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            startingPrice: 250,
            amenities: ["Heavy Squat Racks", "Nutritional Bar", "Sauna", "Locker Room"],
            description: "The Mecca of Bodybuilding. World-class equipment for muscle gain, fat loss, and athletic performance."
        }
    ],

    // Default Trainers
    trainers: [
        {
            id: "tr-1",
            gymId: "gym-1",
            name: "Trainer-1 / Vikram Sharma",
            phone: "9030118909",
            specialization: "Hypertrophy & Bodybuilding",
            experience: "6 Years Experience • K11 Certified",
            price: 200,
            image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80"
        },
        {
            id: "tr-2",
            gymId: "gym-1",
            name: "Trainer-2 / Rajesh Kumar",
            phone: "9848022334",
            specialization: "Fat Loss & Athletic Conditioning",
            experience: "4 Years Experience • ACE Certified",
            price: 200,
            image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80"
        },
        {
            id: "tr-3",
            gymId: "gym-1",
            name: "Trainer-3 / Ananya Reddy",
            phone: "9701122334",
            specialization: "Functional Strength & Mobility",
            experience: "5 Years Experience • Fitness Specialist",
            price: 250,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80"
        }
    ],

    // Default 2-Hour Time Slots
    slots: [
        { id: "slot-1", time: "06:00 AM - 08:00 AM", category: "Morning" },
        { id: "slot-2", time: "09:00 AM - 11:00 AM", category: "Morning" },
        { id: "slot-3", time: "11:00 AM - 01:00 PM", category: "Mid-day" },
        { id: "slot-4", time: "02:00 PM - 04:00 PM", category: "Afternoon" },
        { id: "slot-5", time: "04:00 PM - 06:00 PM", category: "Evening" },
        { id: "slot-6", time: "06:00 PM - 08:00 PM", category: "Evening" },
        { id: "slot-7", time: "08:00 PM - 10:00 PM", category: "Night" }
    ],

    // Seed Bookings
    bookings: [
        {
            id: "FT-903001",
            userName: "SNEHITH",
            userPhone: "9030118909",
            gymId: "gym-1",
            gymName: "GS - Gym",
            trainerId: "tr-1",
            trainerName: "Trainer-1 / Vikram Sharma",
            trainerPhone: "9030118909",
            date: "2026-08-25",
            slotTime: "09:00 AM - 11:00 AM",
            price: 200,
            status: "VERIFIED",
            txnId: "UTR-903011890999",
            screenshotUrl: null,
            createdAt: "2026-08-25T10:30:00.000Z"
        }
    ]
};
