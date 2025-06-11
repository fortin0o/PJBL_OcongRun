const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

let player;
let stars;
let platforms;
let gameOver = false;
let score = 0;
let scoreText;
let gameOverText;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 20, y: 0, stepX: 80 }
    });

    stars.children.iterate(function (child) {
        child.y = Phaser.Math.Between(-300, -50);
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setScale(0.2);
        child.body.setGravityY(Phaser.Math.Between(10, 40));
    });

    // Score text - putih dan jelas
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
    });

    gameOverText = this.add.text(400, 300, '', {
        fontSize: '48px',
        fill: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

   this.time.addEvent({
    delay: 2000, // tiap 2 detik
    callback: spawnStar,
    callbackScope: this,
    loop: true
});

}

function update() {
    if (gameOver) return;

    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-300); // lebih cepat
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300); // lebih cepat
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-350); // lompat sedikit lebih tinggi
    }

    // Game over jika bintang jatuh ke bawah
    stars.children.iterate(function (child) {
        if (child.active && child.y > 600) {
            endGame(this);
        }
    }, this);
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}

const starSlots = [60, 140, 220, 300, 380, 460, 540, 620, 700];
let lastUsedIndex = -1;

function spawnStar() {
    const jumlahBintang = Phaser.Math.Between(1, 2); // 1–2 bintang tiap 2 detik

    for (let i = 0; i < jumlahBintang; i++) {
        let index;
        let attempt = 0;

        // Hindari slot yang sama dengan sebelumnya
        do {
            index = Phaser.Math.Between(0, starSlots.length - 1);
            attempt++;
        } while (index === lastUsedIndex && attempt < 5);

        lastUsedIndex = index;
        const x = starSlots[index];

        const star = stars.create(x, -50, 'star');
        star.setScale(0.2);
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setVelocityY(Phaser.Math.Between(20, 60));
        star.body.setGravityY(Phaser.Math.Between(10, 40));
    }
}



function endGame(scene) {
    scene.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    gameOverText.setText('GAME OVER\nScore: ' + score);
}