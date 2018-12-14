class Figure {
    constructor(pos = { x: 10, y: 10 }, size = { x: 50, y: 50 }, color = { r: 0, g: 0, b: 255 }, step = { dx: 1, dy: 1 }, id) {
        if (!ctx) {
            console.log('Not init CTX');
        } else if (!canvas) {
            console.log('Not init CANVAS');
        }

        this.type = 'Figure';
        this.id = id;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.step = step;

    }

    setStep(newStep = { dx: 1, dy: 1 }) {
        this.step = newStep;
    }
    setPos(newPos = { x: 0, y: 0 }) {
        this.pos = newPos;
    }
    setSize(newsize = { x: 50, y: 50 }) {
        this.size = newsize;
    }
    setColor(newColor = { r: 0, g: 0, b: 255 }) {
        this.color = newColor;
    }
    setId(id) {
        this.id = id;
    }


    Move(newPos) {
        if (!newPos) {
            this.pos.x += this.step.dx;
            this.pos.y += this.step.dy;
        } else {
            this.pos = newPos;
        }
    }

    BoxCollision() {
        if (this.pos.x + this.size.x > canvas.width || this.pos.x < 0) {
            this.step.dx = -this.step.dx;
        }
        if (this.pos.y + this.size.y > canvas.height || this.pos.y < 0) {
            this.step.dy = -this.step.dy;
        }
    }
    /**
     * axis = 'x','y'
     * @param {string} axis
     * @param {Figure} figure
     */
    __ProjectionCollision(axis, figure) {
        if (figure.pos[axis] > (this.pos[axis] + this.size[axis])) {
            return (figure.pos[axis] - (this.pos[axis] + this.size[axis])) < 0 ? true : false;
        } else if (this.pos[axis] > (figure.pos[axis] + figure.size[axis])) {
            return (this.pos[axis] - (figure.pos[axis] + figure.size[axis])) < 0 ? true : false;
        } else return true;
    }

    Draw(pos = this.pos) {

        this.pos = pos;

        ctx.beginPath();
        ctx.rect(pos.x, pos.y, this.size.x, this.size.y);
        ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.fill();
        ctx.closePath();
    }


}

class Ball extends Figure {
    constructor(pos = { x: 10, y: 10 }, size = { x: 32, y: 32 }, color = { r: 0, g: 0, b: 255 }, step = { dx: 1, dy: 1 }, id) {
        super(pos, size, color, step, id);
        this.type = 'Ball';
        this.acceleration = 0;
        this.lastpaddle = null;
        this.MaxBallSpeed = 5;
        this.MinBallSpeed = 1;
        this.Image = document.getElementById('ball');

    }

