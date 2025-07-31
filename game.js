const config = {
  type: Phaser.AUTO, width: 800, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let player, cursors, sword, swordKey, swordCooldown = 0;
let enemies = [], npcs = [], messageText, winTextShown = false;
let health = 100, healthBar, healthText, gameOver = false;
let questsCompleted = 0;

function preload() {
  this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/forest.png');
  this.load.tilemapTiledJSON('map', 'https://labs.phaser.io/assets/tilemaps/maps/forest.json');
  this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth:32, frameHeight:48 });
  this.load.image('enemy', 'https://i.imgur.com/O6aXh0J.png'); // cool monster sprite
  this.load.image('sword', 'https://i.imgur.com/urD5wT3.png');
  this.load.image('npc', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('forest', 'tiles');
  map.createLayer('Ground', tileset, 0, 0);

  player = this.physics.add.sprite(100, 100, 'player');
  player.setCollideWorldBounds(true);

  addEnemy(this, 400, 200);
  addEnemy(this, 600, 300);
  addEnemy(this, 250, 450);

  npcs.push(this.physics.add.staticSprite(700, 100, 'npc'));
  npcs.push(this.physics.add.staticSprite(100, 500, 'npc'));

  sword = this.physics.add.sprite(player.x, player.y, 'sword').setScale(1.2);
  sword.setVisible(false);

  cursors = this.input.keyboard.createCursorKeys();
  swordKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  this.physics.add.overlap(player, npcs[0], () => showMessage("NPC: Defeat all monsters!"), null, this);
  this.physics.add.overlap(player, npcs[1], () => {
    if (questsCompleted >= enemies.length) showMessage("NPC: Thank you, hero!"); 
    else showMessage("NPC: Monsters still remain!");
  }, null, this);

  messageText = this.add.text(10, 10, '', { font: '16px Arial', fill: '#ffffff' });
  healthBar = this.add.graphics();
  updateHealthBar();
  healthText = this.add.text(10, 30, 'Health: 100', { font: '16px Arial', fill: '#ff0000' });

  this.anims.create({ key:'left', frames:this.anims.generateFrameNumbers('player',{ start:0, end:3 }), frameRate:10, repeat:-1 });
  this.anims.create({ key:'right', frames:this.anims.generateFrameNumbers('player',{ start:5, end:8 }), frameRate:10, repeat:-1 });
  this.anims.create({ key:'turn', frames:[{ key:'player', frame:4 }], frameRate:20 });
}

function update() {
  if (gameOver) return;
  player.setVelocity(0);
  if (cursors.left.isDown) { player.setVelocityX(-160); player.anims.play('left', true); }
  else if (cursors.right.isDown) { player.setVelocityX(160); player.anims.play('right', true); }
  else player.anims.play('turn');

  if (cursors.up.isDown) player.setVelocityY(-160);
  else if (cursors.down.isDown) player.setVelocityY(160);

  if (Phaser.Input.Keyboard.JustDown(swordKey) && swordCooldown <= 0) {
    sword.setVisible(true); sword.setPosition(player.x + 32, player.y); swordCooldown = 20;
  }
  if (swordCooldown > 0) { swordCooldown--; if (swordCooldown === 0) sword.setVisible(false); }

  enemies.forEach(enemy => {
    if (enemy.active && !gameOver) this.physics.moveToObject(enemy, player, 60);
  });

  if (!winTextShown && questsCompleted === enemies.length) {
    showMessage("🎉 You Win! All monsters defeated!");
    winTextShown = true;
  }
}

function hitEnemy(sword, enemy) {
  if (!enemy.active) return;
  enemy.health -= 1;
  if (enemy.health <= 0) {
    enemy.disableBody(true, true);
    questsCompleted++;
  }
}

function enemyHitPlayer(player, enemy) {
  if (!gameOver && enemy.active) {
    health -= 5;
    updateHealthBar();
    player.setVelocity(-100, -100);
    if (health <= 0) {
      gameOver = true;
      showMessage("💀 You Died! Refresh to try again.");
      player.setTint(0xff0000); player.setVelocity(0);
    }
  }
}

function updateHealthBar() {
  healthBar.clear();
  healthBar.fillStyle(0xff0000);
  healthBar.fillRect(10, 50, Math.max(0, health * 2), 16);
  if (healthText) healthText.setText('Health: ' + health);
}

function showMessage(text) {
  messageText.setText(text);
}

function addEnemy(scene, x, y) {
  const enemy = scene.physics.add.sprite(x, y, 'enemy');
  enemy.health = 3;
  enemy.setCollideWorldBounds(true);
  enemies.push(enemy);
  scene.physics.add.overlap(sword, enemy, hitEnemy, null, scene);
  scene.physics.add.overlap(player, enemy, enemyHitPlayer, null, scene);
}

