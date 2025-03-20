window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 720;

    let towerRange = {
        "Sniper": 500,
        "Infantry": 100
    };

    let towerDamage = {
        "Sniper": 20,
        "Infantry": 5
    };

    let towerPrice = {
        "Sniper": 150,
        "Infantry": 75
    };

    let towerRate = {
        "Sniper": 1000,
        "Infantry": 200
    };

    let gameOver = false;
    let hovering = false;
    var money = localStorage.getItem('money') || 0;
    if (localStorage.getItem('money') == null) {
        localStorage.setItem('money', 150);
    }
    var wave = localStorage.getItem('Wave') || 0;
    if (localStorage.getItem('Wave') == null) {
        localStorage.setItem('Wave', 1);
    }
    var health = localStorage.getItem('Health') || 0;
    if (localStorage.getItem('Health') == null) {
        localStorage.setItem('Health', 100);
    }
    var highestWave = localStorage.getItem('HighestWave') || 0;
    var gameState = "Menu";
    var subState = "None";
    let startingUp = false
    var placingTower = "None";


    let mouseX;
    let mouseY;

    let towerObjects = [];

    let enemies = [];
    let waveInterval = 25;
    let enemiesPerWave = 10;
    let enemyHealth = 10;
    let enemySpeed = 2;
    let enemiesSpawned = 0;

    var enemyDeath = new Audio('enemyDeath.wav');
    var towerFire = new Audio('towerFire.wav');
    var clickSound = new Audio('click.wav');
    var sniperFire = new Audio('sniperFire.wav');
    var playerDamage = new Audio('playerDamage.wav');
    var playerDeath = new Audio('playerDeath.wav');
    var startUp = new Audio('startUp.wav');
    var startUpContined = new Audio('startUpContinued.wav');
    var birth = new Audio('birth.wav');
    var hypersteria = new Audio('Hypersteria.mp3');

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((
                        e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' ||
                        e.key === 'E') &&
                    this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'E') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
            canvas.addEventListener('click', e => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                //console.log(x, y);

                if (gameState == "Menu") {
                    menuClicked(x, y);
                } else if (gameState == "Playing") {
                    playingClicked(x, y);
                }

                // DELETE/SELL TOWER
                if (placingTower == "None"){
                    for (let i = 0; i < towerObjects.length; i++) {
                        let tower = towerObjects[i];
                        let distance = Math.sqrt((Math.abs(mouseX - tower.x) ** 2) + (Math.abs(mouseY - tower.y) ** 2));
                        if (distance < 60) {
                            console.log(tower);
                            if (subState == "Upgrading"){
                                subState = "None";
                            } else {
                                subState = "Upgrading";
                            }
                        } else if (mouseX > 113 && mouseX < 614 && mouseY < 605 && mouseY > 230) {
                            if (subState == "Upgrading"){
                                subState = "None";
                            }
                        }
                        if (subState == "Upgrading"){
                            if (mouseX > 751 && mouseX < 931 && mouseY < 557 && mouseY > 534){
                                towerObjects.splice(i);
                                localStorage.setItem('money', money += 1/2*(towerPrice[tower.type]));
                                console.log('what');
                                subState = "None";
                            }
                        }
                    }
                }
                console.log(mouseX);
                console.log(mouseY);

                if (placingTower != "None") {    
                    if (mouseX > 113 && mouseX < 614 && mouseY < 605 && mouseY > 230) {
                        let canPlace = true;
                        if(mouseX < 208 && mouseY > 309 && mouseY < 411){
                            canPlace = false;
                        } else if (mouseX > 208 && mouseX < 311 && mouseY > 309 && mouseY < 605){
                            canPlace = false;
                        } else if (mouseX > 311 && mouseX < 386 && mouseY > 510 && mouseY < 605){
                            canPlace = false;
                        } else if (mouseX > 386 && mouseX < 486 && mouseY > 10 && mouseY < 605){
                            canPlace = false;
                        } else if (mouseX > 530 && mouseX < 630 && mouseY > 10 && mouseY < 605){
                            canPlace = false;
                        }
                        // put this after all the mouse stuff canPlace = true;
                        for (let i = 0; i < towerObjects.length; i++) {
                            let tower = towerObjects[i];
                            let distance = Math.sqrt((Math.abs(mouseX - tower.x) ** 2) + (Math.abs(mouseY - tower.y) ** 2));
                            if (distance < 60) {
                                canPlace = false;
                            }
                        }

                        if (canPlace) {
                            //moved old logic into Tower class
                            let tower = new Tower(mouseX, mouseY, placingTower);
                            towerObjects.push(tower);
                            placingTower = "None";
                            clickSound.load();
                            clickSound.play();
                        }

                        
                    }
                }
            });

            canvas.addEventListener("mousemove", e => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;

                if (placingTower != "None") {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    map1.draw(ctx);
                    displayTextGame(ctx);
                    registerTowers();
                    drawPlacementPreview();
                }
            });
        }

        draw(context) {

        }
    }

    function drawPlacementPreview() {
        if (placingTower != "None") {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2, false);
            ctx.fillStyle = placingTower == "Sniper" ? "rgba(0,255,0,0.5)" : "rgba(255,192,203,0.5)";
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(mouseX, mouseY, towerRange[placingTower], 0, Math.PI * 2, false);
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fill();
            ctx.closePath();
        }
    }

    function menuClicked(mouseX, mouseY) {
        if (mouseX > 25 && mouseX < 75 && mouseY > 655 && mouseY < 710) {
            startUp.load();
            startUp.play();
            startingUp = true;
            setTimeout(function(){
                gameState = "Playing";
                setWave();
                hypersteria.loop = true;
                hypersteria.play();
            }, 3527);
        }
    }

    function playingClicked(mouseX, mouseY) {
        if (mouseX > 25 && mouseX < 75 && mouseY > 655 && mouseY < 710) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameState = "Menu";
            clickSound.load();
            clickSound.play();
            startUpContined.load();
            startUpContined.play();
            hypersteria.pause();
            startingUp = false
        }
        if (mouseX > 775 && mouseX < 835 && mouseY > 145 && mouseY < 206 && money >= towerPrice["Sniper"]) {
            placingTower = "Sniper";
            this.type = "Sniper";
            localStorage.setItem('money', money -= towerPrice["Sniper"]);
            clickSound.load();
            clickSound.play();
        }
        if (mouseX > 850 && mouseX < 910 && mouseY > 145 && mouseY < 206 && money >= towerPrice["Infantry"]) {
            placingTower = "Infantry";
            this.type = "Infantry";
            localStorage.setItem('money', money -= towerPrice["Infantry"]);
            clickSound.load();
            clickSound.play();
        }
        if (mouseX > 703 && mouseX < 942 && mouseY > 678 && mouseY < 800) {
            gameState = "inWave";
            console.log("test")
            clickSound.load();
            clickSound.play();
        }
    }

    function setWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startUpContined.load();
        startUpContined.play();
    }

    class Tower {
        constructor(mouseX, mouseY, type) {
            this.activeEnemy = false;
            this.x = mouseX;
            this.y = mouseY;
            this.radius = 30;
            this.startAngle = 0;
            this.endAngle = 2 * Math.PI;
            this.image = document.getElementById('SniperTower');
            this.lastShotTime = 0; // Initialize lastShotTime
            this.type = type;
        }

        draw(ctx) {
            // ctx.drawImage(this.image, this.x - 19, this.y - 64,38,64);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.type == "Sniper" ? "green" : "pink";
            ctx.fill();
            ctx.closePath();
        }

        towerShoot(timeStamp) {
            if (!this.activeEnemy) {
                // Try to find an enemy to target
                for (let i = 0; i < enemies.length; i++) {
                    const enemy = enemies[i];
                    if (Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2) <= towerRange[this.type] && enemy.health > 0) {
                        this.activeEnemy = enemy;
                        break;
                    }
                }
            } else {
                // Have an active target, shoot and don't set to false until target is dead or out of range...
                if (this.activeEnemy.markedForDeletion === true) {
                    this.activeEnemy = false;
                } else {
                    if (!(Math.sqrt((this.x - this.activeEnemy.x) ** 2 + (this.y - this.activeEnemy.y) ** 2) <= towerRange[this.type])) {
                        this.activeEnemy = false;
                    }
                    if (timeStamp - this.lastShotTime >= towerRate[this.type]) {
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.activeEnemy.x, this.activeEnemy.y);
                        ctx.lineWidth = 10;
                        ctx.stroke();
                        if (this.type == "Sniper"){
                            sniperFire.load();
                            sniperFire.play();
                        } else {
                            towerFire.play();
                        }
                        if (this.activeEnemy != false) {
                            this.activeEnemy.health -= towerDamage[this.type];
                        }
                        if (this.activeEnemy.health <= 0) {
                            this.activeEnemy.markedForDeletion = true;
                            enemyDeath.load();
                            enemyDeath.play();
                        }
                        this.lastShotTime = timeStamp;
                    }
                }
            }
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {}
        draw(context) {}
        update(input) {
            if (input.keys.indexOf('ArrowRight') > -1) {
                localStorage.setItem('money', money += 10);
                console.log(localStorage.getItem('Wave'));
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                localStorage.setItem('money', money -= 10);
                console.log(localStorage.getItem('Wave'));
            } else if (input.keys.indexOf('ArrowUp') > -1) {
                localStorage.setItem('Wave', wave = 1);
                localStorage.setItem('money', money = 150);
                localStorage.setItem('Health', health = 100);
                console.log(localStorage.getItem('Wave'));
            }
        }
    }

    class MainMenu {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('screenOff');
            this.x = 0;
            this.y = 0;
            this.width = gameWidth;
            this.height = gameHeight;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    class Map1 {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.map = document.getElementById('map');
            this.screen = document.getElementById('screen');
            this.list = document.getElementById('list');
            this.frame = document.getElementById('frame');
            this.red_button = document.getElementById('red_button');
            this.x = 58;
            this.y = 61;
            this.width = 602;
            this.height = 595;
        }
        draw(context) {
            context.drawImage(this.map, 49, 61, 602, 595);
            context.drawImage(this.screen, 48, 57, 629, 606);
            context.drawImage(this.frame, 0, 0, 1000, 720);
            context.drawImage(this.list, 722, 68, 226, 584);
            context.drawImage(this.red_button, 8, 639, 77, 77);

            //SNIPER TOWER
            ctx.beginPath();
            ctx.arc(800, 170, 30, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.fillStyle = "green";
            ctx.fill();

            //INFANTRY
            ctx.beginPath();
            ctx.arc(875, 170, 30, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.fillStyle = "pink";
            ctx.fill();
        }
    }

    function displayTextMenu(context) {
        context.font = '40px Courier';
        context.fillStyle = 'gray';
        context.fillText('POWER', 80, 700);
    }

    function displayTextGame(context) {
        context.font = '40px Courier';
        context.fillStyle = 'gray';
        context.fillText('POWER', 80, 700);
        context.font = '40px Courier';
        context.fillStyle = 'green';
        context.fillText('WAVE: ' + localStorage.getItem('Wave'), 410, 145);
        context.font = '40px Courier';
        context.fillStyle = 'green';
        context.fillText('MONEY: ' + localStorage.getItem('money'), 110, 145);
        context.font = '40px Courier';
        context.fillStyle = 'green';
        context.fillText('HEALTH: ' + localStorage.getItem('Health'), 106, 195);
        context.font = '40px Courier';
        context.fillStyle = 'yellow';
        context.fillText('START WAVE', 700, 700);
    }

    function upgradeTowerText(context){
        context.font = 'bold 30px Courier';
        context.fillStyle = 'red';
        context.fillText('SELL TOWER', 746, 550);
    }

    class Enemy {
        constructor() {
            this.x = 82;
            this.y = 363;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = enemySpeed;
            this.speedX = this.speed;
            this.speedY = 0;
            this.health = enemyHealth;
            this.markedForDeletion = false;

        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
            ctx.font = '20px Courier';
            ctx.fillStyle = 'gray';
            ctx.fillText(this.health, this.x - 10, this.y);

        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0
            } else {
                this.frameTimer += deltaTime;
            }
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > 260) {
                this.speedX = 0;
                this.speedY = this.speed;
            }
            if (this.y > 560) {
                this.speedX = this.speed;
                this.speedY = 0;
            }
            if (this.x > 438) {
                this.speedX = 0;
                this.speedY = -this.speed;
            }
            if (this.y < 180) {
                this.speedX = this.speed;
                this.speedY = 0;
            }
            if (this.x > 583) {
                this.speedX = 0;
                this.speedY = this.speed;
            }
            if (this.y > 640) {
                this.markedForDeletion = true;
                playerDamage.load();
                playerDamage.play();
                localStorage.setItem('Health', health -= this.health);
                console.log(health);
            }
            if (health <= 0){
                enemySpeed = 0;
                enemies = [];
                playerDeath.load();
                playerDeath.play();
                localStorage.setItem('money', money = 0);
                setTimeout(function(){
                    localStorage.setItem('Wave', wave = 1);
                    localStorage.setItem('money', money = 150);
                    localStorage.setItem('Health', health = 100);
                    location.reload(true);
                }, 1238);
            }
        }
    }

    function handleEnemies(deltaTime) {
        if (gameState == "inWave" && enemyTimer == 0 && enemiesSpawned < enemiesPerWave) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            console.log("test3")
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = waveInterval;
            birth.load();
            birth.play();
            enemiesSpawned++
        } else if (enemies.length < 1 && enemiesSpawned >= enemiesPerWave) {
            gameState = "Playing";
            localStorage.setItem('Wave', wave++);
            if(wave % 2 == 0){
                enemyHealth += 5;
                if (enemyHealth < 30){
                    enemySpeed += .5;
                }
            }
            localStorage.setItem('money', money += Math.floor(enemiesPerWave * (1/8*(enemyHealth))));
            enemiesSpawned = 0;
            enemiesPerWave = Math.round(enemiesPerWave * 1.1)
            if (waveInterval > 1) {
                waveInterval -= 1;
            } else {
                waveInterval = 1;
            }
            console.log("test2")
            enemyTimer = 0;
        } else if (gameState == "inWave") {
            enemyTimer -= 1;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function registerTowers() {
        var towerLength = towerObjects.length;
        for (var i = 0; i < towerLength; i++) {
            ctx.beginPath();
            ctx.arc(towerObjects[i].x, towerObjects[i].y, 30, 0, Math.PI * 2, false);
            ctx.fillStyle = towerObjects[i].type == "Sniper" ? "green" : "pink";
            ctx.fill();
            ctx.closePath();
        }
    }

    const input = new InputHandler();
    const mainmenu = new MainMenu(canvas.width, canvas.height);
    const map1 = new Map1(canvas.width, canvas.height);
    const player = new Player(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 100;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        if (gameState == "Playing") {
            map1.draw(ctx);
            displayTextGame(ctx);
            registerTowers();
            //loop through the list of towers to draw
            for (let i = 0; i < towerObjects.length; i++) {
                towerObjects[i].draw(ctx);
            }
            ctx.drawImage(map1.screen, 48, 57, 629, 606);
            if (placingTower != "None") {
                drawPlacementPreview();
            }
            if (subState == "Upgrading"){
                upgradeTowerText(ctx);
            }
            
        }

        if (gameState == "Menu") {
            mainmenu.draw(ctx);
            displayTextMenu(ctx);
            if(startingUp == true){
                ctx.drawImage(this.red_button, 8, 639, 77, 77);
            }
        }

        if (gameState == "inWave") {
            map1.draw(ctx);
            displayTextGame(ctx);
            registerTowers();
            handleEnemies(deltaTime);
            //console.log(enemies);

            //loop through the list of towers to draw (repeated from above, not best practice...)
            for (let i = 0; i < towerObjects.length; i++) {
                towerObjects[i].draw(ctx);
                towerObjects[i].towerShoot(timeStamp);
            }
            ctx.drawImage(map1.screen, 48, 57, 629, 606);
        }

        player.draw(ctx);
        player.update(input);
        requestAnimationFrame(animate);
    }
    animate();
});

//i added "Hypersteria.png" as an image, it's that pixel art logo that i made, so if you can find a way to implement it that'd be sick