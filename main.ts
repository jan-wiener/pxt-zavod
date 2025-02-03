
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


Sensors.SetLightLevel()
basic.showNumber(0)

let startTime: number
let totalTime: number


//radio.onReceivedNumber(function(receivedNumber: number) {
//    mode = STATE.running
//    startTime = receivedNumber
//})

radio.onReceivedValue(function(name: string, value: number) {
    if (name == "start") {
        mode = STATE.running
        startTime = control.millis()
    } else if (name == "time") {
        mode = STATE.finish
        totalTime = value
        console.log(`Závod trval ${totalTime}`)
    }
})
radio.onReceivedString(function(receivedString: string) {
    if (receivedString == "startSet") {
        whoAmI = WHOAMI.end
        basic.showNumber(2)
    } else if (receivedString == "stop") {
        mode = STATE.finish
    }
})


Sensors.OnLightDrop(function () {

    if (mode == STATE.ready && whoAmI == WHOAMI.start) {
        mode = STATE.running
        radio.sendValue("start", 1)

    } else if (mode == STATE.running && whoAmI == WHOAMI.end) {
        mode = STATE.finish
        totalTime = control.millis() - startTime
        console.log(`Závod trval ${totalTime}`)
        radio.sendValue("time", totalTime)

    } else if (mode == STATE.finish) {
        console.log("")

    }
})

input.onButtonPressed(Button.A, function() {
    if (whoAmI == WHOAMI.start && mode == STATE.finish) {
        basic.pause(2000)
        mode = STATE.ready

    } else if (whoAmI != WHOAMI.end && mode == STATE.finish) {
        whoAmI = WHOAMI.start
        basic.showNumber(1)
        radio.sendString("startSet")
        basic.pause(2000)
        mode = STATE.ready

    } else if (whoAmI == WHOAMI.start && mode == STATE.ready) {
        mode = STATE.finish

    } else if (whoAmI == WHOAMI.start && mode == STATE.running) {
        mode = STATE.finish
        radio.sendString("stop")

    }
})


