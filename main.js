import * as Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth > 800 ? 800 : window.innerWidth,
  height: 300,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 1000 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const Constants = {
  Player: {
    VELOCITY_Y: -450,
  },
  Enemy: {
    VELOCITY_X: -300,
  },
};

// Game objects
let ground;
let player;
let enemies;
let button;

// Input
let cursors;
let pointer;

// Score-related
let score = 0;
let scoreText;

// Game state
let gameOver = false;
let gameOverText;

// Events
let spawnEvent;
let scoreEvent;

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
  // this.load.spritesheet("retryButton", "assets/tilemapCharacters.png", {
  //   frameWidth: 24,
  //   frameHeight: 24,
  // });
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
    fill: "#ffffff",
    font: "500 32px PixelifySans",
    stroke: "#000000",
    strokeThickness: 8,
  });

  gameOverText = this.add.text(0, 100, "GAME OVER", {
    font: "500 32px PixelifySans",
    fill: "#ff0000",
    stroke: "#000000",
    strokeThickness: 8,
  });

  gameOverText.x = (this.cameras.main.width - gameOverText.width) / 2;
  console.log(gameOver);
  gameOverText.visible = false;

  button = this.add
    .text(0, 150, "RETRY", {
      font: "500 28px PixelifySans",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      backgroundColor: "#ff0000",
    })
    .setInteractive();
  button.setDepth(100);
  button.x = (this.cameras.main.width - button.width) / 2;
  button.visible = false;

  button.on(
    "pointerup",
    function () {
      if (gameOver) {
        gameOver = false;
        this.scene.restart();
      }
    },
    this
  );

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
  if (!this.anims.get("playerWalk")) {
    this.anims.create({
      key: "playerWalk",
      frames: this.anims.generateFrameNumbers("player", { start: 4, end: 5 }),
      frameRate: 5,
      repeat: -1,
    });
  }
  player.anims.play("playerWalk");

  if (!this.anims.get("enemyWalk")) {
    this.anims.create({
      key: "enemyWalk",
      frames: this.anims.generateFrameNumbers("enemy", { start: 21, end: 23 }),
      frameRate: 5,
      repeat: -1,
    });
  }

  // Input
  cursors = this.input.keyboard.createCursorKeys();
  pointer = this.input.activePointer;

  // Handle touch events
  this.input.on(
    "pointerdown",
    function (pointer) {
      if (!gameOver) {
        if (pointer.isDown && player.body.touching.down) {
          jumpSfx.play();
          player.setVelocityY(Constants.Player.VELOCITY_Y);
        }
      }
    },
    this
  );
}

function update() {
  console.log(gameOver);
  if (!gameOver) {
    if (cursors.space.isDown && player.body.touching.down) {
      jumpSfx.play();
      player.setVelocityY(Constants.Player.VELOCITY_Y);
    }

    if (pointer.isDown && player.body.touching.down) {
      jumpSfx.play();
      player.setVelocityY(Constants.Player.VELOCITY_Y);
    }

    enemies.getChildren().forEach((enemy) => {
      if (enemy.x <= -100) {
        enemy.destroy();
      }
    });
  }
}

function spawnEnemy() {
  const enemy = enemies
    .create(800, 200, "enemy")
    .setScale(3)
    .setSize(12, 20)
    .setOffset(8, 4);

  enemy.setVelocityX(Constants.Enemy.VELOCITY_X);
  enemy.anims.play("enemyWalk");
}

function spawnEnemyWithRandomDelay() {
  spawnEnemy();

  spawnEvent.remove(false);
  spawnEvent = this.time.addEvent({
    delay: Phaser.Math.Between(1000, 3000),
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
  button.visible = true;

  player.anims.stop();

  scoreEvent.remove();
  spawnEvent.remove();

  gameOverSound.play();
}
