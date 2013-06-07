$(document).ready(function () {

    // Game CONSTS
    var CANVAS_WIDTH = 700;
    var CANVAS_HEIGHT = 400;
    var BALL_SPEED = 5;
    var BALL_INCREASE_SPEED = 0.4;
    var GAME_SCORE = 0;
    var LIVES = 3;
    var GAME_STATE_ENUM = ["GAME START", "PLAY", "PAUSE", "GAME OVER"];
    var GAME_STATE = GAME_STATE_ENUM[0].toString();
    var canvas = document.getElementById('GameCanvas'),
        context = canvas.getContext('2d');
    var ctx = context;

    // Ball Speeds
    var vy = 5;
    var vx = 5;

    // Game loop clock 60fps
    window.setInterval(function () {
        Game.Draw();
        Game.Update();
    }, 1000 / 60);

    var Game = (function () {
        var s; // bind alias to public settings
        return {
            settings: {
                numPlayers: 1,

            },

            init: function () {
                s = this.settings;
                this.bindUIActions();
            },

            bindUIActions: function () {

            },

            // Draw method calls here
            Draw: function () {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                // Constant Live Drawing
                DrawScore();
                DrawLives();

                // I do not use case statement here because I like the readability of the if's in a block style
                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    DrawStartScreen();
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    paddle.Draw();
                    gameBall.Draw();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {
                    paddle.Draw();
                    gameBall.Draw();
                    DrawPauseScreen();
                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {
                    EndGame();
                }
            },

            // Game logic functions here
            Update: function () {
                CheckGameIO();

                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {

                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    gameBall.Update();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {

                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {

                }
            }
        };
    })();

    // Basic Object to represent on the screen
    var GameObject = function () {
        // Privat Vars and Funcs
        var privateVar = "private";

        var s; // bind alias to public settings
        return {
            settings: {
                color: "rgba(0, 0, 200, 0.5)",
                width: 50,
                height: 50,
                posX: 0,
                posY: 0
            },

            init: function () {
                s = this.settings;
                //this.bindUIActions();
            },

            // Draws object on the canvas
            Draw: function (posX, posY) {
                ctx.fillStyle = this.settings.color;
                ctx.fillRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            }
        };
    };

    // Ball Object inherits Object
    var Ball = function () {
        // Apply inherited parent class values
        // Binding Object
        var _ball = GameObject.apply(this, arguments)
        
        // PRIVATE
        function CheckBallBoundriesCollision() {
            //Canvas Boundry Logic
            if (_ball.settings.posX < 0 || _ball.settings.posX > CANVAS_WIDTH) vx = -vx;
            if (_ball.settings.posY < 0 || _ball.settings.posY > CANVAS_HEIGHT) vy = -vy;

            if (_ball.settings.posY > CANVAS_HEIGHT) {
                CheckLives();
                ResetBall();
            }

            _ball.settings.posX += vx;
            _ball.settings.posY += vy;
        }

        // PRIVATE
        function CheckBallPaddleCollision() {
            var collision = false;
            if (_ball.settings.posY == paddle.settings.posY - _ball.settings.width &&                             //Check if within paddle height and ball height
                 _ball.settings.posX + _ball.settings.width > paddle.settings.posX &&                             //Check if within ball width
                 _ball.settings.posX - _ball.settings.width <= paddle.settings.posX + paddle.settings.width)      //Check if within paddle width
            {
                collision = true;
            }
            return collision;
        }

        // PRIVATE
        function BounceBallFromPaddle() {
            vy = -vy - BALL_INCREASE_SPEED; // Reverse speed Y
            _ball.settings.posY += vy;

            var leftSidePaddle = paddle.settings.posX + paddle.settings.width / 2;
            var rightSidePaddle = paddle.settings.posX + paddle.settings.width;

            // If rightside ball hits left side paddle
            if (_ball.settings.posX + _ball.settings.width > paddle.settings.posX && _ball.settings.posX + _ball.settings.width < leftSidePaddle) {
                vx = 5;
            }

            // If leftside ball hits right side paddle
            if (_ball.settings.posX > paddle.settings.width - paddle.settings.width / 2 && _ball.settings.posX + _ball.settings.width < rightSidePaddle) {
                vx = -5;
            }
            _ball.settings.posX += vx;
        }

        // Override Object Draw 
        // PUBLIC
        _ball.Draw = function () {
            ctx.fillStyle = GetRandColor();
            ctx.beginPath();
            ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        // PUBLIC
        _ball.Update = function () {
            // Collision Logic
            if (CheckBallPaddleCollision()) {
                AddScore();
                BounceBallFromPaddle();
            }
            else {
                CheckBallBoundriesCollision();
            }
        }
        return _ball;
    };

    // Helper Functions
    function DrawStartScreen() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.fillText("Use mouse to move paddle left and right.", 180, 180);
        ctx.fillText("Press Enter to start.", 260, 220);
    }

    function StartNewGame() {
        LIVES = 3;
        GAME_STATE = GAME_STATE_ENUM[1];
        GAME_SCORE = 0;
        ResetBall();
    }

    function PauseGame() {
        // If playing pause
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            GAME_STATE = GAME_STATE_ENUM[2];
        }
        else {
            GAME_STATE = GAME_STATE_ENUM[1];
        }
    }

    function DrawPauseScreen() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.fillText("Paused", 300, 200);
    }

    function EndGame() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.fillText("GAME OVER", 300, 200);
        ctx.fillText("Press Enter to start new game.", 240, 230);
    }

    function ResetBall() {
        vy = 5;
        BALL_SPEED = 5;
        gameBall.settings.posX = 380;
        gameBall.settings.posY = 20;
    }

    function AddScore() {
        GAME_SCORE = GAME_SCORE + 1;
    }

    function DrawScore() {
        context.lineWidth = 1;
        context.fillStyle = "#000000";
        context.lineStyle = "#000000";
        context.font = "18px sans-serif";
        context.fillText("Score:" + GAME_SCORE, 20, 20);
    }

    function CheckLives() {
        if (LIVES > 0) {
            LIVES = LIVES - 1;
        }
        else {
            GAME_STATE = GAME_STATE_ENUM[3];
        }
    }

    function DrawLives() {
        context.lineWidth = 1;
        context.fillStyle = "#000000";
        context.lineStyle = "#000000";
        context.font = "18px sans-serif";
        context.fillText("Lives:" + LIVES, 600, 20);
    }

    function GetRandColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    // Game IO
    $("#GameCanvas").mousemove(function (e) {
        //If Play Game
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            paddle.settings.posX = e.pageX - 50;
        }
    });

    // Inactive Key Events
    $(document).keydown(function (e) {
        //Enter key
        if (e.keyCode == 13) {
            // If game start or game over allow new game
            if (GAME_STATE === GAME_STATE_ENUM[0] || GAME_STATE === GAME_STATE_ENUM[3]) {
                StartNewGame();
            }
            return false;
        }

        // (p) Pause
        if (e.keyCode == 80) {
            PauseGame();
        }
    });

    var keyState = {};
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);

    // Active key Events
    function CheckGameIO() {
        // (Left Arrow)
        if (keyState[37] || keyState[65]) {
            MovePaddleLeft();
        }

        // (Right Arrow)
        if (keyState[39] || keyState[68]) {
            MovePaddleRight();
        }
    }

    function MovePaddleLeft() {
        if (paddle.settings.posX > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
            paddle.settings.posX = paddle.settings.posX - 13;
        }
    }

    function MovePaddleRight() {
        if (paddle.settings.posX + paddle.settings.width < CANVAS_WIDTH && GAME_STATE === GAME_STATE_ENUM[1]) {
            paddle.settings.posX = paddle.settings.posX + 13;
        }
    }

    // Game Object Declarations
    var paddle = new GameObject();
    paddle.settings.color = "rgba(0, 0, 0, 1)";
    paddle.settings.posY = 350;
    paddle.settings.height = 10;
    paddle.settings.width = 100;

    var gameBall = new Ball();
    gameBall.settings.width = 15;
    gameBall.settings.height = 15;
    gameBall.settings.color = "rgba(0, 0, 0, 1)";
    gameBall.settings.posX = 300;
    gameBall.settings.posY = 100;
});