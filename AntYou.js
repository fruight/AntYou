/* author:	fruight<fruight@gmail.com>
 * 
 * AI-game inspired by AntMe
 *
 * changelog:
 * 2010-12-02 starting from scratch with OOP-architecture
*/
function AntYou(canvas,width,height){
	this.id=new Date().getTime();
	this.cfg={//configuration, should be safe to change from outside to interface with the engine
		 w:width
		,h:height
		,cId:canvas	//id of canvas element
		,tps:40		//target ticks/second
		,fps:30		//target frames/second
		,maxPop:1	//maximal population
	}
	this.sys={//internal vars, dont ever change theese! reading should be ok
		 c:undefined	//canvas element
		,C:undefined	//rendering context
		,t0:undefined	//starttime
		,fpt:undefined	//frames/tick, used by loop() to increase sys.draw
		,draw:0		//next frame is drawn when this reaches 1
		,tick:0		//tick counter
		,frame:0	//frame counter
		,next:0		//reference to next loop()timeout
		,p:undefined	//population aka processes aka pool
	}
}

AntYou.prototype.start=function start(){//initialize and start looping
	this.sys.t0 = new Date().getTime();
	this.sys.c = document.getElementById(this.cfg.cId);
	this.sys.c.width  =this.cfg.w;
	this.sys.c.height =this.cfg.h;
	this.sys.C=this.sys.c.getContext('2d');
	this.sys.fpt=Math.min(this.cfg.fps/this.cfg.tps,1);//limit framerate to tickrate
	this.sys.p=[];
	for(var i=0;i<this.cfg.maxPop;i++){
		this.sys.p.push(new Actor(
			Math.random()*this.cfg.w
			,Math.random()*this.cfg.h
			,Math.random()*Math.PI*2
		));
	}
	this.loop();//get the engine going
	return 'AntYou#'+this.id+'@'+this.sys.t0;//returns id and start time
}

AntYou.prototype.stop=function stop(){//abort looping
	clearTimeout(this.sys.next);
	console.log('stop @'+this.sys.next);
}

AntYou.prototype.loop=function loop(){//do 1 timestep (tick)
	var me=this;//pass in the AntYou object as a closure, otherwise we loose reference to loop() as setTimeout causes this===window
	this.sys.next=setTimeout((function(){me.loop()}),1000/this.cfg.tps);//save a reference to make aborting possible
	this.sys.tick++;
	for(var i=0;i<this.sys.p.length;i++){
		this.sys.p[i].tick();
	}
	if((this.sys.draw+=this.sys.fpt)>=1){this.sys.draw-=1;this.draw();}
	//console.log('ticked '+this.sys.tick+' @'+this.sys.next);
}

AntYou.prototype.draw=function draw(){//render stuff
	this.sys.frame++;
	this.sys.C.clearRect(0,0,this.cfg.w,this.cfg.h);
	this.sys.C.beginPath();
	for(var i=0;i<this.sys.p.length;i++){
		this.sys.p[i].draw(this.sys.C);
	}
	this.sys.C.closePath();
	//console.log('drawn '+this.sys.frame);
}

//------------------------------------------------------------------------------

function Actor(x,y,a){
	this.x=x;
	this.y=y;
	this.a=a;//angle aka heading
	this.stack=['idle'];
}

Actor.prototype.tick=function tick(){
	this.x+=Math.random()*20-10;
	this.y+=Math.random()*20-10;
}
Actor.prototype.getAngleTo=function getAngleTo(){
}
Actor.prototype.getDistanceTo=function getDistanceTo(){
}
Actor.prototype.go=function go(){
}
Actor.prototype.goTo=function goTo(){
}
Actor.prototype.slide=function slide(){
}
Actor.prototype.slideTo=function slideTo(){
}
Actor.prototype.turn=function turn(){
}
Actor.prototype.turnTo=function turnTo(){
}
Actor.prototype.sleep=function sleep(){
}
Actor.prototype.draw=function draw(C){
	C.arc(this.x,this.y,10,0,Math.PI*2,true);
	C.fill();
}
