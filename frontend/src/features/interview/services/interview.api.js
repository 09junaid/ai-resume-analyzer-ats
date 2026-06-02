import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

const pendingRequests = new Map();

const dedupeRequest = async (key, request) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const pendingRequest = request().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, pendingRequest);
  return pendingRequest;
};

/**
 * @description This function generates an interview report by sending a POST request to the backend API. It takes in the job description, self description, and resume file as parameters, and returns the generated interview report data from the response.
 */
export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);
  const response = await api.post("/api/interview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * @description This function fetches an interview report by its ID from the backend API. It takes in the interview ID as a parameter, and returns the interview report data from the response.
 */
export const getInterviewReportById = async (interviewId) => {
  return dedupeRequest(`report:${interviewId}`, async () => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
  });
};

/**
 * @description This function fetches all interview reports of the logged-in user from the backend API. It returns an array of interview report data from the response.
 */
export const getAllInterviewReports = async () => {
  return dedupeRequest("reports", async () => {
    const response = await api.get("/api/interview");
    return response.data;
  });
};
