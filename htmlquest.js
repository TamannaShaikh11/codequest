// --- Active quest and user state ---
let activeQuest = localStorage.getItem("activeQuest") || "html"; // "c" or "html"
let user = JSON.parse(localStorage.getItem("user")) || null;

// --- Progress constants ---
const MAX_LEVELS_HTML = 42;       // save up to 42 steps for HTML
const STARS_PER_HTML_CHALLENGE = 10; // award per completed HTML challenge

// --- Backend helpers ---
async function saveProgress(email, quest, levelValue, stars, badge) {
  try {
    const res = await fetch("http://localhost:3000/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        quest,          // "c" or "html"
        value: levelValue, // numeric progress (0..40)
        stars,          // stars to add
        badge           // optional badge name
      })
    });
    const data = await res.json();
    if (!data.success) {
      console.warn("Progress save failed:", data.message);
    } else {
      // Refresh local user cache with updated server user
      localStorage.setItem("user", JSON.stringify(data.user));
      user = data.user;
    }
  } catch (e) {
    console.error("Progress save error:", e);
  }
}

// --- Load Progress from backend and apply to game ---
async function loadProgress(email) {
  try {
    const res = await fetch(`http://localhost:3000/profile/${email}`);
    const data = await res.json();
    if (data.success) {
      user = data.user;
      localStorage.setItem("user", JSON.stringify(user));

      // Derive saved progress count for active quest and apply to GameState
      const savedCount =
        activeQuest === "html" ? (user.progress.html || 0) : (user.progress.c || 0);

      applySavedProgress(savedCount);
      updateStats();
      renderLevels();
    } else {
      console.warn("Load progress failed:", data.message);
      applySavedProgress(0);
      renderLevels();
    }
  } catch (e) {
    console.error("Load progress error:", e);
    applySavedProgress(0);
    renderLevels();
  }
}

// ================================
// Profile circle -> centered modal showing live details
// ================================
const profileCircle = document.getElementById("profileCircle");

// Modal elements
const overlay = document.getElementById("overlay");
const userModal = document.getElementById("userModal");
const closeModalBtn = document.getElementById("closeModal");

// Profile fields in modal
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStarsEl = document.getElementById("userStars");
const userHtmlEl = document.getElementById("userHtml");
const userCEl = document.getElementById("userC");
const userBadgesEl = document.getElementById("userBadges");

// Show initial in circle (use current user from localStorage)
const currentUser = JSON.parse(localStorage.getItem("user"));
if (currentUser && profileCircle) {
  profileCircle.textContent = (currentUser.name || "U").charAt(0).toUpperCase();
}

// Open modal and fetch latest data
if (profileCircle) {
  profileCircle.addEventListener("click", async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    try {
      const res = await fetch(`http://localhost:3000/profile/${currentUser.email}`);
      const data = await res.json();
      if (data.success) {
        const u = data.user;
        userNameEl.textContent = u.name;
        userEmailEl.textContent = u.email;
        userStarsEl.textContent = u.progress.stars;
        userHtmlEl.textContent = u.progress.html;
        userCEl.textContent = u.progress.c;
        userBadgesEl.textContent = (u.progress.badges || []).join(", ");
      }
      overlay.classList.remove("hidden");
      userModal.classList.remove("hidden");
    } catch (e) {
      console.error("Profile fetch error:", e);
    }
  });
}

// Close modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    userModal.classList.add("hidden");
  });
}
if (overlay) {
  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden");
    userModal.classList.add("hidden");
  });
}


