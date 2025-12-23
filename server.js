const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE
================================ */
mongoose.connect("mongodb://localhost:27017/codequest")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB error:", err));

/* ===============================
   USER SCHEMA
================================ */
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // ⚠️ hash in production
  progress: {
    html: { type: Number, default: 0 },
    c: { type: Number, default: 0 },
    python: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    badges: { type: [String], default: [] }
  }
});

const User = mongoose.model("User", userSchema);

/* ===============================
   AUTH ROUTES
================================ */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Account already exists" });
    }

    await new User({ name, email, password }).save();
    res.json({ success: true, message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   PROFILE & PROGRESS
================================ */
app.get("/profile/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  user
    ? res.json({ success: true, user })
    : res.status(404).json({ success: false, message: "User not found" });
});

app.post("/progress", async (req, res) => {
  const { email, quest, value, stars, badge } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ success: false });

  if (quest) user.progress[quest] = value;
  if (stars) user.progress.stars += stars;
  if (badge && !user.progress.badges.includes(badge)) {
    user.progress.badges.push(badge);
  }

  await user.save();
  res.json({ success: true, user });
});

/* ===============================
   LEADERBOARD
================================ */
app.get("/leaderboard/:quest", async (req, res) => {
  const quest = req.params.quest;
  if (!["html", "c", "python"].includes(quest)) {
    return res.status(400).json({ success: false, message: "Invalid quest" });
  }

  const leaders = await User.find({}, { name: 1, [`progress.${quest}`]: 1 })
    .sort({ [`progress.${quest}`]: -1 })
    .limit(10);

  res.json(leaders);
});

/* ===============================
   🔥 GOOGLE GEMINI AI CHAT
================================ */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(message) {
  const model = "gemini-2.5-flash"; // Replace with your valid model

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set");
    return "AI API key missing";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Instructions to make answers short
          temperature: 0.5,
          max_output_tokens: 100,
          contents: [
            {
              parts: [
                {
                  text: "You are a helpful AI tutor. Answer the user question **in one or two sentences only**.\nUser: " + message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply || "⚠️ AI did not respond";
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return "⚠️ AI fetch failed";
  }
}




app.post("/chat", async (req, res) => {
  console.log("📩 Chat request:", req.body);

  try {
    const reply = await callGemini(req.body.message);
    console.log("🤖 Gemini replied");

    res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ reply: "AI failed to respond" });
  }
});


/* ===============================
   SERVER START
================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
