class Vector{
    constructor(p, len, azimuth, innerOffset, color){
        this.p = p;
        this.len = len;
        this.azimuth = azimuth;
        this.innerOffset = innerOffset;
        this.color = color;
        
        this.p1 = new Point(p.x, p.y, p.stdOffsetX, p.stdOffsetY);
        this.p1.x -= innerOffset * Math.sin(this.azimuth);
        this.p1.y -= innerOffset * Math.cos(this.azimuth);

        this.p2 = new Point(undefined, undefined);
    }

    generateRandomPoint(){
        /**
         * Going with some const offset first
         * TODO: actually move vector
         */
        const t = Math.random() * this.len;

        const x = this.p1.x + t * Math.sin(this.azimuth) + this.p1.stdOffsetX;
        const y = this.p1.y + t * Math.cos(this.azimuth) + this.p1.stdOffsetY;

        return new Point(x, y);
    }

    draw(ctx){
        this.p2.x = (this.len * Math.sin(this.azimuth)) + this.p1.x + this.p1.stdOffsetX;
        this.p2.y = (this.len * Math.cos(this.azimuth)) + this.p1.y + this.p1.stdOffsetY;

        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.p1.x + this.p1.stdOffsetX + 0.5, this.p1.y + this.p1.stdOffsetY + 0.5);
        ctx.lineTo(this.p2.x + 0.5, this.p2.y + 0.5);
        ctx.stroke();
        ctx.closePath();
    }
}