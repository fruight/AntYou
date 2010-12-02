/* author:	fruight<fruight@gmail.com>
 * 
 * AI-game inspired by AntMe
 *
 * changelog:
 *
 * 2010-12-02: 0.1 first beta, all basic functionality working
 *	basic Actor ai functions seem stable and correct
 *	log subsystem works
 *	starting from scratch with OOP-architecture
 *
 * ToDo-List: (numbered in order of appearance, sorted in order of importance)
 *
 * #1: implement cfg.draw.stats functionality
 * #2: fix Actor.tick to pass arbitrary numbers of arguments
 * #4: make all coordinate stuff in Actor relative, remove all absolute vars
 * #3: points system
*/
function AntYou(canvas,width,height){
	this.id=new Date().getTime();
	this.cfg={//configuration, should be safe to change from outside to interface with the engine
		 w:width
		,h:height
		,cId:canvas	//id of canvas element
		,tps:40		//target ticks/second
		,fps:40		//target frames/second
		,maxPop:1000	//maximal population
		,draw:{		//renderer settings
			grid:0		//nonzero value = grid of 'value' spacing
			,center:0	//nonzero value = crosshair of 'value' size
			,stats:''	//available options= %t:time %T:tick %F:frame %l:tps %f:fps TODO
			,trails:0	//nonzero value = actors get trails indicating direction and speed TODO
		}
		,log:0		//loglevel, 'true' values cause forwarding to console.log
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
	}//functions may declare new variables here as needed and should also delete them when not needed any longer respectivly
	this.logArray=[];
}

AntYou.prototype.reset=function reset(start){//initialize and start looping
	if(this.sys.next){this.log('calling stop()');this.stop();}
	this.sys.t0 = new Date().getTime();
	this.sys.c = document.getElementById(this.cfg.cId);
	this.sys.c.width  =this.cfg.w;
	this.sys.c.height =this.cfg.h;
	this.sys.C=this.sys.c.getContext('2d');
	this.sys.C.clearRect(0,0,this.cfg.w,this.cfg.h);
	this.sys.p=[];
	for(var i=0;i<this.cfg.maxPop;i++){
		this.sys.p.push(new Actor(
			Math.random()*this.cfg.w
			,Math.random()*this.cfg.h
			,Math.random()*Math.PI*2
			,2
			,5
		));
	}
	if(start){this.log('calling start()');this.start();}
	this.log('done');
	return 'AntYou#'+this.id+'@'+this.sys.t0;//returns id and start time
}

AntYou.prototype.start=function start(){//start looping
	if(this.sys.next){
		this.log('-W- already running');
		return 'WARNING: already running';
	}
	if(!this.sys.t0){
		this.log('calling reset(true)');
		this.reset(true);
		return 'called reset(true)';
	}
	this.loop();//start looping
	this.log('done');
	return 'started';
}

AntYou.prototype.stop=function stop(){//abort looping
	if(!this.sys.next){
		this.log('-W- not running');
		return 'WARNING: not running';
	}
	clearTimeout(this.sys.next);
	var stopped=this.sys.next;
	this.sys.next=0;
	this.log(stopped,'done');
	return stopped;
}

AntYou.prototype.loop=function loop(){//do 1 timestep (tick)
	var me=this;//pass in the AntYou object as a closure, otherwise we loose reference to loop() as setTimeout causes this===window
	this.sys.next=setTimeout((function(){me.loop()}),1000/this.cfg.tps);//save a reference to make aborting possible
	this.sys.tick++;
	for(var i=0;i<this.sys.p.length;i++){
		this.sys.p[i].tick();
		if(this.sys.p[i].x < 0){this.sys.p[i].x = this.cfg.w;}else//wrap on edges
		if(this.sys.p[i].x > this.cfg.w){this.sys.p[i].x = 0;}
		if(this.sys.p[i].y < 0){this.sys.p[i].y = this.cfg.h;}else
		if(this.sys.p[i].y > this.cfg.h){this.sys.p[i].y = 0;}
		while(this.sys.p[i].a < 2*Math.PI){this.sys.p[i].a += 2*Math.PI;}
		while(this.sys.p[i].a > 2*Math.PI){this.sys.p[i].a -= 2*Math.PI;}
	}
	if((this.sys.draw+=Math.min(this.cfg.fps/this.cfg.tps,1))>=1){//limit framerate to tickrate
		this.sys.draw-=1;
		this.draw();
	}
}

