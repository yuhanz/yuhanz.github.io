function getHitBoxEvents(animals) {
  const hittables = animals.filter(a => a.hitBox);
  const hitBoxes = hittables.map(a => {
    const pos = {x: a.position.x + a.hitBox.x, y: a.position.y + a.hitBox.y} ;
    return new PIXI.Rectangle(pos.x, pos.y, a.hitBox.width, a.hitBox.height);
  });

  const fireBalls = animals.filter(animal => animal.attack);

  const events = fireBalls
    .map(fireBall => {
      const boxes = collideAllBlocks(hitBoxes, fireBall);
      return {hits: boxes.map(box => hittables[hitBoxes.indexOf(box)]).filter(a => a != fireBall), by: fireBall, type: 'onHit'};
    }).filter(e => e.hits.length > 0);

  return events;
}

function getHurtEvents(hitBoxEvents, environment) {
  return hitBoxEvents.map(event => {
    const fireball = event.by;

    var hits = event.hits.filter(animal => animal.status && animal.status.type
      && fireball.attack.targetTypes.indexOf(animal.status.type) >= 0);
    if(hits.length == 0) {
      return [];
    }

    environment.events.push(event);

    if(!fireball.attack.penetrate) {
      hits = [hits.shift()]
      fireball.death = true;
    }

    return hits.map(animal => {
      animal.status.hp -= fireball.attack.ap;
      console.log('hp:', animal.status.hp)

      if(animal.status.hp <= 0) {
        const index = environment.animals.indexOf(animal);
        if(index >= 0) {
          animal.death = { by: fireball };
          return {type: "death", subject: animal, by: fireball};
        }
      }
    })
  }).flat().filter(x => x);
}
