class SpaceShip{
    constructor(x, y, cc){
        this.x = x;
        this.y = y;
        this.cc = cc;

        this.azimuth = 0; // 0 = north, CW to PI * 2 (north, radians)
        this.turnRate = 0.02; // base turn speed
        this.ticksTurning = 0; // time since starting to turn
        this.maxTurnSpeed = 0.10; // maximum speed of turn, always add turn rate since this is only a cap for the turn acceleration
        this.turnAcceleration = 100; // higher = slower acc

        this.maxSpeed = 10;
        this.acceleration = 0.25; // acceleration added to momentum
        this.momentumX = 0; // player movement per tick on X axis
        this.momentumY = 0; // player movement per tick on Y axis
        this.alive = true;

        this.playerChar ="[0,-0.5,-0.35,0.5,0,0.2,0.35,0.5,0,-0.5]";
        this.playerCharArr = [];
        this.playerCharArr = JSON.parse(this.playerChar);
        
        this.playerThruster = "[-0.2,0.37,0,0.8,0.2,0.37]";
        this.playerThrusterArr = [];
        this.playerThrusterArr = JSON.parse(this.playerThruster);
        this.size = 32;

        this.bullets = [];
        this.bulletCooldown = 10; // ticks
        this.currentCooldown = 0;

        this.renderExhaust = false;
        this.backwardAllowed = false;
    }

    input(keyList){
        for(const key of keyList){
            // Movement logic
            if(key === "ArrowUp" || key === "ArrowDown"){
                let direction;
                if(this.backwardAllowed){
                    direction = key === "ArrowUp" ? 1 : -1
                }else if(key === "ArrowUp"){
                    direction = 1;
                }else{
                    return;
                }

                let tempMomentumX = this.momentumX + direction * this.acceleration * Math.sin(this.azimuth);
                let tempMomentumY = this.momentumY - direction * this.acceleration * Math.cos(this.azimuth);

                const speed = Math.sqrt(tempMomentumX ** 2 + tempMomentumY ** 2);
                if (speed > this.maxSpeed) {
                    // Scale down to keep the momentum vector at max speed
                    const scale = this.maxSpeed / speed;
                    this.momentumX = tempMomentumX * scale;
                    this.momentumY = tempMomentumY * scale;
                } else {
                    // If within the limit, apply momentum directly
                    this.momentumX = tempMomentumX;
                    this.momentumY = tempMomentumY;
                }

                if(direction == 1){
                    this.renderExhaust = true;
                }
            }

            // Turning logic
            if(key === "ArrowLeft" || key === "ArrowRight"){
                const direction = key === "ArrowLeft" ? -1 : 1;
                this.azimuth += direction * (this.turnRate + Math.min(this.ticksTurning / this.turnAcceleration, this.maxTurnSpeed));
                this.ticksTurning++; // increase time since starting to turn
            }

            // Shooting logic
            if(key === " "){
                if(this.currentCooldown <= 0){
                    this.bullets.push(new Bullet(this.x, this.y, this.momentumX, this.momentumY, this.azimuth, this.bullets, this.cc, true));
                    this.currentCooldown = this.bulletCooldown;
                }
            }
        }
        // reset time since starting to turn when no turn key is in keyList
        if(!keyList.includes("ArrowLeft") && !keyList.includes("ArrowRight")) this.ticksTurning = 0;
    }

    #checkBBox(){
        if(this.x <= -15) this.x = this.cc.canvas.width + 10;  // Left     =>  Right
        if(this.x >= this.cc.canvas.width + 15) this.x = -10;  // Right    =>  Left
        if(this.y <= -15) this.y = this.cc.canvas.height + 10; // Top      =>  Bottom
        if(this.y >= this.cc.canvas.height + 15) this.y = -10; // Bottom   =>  Top
    }

    #checkCollision(){
        for(const asteroid of this.cc.asteroids){
            if(distance(new Point(this.x, this.y), new Point(asteroid.x, asteroid.y)) <= asteroid.rad + (15 / (asteroid.generation + 1))){
                this.alive = false;
            }
        }
    }

    #preDraw(){
        // TP player to other screen side if out of bounding box
        this.#checkBBox();
        this.#checkCollision();

        if(!this.alive){
            // GAME OVER
            this.cc.displayText(true); // true = generate and display death message
            this.cc.shouldRun = false;
        }

        if(this.currentCooldown > 0) this.currentCooldown--;

        this.momentumX *= 0.99;
        this.momentumY *= 0.99;

        if(this.cc.shouldRun) this.x += this.momentumX; // speed on X axis to X position
        if(this.cc.shouldRun) this.y += this.momentumY; // speed on Y axis to Y position
    }

    draw(ctx){
        this.#preDraw();

        // Reset
        ctx.translate(this.x, this.y);
        ctx.rotate(this.azimuth);
        
        // Front buffer calc
        ctx.strokeStyle = "#FFF";
        ctx.shadowBlur = 50;
        ctx.shadowColor = "#FFF";

        // Draw spaceship
        ctx.beginPath();
        for(let i = 0; i < this.playerCharArr.length; i += 2){
            if(i == 0) ctx.moveTo(this.playerCharArr[i] * this.size, this.playerCharArr[i+1] * this.size);
            ctx.lineTo(this.playerCharArr[i] * this.size, this.playerCharArr[i+1] * this.size);
        }
        ctx.stroke();
        ctx.closePath();

        // Draw thruster
        if(this.renderExhaust && Math.random() > 0.25){
            ctx.beginPath();
            for(let i = 0; i < this.playerThrusterArr.length; i += 2){
                if(i == 0) ctx.moveTo(this.playerThrusterArr[i] * this.size, this.playerThrusterArr[i+1] * this.size);
                ctx.lineTo(this.playerThrusterArr[i] * this.size, this.playerThrusterArr[i+1] * this.size);
            }
            ctx.stroke();
            ctx.closePath();
        }
        
        // transform to final render pos
        ctx.shadowBlur = 0;
        ctx.rotate(-this.azimuth);
        ctx.translate(-this.x, -this.y);

        for(const bullet of this.bullets){
            bullet.draw(ctx);
        }
    }
}