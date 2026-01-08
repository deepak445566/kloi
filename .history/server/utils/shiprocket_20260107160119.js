import axios from "axios";

let TOKEN = "";

export const generateShiprocketToken = async () => {
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SR_EMAIL,
      password: process.env.SR_PASSWORD
    }
  );
  TOKEN = res.data.token;
};

export const shiprocketRequest = axios.create({
  baseURL: "https://apiv2.shiprocket.in/v1/external",
  headers: {
    "Content-Type": "application/json",
    Authorization: () => `Bearer ${TOKEN}`
  }
});
