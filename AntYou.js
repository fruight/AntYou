/* author:	fruight<fruight@gmail.com>
 * 
 * AI-game inspired by AntMe
 *
 * changelog:
 * 2010-12-02 starting from scratch with OOP-architecture
*/
function AntYou(canvas,width,height){
	this.id=new Date().getTime();
	this.cfg={
		 w:width
		,h:height
		,cId:canvas
	}
	this.sys={
		 c:undefined//canvas element
		,C:undefined//rendering context
		,t0:undefined//starttime
		,t:undefined//uptime
		,dt:undefined//runtime of last loop
	}
}
AntYou.prototype.start=function start(){
	this.sys.t0 = new Date().getTime();
	this.sys.c = document.getElementById(this.cfg.cId);
	this.sys.c.width  =this.cfg.w;
	this.sys.c.height =this.cfg.h;
	this.sys.C=this.sys.c.getContext('2d');
	this.sys.C.moveTo(0,0);this.sys.C.lineTo(this.cfg.w,this.cfg.h);this.sys.C.stroke();
	return this;
}
