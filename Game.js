// Variable pour afficher les HitsBox

BasicGame.Game = function(game) {
  /************************************************************************************************
   * Déclaration des variables globals
   *
   *
   ************************************************************************************************/
  this.global = {
    score: 0,
    debug: false, // Pour afficher les hitboxs
  }


  // When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
  this.game; //  a reference to the currently running game (Phaser.Game)
  this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
  this.camera; //  a reference to the game camera (Phaser.Camera)
  this.cache; //  the game cache (Phaser.Cache)
  this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
  this.load; //  for preloading assets (Phaser.Loader)
  this.math; //  lots of useful common math operations (Phaser.Math)
  this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
  this.stage; //  the game stage (Phaser.Stage)
  this.time; //  the clock (Phaser.Time)
  this.tweens; //  the tween manager (Phaser.TweenManager)
  this.state; //  the state manager (Phaser.StateManager)
  this.world; //  the game world (Phaser.World)
  this.particles; //  the particle manager (Phaser.Particles)
  this.physics; //  the physics manager (Phaser.Physics)
  this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)

  //  You can use any of these from any function within this State.
  //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};
BasicGame.Game.prototype = {
  /************************************************************************************************
   * Déclaration des Constantes
   *
   *
   ************************************************************************************************/
  SPEEDPLAYER: 300,
  SHOTDELAY: 300,
  SHOTSPEED: 700,

  preload: function() {
    /************************************************************************************************
     *GAME ASSETS (en attente de déplacer sur le boot.js)
     * Déclaration des Sprites et des sons à importer
     *
     ************************************************************************************************/
    // Graphics
    this.load.image('gLaser', 'Assets/gLaser.png');
    this.load.image('xWing', 'Assets/xWing.png');
    this.load.image('rLaser', 'Assets/rLaser.png');
    this.load.spritesheet('tie', 'Assets/tie-Sheet.png', 32, 32);
    this.load.spritesheet('explosion', 'Assets/explosion-Sheet.png', 32, 32);
    this.load.image('star', 'Assets/starLong.png');
    this.load.image('star2', 'Assets/starLong2.png'); // a suprimer si non utiliser
    //this.load.image('planete', 'Assets/planeteTest.png'); // a suprimer si non utiliser
    this.load.image('asteroid', 'Assets/Asteroid.png');
    this.load.image('asteroid2', 'Assets/Asteroid1.png');
    this.load.image('asteroid3', 'Assets/Asteroid2.png');
    // Audio


  },
  create: function() {



    /************************************************************************************************
     *Initialize
     *
     ************************************************************************************************/

    this.setupBackground(); //Initialize Background (A completter)
    this.setupScaleMode(); //Initialize Sclaling and no blur
    this.setupGUI(); //Initialize GUI        (A completter)
    this.setupEnemies(); //Initialize Enemies
    this.setupShot(); //Initialize Player Shot
    this.setupGUI(); //Initialize GUI        (A completter)
    this.setupEnemies(); //Initialize Enemies
    this.setupShot(); //Initialize Player Shot
    this.setupExplosions(); //Initialize Explosion effets
    this.setupText(); //Initialize Text Screen
    this.setupPlayer(); //Initialize Player
  },

  //Mise a jour 60 fois par secondes
  update: function() {
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    this.processDelayEffets(); //Désactiver car la police actuelle n'est pas compatible avec la resolution
    this.refreshBackground();
  },

  setupScaleMode: function() {

    //Mise en forme de la resolution responsive
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.setMinMax(480, 260, 1024, 768);
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true

  },

  fire: function() {
    //Gestion du delay
    if (!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }
    //pas de tir si le jouer n'es plus en vie
    if (this.playerShotPool.countDead() === 0) {
      return;
    }
    this.nextShotAt = this.time.now + this.shotDelay;
    // Find the first dead laser in the pool
    var laserPlayer = this.playerShotPool.getFirstExists(false);
    // Reset (revive) the sprite and place it in a new location
    laserPlayer.reset(this.player.x, this.player.y - 2);
    laserPlayer.body.velocity.y = -this.shotSpeed;
  },
  enemyHit: function(shot, enemy) {
    this.damageEnemy(enemy, 1);
    shot.kill();
  },
  playerHit: function(player, enemy) {
    this.damageEnemy(enemy, 5);
    player.kill();
  },
  damageEnemy: function(enemy, damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
    }
  },
  explode: function(sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('start', 10, false, true);
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;

  },
  render: function() {
    //Debug Collision
    if (this.global.debug) {
      this.game.debug.body(this.player);
    }
  },

  setupGUI: function() {},

  setupBackground: function() {
    this.star;
    this.texture1;
    this.texture2;
    this.texture3;
    this.stars = [];

    //  This is the sprite that will be drawn to the texture
    //  Note that we 'make' it, not 'add' it, as we don't want it on the display list
    this.star = this.game.make.sprite(0, 0, 'star');

    //  For this effect we'll create a vertical scrolling starfield with 300 stars split across 3 layers.
    //  This will use only 3 textures / sprites in total.
    this.texture1 = this.game.add.renderTexture(this.game.world.width, this.game.world.height, 'texture1');
    this.texture2 = this.game.add.renderTexture(this.game.world.width, this.game.world.height, 'texture2');
    this.texture3 = this.game.add.renderTexture(this.game.world.width, this.game.world.height, 'texture3');

    this.game.add.sprite(0, 0, this.texture1);
    this.game.add.sprite(0, 0, this.texture2);
    this.game.add.sprite(0, 0, this.texture3);

    this.t = this.texture1;
    this.s = 2;

    //  100 sprites per layer
    for (var i = 0; i < 30; i++) {
      if (i == 10) {
        //  With each 100 stars we ramp up the speed a little and swap to the next texture
        this.s = 3;
        this.t = this.texture2;
      } else if (i == 20) {
        this.s = 4;
        this.t = this.texture3;
      }

      this.stars.push({
        x: this.game.world.randomX,
        y: this.game.world.randomY,
        speed: this.s,
        texture: this.t
      });
    }
  },
  refreshBackground: function() {
    for (var i = 0; i < 30; i++) {
      //  Update the stars y position based on its speed
      this.stars[i].y += this.stars[i].speed;

      if (this.stars[i].y > this.game.world.width) {
        //  Off the bottom of the screen? Then wrap around to the top
        this.stars[i].x = this.game.world.randomX;
        this.stars[i].y = -32;
      }

      if (i == 0 || i == 10 || i == 20) {
        //  If it's the first star of the layer then we clear the texture
        this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, true);
      } else {
        //  Otherwise just draw the star sprite where we need it
        this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, false);
      }
    }
  },
  setupGUI: function() {},

  setupPlayer: function() {

    this.cursors = this.input.keyboard.createCursorKeys(); //Controle de base au clavier
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 60, 'xWing'); //add sprite
    this.player.speed = this.SPEEDPLAYER;
    this.player.anchor.setTo(0.5, 0.5); //centre le point d'origine
    this.physics.enable(this.player, Phaser.Physics.ARCADE); //physique arcade
    this.player.body.collideWorldBounds = true; //permet de limiter la zone de jeu
    this.player.body.setSize(24, 24, 4, 6); // reduction de la hitbox

  },
  setupEnemies: function() {
    //Enemy variables
    this.nextEnemyAt = 100;
    this.enemyDelay = 120;
    //Group ennemyPool
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;

    this.asteroidPool = this.add.group();
    this.asteroidPool.createMultiple(2, 'asteroid');
    this.asteroidPool.createMultiple(3, 'asteroid2');
    this.asteroidPool.createMultiple(2, 'asteroid3');

    this.tiePool = this.add.group();
    this.tiePool.createMultiple(5, 'tie');
    this.tiePool.forEach(function(child) {
      child.animations.add('idle', [0, 1, 2, 3], 20, true);
      child.animations.add('hit', [4, 4, 4, 4], 20, false); //quand c'est finie retour sur idle
      child.events.onAnimationComplete.add(function(e) {
        e.play('idle');
      }, this);
    });

    this.enemyPool.addMultiple(this.asteroidPool);
    this.enemyPool.addMultiple(this.tiePool);
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    // Set the animation for each sprite

  },
  setupShot: function() {
    //Shot variables
    this.nextShotAt = 0;
    this.shotDelay = this.SHOTDELAY;
    this.shotSpeed = this.SHOTSPEED;

    //Group playerShotPool
    // Add an empty sprite group into our game
    this.playerShotPool = this.add.group();
    // Enable physics to the whole sprite group
    this.playerShotPool.enableBody = true;
    this.playerShotPool.physicsBodyType = Phaser.Physics.ARCADE;
    // Add 100 'bullet' sprites in the group.
    // By default this uses the first frame of the sprite sheet and
    //sets the initial state as non - existing(i.e.killed / dead)
    this.playerShotPool.createMultiple(100, 'gLaser');
    // Sets anchors of all sprites
    this.playerShotPool.setAll('anchor.x', 0.5);
    this.playerShotPool.setAll('anchor.y', 0.5);
    // Automatically kill the bullet sprites when they go out of b
    this.playerShotPool.setAll('outOfBoundsKill', true);
    this.playerShotPool.setAll('checkWorldBounds', true);
  },
  setupExplosions: function() {
    //Group explosionPool
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function(explosion) {
    explosion.animations.add('start');

    });
  },
  setupText: function() { //FONCTION DESACTIVER CAR LA  FONT N'EST PAS COMPATIBLE AVEC LA RESOLTUION
    //Duré affichae des instructions
    this.instructionsDelay = 4; //Secondes
    this.instructions = this.add.text( this.game.world.width / 2, this.game.world.height-100,
      'Use Arrow Keys to Move Press SPACE to Fire', {
        font: '20px tiny',

        fill: '#fff'
      }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + this.instructionsDelay * 600;

  },
  checkCollisions: function() {
    //Gestions des collisions
    this.physics.arcade.overlap(
      this.playerShotPool, this.enemyPool, this.enemyHit, null, this
    );
    this.physics.arcade.overlap(
      this.player, this.enemyPool, this.playerHit, null, this
    );


  },
  spawnEnemies: function() {

    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);

      // spawn at a random location top of the screen
      enemy.reset(this.rnd.integerInRange(0,this.game.world.width  ), 0, this.enemyInitialHealth);
      // also randomize the speed
      enemy.body.velocity.y = this.rnd.integerInRange(80, 150);
      enemy.play('idle')
      enemy.health = 4;
    }
  },
  processPlayerInput: function() {
    //Initialise no movments
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    //Mouvement Left Right
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }
    //Mouvement Up Down
    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    //Call function Fire on press Space
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }
  },
  processDelayEffets: function() {
    //Clean text info
    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }
  },
  goFullScreen: function() {
    this.game.scale.startFullScreen(true);
  },
  quitGame: function(pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    //this.state.start('MainMenu');
  },
};
