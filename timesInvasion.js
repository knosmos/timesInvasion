let screenw = window.innerWidth/2-20;
let screenh = window.innerHeight;

let numChannels = 5;

let barrierOffset = 100;

let invaderCtr = 400;
let invaderFreq = 400;
let invaderSpeedMultiplier = 1;

invaders = [];
bullets = [];
barriers = [];

let player;
let score = 0;

let end = false;
let start = 255;

for(let i=0; i<numChannels; i++){
    barriers.push(true);
}

function preload(){

}

function setup(){
    createCanvas(screenw,screenh);
    textFont('Georgia');
    textAlign(CENTER,CENTER);
    textSize(30);
    noStroke();
    player = new defender();
}

function randint(l,h){
    return l+Math.round(Math.random()*(h-l))
}

class invader{
    constructor(){
        this.channel = randint(0,numChannels-1);
        this.problem = [randint(1,10),randint(1,10)];
        this.y = 0;
        this.speed = (100-this.problem[0]*this.problem[1])/100*invaderSpeedMultiplier;
        if(this.problem.includes(1)||this.problem.includes(10)){
            this.speed = 2*invaderSpeedMultiplier;
        }
    }
    doStuff(){
        //Render, move, destroy barriers and signal end-of game
        fill(255, 36, 138);
        text(`${this.problem[0]}x${this.problem[1]}`,this.channel*(screenw/numChannels)+screenw/numChannels/2,this.y*screenh/400);
        this.y += this.speed;
        if(Math.round(this.y*screenh/400)>screenh-barrierOffset){
            if(barriers[this.channel]===true){
                barriers[this.channel]=false;
                return 1;
            }
            else{
                console.log(this.channel);
                end=true;
                return 1;
            }
        }
        return 0;
    }
}

class bullet{
    constructor(channel,answer){
        this.channel = channel;
        this.answer = answer;
        if(isNaN(this.answer)){
            this.answer = '?!';
        }
        this.y = screenh - barrierOffset;
    }
    doStuff(){
        // Render, move, destroy invaders
        fill(255);
        text(this.answer.toString(),this.channel*(screenw/numChannels)+screenw/numChannels/2,this.y);
        this.y -= 10;
        for(let j=0; j<invaders.length; j++){
            if(invaders[j].channel===this.channel){ //Optimization, alright?
                if(invaders[j].problem[0]*invaders[j].problem[1]===this.answer){
                    if(invaders[j].y>=this.y/screenh*400){
                        invaders.splice(j,1);
                        score += this.answer*10;
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

class defender{
    constructor(){
        this.channel = Math.round(numChannels/2);
        this.answer = '';
        this.height = 40;
    }
    render(){
        //Render the defender. What did you expect?
        fill(30,100);
        rect(this.channel*(screenw/numChannels), 0, screenw/numChannels, screenh);
        fill(255);
        rect(this.channel*(screenw/numChannels), screenh-this.height, screenw/numChannels, this.height);
        fill(0);
        text(this.answer,this.channel*(screenw/numChannels)+screenw/numChannels/2, screenh-this.height/2);
    }
}

function drawBarriers(){
    for(let i=0; i<numChannels; i++){
        if(barriers[i]){
            fill(237, 255, 99);
            rect(i*(screenw/numChannels),screenh-barrierOffset,screenw/numChannels,30);
        }
    }
}

function startScreen(){
    background(0);
    fill(255,start);
    textSize(100);
    textAlign(LEFT,CENTER);
    text('Times\nInvasion',10,screenh/2,screenw-20);
    start-=5;
    if(start<0){
        start=false;
        textAlign(CENTER,CENTER);
    }
}

function killScreen(){
    fill(255);
    rect(screenw*0.25,screenh*0.25,screenw*0.5,screenh*0.5,20);
    fill(0);
    textSize(40);
    text('Game Over',screenw/2,screenh/4+30);
    textSize(30);
    text(score.toString()+' points',screenw/2,screenh/4+60);
    if(mouseX>screenw/4&&mouseX<screenw*0.75&&mouseY>screenh*0.75-screenh/8&&mouseY<screenh*0.75){
        fill(100,255,100);
        if(mouseIsPressed){
            invaders = [];
            bullets = [];
            barriers = [];
            for(let i=0; i<numChannels; i++){
                barriers.push(true);
            }
            score = 0;
            invaderFreq = 300;
            player.channel = round(numChannels/2);
            invaderSpeedMultiplier=1;
            end=false;
        }
    }
    else{
        fill(4, 130, 176);
    }
    rect(screenw/4,screenh*0.75-screenh/8,screenw/2,screenh/8,0,0,20,20);
    fill(0);
    text('Play Again',screenw/2,screenh*0.75-screenh/16);
}

function keyPressed(){
    //alert(key);
    if(['0','1','2','3','4','5','6','7','8','9'].includes(key)){
        player.answer += key;
    }
    else if(keyCode===32||keyCode===ENTER){ //Spacebar | Enter
        bullets.push(new bullet(player.channel,parseInt(player.answer)));
        player.answer = '';
    }
    else if(keyCode===LEFT_ARROW&&player.channel>0){
        player.channel-=1;
    }
    else if(keyCode===RIGHT_ARROW&&player.channel<numChannels-1){
        player.channel+=1;
    }
}

function draw(){
    if(end===false&&start===false){
        background(0);
        textSize(100);
        fill(50);
        text(score.toString(),screenw/2,screenh/2);
        textSize(40);
        player.render();
        for(let i=0; i<bullets.length; i++){
            if(bullets[i].doStuff()){
                bullets.splice(i,1)
            }
        }
        for(let i=0; i<invaders.length; i++){
            let toKillOrNotToKill = invaders[i].doStuff()
            if(toKillOrNotToKill===1){
                invaders.splice(i,1);
                invaderSpeedMultiplier*=1.1;
            }
            if(toKillOrNotToKill===2){
                end=true;
            }
        }
        if(invaderCtr>invaderFreq){
            invaders.push(new invader());
            invaderCtr = 0;
            if(invaderFreq>100){
                invaderFreq *= 0.95;
            }
        }
        invaderCtr ++;
        drawBarriers();
    }
    else if(end){
        killScreen();
    }
    else{
        startScreen();
    }
}