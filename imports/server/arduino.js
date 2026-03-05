const { SerialPort } = require("serialport")
const Firmata = require("firmata-io")(SerialPortCompat)



function SerialPortCompat(path, options, openCallback) {
	if (typeof options === "function") {
		openCallback = options
		options = {}
	}

	const serialOptions = Object.assign({ path }, options || {})

	if (typeof serialOptions.autoOpen === "undefined") {
		serialOptions.autoOpen = true
	}

	const port = new SerialPort(serialOptions)

	if (typeof openCallback === "function") {
		if (serialOptions.autoOpen === false) {
			port.open(openCallback)
		} else {
			port.once("open", () => openCallback(null))
		}
	}

	return port
}

const os = require('os');
if (os.platform() != 'darwin') {

	SerialPortCompat.list = () => SerialPort.list()
	SerialPortCompat.SerialPort = SerialPortCompat
	const boardLinha = new Firmata("/dev/ttyACM0")
	const boardPedro = new Firmata("/dev/ttyACM2")
	const boardMulti = new Firmata("/dev/ttyACM1")

	var OscEmitter = require('osc-emitter')
	var emitterArdPedro = new OscEmitter()
	var emitterArdLinha = new OscEmitter()
	var emitterArdMulti = new OscEmitter()

	var pin2Time = 0
	var pin2Lock = false

	var pin3Time = 0
	var pin3Lock = false

	var pin4Time = 0
	var pin4Lock = false

	boardLinha.on("ready", () => {
		console.log("Arduino Linha is Ready!")
		boardLinha.pinMode(2, boardLinha.MODES.PULLUP)
		// PIN 2 - LINHA
		boardLinha.digitalRead(2, function (value) {
			console.log("LINHA")
			emitterArdLinha.add('192.168.2.37', 3737);
			emitterArdLinha.emit('/reset', 1)
			emitterArdLinha.emit('/portugues', 1)
		})
	})

	boardPedro.on("ready", () => {
		console.log("Arduino Pedro is Ready!")
		boardPedro.pinMode(2, boardPedro.MODES.PULLUP)
		// PIN 2 - PEDRO
		boardPedro.digitalRead(2, function (value) {
			console.log("PEDRO")
			emitterArdPedro.add('192.168.2.100', 7400);
			emitterArdPedro.emit('/audio', 1)
			emitterArdPedro.emit('/lin', 1)
			emitterArdPedro.emit('/play', 1)
		})
	})

	boardMulti.on("ready", () => {
		console.log("Arduino Multi is Ready!")
		boardMulti.pinMode(2, boardMulti.MODES.PULLUP)
		// PIN 2 - MULTIPLIQUE-SE
		boardMulti.digitalRead(2, function (value) {
			console.log("MULTI")
			emitterArdMulti.add('192.168.2.5', 7000);
			emitterArdMulti.emit('/composition/columns/2/connect', 1)
		})
	})

}
