import axios from "axios";
import { LoginFormData } from "../schemas/loginSchema";

export const loginApi = async (data: LoginFormData) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};