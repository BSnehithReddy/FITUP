import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';

const AuthContext = createContext();

const REGISTERED_CLIENTS_KEY = "fitup_registered_clients";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("fitup_user_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("fitup_user_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("fitup_user_session");
    }
  }, [currentUser]);

  const openAuthModal = (mode = "login") => {
    soundEffects.playClick();
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    soundEffects.playClick();
    setAuthModalOpen(false);
  };

  const login = async (phone, password) => {
    soundEffects.playClick();

    // 1. STRICT MASTER ADMIN CHECK (SNEHITH)
    if (phone === "9030118909") {
      if (password === "Snehith@020777") {
        const masterAdmin = {
          uid: "usr-owner-snehith",
          name: "SNEHITH",
          phone: "9030118909",
          role: "owner"
        };
        setCurrentUser(masterAdmin);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: masterAdmin, role: "owner" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password or phone number.");
      }
    }

    // 2. GYM OWNER AUTHENTICATION CHECK (e.g. Vinay / GS Fitness Studio)
    const gyms = firestoreService.getGymsSync();
    const matchedGym = gyms.find(g => g.ownerPhone === phone);

    if (matchedGym) {
      const expectedPassword = matchedGym.ownerPassword || "Owner@123";
      if (password === expectedPassword) {
        const gymOwnerUser = {
          uid: "usr-gym-" + matchedGym.gymId,
          name: matchedGym.ownerName || (matchedGym.name + " Owner"),
          phone: matchedGym.ownerPhone,
          gymId: matchedGym.gymId,
          gymName: matchedGym.name,
          role: "gym_owner"
        };
        setCurrentUser(gymOwnerUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: gymOwnerUser, role: "gym_owner" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password for Gym Owner.");
      }
    }

    // 3. TRAINER AUTHENTICATION CHECK
    const trainers = firestoreService.getTrainersSync();
    const matchedTrainer = trainers.find(t => t.phone === phone);

    if (matchedTrainer) {
      if (matchedTrainer.password === password) {
        const trainerUser = {
          uid: matchedTrainer.trainerId,
          name: matchedTrainer.name,
          phone: matchedTrainer.phone,
          gymId: matchedTrainer.gymId,
          role: "trainer",
          trainerId: matchedTrainer.trainerId
        };
        setCurrentUser(trainerUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: trainerUser, role: "trainer" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password or phone number.");
      }
    }

    // 4. REGISTERED CLIENT CHECK
    const registeredClients = JSON.parse(localStorage.getItem(REGISTERED_CLIENTS_KEY) || "[]");
    const matchedClient = registeredClients.find(c => c.phone === phone);

    if (matchedClient) {
      if (matchedClient.password === password) {
        const clientUser = {
          uid: matchedClient.uid || ("usr-client-" + Date.now()),
          name: matchedClient.name,
          phone: matchedClient.phone,
          role: "client"
        };
        setCurrentUser(clientUser);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: clientUser, role: "client" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password or phone number.");
      }
    }

    // Default Client Demo Login (Auto-registers client if credentials provided)
    const newClient = {
      uid: "usr-client-" + Date.now(),
      name: "FITUP Member",
      phone: phone,
      password: password,
      role: "client"
    };
    registeredClients.push(newClient);
    localStorage.setItem(REGISTERED_CLIENTS_KEY, JSON.stringify(registeredClients));

    setCurrentUser(newClient);
    soundEffects.playSuccessChime();
    closeAuthModal();
    return { success: true, user: newClient, role: "client" };
  };

  const register = async (name, phone, password) => {
    soundEffects.playClick();

    if (phone === "9030118909") {
      if (password === "Snehith@020777") {
        const masterAdmin = {
          uid: "usr-owner-snehith",
          name: name.toUpperCase() || "SNEHITH",
          phone: "9030118909",
          role: "owner"
        };
        setCurrentUser(masterAdmin);
        soundEffects.playSuccessChime();
        closeAuthModal();
        return { success: true, user: masterAdmin, role: "owner" };
      } else {
        soundEffects.playError();
        throw new Error("Incorrect password or phone number.");
      }
    }

    const registeredClients = JSON.parse(localStorage.getItem(REGISTERED_CLIENTS_KEY) || "[]");
    const existing = registeredClients.find(c => c.phone === phone);

    if (existing) {
      soundEffects.playError();
      throw new Error("An account with this phone number already exists. Please Sign In.");
    }

    const newClient = {
      uid: "usr-client-" + Date.now(),
      name: name,
      phone: phone,
      password: password,
      role: "client"
    };

    registeredClients.push(newClient);
    localStorage.setItem(REGISTERED_CLIENTS_KEY, JSON.stringify(registeredClients));

    setCurrentUser(newClient);
    soundEffects.playSuccessChime();
    closeAuthModal();
    return { success: true, user: newClient, role: "client" };
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    soundEffects.playClick();
    await firestoreService.deleteAccountData(currentUser.phone);
    setCurrentUser(null);
    localStorage.removeItem("fitup_user_session");
  };

  const logout = () => {
    soundEffects.playClick();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authModalOpen,
      authMode,
      openAuthModal,
      closeAuthModal,
      setAuthMode,
      login,
      register,
      deleteAccount,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
