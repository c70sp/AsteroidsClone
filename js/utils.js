function distance(p1, p2){
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function getAzimuth(p1, p2){
    return Math.atan2(-(p1.x - p2.x), p1.y - p2.y);
    // return Math.atan2(p2.x - p1.x, p2.y - p1.y);
}

function degToRad(deg){
    return deg * (Math.PI / 180)
}

function radToDeg(rad){
    return rad * (180 / Math.PI);
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}