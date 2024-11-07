class Point{
    constructor(x, y, stdOffsetX = 0, stdOffsetY = 0){
        this.x = x;
        this.y = y;

        this.stdOffsetX = stdOffsetX;
        this.stdOffsetY = stdOffsetY;
    }

    draw(ctx){
        ctx.fillStyle = "#F00";

        ctx.beginPath();
        ctx.arc(this.x + this.stdOffsetX, this.y + this.stdOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}