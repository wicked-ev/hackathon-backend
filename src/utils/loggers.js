import { blue, green, red } from "colorette";


export function requestLogger(req) {
    console.log(blue(`request type: ${req.method}`));
    if(req.body) {
        console.log(green(JSON.stringify(req.body, null, 2)));
    } else {
        console.log("body unidentified");
    }    
}


export function LogError(message) {
    console.log(red(message));
}