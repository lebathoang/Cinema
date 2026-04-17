import axios from "axios";
import { LoginFormData } from "../schemas/loginSchema";
import { RegisterFormData } from "../schemas/registerSchema";
import { ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";
import { ProfileFormData } from "../schemas/profileSchema";
import { ChangePasswordFormData } from "../schemas/changePasswordSchema";
import type { StoredUser } from "@/lib/userStorage";
import { API_BASE_URL } from "./apiBaseUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

const userApi = axios.create({
  baseURL: `${API_BASE_URL}/user`,
});

const attachAuthToken = (config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
};

api.interceptors.request.use(attachAuthToken);
userApi.interceptors.request.use(attachAuthToken);

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
    return {
      ...res.data,
      user:
        res.data?.user ??
        res.data?.data ??
        res.data?.profile ??
        null,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Update profile failed");
  }
};

export const changePasswordApi = async (
  userId: string,
  data: ChangePasswordFormData,
) => {
  try {
    const res = await userApi.put("/change-password", {
      userId,
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Change password failed");
  }
};
