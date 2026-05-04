const axios = require('axios');
require('dotenv').config();

const NIBSS_BASE_URL =
  process.env.NIBSS_BASE_URL ||
  'https://nibssbyphoenix.onrender.com/api';

class NibssService {
  constructor() {
    this.baseURL = NIBSS_BASE_URL;
    this.apiKey = process.env.NIBSS_API_KEY;
    this.apiSecret = process.env.NIBSS_API_SECRET;
  }

  /* ================= HEADERS ================= */
  getHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-api-secret': this.apiSecret
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /* ================= AUTH ================= */
  async getNIBBSToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/token`,
        {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      );

      console.log("🔥 AUTH RESPONSE:", response.data);

      return response.data.token;
    } catch (error) {
      console.log("❌ AUTH FAILED:", error.response?.data || error.message);
      throw new Error('Failed to get NIBSS token');
    }
  }

  /* ================= ACCOUNT ================= */
  async createAccount(kycType, kycID, dob) {
    try {
      const token = await this.getNIBBSToken(); // 🔥 GET TOKEN

      const response = await axios.post(
        `${this.baseURL}/account/create`,
        {
          kycType: kycType.toLowerCase(),
          kycID,
          dob
        },
        {
          headers: this.getHeaders(token) // 🔥 USE TOKEN
        }
      );

      return response.data;

    } catch (error) {
      throw new Error(
        `Account creation failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /* ================= BVN ================= */
  async verifyBVN(bvn) {
    try {
      const response = await axios.post(
        `${this.baseURL}/validateBvn`,
        { bvn },
        { headers: this.getHeaders() }
      );

      return response.data;

    } catch (error) {
      throw new Error(
        `BVN verification failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /* ================= NIN ================= */
  async verifyNIN(nin) {
    try {
      const response = await axios.post(
        `${this.baseURL}/validateNin`, // ✅ FIXED
        { nin },
        { headers: this.getHeaders() }
      );

      return response.data;

    } catch (error) {
      throw new Error(
        `NIN verification failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async nameEnquiry(accountNumber) {
  const token = await this.getNIBBSToken();

  const response = await axios.get(
    `${this.baseURL}/account/name-enquiry/${accountNumber}`,
    {
      headers: this.getHeaders(token)
    }
  );

  return response.data;
}

  
}

module.exports = new NibssService();