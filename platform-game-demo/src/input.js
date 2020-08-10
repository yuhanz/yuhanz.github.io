class UserInput {
  constructor(div) {
    div.onkeyup = this.onkeyup;
    div.onkeydown = this.onkeydown;
    div.userInput = this.userInput = {};
  }

  onkeydown(e) {
    const userInput = this.userInput;
    userInput.left = e.key == 'a' ? 'left' : null || userInput.left;
    userInput.right = e.key == 'd' ? 'right' : null || userInput.right;
    userInput.jump = e.key == ' ' ? 'jump' : null;
    userInput.fire = e.key == 'j' ? 'fire' : null || userInput.fire;
  }

  onkeyup(e) {
    const userInput = this.userInput;
    if(e.key == 'a') {
      userInput.left = null;
    }
    if(e.key == 'd') {
      userInput.right = null;
    }
    if(e.key == 'j') {
      userInput.fire = null;
    }
    userInput.jump = e.key == ' ' ? null : userInput.jump;
  }

  getStatesFromUserInput() {
    const userInput = this.userInput;
    if(userInput.jump) {
      return ['jump'];
    } else if(userInput.left || userInput.right) {
      return ['walk', 'walk2'];
    } else {
      return ['stand'];
    }
  }

  userControl(animal, environment) {
    const userInput = this.userInput;
    const input = userInput.left || userInput.right;
    const moveMagnitude = 3;
    const direction = {left: -1, right:1};
    animal.dx = (direction[input] || 0) * moveMagnitude

    if(userInput.jump && animal.standPlatform) {
      animal.dy = - animal.dyMax
      animal.standPlatform = null;     // in air
    }

    animal.weapon.onWeapon = userInput.fire;
  }
}
