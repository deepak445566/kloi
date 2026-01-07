import axios from "axios";

let shiprocketToken = null;

export const getShiprocketToken = async () => {
  if (shiprocketToken) return shiprocketToken;

  const { data } = await axios.post(
    `${process.env.SHIPROCKET_BASE_URL}/auth/login`,
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    }
  );

  shiprocketToken = data.token;
  return shiprocketToken;
};