// ================================
// html Quest - Game State Management
// ================================
class GameState {
  constructor() {
    this.levels = [
      {
        id: 1,
        name: "Novice",
        description: "Learn the basics of HTML structure",
        color: "#4CAF50",
        unlocked: true,
        completed: false,
        challenges: [
          {
            id: 1,
            title: "HTML Skeleton",
            type: "drag-drop",
            description: "Arrange lines to form a valid HTML page",
            tags: ["<!DOCTYPE html>", "<html>", "<head>", "<title>My Page</title>", "</head>", "<body>", "Hello World", "</body>", "</html>"],
            solution: ["<!DOCTYPE html>", "<html>", "<head>", "<title>My Page</title>", "</head>", "<body>", "Hello World", "</body>", "</html>"],
            points: 100,
            completed: false
          },
          {
            id: 2,
            title: "Heading Tag Quiz",
            type: "quiz",
            description: "Which tag creates the largest heading?",
            options: ["<h1>", "<h3>", "<h6>", "<title>"],
            correct: 0,
            points: 50,
            completed: false
          },
          {

            "id": 3,
            "title": "Paragraph Fill",
            "type": "fill-blank",
            "description": "Write a paragraph to print Hello World:",
            "solution": "<p>Hello World</p>",
            "points": 50,
            "completed": false

          },
          {
            id: 4,
            title: "Line Break Output",
            type: "fill-blank",
            description: "<___> tag is used to break line?",
            solution: "br",
            points: 40,
            completed: false
          },
          {
            id: 5,
            title: "Match Tags",
            type: "match",
            pairs: [
              { left: "<b>", right: "bold text" },
              { left: "<i>", right: "italic text" }
            ],
            points: 60,
            completed: false
          },
          {
            id: 6,
            title: "Image Quiz",
            type: "quiz",
            description: "Which attribute specifies image source?",
            options: ["alt", "src", "href", "link"],
            correct: 1,
            points: 50,
            completed: false
          },
          {
            id: 7,
            title: "Anchor Fill",
            type: "fill-blank",
            description: "Complete code: <a ___=\"https://example.com\">Link</a>",
            solution: "href",
            points: 50,
            completed: false
          },
          {
            id: 8,
            title: "List Output",
            type: "output",
            description: "What does <ul><li>Item</li></ul> produce?",
            solution: "Bullet list with one item",
            points: 50,
            completed: false
          },
          {
            id: 9,
            title: "Comment Syntax",
            type: "quiz",
            description: "How do you write a comment in HTML?",
            options: ["<!-- comment -->", "// comment", "/* comment */"],
            correct: 0,
            points: 40,
            completed: false
          },
          {
            id: 10,
            title: "Variable Concept",
            type: "wh-question",
            description: "Why do we use semantic tags in HTML?",
            keywords: ["meaning", "SEO", "accessibility"],
            points: 50,
            completed: false
          },

        ]
      },
      {
        id: 2,
        name: "Apprentice",
        description: "Master links, images, and lists",
        color: "#2196F3",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 11,
            title: "Table Structure",
            type: "drag-drop",
            description: "Arrange code to create a table",
            tags: ["<table>", "<tr>", "<td>Data</td>", "</tr>", "</table>"],
            solution: ["<table>", "<tr>", "<td>Data</td>", "</tr>", "</table>"],
            points: 100,
            completed: false
          },
          {
            id: 12,
            title: "Form Quiz",
            type: "quiz",
            description: "Which tag creates a text input field?",
            options: ["<input type='text'>", "<form>", "<textarea>", "<field>"],
            correct: 0,
            points: 60,
            completed: false
          },
          {
            id: 13,
            title: "Form Fill",
            type: "fill-blank",
            description: "Complete code: <input type='___'>",
            solution: "text",
            points: 50,
            completed: false
          },
          {
            id: 14,
            title: "Ordered List Output",
            type: "output",
            description: "What does <ol><li>A</li><li>B</li></ol> produce?",
            solution: "Numbered list with A and B",
            points: 50,
            completed: false
          },
          {
            id: 15,
            title: "Match Attributes",
            type: "match",
            description: "Match attributes with purpose",
            pairs: [
              { left: "alt", right: "image description" },
              { left: "href", right: "link target" }
            ],
            points: 70,
            completed: false
          },
          {
            id: 16,
            title: "Iframe Quiz",
            type: "quiz",
            description: "Which tag embeds another webpage?",
            options: ["<iframe>", "<embed>", "<object>", "<frame>"],
            correct: 0,
            points: 70,
            completed: false
          },
          {
            id: 17,
            title: "Meta Fill",
            type: "fill-blank",
            description: "Complete code: <meta ___='UTF-8'>",
            solution: "charset",
            points: 60,
            completed: false
          },
          {
            id: 18,
            title: "Audio Output",
            type: "output",
            description: "What does <audio controls> do?",
            solution: "Adds audio player with controls",
            points: 60,
            completed: false
          },
          {
            id: 19,
            title: "Semantic WH",
            type: "wh-question",
            description: "Why is <header> tag useful?",
            keywords: ["structure", "SEO", "accessibility"],
            points: 50,
            completed: false
          },
          {
            id: 20,
            title: "Video Embed",
            type: "drag-drop",
            description: "Arrange code to embed a video",
            tags: ["<video controls>", "<source src='movie.mp4' type='video/mp4'>", "</video>"],
            solution: ["<video controls>", "<source src='movie.mp4' type='video/mp4'>", "</video>"],
            points: 100,
            completed: false
          },

        ]
      },
      {
        id: 3,
        name: "Master",
        description: "Build forms and semantic elements",
        color: "#FF9800",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 21,
            title: "Canvas Quiz",
            type: "quiz",
            description: "Which tag is used for drawing graphics?",
            options: ["<canvas>", "<svg>", "<img>", "<graphic>"],
            correct: 0,
            points: 80,
            completed: false
          },
          {
            id: 22,
            title: "SVG Output",
            type: "output",
            description: "What does <svg><circle r='50'></circle></svg> produce?",
            solution: "A circle",
            points: 80,
            completed: false
          },
          {
            id: 23,
            title: "Form Validation Fill",
            type: "fill-blank",
            description: "Complete code: <input type='email' ___>",
            solution: "required",
            points: 70,
            completed: false
          },
          {
            id: 24,
            title: "Match APIs",
            type: "match",
            description: "Match HTML5 APIs with purpose",
            pairs: [
              { left: "Geolocation", right: "find location" },
              { left: "LocalStorage", right: "store data" }
            ],
            points: 90,
            completed: false
          },
          {
            id: 25,
            title: "Drag-Drop Example",
            type: "drag-drop",
            description: "Arrange code to create draggable element",
            tags: ["<div draggable='true'>", "Drag me", "</div>"],
            solution: ["<div draggable='true'>", "Drag me", "</div>"],
            points: 120,
            completed: false
          },
          {
            id: 26,
            title: "Responsive Quiz",
            type: "quiz",
            description: "Which meta tag helps with responsiveness?",
            options: ["viewport", "charset", "author"],
            correct: 0,
            points: 90,
            completed: false
          },
          {
            id: 27,
            title: "Form Output",
            type: "output",
            description: "What does <input type='password'> produce?",
            solution: "Password input field",
            points: 70,
            completed: false
          },
          {
            id: 28,
            title: "Accessibility WH",
            type: "wh-question",
            description: "Why use alt attributes in <img> tags?",
            keywords: ["accessibility", "screen readers", "SEO"],
            points: 70,
            completed: false
          },
          {
            id: 29,
            title: "Form Validation Quiz",
            type: "quiz",
            description: "Which attribute ensures an input must be filled?",
            options: ["required", "mandatory", "validate", "must"],
            correct: 0,
            points: 70,
            completed: false
          },
          {
            id: 30,
            title: "HTML5 Storage",
            type: "output",
            description: "What does localStorage allow you to do?",
            solution: "Store data in browser permanently",
            points: 80,
            completed: false
          },
          {
            id: 31,
            title: "Drag-Drop Fill",
            type: "fill-blank",
            description: "Complete code: <div ___='true'>Drag me</div>",
            solution: "draggable",
            points: 80,
            completed: false
          },
          {
            id: 32,
            title: "Match Multimedia",
            type: "match",
            description: "Match tags with media type",
            pairs: [
              { left: "<audio>", right: "sound" },
              { left: "<video>", right: "movie" }
            ],
            points: 90,
            completed: false
          },


        ]
      },
      {
        id: 4,
        name: "Expert",
        description: "Advanced HTML and best practices",
        color: "#9C27B0",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 33,
            title: "Responsive Meta",
            type: "drag-drop",
            description: "Arrange code to make page responsive",
            tags: [
              "<meta name='viewport'",
              "content='width=device-width, initial-scale=1.0'>"
            ],
            solution: [
              "<meta name='viewport'",
              "content='width=device-width, initial-scale=1.0'>"
            ],
            points: 120,
            completed: false
          },
          {
            id: 34,
            title: "Forms Quiz",
            type: "quiz",
            description: "Which input type is used for selecting a date?",
            options: ["text", "date", "calendar", "datetime"],
            correct: 1,
            points: 100,
            completed: false
          },
          {
            id: 35,
            title: "Canvas Fill",
            type: "fill-blank",
            description: "Complete code: <canvas id='___'></canvas>",
            solution: "myCanvas",
            points: 90,
            completed: false
          },
          {
            id: 36,
            title: "SVG Output",
            type: "output",
            description: "Predict output: <svg><rect width='50' height='50'></rect></svg>",
            solution: "Square/rectangle",
            points: 100,
            completed: false
          },
          {
            id: 37,
            title: "Match APIs",
            type: "match",
            description: "Match HTML5 APIs with purpose",
            pairs: [
              { left: "Geolocation", right: "find location" },
              { left: "Web Storage", right: "store data" }
            ],
            points: 120,
            completed: false
          },
          {
            id: 38,
            title: "Accessibility WH",
            type: "wh-question",
            description: "How do ARIA roles help in HTML?",
            keywords: ["assistive", "accessibility", "roles"],
            points: 120,
            completed: false
          },
          {
            id: 39,
            title: "Drag-Drop Example",
            type: "drag-drop",
            description: "Arrange code to create a drop zone",
            tags: ["<div ondrop='drop(event)' ondragover='allow(event)'>", "Drop here", "</div>"],
            solution: ["<div ondrop='drop(event)' ondragover='allow(event)'>", "Drop here", "</div>"],
            points: 150,
            completed: false
          },
          {
            id: 40,
            title: "Forms Output",
            type: "output",
            description: "What does <input type='file'> produce?",
            solution: "File upload field",
            points: 100,
            completed: false
          },
          {
            id: 41,
            title: "Match Semantic Tags",
            type: "match",
            description: "Match semantic tags with purpose",
            pairs: [
              { left: "<header>", right: "page top section" },
              { left: "<footer>", right: "page bottom section" }
            ],
            points: 120,
            completed: false
          },
          {
            id: 42,
            title: "System Design WH",
            type: "wh-question",
            description: "How would you design a responsive HTML layout?",
            keywords: ["flexbox", "grid", "media queries"],
            points: 150,
            completed: false
          }

        ]
      }
    ];

    this.badges = [
      { name: "First Steps", description: "Complete your first C challenge", icon: "🥾", requirement: "complete_first_challenge", earned: false },
      { name: "Loop Master", description: "Master all loop challenges", icon: "🔄", requirement: "complete_loop_challenges", earned: false },
      { name: "Pointer Pro", description: "Solve pointer challenges", icon: "📌", requirement: "complete_pointer_challenge", earned: false },
      { name: "Struct Specialist", description: "Solve structure challenges", icon: "🧩", requirement: "complete_struct_challenge", earned: false },
      { name: "C Expert", description: "Complete all levels", icon: "👑", requirement: "complete_all_levels", earned: false }
    ];

    this.cReference = [
      { tag: "#include <stdio.h>", description: "Header file for input/output functions", example: "#include <stdio.h>" },
      { tag: "int main()", description: "Entry point of a C program", example: "int main() { return 0; }" },
      { tag: "printf()", description: "Prints formatted output", example: "printf(\"Hello World\\n\");" },
      { tag: "scanf()", description: "Reads formatted input", example: "scanf(\"%d\", &num);" },
      { tag: "for loop", description: "Repeats code a fixed number of times", example: "for(int i=0; i<5; i++) { }" },
      { tag: "pointer", description: "Stores memory address of a variable", example: "int *p = &x;" },
      { tag: "struct", description: "Defines a custom data type", example: "struct Point { int x; int y; };" }
    ];

    this.playerStats = { totalPoints: 0, streak: 0, badgesEarned: 0 };
    this.currentChallenge = null;

    async function loadLeaderboard(quest = "html") {
      try {
        const res = await fetch(`http://localhost:3000/leaderboard/${quest}`);
        const leaders = await res.json();

        const grid = document.getElementById('leaderboardGrid');

        if (!Array.isArray(leaders) || leaders.length === 0) {
          grid.innerHTML = "<p>No leaderboard data available.</p>";
          return;
        }

        grid.innerHTML = leaders.map((l, i) => {
          const name = l.name || "Unknown User";
          const levels = l.progress?.[quest] ?? 0;
          return `
        <div class="leaderboard-item">
          <span>${i + 1}. ${name}</span>
          <span>${levels} levels</span>
        </div>
      `;
        }).join('');
      } catch (err) {
        console.error("Error loading leaderboard:", err);
        document.getElementById('leaderboardGrid').innerHTML =
          "<p>Unable to load leaderboard at the moment.</p>";
      }
    }

    loadLeaderboard("html"); // or "c"
  }


  updateProgress() {
    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      const allChallengesCompleted = level.challenges.every(c => c.completed);
      if (allChallengesCompleted && !level.completed) {
        level.completed = true;
        if (i < this.levels.length - 1) {
          this.levels[i + 1].unlocked = true;
        }
      }
    }
    return this.checkBadges();
  }

  checkBadges() {
    const completedChallenges = this.levels.flatMap(l => l.challenges).filter(c => c.completed);
    const completedLevels = this.levels.filter(l => l.completed);

    if (completedChallenges.length >= 1 && !this.badges[0].earned) {
      this.badges[0].earned = true; this.playerStats.badgesEarned++; return this.badges[0];
    }
    if (completedLevels.length >= 1 && !this.badges[1].earned) {
      this.badges[1].earned = true; this.playerStats.badgesEarned++; return this.badges[1];
    }
    if (completedLevels.length === this.levels.length && !this.badges[4].earned) {
      this.badges[4].earned = true; this.playerStats.badgesEarned++; return this.badges[4];
    }
    return null;
  }

  completeChallenge(challengeId, points) {
    for (const level of this.levels) {
      const challenge = level.challenges.find(c => c.id === challengeId);
      if (challenge && !challenge.completed) {
        challenge.completed = true;
        this.playerStats.totalPoints += points;
        this.playerStats.streak++;
        this.updateProgress();
        return true;
      }
    }
    return false;
  }
}

