import { Meteor } from 'meteor/meteor'

import { HTTP } from 'meteor/http'
import '../imports/both/collections/collections'

const Firmata = require("firmata")
const board = new Firmata("/dev/ttyACM0")


var OscEmitter = require('osc-emitter')
var emitterControl = new OscEmitter()
var emitterPlayer = new OscEmitter()
var emitterArd = new OscEmitter()


var devMode = { enabled: false, address: '192.168.2.166' }

var pin2Time = 0
var pin2Lock = false

var pin3Time = 0
var pin3Lock = false

var pin4Time = 0
var pin4Lock = false

if (!devMode.enabled) {
  
  var basicAuth = new HttpBasicAuth("pedrinho", "searom");
  basicAuth.protect();
}


board.on("ready", () => {
  console.log("Arduino is Ready!")

  //* PIN 2
  board.pinMode(2, board.MODES.PULLUP)
  board.digitalRead(2, function (value) {
    if (!pin2Lock) {
      console.log("The value of digital pin 2 changed to: " + value)
      if (value == 0) {
        pin2Time = new Date().valueOf()
      }
      else {
        let time = (new Date().valueOf() - pin2Time)
        emitterArd.add('192.168.2.37', 3737)
        if (time > 200 && time < 3000) {
          // console.log('/portugues')
          emitterArd.emit('/portugues', 1)
        }
        if (time > 3001) {
          // console.log('/ingles')
          emitterArd.emit('/ingles', 1)
        }
        console.log(time)
        pin2Time = 0
        pin2Lock = true
        console.log('pin2 locked')
        Meteor.setTimeout(() => {
          pin2Lock = false
          console.log('pin2 UNlocked')
        }, 500)
      }
    }

  })

  //* PIN 3
  board.pinMode(3, board.MODES.PULLUP)
  board.digitalRead(3, function (value) {
    if (!pin3Lock) {
      console.log("The value of digital pin 3 changed to: " + value)
      if (value == 0) {
        pin3Time = new Date().valueOf()
      }
      else {
        let time3 = (new Date().valueOf() - pin3Time)
        if (time3 > 200 && time3 < 3000) {
          // console.log('/portugues')
          // emitter.emit('/portugues', 1)
        }
        if (time3 > 3001) {
          // console.log('/ingles')
          // emitter.emit('/ingles', 1)
        }
        console.log(time3)
        pin3Time = 0
        pin3Lock = true
        console.log('pin3 locked')
        Meteor.setTimeout(() => {
          pin3Lock = false
          console.log('pin3 UNlocked')
        }, 500)
      }
    }

  })

  //* PIN 4
  board.pinMode(4, board.MODES.PULLUP)
  board.digitalRead(4, function (value) {
    if (!pin4Lock) {
      console.log("The value of digital pin 4 changed to: " + value)
      if (value == 0) {
        pin4Time = new Date().valueOf()
      }
      else {
        let time4 = (new Date().valueOf() - pin4Time)
        if (time4 > 200 && time4 < 3000) {
          // console.log('/portugues')
          // emitter.emit('/portugues', 1)
        }
        if (time4 > 3001) {
          // console.log('/ingles')
          // emitter.emit('/ingles', 1)
        }
        console.log(time4)
        pin4Time = 0
        pin4Lock = true
        console.log('pin4 locked')
        Meteor.setTimeout(() => {
          pin4Lock = false
          console.log('pin4 UNlocked')
        }, 500)
      }
    }

  })
})


Meteor.startup(() => {
  
  if (Configs.find().count() === 0) {
    console.log('Config está vazio!')
    
    import '../imports/both/collections/defaultconfig'
    
    Configs.insert(oPedro)
    
    Configs.insert(linhaDoTempo)
    
    Configs.insert(multipliqueSe)
  }
  else { console.log('Config localizada!') }
  
  if (State.find().count() === 0) {
    console.log('Sem estado definidoo!')
    let systemState = JSON.parse(Assets.getText('defaultconfig.json'));
    
    State.insert(systemState)
  }
  else { console.log('Estado localizado!') }
});

Meteor.methods({
  'getState'() {
    
    return State.findOne()
  },
  'setState'(_lang) {
    
    let stateId = State.findOne()._id
    
    State.update(stateId, { $set: { activeLang: _lang } })
  },
  'play'(_name, _lang) {
    
    deck = Configs.findOne({ name: _name })
    
    Logs.insert({
      
      deck: deck,
      action: 'play',
      language: _lang,
      date: new Date(),
      timestamp: new Date().valueOf()
    })
    
    console.log(`PLAY: ${deck.title}`);

    
    var conttrolerSendAddr = devMode.enabled ? devMode.address : deck.controller.address;
    
    var playerSendAddr = devMode.enabled ? devMode.address : deck.player.address;

    
    if (deck.controller.enabled) {
      
      emitterControl.add(conttrolerSendAddr, deck.controller.port)
      
      emitterControl.emit(deck.controller.message, 1)
    }
    if (_lang == 'port') {
      
      if (deck.player.multiLang.portugueseSingle[2]) {
        
        emitterPlayer.add(playerSendAddr, parseInt(deck.player.port))
        for (let index = 0; index < 3; index++) {
          // console.log(deck.player.multiLang.portugueseSingle[index].arg);

          emitterPlayer.emit(
            
            deck.player.multiLang.portugueseSingle[index].msg,
            
            parseInt(deck.player.multiLang.portugueseSingle[index].arg)
          )
        }
      }
      else {
        
        emitterPlayer.add(playerSendAddr, parseInt(deck.player.port))
        emitterPlayer.emit(
          
          deck.player.multiLang.portugueseSingle.msg,
          
          parseInt(deck.player.multiLang.portugueseSingle.arg)
        )
      }
    }
    else if (_lang == 'eng') {
      
      if (deck.player.multiLang.englishSingle[2]) {
        
        emitterPlayer.add(playerSendAddr, parseInt(deck.player.port))
        for (let index = 0; index < 3; index++) {
          // console.log(deck.player.multiLang.portugueseSingle[index].arg);

          emitterPlayer.emit(
            
            deck.player.multiLang.englishSingle[index].msg,
            
            parseInt(deck.player.multiLang.englishSingle[index].arg)
          );
        }
      }
      else {
        
        emitterPlayer.add(playerSendAddr, parseInt(deck.player.port))
        emitterPlayer.emit(
          
          deck.player.multiLang.englishSingle.msg,
          
          parseInt(deck.player.multiLang.englishSingle.arg)
        )
      }
    }
  },
  'loop'(_name, _lang) {
    // emitter.add(ip, 1234)
    // emitter.emit('/play', 1, ip)
    // console.log(ip);
    
    deck = Configs.findOne({ name: _name })
    
    Logs.insert({
      
      deck: deck,
      action: 'play',
      language: _lang,
      date: new Date(),
      timestamp: new Date().valueOf()
    })
    
    console.log(`LOOP: ${deck.title}`);
  },
  'stop'(_name, _lang) {
    // emitter.add(ip, 1234)
    // emitter.emit('/play', 1, ip)
    // console.log(ip);
    
    deck = Configs.findOne({ name: _name })
    
    Logs.insert({
      
      deck: deck,
      action: 'play',
      language: _lang,
      date: new Date(),
      timestamp: new Date().valueOf()
    })
    
    console.log(`STOP: ${deck.title}`);
  },
  'tools.toggleLock'() {
    
    let state = State.findOne()
    
    State.update(state._id, {
      $set: {
        locked: !state.locked
      }
    })
  }
})
