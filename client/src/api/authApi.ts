import axios from "axios";
import { LoginFormData } from "../schemas/loginSchema";
import { RegisterFormData } from "../schemas/registerSchema";
import { ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";
import { ProfileFormData } from "../schemas/profileSchema";
import type { StoredUser } from "@/lib/userStorage";

const apiBaseUrl = import.meta.env.VITE_CINEMA_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${apiBaseUrl}/auth`,
});

type LoginApiResult = {
  token: string;
  user: StoredUser;
};

const pickFirstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
};

const pickFirstObject = (...values: unknown[]) => {
  for (const value of values) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }

  return {};
};

export const loginApi = async (data: LoginFormData): Promise<LoginApiResult> => {
  try {
    const res = await api.post("/login", data);
    const payload = res.data ?? {};
    const nestedPayload = pickFirstObject(payload.data, payload.content, payload.result);
    const token = pickFirstString(
      payload.token,
      payload.accessToken,
      payload.access_token,
      nestedPayload.token,
      nestedPayload.accessToken,
      nestedPayload.access_token,
    );
    const user = pickFirstObject(
      payload.user,
      payload.userLogin,
      payload.account,
      nestedPayload.user,
      nestedPayload.userLogin,
      nestedPayload.account,
      nestedPayload.profile,
    );

    return { token, user };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const registerApi = async (data: RegisterFormData) => {
  try {
    const res = await api.post("/register", data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const resetPassword = async (data: {
  id: string;
  token: string;
  password: string;
}) => {
  const res = await api.post("/reset-password",data);

  return res.data;
};

export const activateAccount = async (token: any) => {
  const res = await api.post(`/activate-account`, { token });

  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordFormData) => {
  const res = await api.post("/forgot-password",data);

  return res.data;
};

export const updateProfileApi = async (userId: string, data: ProfileFormData) => {
  try {
    const res = await api.put(`/profile/${userId}`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Update profile failed");
  }
};