// Initialize game state
const gameState = new GameState();
// ================================
// C Quest - DOM Elements & Navigation
// ================================

// DOM Elements
const elements = {
  totalPoints: document.getElementById('totalPoints'),
  badgeCount: document.getElementById('badgeCount'),
  streakCount: document.getElementById('streakCount'),
  levelsGrid: document.getElementById('levelsGrid'),
  challengeModal: document.getElementById('challengeModal'),
  challengeTitle: document.getElementById('challengeTitle'),
  challengeDescription: document.getElementById('challengeDescription'),
  challengeArea: document.getElementById('challengeArea'),
  submitAnswer: document.getElementById('submitAnswer'),
  showHint: document.getElementById('showHint'),
  closeModal: document.getElementById('closeModal'),
  successModal: document.getElementById('successModal'),
  pointsEarned: document.getElementById('pointsEarned'),
  badgeEarned: document.getElementById('badgeEarned'),
  badgeName: document.getElementById('badgeName'),
  continueBtn: document.getElementById('continueBtn'),
  htmlEditor: document.getElementById('htmlEditor'),
  preview: document.getElementById('preview'),
  badgesGrid: document.getElementById('badgesGrid'),
  referenceContent: document.getElementById('referenceContent'),
  navTabs: document.querySelectorAll('.nav-tab'),
  gameSections: document.querySelectorAll('.game-section')
};

