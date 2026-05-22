const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");
const fs = require("fs");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .min(5)
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .min(3)
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .min(3)
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .min(5)
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

function normalizeInterviewReportPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const wrappedReport =
    payload.interviewReport || payload.report || payload.data || payload.result;

  const source =
    wrappedReport && typeof wrappedReport === "object"
      ? wrappedReport
      : payload;

  const rawTechnicalQuestions =
    source.technicalQuestions || source.technical_questions || [];
  const rawBehavioralQuestions =
    source.behavioralQuestions || source.behavioral_questions || [];
  const rawSkillGaps = source.skillGaps || source.skill_gaps || [];
  const rawPreparationPlan =
    source.preparationPlan || source.preparation_plan || [];

  const technicalQuestions = rawTechnicalQuestions.map((item) => {
    if (typeof item === "string") {
      return {
        question: item,
        intention: "Assess technical depth relevant to this role",
        answer:
          "Explain your approach with one concrete project example, trade-offs, and result.",
      };
    }

    return {
      question: item.question || item.q || "",
      intention: item.intention || item.purpose || "Assess technical depth",
      answer:
        item.answer ||
        item.sampleAnswer ||
        "Answer with structure: context, approach, implementation, and outcome.",
    };
  });

  const behavioralQuestions = rawBehavioralQuestions.map((item) => {
    if (typeof item === "string") {
      return {
        question: item,
        intention: "Evaluate communication, teamwork, and ownership",
        answer:
          "Use STAR method (Situation, Task, Action, Result) with measurable impact.",
      };
    }

    return {
      question: item.question || item.q || "",
      intention:
        item.intention || item.purpose || "Evaluate behavior and collaboration",
      answer:
        item.answer ||
        item.sampleAnswer ||
        "Use STAR method and mention lessons learned.",
    };
  });

  const skillGaps = rawSkillGaps.map((item) => {
    if (typeof item === "string") {
      return {
        skill: item,
        severity: "medium",
      };
    }

    const severity = String(item.severity || "medium").toLowerCase();

    return {
      skill: item.skill || item.name || "Unknown skill",
      severity: ["low", "medium", "high"].includes(severity)
        ? severity
        : "medium",
    };
  });

  const preparationPlan = rawPreparationPlan.map((item, index) => {
    if (typeof item === "string") {
      return {
        day: index + 1,
        focus: item,
        tasks: [item],
      };
    }

    const tasks = Array.isArray(item.tasks)
      ? item.tasks.filter((task) => typeof task === "string" && task.trim())
      : typeof item.tasks === "string" && item.tasks.trim()
        ? [item.tasks]
        : typeof item.action === "string" && item.action.trim()
          ? [item.action]
          : [
              "Review core concepts",
              "Practice interview-style questions",
              "Document key learnings",
            ];

    return {
      day:
        typeof item.day === "number" && Number.isFinite(item.day)
          ? item.day
          : index + 1,
      focus: item.focus || item.topic || `Preparation Day ${index + 1}`,
      tasks,
    };
  });

  const numericScore =
    Number(source.matchScore ?? source.score ?? source.compatibilityScore) || 0;

  return {
    title: source.title || source.jobTitle || "Interview Report",
    matchScore: Math.max(0, Math.min(100, numericScore)),
    technicalQuestions,
    behavioralQuestions,
    skillGaps,
    preparationPlan,
  };
}

