class Alien{
    constructor(x, y, cc){
        this.x = x;
        this.y = y;
        this.cc = cc;

        this.size = 32;
        this.maxSpeed = 10;
        this.acceleration = 0.25; // acceleration added to momentum
        this.momentumX = 0; // player movement per tick on X axis
        this.targetX = 0;

        this.bullets = [];
        this.bulletCooldown = 25; // ticks
        this.currentCooldown = 0;

        this.alienChar =
        "[-0.9, 0, -0.4, -0.3, -0.3, -0.6, 0.3, -0.6, 0.4, -0.3, 0.9, 0, 0.4, 0.3, -0.4, 0.3, -0.9, 0, 0.9, 0, 0.4, -0.3, -0.4, -0.3]";
        this.alienCharArr = [];
        this.alienCharArr = JSON.parse(this.alienChar);
    }

    #attemptShoot(){
        // let azimuth = Math.random() * (Math.PI * 2);
        let azimuth = 124 * Math.PI / 180;

        if(this.currentCooldown <= 0){
            let x = this.x + (Math.sin(azimuth) * (this.size / 1.7));
            let y = this.y - (Math.cos(azimuth) * (this.size / 1.7));

            this.bullets.push(new Bullet(x, y, this.momentumX, 0, azimuth, this.bullets, this.cc, false));
            this.currentCooldown = this.bulletCooldown;
        }
    }

    #calcPosition(){

    }

    #preDraw(){
        if(this.currentCooldown > 0) this.currentCooldown--;
        if(this.cc.shouldRun) this.#attemptShoot();
        if(this.cc.shouldRun) this.#calcPosition();
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
    }
}