import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface GameComponentProps {
  userName?: string;
}

class RunnerGame extends Phaser.Scene {
  // Game objects
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  ground!: Phaser.GameObjects.Rectangle;
  obstacles!: Phaser.Physics.Arcade.Group;
  scoreText!: Phaser.GameObjects.Text;
  gameOverText!: Phaser.GameObjects.Text;
  
  // Game state
  score: number = 0;
  gameSpeed: number = 300;
  isGameOver: boolean = false;
  userName: string = "Player";
  obstacleTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'RunnerGame' });
  }

  init(data: any) {
    if (data && data.userName) {
      this.userName = data.userName;
    }
    this.score = 0;
    this.gameSpeed = 300;
    this.isGameOver = false;
  }

  create() {
    // Set up the game world
    const { width, height } = this.scale;
    const groundY = height - 50;

    // Create the ground
    this.ground = this.add.rectangle(width / 2, groundY, width, 20, 0x333333);
    this.physics.add.existing(this.ground, true);

    // Create player
    this.player = this.physics.add.sprite(150, groundY - 50, 'player');
    this.player.setDisplaySize(40, 60);
    this.player.setOrigin(0.5, 1);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(1500);

    // Create a green rectangle for the player
    const graphics = this.add.graphics();
    graphics.fillStyle(0x22c55e, 1); // Green
    graphics.fillRect(-20, -60, 40, 60);
    graphics.generateTexture('player', 40, 60);
    graphics.clear();

    this.player.setTexture('player');

    // Create obstacle group
    this.obstacles = this.physics.add.group();
    
    // Set up collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(
      this.player, 
      this.obstacles, 
      this.gameOver, 
      undefined, 
      this
    );

    // Score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '24px', 
      color: '#333' 
    });
    
    // Player name
    this.add.text(16, 50, `Runner: ${this.userName}`, { 
      fontSize: '18px', 
      color: '#555' 
    });

    // Set up controls
    this.input.keyboard.on('keydown-SPACE', this.jump, this);
    this.input.on('pointerdown', this.jump, this);

    // Start creating obstacles
    this.obstacleTimer = this.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
      callback: this.createObstacle,
      callbackScope: this,
      loop: true
    });

    // Score incrementing timer
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.score++;
          this.scoreText.setText('Score: ' + this.score);
          
          // Increase speed over time
          if (this.score % 100 === 0) {
            this.gameSpeed += 20;
          }
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  jump() {
    if (this.player.body.touching.down && !this.isGameOver) {
      this.player.setVelocityY(-600);
    }
  }

  createObstacle() {
    if (this.isGameOver) return;

    const { width, height } = this.scale;
    const groundY = height - 50;
    
    // Random height between 20 and 40
    const obstacleHeight = Phaser.Math.Between(20, 40);
    const obstacleWidth = 20;
    
    // Create obstacle rectangle
    const obstacle = this.obstacles.create(
      width + obstacleWidth, 
      groundY - obstacleHeight / 2, 
      'obstacle'
    );
    
    // Create obstacle texture
    const graphics = this.add.graphics();
    const color = Phaser.Math.Between(0, 1) === 0 ? 0xec4899 : 0x4f46e5; // Pink or blue
    graphics.fillStyle(color, 1);
    graphics.fillRect(-obstacleWidth/2, -obstacleHeight/2, obstacleWidth, obstacleHeight);
    graphics.generateTexture('obstacle', obstacleWidth, obstacleHeight);
    graphics.clear();
    
    // Set obstacle properties
    obstacle.setOrigin(0.5, 0.5);
    obstacle.setImmovable(true);
    obstacle.setVelocityX(-this.gameSpeed);
    obstacle.body.setAllowGravity(false);
    
    // Set next obstacle timer
    this.obstacleTimer.delay = Phaser.Math.Between(1500 - this.gameSpeed/3, 3000 - this.gameSpeed/2);
    
    // Auto destroy when out of screen
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
  }

  gameOver() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.physics.pause();
    this.obstacleTimer.remove();
    
    // Turn player red
    this.player.setTint(0xff0000);
    
    // Game over text
    const { width, height } = this.scale;
    this.gameOverText = this.add.text(width/2, height/2 - 60, 'GAME OVER', {
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#000'
    }).setOrigin(0.5);
    
    // Score text
    this.add.text(width/2, height/2, `Score: ${this.score}`, {
      fontSize: '32px',
      color: '#000'
    }).setOrigin(0.5);
    
    // Restart instructions
    this.add.text(width/2, height/2 + 60, 'Tap or press SPACE to restart', {
      fontSize: '20px',
      color: '#000'
    }).setOrigin(0.5);
    
    // Restart handlers
    this.input.keyboard.once('keydown-SPACE', this.restartGame, this);
    this.input.once('pointerdown', this.restartGame, this);
  }

  restartGame() {
    this.scene.restart({ userName: this.userName });
  }

  update() {
    // Check for obstacles that are off-screen
    this.obstacles.getChildren().forEach((child) => {
      const obstacle = child as Phaser.Physics.Arcade.Sprite;
      if (obstacle.x < -100) {
        obstacle.destroy();
      }
    });
  }
}

const GameComponent: React.FC<GameComponentProps> = ({ userName = "Player" }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !gameInstance.current) {
      // Configure and start the game
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 300,
        parent: gameRef.current,
        backgroundColor: '#f7f7f7',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 500 },
            debug: false
          }
        },
        scene: [RunnerGame],
      };

      // Create the game instance
      gameInstance.current = new Phaser.Game(config);
      
      // Start the scene with user data
      gameInstance.current.scene.start('RunnerGame', { userName });
    }

    return () => {
      // Clean up on component unmount
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [userName]);

  return (
    <div className="w-full h-full bg-gray-50">
      <div ref={gameRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 text-gray-600 text-xs opacity-70">
        Press SPACE to jump or tap/click on mobile
      </div>
    </div>
  );
};

export default GameComponent;