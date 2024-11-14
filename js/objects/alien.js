class Alien{
    constructor(x, y, cc){
        this.x = x;
        this.y = y;
        this.cc = cc;

        this.size = 32;
        this.maxSpeed = 3;
        this.acceleration = 0.0025; // acceleration added to momentum
        this.dX = 0; // spaceship movement per tick on X axis
        this.dY = 0; // spaceship movement per tick on X axis
        this.targetX = this.cc.canvas.width / 2;
        this.targetY = this.cc.canvas.height / 2;

        this.bullets = [];
        this.bulletCooldown = 75; // ticks 25 | Number.MAX_SAFE_INTEGER
        this.currentCooldown = 0;

        this.alienChar =
        "[-0.9, 0, -0.4, -0.3, -0.3, -0.6, 0.3, -0.6, 0.4, -0.3, 0.9, 0, 0.4, 0.3, -0.4, 0.3, -0.9, 0, 0.9, 0, 0.4, -0.3, -0.4, -0.3]";
        this.alienCharArr = [];
        this.alienCharArr = JSON.parse(this.alienChar);

        this.vec = new Vector(
            new Point(this.x, this.y),
            distance(new Point(this.x, this.y), new Point(this.cc.spaceship.x, this.cc.spaceship.y)),
            0, 0, "#F00"
        );
    }

    destroy(){
        // Delete this object
        this.cc.aliens.splice(this.cc.aliens.indexOf(this), 1);
    }

    #attemptShoot(){
        let pAz = getAzimuth(new Point(this.x, this.y), new Point(this.cc.spaceship.x, this.cc.spaceship.y));
        this.vec.azimuth = pAz;
        
        if(this.currentCooldown <= 0){
            // Semi good aiming algorithm with randomness based on distance
            let distanceFactor = ((distance(new Point(this.x, this.y), new Point(this.cc.spaceship.x, this.cc.spaceship.y))) / 10000) / 1;
            pAz += ((Math.random() * degToRad(25)) - degToRad(12)) - distanceFactor;

            let x = this.x + (Math.sin(pAz) * (this.size / 1.7));
            let y = this.y + (Math.cos(pAz) * (this.size / 1.7));

            this.bullets.push(new Bullet(x, y, this.momentumX, 0, pAz, this.bullets, this.cc, false));
            this.currentCooldown = this.bulletCooldown;
        }
    }

    #getNewTargetPos(){
        this.targetX = Math.random() * (this.cc.canvas.width - (this.size * 3));
        this.targetY = Math.random() * (this.cc.canvas.height - (this.size * 3));
    }

    #calcPosition(){
        if(distance(new Point(this.x, this.y), new Point(this.targetX, this.targetY)) <= 25){
            this.#getNewTargetPos();
        }
        
        let pidX = PID(this.cc.dt, this.x, this.targetX);
        let pidY = PID(this.cc.dt, this.y, this.targetY);
        
        let tempDX = this.dX + ((pidX.p + pidX.i + pidX.d) * this.acceleration);
        let tempDY = this.dY + ((pidY.p + pidY.i + pidY.d) * this.acceleration);

        const speed = Math.sqrt(tempDX ** 2 + tempDY ** 2);
        if (speed > this.maxSpeed) {
            // Scale down to keep the momentum vector at max speed
            const scale = this.maxSpeed / speed;
            this.dX = tempDX * scale;
            this.dY = tempDY * scale;
        } else {
            // If within the limit, apply momentum directly
            this.dX = tempDX;
            this.dY = tempDY;
        }

        this.x += this.dX;
        this.y += this.dY;
    }

    #preDraw(){
        if(this.currentCooldown > 0) this.currentCooldown--;
        if(this.cc.shouldRun) this.#attemptShoot();
        if(this.cc.shouldRun) this.#calcPosition();

        this.vec.p1.x = this.x;
        this.vec.p1.y = this.y;
        this.vec.len = distance(new Point(this.x, this.y), new Point(this.cc.spaceship.x, this.cc.spaceship.y));
    }

    draw(ctx){
        this.#preDraw();

        // Reset
        ctx.translate(this.x, this.y);
        ctx.rotate(this.azimuth);
        
        // Front buffer calc
        ctx.strokeStyle = "#F94144";
        ctx.shadowBlur = 50;
        ctx.shadowColor = "#F94144";

        // Draw UFO
        ctx.beginPath();
        for(let i = 0; i < this.alienCharArr.length; i += 2){
            if(i == 0) ctx.moveTo(this.alienCharArr[i] * this.size, this.alienCharArr[i+1] * this.size);
            ctx.lineTo(this.alienCharArr[i] * this.size, this.alienCharArr[i+1] * this.size);
            // console.log("ednjfskn");
        }
        ctx.stroke();
        ctx.closePath();


        ctx.shadowBlur = 0;
        ctx.rotate(-this.azimuth);
        ctx.translate(-this.x, -this.y);

        for(const bullet of this.bullets){
            bullet.draw(ctx);
        }

        this.vec.draw(ctx);
    }
}