// Navigation
function initNavigation() {
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSection = tab.dataset.tab;
      switchSection(targetSection);
    });
  });
}

function switchSection(sectionName) {
  // Update active tab
  elements.navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === sectionName);
  });

  // Update active section
  elements.gameSections.forEach(section => {
    section.classList.toggle('active', section.id === `${sectionName}-section`);
  });

  // Section-specific rendering
  if (sectionName === 'levels') renderLevels();
  else if (sectionName === 'achievements') renderBadges();
  else if (sectionName === 'reference') renderReference();
}
// ================================
// html Quest - Rendering Functions
// ================================

function renderLevels() {
  elements.levelsGrid.innerHTML = '';
  gameState.levels.forEach(level => {
    const completedChallenges = level.challenges.filter(c => c.completed).length;
    const totalChallenges = level.challenges.length;
    const progress = (completedChallenges / totalChallenges) * 100;

    const levelCard = document.createElement('div');
    levelCard.className = `level-card ${!level.unlocked ? 'locked' : ''}`;
    levelCard.innerHTML = `
      <div class="level-header">
        <div class="level-icon" style="background-color: ${level.color}">${level.id}</div>
        <div class="level-info">
          <h3>${level.name}</h3>
          <p>${level.description}</p>
        </div>
      </div>
      <div class="level-progress">
        <div class="level-stats">
          <span>${completedChallenges}/${totalChallenges} Challenges</span>
          <span>${level.completed ? '✓ Complete' : level.unlocked ? 'Available' : '🔒 Locked'}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      </div>
    `;
    if (level.unlocked) {
      levelCard.addEventListener('click', () => openLevelChallenges(level));
    }
    elements.levelsGrid.appendChild(levelCard);
  });
}