    Draw(pos = this.pos) {

        ctx.beginPath();
        ctx.drawImage(this.Image, this.pos.x, this.pos.y);
        ctx.fillStyle = `rgb(${this.lastpaddle.color.r},${this.lastpaddle.color.g},${this.lastpaddle.color.b})`;
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("A", this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.closePath();
    }

    setAcceleration(acc = 0) {
        this.acceleration = acc;
    }
    setLastPaddle(paddle) {
        this.lastpaddle = paddle;
        if (this.lastpaddle instanceof Paddle) {
            this.color = paddle.color;
        }
    }



    Move(newPos) {
        super.Move(newPos);

        if (this.step.dx) {
            this.step.dx += this.step.dx > 0 ? this.acceleration : -this.acceleration;
        }
        if (this.step.dy) {
            this.step.dy += this.step.dy > 0 ? this.acceleration : -this.acceleration;
        }

    }

    /**
     * 
     * @param {Ball[]} figureArray
     */
    BoxCollision(figureArray) {
        super.BoxCollision();
        if (!figureArray) {
            return;
        }
        let length = figureArray.length;

        for (let i = 0; i < length; i++) {
            if (this.id != figureArray[i].id) {

                let xCollision = this.__ProjectionCollision('x', figureArray[i]);
                let yCollision = this.__ProjectionCollision('y', figureArray[i]);

                if (xCollision & yCollision) {
                    if (this.__SideCollision(figureArray[i]) % 2) {
                        this.__XYCollision('dy', i)
                    }
                    else {
                        this.__XYCollision('dx', i)
                    }
                }
            }
        }
    }

    __XYsetStep(xy, newStep) {
        if (newStep > this.MaxBallSpeed) {
            this.step[xy] = this.MaxBallSpeed;
        } else if (newStep < -this.MaxBallSpeed) {
            this.step[xy] = -this.MaxBallSpeed;
        } else {
            this.step[xy] = newStep;
        }


        console.log('Ball step: ' + this.step[xy]);
    }
    __XYCollision(xy, i) {
        if (figureArray[i] instanceof Ball) {

            let speadChange = this.step[xy];
            this.step[xy] = figureArray[i].step[xy];
            figureArray[i].step[xy] = speadChange;

        } else if (figureArray[i] instanceof Brick) {

            figureArray[i].chagePoint(-1, this.lastpaddle);
            this.step[xy] = -this.step[xy];

        } else if (figureArray[i] instanceof Paddle) {

            this.setLastPaddle(figureArray[i]);

            if (this.step[xy] * (this.step[xy] - this.lastpaddle.ballAxeleration) >= 0) {
                this.__XYsetStep(xy, this.step[xy] - this.lastpaddle.ballAxeleration);
                this.step[xy] = -this.step[xy];
            } else {
                this.__XYsetStep(xy, this.step[xy] - this.lastpaddle.ballAxeleration);
            }
        }
        else {

            this.step[xy] = -this.step[xy];
        }
    }


    /**
     * Detect collisioned side: L - 0, U - 1, R - 2, D - 3;
     * @param {Figure} figure
     */
    __SideCollision(figure) {
        let valueArray = [];

        valueArray[0] = Math.abs(this.pos.x - (figure.pos.x + figure.size.x));
        valueArray[1] = Math.abs(this.pos.y - (figure.pos.y + figure.size.y));
        valueArray[2] = Math.abs(figure.pos.x - (this.pos.x + this.size.x));
        valueArray[3] = Math.abs(figure.pos.y - (this.pos.y + this.size.y));

        return valueArray.indexOf(Math.min(...valueArray));
    }
}

class Paddle extends Figure {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 100 }, color = { r: 0, g: 0, b: 0 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'Paddle';
        this.speed = 3;
        this.keyUp = 38;
        this.keyDown = 40;

        this.ballAxeleration = 0;
        this.keyRirght = 39;//68
        this.keyLeft = 37;//65

        this.Image = document.getElementById('ball');
    }


    Draw(pos = this.pos) {

        ctx.beginPath();
        ctx.drawImage(this.Image, this.pos.x, this.pos.y, this.size.x, this.size.y);

        ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.ballAxeleration, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

        ctx.closePath();
    }

    setSpeed(speed) {
        this.speed = speed;
        this.step.dy = this.step.dy >= 0 ? this.speed : -this.speed;
    }
    setBallAxeleration(axeleration) {
        if (axeleration) {
            this.ballAxeleration += axeleration;

            this.ballAxeleration = this.ballAxeleration > 5 ? 5 : this.ballAxeleration;
            this.ballAxeleration = this.ballAxeleration < -5 ? -5 : this.ballAxeleration;
        }
        /* */
        console.log(this.ballAxeleration);
    }
    setKeyUp(code) {
        this.keyUp = code;
    }
    setKeyDown(code) {
        this.keyDown = code;
    }
    setKeyRight(code) {
        this.keyRirght = code;
    }
    setKeyLeft(code) {
        this.keyLeft = code;
    }

    __KeyDown(keyDown) {
        if (keyDown.keyCode === this.keyDown) {
            this.step.dy = this.speed;
        }
        if (keyDown.keyCode === this.keyUp) {
            this.step.dy = -this.speed;
        }
        if (keyDown.keyCode === this.keyRirght) {
            this.setBallAxeleration(1);
        }
        if (keyDown.keyCode === this.keyLeft) {
            this.setBallAxeleration(-1);
        }
    }
    __KeyUp(keyUp) {
        if (keyUp.keyCode === this.keyDown) {
            this.step.dy = 0;
        }
        if (keyUp.keyCode === this.keyUp) {
            this.step.dy = 0;
        }
    }

