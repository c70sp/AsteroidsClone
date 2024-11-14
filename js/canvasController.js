class CanvasController{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.time = -1;
        this.timeLast = -2;
        this.dT = 0;

        this.shouldRun = true;
        this.playerDead = false;

        this.pressedKeys = [];
        this.spaceship = undefined;
        this.asteroids = [];
        this.numberAsteroids = 5;

        this.aliens = [];
        this.timeSinceAlienSpawn = 0;
        this.minAlienSpawnTime = 30; // in seconds
        this.maxAlienSpawnTime = 120; // in seconds
        this.maxAlienCount = 3;
        this.randAlienSpawnTime = getRandomInt(this.minAlienSpawnTime * 60, this.maxAlienSpawnTime * 60);

        this.score = 0;

        this.#init();
    }

    #init(){
        this.spaceship = new SpaceShip(this.canvas.width / 2, this.canvas.height / 2, this);
        this.aliens.push(new Alien(100, 100, this));

        this.#spawnAsteroids();
        this.#trySpawnAlien();

        this.#addEventListeners();
        this.#mainLoop();
    }

    #spawnAsteroids(){
        for(let i = 0; i < this.numberAsteroids; i++){
            let x = Math.random() * this.canvas.width;
            let y = Math.random() * this.canvas.height;
            let dist = distance(new Point(x, y), new Point(this.spaceship.x, this.spaceship.y));
            
            // repeat iteration if distance between spaceship and asteroid is too small 
            if(dist < 250){
                i--;
                continue;
            }

            this.asteroids.push(new Asteroid(x, y, this, 0));
        }
    }

    #trySpawnAlien(){
        if(this.aliens.length < this.maxAlienCount){
            if(this.timeSinceAlienSpawn <= this.randAlienSpawnTime){
                this.timeSinceAlienSpawn++;
            }else{
                console.log(this.randAlienSpawnTime);
                this.#spawnAlien();
            }
        }
    }

    #spawnAlien(){
        let x = ((Math.random() * this.canvas.width) - 50) + 25;
        let y = ((Math.random() * this.canvas.height) - 50) + 25;

        if(distance(new Point(x, y), new Point(this.spaceship.x, this.spaceship.y) <= 250)){
            this.#spawnAlien();
            return;
        }
        this.aliens.push(new Alien(x, y, this));

        this.timeSinceAlienSpawn = 0;
        this.randAlienSpawnTime = getRandomInt(this.minAlienSpawnTime * 60, this.maxAlienSpawnTime * 60);
    }

    #stopGame(){
        this.shouldRun = false;
        if(this.animationFrameId){
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Stops the game and destroys the animation frame
     * Then resets the state and initalizes again
     */
    resetGame(){
        this.#stopGame();

        this.spaceship = undefined;
        this.aliens = [];
        this.asteroids = [];
        this.pressedKeys = [];
        this.time = 0;
        this.score = 0;

        this.shouldRun = true;
        this.#init();
    }

    /**
     * Displays text on the screen
     * @param {*} flag Boolean, true = death message, false = score
     */
    displayText(flag){
        if(flag){
            this.#createDeathMessage();
        }else if(!flag){
            this.#showScoreMessage();
        }

        return;
    }

    #showScoreMessage(){
        this.ctx.font = "16px IBM Plex Mono";
        this.ctx.fillStyle = "#FFF";

        this.ctx.beginPath();
        this.ctx.fillText(`Score: ${this.score}`, 10, 26);
        this.ctx.closePath();
    }

    #createDeathMessage(){
        /**
         * Seems stupid to turn the obj. into a JSON string just to turn it back into an object,
         * but makes editing the message a lot easier for me :D
         * (not too bad anyways since it only happens when you die / reset instead of every frame and doesn't need much comp. power)
         */
        let msg = JSON.stringify({
            row1: {
                text: "GAME OVER",
                size: "32",
                color: "white"
            },
            row2: {
                text: `Score: ${this.score}`,
                size: "16",
                color: "white"
            },
            row3: {
                text: `Press Enter to reset`,
                size: "16",
                color: "white"
            }
        });

        msg = JSON.parse(msg);

        // Centering offset on X and Y
        let cOX = this.canvas.width / 2;
        let cOY = this.canvas.height / 2;

        // Calculate baseline height
        this.ctx.font = `10px sans-serif`;
        let hO = this.ctx.measureText("MMM").width;

        // Set the font to row1’s size and measure its width
        this.ctx.font = `${msg.row1.size}px IBM Plex Mono`;
        let row1Width = this.ctx.measureText(msg.row1.text).width;

        // Set the font to row2’s size and measure its width
        this.ctx.font = `${msg.row2.size}px IBM Plex Mono`;
        let row2Width = this.ctx.measureText(msg.row2.text).width;

        // Set the font to row3’s size and measure its width
        this.ctx.font = `${msg.row3.size}px IBM Plex Mono`;
        let row3Width = this.ctx.measureText(msg.row3.text).width;

        // Draw row1 text
        this.ctx.beginPath();
        this.ctx.font = `${msg.row1.size}px IBM Plex Mono`;
        this.ctx.fillStyle = msg.row1.color;
        this.ctx.fillText(msg.row1.text, cOX - (row1Width / 2), hO + cOY);
        this.ctx.closePath();

        // Draw row2 text centered below row1
        this.ctx.beginPath();
        this.ctx.font = `${msg.row2.size}px IBM Plex Mono`;
        this.ctx.fillStyle = msg.row2.color;
        this.ctx.fillText(msg.row2.text, cOX - (row2Width / 2), (hO * 2) + cOY);
        this.ctx.closePath();

        // Draw row3 text centered below row1
        this.ctx.beginPath();
        this.ctx.font = `${msg.row3.size}px IBM Plex Mono`;
        this.ctx.fillStyle = msg.row3.color;
        this.ctx.fillText(msg.row3.text, cOX - (row3Width / 2), (hO * 3) + cOY);
        this.ctx.closePath();
    }

    // Increases the score by amount (surprise surprise)
    increaseScore(amount){
        this.score += amount;
    }

    /**
     * 
     * @param {*} evt object from event listener
     * @param {*} status 1 = down, 0 = up
     */
    #updateKeyPress(status, evt){
        if (status && !this.pressedKeys.includes(evt.key)) {
            // Add key if it isn't already in the list
            this.pressedKeys.push(evt.key);
        } else if (!status) {
            // Find and remove the key that's no longer pressed
            const index = this.pressedKeys.indexOf(evt.key);
            if (index !== -1) {
                this.pressedKeys.splice(index, 1);
            }
        }
    }

    #addEventListeners(){
        document.addEventListener("keydown", this.#updateKeyPress.bind(this, 1));
        document.addEventListener("keyup", this.#updateKeyPress.bind(this, 0));
    }

    #mainLoop(){
        this.timeLast = this.time;
        this.time++;

        this.dt = this.time - this.timeLast;

        this.#preDraw();

        this.#draw();
        this.animationFrameId = requestAnimationFrame(this.#mainLoop.bind(this));
    }

    #preDraw(){
        this.spaceship.renderExhaust = false;
        if(this.shouldRun) this.spaceship.input(this.pressedKeys);
        
        if(this.asteroids.length == 0) this.#spawnAsteroids();
        this.#trySpawnAlien();
    }

    #draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.displayText(false);

        this.spaceship.draw(this.ctx);

        for(const asteroid of this.asteroids){
            asteroid.draw(this.ctx);
        }
        
        for(const alien of this.aliens){
            alien.draw(this.ctx);
        }
    }
}