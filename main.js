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

let ground;
let player;
let cursors;
let enemies;
let scoreText;
let score = 0;
let retryText;
let gameOver = false;
let spawnEvent;
let scoreEvent;
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
  this.add.image(400, 150, "sky");

  ground = this.physics.add.staticImage(400, 320, "ground");
  player = this.physics.add
    .sprite(80, 100, "player")
    .setScale(3)
    .setBounce(0.1)
    .setFlipX(true)
    .setSize(14, 24);
  enemies = this.physics.add.group();
  scoreText = this.add.text(15, 15, "Score:", {
    fill: "#fff",
    font: "500 32px PixelifySans",
  });
  jumpSfx = this.sound.add("jumpSfx");
  gameOverSound = this.sound.add("gameOver");

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.collider(player, ground);
  this.physics.add.collider(enemies, ground);
  this.physics.add.overlap(player, enemies, hit, null, this);

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

  this.anims.create({
    key: "playerWalk",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }), // Frame range
    frameRate: 5,
    repeat: -1,
  });
  player.anims.play("playerWalk");

  this.anims.create({
    key: "enemyWalk",
    frames: this.anims.generateFrameNumbers("enemy", { start: 21, end: 23 }), // Ajusta el rango de fotogramas según tu spritesheet
    frameRate: 5,
    repeat: -1,
  });

  this.input.on("pointerdown", function () {
    if (player.body.touching.down) {
      jumpSfx.play();
      player.setVelocityY(-500);
    }
  });
}

function update() {
  if (cursors.space.isDown && player.body.touching.down) {
    jumpSfx.play();
    player.setVelocityY(-500);
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
  scoreText.setText(`Score: ${score}`);
}

function hit() {
  gameOver = true;
  score = 0;

  this.physics.pause();

  player.setTint(0xff0000);
  retryText = this.add.text(15, 50, "GAME OVER", {
    font: "500 32px PixelifySans",
    fill: "#ff0000",
  });

  scoreEvent.remove();
  spawnEvent.remove();
  player.anims.stop();

  gameOverSound.play();

  this.input.once(
    "pointerdown",
    function () {
      if (gameOver) {
        this.scene.restart();
      }
    },
    this
  );
}
