const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

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

async function generatePdfFromHtml(htmlContent) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function launchBrowser() {
  if (process.env.VERCEL) {
    const chromium = require("@sparticuz/chromium");
    const puppeteer = require("puppeteer-core");

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const puppeteer = require("puppeteer-core");

  if (!process.env.PUPPETEER_EXECUTABLE_PATH) {
    throw new Error(
      "PUPPETEER_EXECUTABLE_PATH is required for local PDF generation",
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer ",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                         the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });
  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}
module.exports = { generateInterviewReport, generateResumePdf };
