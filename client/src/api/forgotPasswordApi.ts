import axios from "axios";
import { ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";

export const forgotPassword = async (data: ForgotPasswordFormData) => {
  const res = await axios.post(
    "http://localhost:5000/api/auth/forgot-password",
    data
  );

  return res.data;
};