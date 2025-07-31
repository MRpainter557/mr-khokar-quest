let player, cursors, sword, monsters, npcs, healthBar;
let health = 100;
let monsterHP = new Map();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('grass', 'https://labs.phaser.io/assets/tilemaps/tiles/grass.png');
  this.load.image('tree', 'https://labs.phaser.io/assets/sprites/tree.png');
  this.load.image('sword', 'https://labs.phaser.io/assets/sprites/sword.png');
  this.load.image('monster', 'https://labs.phaser.io/assets/sprites/space-baddie.png');
  this.load.image('npc', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  this.add.tileSprite(400, 300, 800, 600, 'grass');

  // Add some trees
  this.add.image(150, 150, 'tree').setScale(0.5);
  this.add.image(650, 100, 'tree').setScale(0.5);
  this.add.image(700, 500, 'tree').setScale(0.5);

  player = this.physics.add.sprite(400, 300, 'player').setScale(1.2);
  player.setCollideWorldBounds(true);

  sword = this.physics.add.sprite(player.x + 30, player.y, 'sword').setVisible(false).setScale(0.7);
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', () => {
    sword.setVisible(true);
    setTimeout(() => sword.setVisible(false), 200);
  });

  monsters = this.physics.add.group();
  spawnMonster(this, 200, 200);
  spawnMonster(this, 600, 400);

  npcs = this.physics.add.staticGroup();
  npcs.create(100, 500, 'npc').setScale(1.2).refreshBody();

  // Health bar
  healthBar = this.add.graphics();
  updateHealthBar();

  // Collisions
  this.physics.add.overlap(sword, monsters, hitMonster, null, this);
  this.physics.add.overlap(player, monsters, monsterHitPlayer, null, this);
  this.physics.add.overlap(player, npcs, talkToNPC, null, this);
}

function update() {
  player.setVelocity(0);
  if (cursors.left.isDown) player.setVelocityX(-160);
  if (cursors.right.isDown) player.setVelocityX(160);
  if (cursors.up.isDown) player.setVelocityY(-160);
  if (cursors.down.isDown) player.setVelocityY(160);

  sword.setPosition(player.x + 30, player.y);
}

function hitMonster(sword, monster) {
  let hp = monsterHP.get(monster) || 3;
  hp -= 1;
  if (hp <= 0) {
    monster.destroy();
    monsterHP.delete(monster);
  } else {
    monsterHP.set(monster, hp);
  }
}

function monsterHitPlayer(player, monster) {
  health -= 1;
  updateHealthBar();
  if (health <= 0) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.add.text(300, 250, 'Game Over!', { fontSize: '32px', fill: '#fff' });
  }
}

function updateHealthBar() {
  healthBar.clear();
  healthBar.fillStyle(0xff0000, 1);
  healthBar.fillRect(10, 10, health * 2, 20);
}

function talkToNPC(player, npc) {
  this.add.text(npc.x - 40, npc.y - 50, 'Find the monsters!', { fontSize: '12px', fill: '#fff' });
}

function spawnMonster(scene, x, y) {
  let monster = monsters.create(x, y, 'monster');
  monster.setCollideWorldBounds(true);
  monster.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
  monster.setBounce(1);
  monsterHP.set(monster, 3); // 3 hits to kill
}
