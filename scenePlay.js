var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function ScenePlay() {
        Phaser.Scene.call(this, { key: 'scenePlay' });
    },

    init: function () {},

    preload: function () {
        this.load.image('chara', 'assets/images/chara.png');
        this.load.image('fg_loop_back', 'assets/images/fg_loop_back.png');
        this.load.image('fg_loop', 'assets/images/fg_loop.png');
        this.load.image('obstc', 'assets/images/obstc.png');
        this.load.image('panel_skor', 'assets/images/panel_skor.png');

        this.load.audio('snd_dead', 'assets/audio/dead.mp3');
        this.load.audio('snd_klik_1', 'assets/audio/klik_1.mp3');
        this.load.audio('snd_klik_2', 'assets/audio/klik_2.mp3');
        this.load.audio('snd_klik_3', 'assets/audio/klik_3.mp3');
    },

    create: function () {
        var myScene = this;

        this.gameWidth = 1024;
        this.gameHeight = 768;

        this.timerHalangan = 80;
        this.halangan = [];
        this.background = [];

        this.isGameRunning = false;
        this.isGameOver = false;

        this.score = 0;

        // Physics versi runner
        this.gravity = 0.5;
        this.jumpPower = -13.0;
        this.charaVelocity = 0;
        this.maxFallSpeed = 12.0;
        this.maxUpSpeed = -15.0;
        this.isGrounded = true;

        // Double jump support
        this.jumpsCount = 0;
        this.maxJumps = 2;

        this.minSpawnDelay = 85;
        this.maxSpawnDelay = 135;
        this.baseObstacleSpeed = 5.2;

        this.topLimit = 35;
        this.bottomLimit = 590;

        this.snd_dead = this.sound.add('snd_dead');

        this.snd_click = [];
        this.snd_click.push(this.sound.add('snd_klik_1'));
        this.snd_click.push(this.sound.add('snd_klik_2'));
        this.snd_click.push(this.sound.add('snd_klik_3'));

        for (let i = 0; i < this.snd_click.length; i++) {
            this.snd_click[i].setVolume(0.45);
        }

        var bg_x = 1366 / 2;

        for (let i = 0; i < 2; i++) {
            var bg_awal = [];

            var BG = this.add.image(bg_x, 768 / 2, 'fg_loop_back');
            var FG = this.add.image(bg_x, 768 / 2, 'fg_loop');

            BG.setData('kecepatan', 2);
            FG.setData('kecepatan', 4);

            BG.setDepth(0);
            FG.setDepth(2);

            bg_awal.push(BG);
            bg_awal.push(FG);

            this.background.push(bg_awal);

            bg_x += 1366;
        }

        this.chara = this.add.image(130, 768 / 2, 'chara');
        this.chara.setDepth(3);
        this.chara.setScale(0);
        this.chara.setAlpha(1);

        this.charaTweens = null;

        this.isGameStarted = false;
        this.readyToStart = false;

        this.tweens.add({
            delay: 250,
            targets: this.chara,
            ease: 'Back.Out',
            duration: 500,
            scaleX: 1,
            scaleY: 1,
            onComplete: function () {
                myScene.readyToStart = true;
                myScene.charaVelocity = 0;
            }
        });

        this.panel_score = this.add.image(1024 / 2, 60, 'panel_skor');
        this.panel_score.setOrigin(0.5);
        this.panel_score.setDepth(10);
        this.panel_score.setAlpha(0.85);

        this.label_score = this.add.text(this.panel_score.x + 25, this.panel_score.y, this.score.toString(), {
            fontFamily: 'Arial',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#ff732e'
        });

        this.label_score.setOrigin(0.5);
        this.label_score.setDepth(10);

        this.guideText = this.add.text(1024 / 2, 720, 'Klik / tekan SPACE untuk MULAI', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        });

        this.guideText.setOrigin(0.5);
        this.guideText.setDepth(20);

        this.tweens.add({
            targets: this.guideText,
            alpha: 0.3,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        this.handleInput = function () {
            if (myScene.isGameOver) return;

            if (!myScene.isGameStarted) {
                if (!myScene.readyToStart) {
                    // Skip entrance tween and scale instantly
                    myScene.tweens.killTweensOf(myScene.chara);
                    myScene.chara.setScale(1);
                    myScene.readyToStart = true;
                }

                myScene.isGameStarted = true;
                myScene.isGameRunning = true;
                myScene.isGrounded = true;

                if (myScene.guideText) {
                    myScene.tweens.add({
                        targets: myScene.guideText,
                        alpha: 0,
                        duration: 250,
                        onComplete: function () {
                            myScene.guideText.destroy();
                        }
                    });
                }
            }

            myScene.flap();
        };

        this.input.on('pointerdown', function () {
            myScene.handleInput();
        });

        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-SPACE', function () {
                myScene.handleInput();
            });

            this.input.keyboard.on('keydown-UP', function () {
                myScene.handleInput();
            });
        }

        this.flap = function () {
            if (!this.isGameRunning || this.isGameOver) return;
            if (this.jumpsCount >= this.maxJumps) return; // Allow up to maxJumps

            if (this.charaTweens != null) {
                this.charaTweens.stop();
                this.charaTweens = null;
            }

            this.jumpsCount++;
            this.isGrounded = false;
            this.charaVelocity = this.jumpPower;

            let randomClick = Math.floor(Math.random() * this.snd_click.length);
            this.snd_click[randomClick].play();

            if (this.jumpsCount === 2) {
                // Second jump: 360° spin effect!
                this.charaTweens = this.tweens.add({
                    targets: this.chara,
                    angle: this.chara.angle + 360,
                    scaleY: 0.9,
                    scaleX: 0.9,
                    duration: 400,
                    ease: 'Cubic.easeOut',
                    onComplete: function () {
                        myScene.charaTweens = null;
                        myScene.chara.setScale(1);
                        myScene.chara.angle = myScene.chara.angle % 360;
                    }
                });
            } else {
                // First jump: stretch animation
                this.charaTweens = this.tweens.add({
                    targets: this.chara,
                    scaleY: 1.25,
                    scaleX: 0.85,
                    duration: 150,
                    yoyo: true,
                    ease: 'Quad.easeOut',
                    onComplete: function () {
                        myScene.charaTweens = null;
                        myScene.chara.setScale(1);
                    }
                });
            }
        };

        this.spawnObstacle = function () {
            if (!this.isGameRunning || this.isGameOver) return;

            let speedBonus = Math.min(this.score * 0.08, 3.2);
            let baseSpeed = this.baseObstacleSpeed + speedBonus;

            // Random speed multiplier per fireball (0.8x to 1.4x) for unpredictability
            let speedMultiplier = 0.8 + Math.random() * 0.6;
            let obstacleSpeed = baseSpeed * speedMultiplier;

            // Height variation: ground (70%), mid (20%), high (10%)
            let groundY = this.bottomLimit + 75; // character feet line
            let heightRoll = Math.random();
            let acak_y;
            let obstScale;

            if (heightRoll < 0.70) {
                // Ground level fireball
                obstScale = 0.7 + Math.random() * 0.35; // 0.70 - 1.05
                acak_y = groundY - (69 * obstScale / 2);
            } else if (heightRoll < 0.90) {
                // Mid-height fireball (player must jump)
                obstScale = 0.65 + Math.random() * 0.3;
                acak_y = groundY - 80 - Math.random() * 60;
            } else {
                // High fireball (player can duck under or must time double jump)
                obstScale = 0.6 + Math.random() * 0.25;
                acak_y = groundY - 180 - Math.random() * 80;
            }

            let halanganBaru = this.add.image(1120, acak_y, 'obstc');
            halanganBaru.setOrigin(0.5);
            halanganBaru.setDepth(5);
            halanganBaru.setScale(obstScale);

            halanganBaru.setData('status_aktif', true);
            halanganBaru.setData('kecepatan', obstacleSpeed);

            // 25% chance: sine-wave wobble movement
            if (Math.random() < 0.25) {
                halanganBaru.setData('wobble', true);
                halanganBaru.setData('wobbleBase', acak_y);
                halanganBaru.setData('wobbleAmp', 20 + Math.random() * 30);
                halanganBaru.setData('wobbleSpeed', 0.003 + Math.random() * 0.004);
            } else {
                halanganBaru.setData('wobble', false);
            }

            this.halangan.push(halanganBaru);

            // Vary spawn delay more: tighter at higher scores
            let minDelay = Math.max(45, this.minSpawnDelay - this.score * 0.5);
            let maxDelay = Math.max(80, this.maxSpawnDelay - this.score * 0.3);
            this.timerHalangan = Phaser.Math.Between(minDelay, maxDelay);
        };

        this.gameOver = function () {
            if (this.isGameOver) return;

            this.isGameOver = true;
            this.isGameRunning = false;

            let highScore = Number(localStorage['highscore'] || 0);
            let isNewHighScore = false;

            if (this.score > highScore) {
                highScore = this.score;
                localStorage['highscore'] = this.score;
                isNewHighScore = true;
            }

            this.snd_dead.play();

            if (this.charaTweens != null) {
                this.charaTweens.stop();
            }

            for (let i = 0; i < this.halangan.length; i++) {
                this.halangan[i].setData('kecepatan', 0);
            }

            // Fall downward rotation animation on death
            this.charaTweens = this.tweens.add({
                targets: this.chara,
                y: this.bottomLimit,
                angle: 90,
                duration: 600,
                ease: 'Cubic.easeIn',
                onComplete: function () {
                    myScene.showGameOverScreen(isNewHighScore, highScore);
                }
            });
        };

        this.showGameOverScreen = function (isNewHighScore, highScore) {
            // Dark overlay
            let overlay = myScene.add.graphics();
            overlay.fillStyle(0x000000, 0.7);
            overlay.fillRect(0, 0, 1024, 768);
            overlay.setDepth(50);
            overlay.setAlpha(0);

            myScene.tweens.add({
                targets: overlay,
                alpha: 1,
                duration: 400
            });

            // UI Container that slides in
            let uiContainer = myScene.add.container(0, 768);
            uiContainer.setDepth(100);

            let cardWidth = 480;
            let cardHeight = 380;
            let cardX = 1024 / 2 - cardWidth / 2;
            let cardY = 768 / 2 - cardHeight / 2;

            // Panel Background
            let cardBg = myScene.add.graphics();
            cardBg.fillStyle(0x1a1a24, 0.95);
            cardBg.lineStyle(4, 0xff732e, 1);
            cardBg.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);
            cardBg.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);
            uiContainer.add(cardBg);

            // Title
            let titleText = myScene.add.text(1024 / 2, cardY + 50, 'GAME OVER', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '44px',
                fontStyle: 'bold',
                color: '#ff3b30',
                stroke: '#000000',
                strokeThickness: 6
            });
            titleText.setOrigin(0.5);
            uiContainer.add(titleText);

            // Inner score panel
            let scorePanel = myScene.add.graphics();
            scorePanel.fillStyle(0x111118, 0.8);
            scorePanel.fillRoundedRect(cardX + 40, cardY + 110, cardWidth - 80, 110, 10);
            uiContainer.add(scorePanel);

            // Score Val
            let scoreValText = myScene.add.text(1024 / 2, cardY + 140, 'SKOR: ' + myScene.score, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            });
            scoreValText.setOrigin(0.5);
            uiContainer.add(scoreValText);

            // High Score Val
            let hsText = 'SKOR TERBAIK: ' + highScore;
            if (isNewHighScore) {
                hsText = 'NEW BEST: ' + highScore + ' 🔥';
            }
            let highScoreValText = myScene.add.text(1024 / 2, cardY + 185, hsText, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: isNewHighScore ? '#ff9f0a' : '#ff732e'
            });
            highScoreValText.setOrigin(0.5);
            uiContainer.add(highScoreValText);

            // --- Helper: Create a proper button with graphics background ---
            function createButton(x, y, width, height, label, fillColor, strokeColor) {
                let btnGfx = myScene.add.graphics();
                btnGfx.fillStyle(fillColor, 1);
                btnGfx.lineStyle(3, strokeColor, 1);
                btnGfx.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
                btnGfx.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);

                let btnZone = myScene.add.zone(x, y, width, height);
                btnZone.setInteractive({ useHandCursor: true });

                let btnText = myScene.add.text(x, y, label, {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#ffffff'
                });
                btnText.setOrigin(0.5);

                return { gfx: btnGfx, zone: btnZone, text: btnText };
            }

            // Restart Button (left)
            let btnWidth = 180;
            let btnHeight = 50;
            let btnGap = 24;
            let btnCenterY = cardY + 300;
            let restartX = 1024 / 2 - btnWidth / 2 - btnGap / 2;
            let menuX = 1024 / 2 + btnWidth / 2 + btnGap / 2;

            let restartBtn = createButton(restartX, btnCenterY, btnWidth, btnHeight, 'MAIN LAGI', 0xff732e, 0xff9f0a);
            uiContainer.add(restartBtn.gfx);
            uiContainer.add(restartBtn.zone);
            uiContainer.add(restartBtn.text);

            // Menu Button (right)
            let menuBtn = createButton(menuX, btnCenterY, btnWidth, btnHeight, 'MENU UTAMA', 0x3a3a4a, 0x666680);
            uiContainer.add(menuBtn.gfx);
            uiContainer.add(menuBtn.zone);
            uiContainer.add(menuBtn.text);

            // Hover and Click animations — Restart
            restartBtn.zone.on('pointerover', function () {
                myScene.tweens.add({
                    targets: [restartBtn.text],
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 100
                });
            });
            restartBtn.zone.on('pointerout', function () {
                myScene.tweens.add({
                    targets: [restartBtn.text],
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 100
                });
            });
            restartBtn.zone.on('pointerdown', function () {
                restartBtn.text.setAlpha(0.6);
            });
            restartBtn.zone.on('pointerup', function () {
                restartBtn.text.setAlpha(1);
                myScene.snd_click[0].play();
                myScene.scene.restart();
            });

            // Hover and Click animations — Menu
            menuBtn.zone.on('pointerover', function () {
                myScene.tweens.add({
                    targets: [menuBtn.text],
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 100
                });
            });
            menuBtn.zone.on('pointerout', function () {
                myScene.tweens.add({
                    targets: [menuBtn.text],
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 100
                });
            });
            menuBtn.zone.on('pointerdown', function () {
                menuBtn.text.setAlpha(0.6);
            });
            menuBtn.zone.on('pointerup', function () {
                menuBtn.text.setAlpha(1);
                myScene.snd_click[0].play();
                myScene.scene.start('sceneMenu');
            });

            // Keyboard shortcut on game over
            if (myScene.input.keyboard) {
                myScene.input.keyboard.once('keydown-SPACE', function () {
                    myScene.snd_click[0].play();
                    myScene.scene.restart();
                });
                myScene.input.keyboard.once('keydown-ENTER', function () {
                    myScene.snd_click[0].play();
                    myScene.scene.restart();
                });
            }

            // Slide in animation
            myScene.tweens.add({
                targets: uiContainer,
                y: 0,
                duration: 650,
                ease: 'Back.easeOut'
            });
        };
    },

    update: function () {
        this.updateBackground();

        // If game hasn't started yet, bob the character gently
        if (!this.isGameStarted) {
            if (this.readyToStart) {
                this.chara.y = (768 / 2) + Math.sin(this.time.now / 150) * 12;
                this.chara.angle = Math.sin(this.time.now / 150) * 5;
            }
            return;
        }

        if (this.isGameOver) return;

        var myScene = this;

        if (this.isGrounded) {
            // Apply procedural hopping visual effect to look like a Pocong hopping along the ground!
            let hopOffset = Math.abs(Math.sin(this.time.now / 80)) * 10;
            this.chara.y = this.bottomLimit - hopOffset;
            this.chara.angle = Math.sin(this.time.now / 80) * 4;
        } else {
            // Air physics
            this.charaVelocity += this.gravity;
            if (this.charaVelocity > this.maxFallSpeed) {
                this.charaVelocity = this.maxFallSpeed;
            }
            if (this.charaVelocity < this.maxUpSpeed) {
                this.charaVelocity = this.maxUpSpeed;
            }
            this.chara.y += this.charaVelocity;

            // Landing check
            if (this.chara.y >= this.bottomLimit) {
                this.chara.y = this.bottomLimit;
                this.charaVelocity = 0;
                this.isGrounded = true;
                this.jumpsCount = 0; // Reset jump count on landing
                this.chara.angle = 0; // Reset rotation on landing

                // Play landing squash & stretch tween
                this.tweens.add({
                    targets: this.chara,
                    scaleY: 0.8,
                    scaleX: 1.15,
                    duration: 100,
                    yoyo: true,
                    ease: 'Quad.easeOut',
                    onComplete: function () {
                        myScene.chara.setScale(1);
                    }
                });
            }

            // Air rotation
            if (this.charaTweens == null) {
                let targetAngle = Phaser.Math.Clamp(this.charaVelocity * 3, -25, 35);
                this.chara.angle = Phaser.Math.Linear(this.chara.angle, targetAngle, 0.12);
            }
        }

        // Ceiling clamp (no game over for hitting ceiling!)
        if (this.chara.y < this.topLimit) {
            this.chara.y = this.topLimit;
            this.charaVelocity = 0;
        }

        this.timerHalangan--;

        if (this.timerHalangan <= 0) {
            this.spawnObstacle();
        }

        for (let i = this.halangan.length - 1; i >= 0; i--) {
            let obstacle = this.halangan[i];

            obstacle.x -= obstacle.getData('kecepatan');

            // Apply sine-wave wobble if this obstacle has it
            if (obstacle.getData('wobble')) {
                let wobbleBase = obstacle.getData('wobbleBase');
                let wobbleAmp = obstacle.getData('wobbleAmp');
                let wobbleSpeed = obstacle.getData('wobbleSpeed');
                obstacle.y = wobbleBase + Math.sin(this.time.now * wobbleSpeed) * wobbleAmp;
            }

            if (obstacle.x < -200) {
                obstacle.destroy();
                this.halangan.splice(i, 1);
                continue;
            }

            if (
                this.chara.x > obstacle.x + obstacle.displayWidth / 2 &&
                obstacle.getData('status_aktif') === true
            ) {
                obstacle.setData('status_aktif', false);
                this.score++;
                this.label_score.setText(this.score.toString());
            }

            if (this.checkCollision(this.chara, obstacle)) {
                obstacle.setData('status_aktif', false);
                this.gameOver();
                return;
            }
        }
    },

    updateBackground: function () {
        for (let i = 0; i < this.background.length; i++) {
            for (let j = 0; j < this.background[i].length; j++) {
                this.background[i][j].x -= this.background[i][j].getData('kecepatan');

                if (this.background[i][j].x <= -(1366 / 2)) {
                    var diff = this.background[i][j].x + (1366 / 2);
                    this.background[i][j].x = 1366 + 1366 / 2 + diff;
                }
            }
        }
    },

    checkCollision: function (chara, obstacle) {
        let charaBounds = chara.getBounds();
        let obstacleBounds = obstacle.getBounds();

        let charaHitbox = new Phaser.Geom.Rectangle(
            charaBounds.x + charaBounds.width * 0.25,
            charaBounds.y + charaBounds.height * 0.20,
            charaBounds.width * 0.50,
            charaBounds.height * 0.60
        );

        let obstacleHitbox = new Phaser.Geom.Rectangle(
            obstacleBounds.x + obstacleBounds.width * 0.22,
            obstacleBounds.y + obstacleBounds.height * 0.22,
            obstacleBounds.width * 0.56,
            obstacleBounds.height * 0.56
        );

        return Phaser.Geom.Intersects.RectangleToRectangle(charaHitbox, obstacleHitbox);
    }
});