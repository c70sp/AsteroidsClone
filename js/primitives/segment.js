class Segment{
    constructor(p1, p2, color = "#FFF"){
        this.p1 = p1;
        this.p2 = p2;

        this.color = color;
    }

    draw(ctx){
        ctx.strokeStyle = this.color;


        ctx.beginPath();
        ctx.moveTo(this.p1.x + this.p1.stdOffsetX, this.p1.y + this.p1.stdOffsetY);
        ctx.lineTo(this.p2.x + this.p2.stdOffsetX, this.p2.y + this.p2.stdOffsetY);
        ctx.stroke();
        ctx.closePath();
    }
}