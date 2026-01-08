import axios from "axios";

let TOKEN = "";

export const getShiprocketToken = async () => {
  if (TOKEN) return TOKEN;

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SR_EMAIL,
      password: process.env.SR_PASSWORD
    }
  );

  TOKEN = res.data.token;
  return TOKEN;
};
