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
		,tps:2		//target ticks/second
		,fps:1		//target frames/second
	}
	this.sys={//internal vars, dont ever change theese! reading should be ok
		 c:undefined	//canvas element
		,C:undefined	//rendering context
		,t0:undefined	//starttime
		,t:undefined	//uptime
		,dt:undefined	//runtime of last loop
		,fpt:undefined	//frames/tick, used by loop() to increase sys.draw
		,draw:0		//next frame is drawn when this reaches 1
		,tick:0		//tick counter
		,frame:0	//frame counter
		,next:0		//reference to next loop()timeout
	}
}

AntYou.prototype.start=function start(){//initialize and start looping
	this.sys.t0 = new Date().getTime();
	this.sys.c = document.getElementById(this.cfg.cId);
	this.sys.c.width  =this.cfg.w;
	this.sys.c.height =this.cfg.h;
	this.sys.C=this.sys.c.getContext('2d');
	this.sys.fpt=Math.min(this.cfg.fps/this.cfg.tps,1);//limit framerate to tickrate
/*db*/	this.sys.C.moveTo(0,0);this.sys.C.lineTo(this.cfg.w,this.cfg.h);this.sys.C.stroke();
	this.loop();//get the engine going
	return 'AntYou#'+this.id+'@'+this.sys.t0;//returns id and start time
}

AntYou.prototype.stop=function stop(){//abort current loop()-timeout
	clearTimeout(this.sys.next);
	console.log('stop @'+this.sys.next);
}

AntYou.prototype.loop=function loop(){//do 1 timestep (tick)
	var me=this;//pass in the AntYou object as a closure, otherwise we loose reference to loop() as setTimeout causes this===window
	this.sys.next=setTimeout((function(){me.loop()}),1000/this.cfg.tps);//save a reference to make aborting possible
	this.sys.tick++;
	if((this.sys.draw+=this.sys.fpt)>=1){this.sys.draw-=1;this.draw();}
	console.log('tick '+this.sys.tick+' @'+this.sys.next);
}

AntYou.prototype.draw=function draw(){
	this.sys.frame++;
	console.log('draw '+this.sys.frame);
}