function renderBadges() {
  elements.badgesGrid.innerHTML = '';
  gameState.badges.forEach(badge => {
    const badgeCard = document.createElement('div');
    badgeCard.className = `badge-card ${badge.earned ? 'earned' : ''}`;
    badgeCard.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <h3 class="badge-name">${badge.name}</h3>
      <p class="badge-description">${badge.description}</p>
    `;
    elements.badgesGrid.appendChild(badgeCard);
  });
}

function renderReference() {
  elements.referenceContent.innerHTML = '';
  const referenceGrid = document.createElement('div');
  referenceGrid.className = 'reference-grid';
  gameState.cReference.forEach(item => {
    const referenceItem = document.createElement('div');
    referenceItem.className = 'reference-item';
    referenceItem.innerHTML = `
      <div class="reference-tag">${item.tag}</div>
      <div class="reference-description">${item.description}</div>
      <div class="reference-example">${item.example}</div>
    `;
    referenceGrid.appendChild(referenceItem);
  });
  elements.referenceContent.appendChild(referenceGrid);
}
// ================================
// html Quest - Challenges & Feedback
// ================================

// Render Challenge Types
function openLevelChallenges(level) {
  const nextChallenge = level.challenges.find(c => !c.completed) || level.challenges[0];
  openChallenge(nextChallenge);
}

function openChallenge(challenge) {
  gameState.currentChallenge = challenge;
  elements.challengeTitle.textContent = challenge.title;
  elements.challengeDescription.textContent = challenge.description;
  elements.challengeArea.innerHTML = '';

  switch (challenge.type) {
    case 'quiz': renderQuizChallenge(challenge); break;
    case 'code-editor': renderCodeEditorChallenge(challenge); break;
    case 'fill-blank': renderFillBlankChallenge(challenge); break;
    case 'drag-drop': renderDragDropChallenge(challenge); break;
  }
  elements.challengeModal.classList.add('active');
}

function renderQuizChallenge(challenge) {
  const quizContainer = document.createElement('div');
  quizContainer.className = 'quiz-options';
  challenge.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'quiz-option';
    optionElement.textContent = option;
    optionElement.dataset.index = index;
    optionElement.addEventListener('click', () => {
      quizContainer.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
      optionElement.classList.add('selected');
    });
    quizContainer.appendChild(optionElement);
  });
  elements.challengeArea.appendChild(quizContainer);
}

function renderCodeEditorChallenge(challenge) {
  const editorContainer = document.createElement('div');
  editorContainer.innerHTML = `<textarea class="code-editor" rows="8" placeholder="Type your C code here..."></textarea>`;
  elements.challengeArea.appendChild(editorContainer);
}

function renderFillBlankChallenge(challenge) {
  const container = document.createElement('div');
  container.className = 'fill-blank-container';

  // Use description as template
  let template = challenge.description;

  // Count blanks (___)
  const blanks = template.match(/___/g) || [];

  blanks.forEach((_, index) => {
    template = template.replace(
      '___',
      `<input type="text" class="blank-input" data-index="${index}" />`
    );
  });

  container.innerHTML = template;
  elements.challengeArea.appendChild(container);

  // Store expected answers safely
  challenge.blanks = challenge.solution
    ? challenge.solution.split(',').map(s => s.trim())
    : [];
}

function renderDragDropChallenge(challenge) {
  const container = document.createElement('div');
  container.className = 'drag-drop-container';
  const dropZones = document.createElement('div');
  dropZones.className = 'drop-zones';
  challenge.tags.forEach((tag, i) => {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.index = i;
    zone.textContent = `Drop item ${i + 1} here`;
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
    dropZones.appendChild(zone);
  });
  const draggableItems = document.createElement('div');
  draggableItems.className = 'draggable-items';
  [...challenge.tags].sort(() => Math.random() - 0.5).forEach(tag => {
    const item = document.createElement('div');
    item.className = 'draggable-item';
    item.textContent = tag;
    item.draggable = true;
    item.dataset.tag = tag;
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    draggableItems.appendChild(item);
  });
  container.appendChild(dropZones);
  container.appendChild(draggableItems);
  elements.challengeArea.appendChild(container);
}

// Drag & Drop Handlers
let draggedElement = null;
function handleDragStart(e) { draggedElement = e.target; e.target.classList.add('dragging'); }
function handleDragEnd(e) { e.target.classList.remove('dragging'); draggedElement = null; }
function handleDragOver(e) { e.preventDefault(); e.target.classList.add('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove('drag-over');

  if (draggedElement) {
    // Clear whatever was inside before
    e.target.innerHTML = '';

    // Move the dragged element into the drop target
    e.target.appendChild(draggedElement);

    // Mark the target as filled with the new tag
    e.target.classList.add('filled');
    e.target.dataset.tag = draggedElement.dataset.tag;
  }
}


// Answer Submission
function submitAnswer() {
  if (!gameState.currentChallenge) return;
  const challenge = gameState.currentChallenge;
  let isCorrect = false;

  switch (challenge.type) {
    case 'quiz':
      isCorrect = checkQuizAnswer(challenge);
      break;
    case 'code-editor':
      isCorrect = checkCodeEditorAnswer(challenge);
      break;
    case 'fill-blank':
      isCorrect = checkFillBlankAnswer(challenge);
      break;
    case 'drag-drop':
      isCorrect = checkDragDropAnswer(challenge);
      break;
  }

  if (isCorrect) {
    const completed = gameState.completeChallenge(challenge.id, challenge.points);
    const badge = gameState.checkBadges();
    showSuccessModal(challenge.points, badge);

    // ⬇ NEW: persist progress
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser?.email) {
      const completedCount = getOverallCompletedCount(); // uses your helper
      const quest = 'html'; // or activeQuest if you switch between C / HTML
      saveProgress(
        currentUser.email,
        quest,
        completedCount,
        challenge.points,
        badge?.name || null
      );
    }
  } else {
    showErrorFeedback();
  }
}


// Validation Functions
function checkQuizAnswer(challenge) {
  const selected = document.querySelector('.quiz-option.selected');
  if (!selected) return false;
  const idx = parseInt(selected.dataset.index);
  const correct = idx === challenge.correct;
  document.querySelectorAll('.quiz-option').forEach((opt, i) => {
    if (i === challenge.correct) opt.classList.add('correct');
    else if (i === idx && !correct) opt.classList.add('incorrect');
  });
  return correct;
}

function checkCodeEditorAnswer(challenge) {
  const userCode = elements.challengeArea.querySelector('.code-editor').value.trim();
  return userCode === challenge.solution.trim();
}

function checkFillBlankAnswer(challenge) {
  const inputs = elements.challengeArea.querySelectorAll('.blank-input');
  let allCorrect = true;
  inputs.forEach((input, i) => {
    if (input.value.trim() !== challenge.blanks[i]) {
      allCorrect = false; input.classList.add('error-feedback');
    } else input.classList.add('success-feedback');
  });
  return allCorrect;
}

function checkDragDropAnswer(challenge) {
  const zones = document.querySelectorAll('.drop-zone');
  let allCorrect = true;
  zones.forEach((zone, i) => {
    if (zone.dataset.tag !== challenge.solution[i]) {
      allCorrect = false; zone.classList.add('error-feedback');
    } else zone.classList.add('success-feedback');
  });
  return allCorrect;
}

// Feedback
function showSuccessModal(points, badge) {
  elements.pointsEarned.textContent = points;
  if (badge) { elements.badgeEarned.style.display = 'block'; elements.badgeName.textContent = badge.name; }
  else elements.badgeEarned.style.display = 'none';
  updateStats(); elements.successModal.classList.add('active');
}
function showErrorFeedback() {
  elements.challengeArea.classList.add('error-feedback');
  setTimeout(() => elements.challengeArea.classList.remove('error-feedback'), 1000);
}
function updateStats() {
  elements.totalPoints.textContent = gameState.playerStats.totalPoints;
  elements.badgeCount.textContent = gameState.playerStats.badgesEarned;
  elements.streakCount.textContent = gameState.playerStats.streak;
}

// Sandbox functionality
function initSandbox() {
  elements.htmlEditor.addEventListener('input', updatePreview);
  updatePreview(); // Initial preview
}
function updatePreview() {
  const htmlCode = elements.htmlEditor.value;
  const previewDoc = elements.preview.contentDocument || elements.preview.contentWindow.document;
  previewDoc.open();
  previewDoc.write(htmlCode);
  previewDoc.close();
}

// Event listeners
function initEventListeners() {
  // Safe element checks before adding listeners
  if (elements.closeModal) {
    elements.closeModal.addEventListener('click', () => {
      elements.challengeModal?.classList.remove('active');
    });
  }

  if (elements.submitAnswer) {
    elements.submitAnswer.addEventListener('click', submitAnswer);
  }

  if (elements.continueBtn) {
    elements.continueBtn.addEventListener('click', () => {
      elements.successModal?.classList.remove('active');
      elements.challengeModal?.classList.remove('active');
      renderLevels(); // Re-render after modal close
    });
  }

  if (elements.showHint) {
    elements.showHint.addEventListener('click', () => {
      alert('Hint: Check the C Reference Guide for syntax examples!');
    });
  }
}

// ================================
// Progress application helpers
// ================================

// Count total completed challenges across all levels
function getOverallCompletedCount() {
  return gameState.levels.reduce((acc, lvl) => acc + lvl.challenges.filter(c => c.completed).length, 0);
}

// Mark first N challenges as completed (to apply saved progress)
function applySavedProgress(count) {
  let remaining = Math.max(0, count);
  // Reset all completions
  gameState.levels.forEach(lvl => {
    lvl.completed = false;
    lvl.unlocked = false;
    lvl.challenges.forEach(ch => { ch.completed = false; });
  });
  // Unlock the first level initially
  if (gameState.levels[0]) gameState.levels[0].unlocked = true;

  // Apply completions in order
  for (let li = 0; li < gameState.levels.length && remaining > 0; li++) {
    const level = gameState.levels[li];
    level.unlocked = true;
    for (let ci = 0; ci < level.challenges.length && remaining > 0; ci++) {
      level.challenges[ci].completed = true;
      remaining--;
    }
    // If all challenges in this level done, mark completed and unlock next
    const allDone = level.challenges.every(c => c.completed);
    level.completed = allDone;
    if (allDone && li + 1 < gameState.levels.length) {
      gameState.levels[li + 1].unlocked = true;
    }
  }
  gameState.updateProgress();
}

/// --- FRONTEND CHAT FUNCTION ---
async function sendAIMessage() {
  const message = aiChatInput?.value?.trim();
  if (!message) return;

  addMessage("user", message);
  aiChatInput.value = "";

  // Show typing indicator
  aiSendBtn.disabled = true;
  aiSendBtn.textContent = "AI thinking...";
  aiChatInput.disabled = true;

  try {
    // ✅ Call your backend instead of Perplexity directly
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Chat API error");
    }

    // ✅ Display AI reply from backend
    addMessage("ai", data.reply);

  } catch (error) {
    console.error("Chat Error:", error);
    addMessage("ai", "⚠️ AI temporarily unavailable.");
  } finally {
    aiSendBtn.disabled = false;
    aiSendBtn.textContent = "Send";
    aiChatInput.disabled = false;
    aiChatInput.focus();
  }
}

// --- MESSAGE RENDERER ---
function addMessage(sender, text) {
  if (!aiChatMessages) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "user-message" : "ai-message";

  // Support inline code formatting
  const formattedText = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  messageDiv.innerHTML = formattedText;

  aiChatMessages.appendChild(messageDiv);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}
function initGame() {
  // Initialize game state first
  if (!gameState) {
    console.error('GameState not initialized');
    return;
  }

  // Safe initialization order
  initNavigation();
  initEventListeners();
  initSandbox();
  updateStats();


  // Initial render
  renderLevels();
  renderBadges();
  renderReference();

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.email) {
    loadProgress(user.email).catch(e => {
      console.error('Progress load failed:', e);
      renderLevels(); // Fallback render
    });
  }
}

// Ensure DOM is ready before init
document.addEventListener('DOMContentLoaded', () => {
  // Initialize gameState FIRST
  window.gameState = new GameState();
  initGame();
});
