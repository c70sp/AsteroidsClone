const DerivativeMeasurement = {
    Velocity: "Velocity",
    ErrorRateOfChange: "ErrorRateOfChange"
};

let proportionalGain = 0.1; // P = Perfect Spring
let derivativeGain = 0; // D = Dampener
let integralGain = 1; // I = Steady State Error correction | Correction (e.g. to stop undershoot) and to stop constant external forces

// Set to derivativeMeasurement to Velocity to avoid "derivative kick" (error jumping becaue of prev. error)
let errorLast = 0;
let valueLast = 0;
let derivativeMeasurement = DerivativeMeasurement.Velocity;
let derivativeInitialised = false;

let integrationStored = 0;
let integralSaturation = 3; // Stops overshoot when switching targets
function PID(dt, current, target){
    let error = target - current;

    //* === CALC P TERM ===
    let P = proportionalGain * error;

    //* === CALC I TERM ===
    integrationStored += error * dt;
    integrationStored = Math.min(Math.max(integrationStored, -integralSaturation), integralSaturation);
    let I = integralGain * integrationStored;
    
    //* === CALC D TERM ===
    let errorRateOfChange = (error - errorLast) / dt;
    errorLast = error;

    let valueRateOfChange = (current - valueLast) / dt;
    valueLast = current;

    //* Choose D term to use
    let derivativeMeasure = 0;
    if(derivativeInitialised){
        if(derivativeMeasurement === DerivativeMeasurement.Velocity){
            derivativeMeasure = -valueRateOfChange;
        }else{
            derivativeMeasure = errorRateOfChange;
        }
    }else{
        derivativeInitialised = true;
    }
    let D = derivativeGain * derivativeMeasure;

    return {p: P, i: I, d: D};
}