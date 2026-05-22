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

        for(let i = 0; i < this.snd_click.length; i++){
            this.snd_click[i].setVolume(0.5);
        }
        this.timerHalangan = 0;
        this.halangan = [];
        this.background = [];

        this.isGameRunning = false;

        this.chara = this.add.image(130, 768 / 2, 'chara');
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

        this.gameover = function(){
            let highScore = 0;
            try {
                highScore = localStorage.getItem('highscore') || 0;
            } catch(e) {
                highScore = 0;
            }
            
            if (myScene.score > highScore) {
                try {
                    localStorage.setItem('highscore', myScene.score);
                } catch(e) {
                }
            }
            myScene.scene.start('sceneMenu');
        };

        this.input.on('pointerup', function (pointer, currentlyOver) {
            if (!this.isGameRunning) return;

            this.snd_click[Math.floor((Math.random() * 3))].play();

            this.charaTweens = this.tweens.add({
                targets: this.chara,
                ease: 'Power1',
                duration: 750,
                y: this.chara.y - 200 
            });
        }, this);

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
            this.chara.y += 5;
            
            if (this.chara.y > 690) this.chara.y = 690;
            
            
            if (this.chara.y < 50) {
                this.isGameRunning = false;

                this.snd_dead.play();
                
                if (this.charaTweens != null) {
                    this.charaTweens.stop();
                }
                
                var myScene = this;
                
                this.charaTweens = this.tweens.add({
                    targets: this.chara,
                    ease: 'Elastic.easeOut',
                    duration: 2000,
                    alpha: 0,
                    onComplete: function() {
                        myScene.gameover();
                    }
                });
                return;
            }

          
            for (let i = 0; i < this.background.length; i++) {
                for (var j = 0; j < this.background[i].length; j++) {
                    var bg = this.background[i][j];
                    bg.x -= bg.getData('kecepatan');
                    if (bg.x <= -1366 / 2) {
                        bg.x += 1366 * 2;
                    }
                }
            }

         
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

            for (var i = this.halangan.length - 1; i >= 0; i--) {
                var h = this.halangan[i];
                if (this.chara.x > h.x + 50 && h.getData('status_aktif') == true) {
                    h.setData('status_aktif', false);
                    this.score++;
                    this.label_score.setText(this.score);
                }
            }

            
            for (let i = this.halangan.length - 1; i >= 0; i--) {
                if (this.chara.getBounds().contains(this.halangan[i].x, this.halangan[i].y)) {
                    this.isGameRunning = false;
                    this.snd_dead.play();
                    if (this.charaTweens != null) {
                        this.charaTweens.stop();
                    }
                    
                    var myScene = this;
                    
                    this.charaTweens = this.tweens.add({
                        targets: this.chara,
                        ease: 'Elastic.easeOut',
                        duration: 2000,
                        alpha: 0,
                        onComplete: function() {
                            myScene.gameover();
                        }
                    });
                    break;
                }
            }
        }
    }
});