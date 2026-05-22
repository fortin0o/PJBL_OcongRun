var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
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
        this.load.audio('snd_klik1', 'assets/audio/klik_1.mp3');
        this.load.audio('snd_klik2', 'assets/audio/klik_2.mp3');
        this.load.audio('snd_klik3', 'assets/audio/klik_3.mp3');
    },

    create: function () {
        this.snd_dead = this.sound.add('snd_dead');

        this.snd_click = [];
        this.snd_click.push(this.sound.add('snd_klik1'));
        this.snd_click.push(this.sound.add('snd_klik2'));
        this.snd_click.push(this.sound.add('snd_klik3'));

        for (let i = 0; i < this.snd_click.length; i++) {
            this.snd_click[i].setVolume(0.5);
        }

        this.timerHalangan = 0;
        this.halangan = [];
        this.background = [];

        this.isGameRunning = false;

        // --- Physics variables ---
        this.GROUND_Y = 690;
        this.GRAVITY = 0.8;       // pixels per frame² (tunable)
        this.JUMP_FORCE = -16;    // negative = upward (tunable)
        this.velocityY = 0;
        this.isOnGround = false;

        this.chara = this.add.image(130, this.GROUND_Y, 'chara');
        this.chara.setDepth(3);
        this.chara.setScale(0);

        var myScene = this;

        this.tweens.add({
            delay: 250,
            targets: this.chara,
            ease: 'Back.Out',
            duration: 500,
            scaleX: 1,
            scaleY: 1,
            onComplete: function () {
                myScene.isGameRunning = true;
            }
        });

        this.score = 0;

        this.panel_score = this.add.image(1024 / 2, 60, 'panel_skor');
        this.panel_score.setOrigin(0.5);
        this.panel_score.setDepth(10);
        this.panel_score.setAlpha(0.8);

        this.label_score = this.add.text(this.panel_score.x + 25, this.panel_score.y, this.score, {
            fontSize: '30px',
            color: '#ff732e',
            fontFamily: 'Arial'
        });
        this.label_score.setOrigin(0.5);
        this.label_score.setDepth(10);
        this.label_score.setFontSize(30);
        this.label_score.setTint(0xff732e);

        // --- Add control hint text ---
        this.hintText = this.add.text(1024 / 2, 768 - 30, 'TAP / CLICK / SPACE / ↑ to Jump', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
            alpha: 0.6
        });
        this.hintText.setOrigin(0.5);
        this.hintText.setDepth(10);
        this.hintText.setAlpha(0.6);

        this.gameover = function () {
            let highScore = 0;
            try {
                highScore = localStorage.getItem('highscore') || 0;
            } catch (e) {
                highScore = 0;
            }

            if (myScene.score > highScore) {
                try {
                    localStorage.setItem('highscore', myScene.score);
                } catch (e) {}
            }
            myScene.scene.start('sceneMenu');
        };

        // --- Jump function (called from any input) ---
        this.doJump = function () {
            if (!myScene.isGameRunning) return;
            if (!myScene.isOnGround) return;    // only jump when grounded
            myScene.velocityY = myScene.JUMP_FORCE;
            myScene.isOnGround = false;
            myScene.snd_click[Math.floor(Math.random() * 3)].play();
        };

        // Pointer / touch input
        this.input.on('pointerdown', function () {
            myScene.doJump();
        });

        // Keyboard input: Spacebar or Arrow Up
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        var bg_x = 1366 / 2;

        for (let i = 0; i < 2; i++) {
            var bg_awal = [];

            var BG = this.add.image(bg_x, 768 / 2, 'fg_loop_back');
            var FG = this.add.image(bg_x, 768 / 2, 'fg_loop');

            BG.setData('kecepatan', 2);
            FG.setData('kecepatan', 4);
            FG.setDepth(2);

            bg_awal.push(BG);
            bg_awal.push(FG);

            this.background.push(bg_awal);

            bg_x += 1366;
        }
    },

    update: function () {
        if (this.isGameRunning) {

            // --- Keyboard jump ---
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.doJump();
            }

            // --- Apply gravity each frame ---
            this.velocityY += this.GRAVITY;
            this.chara.y += this.velocityY;

            // --- Ground collision ---
            if (this.chara.y >= this.GROUND_Y) {
                this.chara.y = this.GROUND_Y;
                this.velocityY = 0;
                this.isOnGround = true;
            } else {
                this.isOnGround = false;
            }

            // --- Ceiling / top boundary death ---
            if (this.chara.y < 50) {
                this.isGameRunning = false;
                this.snd_dead.play();

                var myScene = this;

                this.tweens.add({
                    targets: this.chara,
                    ease: 'Elastic.easeOut',
                    duration: 2000,
                    alpha: 0,
                    onComplete: function () {
                        myScene.gameover();
                    }
                });
                return;
            }

            // --- Scroll background ---
            for (let i = 0; i < this.background.length; i++) {
                for (var j = 0; j < this.background[i].length; j++) {
                    var bg = this.background[i][j];
                    bg.x -= bg.getData('kecepatan');
                    if (bg.x <= -1366 / 2) {
                        bg.x += 1366 * 2;
                    }
                }
            }

            // --- Spawn obstacles ---
            if (this.timerHalangan == 0) {
                var acak_y = Math.floor(Math.random() * 680 + 60);
                var halanganbaru = this.add.image(1500, acak_y, 'obstc');
                halanganbaru.setOrigin(0, 0);
                halanganbaru.setData("status_aktif", true);
                halanganbaru.setData("kecepatan", Math.floor(Math.random() * 8 + 5));
                halanganbaru.setDepth(5);

                this.halangan.push(halanganbaru);
                this.timerHalangan = Math.floor(Math.random() * 50 + 10);
            }

            // --- Move & clean up obstacles ---
            for (let i = this.halangan.length - 1; i >= 0; i--) {
                var h = this.halangan[i];
                h.x -= h.getData('kecepatan');
                if (h.x < -200) {
                    h.destroy();
                    this.halangan.splice(i, 1);
                    break;
                }
            }

            this.timerHalangan--;

            // --- Score counting ---
            for (var i = this.halangan.length - 1; i >= 0; i--) {
                var h = this.halangan[i];
                if (this.chara.x > h.x + 50 && h.getData('status_aktif') == true) {
                    h.setData('status_aktif', false);
                    this.score++;
                    this.label_score.setText(this.score);
                }
            }

            // --- Collision detection ---
            for (let i = this.halangan.length - 1; i >= 0; i--) {
                if (this.chara.getBounds().contains(this.halangan[i].x, this.halangan[i].y)) {
                    this.isGameRunning = false;
                    this.snd_dead.play();

                    var myScene = this;

                    this.tweens.add({
                        targets: this.chara,
                        ease: 'Elastic.easeOut',
                        duration: 2000,
                        alpha: 0,
                        onComplete: function () {
                            myScene.gameover();
                        }
                    });
                    break;
                }
            }
        }
    }
});