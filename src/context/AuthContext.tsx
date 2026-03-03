// src/context/AuthContext.tsx
import socket from "../socket";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  semester?: string;
  department?: string;
  githubUrl?: string;
  hackathonsParticipated?: number;
  photoUrl?: string;
  projects?: Array<{
    title: string;
    description?: string;
    techStack?: string[];
    files?: Array<{ name?: string; type?: string; size?: number; dataUrl?: string }>;
    link?: string;
    visibility?: "Public" | "Private";
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    skills: string[];
    semester?: string;
    department?: string;
    githubUrl?: string;
    hackathonsParticipated?: number;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = axios.create({
  baseURL: API_BASE_URL,
});

/* ✅ AUTO ATTACH TOKEN TO EVERY REQUEST */
API.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  }
  return config;
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  // 👇 ADD SOCKET JOIN HERE
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
      console.log("Joined socket room:", user._id);
    }
  }, [user]);
  /* ✅ Fetch profile only if token exists */
  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;

      try {
        const res = await API.get("/api/profile");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err: any) {
        if (axios.isAxiosError(err) && !err.response) {
          console.error(`Profile fetch failed: Cannot reach backend at ${API_BASE_URL}`);
        } else {
          console.error("Profile fetch failed:", err.response?.data || err.message);
        }
        // ❌ NO logout here
      }
    };

    fetchProfile();
  }, []);

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    skills: string[];
    semester?: string;
    department?: string;
    githubUrl?: string;
    hackathonsParticipated?: number;
  }) => {
    await API.post("/api/register", data);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await API.post("/api/login", {
        email: email.trim(),
        password: password.trim(),
      });

      console.log("LOGIN RESPONSE:", res.data);

      const newToken = res.data.token;
      console.log("TOKEN FROM SERVER:", newToken);

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log("TOKEN IN STORAGE:", localStorage.getItem("token"));

      setToken(newToken);
      setUser(res.data.user);

    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await API.put("/api/profile", updates);
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await API.put("/api/change-password", {
        currentPassword,
        newPassword,
      });

      alert(res.data.message || "Password changed successfully!");
      logout();

    } catch (err: any) {
      alert(err.response?.data?.message || "Password change failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
