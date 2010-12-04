/* author:	fruight<fruight@gmail.com>
 * 
 * AI-game inspired by AntMe
 *
 * changelog: (newest first)
 *
 *	stats subsystem working
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
 * #5: decouple canvas size and world size and enable zooming
 * #3: points system
*/

function AntYou(){
	this.id=new Date().getTime();
	this.cfg={//configuration, should be safe to change from outside to interface with the engine
		 w:200
		,h:100
		,canvas:'AntYou'//id of canvas element
		,tps:40		//target ticks/second
		,fps:40		//target frames/second
		,maxPop:1000	//maximal population
		,draw:{		//renderer settings
			grid:0		//nonzero value = grid of 'value' spacing
			,center:0	//nonzero value = crosshair of 'value' size
			,stats:true	//switch stats on or off, for detailed stat options see cfg.stats
			,trails:0	//nonzero value = actors get trails indicating direction and speed TODO
			,color:'#000'	//default color
			,fillColor:'#f00'
			,fill:false
		}
		,stats:{
			avg:50		//number of frames/ticks to average over
			,std:'time: %s | tick: %T | frame: %F | tps: %t | fps: %f'//stats displaystring
		}
		,log:true	//loglevel, 'true' values cause forwarding to console.log
	}
	for(i in arguments[0]){if(this.cfg[i]!==undefined){this.cfg[i]=arguments[0][i];}}//apply supplied options

	this.sys={//internal vars, write only for debugging, reset() should reset all of theese
		 c:undefined	//canvas element
		,C:undefined	//rendering context
		,fpt:undefined	//frames/tick, used by loop() to increase sys.draw
		,draw:0		//next frame is drawn when this reaches 1
		,next:0		//reference to next loop()timeout
		,p:undefined	//population aka processes aka pool
		,stats:{
			t0:0		//starttime
			,tick:0
			,frame:0
			,fps:1
			,tps:1
			,tLastTick:0
			,tLastFrame:0
		}
	}//functions may declare new variables here as needed and should also delete them when not needed any longer respectivly
	this.logArray=[];

	this.reset=function reset(start){//initialize and start looping
		with(this.sys){
		if(next){this.log('calling stop()');this.stop();}
		stats.t0 = new Date().getTime();
		stats.frame = stats.tick = stats.fps = stats.tps = stats.tLastTick = stats.tLastFrame = 0;//reset stats
		draw=0;
		c = document.getElementById(this.cfg.canvas);
		C=c.getContext('2d');
		C.clearRect(0,0,this.cfg.w,this.cfg.h);
		p=[];
		for(var i=0;i<this.cfg.maxPop;i++){
			p.push(new Actor(
				Math.random()*this.cfg.w
				,Math.random()*this.cfg.h
				,Math.random()*Math.PI*2
				,2
				,5
			));
		}
		if(start){this.log('calling start()');this.start();}
		this.log('done');
		return 'AntYou#'+this.id+'@'+stats.t0;//returns id and start time
	}}

	this.start=function start(){//start looping
		if(this.sys.next){
			this.log('-W- already running');
			return 'WARNING: already running';
		}
		if(!this.sys.stats.t0){
			this.log('calling reset(true)');
			this.reset(true);
			return 'called reset(true)';
		}
		this.loop();//start looping
		this.log('done');
		return 'started';
	}

	this.stop=function stop(time){//stop looping
		var me=this;
		if(!this.sys.next){
			this.log('-W- not running');
			return 'WARNING: not running';
		}else if(time>0){setTimeout(function(){me.stop()},time+this.sys.stats.t0-new Date().getTime());//stop at time
		}else if(time<0){setTimeout(function(){me.stop()},Math.abs(time));//stop in time
		}else{//stop now
			clearTimeout(this.sys.next);
			var stopped=this.sys.next;
			this.sys.next=0;
			this.log(stopped,'done');
			return stopped;
		}
	}

	this.loop=function loop(){
		var me=this;//pass in the AntYou object as a closure, otherwise we loose reference to loop() as setTimeout causes this===window
		this.sys.next=setTimeout((function(){me.loop()}),1000/this.cfg.tps);//save a reference to make stopping possible
		this.tick();
	}

	this.tick=function tick(){//do 1 timestep (tick)
		with(this.sys){
		stats.tps=Math.round(//simple floating average over 'cfg.stats.avg' ticks
			(stats.tps*(this.cfg.stats.avg-1)+1000/(new Date().getTime()-stats.t0-stats.tLastTick))*100/this.cfg.stats.avg
		)/100;//gives 2 decimals after rounding
		stats.tLastTick=new Date().getTime()-stats.t0;//starttime relative to t0
		stats.tick++;
		for(var i=0;i<p.length;i++){
			p[i].tick();
			if(p[i].x < 0){p[i].x = this.cfg.w;}else//wrap on edges
			if(p[i].x > this.cfg.w){p[i].x = 0;}
			if(p[i].y < 0){p[i].y = this.cfg.h;}else
			if(p[i].y > this.cfg.h){p[i].y = 0;}
			while(p[i].a < 2*Math.PI){p[i].a += 2*Math.PI;}
			while(p[i].a > 2*Math.PI){p[i].a -= 2*Math.PI;}
		}
		if((draw+=Math.min(this.cfg.fps/this.cfg.tps,1))>=1){//limit framerate to tickrate
			draw-=1;
			this.draw();
		}}
	}

	this.draw=function draw(){//render stuff
		with(this.sys.stats){fps=Math.round(//explanation of this in loop()
			(fps*(this.cfg.stats.avg-1)+1000/(new Date().getTime()-t0-tLastFrame))*100/this.cfg.stats.avg
			)/100;
			tLastFrame=new Date().getTime()-t0;//starttime relative to t0
		}
		this.sys.stats.frame++;
		var w=this.cfg.w;
		var h=this.cfg.h;
		with(this.sys.C){
		clearRect(0,0,w,h);
		beginPath();
		setStrokeColor(this.cfg.draw.color);
		for(var i=0;i<this.sys.p.length;i++){//let the Actors draw themselves
			moveTo(this.sys.p[i].x,this.sys.p[i].y);
			this.sys.p[i].draw(this.sys.C);
		}
		if(this.cfg.draw.grid){
			for(var i=-0.5;i<w;i+=this.cfg.draw.grid){
				moveTo(i,0);
				lineTo(i,h);
			}
			for(var i=-0.5;i<h;i+=this.cfg.draw.grid){
				moveTo(0,i);
				lineTo(w,i);
			}
		}
		if(this.cfg.draw.center){//draw horizontal/vertical and diagonal crosshair
			var c=this.cfg.draw.center;
			moveTo(w/2-c,h/2);lineTo(w/2+c,h/2);
			moveTo(w/2,h/2-c);lineTo(w/2,h/2+c);
			moveTo(w/2-c,h/2-c);lineTo(w/2+c,h/2+c);
			moveTo(w/2-c,h/2+c);lineTo(w/2+c,h/2-c);
		}
		closePath();
		if(this.cfg.draw.fill){setFillColor(this.cfg.draw.fillColor);fill();setFillColor(this.cfg.draw.color);}
		stroke();
		if(this.cfg.draw.stats){
			var stats=this.parseStats(this.cfg.stats.std);
			clearRect(0,0,(stats.length+5)*5,10);//guess the length of the stats-string in pixels and clear a background for the stats FIXME there must be a better way to get the length
			fillText(stats,2,9);
		}}
	}

	this.log=function log(){
		var msg=[];
		msg.push(new Date().getTime()-this.sys.stats.t0,arguments.callee.caller.name);
		for(i in arguments){msg.push(arguments[i]);}
		this.logArray.push(msg.join(':'));
		if(this.cfg.log){console.log(msg.join('\t'));}//TODO implement different loglevels
	}

	this.parseStats=function parse(string){
		string=string.replace(/%f/g,this.sys.stats.fps);//extremely exact ( <1% deviation ) even under load
		string=string.replace(/%t/g,this.sys.stats.tps);//up to 20% to high under high load FIXME
		string=string.replace(/%s/g,(new Date().getTime()-this.sys.stats.t0)/1000);
		string=string.replace(/%F/g,this.sys.stats.frame);
		string=string.replace(/%T/g,this.sys.stats.tick);
		return string;
	}
}