AntYou.prototype.draw=function draw(){//render stuff
	this.sys.frame++;
	this.sys.C.clearRect(0,0,this.cfg.w,this.cfg.h);
	this.sys.C.beginPath();
	for(var i=0;i<this.sys.p.length;i++){//let the Actors draw themselves
		this.sys.C.moveTo(this.sys.p[i].x,this.sys.p[i].y);
		this.sys.p[i].draw(this.sys.C);
	}
	if(this.cfg.draw.grid){
		for(var i=-0.5;i<this.cfg.w;i+=this.cfg.draw.grid){
			this.sys.C.moveTo(i,0);
			this.sys.C.lineTo(i,this.cfg.h);
		}
		for(var i=-0.5;i<this.cfg.h;i+=this.cfg.draw.grid){
			this.sys.C.moveTo(0,i);
			this.sys.C.lineTo(this.cfg.w,i);
		}
	}
	if(this.cfg.draw.center){
		this.sys.C.moveTo(this.cfg.w/2-this.cfg.draw.center,this.cfg.h/2);
		this.sys.C.lineTo(this.cfg.w/2+this.cfg.draw.center,this.cfg.h/2);
		this.sys.C.moveTo(this.cfg.w/2,this.cfg.h/2-this.cfg.draw.center);
		this.sys.C.lineTo(this.cfg.w/2,this.cfg.h/2+this.cfg.draw.center);
		this.sys.C.moveTo(this.cfg.w/2-this.cfg.draw.center,this.cfg.h/2-this.cfg.draw.center);
		this.sys.C.lineTo(this.cfg.w/2+this.cfg.draw.center,this.cfg.h/2+this.cfg.draw.center);
		this.sys.C.moveTo(this.cfg.w/2-this.cfg.draw.center,this.cfg.h/2+this.cfg.draw.center);
		this.sys.C.lineTo(this.cfg.w/2+this.cfg.draw.center,this.cfg.h/2-this.cfg.draw.center);
	}
	this.sys.C.closePath();
	this.sys.C.stroke();
	if(this.cfg.draw.stats){
		this.sys.C.clearRect(0,0,250,10);
		this.sys.C.fillText('dummy',2,9);//TODO actually draw real stats
	}
}

AntYou.prototype.log=function log(){
	var msg=[];
	msg.push(new Date().getTime()-this.sys.t0,arguments.callee.caller.name);
	for(i in arguments){msg.push(arguments[i]);}
	this.logArray.push(msg.join(':'));
	if(this.cfg.log){console.log(msg.join('\t'));}//TODO implement different loglevels
}

//------------------------------------------------------------------------------

function Actor(x,y,heading,speed,size){
	this.x=x;
	this.y=y;
	this.a=heading;
	this.v=speed;
	this.size=size;
	this.stack=[['idle']];
}

Actor.prototype.idle=function idle(){
	this.push(['idle']);
	this.push(['turn',Math.random()*Math.PI-Math.PI/2]);
	this.push(['go',Math.random()*250]);
}
Actor.prototype.tick=function tick(){
	var action = this.stack.pop();
	this[action.shift()](action[1],action[2],action[3]);//TODO serialize actions in a better way
}
Actor.prototype.push=function push(action){
	this.stack.push(action);
}
Actor.prototype.getAngleTo=function getAngleTo(x,y){
	var delta=Math.atan( (this.y-y)/(x-this.x) )-this.a+( x<this.x ? Math.PI : 0);
	if(delta>Math.PI){delta-=2*Math.PI;}else
	if(delta<-Math.PI){delta+=2*Math.PI;}//these make sure abs(delta) is <= pi, so we dont go the long way
	return delta;
}
Actor.prototype.getDistanceTo=function getDistanceTo(x,y){
	return Math.sqrt( Math.pow(x-this.x,2)+Math.pow(y-this.y,2) );//pythagoras
}
Actor.prototype.go=function go(distance){
	if(distance<=this.v){
		this.x += distance*Math.cos(this.a);
		this.y -= distance*Math.sin(this.a);
	}else{
		this.x += this.v*Math.cos(this.a);
		this.y -= this.v*Math.sin(this.a);
		this.push(['go',distance-this.v]);
	}
}
Actor.prototype.goTo=function goTo(x,y){
	if(this.x===x && this.y===y){
	}else{
		this.push(['slideTo',x,y]);
		this.push(['go',this.getDistanceTo(x,y)]);
		this.push(['turnTo',this.getAngleTo(x,y)]);
	}
}
Actor.prototype.slide=function slide(distance,angle){
	if(distance<=this.v){
		this.x += distance*Math.cos(this.a+angle);
		this.y -= distance*Math.sin(this.a+angle);
	}else{
		this.x += this.v*Math.cos(this.a+angle);
		this.y -= this.v*Math.sin(this.a+angle);
		this.push(['slide',distance-this.v,angle]);
	}
}
Actor.prototype.slideTo=function slideTo(x,y){
	if(this.x===x && this.y===y){
	}else{
		this.push(['slide',this.getDistanceTo(x,y),this.getAngleTo(x,y)]);
	}
}
Actor.prototype.turn=function turn(delta){
	var turnspeed = this.v*Math.PI/180;
	if(Math.abs(delta) < turnspeed){
		this.a += delta;
	}else if(delta<0){
		this.a -= turnspeed;
		this.push(['turn',delta+turnspeed]);
	}else{
		this.a += turnspeed;
		this.push(['turn',delta-turnspeed]);
	}
}
Actor.prototype.turnTo=function turnTo(x,y){
	this.push(['turn',this.getAngleTo(x,y)]);
}
Actor.prototype.sleep=function sleep(duration){
	if(duration){this.push(['sleep',duration-1]);}
}

Actor.prototype.draw=function draw(C){
	C.arc(this.x,this.y,this.size,-this.a,this.a+Math.PI*2,true);
}