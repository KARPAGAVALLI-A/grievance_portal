require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DATA_FILE = path.join(DATA_DIR, "grievances.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://grievanceportalfrontend-frontendgri.vercel.app",
];

const envAllowedOrigins = [
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim()) : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(o => o.trim()) : []),
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins])).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any localhost or 127.0.0.1 port (e.g., 5173, 5174, 3000, etc.)
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

// ---------- File upload config ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const allowedTypes = [".docx", ".pdf", ".jpeg", ".jpg"];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) cb(null, true);
    else cb(new Error("Only .docx, .pdf, .jpeg files are allowed"));
  },
});

// ---------- Mailer ----------
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
const smtpPass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");

const isGmail = smtpHost.includes("gmail") || (smtpUser && smtpUser.endsWith("@gmail.com"));

const transporterConfig = isGmail
  ? {
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }
  : {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

const transporter = nodemailer.createTransport(transporterConfig);

// Verify transporter at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error.message);
    console.error("Note: For Gmail, ensure you are using a valid 16-character Google App Password (not your normal Gmail password) and that 2-Step Verification is active.");
  } else {
    console.log("Email transporter is verified and ready to send emails.");
  }
});

function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function sendMail({ to, subject, html, attachments = [] }) {
  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const replyToAddress = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;

  return transporter.sendMail({
    from: fromAddress,
    replyTo: replyToAddress,
    to,
    subject,
    html,
    text: htmlToText(html),
    attachments,
  });
}

// Send notification email to Admin
async function sendAdminEmail(record, attachments = []) {
  const adminEmails = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || "")
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  if (!adminEmails.length) {
    throw new Error("No admin email configured in ADMIN_EMAIL environment variable.");
  }

  const extraFieldsHtml = Object.values(record.extraFields || {})
    .map(f => `<li><b>${f.label}:</b> ${f.value}</li>`)
    .join("");

  const html = `
    <h2>New Grievance Submitted — GID ${record.gid}</h2>
    <p>A new grievance has been submitted on the portal.</p>
    <ul>
      <li><b>Grievance ID:</b> ${record.gid}</li>
      <li><b>User Name:</b> ${record.name}</li>
      <li><b>User Email:</b> ${record.email}</li>
      <li><b>Mobile:</b> ${record.mobile}</li>
      <li><b>User Type:</b> ${record.userType}</li>
      <li><b>Category/Department:</b> ${record.department || "General / Not Specified"}</li>
      ${extraFieldsHtml}
      <li><b>Submission Date/Time:</b> ${new Date(record.submittedAt).toLocaleString()}</li>
      <li><b>Status:</b> ${record.status || "Pending"}</li>
    </ul>
    <p><b>Description:</b></p>
    <p style="background:#f4f6f5;padding:12px;border-radius:6px;border:1px solid #d7e6dc;">${record.description}</p>
    ${record.originalFileName ? `<p><b>Attachment:</b> ${record.originalFileName}</p>` : ""}
  `;

  return sendMail({
    to: adminEmails.join(","),
    subject: `New Grievance Submitted - GID ${record.gid}`,
    html,
    attachments,
  });
}

// Send confirmation email to User
async function sendUserEmail(record, attachments = []) {
  if (!record.email) {
    throw new Error("User email is empty; cannot send user confirmation email.");
  }

  const extraFieldsHtml = Object.values(record.extraFields || {})
    .map(f => `<li><b>${f.label}:</b> ${f.value}</li>`)
    .join("");

  const html = `
    <p>Dear ${record.name},</p>
    <p>Your grievance has been successfully submitted to the National Engineering College Grievance Redressal Portal.</p>
    <p><b>Grievance ID:</b> ${record.gid}</p>
    <ul>
      <li><b>User Type:</b> ${record.userType}</li>
      <li><b>Mobile:</b> ${record.mobile}</li>
      <li><b>Category/Department:</b> ${record.department || "General"}</li>
      ${extraFieldsHtml}
      <li><b>Submission Date:</b> ${new Date(record.submittedAt).toLocaleString()}</li>
      <li><b>Current Status:</b> ${record.status || "Pending"}</li>
    </ul>
    <p><b>Description:</b></p>
    <p style="background:#f4f6f5;padding:12px;border-radius:6px;border:1px solid #d7e6dc;">${record.description}</p>
    <p>Our committee will review your grievance and respond within 30 days as per policy. Please retain your GID (${record.gid}) for future tracking.</p>
    <p>Regards,<br/><b>Grievance Redressal Committee</b><br/>National Engineering College</p>
  `;

  return sendMail({
    to: record.email,
    subject: `Grievance Submitted Successfully - GID ${record.gid}`,
    html,
  });
}

