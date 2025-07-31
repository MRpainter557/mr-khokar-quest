
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player, cursors, swordKey, sword, enemy, npc, text, questGiven = false;
let attackCooldown = 0;

function preload() {
    this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/dungeon.png');
    this.load.tilemapTiledJSON('map', 'https://labs.phaser.io/assets/tilemaps/maps/dungeon-01.json');
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/space-baddie.png');
    this.load.image('sword', 'https://labs.phaser.io/assets/sprites/sword.png');
    this.load.image('npc', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('dungeon', 'tiles');
    map.createLayer('Ground', tileset, 0, 0);

    player = this.physics.add.sprite(100, 100, 'player');
    player.setCollideWorldBounds(true);

    enemy = this.physics.add.sprite(400, 300, 'enemy');
    enemy.setVelocity(40, 40).setBounce(1, 1).setCollideWorldBounds(true);

    npc = this.physics.add.staticSprite(600, 100, 'npc');

    sword = this.physics.add.sprite(player.x, player.y, 'sword');
    sword.setVisible(false);

    cursors = this.input.keyboard.createCursorKeys();
    swordKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.physics.add.overlap(sword, enemy, hitEnemy, null, this);
    this.physics.add.overlap(player, npc, talkToNpc, null, this);

    text = this.add.text(10, 10, '', { fontSize: '16px', fill: '#ffffff' });
    text.setScrollFactor(0);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

function update() {
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

    if (Phaser.Input.Keyboard.JustDown(swordKey) && attackCooldown <= 0) {
        sword.setVisible(true);
        sword.setPosition(player.x + 40, player.y);
        attackCooldown = 20;
    }

    if (attackCooldown > 0) {
        attackCooldown--;
        if (attackCooldown === 0) sword.setVisible(false);
    }
}

function hitEnemy(sword, enemy) {
    enemy.disableBody(true, true);
    if (questGiven) {
        text.setText('You defeated the monster! Return to the NPC!');
    }
}

function talkToNpc(player, npc) {
    if (!questGiven) {
        text.setText('NPC: Brave hero! Defeat the monster in the dungeon!');
        questGiven = true;
    } else if (!enemy.active) {
        text.setText('NPC: Thank you, hero! You have completed your quest!');
    }
}
