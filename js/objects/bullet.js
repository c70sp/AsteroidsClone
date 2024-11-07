class Bullet{
    constructor(x, y, momX, momY, azimuth, spaceship){
        this.x = x;
        this.y = y;
        this.momX = momX;
        this.momY = momY;
        this.azimuth = azimuth;
        this.spaceship = spaceship;

        this.baseSpeed = 16; // bullet speed when stationary
        this.minSpeed = 15; // bullet speed minimum, used for when shooting backwards
        this.lifetime = 45; // in ticks
    }

    #destroy(){
        this.spaceship.bullets.splice(this.spaceship.bullets.indexOf(this), 1);
    }

    #checkBBox(){
        let canvas = this.spaceship.cc.canvas;

        if(this.x <= -15) this.x = canvas.width + 10;  // Left     =>  Right
        if(this.x >= canvas.width + 15) this.x = -10;  // Right    =>  Left
        if(this.y <= -15) this.y = canvas.height + 10; // Top      =>  Bottom
        if(this.y >= canvas.height + 15) this.y = -10; // Bottom   =>  Top
    }

    #checkCollision(){
        for(const asteroid of this.spaceship.cc.asteroids){
            if(distance(new Point(this.x, this.y), new Point(asteroid.x, asteroid.y)) <= asteroid.r){
                console.log("+ points");
                asteroid.destroy();
                this.#destroy();

                this.spaceship.cc.increaseScore(10);
            }
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
        this.#preDraw();
        ctx.fillStyle = "#FFF";

        ctx.translate(this.x, this.y);
        ctx.rotate(this.azimuth);

        ctx.beginPath();
        ctx.fillRect(-0.5, -3, 1, 6);
        ctx.closePath();

        ctx.rotate(-this.azimuth);
        ctx.translate(-this.x, -this.y);
    }
}