// ---------- Helpers ----------
function readGrievances() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writeGrievances(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}
function nextGID(list) {
  const max = list.reduce((m, g) => Math.max(m, g.gid), 11); // portal already shows GID 12 as next
  return max + 1;
}

// ---------- Routes ----------

// Submit a new grievance
app.post("/api/grievance", upload.single("document"), async (req, res) => {
  try {
    const {
      userType,
      name,
      email,
      gender,
      mobile,
      department,
      description,
      regNo,
      rollNo,
      year,
      degree,
      course,
      erpId,
      occupation,
      place,
      completedYear,
    } = req.body;

    if (!userType || !name || !email || !mobile || !description) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount > 150) {
      return res.status(400).json({ error: "Grievance description must be under 150 words." });
    }

    // Collect user-type-specific fields that were actually provided
    const extraFields = {};
    [
      ["regNo", "Reg.No", regNo],
      ["rollNo", "Roll No", rollNo],
      ["year", "Year", year],
      ["degree", "Degree", degree],
      ["course", "Course", course],
      ["erpId", "ERP ID", erpId],
      ["occupation", "Occupation", occupation],
      ["place", "Place", place],
      ["completedYear", "Completed Year", completedYear],
    ].forEach(([key, label, value]) => {
      if (value) extraFields[key] = { label, value };
    });

    const list = readGrievances();
    const gid = nextGID(list);
    const submittedAt = new Date().toISOString();

    const record = {
      gid,
      userType,
      name,
      email,
      gender: gender || "",
      mobile,
      department: department || "",
      extraFields,
      description,
      document: req.file ? req.file.filename : null,
      originalFileName: req.file ? req.file.originalname : null,
      status: "Pending",
      submittedAt,
    };

    list.push(record);
    writeGrievances(list);

    const attachments = req.file
      ? [{ filename: req.file.originalname, path: req.file.path }]
      : [];

    // 1. Send email immediately to Admin
    try {
      await sendAdminEmail(record, attachments);
      console.log(`Admin email sent successfully for GID ${gid}`);
    } catch (adminErr) {
      console.error("Admin email failed:", adminErr.message || adminErr);
    }

    // 2. Send confirmation email immediately to User
    try {
      await sendUserEmail(record, attachments);
      console.log(`User email sent successfully to ${email} for GID ${gid}`);
    } catch (userErr) {
      console.error("User email failed:", userErr.message || userErr);
    }

    res.status(201).json({ message: "Grievance submitted successfully.", gid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong. Please try again." });
  }
});

// Get all grievances (admin view) — optional ?status=Pending|Resolved|Rejected filter
app.get("/api/grievances", (req, res) => {
  const list = readGrievances();
  const { status } = req.query;
  if (status) {
    return res.json(list.filter(g => g.status === status));
  }
  res.json(list);
});

// Get a single grievance by GID (status check)
app.get("/api/grievance/:gid", (req, res) => {
  const list = readGrievances();
  const record = list.find(g => g.gid === Number(req.params.gid));
  if (!record) return res.status(404).json({ error: "Grievance not found." });
  res.json(record);
});

// ---------- Admin ----------

// Admin login — checks against ADMIN_USERNAME / ADMIN_PASSWORD in .env
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === validUser && password === validPass) {
    // Simple token — not for high-security use, just to gate the dashboard UI
    return res.json({ success: true, token: "nec-admin-session" });
  }
  res.status(401).json({ error: "Invalid username or password." });
});

