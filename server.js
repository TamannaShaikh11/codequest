const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));


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
   🤖 AI CHAT ROUTE (GROQ)
================================ */
app.post("/chat", async (req, res) => {
  try {
    console.log("📩 Chat request:", req.body);

    const { message } = req.body;
    if (!message) {
      return res.json({ reply: "⚠️ Empty message" });
    }

    const reply = await callGroq(message);
    res.json({ reply });

  } catch (err) {
    console.error("❌ Chat route error:", err);
    res.status(500).json({ reply: "⚠️ Server error" });
  }
});


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

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    res.json({ success: true, message: 'Login successful', user });  // Added message
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
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(message) {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY missing");
    return "AI API key missing";
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a helpful programming tutor. Answer briefly."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.4
        })
      }
    );

    const data = await response.json();
    console.log("📥 Groq raw response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Groq API error:", data.error);
      return "⚠️ AI error";
    }

    return (
      data.choices?.[0]?.message?.content ||
      "⚠️ AI did not respond"
    );
  } catch (err) {
    console.error("❌ Groq fetch failed:", err);
    return "⚠️ AI fetch failed";
  }
}

/* ===============================
   SERVER START
================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