//------------------------------------------------------------------------------

function Actor(x,y,heading,speed,size){
	this.x=x;
	this.y=y;
	this.a=heading;
	this.v=speed;
	this.size=size;
	this.stack=[['idle']];

	this.idle=function idle(){
		this.push(['idle']);
		this.push(['turn',Math.random()*Math.PI-Math.PI/2]);
		this.push(['go',Math.random()*250]);
	}
	this.tick=function tick(){
		var action = this.stack.pop();
		this[action.shift()](action[1],action[2],action[3]);//TODO serialize actions in a better way
	}
	this.push=function push(action){
		this.stack.push(action);
	}
	this.getAngleTo=function getAngleTo(x,y){
		var delta=Math.atan( (this.y-y)/(x-this.x) )-this.a+( x<this.x ? Math.PI : 0);
		if(delta>Math.PI){delta-=2*Math.PI;}else
		if(delta<-Math.PI){delta+=2*Math.PI;}//these make sure abs(delta) is <= pi, so we dont go the long way
		return delta;
	}
	this.getDistanceTo=function getDistanceTo(x,y){
		return Math.sqrt( Math.pow(x-this.x,2)+Math.pow(y-this.y,2) );//pythagoras
	}
	this.go=function go(distance){
		if(distance<=this.v){
			this.x += distance*Math.cos(this.a);
			this.y -= distance*Math.sin(this.a);
		}else{
			this.x += this.v*Math.cos(this.a);
			this.y -= this.v*Math.sin(this.a);
			this.push(['go',distance-this.v]);
		}
	}
	this.goTo=function goTo(x,y){
		if(this.x===x && this.y===y){
		}else{
			this.push(['slideTo',x,y]);
			this.push(['go',this.getDistanceTo(x,y)]);
			this.push(['turnTo',this.getAngleTo(x,y)]);
		}
	}
	this.slide=function slide(distance,angle){
		if(distance<=this.v){
			this.x += distance*Math.cos(this.a+angle);
			this.y -= distance*Math.sin(this.a+angle);
		}else{
			this.x += this.v*Math.cos(this.a+angle);
			this.y -= this.v*Math.sin(this.a+angle);
			this.push(['slide',distance-this.v,angle]);
		}
	}
	this.slideTo=function slideTo(x,y){
		if(this.x===x && this.y===y){
		}else{
			this.push(['slide',this.getDistanceTo(x,y),this.getAngleTo(x,y)]);
		}
	}
	this.turn=function turn(delta){
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
	this.turnTo=function turnTo(x,y){
		this.push(['turn',this.getAngleTo(x,y)]);
	}
	this.sleep=function sleep(duration){
		if(duration){this.push(['sleep',duration-1]);}
	}
	this.draw=function draw(C){
		C.arc(this.x,this.y,this.size,-this.a,this.a+Math.PI*2,true);
		/*C.lineTo(this.x-Math.cos(this.a)*this.size+Math.sin(this.a)*this.size,this.y+Math.sin(this.a)*this.size+Math.cos(this.a)*this.size);
		C.lineTo(this.x+Math.cos(this.a)*this.size,this.y-Math.sin(this.a)*this.size);
		C.lineTo(this.x-Math.sin(this.a)*this.size-Math.cos(this.a)*this.size,this.y-Math.cos(this.a)*this.size+Math.sin(this.a)*this.size);
		C.lineTo(this.x,this.y);*///arrow shape
	}
}