// Update a grievance's status — Pending / Resolved / Rejected
app.patch("/api/grievance/:gid/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Resolved", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Status must be Pending, Resolved, or Rejected." });
    }

    const list = readGrievances();
    const record = list.find(g => g.gid === Number(req.params.gid));
    if (!record) return res.status(404).json({ error: "Grievance not found." });

    record.status = status;
    record.statusUpdatedAt = new Date().toISOString();
    writeGrievances(list);

    // Notify the user their grievance status changed
    if (record.email) {
      const statusTitle = status === "Resolved" ? "Resolved" : status === "Rejected" ? "Rejected" : "Pending";
      const statusMessage = {
        Resolved: "Your grievance has been reviewed and marked as <b>Resolved</b> by the committee.",
        Rejected: "Your grievance has been reviewed and was <b>not upheld / rejected</b> by the committee.",
        Pending: "Your grievance status has been reset to <b>Pending</b> and is under review.",
      }[status];

      try {
        await sendMail({
          to: record.email,
          subject: `Grievance Status Update: ${statusTitle} - GID ${record.gid}`,
          html: `
            <p>Dear ${record.name},</p>
            <p>${statusMessage}</p>
            <p><b>Grievance ID:</b> ${record.gid}</p>
            <p><b>Current Status:</b> <span style="font-weight:bold;color:${status === 'Resolved' ? '#1f6b3a' : status === 'Rejected' ? '#c0392b' : '#b8860b'}">${status}</span></p>
            <p><b>Updated On:</b> ${new Date(record.statusUpdatedAt).toLocaleString()}</p>
            <p><b>Description:</b><br/>${record.description}</p>
            <p>Regards,<br/><b>Grievance Redressal Committee</b><br/>National Engineering College</p>
          `,
        });
        console.log(`Status update (${status}) email sent successfully to user ${record.email} for GID ${record.gid}`);
      } catch (mailErr) {
        console.error("Status update email (user) failed:", mailErr.message);
      }
    }

    // Notify admin(s) that this status change was made
    const adminEmails = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || "").split(",").map(e => e.trim()).filter(Boolean);
    if (adminEmails.length) {
      const adminStatusNote = {
        Resolved: "marked as <b>Resolved</b>",
        Rejected: "marked as <b>Rejected</b>",
        Pending: "reset to <b>Pending</b>",
      }[status];

      try {
        await sendMail({
          to: adminEmails.join(","),
          subject: `Grievance Status Updated: ${status} - GID ${record.gid}`,
          html: `
            <p>Confirmation: Grievance <b>GID ${record.gid}</b> has been ${adminStatusNote} by Admin.</p>
            <ul>
              <li><b>Grievance ID:</b> ${record.gid}</li>
              <li><b>Complainant Name:</b> ${record.name}</li>
              <li><b>Email:</b> ${record.email}</li>
              <li><b>User Type:</b> ${record.userType}</li>
              <li><b>New Status:</b> ${status}</li>
              <li><b>Updated At:</b> ${new Date(record.statusUpdatedAt).toLocaleString()}</li>
            </ul>
            <p><b>Description:</b><br/>${record.description}</p>
          `,
        });
        console.log(`Status update (${status}) confirmation email sent to admin for GID ${record.gid}`);
      } catch (mailErr) {
        console.error("Status update email (admin) failed:", mailErr.message);
      }
    }

    res.json({ message: "Status updated.", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

// Export grievances as a downloadable CSV report — optional ?status=Pending|Resolved|Rejected filter
app.get("/api/grievances/export", (req, res) => {
  const list = readGrievances();
  const { status } = req.query;
  const filtered = status ? list.filter(g => g.status === status) : list;

  const headers = [
    "GID", "User Type", "Name", "Email", "Mobile", "Gender", "Department",
    "Status", "Submitted At", "Description", "Attachment"
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = filtered.map(g => [
    g.gid,
    g.userType,
    g.name,
    g.email,
    g.mobile,
    g.gender || "",
    g.department || "",
    g.status,
    new Date(g.submittedAt).toLocaleString(),
    g.description,
    g.originalFileName || "",
  ].map(escapeCsv).join(","));

  const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

  const filename = `grievance-report${status ? "-" + status.toLowerCase() : ""}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
});

app.get("/", (req, res) => {
  res.send("NEC Grievance Redressal Portal API is running.");
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Grievance portal backend running on http://localhost:${PORT}`);
});
