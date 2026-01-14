// --- Active quest and user state ---
let activeQuest = localStorage.getItem("activeQuest") || "python"; // "c" or "html"
let user = JSON.parse(localStorage.getItem("user")) || null;

// --- Progress constants ---
const MAX_LEVELS_PYTHON = 40;       // save up to 42 steps for Python
const STARS_PER_PYTHON_CHALLENGE = 15; // award per completed Python challenge

// --- Backend helpers ---
async function saveProgress(email, quest, levelValue, stars, badge) {
    try {
        const res = await fetch("http://localhost:3000/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                quest,          // "c" or "html" or "python"
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
                activeQuest === "python" ? (user.progress.python || 0) : (user.progress.html || 0);

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
} async function loadProgress(email) {
    try {
        const res = await fetch(`http://localhost:3000/profile/${email}`);
        const data = await res.json();

        if (data.success) {
            user = data.user;
            localStorage.setItem("user", JSON.stringify(user));

            // ✅ APPLY SAVED CHALLENGE PROGRESS
            const savedCount =
                activeQuest === "python"
                    ? (user.progress.python || 0)
                    : (user.progress.html || 0);

            applySavedProgress(savedCount);

            // ✅ APPLY SAVED BADGES
            const savedBadges = user.progress.badges || [];

            gameState.badges.forEach(badge => {
                if (savedBadges.includes(badge.name)) {
                    badge.earned = true;
                }
            });

            // ✅ UPDATE BADGE COUNT
            gameState.playerStats.badgesEarned =
                gameState.badges.filter(b => b.earned).length;

            updateStats();
            renderLevels();
            renderBadges();
        }
    } catch (e) {
        console.error("Load progress error:", e);
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
const userPythonEl = document.getElementById("userPython");
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
                userPythonEl.textContent = u.progress.python;
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
// C Quest - Game State Management
// ================================
class GameState {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "Beginner",
                description: "Learn the basics of Python programming",
                color: "#4CAF50",
                unlocked: true,
                completed: false,
                challenges: [
                    {
                        id: 1,
                        title: "Hello World Program",
                        type: "drag-drop",
                        description: "Arrange lines to form a valid Python program",
                        tags: [
                            "print(\"Hello World\")"
                        ],
                        solution: [
                            "print(\"Hello World\")"
                        ],
                        points: 100,
                        completed: false
                    },
                    {
                        id: 2,
                        title: "Data Types Quiz",
                        type: "quiz",
                        description: "Which data type stores whole numbers in Python?",
                        options: ["int", "float", "str", "bool"],
                        correct: 0,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 3,
                        title: "Print Syntax",
                        type: "fill-blank",
                        description: "Complete the statement: ___(\"Hello\")",
                        solution: "print",
                        points: 50,
                        completed: false
                    },
                    {
                        id: 4,
                        title: "Escape Sequences",
                        type: "quiz",
                        description: "Which escape sequence is used for newline in Python?",
                        options: ["\\n", "\\t", "\\r", "\\0"],
                        correct: 0,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 5,
                        title: "Variable Assignment",
                        type: "fill-blank",
                        description: "Complete code: x ___ 10",
                        solution: "=",
                        points: 50,
                        completed: false
                    },
                    {
                        id: 6,
                        title: "Addition Output",
                        type: "output",
                        description: "Predict output: print(2 + 3)",
                        solution: "5",
                        points: 50,
                        completed: false
                    },
                    {
                        id: 7,
                        title: "Match Data Types",
                        type: "match",
                        description: "Match data types with purpose",
                        pairs: [
                            { left: "int", right: "whole numbers" },
                            { left: "str", right: "text data" }
                        ],
                        points: 60,
                        completed: false
                    },
                    {
                        id: 8,
                        title: "Comments Quiz",
                        type: "quiz",
                        description: "Which symbol starts a single-line comment in Python?",
                        options: ["#", "//", "/*", "--"],
                        correct: 0,
                        points: 40,
                        completed: false
                    },
                    {
                        id: 9,
                        title: "Variable Concept",
                        type: "wh-question",
                        description: "Variable in Python is used for and what?",
                        keywords: ["store", "value"],
                        points: 50,
                        completed: false
                    },
                    {
                        id: 10,
                        title: "Simple Loop",
                        type: "drag-drop",
                        description: "Arrange code to print numbers 1 to 5",
                        tags: [
                            "for i in range(1, 6):",
                            "    print(i)"
                        ],
                        solution: [
                            "for i in range(1, 6):",
                            "    print(i)"
                        ],
                        points: 100,
                        completed: false
                    }
                ]
            },
            {
                id: 2,
                name: "Intermediate",
                description: "Learn control statements and data structures in Python",
                color: "#2196F3",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 11,
                        title: "If Statement Basics",
                        type: "drag-drop",
                        description: "Arrange lines to check if a number is positive",
                        tags: [
                            "x = 5",
                            "if x > 0:",
                            "    print(\"Positive\")"
                        ],
                        solution: [
                            "x = 5",
                            "if x > 0:",
                            "    print(\"Positive\")"
                        ],
                        points: 100,
                        completed: false
                    },
                    {
                        id: 12,
                        title: "Comparison Quiz",
                        type: "quiz",
                        description: "Which operator checks equality in Python?",
                        options: ["==", "=", "!=", "<>"],
                        correct: 0,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 13,
                        title: "Else Block Fill",
                        type: "fill-blank",
                        description: "Complete the keyword: if x > 0: ___:",
                        solution: "else",
                        points: 50,
                        completed: false
                    },
                    {
                        id: 14,
                        title: "If-Else Output",
                        type: "output",
                        description: "Predict output:\n\nx = 3\nif x % 2 == 0:\n    print(\"Even\")\nelse:\n    print(\"Odd\")",
                        solution: "Odd",
                        points: 60,
                        completed: false
                    },
                    {
                        id: 15,
                        title: "Match Conditions",
                        type: "match",
                        description: "Match operators with purpose",
                        pairs: [
                            { left: ">", right: "greater than" },
                            { left: "<", right: "less than" }
                        ],
                        points: 60,
                        completed: false
                    },
                    {
                        id: 16,
                        title: "While Loop Quiz",
                        type: "quiz",
                        description: "Which loop runs as long as a condition is true?",
                        options: ["while", "for", "loop", "repeat"],
                        correct: 0,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 17,
                        title: "Range Function",
                        type: "fill-blank",
                        description: "Complete code: for i in ___(5):",
                        solution: "range",
                        points: 50,
                        completed: false
                    },
                    {
                        id: 18,
                        title: "List Output",
                        type: "output",
                        description: "Predict output:\n\nnums = [1, 2, 3]\nprint(nums[1])",
                        solution: "2",
                        points: 60,
                        completed: false
                    },
                    {
                        id: 19,
                        title: "List Concept",
                        type: "wh-question",
                        description: "Why are lists used in Python?",
                        keywords: ["multiple values", "collection", "order"],
                        points: 60,
                        completed: false
                    },
                    {
                        id: 20,
                        title: "For Loop List",
                        type: "drag-drop",
                        description: "Arrange code to print all items in a list",
                        tags: [
                            "items = [\"a\", \"b\", \"c\"]",
                            "for item in items:",
                            "    print(item)"
                        ],
                        solution: [
                            "items = [\"a\", \"b\", \"c\"]",
                            "for item in items:",
                            "    print(item)"
                        ],
                        points: 100,
                        completed: false
                    }
                ]
            },
            {
                id: 3,
                name: "Master",
                description: "Master functions, dictionaries, and error handling in Python",
                color: "#FF9800",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 21,
                        title: "Function Definition",
                        type: "drag-drop",
                        description: "Arrange code to define and call a function",
                        tags: [
                            "def greet():",
                            "    print(\"Hello\")",
                            "greet()"
                        ],
                        solution: [
                            "def greet():",
                            "    print(\"Hello\")",
                            "greet()"
                        ],
                        points: 120,
                        completed: false
                    },
                    {
                        id: 22,
                        title: "Function Quiz",
                        type: "quiz",
                        description: "Which keyword is used to define a function in Python?",
                        options: ["def", "function", "fun", "define"],
                        correct: 0,
                        points: 80,
                        completed: false
                    },
                    {
                        id: 23,
                        title: "Return Fill",
                        type: "fill-blank",
                        description: "Complete code: return ___ + 2",
                        solution: "x",
                        points: 80,
                        completed: false
                    },
                    {
                        id: 24,
                        title: "Function Output",
                        type: "output",
                        description: "Predict output:\n\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))",
                        solution: "5",
                        points: 80,
                        completed: false
                    },
                    {
                        id: 25,
                        title: "Match Function Terms",
                        type: "match",
                        description: "Match terms with meaning",
                        pairs: [
                            { left: "parameter", right: "variable in function definition" },
                            { left: "argument", right: "value passed to function" }
                        ],
                        points: 90,
                        completed: false
                    },
                    {
                        id: 26,
                        title: "Dictionary Quiz",
                        type: "quiz",
                        description: "Which data type stores key–value pairs?",
                        options: ["dict", "list", "tuple", "set"],
                        correct: 0,
                        points: 90,
                        completed: false
                    },
                    {
                        id: 27,
                        title: "Dictionary Fill",
                        type: "fill-blank",
                        description: "Complete code: student = {\"name\": \"Alex\", ___: 20}",
                        solution: "\"age\"",
                        points: 90,
                        completed: false
                    },
                    {
                        id: 28,
                        title: "Dictionary Output",
                        type: "output",
                        description: "Predict output:\n\nperson = {\"name\": \"Sam\", \"age\": 21}\nprint(person[\"age\"])",
                        solution: "21",
                        points: 90,
                        completed: false
                    },
                    {
                        id: 29,
                        title: "Exception Concept",
                        type: "wh-question",
                        description: "Why is exception handling important in Python?",
                        keywords: ["errors", "crash", "handling"],
                        points: 100,
                        completed: false
                    },
                    {
                        id: 30,
                        title: "Try-Except Block",
                        type: "drag-drop",
                        description: "Arrange code to handle division by zero",
                        tags: [
                            "try:",
                            "    print(10 / 0)",
                            "except ZeroDivisionError:",
                            "    print(\"Error\")"
                        ],
                        solution: [
                            "try:",
                            "    print(10 / 0)",
                            "except ZeroDivisionError:",
                            "    print(\"Error\")"
                        ],
                        points: 120,
                        completed: false
                    }
                ]
            },
            {
                id: 4,
                name: "Expert",
                description: "Advanced Python concepts and real-world usage",
                color: "#9C27B0",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 31,
                        title: "Class Creation",
                        type: "drag-drop",
                        description: "Arrange code to create a simple class",
                        tags: [
                            "class Person:",
                            "    def __init__(self, name):",
                            "        self.name = name"
                        ],
                        solution: [
                            "class Person:",
                            "    def __init__(self, name):",
                            "        self.name = name"
                        ],
                        points: 140,
                        completed: false
                    },
                    {
                        id: 32,
                        title: "OOP Quiz",
                        type: "quiz",
                        description: "Which keyword is used to create a class in Python?",
                        options: ["class", "object", "struct", "define"],
                        correct: 0,
                        points: 100,
                        completed: false
                    },
                    {
                        id: 33,
                        title: "Self Keyword",
                        type: "fill-blank",
                        description: "Complete code: ___ .age = age",
                        solution: "self",
                        points: 100,
                        completed: false
                    },
                    {
                        id: 34,
                        title: "Object Output",
                        type: "output",
                        description: "Predict output:\n\nclass A:\n    def __init__(self):\n        self.x = 5\n\nobj = A()\nprint(obj.x)",
                        solution: "5",
                        points: 100,
                        completed: false
                    },
                    {
                        id: 35,
                        title: "Match OOP Terms",
                        type: "match",
                        description: "Match OOP terms with meaning",
                        pairs: [
                            { left: "class", right: "blueprint of object" },
                            { left: "object", right: "instance of class" }
                        ],
                        points: 120,
                        completed: false
                    },
                    {
                        id: 36,
                        title: "Inheritance Quiz",
                        type: "quiz",
                        description: "Which concept allows a class to reuse another class?",
                        options: ["inheritance", "polymorphism", "encapsulation", "abstraction"],
                        correct: 0,
                        points: 120,
                        completed: false
                    },
                    {
                        id: 37,
                        title: "File Handling Fill",
                        type: "fill-blank",
                        description: "Complete code: file = open(\"data.txt\", \"___\")",
                        solution: "r",
                        points: 110,
                        completed: false
                    },
                    {
                        id: 38,
                        title: "File Output",
                        type: "output",
                        description: "What does open(\"file.txt\", \"w\") do?",
                        solution: "Opens file for writing",
                        points: 110,
                        completed: false
                    },
                    {
                        id: 39,
                        title: "Lambda Concept",
                        type: "wh-question",
                        description: "Why are lambda functions used in Python?",
                        keywords: ["short", "anonymous", "functions"],
                        points: 120,
                        completed: false
                    },
                    {
                        id: 40,
                        title: "Lambda Expression",
                        type: "drag-drop",
                        description: "Arrange code to create a lambda function",
                        tags: [
                            "add = lambda a, b:",
                            "a + b",
                            "print(add(2, 3))"
                        ],
                        solution: [
                            "add = lambda a, b:",
                            "a + b",
                            "print(add(2, 3))"
                        ],
                        points: 150,
                        completed: false
                    }
                ]
            }
        ];

        this.badges = [
            { name: "First Steps", description: "Complete your first Python challenge", icon: "🥾", requirement: "complete_first_challenge", earned: false },
            { name: "Loop Master", description: "Master all loop challenges", icon: "🔄", requirement: "complete_loop_challenges", earned: false },
            { name: "Function Pro", description: "Solve function challenges", icon: "📌", requirement: "complete_function_challenge", earned: false },
            { name: "OOP Specialist", description: "Solve class & object challenges", icon: "🧩", requirement: "complete_oop_challenge", earned: false },
            { name: "Python Expert", description: "Complete all levels", icon: "👑", requirement: "complete_all_levels", earned: false }
        ];

        this.pythonReference = [
            { tag: "print()", description: "Prints output to the console", example: "print(\"Hello World\")" },
            { tag: "input()", description: "Reads input from the user", example: "name = input(\"Enter your name: \")" },
            { tag: "int, float, str, bool", description: "Basic Python data types", example: "x = 10  # int\ny = 3.14  # float\nname = 'Alice'  # str\nflag = True  # bool" },
            { tag: "for loop", description: "Iterates over a sequence", example: "for i in range(5):\n    print(i)" },
            { tag: "while loop", description: "Repeats code while a condition is true", example: "i = 0\nwhile i < 5:\n    print(i)\n    i += 1" },
            { tag: "def function()", description: "Defines a function", example: "def greet(name):\n    print(f\"Hello, {name}\")" },
            { tag: "class", description: "Defines a class", example: "class Person:\n    def __init__(self, name):\n        self.name = name" }
        ];


        this.playerStats = { totalPoints: 0, streak: 0, badgesEarned: 0 };
        this.currentChallenge = null;

        async function loadLeaderboard(quest = "python") {
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

        loadLeaderboard("python"); // or "c"
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
        const completedCount = this.levels.reduce(
            (sum, lvl) => sum + lvl.challenges.filter(c => c.completed).length,
            0
        );

        let newlyEarned = null;

        const unlock = (index) => {
            if (!this.badges[index].earned) {
                this.badges[index].earned = true;
                this.playerStats.badgesEarned++;
                newlyEarned = this.badges[index];
            }
        };

        // 🥾 After 1 challenge
        if (completedCount >= 1) unlock(0);

        // 🔄 After 20 challenges
        if (completedCount >= 20) unlock(1);

        // 📌 After 30 challenges
        if (completedCount >= 30) unlock(2);

        // 🧩 After 40 challenges
        if (completedCount >= 40) unlock(3);

        // 👑 C Expert → only if all others earned
        const allPreviousEarned = this.badges
            .slice(0, 4)
            .every(b => b.earned);

        if (allPreviousEarned) unlock(4);

        return newlyEarned;
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
    cEditor: document.getElementById('cEditor'),
    cOutput: document.getElementById('cOutput'),
    badgesGrid: document.getElementById('badgesGrid'),
    referenceContent: document.getElementById('referenceContent'),
    navTabs: document.querySelectorAll('.nav-tab'),
    gameSections: document.querySelectorAll('.game-section')
};

