const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
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

/**
 * @description Controller to generate a resume PDF based on the user's profile and job description. This is an optional feature that can be implemented in the future. The function will use Puppeteer to create a PDF file from an HTML template, which can then be sent back to the user for download.
 */

async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewReportId,
    user: req.user.id,
  });
  if (!interviewReport) {
    return res.status(404).json({
      status: 404,
      success: false,
      message: "Interview report not found",
    });
  }
  const { resume, selfDescription, jobDescription } = interviewReport;
  const pdfBuffer = await generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
  });
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
