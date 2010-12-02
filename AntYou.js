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
		,tps:1		//ticks/second
	}
	this.sys={//internal vars, dont ever change theese! reading should be ok
		 c:undefined	//canvas element
		,C:undefined	//rendering context
		,t0:undefined	//starttime
		,t:undefined	//uptime
		,dt:undefined	//runtime of last loop
	}
}

AntYou.prototype.start=function start(){//initialize and start looping
	this.sys.t0 = new Date().getTime();
	this.sys.c = document.getElementById(this.cfg.cId);
	this.sys.c.width  =this.cfg.w;
	this.sys.c.height =this.cfg.h;
	this.sys.C=this.sys.c.getContext('2d');
	this.sys.C.moveTo(0,0);this.sys.C.lineTo(this.cfg.w,this.cfg.h);this.sys.C.stroke();
	this.loop();//get the engine going
	return 'AntYou#'+this.id+'@'+this.sys.t0;//returns id and start time
}

AntYou.prototype.loop=function loop(){//do 1 timestep (tick)
	var self=this;//i dont know exactly why, but this makes shure that 'this' will not be window
	setTimeout((function(){self.loop()}),1000/this.cfg.tps);
	console.count();
}
