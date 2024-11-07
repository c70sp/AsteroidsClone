class Asteroid{
    constructor(x, y, r, cc){
        this.x = x;
        this.y = y;
        this.r = r;
        this.cc = cc;
        // TODO™️: SAT for player and bullet collision

        this.display = {
            "circle":       false,
            "vector":       false,
            "vectorRand":   false,
            "points":       false,
            "segments":     true
        };

        // settings
        this.amountPoints = 10;
        this.rad = 25;
        this.vecLength = 20;
        this.vecInset = 10;
        this.maxAngle = 45;

        this.maxSpeed = 3;
        this.azimuth = Math.random() * (Math.PI * 2);
        this.speed = Math.random() * this.maxSpeed;
        this.dX = this.speed * Math.sin(this.azimuth);
        this.dY = this.speed * Math.cos(this.azimuth);
        
        this.#init();
    }

    #init(){
        this.points = [];
        this.vectors = [];
        this.vectorsRand = [];
        this.segments = [];

        let tempPoints = [];

        let offsetAngle = (Math.PI*2) / this.amountPoints;
        for(let i = 0; i < this.amountPoints; i++){
            let x = this.rad * Math.sin(offsetAngle * i);
            let y = this.rad * Math.cos(offsetAngle * i);
            let point = new Point(x, y, this.x, this.y);
            let randAngle = (Math.random() * this.maxAngle * 2 - this.maxAngle) * Math.PI / 180;

            let rotatedVector = new Vector(point, this.vecLength, offsetAngle * i + randAngle, this.vecInset, "#80FF9E");
            let normalVector = new Vector(point, this.vecLength, offsetAngle * i, this.vecInset, "#FFC680");

            tempPoints.push(point);
            this.vectors.push(normalVector);
            this.vectorsRand.push(rotatedVector);

            this.points.push(rotatedVector.generateRandomPoint());
        }

        for(let i = 0; i < this.points.length; i++){
            if(this.points[i] == this.points[0]){
                this.segments.push(new Segment(this.points[i], this.points[this.points.length - 1]));
                continue;
            }

            this.segments.push(new Segment(this.points[i], this.points[i - 1]));
        }
    }

    destroy(){
        this.cc.asteroids.splice(this.cc.asteroids.indexOf(this), 1);
    }

    #checkBBox() {
        let wrappedX = this.x;
        let wrappedY = this.y;

        if (this.x <= -30) wrappedX = this.cc.canvas.width + 25;  // Left => Right
        if (this.x >= this.cc.canvas.width + 30) wrappedX = -25;  // Right => Left
        if (this.y <= -30) wrappedY = this.cc.canvas.height + 25; // Top => Bottom
        if (this.y >= this.cc.canvas.height + 30) wrappedY = -25; // Bottom => Top

        // Calculate the offset caused by wrapping
        let offsetX = wrappedX - this.x;
        let offsetY = wrappedY - this.y;

        // Update the asteroid center position
        this.x = wrappedX;
        this.y = wrappedY;

        // Apply the same offset to all points in pointList
        for (const point of this.points) {
            point.x += offsetX;
            point.y += offsetY;
        }
    }

    #preDraw(){
        this.x += this.dX;
        this.y += this.dY;

        for(const point of this.points){
            point.x += this.dX;
            point.y += this.dY;
        }

        if(this.display.vector){
            for(const vector of this.vectors){
                vector.p1.x += this.dX;
                vector.p1.y += this.dY;
    
                vector.p2.x += this.dX;
                vector.p2.y += this.dY;
            }
        }
        if(this.display.vectorRand){
            for(const vector of this.vectorsRand){
                vector.p1.x += this.dX;
                vector.p1.y += this.dY;
    
                vector.p2.x += this.dX;
                vector.p2.y += this.dY;
            }
        }

        this.#checkBBox();
    }

    draw(ctx){
        if(this.cc.shouldRun) this.#preDraw();

        if(this.display.circle){
            ctx.beginPath();
            ctx.arc(this.x + 0.5, this.y + 0.5, this.rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }

        if(this.display.vector){
            for(const vector of this.vectors){
                vector.draw(ctx);
                vector.x += this.dX;
                vector.y += this.dY;
            }
        }
        if(this.display.vectorRand){
            for(const vector of this.vectorsRand){
                vector.draw(ctx);
                vector.x += this.dX;
                vector.y += this.dY;
            }
        }
        if(this.display.segments){
            for(const segment of this.segments){
                segment.draw(ctx);
            }
        }
        if(this.display.points){
            for(const point of this.points){
                point.draw(ctx);
            }
        }
    }
}