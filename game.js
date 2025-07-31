// Mr. Khokhar Quest: Full RPG Game (All Phases)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// ========== Assets ==========
const bgColor = "#66bb66";
const treeImage = new Image();
treeImage.src = "https://i.imgur.com/lJbLrkK.png"; // simple tree
const heroImage = new Image();
heroImage.src = "https://i.imgur.com/4LGAZ8p.png"; // player

// ========== Player ==========
const player = {
  x: 400,
  y: 300,
  size: 32,
  speed: 3,
  health: 100,
  weapon: "sword",
  inventory: ["sword", "bow", "shield"],
  questsCompleted: [],
};

// ========== Game State ==========
let keys = {};
let arrows = [];
let inDialog = false;
let currentDialog = "";
let dialogQueue = [];
let bossActive = false;

// ========== Enemies ==========
let monsters = [
  { x: 100, y: 100, size: 30, health: 60, color: "red" },
  { x: 600, y: 400, size: 30, health: 60, color: "blue" },
  { x: 300, y: 200, size: 30, health: 60, color: "purple" }
];

let boss = {
  x: 400,
  y: 100,
  size: 60,
  health: 300,
  active: false
};

// ========== NPCs ==========
const npcs = [
  {
    x: 200,
    y: 300,
    name: "Elder",
    dialog: ["Welcome, hero.", "Defeat all monsters and speak to me."],
    quest: {
      name: "Slay the Monsters",
      requirement: () => monsters.every(m => m.health <= 0),
      reward: "Key to Boss Cave"
    }
  },
  {
    x: 500,
    y: 500,
    name: "Merchant",
    dialog: ["Want a new bow? Prove you're worthy!"],
    quest: {
      name: "Talk to Elder First",
      requirement: () => player.questsCompleted.includes("Slay the Monsters"),
      reward: "Bow of Khokhar"
    }
  },
  {
    x: 100,
    y: 500,
    name: "Explorer",
    dialog: ["The cave is near...", "Be careful of the boss!"]
  }
];

// ========== Input ==========
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "1") player.weapon = "sword";
  if (e.key === "2") player.weapon = "bow";
  if (e.key === "3") player.weapon = "shield";
  if (e.key === " " && !inDialog) attack();
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ========== Movement & Logic ==========
function movePlayer() {
  if (inDialog) return;
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

function attack() {
  if (player.weapon === "bow") {
    arrows.push({ x: player.x, y: player.y, dx: 6, dy: 0 });
  } else if (player.weapon === "sword") {
    monsters.forEach((m) => {
      const d = Math.hypot(m.x - player.x, m.y - player.y);
      if (d < 50 && m.health > 0) m.health -= 20;
    });
    if (boss.active) {
      const d = Math.hypot(boss.x - player.x, boss.y - player.y);
      if (d < 60) boss.health -= 10;
    }
  }
}

function moveArrows() {
  arrows.forEach((arrow, i) => {
    arrow.x += arrow.dx;
    monsters.forEach((m) => {
      const d = Math.hypot(m.x - arrow.x, m.y - arrow.y);
      if (d < m.size && m.health > 0) {
        m.health -= 10;
        arrows.splice(i, 1);
      }
    });
    if (boss.active) {
      const d = Math.hypot(boss.x - arrow.x, boss.y - arrow.y);
      if (d < boss.size && boss.health > 0) {
        boss.health -= 5;
        arrows.splice(i, 1);
      }
    }
  });
}

function checkNPCs() {
  npcs.forEach((npc) => {
    const d = Math.hypot(npc.x - player.x, npc.y - player.y);
    if (d < 40 && keys["e"] && !inDialog) {
      dialogQueue = [...npc.dialog];
      if (npc.quest && npc.quest.requirement()) {
        dialogQueue.push("Quest Complete! Reward: " + npc.quest.reward);
        if (!player.questsCompleted.includes(npc.quest.name)) {
          player.questsCompleted.push(npc.quest.name);
          if (npc.quest.reward.includes("Bow")) player.inventory.push("bow");
        }
      }
      inDialog = true;
    }
  });
}

function nextDialog() {
  if (!inDialog) return;
  currentDialog = dialogQueue.shift();
  if (!currentDialog) inDialog = false;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") nextDialog();
});

// ========== Drawing ==========
function drawScene() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 12; i++) ctx.drawImage(treeImage, 70 * i, 100);
}

function drawPlayer() {
  ctx.drawImage(heroImage, player.x - 16, player.y - 16, 32, 32);
}

function drawMonsters() {
  monsters.forEach((m) => {
    if (m.health > 0) {
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();

      // Health bar
      ctx.fillStyle = "black";
      ctx.fillRect(m.x - 20, m.y - m.size - 15, 40, 5);
      ctx.fillStyle = "lime";
      ctx.fillRect(m.x - 20, m.y - m.size - 15, (m.health / 60) * 40, 5);
    }
  });
}

function drawBoss() {
  if (!boss.active || boss.health <= 0) return;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.size, 0, Math.PI * 2);
  ctx.fill();

  // Boss health bar
  ctx.fillStyle = "red";
  ctx.fillRect(200, 30, (boss.health / 300) * 400, 20);
  ctx.strokeStyle = "black";
  ctx.strokeRect(200, 30, 400, 20);
}

function drawNPCs() {
  npcs.forEach((npc) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(npc.name, npc.x - 20, npc.y - 20);
  });
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Weapon: " + player.weapon, 10, 20);
  ctx.fillText("Health: " + player.health, 10, 40);
  ctx.fillText("Inventory: " + player.inventory.join(", "), 10, 60);
  ctx.fillText("Quests: " + player.questsCompleted.join(", "), 10, 80);
}

function drawDialogBox() {
  if (!inDialog) return;
  ctx.fillStyle = "black";
  ctx.fillRect(100, 400, 600, 150);
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(currentDialog || "Press ENTER...", 120, 450);
}

// ========== Main Loop ==========
function gameLoop() {
  movePlayer();
  moveArrows();
  checkNPCs();
  if (!boss.active && monsters.every(m => m.health <= 0)) boss.active = true;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScene();
  drawPlayer();
  drawMonsters();
  drawBoss();
  drawNPCs();
  drawUI();
  drawDialogBox();

  requestAnimationFrame(gameLoop);
}

nextDialog();
gameLoop();
