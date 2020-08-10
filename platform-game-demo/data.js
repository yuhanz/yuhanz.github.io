const IMAGE_URLS = {
  personImgUrl: './img/pedestrian_1f6b6.png',
  runImgUrl: './img/runner_1f3c3.png',
  blockImgUrl: './img/small-gravel-stones.png',
  turtleImgUrl: './img/africa-1296386_640.png',
  fireImgUrl: './img/explosion-1293246_640.png',
  angelImgUrl: './img/smiling-face-with-halo.png',
  beeImgUrl: './img/bumblebee-151708_640.png',
  bombImgUrl: './img/bomb-2025548_640.png',
  hitImgUrl: './img/explosion-417894_640.png',
  daggerImgUrl: './img/fireball-149924_640.png',
  gearImgUrl: './img/shuriken-153172_640.png',
  genieImgUrl: './img/creature-575729_640.png',
  backgroundImgUrl: './img/IMG_7317.png',
  background2ImgUrl: './img/IMG_4309.jpg',
};

const screen = {
  size: {
    width: 850,
    height: 512
  },
  panStartX: 400
};

const animalTemplates = {
  "person": { sprites: ['personImgUrl', 'runImgUrl'], scale: 0.5,
    x: 0, y: 200,
    status: {hp: 10, type: "player"},
    hitBox: new PIXI.Rectangle(30, 0, 40, 80),
    dyMax: 20,
    weapon: {
      states:[
        {
          state: 'ready',
          ticks: 6000,
          onWeapon: { nextState: 'fire' }
        }, {
          state: 'fire',
          ticks: 1,
          nextState: 'reload',
          createAnimals: [{
            name: 'bullet',
            limit: 3,
            sprites: ['fireImgUrl'], scale: 0.04,
            x: 50, y: 10,
            dx: 10, dy: 0, gravity:0, attack: {ap: 1, targetTypes: ["non-player"], penetrate: false},
          }],
        }, {
          state: 'reload',
          ticks: 10,
          nextState: 'ready'
        }
      ]
    },
    onDeath: {
      createAnimals: [{sprites:['angelImgUrl'], scale: 0.3, gravity:0, dx:0, dy:-3}]
    },
    states: [
      {state:'stand',
        ticks:6000,
        nextState: null,
        spriteIndex:0},
      {state:'jump',
        ticks:6000,
        nextState: null,
        spriteIndex:1},
      {state:'walk',
        ticks:8,
        nextState:'walk2',
        spriteIndex:1},
      {state:'walk2',
        ticks:8,
        nextState:'walk',
        spriteIndex:0}]
  },
}