async function requestInterviewReportFromAi(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const basePrompt = `
Generate an interview report for the candidate.
Return ONLY valid JSON matching the schema with all required fields populated.

Hard requirements:
- matchScore must be a number between 0 and 100
- technicalQuestions must contain at least 5 items
- behavioralQuestions must contain at least 3 items
- skillGaps must contain at least 3 items
- preparationPlan must contain at least 5 items
- Each question object must include: question, intention, answer
- Each skill gap must include: skill, severity (low|medium|high)
- Each preparation item must include: day (number), focus, tasks (string array)

Candidate data:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`.trim();

  const firstParsed = await requestInterviewReportFromAi(basePrompt);
  const firstNormalized = normalizeInterviewReportPayload(firstParsed);
  const firstValidation = interviewReportSchema.safeParse(firstNormalized);

  if (firstValidation.success) {
    return firstValidation.data;
  }

  const repairPrompt = `
Your previous JSON response failed validation.
Fix and return ONLY corrected JSON object with no markdown and no extra keys.

Validation errors:
${JSON.stringify(firstValidation.error.issues, null, 2)}

Original candidate data:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`.trim();

  const secondParsed = await requestInterviewReportFromAi(repairPrompt);
  const secondNormalized = normalizeInterviewReportPayload(secondParsed);

  return interviewReportSchema.parse(secondNormalized);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Resume</title>
    <style>
      body {
        color: #1f2933;
        font-family: Arial, sans-serif;
        font-size: 11px;
        line-height: 1.35;
        margin: 0;
      }
      h1 {
        border-bottom: 1px solid #111827;
        color: #111827;
        font-size: 20px;
        margin: 0 0 10px;
        padding-bottom: 6px;
        text-align: center;
      }
      h2 {
        border-bottom: 1px solid #d1d5db;
        color: #111827;
        font-size: 12px;
        margin: 12px 0 6px;
        padding-bottom: 3px;
        text-transform: uppercase;
      }
      p,
      pre {
        margin: 0;
      }
      pre {
        font-family: Arial, sans-serif;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <h1>Tailored Resume</h1>
    <h2>Professional Summary</h2>
    <p>${escapeHtml(selfDescription || "Candidate summary not provided.")}</p>
    <h2>Target Role</h2>
    <p>${escapeHtml(jobDescription || "Job description not provided.")}</p>
    <h2>Resume Details</h2>
    <pre>${escapeHtml(resume || "Resume content not available.")}</pre>
  </body>
</html>
`.trim();
}

function getChromeExecutablePath() {
  const possiblePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ].filter(Boolean);

  return possiblePaths.find((chromePath) => fs.existsSync(chromePath));
}

async function generatePdfFromHtml(htmlContent) {
  let browser;
  const executablePath = getChromeExecutablePath();

  try {
    browser = await puppeteer.launch({
      ...(executablePath ? { executablePath } : {}),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 0.88,
      margin: {
        top: "8mm",
        bottom: "8mm",
        left: "10mm",
        right: "10mm",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer ",
      ),
  });

  const prompt = `
Generate a polished, ATS-friendly resume for the candidate.
Return ONLY valid JSON with one field:
{
  "html": "complete HTML document"
}

Candidate data:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Resume content requirements:
- Tailor the resume to the job description without inventing fake companies, dates, degrees, certifications, or metrics.
- Keep the tone natural, human-written, concise, and recruiter-friendly.
- Prioritize role-relevant skills, experience, projects, tools, and impact.
- Use strong action verbs and clear achievement bullets.
- Keep the resume ideally to 1 page, maximum 2 pages when converted to A4 PDF.
- Remove weak, repeated, vague, or unrelated content.
- Do not include long paragraphs. Use short summary and bullet points.
- Do not include tables, columns, text boxes, images, icons, progress bars, charts, SVG, canvas, headers/footers, or decorative layouts.
- Do not use dark backgrounds, gradients, heavy colors, or complex styling.

ATS-friendly HTML/layout requirements:
- Use simple semantic HTML: h1, h2, h3, p, ul, li, strong, a.
- Use a single-column layout only.
- Use standard section names when relevant: Summary, Skills, Experience, Projects, Education, Certifications.
- Put contact/name information at the top if available in the resume text; do not invent missing contact details.
- Skills should be plain text grouped by category when possible.
- Use standard fonts such as Arial, Calibri, or Helvetica.
- Use black/dark gray text on white background.
- Center-align only the top header area above Summary, including candidate name and contact line when available.
- Keep all resume sections and bullet content left-aligned after the header.
- Make the CSS compact so the PDF fits well:
  - body font-size 10.5px to 11.5px
  - line-height 1.3 to 1.4
  - small margins and tight section spacing
  - h1 no larger than 20px
  - h2 no larger than 12px
- Add CSS page size for printing:
  @page { size: A4; margin: 8mm 10mm; }
- Ensure no content overflows horizontally.
`.trim();
  let htmlContent;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema),
      },
    });
    const jsonContent = resumePdfSchema.parse(JSON.parse(response.text));
    htmlContent = jsonContent.html;
  } catch (error) {
    console.error("AI resume HTML generation failed:", error);
    htmlContent = buildFallbackResumeHtml({
      resume,
      selfDescription,
      jobDescription,
    });
  }

  const pdfBuffer = await generatePdfFromHtml(htmlContent);

  return pdfBuffer;
}
module.exports = { generateInterviewReport, generateResumePdf };
