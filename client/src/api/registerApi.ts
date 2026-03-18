import axios from "axios";
import { RegisterFormData } from "../schemas/registerSchema";

export const registerApi = async (data: RegisterFormData) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/register", data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};