systemState = {
  idleMode: true,
  activeLang: 'port',
  activeDeck: '',
  locked: false,
  timestamp: new Date().valueOf(),
  createdAt: new Date()
}

oPedro = {
  name: 'pedro',
  title: 'O Pedro',
  status: 'stop',
  timeOut: 10000,
  player: {
    enabled: true,
    device: 'laptop',
    address: '192.168.2.100',
    port: 7400,
    multiLang: {
      enabled: true,
      portugueseSingle: [
        { msg: '/lin', arg: 1 },
        { msg: '/som', arg: 1 },
        { msg: '/play', arg: 1 }
      ],
      englishSingle: [
        { msg: '/lin', arg: 0 },
        { msg: '/som', arg: 1 },
        { msg: '/play', arg: 1 }
      ],
      portugueseLoop: [
        { msg: '/lin', arg: 1 },
        { msg: '/som', arg: 1 },
        { msg: '/play', arg: 1 }
      ],
      englishLoop: [
        { msg: '/lin', arg: 0 },
        { msg: '/som', arg: 1 },
        { msg: '/play', arg: 1 }
      ]
    }
  },
  controller: {
    enabled: true,
    address: '192.168.2.62',
    port: 6262,
    message: '/light',
    arg: 1
  },
  updatedAt: new Date().valueOf()
}

linhaDoTempo = {
  name: 'timeline',
  title: 'Linha do Tempo',
  status: 'stop',
  player: {
    enabled: true,
    device: 'raspberry',
    address: '192.168.2.37',
    port: 3737,
    multiLang: {
      enabled: true,
      portugueseSingle: { msg: '/portugues/single', arg: 1 },
      englishSingle: { msg: '/ingles/single', arg: 1 },
      portugueseLoop: { msg: '/portugues/loop', arg: 1 },
      englishLoop: { msg: '/ingles/loop', arg: 1 }
    }
  },
  controller: {
    enabled: true,
    device: 'arduino',
    address: '192.168.2.61',
    port: 6161,
    timeOut: 80000,
    message: '/light',
    arg: 1
  },
  updatedAt: new Date().valueOf()
}

multipliqueSe = {
  name: 'multi',
  title: 'Multiplique-se',
  status: 'stop',
  player: {
    enabled: true,
    device: 'desktop',
    address: '192.168.2.5',
    port: 7000,
    multiLang: {
      enabled: true,
      portugueseSingle: { msg: '/composition/columns/1/connect', arg: 1 },
      englishSingle: { msg: '/composition/columns/2/connect', arg: 1 },
      portugueseLoop: { msg: '/composition/columns/1/connect', arg: 1 },
      englishLoop: { msg: '/composition/columns/2/connect', arg: 1 }
    }
  },
  controller: {
    enabled: false,
    device: '',
    address: '',
    port: 0,
    timeOut: 0,
    message: '',
    arg: 0
  },
  updatedAt: new Date().valueOf()
}