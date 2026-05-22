import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

let getMeRequest = null;

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Unable to create account",
      { cause: err },
    );
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Unable to log in", {
      cause: err,
    });
  }
}




export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Unable to log out", {
      cause: err,
    });
  }
}

export async function getMe() {
  if (getMeRequest) {
    return getMeRequest;
  }

  getMeRequest = api
    .get("/api/auth/get-me")
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || "Unable to fetch user", {
        cause: err,
      });
    })
    .finally(() => {
      getMeRequest = null;
    });

  return getMeRequest;
}
