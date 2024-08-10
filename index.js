const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email sending endpoint with file attachment
app.post("/send-email", upload.single("attachment"), async (req, res) => {
  const { to, subject, text, html } = req.body;
  const attachment = req.file; // The uploaded file

  // Create mail options object
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: to, // Already a comma-separated string
    subject: subject,
    text: text,
    html: html,
  };

  // If a file is attached, add it to the mailOptions
  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.originalname,
        path: attachment.path,
      },
    ];
  }

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .send({ error: "Failed to send email", details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
