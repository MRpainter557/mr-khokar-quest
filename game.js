
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let hero = { x: 400, y: 300, size: 40, speed: 4 };

function drawHero() {
  ctx.fillStyle = "blue";
  ctx.fillRect(hero.x, hero.y, hero.size, hero.size);
}

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
  clearCanvas();
  drawHero();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") hero.y -= hero.speed;
  if (event.key === "ArrowDown") hero.y += hero.speed;
  if (event.key === "ArrowLeft") hero.x -= hero.speed;
  if (event.key === "ArrowRight") hero.x += hero.speed;
  update();
});

update();
