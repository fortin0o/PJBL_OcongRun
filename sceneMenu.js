var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "sceneMenu" });
    },

    init() {},

    preload() {
        this.load.image('bg_start', 'assets/images/bg_start.png');
        this.load.image('btn_play', 'assets/images/btn_play.png');
        this.load.image('title_game', 'assets/images/title_game.png');
        this.load.image('panel_skor', 'assets/images/panel_skor.png');
        this.load.audio('snd_ambience', 'assets/audio/ambience.mp3');
        this.load.audio('snd_touch', 'assets/audio/touch.mp3');
        this.load.audio('snd_transisi_menu', 'assets/audio/transisi_menu.mp3');

        
        this.load.spritesheet('sps_mumy', "assets/sprite/mummy37x45.png", {frameWidth: 37, frameHeight: 45});
        
        
        this.load.on('loaderror', function (file) {
            console.error('❌ File tidak ditemukan:', file.src);
        });
        
        this.load.on('filecomplete-spritesheet-sps_mumy', function (key) {
            console.log('✅ Spritesheet berhasil dimuat:', key);
        });
    },

    create() {
        X_POSITION = {
            LEFT: 0,
            CENTER: game.canvas.width / 2,
            RIGHT: game.canvas.width,
        };

        Y_POSITION = {
            TOP: 0,
            CENTER: game.canvas.height / 2,
            BOTTOM: game.canvas.height,
        };

        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "bg_start");
        
        var skorTertinggi = 0;
        try {
            skorTertinggi = localStorage.getItem("highscore") || 0;
        } catch(e) {
            skorTertinggi = 0;
        }

        if (snd_ambience == null){
            snd_ambience = this.sound.add('snd_ambience');
            snd_ambience.loop = true;
            snd_ambience.setVolume(0.35);
            snd_ambience.play();
        }

        this.snd_touch = this.sound.add('snd_touch');
        var snd_transisi = this.sound.add('snd_transisi_menu');

        const diz = this;
        let btnClicked = false;

        
        var btnPlay = this.add.image(1024 / 2, 768 / 2 + 75, 'btn_play');
        btnPlay.name = "btn_play";
        btnPlay.setInteractive();
        btnPlay.setScale(0);

        
        this.titleGame = this.add.image(1024 / 2, 200, 'title_game');
        this.titleGame.setDepth(10);
        this.titleGame.setScale(0);
        this.titleGame.y -= 384;

        
        var panelSkor = this.add.image(1024/2, 768-80, 'panel_skor');
        panelSkor.setOrigin(0.5);
        panelSkor.setDepth(10);
        panelSkor.setAlpha(0);

        var lblSkor = this.add.text(panelSkor.x + 25, panelSkor.y, "High Score : "+ skorTertinggi);
        lblSkor.setOrigin(0.5);
        lblSkor.setDepth(10);
        lblSkor.setFontSize(20);
        lblSkor.setTint(0xff732e);

        
        this.tweens.add({
            targets: diz.titleGame,
            ease: 'Bounce.easeOut',
            duration: 750,
            delay: 250,
            y: 200,
            onComplete: function(){
                snd_transisi.play();
            }
        });

       
        if (this.textures.exists('sps_mumy')) {
            console.log('✅ Membuat sprite mumy...');
            
            
            var mumy = this.add.sprite(1024/2, 768/2 + 150, 'sps_mumy');
            mumy.setDepth(15); 
            mumy.setScale(2);
            
            this.anims.create({
                key:'walk',
                frames: this.anims.generateFrameNumbers('sps_mumy', {start:0, end: 17}),
                frameRate:16
            });
            
            mumy.play({key:'walk', repeat:-1});
            console.log('✅ Animasi mumy berjalan');
            
        } else {
            console.warn('⚠️ Spritesheet sps_mumy tidak ditemukan, membuat placeholder...');
            
        
            var mumyPlaceholder = this.add.rectangle(1024/2, 768/2 + 150, 37*2, 45*2, 0xff6b35);
            mumyPlaceholder.setDepth(15);
            
        
            this.tweens.add({
                targets: mumyPlaceholder,
                x: mumyPlaceholder.x + 20,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        
        this.tweens.add({
            targets: btnPlay,
            ease: 'Back.easeOut',
            duration: 500,
            scaleX: 1,
            scaleY: 1
        });

        
        this.tweens.add({
            targets: diz.titleGame,
            ease: 'Elastic.easeOut',
            duration: 750,
            delay: 1000,
            scaleX: 1,
            scaleY: 1
        });

        
        this.tweens.add({
            targets: panelSkor,
            ease: 'Power2.easeOut',
            duration: 500,
            delay: 1500,
            alpha: 1
        });

        this.input.on('gameobjectover', function (pointer, gameObject) {
            if (!btnClicked && gameObject.name === "btn_play") {
                gameObject.setTint(0x616161);
            }
        }, this);

        this.input.on('gameobjectout', function (pointer, gameObject) {
            if (!btnClicked && gameObject.name === "btn_play") {
                gameObject.clearTint();
            }
        }, this);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject.name === "btn_play") {
                gameObject.setTint(0x616161);
                btnClicked = true;
            }
        }, this);

        this.input.on('gameobjectup', function (pointer, gameObject) {
            if (gameObject.name === "btn_play") {
                gameObject.clearTint();
                this.scene.start('scenePlay');
                this.snd_touch.play();
            }
        }, this);

        this.input.on('pointerup', function () {
            btnClicked = false;
        }, this);
    },

    update() {}
});