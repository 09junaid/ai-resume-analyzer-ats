const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Generate an interview report based on the user's resume, self-description, and job description.
 */
async function generateInterViewReportController(req, res) {
  const resumeContent = await pdfParse(req.file.buffer);
  const { selfDescription, jobDescription } = req.body;

  const interViewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
  });

  res.status(201).json({
    message: "Interview report generated successfully.",
    interviewReport,
  });
}

/**
 * @description Get an interview report by its ID. Only the owner of the report can access it.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });
  if (!interviewReport) {
    return res.status(404).json({
      status: 404,
      success: false,
      message: "Interview report not found",
    });
  }
  res.status(200).json({
    status: 200,
    success: true,
    message: "Interview report retrieved successfully",
    interviewReport,
  });
}

/**
 * @description Get all interview reports of the logged-in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );
  res.status(200).json({
    status: 200,
    success: true,
    message: "Interview reports retrieved successfully",
    interviewReports,
  });
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
};
