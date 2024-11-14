class Bullet{
    constructor(x, y, momX = 0, momY = 0, azimuth, bulletList, cc, player){
        this.x = x;
        this.y = y;
        this.momX = momX;
        this.momY = momY;
        this.azimuth = azimuth;
        this.bulletList = bulletList;
        this.cc = cc;
        this.player = player; // true = fired by player, false = fired by alien

        this.baseSpeed = 16; // bullet speed when stationary
        this.minSpeed = 15; // bullet speed minimum, used for when shooting backwards
        this.lifetime = 45; // in ticks
    }

    #destroy(){
        this.bulletList.splice(this.bulletList.indexOf(this), 1);
    }

    #checkBBox(){
        let canvas = this.cc.canvas;

        if(this.x <= -15) this.x = canvas.width + 10;  // Left     =>  Right
        if(this.x >= canvas.width + 15) this.x = -10;  // Right    =>  Left
        if(this.y <= -15) this.y = canvas.height + 10; // Top      =>  Bottom
        if(this.y >= canvas.height + 15) this.y = -10; // Bottom   =>  Top
    }

    #checkCollision(){
        if(this.player == true){
            for(const asteroid of this.cc.asteroids){
                if(distance(new Point(this.x, this.y), new Point(asteroid.x, asteroid.y)) <= asteroid.rad){
                    // Higher gen. = smaller asteroid = more points
                    this.cc.increaseScore(10 * (asteroid.generation + 1));
    
                    asteroid.destroy();
                    this.#destroy();
                }
            }
            for(const alien of this.cc.aliens){
                if(distance(new Point(this.x, this.y), new Point(alien.x, alien.y)) <= alien.size / 1.5){
                    this.cc.increaseScore(2500);

                    alien.destroy();
                    this.#destroy();
                }
            }
        }else if(this.player == false){
            let dist = distance(new Point(this.x, this.y), new Point(this.cc.spaceship.x, this.cc.spaceship.y));
            for(const asteroid of this.cc.asteroids){
                if(distance(new Point(this.x, this.y), new Point(asteroid.x, asteroid.y)) <= asteroid.rad){
                    this.#destroy();
                }
            }
            if(dist <= this.cc.spaceship.size / 1.5){
                this.cc.spaceship.alive = false;
            }
        }else{
            console.error("Bullet origin not specified!");
        }
    }

    #preDraw(){
        // In normal flight
        let sX = this.momX + (this.baseSpeed * Math.sin(this.azimuth));
        let sY = this.momY - (this.baseSpeed * Math.cos(this.azimuth));

        // for flying backwards, so that bullets do not fly backwards but rather in the direction they're shot in
        if(Math.sqrt(sX ** 2 + sY ** 2) <= this.minSpeed){
            sX = this.minSpeed * Math.sin(this.azimuth);
            sY = -(this.minSpeed * Math.cos(this.azimuth));
        }

        this.x += sX;
        this.y += sY;

        if(this.lifetime <= 0){
            this.#destroy();
            return;
        }
        this.lifetime--;

        this.#checkBBox();
        this.#checkCollision();
    }

    draw(ctx){
        if(this.cc.shouldRun) this.#preDraw();
        ctx.fillStyle = "#FFF";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFF";

        ctx.translate(this.x, this.y);
        ctx.rotate(this.azimuth);

        ctx.beginPath();
        ctx.fillRect(-0.5, -3, 1, 6);
        ctx.closePath();

        ctx.rotate(-this.azimuth);
        ctx.translate(-this.x, -this.y);
        ctx.shadowBlur = 0;
    }
}