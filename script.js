$(function() {
  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a border using blocks
  const loader = new THREE.TextureLoader();
  const borderGeometry = new THREE.BoxGeometry(1, 1, 1);
  const borderTexture = loader.load('images/border.png');
  const borderMaterial = new THREE.MeshBasicMaterial({map: borderTexture, transparent: true});
  for (let i = -10; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
          if (i === -10 || i === 10 || j === -10 || j === 10) {
              const borderBlock = new THREE.Mesh(borderGeometry, borderMaterial);
              borderBlock.position.set(i, j, 0);
              scene.add(borderBlock);
          }
      }
  }

  camera.position.z = 20;

  // Create a rectangle to represent the background
  const backgroundGeometry = new THREE.PlaneGeometry(7, 10);
  const backgroundTextureIndex = Math.floor(Math.random() * 4) + 1;
  const backgroundTexture = new THREE.TextureLoader().load(`images/background${backgroundTextureIndex}.jpg`);
  const backgroundMaterial = new THREE.MeshBasicMaterial({map: backgroundTexture});
  const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  background.position.set(0, 0, -4);
  background.scale.set(3.25, 2.5, 0);
  scene.add(background);

  // Create a rectangle to represent the player
  const playerTexture = loader.load('images/player.png');
  const playerGeometry = new THREE.PlaneGeometry(7, 10);
  const playerMaterial = new THREE.MeshBasicMaterial({map: playerTexture, transparent: true});
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, -7, -4);
  scene.add(player);

  // Create a rectangle to represent the monster
  const monsterGeometry = new THREE.PlaneGeometry(6, 9);
  // Load a random texture for the monster
  const monsterTextureIndex = Math.floor(Math.random() * 11) + 1;
  const monsterTexture = new THREE.TextureLoader().load(`images/monster${monsterTextureIndex}.png`);
  const monsterMaterial = new THREE.MeshBasicMaterial({map: monsterTexture, transparent: true});
  const monster = new THREE.Mesh(monsterGeometry, monsterMaterial);
  monster.position.set(0, 4, 0);
  scene.add(monster);

  const monsterMaxHitpoints = 50;
  let monsterHitpoints = monsterMaxHitpoints;
  const playerMaxHitpoints = 50;
  let playerHitpoints = playerMaxHitpoints;

  function updateMonster() {
    // Update the width and background color of the "monsterHitpointsBar" div element
    const monsterHitpointsBarElement = document.querySelector('#monsterHitpointsBar');
    const monsterHitpointsPercentage = (monsterHitpoints / monsterMaxHitpoints) * 100;
    monsterHitpointsBarElement.style.width = `${monsterHitpointsPercentage}%`;
    if (monsterHitpointsPercentage > 50) {
        monsterHitpointsBarElement.style.backgroundColor = 'green';
    } else if (monsterHitpointsPercentage > 25) {
        monsterHitpointsBarElement.style.backgroundColor = 'orange';
    } else {
        monsterHitpointsBarElement.style.backgroundColor = 'red';
    }

    if (monsterHitpoints > 0) {
      hitMonster(500);
    }
  }

  function updatePlayer(delay) {
    // Update the width and background color of the "playerHitpointsBar" div element
    const playerHitpointsBarElement = document.querySelector('#playerHitpointsBar');
    const playerHitpointsPercentage = (playerHitpoints / playerMaxHitpoints) * 100;
    playerHitpointsBarElement.style.width = `${playerHitpointsPercentage}%`;
    if (playerHitpointsPercentage > 50) {
        playerHitpointsBarElement.style.backgroundColor = 'green';
    } else if (playerHitpointsPercentage > 25) {
        playerHitpointsBarElement.style.backgroundColor = 'orange';
    } else {
        playerHitpointsBarElement.style.backgroundColor = 'red';
    }

    if (playerHitpoints > 0) {
      if (delay) {
        setTimeout(function() {
          hitPlayer(500);
        }, 1000);
      }
      else {
        hitPlayer(500);
      }
    }
  }

  // create a thick line
  const geometry = new THREE.PlaneGeometry(2, 0.2);
  const slashMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const slash = new THREE.Mesh(geometry, slashMaterial);
  slash.position.set(0, 0, 0);
  scene.add(slash);
  let isMonsterAttack = 0;

  let originalPosition = new THREE.Vector3().copy(camera.position);
  let targetPosition = new THREE.Vector3();
  let speed = 0.05;
  let moveBack = true;

  // Add an event listener to the "Attack" button
  const attackButton = document.querySelector('#attackButton');
  attackButton.addEventListener('click', () => {
    // Calculate a random amount of damage
    const damage = Math.floor(Math.random() * 10) + 1;

    // Deduct the damage from the monster's hitpoints
    monsterHitpoints -= damage;

    // Update the monster's hitpoints display
    updateMonster();

    // Calculate a random amount of damage for the monster's attack
    const monsterDamage = Math.floor(Math.random() * 10) + 1;

    // Deduct the damage from the player's hitpoints
    playerHitpoints -= monsterDamage;

    // Update the player's hitpoints display.
    updatePlayer(true);

    // Check if the player's hitpoints are 0 or less
    if (playerHitpoints <= 0) {
      endGame();
    }

    if (monsterHitpoints <= 0) {
      endMonster();
    }

    // Draw attack.
    slash.position.set(0, 4, 8);
    slash.rotation.z = Math.PI / 4;
    isMonsterAttack = 1;

    // Jiggle camera.
    const factor = 15;
    let x = Math.random() * factor - 5;
    let y = Math.random() * factor - 5;
    let z = Math.random() * factor - 5;
    targetPosition.set(x, y, z);
    moveBack = false;
    setTimeout(function() {
      moveBack = true;
    }, Math.floor(Math.random() * 150) + (monsterDamage * 10));
  });

  const runButton = document.querySelector('#runButton');
  runButton.addEventListener('click', () => {
    // Calculate a random amount of damage for the monster's attack
    const monsterDamage = Math.floor(Math.random() * 10) + 1;

    // Deduct the damage from the player's hitpoints
    playerHitpoints -= monsterDamage;

    // Update the player's hitpoints display.
    updatePlayer();

    // Check if the player's hitpoints are 0 or less
    if (playerHitpoints <= 0) {
      endGame();
    }
  });

  // Function to update the position of the attack button
  function updateAttackButtonPosition() {
      // Find the position of the bottom right border block
      let bottomRightBorderBlock;
      let maxX = -Infinity;
      let maxY = -Infinity;
      scene.traverse((object) => {
          if (object instanceof THREE.Mesh && object.material.map === borderTexture) {
              const vector = new THREE.Vector3();
              object.getWorldPosition(vector);
              vector.project(camera);
              const x = (vector.x + 1) / 2 * renderer.domElement.width;
              const y = -(vector.y - 1) / 2 * renderer.domElement.height;
              if (x > maxX && y > maxY) {
                  maxX = x;
                  maxY = y;
                  bottomRightBorderBlock = object;
              }
          }
      });
      // Set the position of the attack button
      if (bottomRightBorderBlock) {
          const vector = new THREE.Vector3();
          bottomRightBorderBlock.getWorldPosition(vector);
          vector.project(camera);
          const x = (vector.x + 1) / 2 * renderer.domElement.width;
          const y = -(vector.y - 1) / 2 * renderer.domElement.height;
          attackButton.style.left = `${x - attackButton.offsetWidth + 125}px`;
          attackButton.style.top = `${y - attackButton.offsetHeight + 50}px`;

          runButton.style.left = `${x - attackButton.offsetWidth + 210}px`;
          runButton.style.top = `${y - runButton.offsetHeight + 50}px`;

          playerHitpointsDiv = document.getElementById('playerHitpoints');
          playerHitpointsDiv.style.left = `${x - attackButton.offsetWidth + 125}px`;
          monsterHitpointsDiv = document.getElementById('monsterHitpoints');
          monsterHitpointsDiv.style.left = `${x - attackButton.offsetWidth + 125}px`;
          monsterHitpointsDiv.style.top += `${playerHitpointsDiv.style.top + 450}px`;
      }
  }

    // Create an audio element to play the sound effect
    const attackSound = new Audio('sounds/attack.mp3');
    const monsterLoseSound = new Audio('sounds/monsterlose.mp3');
    const playerLoseSound = new Audio('sounds/playerlose.mp3');
    const battleSound = new Howl({
      src: ['sounds/battle.mp3'], autoplay: true, loop: true, volume: 0.05
    });
    battleSound.play();

    function jiggleCamera(camera, targetPosition, speed) {
      camera.position.lerp(targetPosition, speed);
  }

  function hitPlayer(speed=500) {
    // Create a tween that fades the player color to red
    const tweenToRed = new TWEEN.Tween(player.material.color)
    .to({r: 1, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    const tweenToGrayscale = new TWEEN.Tween(player.material.color)
    .to({r: 1, g: 1, b: 1}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Chain the animations together
    tweenToRed.chain(tweenToGrayscale);

    // Start the first animation
    tweenToRed.start();

    slash.position.set(0, -2, -2);
    slash.rotation.z = Math.PI / 4;
    isMonsterAttack = 2;
    setTimeout(function() {
      isMonsterAttack = 0;
    }, 700);
  }

  function hitMonster(speed=500) {
    attackSound.play();

    // Create a tween that fades the player color to red
    const tweenToRed = new TWEEN.Tween(monster.material.color)
    .to({r: 1, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    const tweenToGrayscale = new TWEEN.Tween(monster.material.color)
    .to({r: 1, g: 1, b: 1}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Chain the animations together
    tweenToRed.chain(tweenToGrayscale);

    // Start the first animation
    tweenToRed.start();
  }

  let gameOver = false;

  function endGame(speed=1500) {
    playerLoseSound.play();
    battleSound.stop();

    document.querySelector('#playerHitpointsBar').style.display = 'none';
    attackButton.style.display = 'none';
    runButton.style.display = 'none';

    // Create a tween that fades the player color to red
    const tweenToRed = new TWEEN.Tween(player.material.color)
    .to({r: 1, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Create a tween that fades the red color to grayscale
    const tweenToGrayscale = new TWEEN.Tween(player.material.color)
    .to({r: 0, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Create a tween that fades out the player sprite
    const tweenFadeOut = new TWEEN.Tween(player.material)
    .to({opacity: 0}, 1000) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Chain the animations together
    tweenToRed.chain(tweenToGrayscale);
    tweenToGrayscale.chain(tweenFadeOut);

    // Start the first animation
    tweenToRed.start();
  }

  function endMonster(speed=1500) {
    monsterLoseSound.play();
    battleSound.stop();

    document.querySelector('#monsterHitpointsBar').style.display = 'none';
    attackButton.style.display = 'none';
    runButton.style.display = 'none';

    // Create a tween that fades the monster color to red
    const tweenToRed = new TWEEN.Tween(monster.material.color)
    .to({r: 1, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Create a tween that fades the red color to grayscale
    const tweenToGrayscale = new TWEEN.Tween(monster.material.color)
    .to({r: 0, g: 0, b: 0}, speed) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut);

    // Create a tween that fades out the monster sprite
    const tweenFadeOut = new TWEEN.Tween(monster.material)
    .to({opacity: 0}, 1000) // duration of animation in milliseconds
    .easing(TWEEN.Easing.Quadratic.InOut).onComplete(() => {
      // Generate new monster?
      attackButton.style.display = 'none';
      runButton.style.display = 'none';
    });

    // Chain the animations together
    tweenToRed.chain(tweenToGrayscale);
    tweenToGrayscale.chain(tweenFadeOut);

    // Start the first animation
    tweenToRed.start();

    setTimeout(function() {
      gameOver = true;
      moveBack = false;
    }, 3000);
  }

  function generateRandomPlayerName() {
    let firstNames = ["Nova", "Luna", "Aurora", "Stella", "Celeste"];
    let lastNames = ["Starlight", "Nebula", "Galaxy", "Comet", "Astro"];
    let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return firstName + " " + lastName;
  }
  document.getElementById('playerName').innerText = generateRandomPlayerName();

  function generateRandomMonsterName() {
    let firstNames = ["Zorg", "Gorg", "Krog", "Blorg", "Slog"];
    let lastNames = ["Destroyer", "Devourer", "Annihilator", "Ravager", "Conqueror"];
    let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return firstName + " " + lastName;
  }
  document.getElementById('monsterName').innerText = generateRandomMonsterName();

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);

    // Update the rotation of each border block
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material.map === borderTexture) {
            object.rotation.y += 0.01;
        }
    });

    // update the line's position, scale, or rotation here
    if (isMonsterAttack) {
      slash.visible = true;
      slash.rotation.z += 0.3;
      slash.position.z += isMonsterAttack === 2 ? 0.4 : -0.4;
    }
    else {
      slash.visible = false;
    }

    TWEEN.update();

    if (moveBack) {
      jiggleCamera(camera, originalPosition, speed);
    } else {
      jiggleCamera(camera, targetPosition, speed);
    }

    if (gameOver) {
      if (moveBack) {
        jiggleCamera(camera, originalPosition, speed);
        if (camera.position.distanceTo(originalPosition) < 0.01) {
            moveBack = false;
            let x = Math.random() * 2 - 1;
            let y = Math.random() * 2 - 1;
            let z = Math.random() * 2 - 1;
            targetPosition.set(x, y, z);
        }
      } else {
        jiggleCamera(camera, targetPosition, speed);
        if (camera.position.distanceTo(targetPosition) < 3) {
            moveBack = true;
        }
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // Update the position of the attack button initially
  updateAttackButtonPosition();
});