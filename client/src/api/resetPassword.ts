import axios from "axios";

export const resetPassword = async (data: {
  id: string;
  token: string;
  password: string;
}) => {
  const res = await axios.post(
    "http://localhost:5000/api/auth/reset-password",
    data
  );

  return res.data;
};