// ================================
// AI Chat Elements - FIXED
// ================================
const aiChatInput = document.getElementById("aiChatInput");
const aiSendBtn = document.getElementById("aiSendBtn");
const aiChatMessages = document.getElementById("aiChatMessages");
const aiChatToggle = document.getElementById("aiChatBtn");     // ✅ Matches HTML
const aiChatBox = document.getElementById("aiChatPanel");      // ✅ Matches HTML


// Navigation
function initNavigation() {
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSection = tab.dataset.tab;
            switchSection(targetSection);
        });
    });
}

function initAIChat() {
  console.log("✅ initAIChat running");

  if (!aiSendBtn || !aiChatInput || !aiChatMessages) {
    console.error("❌ AI Chat elements missing");
    return;
  }

  aiSendBtn.addEventListener("click", sendAIMessage);

  aiChatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAIMessage();
    }
  });

  if (aiChatToggle && aiChatBox) {
    aiChatToggle.addEventListener("click", () => {
      aiChatBox.classList.toggle("active");
    });
  }

  const closeBtn = document.getElementById("closeAiChat");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      aiChatBox.classList.remove("active");
    });
  }
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
// C Quest - Rendering Functions
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
    gameState.pythonReference.forEach(item => {
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
// C Quest - Challenges & Feedback
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
        case 'quiz':
            renderQuizChallenge(challenge);
            break;
        case 'code-editor':
            renderCodeEditorChallenge(challenge);
            break;
        case 'fill-blank':
        case 'output':   // ✅ ADD THIS
            renderFillBlankChallenge(challenge);
            break;
        case 'drag-drop':
            renderDragDropChallenge(challenge);
            break;
        case 'match':
            renderMatchChallenge(challenge);
            break;
        case 'wh-question':
            renderWhQuestionChallenge(challenge);
            break;

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
    editorContainer.innerHTML = `<textarea class="code-editor" rows="8" placeholder="Type your Python code here..."></textarea>`;
    elements.challengeArea.appendChild(editorContainer);
}

function renderFillBlankChallenge(challenge) {
    const container = document.createElement('div');
    container.className = 'fill-blank-container';

    // OUTPUT TYPE → show single answer input
    if (challenge.type === "output") {
        container.innerHTML = `
      <p>${challenge.description}</p>
      <input 
        type="text" 
        class="blank-input"
        data-index="0"
        placeholder="Enter output"
      />
    `;

        elements.challengeArea.appendChild(container);

        // Store solution as single-item array for consistency
        challenge.blanks = challenge.solution ? [challenge.solution.trim()] : [];
        return;
    }

    // DEFAULT / FILL-BLANK TYPE
    let template = challenge.description || "";

    // Find blanks safely
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

function renderWhQuestionChallenge(challenge) {
    const container = document.createElement("div");
    container.className = "wh-question-container";

    container.innerHTML = `
    <textarea 
      class="wh-answer"
      rows="5"
      placeholder="Type your answer here..."
    ></textarea>
  `;

    elements.challengeArea.appendChild(container);
}


function checkWhQuestionAnswer(challenge) {
    const textarea = document.querySelector(".wh-answer");
    if (!textarea) return false;

    const userAnswer = textarea.value.toLowerCase();

    let matchCount = 0;

    challenge.keywords.forEach(keyword => {
        if (userAnswer.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    });

    // ✅ Require at least 1 keywords
    const isCorrect = matchCount >= 1;

    textarea.classList.add(
        isCorrect ? "success-feedback" : "error-feedback"
    );

    return isCorrect;
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
        case 'output':   // ✅ ADD THIS
            isCorrect = checkFillBlankAnswer(challenge);
            break;
        case 'drag-drop':
            isCorrect = checkDragDropAnswer(challenge);
            break;
        case 'match':
            isCorrect = checkMatchAnswer(challenge);
            break;
        case 'wh-question':
            isCorrect = checkWhQuestionAnswer(challenge);
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
            const quest = 'python'; // or activeQuest if you switch between C / HTML
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

function renderMatchChallenge(challenge) {
    const container = document.createElement("div");
    container.className = "match-container";

    const leftCol = document.createElement("div");
    const rightCol = document.createElement("div");
    leftCol.className = "match-column left";
    rightCol.className = "match-column right";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("match-lines");

    let selectedLeft = null;
    challenge.userPairs = {};

    challenge.pairs.forEach((pair, i) => {
        const left = document.createElement("div");
        left.className = "match-item";
        left.textContent = pair.left;
        left.dataset.index = i;

        left.onclick = () => {
            document.querySelectorAll(".match-item").forEach(x => x.classList.remove("active"));
            left.classList.add("active");
            selectedLeft = left;
        };

        leftCol.appendChild(left);
    });

    [...challenge.pairs]
        .sort(() => Math.random() - 0.5)
        .forEach((pair, i) => {
            const right = document.createElement("div");
            right.className = "match-item";
            right.textContent = pair.right;
            right.dataset.value = pair.right;

            right.onclick = () => {
                if (!selectedLeft) return;

                drawLine(svg, selectedLeft, right);
                challenge.userPairs[selectedLeft.textContent] = right.textContent;
                selectedLeft.classList.remove("active");
                selectedLeft = null;
            };

            rightCol.appendChild(right);
        });

    container.append(leftCol, svg, rightCol);
    elements.challengeArea.appendChild(container);
}

function drawLine(svg, leftEl, rightEl) {
    const rect1 = leftEl.getBoundingClientRect();
    const rect2 = rightEl.getBoundingClientRect();
    const parentRect = svg.getBoundingClientRect();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", rect1.right - parentRect.left);
    line.setAttribute("y1", rect1.top + rect1.height / 2 - parentRect.top);
    line.setAttribute("x2", rect2.left - parentRect.left);
    line.setAttribute("y2", rect2.top + rect2.height / 2 - parentRect.top);
    line.setAttribute("stroke", "#4CAF50");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);
}

function checkMatchAnswer(challenge) {
    return challenge.pairs.every(
        p => challenge.userPairs[p.left] === p.right
    );
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

let sandboxInitialized = false;

function initSandbox() {
    // Prevent re-initializing multiple times
    if (sandboxInitialized) return;

    const pyEditor = document.getElementById("pyEditor");
    const pyOutput = document.getElementById("pyOutput");

    if (!pyEditor || !pyOutput) {
        console.warn("⚠️ Python sandbox elements not found");
        return;
    }

    function updatePyOutput() {
        const code = pyEditor.value;
        const lines = code.split("\n");
        const output = [];

        lines.forEach(line => {
            // match: print("text") or print('text')
            const match = line.match(/print\s*\(\s*["'](.+?)["']\s*\)/);
            if (match) {
                output.push(match[1]);
            }
        });

        pyOutput.textContent = output.length
            ? output.join("\n")
            : "(no output)";
    }

    // Live output update
    pyEditor.addEventListener("input", updatePyOutput);

    // Initial render
    updatePyOutput();

    sandboxInitialized = true;
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
            alert('Hint: Check the Python Reference Guide for syntax examples!');
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
  console.log("📤 Sending AI message");

  const message = aiChatInput.value.trim();
  if (!message) return;

  aiChatMessages.innerHTML += `
    <div class="user-msg">${message}</div>
  `;
  aiChatInput.value = "";

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    console.log("📥 AI response:", data);

    aiChatMessages.innerHTML += `
      <div class="ai-msg">${data.reply}</div>
    `;
  } catch (err) {
    console.error("❌ AI fetch failed", err);
    aiChatMessages.innerHTML += `
      <div class="ai-msg">AI not responding</div>
    `;
  }

  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
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
    initAIChat();
    initGame();
});