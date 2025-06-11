// ✅ Final Version: Coin Hunter with Enemy in Level 4
let currentLevel = 1;
var enemies;

var scenePlay = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: "scenePlay" });
  },

  preload: function () {
    this.load.setBaseURL("assets/");
    this.load.image("Background", "images/BG.png");
    this.load.image("btn_play", "images/ButtonPlay.png");
    this.load.image("gameover", "images/GameOver.png");
    this.load.image("coin", "images/Koin.png");
    this.load.image("enemy1", "images/Musuh01.png");
    this.load.image("enemy2", "images/Musuh02.png");
    this.load.image("coin_panel1", "images/PanelCoin.png");
    this.load.image("ground", "images/Tile50.png");

    this.load.audio("snd_coin", "audio/koin.mp3");
    this.load.audio("snd_jump", "audio/lompat.mp3");
    this.load.audio("snd_walk", "audio/jalan.mp3");
    this.load.audio("music_play", "audio/music_play.mp3");

    this.load.spritesheet("char", "images/CharaSpriteAnim.png", {
      frameWidth: 44.8,
      frameHeight: 93,
    });
  },

  create: function () {
    this.gameStarted = false;
    this.isTransitioning = false;
    this.gameOverText = null;
    this.winText = null;

    const WIDTH = this.game.config.width;
    const HEIGHT = this.game.config.height;

    X_POSITION = { CENTER: WIDTH / 2 };
    Y_POSITION = { CENTER: HEIGHT / 2, BOTTOM: HEIGHT };
    relativeSize = { w: (WIDTH - 1024) / 2 };

    this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Background");
    this.add.image(X_POSITION.CENTER, 30, "coin_panel1").setDepth(10);

    this.coinText = this.add
      .text(X_POSITION.CENTER, 30, "0", {
        fontSize: "37px",
        color: "#adadad",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.transitionOverlay = this.add
      .rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, WIDTH, HEIGHT, 0x000000)
      .setDepth(20)
      .setAlpha(0);

    this.transitionText = this.add
      .text(X_POSITION.CENTER, Y_POSITION.CENTER, "", {
        fontFamily: "Verdana, Arial",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setAlpha(0);

    this.darkenLayer = this.add
      .rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, WIDTH, HEIGHT, 0x000000)
      .setDepth(10)
      .setAlpha(0.2);

    this.buttonPlay = this.add
      .image(X_POSITION.CENTER, Y_POSITION.CENTER, "btn_play")
      .setDepth(10)
      .setInteractive();

    this.snd_coin = this.sound.add("snd_coin");
    this.snd_jump = this.sound.add("snd_jump");
    this.snd_walk = this.sound.add("snd_walk", { loop: true, volume: 0 });
    this.music_play = this.sound.add("music_play", { loop: true });
    this.snd_walk.play();

    this.buttonPlay.on("pointerup", () => {
      this.buttonPlay.setVisible(false);
      this.darkenLayer.setVisible(false);
      if (this.sound.context.state === "suspended") this.sound.context.resume();
      this.music_play.play();
      this.gameStarted = true;
      this.player.body.enable = true;
      this.player.setGravityY(800);
      this.physics.add.collider(this.player, this.platforms);
    });

    enemies = this.physics.add.group();
    this.prepareWorld();

    this.player = this.physics.add.sprite(100, 500, "char");
    this.player.setBounce(0.2).setCollideWorldBounds(true);
    this.player.body.enable = false;
    this.player.setGravityY(0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("char", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("char", { start: 5, end: 8 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "front",
      frames: [{ key: "char", frame: 4 }],
      frameRate: 20,
    });

    this.countCoin = 0;
    this.spawnCoins();
  },

  showLevelTransition: function (levelNumber, callback) {
    this.transitionOverlay.setAlpha(1);
    this.transitionText.setText("LEVEL " + levelNumber);
    this.transitionText.setAlpha(1);

    this.time.delayedCall(2000, () => {
      this.transitionOverlay.setAlpha(0);
      this.transitionText.setAlpha(0);
      if (callback) callback();
    });
  },

  prepareWorld: function () {
    if (this.platforms) this.platforms.clear(true, true);
    this.platforms = this.physics.add.staticGroup();
    const groundTemp = this.add.image(0, 0, "ground").setVisible(false);

    for (let i = -4; i <= 4; i++) {
      this.platforms.create(
        X_POSITION.CENTER + i * groundTemp.width,
        Y_POSITION.BOTTOM - groundTemp.height / 2,
        "ground"
      );
    }

    if (currentLevel === 1) {
      this.platforms.create(150, 384, "ground");
      this.platforms.create(400, 424, "ground");
      this.platforms.create(850, 480, "ground");
      this.platforms.create(600, 584, "ground");
    } else if (currentLevel === 2) {
      this.platforms.create(80 + relativeSize.w, 284, "ground");
      this.platforms.create(230 + relativeSize.w, 184, "ground");
      this.platforms.create(390 + relativeSize.w, 284, "ground");
      this.platforms.create(990 + relativeSize.w, 360, "ground");
      this.platforms.create(620 + relativeSize.w, 430, "ground");
      this.platforms.create(900 + relativeSize.w, 570, "ground");
    } else if (currentLevel === 3) {
      this.platforms.create(80 + relativeSize.w, 230, "ground");
      this.platforms.create(230 + relativeSize.w, 230, "ground");
      this.platforms.create(1040 + relativeSize.w, 280, "ground");
      this.platforms.create(600 + relativeSize.w, 340, "ground");
      this.platforms.create(400 + relativeSize.w, 420, "ground");
      this.platforms.create(930 + relativeSize.w, 430, "ground");
      this.platforms.create(820 + relativeSize.w, 570, "ground");
      this.platforms.create(512 + relativeSize.w, 590, "ground");
      this.platforms.create(0 + relativeSize.w, 570, "ground");
    } else if (currentLevel === 4) {
      this.platforms.create(80 + relativeSize.w, 284, "ground");
      this.platforms.create(230 + relativeSize.w, 184, "ground");
      this.platforms.create(390 + relativeSize.w, 284, "ground");
      this.platforms.create(990 + relativeSize.w, 360, "ground");
      this.platforms.create(620 + relativeSize.w, 430, "ground");
      this.platforms.create(900 + relativeSize.w, 570, "ground");
    }
  },

  spawnCoins: function () {
    let positions = [];
    if (currentLevel === 1) {
      positions = [
        { x: 70, y: 330 },
        { x: 130, y: 330 },
        { x: 380, y: 370 },
        { x: 440, y: 370 },
        { x: 550, y: 520 },
        { x: 600, y: 520 },
        { x: 650, y: 520 },
        { x: 900, y: 420 },
        { x: 950, y: 420 },
      ];
    } else if (currentLevel === 2) {
      positions = [
        { x: 80, y: 230 },
        { x: 250, y: 130 },
        { x: 200, y: 130 },
        { x: 390, y: 230 },
        { x: 590, y: 370 },
        { x: 640, y: 370 },
        { x: 930, y: 300 },
        { x: 980, y: 300 },
        { x: 880, y: 500 },
        { x: 930, y: 500 },
        { x: 400, y: 660 },
      ];
    } else if (currentLevel === 3) {
      positions = [
        { x: 200, y: 140 },
        { x: 250, y: 140 },
        { x: 150, y: 140 },
        { x: 380, y: 370 },
        { x: 430, y: 370 },
        { x: 580, y: 280 },
        { x: 630, y: 280 },
        { x: 970, y: 230 },
        { x: 910, y: 380 },
        { x: 830, y: 500 },
      ];
    } else if (currentLevel === 4) {
      positions = [
        { x: 80, y: 230 },
        { x: 250, y: 130 },
        { x: 200, y: 130 },
        { x: 390, y: 230 },
        { x: 590, y: 370 },
        { x: 640, y: 370 },
        { x: 930, y: 300 },
        { x: 980, y: 300 },
        { x: 880, y: 500 },
        { x: 930, y: 500 },
        { x: 400, y: 660 },
      ];
    }

    if (this.coins) this.coins.clear(true, true);
    this.coins = this.physics.add.group();
    positions.forEach((pos) => this.coins.create(pos.x, pos.y, "coin"));
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.coins,
      (player, coin) => {
        this.countCoin += 10;
        this.coinText.setText(this.countCoin);
        this.snd_coin.play();
        coin.disableBody(true, true);
      },
      null,
      this
    );

   if (currentLevel === 4) {
  const enemy1 = enemies.create(400, 100, "enemy1");
  enemy1.setBounce(1);
  enemy1.setCollideWorldBounds(true);
  enemy1.setVelocity(Phaser.Math.Between(-150, 150), 20);
  enemy1.allowGravity = false;

  this.physics.add.collider(enemy1, this.platforms);
  this.physics.add.collider(this.player, enemy1, () => {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText = this.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, "GAME OVER", {
      fontSize: "48px",
      color: "#ffffff",
      backgroundColor: "#000000"
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(2000, () => {
      this.restartGame();
    });
  }, null, this);

  const enemy2 = enemies.create(600, 200, "enemy2");
  enemy2.setBounce(1);
  enemy2.setCollideWorldBounds(true);
  enemy2.setVelocity(Phaser.Math.Between(-150, 150), 20);
  enemy2.allowGravity = false;

  this.physics.add.collider(enemy2, this.platforms);
  this.physics.add.collider(this.player, enemy2, () => {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText = this.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, "GAME OVER", {
      fontSize: "48px",
      color: "#ffffff",
      backgroundColor: "#000000"
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(2000, () => {
      this.restartGame();
    });
  }, null, this);
}

  },

  restartGame: function () {
    if (this.gameOverText) {
      this.gameOverText.destroy();
      this.gameOverText = null;
    }
    if (this.winText) {
      this.winText.destroy();
      this.winText = null;
    }

    currentLevel = 1;
    this.countCoin = 0;
    this.coinText.setText("0");
    enemies.clear(true, true);
    this.player.clearTint();
    this.player.setVelocity(0);
    this.player.setPosition(100, 500);
    this.physics.resume();
    this.isTransitioning = false;
    this.prepareWorld();
    this.spawnCoins();
    this.buttonPlay.setVisible(true);
    this.darkenLayer.setVisible(true);
    this.gameStarted = false;
    this.player.body.enable = false;
    this.player.setGravityY(0);
  },

  update: function () {
    if (!this.gameStarted || !this.cursors || this.isTransitioning) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
      this.snd_walk.setVolume(1);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
      this.snd_walk.setVolume(1);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("front");
      this.snd_walk.setVolume(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-650);
      this.snd_jump.play();
    }

    if (this.coins.countActive(true) === 0) {
      this.isTransitioning = true; // ⛔ cegah update berjalan selama transisi
      currentLevel++;

      if (currentLevel > 4) {
        this.winText = this.add
          .text(X_POSITION.CENTER, Y_POSITION.CENTER, "YOU WIN!", {
            fontSize: "48px",
            color: "#ffffff",
            backgroundColor: "#000000",
          })
          .setOrigin(0.5)
          .setDepth(20);

        this.time.delayedCall(2000, () => this.restartGame());

        return;
      }

      enemies.clear(true, true);

      this.showLevelTransition(currentLevel, () => {
        this.prepareWorld();
        this.player.setPosition(100, 500);
        this.physics.add.collider(this.player, this.platforms);
        this.spawnCoins();
        this.isTransitioning = false; // ✅ aktifkan lagi update
      });
    }
  },
});
