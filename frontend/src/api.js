
const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.8:5000'
    : 'https://pbl6-40m0.onrender.com');

export { API_URL };