const stages = {
  "stage1": {
    mapWidth: 1619,
    blocks: [['blockImgUrl', 0, 300],
      ['blockImgUrl', 140, 400],
      ['blockImgUrl', 340, 400],
      ['blockImgUrl', 640, 400],
      ['blockImgUrl', 640, 100],
      ['blockImgUrl', 900, 400],
      ['blockImgUrl', 1200, 300],
      ['blockImgUrl', 1400, 200],
      ['blockImgUrl', 1500, 100],
    ],
    backgrounds: [['backgroundImgUrl', 0, 0]],
    roomAnchors: {
      "1,0": "stage2",
      "0,1": "gameOver",
    },
    animals: [
      { sprites: ['fireImgUrl', 'turtleImgUrl'], scale: 0.125, x: 400, y: 200,
        dx:-1, dy:0, status: {hp: 2, type: "non-player"},
        attack: {ap:10, targetTypes:['player'], penetrate:true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80)},
      { sprites: ['fireImgUrl', 'turtleImgUrl'], scale: 0.125, x: 600, y: 0,
        dx:-1, dy:0, status: {hp: 2, type: "non-player"},
        attack: {ap:10, targetTypes:['player'], penetrate:true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80)}
    ]
  },
  "stage2": {
    mapWidth: 1619,
    blocks: [['blockImgUrl', 0, 300],
      ['blockImgUrl', 140, 300],
      ['blockImgUrl', 340, 300],
      ['blockImgUrl', 540, 300],
      ['blockImgUrl', 740, 300],
      ['blockImgUrl', 1500, 200],
    ],
    roomAnchors: {
      "1,0": "stage3",
      "0,1": "gameOver",
    },
    backgrounds: [['background2ImgUrl', 0, 0]],
    animals: [
      { sprites: ['beeImgUrl'], scale: 0.125, x: 700, y: 0,
        name: 'bee', dx:-1, dy:0, gravity:0, status: {hp: 2, type: "non-player"},
        attack: {ap:10, targetTypes:['player'], penetrate:true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                  states: [{
                                    state: 'hasBomb',
                                    nextState: null,
                                    ticks: 1,
                                    onClose: {target: 'player', distanceOnX: 20, nextState: 'dropBomb'}
                                  }, {
                                    state: 'dropBomb',
                                    nextState: 'noBomb',
                                    ticks: 0,
                                    createAnimals: [{scale: 0.0625, y:85, sprites:['bombImgUrl'], dx:0, dy:1, gravity:0.2, status: {hp: 5, type: "non-player"},
                                                     attack: {ap:10, targetTypes:['player'], penetrate:true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                                     states: [{
                                                       state: 'bomb',
                                                       ticks: 1,
                                                       onHit: {target: 'player', nextState: 'explosion'},
                                                       onLanding: {target: 'blocks', nextState: 'explosion'}
                                                     }, {
                                                       state: 'explosion',
                                                       ticks: 1,
                                                       toDelete: 1,
                                                       createAnimals:[{scale: 0.125, sprites:['hitImgUrl'], dx:0, dy:0, gravity:0,
                                                                      attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                                                      states: [{
                                                                        state: 'active',
                                                                        ticks: 20,
                                                                        nextState: 'inactive'
                                                                      }, {
                                                                        state: 'inactive',
                                                                        ticks: 1,
                                                                        nextState: null,
                                                                        toDelete: 1
                                                                      }]}]
                                                     }]
                                                    }]
                                  }, {
                                    state: 'noBomb',
                                    nextState: null,
                                    ticks: 9999
                                  }]},
      { sprites: ['blockImgUrl'], scale: 1, x: 900, y: 300, dx:0, dy:0, gravity: 0, onStep: {gravity: 1}, immortal: true},
      { sprites: ['blockImgUrl'], scale: 1, x: 1100, y: 400, dx:0, dy:0, gravity: 0, onStep: null, immortal: true,
          states: [{
            state: 'up',
            nextState: 'down',
            set: {dy: -3},
            ticks: 66
          }, {
            state: 'down',
            nextState: 'up',
            set: {dy: 3},
            ticks: 66
          }]
        },
      { sprites: ['blockImgUrl'], scale: 1, x: 1300, y: 200, dx:0, dy:0, gravity: 0, onStep: null,
          states: [{
            state: 'up',
            nextState: 'down',
            set: {dy: -3},
            ticks: 33
          }, {
            state: 'down',
            nextState: 'up',
            set: {dy: 3},
            ticks: 33
          }]
        },
    ]
  },
  "stage3": {
    mapWidth: 400,
    blocks: [
      ['blockImgUrl', -160, 0],
      ['blockImgUrl', -160, 200],
      ['blockImgUrl', -160, 400],
      ['blockImgUrl', 0, 500],
      ['blockImgUrl', 140, 500],
      ['blockImgUrl', 280, 500],
      ['blockImgUrl', 420, 500],
      ['blockImgUrl', 560, 500],
      ['blockImgUrl', 700, 500],
      ['blockImgUrl', 900, 0],
      ['blockImgUrl', 900, 200],
      ['blockImgUrl', 900, 400],

    ],
    backgrounds: [['backgroundImgUrl', -400, -100]],
    animals: [
      { sprites: ['genieImgUrl'], scale: 0.15, x: 750, y: 200,
        dx:0, dy:0, status: {hp: 2, type: "non-player"},
                                      name: 'boss',
                                      attack: {ap:10, targetTypes:['player'], penetrate:true},
                                      hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                      states: [{
                                          state: 'stand',
                                          nextState: 'jump',
                                          ticks: 100
                                        },{
                                          state: 'jump',
                                          nextState: 'shoot',
                                          ticks: 30,
                                          set: {dy: -30},
                                        },{
                                          state: 'shoot',
                                          nextState: 'fall',
                                          ticks: 0,
                                          set: {dy:0, gravity: 0},
                                          createAnimals: [{
                                            name: 'dagger1',
                                            scale: 0.025, sprites:['daggerImgUrl'], gravity:0,
                                            attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                            states: [{
                                              state: 'trace',
                                              nextState: 'fly',
                                              trace: {targetTypes:['player'], speed: 5},
                                              ticks: 1
                                            }, {
                                              state: 'fly',
                                              ticks: 99999
                                            }
                                            ]
                                          }]
                                        },{
                                          state: 'fall',
                                          nextState: 'shoot2',
                                          ticks: 10,
                                          set: {gravity: 2},
                                        },{
                                          state: 'shoot2',
                                          nextState: 'fall2',
                                          ticks: 0,
                                          set: {dy:0, gravity: 0},
                                          createAnimals: [{
                                            name: 'dagger2',
                                            scale: 0.025, sprites:['daggerImgUrl'], gravity:0,
                                            attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                            states: [{
                                              state: 'trace',
                                              nextState: 'fly',
                                              trace: {targetTypes:['player'], speed: 5},
                                              ticks: 1
                                            }, {
                                              state: 'fly',
                                              ticks: 99999
                                            }
                                            ]
                                          }]
                                        },{
                                          state: 'fall2',
                                          nextState: 'shoot3',
                                          ticks: 10,
                                          set: {gravity: 2},
                                        },{
                                          state: 'shoot3',
                                          nextState: 'fall4',
                                          ticks: 0,
                                          set: {dy:0, gravity: 0},
                                          createAnimals: [{
                                            name: 'dagger3',
                                            scale: 0.025, sprites:['daggerImgUrl'], gravity:0,
                                            attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                            states: [{
                                              state: 'trace',
                                              nextState: 'fly',
                                              trace: {targetTypes:['player'], speed: 5},
                                              ticks: 1
                                            }, {
                                              state: 'fly',
                                              ticks: 99999
                                            }
                                            ]
                                          }]
                                        }, {
                                          state: 'fall4',
                                          nextState: 'shoot4',
                                          ticks: 10,
                                          set: {gravity: 2},
                                        },{
                                          state: 'shoot4',
                                          nextState: 'fall5',
                                          ticks: 0,
                                          set: {dy:0, gravity: 0},
                                          createAnimals: [{
                                            name: 'dagger4',
                                            scale: 0.025, sprites:['daggerImgUrl'], gravity:0,
                                            attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                            states: [{
                                              state: 'trace',
                                              nextState: 'fly',
                                              trace: {targetTypes:['player'], speed: 5},
                                              ticks: 1
                                            }, {
                                              state: 'fly',
                                              ticks: 99999
                                            }
                                            ]
                                          }]
                                        },{
                                          state: 'fall5',
                                          nextState: 'decide',
                                          ticks: 10,
                                          set: {gravity: 2},
                                        },{
                                          state: 'decide',
                                          ticks: 20,
                                          weightedNextStates: {
                                            'jump': 1,
                                            'leap': 4,
                                            'stepUp': 5,
                                          },
                                          onClose: {target: 'player', distanceOnX: 20,
                                            weightedNextStates: {
                                              'spike': 10
                                            }}
                                        },{
                                          state: 'spike',
                                          nextState: 'spikeWithdraw',
                                          ticks: 10,
                                          createAnimals: [{
                                            scale: 0.125, sprites:['gearImgUrl'], gravity:0, dx: 3,
                                            attack: {ap: 10, targetTypes:['player'], penetrate: true}, hitBox: new PIXI.Rectangle(0, 0, 80, 80),
                                          }]
                                        },{
                                          state: 'spikeWithdraw',
                                          nextState: 'decide',
                                          ticks: 10,
                                        },{
                                          state: 'leap',
                                          nextState: 'decide',
                                          ticks: 5,
                                          set: {dx: -8},
                                          trace: {targetTypes:['player'], speed: 8}
                                        },{
                                          state: 'stepUp',
                                          nextState: 'decide',
                                          ticks: 5,
                                          set: {dx: -8, dy: 2}
                                        }
                                    ]}
    ]
  }
}
