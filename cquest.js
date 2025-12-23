// --- Active quest and user state ---
let activeQuest = localStorage.getItem("activeQuest") || "c"; // "c" or "html"
let user = JSON.parse(localStorage.getItem("user")) || null;

// --- Progress constants ---
const MAX_LEVELS_C = 42;       // save up to 42 steps for C
const STARS_PER_C_CHALLENGE = 15; // award per completed C challenge

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
        activeQuest === "c" ? (user.progress.c || 0) : (user.progress.html || 0);

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
        activeQuest === "c"
          ? (user.progress.c || 0)
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
        description: "Learn the basics of C program structure",
        color: "#4CAF50",
        unlocked: true,
        completed: false,
        challenges: [
          {
            id: 1,
            title: "Hello World Program",
            type: "drag-drop",
            description: "Arrange lines to form a valid C program",
            tags: ["#include <stdio.h>", "int main() {", "printf(\"Hello World\\n\");", "return 0;", "}"],
            solution: ["#include <stdio.h>", "int main() {", "printf(\"Hello World\\n\");", "return 0;", "}"],
            points: 100,
            completed: false
          },
          {
            id: 2,
            title: "Data Types Quiz",
            type: "quiz",
            description: "Which data type stores whole numbers in C?",
            options: ["int", "float", "char", "double"],
            correct: 0,
            points: 50,
            completed: false
          },
          {
            id: 3,
            title: "Printf Syntax",
            type: "fill-blank",
            description: "Complete the statement: ___(\"Hello\");",
            solution: "printf",
            points: 50,
            completed: false
          },
          {
            id: 4,
            title: "Escape Sequences",
            type: "quiz",
            description: "Which escape sequence is used for newline?",
            options: ["\\n", "\\t", "\\r", "\\0"],
            correct: 0,
            points: 50,
            completed: false
          },
          {
            id: 5,
            title: "Variable Declaration",
            type: "fill-blank",
            description: "Complete code: ___ x = 10;",
            solution: "int",
            points: 50,
            completed: false
          },
          {
            id: 6,
            title: "Addition Output",
            type: "output",
            description: "Predict output: printf(\"%d\", 2+3);",
            solution: "5",
            points: 50,
            completed: false
          },
          {
            id: 7,
            title: "Match Keywords",
            type: "match",
            description: "Match keywords with purpose",
            pairs: [
              { left: "int", right: "integer type" },
              { left: "char", right: "character type" }
            ],
            points: 60,
            completed: false
          },
          {
            id: 8,
            title: "Comments Quiz",
            type: "quiz",
            description: "Which symbol starts a single-line comment?",
            options: ["//", "/*", "#", "--"],
            correct: 0,
            points: 40,
            completed: false
          },
          {
            id: 9,
            title: "Variable Concept",
            type: "wh-question",
            description: "Variable in C is used for and what?",
            keywords: ["store", "value"],
            points: 50,
            completed: false
          },
          {
            id: 10,
            title: "Simple Loop",
            type: "drag-drop",
            description: "Arrange code to print numbers 1 to 5",
            tags: ["for(int i=1;i<=5;i++){", "printf(\"%d\\n\", i);", "}"],
            solution: ["for(int i=1;i<=5;i++){", "printf(\"%d\\n\", i);", "}"],
            points: 100,
            completed: false
          }
        ]
      },

      {
        id: 2,
        name: "Intermediate",
        description: "Master input/output, operators, and conditionals",
        color: "#2196F3",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 11,
            title: "Operators Quiz",
            type: "quiz",
            description: "Which operator is used for equality comparison?",
            options: ["=", "==", "!=", "<="],
            correct: 1,
            points: 60,
            completed: false
          },
          {
            id: 12,
            title: "Array Output",
            type: "output",
            description: "Predict output:\nint arr[3]={1,2,3}; printf(\"%d\", arr[1]);",
            solution: "2",
            points: 60,
            completed: false
          },
          {
            id: 13,
            title: "Switch Case",
            type: "drag-drop",
            description: "Arrange code for a switch statement",
            tags: ["switch(x){", "case 1: printf(\"One\"); break;", "default: printf(\"Other\");", "}"],
            solution: ["switch(x){", "case 1: printf(\"One\"); break;", "default: printf(\"Other\");", "}"],
            points: 100,
            completed: false
          },
          {
            id: 14,
            title: "Loop Types",
            type: "match",
            description: "Match loop types with use cases",
            pairs: [
              { left: "for", right: "fixed iterations" },
              { left: "while", right: "until condition" }
            ],
            points: 70,
            completed: false
          },
          {
            id: 15,
            title: "Function Declaration",
            type: "fill-blank",
            description: "Complete code: ___ sum(int a,int b);",
            solution: "int",
            points: 60,
            completed: false
          },
          {
            id: 16,
            title: "Scope Quiz",
            type: "quiz",
            description: "Which keyword defines a global variable?",
            options: ["static", "extern", "global", "public"],
            correct: 1,
            points: 70,
            completed: false
          },
          {
            id: 17,
            title: "String Output",
            type: "output",
            description: "Predict output: char str[]=\"C\"; printf(\"%s\", str);",
            solution: "C",
            points: 60,
            completed: false
          },
          {
            id: 18,
            title: "Why Loops?",
            type: "wh-question",
            description: "Why do we use loops in C?",
            keywords: ["repeat", "automation"],
            points: 50,
            completed: false
          },
          {
            id: 19,
            title: "Array Match",
            type: "match",
            description: "Match array functions with purpose",
            pairs: [
              { left: "memcpy", right: "copy memory" },
              { left: "strlen", right: "string length" }
            ],
            points: 80,
            completed: false
          },
          {
            id: 20,
            title: "Loop Output",
            type: "output",
            description: "Predict output: for(int i=0;i<3;i++){ printf(\"%d\", i); }",
            solution: "012",
            points: 70,
            completed: false
          }
        ]
      },

      {
        id: 3,
        name: "Advanced",
        description: "Work with loops, arrays, and functions",
        color: "#FF9800",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 21,
            title: "Pointer Basics",
            type: "quiz",
            description: "What does *ptr mean in C?",
            options: ["Address of ptr", "Value at address", "Multiply ptr", "None"],
            correct: 1,
            points: 80,
            completed: false
          },
          {
            id: 22,
            title: "Pointer Output",
            type: "output",
            description: "Predict output:\nint a=10; int *p=&a; printf(\"%d\", *p);",
            solution: "10",
            points: 80,
            completed: false
          },
          {
            id: 23,
            title: "Struct Fill",
            type: "fill-blank",
            description: "Complete code: struct ___ { int id; char name[20]; };",
            solution: "Student",
            points: 90,
            completed: false
          },
          {
            id: 24,
            title: "Algorithm Quiz",
            type: "quiz",
            description: "Which sorting algorithm has O(n log n) average complexity?",
            options: ["Bubble Sort", "Merge Sort", "Selection Sort"],
            correct: 1,
            points: 90,
            completed: false
          },
          {
            id: 25,
            title: "File Handling",
            type: "drag-drop",
            description: "Arrange code to open a file and write text",
            tags: ["FILE *f=fopen(\"data.txt\",\"w\");", "fprintf(f,\"Hello\");", "fclose(f);"],
            solution: ["FILE *f=fopen(\"data.txt\",\"w\");", "fprintf(f,\"Hello\");", "fclose(f);"],
            points: 120,
            completed: false
          },
          {
            id: 26,
            title: "Dynamic Memory Quiz",
            type: "quiz",
            description: "Which function allocates memory dynamically?",
            options: ["malloc", "calloc", "realloc", "All of the above"],
            correct: 3,
            points: 100,
            completed: false
          },
          {
            id: 27,
            title: "Recursion Output",
            type: "output",
            description: "Predict output:\nint fact(int n){ if(n==0) return 1; else return n*fact(n-1);} printf(\"%d\", fact(3));",
            solution: "6",
            points: 90,
            completed: false
          },
          {
            id: 28,
            title: "Macro Quiz",
            type: "quiz",
            description: "Which directive defines a macro in C?",
            options: ["#define", "#macro", "#include", "#ifdef"],
            correct: 0,
            points: 70,
            completed: false
          },
          {
            id: 29,
            title: "Bitwise AND",
            type: "output",
            description: "Predict output: int a=6, b=3; printf(\"%d\", a & b);",
            solution: "2",
            points: 80,
            completed: false
          },
          {
            id: 30,
            title: "Command Line Args",
            type: "fill-blank",
            description: "Complete code: int main(___, ___) { }",
            solution: "int argc, char *argv[]",
            points: 100,
            completed: false
          }
        ]
      },

      {
        id: 4,
        name: "Expert",
        description: "Structures, file handling, and advanced debugging",
        color: "#9C27B0",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 31,
            title: "Pointer Arithmetic",
            type: "quiz",
            description: "If p points to arr[0], what does *(p+2) return?",
            options: ["arr[0]", "arr[1]", "arr[2]", "Error"],
            correct: 2,
            points: 90,
            completed: false
          },
          {
            id: 32,
            title: "Union Output",
            type: "output",
            description: "Predict output:\nunion U { int x; char c; }; union U u; u.x=65; printf(\"%c\", u.c);",
            solution: "A",
            points: 100,
            completed: false
          },
          {
            id: 33,
            title: "Storage Classes Match",
            type: "match",
            description: "Match storage classes with scope",
            pairs: [
              { left: "auto", right: "local scope" },
              { left: "extern", right: "global scope" }
            ],
            points: 80,
            completed: false
          },
          {
            id: 34,
            title: "Dynamic Memory Output",
            type: "output",
            description: "Predict output:\nint *p=malloc(sizeof(int)); *p=42; printf(\"%d\", *p);",
            solution: "42",
            points: 100,
            completed: false
          },
          {
            id: 35,
            title: "Linked List Traversal",
            type: "wh-question",
            description: "Explain how to traverse a linked list in C.",
            keywords: ["node", "next", "loop"],
            points: 120,
            completed: false
          },
          {
            id: 36,
            title: "Stack Implementation",
            type: "drag-drop",
            description: "Arrange code to implement push operation in stack using array",
            tags: ["void push(int x){", "stack[++top]=x;", "}"],
            solution: ["void push(int x){", "stack[++top]=x;", "}"],
            points: 150,
            completed: false
          },
          {
            id: 37,
            title: "Queue Quiz",
            type: "quiz",
            description: "Which operation removes element from front of queue?",
            options: ["push", "pop", "dequeue", "enqueue"],
            correct: 2,
            points: 100,
            completed: false
          },
          {
            id: 38,
            title: "File Read Output",
            type: "output",
            description: "Predict output if file 'data.txt' contains 'Hi':\nFILE *f=fopen(\"data.txt\",\"r\"); char str[10]; fscanf(f,\"%s\",str); printf(\"%s\",str);",
            solution: "Hi",
            points: 120,
            completed: false
          },
          {
            id: 39,
            title: "Error Handling Fill",
            type: "fill-blank",
            description: "Complete code: if(f==NULL){ ___(\"Error\"); }",
            solution: "printf",
            points: 80,
            completed: false
          },
          {
            id: 40,
            title: "System Design WH",
            type: "wh-question",
            description: "How would you design a hash table in C?",
            keywords: ["array", "hash function", "collision"],
            points: 150,
            completed: false
          },
          {
            id: 41,
            title: "Binary Tree Traversal",
            type: "quiz",
            description: "Which traversal visits root, left, right?",
            options: ["Inorder", "Preorder", "Postorder"],
            correct: 1,
            points: 120,
            completed: false
          },
          {
            id: 42,
            title: "Recursion Drag-Drop",
            type: "drag-drop",
            description: "Arrange code to compute Fibonacci recursively",
            tags: ["int fib(int n){", "if(n<=1) return n;", "return fib(n-1)+fib(n-2);", "}"],
            solution: ["int fib(int n){", "if(n<=1) return n;", "return fib(n-1)+fib(n-2);", "}"],
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

    async function loadLeaderboard(quest = "c") {
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

    loadLeaderboard("c"); // or "c"
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

    // 🧩 After 42 challenges
    if (completedCount >= 42) unlock(3);

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
  editorContainer.innerHTML = `<textarea class="code-editor" rows="8" placeholder="Type your C code here..."></textarea>`;
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
      const quest = 'c'; // or activeQuest if you switch between C / HTML
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

// Sandbox Simulation
function initSandbox() {
  elements.cEditor.addEventListener('input', updateCOutput);
  updateCOutput();
}
function updateCOutput() {
  const code = elements.cEditor.value;
  // Simple simulation: detect printf statements and show output
  const match = code.match(/printf\("([^"]*)"/);
  elements.cOutput.textContent = match ? match[1] : "(no output)";
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