function loadStage(stageName) {
  console.log("Load stage:", stageName);
  const newStage = stages[stageName];
  const counter = {};

  var blocks = initBlocks(newStage.blocks);
  const backgrounds = initBlocks(newStage.backgrounds, {zIndex:-10});
  const roomAnchors = newStage.roomAnchors;
  const others = (newStage.animals || []).map(params => createAnimalFromOptions(params, {}, counter))
    .filter(a => a);
  const mapWidth = newStage.mapWidth;

  others.forEach(a => a.active = false);
  blocks = [blocks, others.filter(a => a.onStep !== undefined)].flat();

  return {blocks, backgrounds, roomAnchors, others, mapWidth, counter};
}

function setUpNewEnvironment(env, oldEnv) {
  env.player = oldEnv.player;
  env.stage = oldEnv.stage;
  env.screen = oldEnv.screen;
  env.animals = [env.player, env.others].flat();
  env.animals.forEach(a => env.stage.addChild(a));
  return env;
}

function initBlocks(records, options = {}) {
  var backgrounds = records.map(params => createBlock(...params, options));
  backgrounds.forEach(b => app.stage.addChild(b));
  return backgrounds;
}

function createBlock(imgUrlName, x, y, options) {
  const imgUrl = IMAGE_URLS[imgUrlName];
  let block = new PIXI.Sprite(PIXI.loader.resources[imgUrl].texture);
  block.position = {x, y};
  if(options) {
    block = Object.assign(block, options);
  }
  return block;
}

function getImgUrlsFromImgUrlNames(names) {
  return names.map(n => IMAGE_URLS[n]);
}

function createAnimalFromOptions(options, overridingOptions, counter) {
  if(options == null) {
    throw new Error('parameter options is required');
  }

  options = Object.assign({}, options, overridingOptions);

  if(options.name) {
    const c = counter[options.name] || 0;
    if(c >= (options.limit || 999)) {
      return;
    }
    counter[options.name] = (c || 0) + 1;
  }


  const spriteNames = options.sprites;
  const imgUrls = getImgUrlsFromImgUrlNames(spriteNames);
  var animal = new PIXI.Container();
  imgUrls.map(url =>  new PIXI.Sprite(
    PIXI.loader.resources[url].texture
  )).forEach(sprite => animal.addChild(sprite));

  const scale = options.scale;
  animal.scale.x = animal.scale.y = scale;
  if(options.x != undefined && options.y != undefined) {
    const {x, y} = options;
    animal.position = {x, y};
  }

  ['sprites', 'scale', 'x', 'y'].forEach(k => delete options[k]);
  animal = Object.assign(animal, options);

  initStateMapOnAnimal(animal);
  if(animal.weapon) {
    initStateMapOnAnimal(animal.weapon);
    animal.weapon.position = animal.position;
  }

  return animal;
}

function initStateMapOnAnimal(animal) {
  if(!animal.states) {
    return;
  }
  const stateMap = animal.states.reduce((s,r) => {
    if(r.spriteIndex != undefined) {
      r.sprite = animal.getChildAt(r.spriteIndex);
    }
    s[r.state] = r;
    return s;
  }, {});
  animal.stateMap = stateMap;
  setCurrentState(animal, animal.states[0]);
}

function setCurrentState(animal, state) {
  animal.currentState = state;
  if(animal.currentState.ticks == undefined) {
    throw new Error('.ticks must be defined on a state:', animal.currentState);
  }
  animal.currentState.remainingTicks = animal.currentState.ticks;

  if(animal.currentState.set) {
    animal = Object.assign(animal, animal.currentState.set);
    if(animal.dy != 0) {
      animal.standPlatform = null;
    }
  }
  if(animal.currentState.sprite) {
    animal.currentState.sprite.visible = true;
  }
}

function deleteAnimal(environment, animal) {
  removeFromArray(environment.others, animal);
  removeFromArray(environment.animals, animal);
  environment.stage.removeChild(animal);
}

function removeFromArray(array, element) {
  const index = array.indexOf(element);
  if(index < 0) {
    return;
  }
  array.splice(index, 1);
}

function onOutOfStage(x, y, environment) {
  console.log("out of the stage: ", x, y)
  const roomName = environment.roomAnchors ? environment.roomAnchors[`${x / Math.abs(x?x:1)},${y / Math.abs(y?y:1)}`]: undefined;
  if(!roomName) {
    return;
  }
  if(roomName === 'gameOver') {
    // TODO
    console.log('Game Over');
  } else {
    app.stage.removeChildren(0);
    environment = Object.assign(environment, setUpNewEnvironment(loadStage(roomName), environment));
    environment.player.x = 0
    environment.stage.x = 0;
    environment.stage.y = 0;
  }
}

function getScreenRect(environment) {
  const stage = environment.stage;
  const {width, height} = environment.screen.size
  return { x: -stage.position.x, y: -stage.position.y,
    width, height};
}

function getStageRect(environment) {
  return {x: 0, y:0, width: environment.mapWidth, height: environment.screen.size.height };
}
