const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player, cursors, sword, swordKey, swordCooldown = 0;
let enemy, npc1, npc2, messageText, winTextShown = false;
let quest1Done = false, quest2Done = false;
let health = 100, healthBar, healthText, gameOver = false;

function preload() {
  this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/gridtiles.png');
  this.load.tilemapTiledJSON('map', 'https://labs.phaser.io/assets/tilemaps/maps/dungeon-01.json');
  this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/blue_ball.png');
  this.load.image('sword', 'https://labs.phaser.io/assets/sprites/sword.png');
  this.load.image('npc', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('gridtiles', 'tiles');
  map.createLayer('Ground', tileset, 0, 0);

  player = this.physics.add.sprite(100, 100, 'player');
  player.setCollideWorldBounds(true);

  enemy = this.physics.add.sprite(400, 300, 'enemy');
  enemy.setVelocity(80, 70).setBounce(1, 1).setCollideWorldBounds(true);

  npc1 = this.physics.add.staticSprite(700, 100, 'npc');
  npc2 = this.physics.add.staticSprite(100, 500, 'npc');

  sword = this.physics.add.sprite(player.x, player.y, 'sword').setScale(1.2);
  sword.setVisible(false);

  cursors = this.input.keyboard.createCursorKeys();
  swordKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  this.physics.add.overlap(sword, enemy, hitEnemy, null, this);
  this.physics.add.overlap(player, npc1, interactNpc1, null, this);
  this.physics.add.overlap(player, npc2, interactNpc2, null, this);
  this.physics.add.overlap(player, enemy, enemyHitPlayer, null, this);

  messageText = this.add.text(10, 10, '', { font: '16px Arial', fill: '#ffffff' });

  // Health bar setup
  healthBar = this.add.graphics();
  updateHealthBar();

  healthText = this.add.text(10, 30, 'Health: 100', { font: '16px Arial', fill: '#ff0000' });

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'player', frame: 4 }],
    frameRate: 20
  });
}

function update() {
  if (gameOver) return;

  player.setVelocity(0);
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.anims.play('turn');
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }

  if (Phaser.Input.Keyboard.JustDown(swordKey) && swordCooldown <= 0) {
    sword.setVisible(true);
    sword.setPosition(player.x + 32, player.y);
    swordCooldown = 20;
  }

  if (swordCooldown > 0) {
    swordCooldown--;
    if (swordCooldown === 0) sword.setVisible(false);
  }

  if (quest1Done && !winTextShown) {
    messageText.setText('🎉 You Win! Monster defeated! 🎉');
    winTextShown = true;
  }
}

function hitEnemy(sword, enemy) {
  enemy.disableBody(true, true);
  quest1Done = true;
}

function interactNpc1(player, npc) {
  messageText.setText(quest1Done ? "NPC 1: Thank you, hero!" : "NPC 1: Please defeat the monster!");
}

function interactNpc2(player, npc) {
  messageText.setText(quest2Done ? "NPC 2: You're a legend!" : "NPC 2: Help! My pet is missing!");
  quest2Done = true;
}

function enemyHitPlayer(player, enemy) {
  health -= 1;
  updateHealthBar();

  if (health <= 0 && !gameOver) {
    gameOver = true;
    messageText.setText("💀 You Died! Refresh to try again.");
    player.setTint(0xff0000);
    player.setVelocity(0);
    enemy.setVelocity(0);
  }
}

function updateHealthBar() {
  healthBar.clear();
  healthBar.fillStyle(0xff0000);
  healthBar.fillRect(10, 50, Math.max(0, health * 2), 16);
  if (healthText) {
    healthText.setText('Health: ' + health);
  }
}
