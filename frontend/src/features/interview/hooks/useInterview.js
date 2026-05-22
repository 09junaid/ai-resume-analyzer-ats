import { useCallback, useContext } from "react";
import {
  generateInterviewReport,
  getAllInterviewReports,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api";
import { InterviewContext } from "../context/interview.context";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = useCallback(
    async ({ jobDescription, selfDescription, resumeFile }) => {
      setLoading(true);
      let response = null;
      try {
        response = await generateInterviewReport({
          jobDescription,
          selfDescription,
          resumeFile,
        });
        setReport(response.interviewReport);
      } catch (error) {
        console.error("Error generating interview report:", error);
      } finally {
        setLoading(false);
      }
      return response?.interviewReport ?? null;
    },
    [setLoading, setReport],
  );

  const fetchReportById = useCallback(
    async (interviewId) => {
      setLoading(true);
      let response = null;
      const normalizedInterviewId = String(interviewId || "").split("/")[0];
      try {
        response = await getInterviewReportById(normalizedInterviewId);
        setReport(response.interviewReport);
      } catch (error) {
        console.error("Error fetching interview report by ID:", error);
      } finally {
        setLoading(false);
      }
      return response?.interviewReport ?? null;
    },
    [setLoading, setReport],
  );

  const getReports = useCallback(
    async () => {
      setLoading(true);
      let response = null;
      try {
        response = await getAllInterviewReports();
        setReports(response.interviewReports);
      } catch (error) {
        console.error("Error fetching all interview reports:", error);
      } finally {
        setLoading(false);
      }
      return response?.interviewReports ?? [];
    },
    [setLoading, setReports],
  );

  const getResumePdf = useCallback(async (interviewReportId) => {
    try {
      const response = await generateResumePdf({ interviewReportId });
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume PDF:", error);
      throw error;
    }
  }, []);

  return {
    loading,
    report,
    reports,
    generateReport,
    fetchReportById,
    getReports,
    getResumePdf,
  };
};
