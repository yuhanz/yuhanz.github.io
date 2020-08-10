function mirrorSprite(sprite) {
  if(sprite.scale.x < 0) {
    return;
  }
  sprite.scale.x = -sprite.scale.x;
  sprite.x = sprite.width;
}

function resetMirrorSprite(sprite) {
  if(sprite.scale.x > 0) {
    return;
  }
  sprite.scale.x = Math.abs(sprite.scale.x);
  sprite.x = 0;
}


function getHeadRect(animal) {
  const dy = animal.dy;
  if(dy > 0) {
    return null;
  }
  headY = animal.position.y;   // get head
  return new PIXI.Rectangle(animal.position.x, headY + dy, animal.width, -dy);
}

function getFeetRect(animal) {
  const feetY = animal.position.y + animal.height;  // get feet
  return new PIXI.Rectangle(animal.position.x, feetY, animal.width, animal.dy);
}

function getHitBoxRect(animal) {
  const pos = (new PIXI.Point(animal.hitBox.x + animal.position.x , animal.hitBox.y + animal.position.y));
  return new PIXI.Rectangle(pos.x, pos.y, animal.hitBox.width, animal.hitBox.height);
}

function handleOnStep(animal) {
  if(!animal.onStep) {
    return;
  }
  if(animal.onStep.gravity) {
    animal.gravity = animal.onStep.gravity;
  }
}

function updateMoveOfFlyingAnimal(animal, environment) {
    animal.position.x += animal.dx || 0;
    animal.position.y += animal.dy || 0;
}

function updateMoveOfGroupAnimal(animal, environment) {
  const blocks = environment.blocks;
  if(animal.dx) {
    animal.position.x += animal.dx;
    const block = collideBlocks(blocks, animal);
    if(block && block != animal.standPlatform) {
      if(onTheLeftOf(animal, block)) {
        animal.position.x = block.x - animal.width;
      } else {
        animal.position.x = block.x + block.width;
      }
    }
  }

  if(animal.standPlatform == null) {
    let dy = animal.dy || 0;
    if(dy < 0) {
      headRect = getHeadRect(animal);
      updateRect(animal, app.stage, headRect, 'headRectGraphic');

      headHitBlock = collideBlocks(blocks.filter(b => b != animal), headRect);
      if(headHitBlock) {
        dy = animal.dy = 0;
      }
    }

    gravity = animal.gravity != undefined ? animal.gravity : 1;
    dyMax = animal.dyMax || 15;
    dy = animal.dy = Math.min(dy + gravity, dyMax);

    feetRect = getFeetRect(animal);
    animal.standPlatform = collideBlocks(blocks.filter(b => b != animal), feetRect)
    if(animal.standPlatform) {
      handleOnStep(animal.standPlatform);
      environment.events.push({type: 'onLanding',  by: animal, platform: animal.standPlatForm});
    }

    updateRect(animal, app.stage, feetRect, 'feetRectGraphic');

    if(!animal.standPlatform) {
      animal.position.y += dy;
    }
  } else {
    animal.dy = 0;
    if(animal.position.x > animal.standPlatform.position.x + animal.standPlatform.width
    || animal.position.x + animal.width < animal.standPlatform.position.x) {
        animal.standPlatform = null;     // in air
    }

    if(animal.standPlatform && animal.standPlatform.onStep) {
      // animal.position.x += animal.standPlatform.dx;
      animal.position.y = animal.standPlatform.y - animal.height;
    }
  }

  if(animal.standPlatform) {
    animal.position.y = animal.standPlatform.position.y - animal.height;
  }
}

function updateMove(animal, environment) {
  if(animal.active !== undefined && !animal.active) {
    return;
  }

  if(animal.gravity == 0) {
    updateMoveOfFlyingAnimal(animal);
    return;
  }

  updateMoveOfGroupAnimal(animal, environment);

  if(animal.hitBox) {
    const hitBox = getHitBoxRect(animal);
    hitBox.color = 0x0033FF;
    updateRect(animal, app.stage, hitBox, 'hitBoxGraphics');
  }
}

function updateRect(animal, stage, rect, rectName) {
  if(animal[rectName]) {
    app.stage.removeChild(animal[rectName]);
  }
  animal[rectName] = drawRect(stage, rect.x, rect.y, rect.width, rect.height, rect.color);
  updateText(animal);
}

function drawRect(stage, x, y, w, h, color=0xFF3300) {
  if(!drawDebugEnabled) {
    return;
  }
  const rectGraphic = new PIXI.Graphics();
  rectGraphic.lineStyle(4, color, 1);
  rectGraphic.drawRect(x,y,w,h);
  stage.addChild(rectGraphic)
  return rectGraphic;
}

function updateWeaponDirection(animal) {
  if(!animal.weapon || animal.dx == 0) {
    return;
  }
  const direction = animal.dx / Math.abs(animal.dx);
  const centerX = animal.width / 2;
  animal.weapon.states.filter(s => s.createAnimals)
    .map(s => s.createAnimals).flat()
    .filter(options => options.x)
    .forEach(options => {
      options.x = centerX + direction * Math.abs(options.x - centerX);
      options.dx = direction * Math.abs(options.dx);
    })
}

function updateSprites(animal) {
  if(animal.dx == 0) {
    return;
  }
  const directionFn = animal.dx < 0 ? resetMirrorSprite: mirrorSprite;
  animal.children.forEach(directionFn);
}

function updateText(animal) {
  if(!drawDebugEnabled) {
    return;
  }
  if(!animal.currentState) {
    return;
  }

  const text = `${animal.currentState.state}:${animal.currentState.remainingTicks}${animal.status? "\nHP:" + animal.status.hp : ""}`;

  if(animal.text) {
    animal.text.text = text;
    return;
  }

  animal.text = new PIXI.Text(text,
    {fontFamily : 'Arial', fontSize: 50, fill : 0xffffff, align : 'center'});
  animal.addChild(animal.text);
}
