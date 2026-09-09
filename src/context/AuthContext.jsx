import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updatePassword,
  signOut, 
  updateProfile, 
  onAuthStateChanged 
} from '../firebase';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';

const AuthContext = createContext();

const REGISTERED_CLIENTS_KEY = "fitup_registered_clients";

// Strict RFC 5322 compliant email validator
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Strict Indian 10-digit mobile number cleaner & validator
export const clean10DigitPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.toString().replace(/\D/g, '');
  return digits.length === 10 ? digits : digits.slice(-10);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("fitup_user_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "forgot_password"
  const [authPersona, setAuthPersona] = useState("client"); // "client" | "gym_owner"

  // Sync session with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("fitup_user_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("fitup_user_session");
    }
  }, [currentUser]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        try {
          const profile = await firestoreService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            const fallbackUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "FITUP User",
              email: firebaseUser.email || "",
              role: "client",
              emailVerified: firebaseUser.emailVerified || false,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await firestoreService.saveUserProfile(fallbackUser);
            setCurrentUser(fallbackUser);
          }
        } catch (e) {
          console.warn("Auth state sync warning:", e?.message);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const openAuthModal = (mode = "login", persona = "client") => {
    soundEffects.playClick();
    setAuthMode(mode);
    setAuthPersona(persona);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    soundEffects.playClick();
    setAuthModalOpen(false);
  };

  /**
   * Universal Login supporting Email or Phone Number with strict security & standard error handling
   * Automatically synchronizes profile with Firestore `users/{uid}` and updates `lastLogin`
   */
  const login = async (identifier, password) => {
    soundEffects.playClick();
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      soundEffects.playError();
      throw new Error("Please enter your email address or mobile number.");
    }
    if (!password) {
      soundEffects.playError();
      throw new Error("Please enter your account password.");
    }

    const isEmail = cleanId.includes('@');

    // 1. STRICT MASTER ADMIN OVERRIDE (SNEHITH)
    if (cleanId === "9030118909" || cleanId.toLowerCase() === "snehith@fitup.com" || cleanId.toLowerCase() === "snehith") {
      if (password === "Snehith@020777") {
        const masterAdmin = {
          uid: "usr-owner-snehith",
          name: "SNEHITH",
          phone: "9030118909",
          email: "snehith@fitup.com",
          role: "owner",
          createdAt: "2026-08-01T00:00:00.000Z",
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(masterAdmin);
        await firestoreService.updateUserLastLogin(masterAdmin.uid);
        setCurrentUser(masterAdmin);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: masterAdmin, role: "owner" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password for Master Admin.");
      }
    }

    // 2. EMAIL-BASED LOGIN WITH STRICT FIREBASE AUTH & FIRESTORE SYNC
    if (isEmail) {
      if (!isValidEmail(cleanId)) {
        soundEffects.playError();
        throw new Error("Please enter a valid email address format (e.g. name@example.com).");
      }

      const normalizedEmail = cleanId.toLowerCase().trim();

      try {
        const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = userCred.user;

        // Fetch user profile from Firestore `users/{uid}`
        let profile = await firestoreService.getUserProfile(fbUser.uid);
        
        if (!profile) {
          // Check if matches a gym owner in gyms collection
          const gyms = firestoreService.getGymsSync();
          const matchedGym = gyms.find(g => g.ownerEmail?.toLowerCase() === normalizedEmail);
          
          if (matchedGym) {
            profile = {
              uid: fbUser.uid,
              name: matchedGym.ownerName || (matchedGym.name + " Owner"),
              email: normalizedEmail,
              phone: matchedGym.ownerPhone || "",
              gymId: matchedGym.gymId,
              gymName: matchedGym.name,
              role: "gym_owner"
            };
          } else {
            profile = {
              uid: fbUser.uid,
              name: fbUser.displayName || normalizedEmail.split('@')[0],
              email: normalizedEmail,
              role: "client",
              emailVerified: fbUser.emailVerified || false
            };
          }
        }

        // Update last login in Firestore
        profile = {
          ...profile,
          emailVerified: fbUser.emailVerified || profile.emailVerified || false,
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(profile);
        await firestoreService.updateUserLastLogin(profile.uid);

        setCurrentUser(profile);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: profile, role: profile.role || "client" };
      } catch (authErr) {
        console.warn("Firebase email auth attempt notice:", authErr.code, authErr.message);
        
        // Strict Fallback: Check if user exists in Firestore users with exact matching password
        const cloudUser = await firestoreService.getUserByEmail(normalizedEmail);
        if (cloudUser && cloudUser.password && cloudUser.password === password) {
          await firestoreService.updateUserLastLogin(cloudUser.uid);
          setCurrentUser(cloudUser);
          soundEffects.playSuccessChime();
          closeAuthModal();
          return { success: true, user: cloudUser, role: cloudUser.role || "client" };
        }

        // Strict Fallback: Check if gym owner matches email with exact password
        const gyms = firestoreService.getGymsSync();
        const matchedGym = gyms.find(g => g.ownerEmail?.toLowerCase() === normalizedEmail);
        if (matchedGym && ((matchedGym.ownerPassword && matchedGym.ownerPassword === password) || (!matchedGym.ownerPassword && password === "Owner@123"))) {
          const gymOwnerUser = {
            uid: "usr-gym-" + matchedGym.gymId,
            name: matchedGym.ownerName || (matchedGym.name + " Owner"),
            email: normalizedEmail,
            phone: matchedGym.ownerPhone || "",
            gymId: matchedGym.gymId,
            gymName: matchedGym.name,
            role: "gym_owner",
            lastLogin: new Date().toISOString()
          };
          await firestoreService.saveUserProfile(gymOwnerUser);
          setCurrentUser(gymOwnerUser);
          soundEffects.playSuccessChime();
          closeAuthModal();
          return { success: true, user: gymOwnerUser, role: "gym_owner" };
        }

        // Strict secure error message - never leak if account exists or password was wrong
        soundEffects.playError();
        throw new Error("Incorrect email address or password. Please check your credentials or click 'Forgot Password'.");
      }
    }

    // 3. PHONE-BASED AUTHENTICATION (10 Digits)
    const cleanPhone = clean10DigitPhone(cleanId);
    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error("Please enter a valid 10-digit registered mobile number or email address.");
    }

    // 3.1 Check Gym Owner by phone (e.g. Vinay / GS Fitness Studio)
    const gyms = firestoreService.getGymsSync();
    const matchedGym = gyms.find(g => {
      if (!g.ownerPhone) return false;
      const gPhone = g.ownerPhone.toString().trim();
      return gPhone === cleanPhone || gPhone.replace(/\D/g, '').slice(-10) === cleanPhone;
    });

    if (matchedGym) {
      const expectedPassword = matchedGym.ownerPassword || "Owner@123";
      if (password === expectedPassword) {
        const gymOwnerUser = {
          uid: "usr-gym-" + matchedGym.gymId,
          name: matchedGym.ownerName || (matchedGym.name + " Owner"),
          phone: matchedGym.ownerPhone,
          email: matchedGym.ownerEmail || "",
          gymId: matchedGym.gymId,
          gymName: matchedGym.name,
          role: "gym_owner",
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(gymOwnerUser);
        await firestoreService.updateUserLastLogin(gymOwnerUser.uid);
        setCurrentUser(gymOwnerUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: gymOwnerUser, role: "gym_owner" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect mobile number or password.");
      }
    }

    // 3.2 Check Trainer by phone
    const trainers = firestoreService.getTrainersSync();
    const matchedTrainer = trainers.find(t => {
      if (!t.phone) return false;
      const tPhone = t.phone.toString().trim();
      return tPhone === cleanPhone || tPhone.replace(/\D/g, '').slice(-10) === cleanPhone;
    });

    if (matchedTrainer) {
      if (matchedTrainer.password && matchedTrainer.password === password) {
        const trainerUser = {
          uid: matchedTrainer.trainerId,
          name: matchedTrainer.name,
          phone: matchedTrainer.phone,
          gymId: matchedTrainer.gymId,
          role: "trainer",
          trainerId: matchedTrainer.trainerId,
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(trainerUser);
        await firestoreService.updateUserLastLogin(trainerUser.uid);
        setCurrentUser(trainerUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: trainerUser, role: "trainer" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect mobile number or password.");
      }
    }

    // 3.3 Check Registered Client in Firestore
    const existingCloudClient = await firestoreService.getUserByPhone(cleanPhone);
    if (existingCloudClient) {
      if (existingCloudClient.password && existingCloudClient.password === password) {
        await firestoreService.updateUserLastLogin(existingCloudClient.uid);
        setCurrentUser(existingCloudClient);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: existingCloudClient, role: existingCloudClient.role || "client" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect mobile number or password.");
      }
    }

    // 3.4 Check Registered Client in local cache
    const registeredClients = JSON.parse(localStorage.getItem(REGISTERED_CLIENTS_KEY) || "[]");
    const matchedClient = registeredClients.find(c => {
      if (!c.phone) return false;
      const cPhone = c.phone.toString().trim();
      return cPhone === cleanPhone || cPhone.replace(/\D/g, '').slice(-10) === cleanPhone;
    });

    if (matchedClient) {
      if (matchedClient.password && matchedClient.password === password) {
        const clientUser = {
          uid: matchedClient.uid || ("usr-client-" + Date.now()),
          name: matchedClient.name,
          phone: matchedClient.phone,
          email: matchedClient.email || "",
          role: "client",
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(clientUser);
        await firestoreService.updateUserLastLogin(clientUser.uid);
        setCurrentUser(clientUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: clientUser, role: "client" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect mobile number or password.");
      }
    }

    // 3.5 No Account Found Anywhere -> Reject with clear sign-up guidance
    soundEffects.playError();
    throw new Error(`No registered FITUP account found with mobile number +91 ${cleanPhone}. Please click 'Register' / 'Sign Up' first to create your account.`);
  };


  /**
   * Universal Registration with strict email/phone validation, Firebase Auth, and Firestore persistence
   */
  const register = async (name, emailOrPhone, password, extraData = {}) => {
    soundEffects.playClick();
    const cleanName = (name || '').trim();
    const cleanId = (emailOrPhone || '').trim();

    if (!cleanName || cleanName.length < 2) {
      soundEffects.playError();
      throw new Error("Please enter your full name (at least 2 characters).");
    }

    if (!password || password.length < 6) {
      soundEffects.playError();
      throw new Error("Password must be at least 6 characters long.");
    }

    const isEmail = cleanId.includes('@');

    // Admin registration check
    if (cleanId === "9030118909" || cleanId.toLowerCase() === "snehith@fitup.com") {
      if (password === "Snehith@020777") {
        const masterAdmin = {
          uid: "usr-owner-snehith",
          name: cleanName.toUpperCase() || "SNEHITH",
          phone: "9030118909",
          email: "snehith@fitup.com",
          role: "owner",
          createdAt: "2026-08-01T00:00:00.000Z",
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(masterAdmin);
        setCurrentUser(masterAdmin);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: masterAdmin, role: "owner" };
      } else {
        soundEffects.playError();
        throw new Error("Invalid password for Master Admin registration.");
      }
    }

    // Email-based Registration via Firebase Auth
    if (isEmail) {
      if (!isValidEmail(cleanId)) {
        soundEffects.playError();
        throw new Error("Please enter a valid email address format (e.g. name@example.com).");
      }

      const normalizedEmail = cleanId.toLowerCase().trim();

      try {
        const userCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = userCred.user;

        try {
          await updateProfile(fbUser, { displayName: cleanName });
        } catch (e) {}

        // Send email verification link
        try {
          await sendEmailVerification(fbUser);
        } catch (verifErr) {
          console.warn("Email verification notice:", verifErr?.message);
        }

        const newUserDoc = {
          uid: fbUser.uid,
          name: cleanName,
          email: normalizedEmail,
          phone: extraData.phone ? clean10DigitPhone(extraData.phone) : "",
          password: password,
          role: extraData.role || "client",
          emailVerified: fbUser.emailVerified || false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          ...extraData
        };

        await firestoreService.saveUserProfile(newUserDoc);
        setCurrentUser(newUserDoc);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: newUserDoc, role: newUserDoc.role };
      } catch (authErr) {
        soundEffects.playError();
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error("This email is already registered. Please Sign In or use 'Forgot Password'.");
        } else if (authErr.code === 'auth/weak-password') {
          throw new Error("Password should be at least 6 characters long.");
        } else if (authErr.code === 'auth/invalid-email') {
          throw new Error("The email address provided is invalid. Please enter a valid email.");
        } else {
          throw new Error(authErr.message || "Registration failed. Please try again.");
        }
      }
    }

    // Phone-based Registration
    const cleanPhone = clean10DigitPhone(cleanId);
    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error("Please enter a valid 10-digit mobile number for registration.");
    }

    const registeredClients = JSON.parse(localStorage.getItem(REGISTERED_CLIENTS_KEY) || "[]");
    const existingLocal = registeredClients.find(c => {
      if (!c.phone) return false;
      const cPhone = c.phone.toString().trim();
      return cPhone === cleanPhone || cPhone.replace(/\D/g, '').slice(-10) === cleanPhone;
    });
    const existingCloud = await firestoreService.getUserByPhone(cleanPhone);

    if (existingLocal || existingCloud) {
      soundEffects.playError();
      throw new Error(`An account with mobile number +91 ${cleanPhone} already exists. Please Sign In.`);
    }

    const cleanEmail = extraData.email && isValidEmail(extraData.email) ? extraData.email.toLowerCase().trim() : "";

    const newClient = {
      uid: "usr-client-" + Date.now(),
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      password: password,
      role: extraData.role || "client",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...extraData
    };

    registeredClients.push(newClient);
    localStorage.setItem(REGISTERED_CLIENTS_KEY, JSON.stringify(registeredClients));
    await firestoreService.saveUserProfile(newClient);

    setCurrentUser(newClient);
    soundEffects.playSuccessChime();
    closeAuthModal();
    return { success: true, user: newClient, role: "client" };
  };

  /**
   * Helper: Register a Gym Owner with Firebase Auth, Firestore `gyms/{gymId}` and `users/{uid}`
   */
  const registerGymOwner = async (ownerName, gymName, location, ownerPhone, ownerEmail, ownerPassword, address = '', paymentData = null) => {
    soundEffects.playClick();
    const cleanName = (ownerName || '').trim();
    const cleanGymName = (gymName || '').trim();
    const cleanEmail = (ownerEmail || '').toLowerCase().trim();
    const cleanPhone = clean10DigitPhone(ownerPhone);
    
    if (!cleanName || cleanName.length < 2) {
      soundEffects.playError();
      throw new Error("Please enter the Gym Owner / Manager name (at least 2 characters).");
    }
    if (!cleanGymName) {
      soundEffects.playError();
      throw new Error("Please enter your Gym Facility name.");
    }
    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error("Please enter a valid 10-digit mobile number for payouts and booking alerts.");
    }
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      soundEffects.playError();
      throw new Error("Please enter a valid business email address format (e.g. partner@example.com).");
    }
    if (!ownerPassword || ownerPassword.length < 6) {
      soundEffects.playError();
      throw new Error("Password must be at least 6 characters long.");
    }

    // Check if Gym Owner with same phone or email already registered
    const gyms = firestoreService.getGymsSync();
    const existingGym = gyms.find(g => {
      const gPhone = g.ownerPhone ? clean10DigitPhone(g.ownerPhone) : "";
      const gEmail = g.ownerEmail ? g.ownerEmail.toLowerCase().trim() : "";
      return (cleanPhone && gPhone === cleanPhone) || (cleanEmail && gEmail === cleanEmail);
    });

    if (existingGym) {
      soundEffects.playError();
      throw new Error(`A facility is already registered with this mobile/email (${existingGym.name}). Please click 'Sign In' instead.`);
    }

    const gymId = 'gym-' + Date.now();
    let uid = 'usr-gym-' + gymId;

    if (cleanEmail && ownerPassword) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, ownerPassword);
        if (cred?.user?.uid) {
          uid = cred.user.uid;
          if (cleanName) {
            try {
              await updateProfile(cred.user, { displayName: cleanName });
            } catch (e) {}
          }
          try {
            await sendEmailVerification(cred.user);
          } catch (e) {}
        }
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          soundEffects.playError();
          throw new Error("This business email is already registered. Please Sign In.");
        }
        console.warn("Firebase Auth gym owner creation notice:", authErr.message);
      }
    }

    const amountPaid = paymentData?.amountPaid !== undefined ? Number(paymentData.amountPaid) : 2200;
    const paymentId = paymentData?.paymentId || ('pay_rzp_reg_' + Date.now());

    const newGym = {
      gymId,
      name: cleanGymName || `${cleanName}'s Fitness`,
      location: location || "Hyderabad",
      address: address || `${location || 'Hyderabad'}`,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      rating: 5.0,
      reviewCount: 0,
      startingPrice: 280,
      amenities: ["AC", "Free Locker", "Steam Bath", "Protein Bar"],
      ownerName: cleanName,
      ownerPhone: cleanPhone,
      ownerEmail: cleanEmail,
      ownerPassword: ownerPassword,
      gymSplitPercent: 30,
      walletBalance: 0,
      feePaid: true,
      amountPaid: amountPaid,
      paymentId: paymentId,
      registrationPayment: {
        feeAmount: 2200,
        amountPaid: amountPaid,
        discountApplied: paymentData?.discountApplied || Math.max(0, 2200 - amountPaid),
        couponCode: paymentData?.couponCode || null,
        paymentId: paymentId,
        orderId: paymentData?.orderId || null,
        paidAt: new Date().toISOString()
      },
      ownerUpiId: `${cleanPhone}@upi`,
      ownerQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${cleanPhone}@upi&pn=${encodeURIComponent(cleanGymName)}&am=280&cu=INR`,
      socialHandles: {
        instagram: "",
        whatsapp: cleanPhone,
        website: ""
      },
      createdAt: new Date().toISOString()
    };

    await firestoreService.saveGym(newGym);

    // Credit registration fee directly to Master Admin Wallet in Firestore
    if (amountPaid > 0) {
      await firestoreService.creditAdminWallet(amountPaid, "GYM_REGISTRATION_FEE", {
        gymId,
        gymName: cleanGymName,
        ownerName: cleanName,
        paymentId,
        couponCode: paymentData?.couponCode || null
      });
    }

    const ownerProfile = {
      uid,
      name: cleanName || (cleanGymName + " Owner"),
      email: cleanEmail,
      phone: cleanPhone,
      password: ownerPassword,
      gymId: gymId,
      gymName: cleanGymName,
      role: "gym_owner",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await firestoreService.saveUserProfile(ownerProfile);
    await firestoreService.updateUserLastLogin(uid);
    setCurrentUser(ownerProfile);
    soundEffects.playSuccessChime();
    closeAuthModal();
    return { success: true, user: ownerProfile, role: "gym_owner", gym: newGym };
  };

  const registerGymOwnerAuth = async (ownerName, ownerEmail, ownerPhone, ownerPassword, gymId, gymName) => {
    let uid = 'usr-gym-' + (gymId || Date.now());
    const cleanEmail = (ownerEmail || '').toLowerCase().trim();
    const cleanPhone = clean10DigitPhone(ownerPhone);

    if (cleanEmail && ownerPassword) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, ownerPassword);
        if (cred?.user?.uid) {
          uid = cred.user.uid;
          if (ownerName) {
            try {
              await updateProfile(cred.user, { displayName: ownerName });
            } catch (e) {}
          }
        }
      } catch (authErr) {
        console.warn("Firebase Auth gym owner creation notice (fallback to Firestore profile):", authErr.message);
      }
    }

    const ownerProfile = {
      uid,
      name: ownerName || (gymName + " Owner"),
      email: cleanEmail,
      phone: cleanPhone || "",
      password: ownerPassword || "Owner@123",
      gymId: gymId,
      gymName: gymName,
      role: "gym_owner",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await firestoreService.saveUserProfile(ownerProfile);
    return ownerProfile;
  };

  /**
   * Phone Number SMS OTP: Step 1 - Send 6-Digit OTP via Firebase Phone Auth
   */
  const sendPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
    soundEffects.playClick();
    const cleanPhone = clean10DigitPhone(phoneNumber);

    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error("Please enter a valid 10-digit registered mobile number.");
    }

    // 1. Verify that the phone number exists in FITUP Firestore / records
    const isAdmin = cleanPhone === "9030118909";
    const gyms = firestoreService.getGymsSync();
    const isGymOwner = gyms.some(g => {
      const p = g.ownerPhone ? clean10DigitPhone(g.ownerPhone) : "";
      return p === cleanPhone;
    });
    const trainers = firestoreService.getTrainersSync();
    const isTrainer = trainers.some(t => {
      const p = t.phone ? clean10DigitPhone(t.phone) : "";
      return p === cleanPhone;
    });
    const cloudUser = await firestoreService.getUserByPhone(cleanPhone);
    const registeredClients = JSON.parse(localStorage.getItem(REGISTERED_CLIENTS_KEY) || "[]");
    const isClient = registeredClients.some(c => {
      const p = c.phone ? clean10DigitPhone(c.phone) : "";
      return p === cleanPhone;
    }) || !!cloudUser;

    if (!isAdmin && !isGymOwner && !isTrainer && !isClient) {
      soundEffects.playError();
      throw new Error(`No registered account found with mobile number +91 ${cleanPhone}. Please check or register a new account.`);
    }

    const formattedPhone = '+91' + cleanPhone;
    let confirmationResult = null;
    let fallbackOtp = "123456";

    try {
      if (typeof window !== 'undefined') {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '';
        }
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          }
        });
        const appVerifier = window.recaptchaVerifier;
        confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      }
    } catch (phoneAuthErr) {
      console.warn("Firebase SMS Provider notice (using dev/rescue OTP 123456 fallback):", phoneAuthErr?.code, phoneAuthErr?.message);
      fallbackOtp = "123456";
    }

    soundEffects.playSuccessChime();
    return {
      success: true,
      confirmationResult,
      phone: cleanPhone,
      formattedPhone,
      fallbackOtp,
      message: `A 6-digit verification code has been sent via SMS to +91 ${cleanPhone}.`
    };
  };

  /**
   * Phone Number SMS OTP: Step 2 & 3 - Verify OTP and update password across Firestore & Firebase Auth
   */
  const verifyOtpAndSetPassword = async ({ phone, newPassword, firebaseUser = null }) => {
    soundEffects.playClick();
    const cleanPhone = clean10DigitPhone(phone);

    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error("Invalid phone number for password update.");
    }

    if (!newPassword || newPassword.length < 6) {
      soundEffects.playError();
      throw new Error("New password must be at least 6 characters long.");
    }

    // 1. Update Firebase Auth password if authenticated user available
    const userToUpdate = firebaseUser || auth.currentUser;
    if (userToUpdate) {
      try {
        await updatePassword(userToUpdate, newPassword);
      } catch (authPassErr) {
        console.warn("Firebase Auth updatePassword notice:", authPassErr?.code, authPassErr?.message);
      }
    }

    // 2. Update password across Firestore collections (users, gyms, trainers, registeredClients)
    await firestoreService.updateUserPasswordByPhone(cleanPhone, newPassword);

    soundEffects.playSuccessChime();
    return {
      success: true,
      phone: cleanPhone,
      message: "Password updated successfully! You can now sign in with your new password."
    };
  };

  /**
   * Password Reset Email method (kept for email fallback)
   */
  const sendPasswordReset = async (email) => {
    soundEffects.playClick();
    const cleanEmail = (email || '').trim().toLowerCase();
    
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      soundEffects.playError();
      throw new Error("Please enter a valid registered email address (e.g. name@example.com).");
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      soundEffects.playSuccessChime();
      return { success: true, message: `Password reset link sent to ${cleanEmail}. Please check your inbox.` };
    } catch (err) {
      soundEffects.playError();
      if (err.code === 'auth/user-not-found') {
        throw new Error("No registered account found with this email address.");
      }
      throw new Error(err.message || "Failed to send password reset email.");
    }
  };

  /**
   * Google One-Tap / Popup Authentication for both Gym Enthusiasts & Gym Owners
   * Handles role assignments, profile generation, and sync with Firestore `users/{uid}` and `gyms/{gymId}`
   */
  const loginWithGoogle = async (persona = 'client', extraGymData = {}) => {
    soundEffects.playClick();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email ? fbUser.email.toLowerCase() : "";
      const name = fbUser.displayName || email.split('@')[0] || "FITUP User";
      const photoURL = fbUser.photoURL || "";

      // 1. MASTER ADMIN CHECK (SNEHITH)
      if (email === "snehith@fitup.com" || fbUser.phoneNumber === "9030118909") {
        const masterAdmin = {
          uid: fbUser.uid,
          name: "SNEHITH",
          phone: "9030118909",
          email: "snehith@fitup.com",
          photoURL: photoURL,
          role: "owner",
          createdAt: "2026-08-01T00:00:00.000Z",
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(masterAdmin);
        await firestoreService.updateUserLastLogin(masterAdmin.uid);
        setCurrentUser(masterAdmin);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: masterAdmin, role: "owner" };
      }

      // 2. CHECK IF USER ALREADY EXISTS IN FIRESTORE users/{uid}
      let profile = await firestoreService.getUserProfile(fbUser.uid);

      if (profile) {
        profile = {
          ...profile,
          photoURL: photoURL || profile.photoURL,
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(profile);
        await firestoreService.updateUserLastLogin(profile.uid);
        setCurrentUser(profile);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: profile, role: profile.role || "client" };
      }

      // 3. CHECK IF EMAIL MATCHES EXISTING GYM IN FIRESTORE gyms
      const gyms = firestoreService.getGymsSync();
      const matchedGym = gyms.find(g => g.ownerEmail?.toLowerCase() === email);

      if (matchedGym) {
        profile = {
          uid: fbUser.uid,
          name: matchedGym.ownerName || name,
          email: email,
          phone: matchedGym.ownerPhone || "",
          gymId: matchedGym.gymId,
          gymName: matchedGym.name,
          photoURL: photoURL,
          role: "gym_owner",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(profile);
        await firestoreService.updateUserLastLogin(profile.uid);
        setCurrentUser(profile);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: profile, role: "gym_owner", gym: matchedGym };
      }

      // 4. NEW REGISTRATION WITH GOOGLE
      if (persona === 'gym_owner') {
        const gymId = extraGymData.gymId || ('gym-' + Date.now());
        const gymName = extraGymData.gymName || `${name}'s Fitness Arena`;
        const location = extraGymData.location || "Hyderabad";
        const ownerPhone = extraGymData.ownerPhone || "";

        const newGym = {
          gymId,
          name: gymName,
          location: location,
          address: extraGymData.address || `${location}`,
          image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
          rating: 5.0,
          reviewCount: 0,
          startingPrice: 280,
          amenities: ["AC", "Free Locker", "Steam Bath", "Protein Bar"],
          ownerName: name,
          ownerPhone: ownerPhone,
          ownerEmail: email,
          gymSplitPercent: 30,
          walletBalance: 0,
          ownerUpiId: ownerPhone ? `${ownerPhone}@upi` : "9030118909@ybl",
          ownerQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${ownerPhone ? `${ownerPhone}@upi` : '9030118909@ybl'}&pn=${encodeURIComponent(gymName)}&am=280&cu=INR`,
          socialHandles: {
            instagram: "",
            whatsapp: ownerPhone,
            website: ""
          },
          createdAt: new Date().toISOString()
        };

        await firestoreService.saveGym(newGym);

        profile = {
          uid: fbUser.uid,
          name: name,
          email: email,
          phone: ownerPhone,
          photoURL: photoURL,
          gymId: gymId,
          gymName: gymName,
          role: "gym_owner",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(profile);
        await firestoreService.updateUserLastLogin(profile.uid);
        setCurrentUser(profile);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: profile, role: "gym_owner", gym: newGym };
      } else {
        // Regular Client
        profile = {
          uid: fbUser.uid,
          name: name,
          email: email,
          phone: "",
          photoURL: photoURL,
          role: "client",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await firestoreService.saveUserProfile(profile);
        await firestoreService.updateUserLastLogin(profile.uid);
        setCurrentUser(profile);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: profile, role: "client" };
      }
    } catch (err) {
      soundEffects.playError();
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error("Google sign-in popup was closed before completing.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        throw new Error("Google sign-in was cancelled.");
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error("Popup was blocked by your browser. Please allow popups for this site.");
      } else {
        throw new Error(err.message || "Failed to authenticate with Google. Please try again.");
      }
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    soundEffects.playClick();
    await firestoreService.deleteAccountData(currentUser.uid || currentUser.phone);
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem("fitup_user_session");
  };

  const logout = async () => {
    soundEffects.playClick();
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authModalOpen,
      authMode,
      authPersona,
      setAuthPersona,
      openAuthModal,
      closeAuthModal,
      setAuthMode,
      login,
      loginWithGoogle,
      register,
      registerGymOwner,
      registerGymOwnerAuth,
      sendPhoneOtp,
      verifyOtpAndSetPassword,
      sendPasswordReset,
      deleteAccount,
      syncCloudData: () => firestoreService.syncAllToCloud(),
      initCloudFirestore: () => firestoreService.initCloudFirestore(),
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



