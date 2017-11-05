
// Variable pour afficher les HitsBox
var debugCol = false;

BasicGame.Game = function(game) {


  //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
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
  preload: function() {
    this.load.image('gLaser', 'Assets/gLaser.png');
    this.load.image('xWing', 'Assets/xWing.png');
    this.load.image('rLaser', 'Assets/rLaser.png');
    this.load.spritesheet('tie', 'Assets/tie-Sheet.png', 8, 8);
    this.load.spritesheet('explosion', 'Assets/explosion-Sheet.png', 8, 8);
  },

  create: function() {
    //Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

    //Add Sprites
    this.ennemyLaser = this.add.sprite(512, 400, 'gLaser');
    this.playerLaser = this.add.sprite(512, 680, 'rLaser');
    this.player = this.add.sprite(512, 700, 'xWing');
    this.tie = this.add.sprite(512, 380, 'tie');

    //animates
    this.tie.animations.add('idle', [0, 1, 2, 3], 10, true);


    //Scale sprites
    this.tie.scale.set(4);
    this.ennemyLaser.scale.set(4);
    this.player.scale.set(4);
    this.playerLaser.scale.set(4);

    //No blur
    this.tie.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.ennemyLaser.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.playerLaser.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.player.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    //set sprites anchor
    this.tie.anchor.setTo(0.5, 0.5);
    this.ennemyLaser.anchor.setTo(0.5, 0.5);
    this.playerLaser.anchor.setTo(0.5, 0.5);
    this.player.anchor.setTo(0.5, 0.5);

    //sprites physics
    this.physics.enable(this.ennemyLaser, Phaser.Physics.ARCADE);
    this.physics.enable(this.playerLaser, Phaser.Physics.ARCADE);
    this.physics.enable(this.tie, Phaser.Physics.ARCADE);
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.ennemyLaser.body.velocity.y = 600;
    this.playerLaser.body.velocity.y = -600;

    //Controle de base au clavier 
    this.cursors = this.input.keyboard.createCursorKeys();

    //Player variables
    this.player.speed = 400;
    this.player.body.collideWorldBounds = true;
    
    //Start animates
    this.tie.play('idle');
    this.explosion.play('start');
  },

  update: function() {
    //Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

    //Gestions des collions
    this.physics.arcade.overlap(this.ennemyLaser,this.player,this.laserHit,null,this);
    this.physics.arcade.overlap(this.playerLaser,this.tie,this.laserHit,null,this);
    
    //Controle du joueur 
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
   
    if (this.cursors.left.isDown){
        this.player.body.velocity.x = -this.player.speed;  
    } else if (this.cursors.right.isDown){
        this.player.body.velocity.x = this.player.speed;
    }

      if (this.cursors.up.isDown){
        this.player.body.velocity.y = -this.player.speed;
      }else if (this.cursors.down.isDown){
        this.player.body.velocity.y = this.player.speed;
      } 
  },

  laserHit:function(laser,target){
    laser.kill();
    target.kill();
    var explosion = this.add.sprite(target.x,target.y,'explosion');
    explosion.anchor.setTo(0.5,0.5);
    explosion.animations.add('start');
    explosion.play('start',15,false,true);
    explosion.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    explosion.scale.set(4);    
  },
  render: function() {
    //Debug Collision
    if (debugCol) {
      this.game.debug.body(this.ennemyLaser);
      this.game.debug.body(this.playerLaser);
      this.game.debug.body(this.tie);
      this.game.debug.body(this.player);
    }
  },

  quitGame: function(pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
