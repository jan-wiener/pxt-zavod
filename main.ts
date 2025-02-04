
let status = 0

enum STATE {
    ready = 0,
    running = 1,
    finish = 2
}

enum WHOAMI {
    start = 0,
    end = 1
}

let whoAmI: WHOAMI
console.log(whoAmI)

let mode: STATE = STATE.ready;
mode = STATE.finish

let timeCalib: number

Sensors.SetLightLevel()
basic.showNumber(0)

let startTime: number
let totalTime: number



radio.onReceivedValue(function(name: string, value: number) {
    if (name == "calib") { //to end; recieve timecalib val
        timeCalib = value
    } else if (name == "time") { // to start; total time sent from end to start
        mode = STATE.finish
        totalTime = value
        console.log(`Závod trval ${totalTime}`)
    }
})
radio.onReceivedString(function(receivedString: string) {
    if (receivedString == "startSet") { //to end; set state to end
        whoAmI = WHOAMI.end
        basic.showNumber(2)
        music.playTone(100, 200)
        radio.sendString("calib") // return calib 

    } else if (receivedString == "stop") { // universal; stop
        mode = STATE.finish

    } else if (receivedString == "start") { // to end; start counting time
        mode = STATE.running
        startTime = control.millis()

    } else if (receivedString == "calib") { // to start; calculate calib time
        timeCalib = (control.millis() - timeCalib) / 2 //time to send a string in ms
        console.log(timeCalib)
        music.playTone(500, 300)
        radio.sendValue("calib", timeCalib) // send calib time in ms to end
    }
})

// get time to send a string
// the race begins
// because sending a str takes time, timer at WHOAMI.end begins later
// because of this, the program will add the time to send a str at the end (timeCalib)

// WARNING: if the race takes less time than to send a str, it will not work

Sensors.OnLightDrop(function () {

    if (mode == STATE.ready && whoAmI == WHOAMI.start) { //begin race on WHOAMI.start if ready 
        music.playTone(100, 200)
        mode = STATE.running
        radio.sendString("start") // send start info

    } else if (mode == STATE.running && whoAmI == WHOAMI.end) { // end race on WHOAMI.end if running
        music.playTone(100, 200)
        mode = STATE.finish
        totalTime = control.millis() - startTime // calculate total time
        totalTime += timeCalib // add send time
        console.log(`Závod trval ${totalTime}`) //basic.shownumber když to nefunguje
        radio.sendValue("time", totalTime)

    } else if (mode == STATE.finish) {
        console.log("n")

    }
})


input.onButtonPressed(Button.A, function() {
    if (whoAmI == WHOAMI.start && mode == STATE.finish) {
        basic.pause(2000)
        mode = STATE.ready
        music.playTone(200, 200)

    } else if (whoAmI != WHOAMI.end && mode == STATE.finish) {
        whoAmI = WHOAMI.start
        basic.showNumber(1)
        timeCalib = control.millis() // 
        music.playTone(100, 200)
        radio.sendString("startSet")
        basic.pause(2000)
        //mode = STATE.ready
        //music.playTone(100, 200)

    } else if (whoAmI == WHOAMI.start && mode == STATE.ready) {
        mode = STATE.finish
        music.playTone(100, 200)

    } else if (mode == STATE.running) {
        mode = STATE.finish
        music.playTone(200, 200)
        radio.sendString("stop")

    }
})