    setControl() {
        document.addEventListener('keydown', this.__KeyDown.bind(this));
        document.addEventListener('keyup', this.__KeyUp.bind(this));
    }
}
class UserPaddle extends Paddle {
    constructor(pos = { x: 10, y: 10 }, size = { x: 30, y: 100 }, color = { r: 0, g: 0, b: 0 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'UserPaddle';
    }
    BoxCollision(figureArray) {
        if (this.pos.x + this.size.x > canvas.width || this.pos.x < 0) {
            this.step.dx = -this.step.dx;
        }

        if (this.pos.y + this.size.y > canvas.height) {
            this.step.dy = 0;
            this.pos.y = canvas.height - this.size.y;
        } else if (this.pos.y < 0) {
            this.step.dy = 0;
            this.pos.y = 0;
        }

    }
}

class Brick extends Figure {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 0, g: 0, b: 0 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'Brick';
        this.point = 1;
        this.Image = document.getElementById('brick');

        //setTimeout(function(){ this.setPoint(0,null)}.bind(this), 3000);
        
    }

    Draw(pos = this.pos) {

        ctx.beginPath();
        ctx.drawImage(this.Image, this.pos.x, this.pos.y, this.size.x, this.size.y);

        //ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.fillStyle = 'white';
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.type, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

        ctx.closePath();
    }

    setPoint(point = 1, paddle = null) {
        this.point = point;
        if (this.point <= 0) {
            this.DoSomething(paddle);
            this.size = { x: 0, y: 0 };
            this.pos = { x: -1, y: -1 };
            setTimeout(RandomBrick, 1000);
        }
    }

    chagePoint(dpoint = -1, paddle = null) {
        this.point += dpoint;
        if (this.point <= 0) {
            this.DoSomething(paddle);
            this.size = { x: 0, y: 0 };
            this.pos = { x: -100, y: -100 };
            setTimeout(RandomBrick, 1000)
        }
    }

    DoSomething(paddle) {
        paddle;
    }
}
class AddSpeedBrick extends Brick {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 255, g: 0, b: 128 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'AddSpeedBrick';
        this.point = 1;
    }

    DoSomething(paddle) {
        if (paddle) {
            paddle.setSpeed(paddle.speed *= 2);
        }
    }
}
class NotAddSpeedBrick extends Brick {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 128, g: 0, b: 255 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'NotAddSpeedBrick';
        this.point = 1;
    }

    DoSomething(paddle) {
        if (paddle) {
            paddle.setSpeed(paddle.speed /= 2);
        }
    }
}
class ChangeControlBrick extends Brick {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 0, g: 128, b: 0 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'ChangeControlBrick';
        this.point = 1;
    }

    DoSomething(paddle) {
        if (paddle) {
            let tmpkey = paddle.keyUp;
            paddle.setKeyUp(paddle.keyDown);
            paddle.setKeyDown(tmpkey);
        }
    }
}
class AddSizeBrick extends Brick {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 128, g: 128, b: 128 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'AddSizeBrick';
        this.point = 1;
    }

    DoSomething(paddle) {
        if (paddle) {
            paddle.setSize({ x: paddle.size.x, y: paddle.size.y * 2 });
        }
    }
}
class NotAddSizeBrick extends Brick {
    constructor(pos = { x: 10, y: 10 }, size = { x: 20, y: 40 }, color = { r: 0, g: 0, b: 0 }, step = { dx: 0, dy: 0 }, id) {
        super(pos, size, color, step, id);
        this.type = 'NotAddSizeBrick';
        this.point = 1;
    }

    DoSomething(paddle) {
        if (paddle) {
            paddle.setSize({ x: paddle.size.x, y: paddle.size.y / 2 });
        }
    }
}
