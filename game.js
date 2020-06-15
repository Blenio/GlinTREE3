window.onload = () => {
    class MainScene extends Phaser.Scene {
        preload() {
          this.load.image("blue", "png/blue_88.png");
          this.load.image("red", "png/red_88.png");
          this.load.image("yellow", "png/yellow_88.png");
          this.load.image("green", "png/green_88.png");
          this.load.image("purple", "png/purple_88.png");
        }

        create() {
          //Set HighScore localStorage, if empty
          if(localStorage.glin_highscore == null){
            localStorage.glin_highscore = 0;
          }

          //Set Texts
          var textConfig = {fontFamily:"Andika",color:'#000000',fontSize:'32px'};

          pointsText = this.add.text(game.config.width/2,game.config.height/2+500,"Points " + pointsRound,textConfig);
          pointsText.setOrigin(0.5,0.5);

          levelText = this.add.text(game.config.width/2-300,game.config.height/2+500,"Level " + level,textConfig);
          levelText.setOrigin(0.5,0.5);

          //get HighScore aus LocalStorage (https://javascript.info/localstorage)
          highScoreText = this.add.text(game.config.width/2+300,game.config.height/2+500,"Max " + localStorage.glin_highscore,textConfig);
          highScoreText.setOrigin(0.5,0.5);

          statusText = this.add.text(game.config.width/2,game.config.height/2+400,"Level-Points "+pointLimit*level,textConfig);
          statusText.setOrigin(0.5,0.5);
          statusText.setFontSize(40);
          statusText.setColor("#585858");

          gameOverText = this.add.text(game.config.width/2,game.config.height/2-400,"",textConfig);
          gameOverText.setFontSize(100);
          gameOverText.setColor("#A4A4A4");
          gameOverText.setOrigin(0.5,0.5);
          gameOverText.visible = false;

          //Create Squares
          //x/i 0 -> oben links
          //y/j 0 -> oben links
          for (var i = 0; i < 10; i++) {
            playGrid[i] = [];
            for (var j = 0; j < 10; j++) {
            
              //Random number from 0 to Color-Count
              var randomInt = Math.floor(Math.random() * Math.floor(colors.length));
              
              //Add Image
              //var square = this.add.sprite(50, 250, colors[randomInt]);
              var square = this.add.image(50, 250, colors[randomInt]);

              // position 
              square.width = 90;
              square.setOrigin(0, 0);
              square.x = (square.width * i) + 30;
              square.y = (square.width * j) + 30;
              //square.width = game.config.width / 12;
                    
              //make up a new property and assign it to the sprite
              square.color = colors[randomInt];
              square.xpos = i;
              square.ypos = j;
              square.state = 0; //0: init, 1: clicked
              square.distanceMoveDown = 0; //nr of squares to fall down
                    
              //enable the sprite for input and set up a click event
              square.setInteractive();
              
              //add square-obj to the playGrid
              playGrid[i][j] = square;
            }
          }
          
          this.input.on('gameobjectdown',this.onObjectClicked.bind(this));    
          
          //Grafiken -> Rechteck
          this.graphics=this.add.graphics();
          this.graphics.strokeRect(25,25,908,908);
          this.graphics.strokeRect(60,1060,260,80);
          this.graphics.strokeRect(360,1060,260,80);
          this.graphics.strokeRect(660,1060,260,80);
          this.graphics.lineStyle(2,0xc9c9c9);
          //this.graphics.strokeRect(360,960,260,80);
        }

        update() {
        }

        onObjectClicked(pointer,gameObject){
          //console.log("Clicked", gameObject.type);

          //marks all connected squres und count them in connectedSquares
          if(gameObject.type == "Image"){
            this.markNeighbours(gameObject, gameObject.color);

            //process connected squares
            if(connectedSquares > 0){
              this.setPoints(); //Spielzugpunkte vergeben
              this.gravitation(); //Do the graviation and stuff
              this.fillLeft(); //Aufrücken

              //Reset TODO eingene Funktion
              connectedSquares = 0;
              for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {      
                  playGrid[i][j].state = 0;   //ungeklicked
                }
              }
            }
          }

          //if(gameObject.type == "Text"){
              //console.log("CheckLevelEnd");
              this.checkNextLevel(); //Next Level?
          //}

        }

        markNeighbours(gameObject, color){
          if(gameObject!=null){
            var x = gameObject.xpos;
            var y = gameObject.ypos;

            //CheckLeft
            if(x > 0 && playGrid[x-1][y].visible && playGrid[x-1][y].color == color){
              playGrid[x-1][y].state = 1;
              playGrid[x-1][y].visible = false;
              connectedSquares += 1;
              this.markNeighbours(playGrid[x-1][y], color);
            }

            //CheckRight
            if(x < 9 && playGrid[x+1][y].visible && playGrid[x+1][y].color == color){
              playGrid[x+1][y].state = 1;
              playGrid[x+1][y].visible = false;
              connectedSquares += 1;
              this.markNeighbours(playGrid[x+1][y], color);
            }

            //CheckDown
            if(y > 0 && playGrid[x][y-1].visible && playGrid[x][y-1].color == color){
              playGrid[x][y-1].state = 1;
              playGrid[x][y-1].visible = false;
              connectedSquares += 1;
              this.markNeighbours(playGrid[x][y-1], color);
            }

            //CheckDown
            if(y < 9 && playGrid[x][y+1].visible && playGrid[x][y+1].color == color){
              playGrid[x][y+1].state = 1;
              playGrid[x][y+1].visible = false;
              connectedSquares += 1;
              this.markNeighbours(playGrid[x][y+1], color);
            }

          }
        }

        gravitation() {
          //Verkiale Animation
          for (var i = 0; i< 10; i++) {
            let tmpYPos = []; //save current Y-Pos

            for (var j = 9; j>= 0; j--) {
              //fill tmpYPos with all colored squares
              //yPos: 0 oben, 9 ganz unten
              if(playGrid[i][j].visible){
                tmpYPos.push(playGrid[i][j]);
              }
            }

            tmpYPos.forEach(function (item, index) {
              if(9-item.ypos != index){
                item.distanceMoveDown = (9-item.ypos) - index;
              }
            });

            for (var j = 9; j >= 0; j--) {
              var tmpDist = playGrid[i][j].distanceMoveDown

              if(tmpDist > 0){
                //Pos verändern in der Darstellung
                this.animateMoveDown(playGrid[i][j]);

                //Objekte vertauschen
                var temp = playGrid[i][j];
                playGrid[i][j] = playGrid[i][j+tmpDist];
                playGrid[i][j+tmpDist] = temp;
                
                //Upadte Attributes
                playGrid[i][j].ypos -= tmpDist;
                playGrid[i][j+tmpDist].ypos += tmpDist;
              }
            }
          }

        }

        fillLeft(){
          //Idee: TmpArray mit allen move-Pos
          //[0,1,3,5,6,7,8,9] -> [0,0,0,-1,0,-2,-2,-2,-2,-2]
          var bolCandidate = false;
          var intAnzLeft = 0;
          var arrDistLeft = [];

          for (var i = 0; i< 10; i++) {
            arrDistLeft[i] = intAnzLeft;
            
            //if there is a gap on the lowest line
            if(playGrid[i][9].visible == false){
              bolCandidate = true;
              intAnzLeft += 1;
            } else {
              //was there a gap before
              if(bolCandidate){
                arrDistLeft[i] = intAnzLeft;
                bolCandidate = false;
              }
            }
          }

          //Move it according to the array
          for (var i = 0; i< 10; i++) {
            var tmpDist = arrDistLeft[i];

            //If there is something to move at this Pos (i)
            if(tmpDist != 0){
              for(var n = 9; n >= 0; n--){
                //Animation
                this.animateMoveRowLeft(playGrid[i][n], tmpDist);        

                //Update Attributes
                playGrid[i][n].xpos -= tmpDist;
                playGrid[i-tmpDist][n].xpos += tmpDist;
              }

              //Switch Objects
              var temp2 = playGrid[i];
              playGrid[i] = playGrid[i-tmpDist];
              playGrid[i-tmpDist] = temp2;

            }
          }

        }

        //Animation to move a tile down
        animateMoveDown(gameObject) {
          var newY = gameObject.y + (gameObject.distanceMoveDown * gameObject.width);

          this.tweens.add({
              targets: gameObject,
              y: newY,
              duration: 100,
              ease: 'Power2',
              yoyo: false,
          });
          gameObject.distanceMoveDown = 0;
        }

        //Animation to move a row left
        animateMoveRowLeft(gameObject, intDist) {
          var newX = gameObject.x - (intDist * gameObject.width);

          this.tweens.add({
              targets: gameObject,
              x: newX,
              duration: 30,
              ease: 'Power2',
              yoyo: false,
          });
        }

        //Spielzugpunkte vergeben
        setPoints(){
          var pointsMove = connectedSquares * connectedSquares * 5;

          //Set connected Points
          pointsRound += (connectedSquares * connectedSquares * 5);

          //2x2 Block?
          for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
     
              if(playGrid[i][j].state == 1 && 
                playGrid[i][j].color == playGrid[i][j+1].color && playGrid[i][j+1].state == 1 &&
                playGrid[i][j].color == playGrid[i+1][j].color && playGrid[i+1][j].state == 1 &&
                playGrid[i][j].color == playGrid[i+1][j+1].color && playGrid[i+1][j+1].state == 1){
                  //console.log(i,j, "2x2");
                  pointsRound += 500;
                  pointsMove +=500;
              }

            }
          }

          //New HighScore?
          if(localStorage.glin_highscore < pointsRound){
            localStorage.glin_highscore = Math.round(pointsRound);
            highScoreText.setText("Max " + Math.round(pointsRound) + " *");
          }

          //Set Texts
          statusText.setText("+ " + pointsMove);
          statusText.setFontSize(40);
          statusText.setColor("#585858"); //grau
          this.tweens.add({ targets: statusText, alpha: { from: 1, to: 0 }, ease: 'Linear', duration: 1500, repeat: 0, yoyo: false });

          //Rot oder grüner Zwischenstand
          if(pointsRound >= Math.round(((pointLimit * level)))){
            pointsText.setColor("#088A08"); //grün
          } else {
            pointsText.setColor("#B40404"); //rot
          }
          pointsText.setText(pointsRound + " / " + Math.round(((pointLimit * level))));

        }

        //Check if all are cleared -> Next Level
        checkNextLevel(){

          //All cleared or no neighours left?
          var anzSquares = 0;
          var bolNoMoreNeighbours = true;
          
          for (var i = 0; i < 10; i++) {
            for (var j = 9; j > 0; j--) {
              if(playGrid[i][j].visible){
                anzSquares++;

                //are there any Neighbours
                if(i < 9){
                  if((playGrid[i][j].color == playGrid[i+1][j].color) && playGrid[i+1][j].visible){
                    bolNoMoreNeighbours = false;
                  }
                }

                if((playGrid[i][j].color == playGrid[i][j-1].color) && playGrid[i][j-1].visible){
                  bolNoMoreNeighbours = false;
                }

              }
            }
          }

          //Rundenende?
          if(bolNoMoreNeighbours){

            //+ BonusPunkte bei wenig Steinen am Schluss?
            if(bolNoMoreNeighbours && anzSquares < 10){
              pointsRound += Math.round(2000 - (20 * anzSquares));
            }
            
            //genug punkte für nächste Runde?
            if(pointsRound >= (pointLimit * level)){
              level++;
              this.scene.start();
            } else {
              gameOverText.setText("Game Over...");
              this.tweens.add({ targets: gameOverText, alpha: { from: 0, to: 0.8 }, ease: 'Linear', duration: 3000, repeat: 0, yoyo: false });
              gameOverText.visible = true;
            }

          }

        }

    }

    let playGrid = [];
    let colors = ['red', 'blue', 'yellow', 'green', 'purple'];
    let connectedSquares = 0;
    let pointsRound = 0;
    let pointsText = null;
    let gameOverText = null;

    let highScoreText = null;
    let levelText = null;
    let statusText = null;
    let level = 1;
    let pointLimit = 3500;

    const game = new Phaser.Game({
        type: Phaser.AUTO,
 		    width: 964,
        height: 1200,
        backgroundColor: '#eeeeee',
        scene: [MainScene]
    });
};