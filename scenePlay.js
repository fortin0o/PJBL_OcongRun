var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function ScenePlay() {
        Phaser.Scene.call(this, { key: 'scenePlay' });
    },

    init: function () { },

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

        // Physics versi terbang / flappy
        this.gravity = 0.38;
        this.jumpPower = -8.2;
        this.charaVelocity = 0;
        this.maxFallSpeed = 8.5;
        this.maxUpSpeed = -9;

        this.minSpawnDelay = 85;
        this.maxSpawnDelay = 135;
        this.baseObstacleSpeed = 5.2;

        this.topLimit = 35;
        this.bottomLimit = 710;

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

        this.tweens.add({
            delay: 250,
            targets: this.chara,
            ease: 'Back.Out',
            duration: 500,
            scaleX: 1,
            scaleY: 1,
            onComplete: function () {
                myScene.isGameRunning = true;
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

        this.guideText = this.add.text(1024 / 2, 720, 'Klik / tekan SPACE untuk naik', {
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

        this.input.on('pointerdown', function () {
            myScene.flap();
        });

        this.input.keyboard.on('keydown-SPACE', function () {
            myScene.flap();
        });

        this.input.keyboard.on('keydown-UP', function () {
            myScene.flap();
        });

        this.flap = function () {
            if (!this.isGameRunning || this.isGameOver) return;

            if (this.charaTweens != null) {
                this.charaTweens.stop();
            }

            this.charaVelocity = this.jumpPower;

            let randomClick = Math.floor(Math.random() * this.snd_click.length);
            this.snd_click[randomClick].play();

            this.tweens.add({
                targets: this.chara,
                angle: -18,
                duration: 120,
                ease: 'Power1'
            });
        };

        this.spawnObstacle = function () {
            if (!this.isGameRunning || this.isGameOver) return;

            let speedBonus = Math.min(this.score * 0.08, 3.2);
            let obstacleSpeed = this.baseObstacleSpeed + speedBonus;

            let acak_y = Phaser.Math.Between(120, 630);

            let halanganBaru = this.add.image(1120, acak_y, 'obstc');
            halanganBaru.setOrigin(0.5);
            halanganBaru.setDepth(5);
            halanganBaru.setScale(0.85);

            halanganBaru.setData('status_aktif', true);
            halanganBaru.setData('kecepatan', obstacleSpeed);

            this.halangan.push(halanganBaru);

            this.timerHalangan = Phaser.Math.Between(this.minSpawnDelay, this.maxSpawnDelay);
        };

        this.gameOver = function () {
            if (this.isGameOver) return;

            this.isGameOver = true;
            this.isGameRunning = false;

            let highScore = Number(localStorage['highscore'] || 0);

            if (this.score > highScore) {
                localStorage['highscore'] = this.score;
            }

            this.snd_dead.play();

            if (this.charaTweens != null) {
                this.charaTweens.stop();
            }

            for (let i = 0; i < this.halangan.length; i++) {
                this.halangan[i].setData('kecepatan', 0);
            }

            this.charaTweens = this.tweens.add({
                targets: this.chara,
                ease: 'Elastic.easeOut',
                duration: 900,
                alpha: 0,
                angle: 180,
                scaleX: 0,
                scaleY: 0,
                onComplete: function () {
                    myScene.scene.start('sceneMenu');
                }
            });
        };
    },

    update: function () {
        this.updateBackground();

        if (!this.isGameRunning || this.isGameOver) return;

        this.charaVelocity += this.gravity;

        if (this.charaVelocity > this.maxFallSpeed) {
            this.charaVelocity = this.maxFallSpeed;
        }

        if (this.charaVelocity < this.maxUpSpeed) {
            this.charaVelocity = this.maxUpSpeed;
        }

        this.chara.y += this.charaVelocity;

        let targetAngle = Phaser.Math.Clamp(this.charaVelocity * 4, -25, 35);
        this.chara.angle = Phaser.Math.Linear(this.chara.angle, targetAngle, 0.12);

        if (this.chara.y < this.topLimit) {
            this.chara.y = this.topLimit;
            this.gameOver();
            return;
        }

        if (this.chara.y > this.bottomLimit) {
            this.chara.y = this.bottomLimit;
            this.gameOver();
            return;
        }

        this.timerHalangan--;

        if (this.timerHalangan <= 0) {
            this.spawnObstacle();
        }

        for (let i = this.halangan.length - 1; i >= 0; i--) {
            let obstacle = this.halangan[i];

            obstacle.x -= obstacle.getData('kecepatan');

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