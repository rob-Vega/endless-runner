import * as Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth > 800 ? 800 : window.innerWidth,
  height: 300,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// Game objects
let ground;
let player;
let enemies;

// Input
let cursors;
let pointer;

// Score-related
let score = 0;
let scoreText;
let scoreEvent;

// Game state
let gameOver = false;
let gameOverText;

// Events
let spawnEvent;

// Sounds
let jumpSfx;
let gameOverSound;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/ground.png");
  this.load.spritesheet("player", "assets/tilemapCharacters.png", {
    frameWidth: 24,
    frameHeight: 24,
  });
  this.load.spritesheet("enemy", "assets/tilemapCharacters.png", {
    frameWidth: 24,
    frameHeight: 24,
  });
  this.load.audio("jumpSfx", "audio/sfxJump.mp3");
  this.load.audio("gameOver", "audio/gameOver.wav");
}

function create() {
  // Game state
  gameOver = false;

  // Background
  this.add.image(400, 150, "sky");

  // Ground and player
  ground = this.physics.add.staticImage(400, 320, "ground");
  player = this.physics.add
    .sprite(80, 100, "player")
    .setScale(3)
    .setBounce(0.1)
    .setFlipX(true)
    .setSize(14, 24);

  // Enemy group
  enemies = this.physics.add.group();

  // Text
  scoreText = this.add.text(15, 15, "Puntos: 0", {
    fill: "#fff",
    font: "500 32px PixelifySans",
  });

  gameOverText = this.add.text(15, 50, "GAME OVER", {
    font: "500 32px PixelifySans",
    fill: "#ff0000",
  });
  gameOverText.visible = false;

  // Sound effects
  jumpSfx = this.sound.add("jumpSfx");
  gameOverSound = this.sound.add("gameOver");

  // Physics collisions
  this.physics.add.collider(player, ground);
  this.physics.add.collider(enemies, ground);
  this.physics.add.overlap(player, enemies, hit, null, this);

  // Events
  spawnEvent = this.time.addEvent({
    delay: 1000,
    callback: spawnEnemyWithRandomDelay,
    callbackScope: this,
    loop: true,
  });

  scoreEvent = this.time.addEvent({
    delay: 1000,
    callback: addScore,
    callbackScope: this,
    loop: true,
  });

  // Animations
  this.anims.create({
    key: "playerWalk",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1,
  });
  player.anims.play("playerWalk");

  this.anims.create({
    key: "enemyWalk",
    frames: this.anims.generateFrameNumbers("enemy", { start: 21, end: 23 }),
    frameRate: 5,
    repeat: -1,
  });

  // Input
  cursors = this.input.keyboard.createCursorKeys();
  pointer = this.input.activePointer;

  // Handle touch events
  this.input.on(
    "pointerdown",
    function (pointer) {
      if (pointer.isDown && player.body.touching.down) {
        jumpSfx.play();
        player.setVelocityY(-500);

        if (gameOver) {
          this.scene.restart();
        }
      }
    },
    this
  );
}

function update() {
  if (cursors.space.isDown && player.body.touching.down) {
    jumpSfx.play();
    player.setVelocityY(-500);
  }

  console.log(gameOver);

  if (pointer.isDown && player.body.touching.down) {
    jumpSfx.play();
    player.setVelocityY(-500);
    if (gameOver) {
      this.scene.restart();
    }
  }

  enemies.getChildren().forEach((enemy) => {
    if (enemy.x <= -100) {
      enemy.destroy();
    }
  });
}

function spawnEnemy() {
  const enemy = enemies
    .create(800, 200, "enemy")
    .setScale(3)
    .setSize(12, 20)
    .setOffset(8, 4);

  enemy.setVelocityX(-300);
  enemy.anims.play("enemyWalk");
}

function spawnEnemyWithRandomDelay() {
  spawnEnemy();

  spawnEvent.remove(false);
  spawnEvent = this.time.addEvent({
    delay: Phaser.Math.Between(800, 3000),
    callback: spawnEnemyWithRandomDelay,
    callbackScope: this,
    loop: true,
  });
}

function addScore() {
  score += 1;
  scoreText.setText(`Puntos: ${score}`);
}

function hit() {
  gameOver = true;
  score = 0;

  this.physics.pause();

  player.setTint(0xff0000);
  gameOverText.visible = true;

  player.anims.stop();

  scoreEvent.remove();
  spawnEvent.remove();

  gameOverSound.play();
}
