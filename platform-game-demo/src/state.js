function pickRandomValueByWeight(weightedStates) {
  const keys = Object.keys(weightedStates);
  const weights = Object.values(weightedStates);
  const totalWeight = weights.reduce((s,w) => s+w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  let randomValue = Math.random();
  for(var i=0;i<normalizedWeights.length;i++) {
    randomValue -= normalizedWeights[i];
    if(randomValue <= 0) {
      return keys[i];
    }
  }
  return keys[normalizedWeights.length-1];

}

function transitState(animal, state) {
  let nextState = null;
  if(state.weightedNextStates) {
    const stateName = pickRandomValueByWeight(animal.currentState.weightedNextStates);
    return animal.stateMap[stateName];

  }
  return animal.stateMap[state.nextState] || animal.currentState;
}

function handleCreateAnimals(animal, createAnimals, environment) {
  const x = animal.position.x;
  const y = animal.position.y;
  const newAnimals = createAnimals.map(r =>
    createAnimalFromOptions(r, {x: x + (r.x || 0), y: y + (r.y || 0)}, environment.counter)
  ).filter(a => a);
  newAnimals.forEach(a => {
    environment.animals.push(a);
    environment.others.push(a);
    environment.stage.addChild(a);
  });
}

function updateStateByTick(animal, tickDelta, environment) {
  if(animal.death) {
    removeFromArray(environment.animals, animal);
    removeFromArray(environment.others, animal);
    environment.stage.removeChild(animal);

    if(animal == environment.player) {
      environment.player = null;
    }

    if(animal.name) {
      const c = environment.counter[animal.name] || 1;
      environment.counter[animal.name] = c - 1;
    }

    if(animal.onDeath) {
      handleCreateAnimals(animal, animal.onDeath.createAnimals, environment);
    }
  }
  // if(!animal.active) {
  //   return;
  // }

  if(!animal.currentState) {
    return;
  }

  animal.currentState.remainingTicks -= tickDelta;
  if(animal.currentState.remainingTicks < 0) {
    if(animal.currentState.sprite) {
      animal.currentState.sprite.visible = false;
    }
    const nextState = transitState(animal, animal.currentState);
    setCurrentState(animal, nextState);
  }

  if(animal.currentState.onClose) {
    var targetAnimal;
    if(animal.currentState.onClose.target === 'player') {
      targetAnimal = environment.player;
    } else {
      throw new Error('Not implemented to onClose with target=' + animal.currentState.onClose.target);
    }

    if(targetAnimal) {
      if(Math.abs(targetAnimal.position.x - animal.position.x) <= (animal.currentState.onClose.distanceOnX || 10) ) {
        const nextState = transitState(animal, animal.currentState.onClose);
        setCurrentState(animal, nextState);
      }
    }
  }

  if(animal.weapon && animal.weapon.onWeapon) {
    const weapon = animal.weapon;
    if(weapon.currentState.onWeapon) {
      setCurrentState(weapon, weapon.stateMap[weapon.currentState.onWeapon.nextState]);
    }
  }

  if(animal.currentState.onHit) {
    const event = environment.events.filter(e => e.type === 'onHit').find(e => e.by === animal);
    if(event) {
      setCurrentState(animal, animal.stateMap[animal.currentState.onHit.nextState]);
    }
  }

  if(animal.currentState.onLanding) {
    const event = environment.events.filter(e => e.type === 'onLanding').find(e => e.by === animal);
    if(event) {
      setCurrentState(animal, animal.stateMap[animal.currentState.onLanding.nextState]);
    }
  }

  if(animal.currentState.toDelete) {
    deleteAnimal(environment, animal);
  }

  if(animal.currentState.createAnimals) {
    handleCreateAnimals(animal, animal.currentState.createAnimals, environment);
  }

  if(animal.currentState.state == 'leap') {
    console.log('leap');
  }

  if(animal.currentState.trace) {
    const {targetTypes, speed} = animal.currentState.trace;
    const target = environment.animals.filter(a => a.status && targetTypes.indexOf(a.status.type) >= 0)[0];
    if(target) {
      const dx = target.x - animal.x;
      const dy = target.y - animal.y;
      if(animal.gravity == 0) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        animal.dx = speed * dx / magnitude;
        animal.dy = speed * dy / magnitude;
      } else {
        animal.dx = dx == 0 ? 0 : speed * dx / Math.abs(dx);
      }
    }
  }
}


function setState(desiredStates, animal) {
  if(desiredStates.includes(animal.currentState.state)) {
    return;
  }
  const desiredState = desiredStates[0];
  animal.currentState.sprite.visible = false;
  setCurrentState(animal, animal.stateMap[desiredState]);
}
