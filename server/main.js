import { Meteor } from "meteor/meteor";
import "../imports/server/arduino";

var OscEmitter = require("osc-emitter");

// var basicAuth = new HttpBasicAuth("pedrinho", "searom");
// basicAuth.protect();

// Destino OSC de cada instalação e as mensagens enviadas em cada idioma.
// Manter em sincronia com imports/server/arduino.js.
const instalacoes = {
  pedro: {
    address: "192.168.2.100",
    port: 7400,
    mensagens: {
      Pt: [["/audio", 1], ["/lin", 1], ["/play", 1]],
      En: [["/audio", 1], ["/lin", 0], ["/play", 1]],
    },
  },
  linha: {
    address: "192.168.2.37",
    port: 3737,
    mensagens: {
      Pt: [["/reset", 1], ["/portugues", 1]],
      En: [["/reset", 1], ["/ingles", 1]],
    },
  },
  multi: {
    address: "192.168.2.5",
    port: 7000,
    mensagens: {
      Pt: [["/composition/columns/2/connect", 1]],
      En: [["/composition/columns/3/connect", 1]],
    },
  },
};

// Um emitter por instalação, para que cada mensagem chegue só ao seu destino
for (const instalacao of Object.values(instalacoes)) {
  instalacao.emitter = new OscEmitter();
  instalacao.emitter.add(instalacao.address, instalacao.port);
}

Meteor.methods({
  sendCmd(nome, idioma) {
    const instalacao = Object.hasOwn(instalacoes, nome) && instalacoes[nome];
    const mensagens =
      instalacao &&
      Object.hasOwn(instalacao.mensagens, idioma) &&
      instalacao.mensagens[idioma];

    if (!mensagens) {
      throw new Meteor.Error(
        "comando-invalido",
        `Instalação ou idioma desconhecido: ${nome} / ${idioma}`,
      );
    }

    console.log(`REMOTE ==> ${nome.toUpperCase()} ${idioma.toUpperCase()}`);

    for (const [endereco, valor] of mensagens) {
      instalacao.emitter.emit(endereco, valor);
    }
  },
});
