import axios from "axios";
import { LoginFormData } from "../schemas/loginSchema";
import { RegisterFormData } from "../schemas/registerSchema";
import { ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";

const api = axios.create({ baseURL: "http://localhost:5000/api/auth" })

export const loginApi = async (data: LoginFormData) => {
  try {
    const res = await api.post("/login", data);
    return res.data;
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