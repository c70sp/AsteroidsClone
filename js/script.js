const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const cc = new CanvasController(canvas);

document.addEventListener("keypress", (evt) => {
    if(evt.key == "Enter"){
        cc.resetGame();
    }
});

/**
 * TODO: PID?
 * function PID(target, current, dt){}
 */