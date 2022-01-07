///////////// Global variables /////////////
var canvas = document.getElementById('plot');
var text = document.getElementById("ordinateId");
var button = document.getElementById("startbuttonId");

// Global variable for timer
var timer;
var step_anim = 500;

// Global start ordinate
var c = text.value;

// Boolean for initVariables
var canvasInit = false;

// index i for current disk collided
// j and l index for loop
var i, j, l;

// Dimensions respecting
// forrmula : 
// (height-edge)/scale = 8 and
// (width-edge)/scale = 8 
var width=400;
var height=400;
var scale=48;
var edge=16;

// Initial number of reflexions   
// set to 0 for the current input 
var n=0;

// Initial slope 
var a=0;

// Final output angle
var theta;

// Boolean for intersection
var intersection;

// Step to searching for intersection
var step;
var pos_delta;

// Final output direction 
var direction;

// Global variables for coordinates
var x1_l;
var y1_l;
var x2_l;
var y2_l;

// Initial coordinates //
var	x_begin=-4;
var y_begin=c;
var x_final=-4;
var y_final=c;

// Coordinates for final segment //
var t, yt;

// Initial length of the particle path //
var	sum_path = 0;    
var	distance;    

// Cooordinates of 3 disks : //
// Disk 0 on top             //
// Disk 1 on right           //
// Disk 2 on bottom          //
var d = 2.5;
var radius = 1;
var xc = new Array(3);
var yc = new Array(3);
var delta = new Array(3);
var f = new Array(3);
var g = new Array(3);
var h = new Array(3);

var p;
var q;
var r;

// Get context //
var ctx;

// Set intervalId for setInterval
var IntervalId;

// Coordinates of the 3 circles
xc[0]=-d*Math.sqrt(3)/6; yc[0]=d/2;
xc[1]=d*Math.sqrt(3)/3; yc[1]=0;           
xc[2]=-d*Math.sqrt(3)/6; yc[2]=-d/2;

stop_draw=false;

function main() {
	initGraphics();
	// example with c=0.2
	c=0.2;
	document.getElementById("ordinateId").value=c;
	initVariables();
	initCompute();
	drawPath();

	button.onclick = function StartParticle() {

		initGraphics();
		initVariables();	 
		// Check interval for value
		if (c >= 2.25 || c <= -2.25){
			var alert = document.getElementById('alert');
			alert.classList.remove('d-none');
		}else
		{ 
			var alert = document.getElementById('alert');
			if(!(alert.classList.contains('d-none'))){
				alert.classList.add('d-none');
			}
			initCompute();
			drawPath();
		}
	};
}

function initVariables() {

	// Initial ordinate //	
	c=text.value;

	// Reset output angle into input
	document.getElementById("outputAngle").value="";  

	// Initial number of reflexions   //
	// set to 0 for the current input //
	n=0;

	// Initial slope //
	a=0;

	// Initial coordinates //
	x_begin=-4;
	y_begin=c;
	x_final=-4;
	y_final=c;

	// t and yt set to zero
	t=0;
	yt=0;

	// Initial length of the particle path //
	sum_path = 0;    
}

function initCompute() {

	// Compute the 3 discriminants //
	// for the first reflexion     //               
	for (j=0; j<3; j++) {
		p=-2*xc[j]+2*a*(c-yc[j]);
		q=Math.pow(c-yc[j],2)-1+Math.pow(xc[j],2) ;
		r=1+Math.pow(a,2);
		delta[j]=Math.pow(p,2)-(4*q*r);
	}

	// Get the first disk collided //
	if (delta[0]>0 && delta[1]>0)
		i=0;
	else if (delta[2]>0 && delta[1]>0)
		i=2;       
	else if (delta[1]>0 && delta[0]>=0)
		i=2;
	else if (delta[1]>0 && delta[2]>=0)
		i=2;
	else if (delta[1]>0)
		i=1;
	else if (delta[0]>0)
		i=0;
	else if (delta[2]>0)
		i=2;

}

// this function does the actual drawing //
function initGraphics() {

	ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(edge+0.5, 0.5, width-edge, height-edge);

	// draw axis
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.setLineDash([2])
		ctx.beginPath();
	ctx.moveTo((width-edge)/2+edge, 0);
	ctx.lineTo((width-edge)/2+edge, height-edge);
	ctx.moveTo(edge, (height-edge)/2);
	ctx.lineTo(width, (height-edge)/2);
	ctx.stroke();

	// add text, needs to be last to overlap graph
	ctx.font = 'italic 15px sans-serif';
	ctx.textBaseline = 'hanging';
	ctx.fillStyle = "#000000";
	ctx.textAlign = 'right'; 
	ctx.fillText('y', (width-edge)/2+edge/2, 0);
	ctx.textAlign = 'right'; 
	ctx.fillText('x', width-edge/2, height/2);

	// set graduations on sides
	ctx.font = '12px sans-serif';
	ctx.textBaseline = 'top';
	ctx.textAlign = 'start'; 
	for (j=0; j<9; j++)
	{  
		ctx.fillText(String(-4+j), j*(width-edge)/8+0.75*edge, height-edge/2);
		ctx.fillText(String(-4+j), 0, height-j*(height-edge)/8-edge);

		// set graduations
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.lineWidth = 0.5;

		// x graduations bottom
		ctx.moveTo(j*(width-edge)/8+edge, height-edge);
		ctx.lineTo(j*(width-edge)/8+edge, height-edge-5);

		// x graduations top
		ctx.moveTo(j*(width-edge)/8+edge, 0);
		ctx.lineTo(j*(width-edge)/8+edge, 5);

		// y graduations left
		ctx.moveTo(edge,height-j*(height-edge)/8-edge);
		ctx.lineTo(edge+5,height-j*(height-edge)/8-edge);

		// y graduations right
		ctx.moveTo(width,height-j*(height-edge)/8-edge);
		ctx.lineTo(width-5,height-j*(height-edge)/8-edge);
		ctx.stroke();

	}

	// draw circles
	for (j=0; j<3; j++)
	{
		ctx.beginPath();
		ctx.lineWidth = 0.5;
		ctx.arc((xc[j]*scale)+(width-edge)/2+edge, -(yc[j]*scale)+(height-edge)/2, radius*scale, 0, 2 * Math.PI, false);
		if (j == 0){
			ctx.fillStyle = '#f25f5c';
		}else if (j == 1){
			ctx.fillStyle = '#ffe066';
		}else{
			ctx.fillStyle = '#247ba0';
		}
		
		ctx.fill();
		ctx.stroke();
	}
}
    
function drawPath() {

	// Break si c = 0 || 1.25 || -1.25 //
	if (c == 0 || c == 1.25 || c == -1.25)
		stop_draw=true;

	// Compute of intersection point for the l-th reflexion //
	p=-2*xc[i]+2*a*(c-yc[i]);
	q=Math.pow(c-yc[i],2)-1+Math.pow(xc[i],2) ;
	r=1+Math.pow(a,2);
	delta[i]=Math.pow(p,2)-(4*q*r);

	// Secondary equation : "a" and "b" //
	a_l=r; b_l=p;

	// 2 solutions of secondary equation //
	x1_l=(-b_l+Math.sqrt(delta[i]))/(2*a_l);
	x2_l=(-b_l-Math.sqrt(delta[i]))/(2*a_l);

	y1_l=a*x1_l+c;
	y2_l=a*x2_l+c;

	// Save x_begin and y_begin // 
	// from x_final and y_final //       
	x_begin=x_final;
	y_begin=y_final;

	// Take the solution of minimum distance //
	if (n>0) {
		if ((Math.pow(x_begin-x1_l,2)+Math.pow(y_begin-y1_l,2)) >= (Math.pow(x_begin-x2_l,2)+Math.pow(y_begin-y2_l,2)))  
		{x_final=x2_l;
			y_final=y2_l;}
		else
		{x_final=x1_l;
			y_final=y1_l;}
	}
	else {
		// Case for the first input //
		x_final=Math.min(x1_l,x2_l);
		y_final=c;
	}

	// Sum the length of path //
	distance=Math.sqrt(Math.pow(x_final-x_begin,2)+Math.pow(y_final-x_begin,2));
	sum_path=sum_path+distance;                

	// Increment the number of reflexion //
	n=n+1;

	// Draw the line    
	ctx.beginPath();
	ctx.moveTo((x_begin*scale)+(width-edge)/2+edge, -(y_begin*scale)+(height-edge)/2);
	ctx.lineTo((x_final*scale)+(width-edge)/2+edge, -(y_final*scale)+(height-edge)/2);
	ctx.closePath();
	ctx.strokeStyle = 'red';
	ctx.stroke();

	// Compute the new straight line equation //
	p=(y_final-yc[i])/(x_final-xc[i]);  
	a=(2*p-a+a*Math.pow(p,2))/(1-Math.pow(p,2)+2*p*a);    
	c=y_final-a*x_final;

	// Compute the 3 new discriminants //
	for (j=0; j<3; j++) {
		f[j]=-2*xc[j]+2*a*(c-yc[j]);
		g[j]=Math.pow(c-yc[j],2)-1+Math.pow(xc[j],2) ;
		h[j]=1+Math.pow(a,2);   
		delta[j]=Math.pow(f[j],2)-(4*g[j]*h[j]);
	}
	// Searching for the indice of new disk collided //
	// Delta position //
	pos_delta=0.00000001;
	// Adaptative step deplacement of straight    //
	// line for a high value of slope :           //
	// minimum of 10000 points on smaller distance //
	// between disks (disk 1 and disk 3) = 0.5    //
	step=0.5/(10000*Math.abs(a));
	// Affine parameter //
	t=x_final;
	// Ordinate start //
	yt=y_final;
	// Boolean for intersection //
	intersection=false;

	// Special case where there is only one delta > 0 : delta(0) //
	if ((i==0) && (delta[0]>0) && (delta[1]<0) && (delta[2]<0)) {
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4))   
		{t=t+delta_line;
			yt=a*t+c;}

			if (intersection == false) {
				if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
				{direction='topright';
					stop_draw=true;} 
				else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
				{direction='topleft';
					stop_draw=true;}
				else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
				{direction='bottomright';
					stop_draw=true;}
				else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
				{direction='bottomleft';
					stop_draw=true;}
			}   
	}

	// Special case where there is only one delta > 0 : delta(1) //
	else if ((i==1) && (delta[1]>0) && (delta[0]<0) && (delta[2]<0)) {
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4))   
		{t=t+delta_line;
			yt=a*t+c;}

			if (intersection == false) {
				if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
				{direction='topright';
					stop_draw=true;} 
				else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
				{direction='topleft';
					stop_draw=true;}
				else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
				{direction='bottomright';
					stop_draw=true;}
				else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
				{direction='bottomleft';
					stop_draw=true;}
			}
	}

	// Special case where there is only one delta > 0 : delta(2) //
	else if ((i==2) && (delta[2]>0) && (delta[0]<0) && (delta[1]<0)) {
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4))   
		{t=t+delta_line;
			yt=a*t+c;}

			if (intersection == false) {
				if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
				{direction='topright';
					stop_draw=true;} 
				else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
				{direction='topleft';
					stop_draw=true;}
				else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
				{direction='bottomright';
					stop_draw=true;}
				else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
				{direction='bottomleft';
					stop_draw=true;}
			}
	}

	// General case with i=0 (top disk) //
	else if (((i==0) && (delta[0]>=0) && (delta[1]>=0)) || ((i==0) && (delta[0]>=0) && (delta[2]>=0))){
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4) && (intersection == false))   
		{t=t+delta_line;
			yt=a*t+c;

			if ((Math.pow(t-xc[0],2)+Math.pow(yt-yc[0],2))<1)
			{i=0; 
				intersection=true;}
			else if ((Math.pow(t-xc[1],2)+Math.pow(yt-yc[1],2))<1)
			{i=1;
				intersection=true;}
			else if ((Math.pow(t-xc[2],2)+Math.pow(yt-yc[2],2))<1)
			{i=2;
				intersection=true;}
		}

		if (intersection == false) {
			if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
			{direction='topright';
				stop_draw=true;} 
			else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
			{direction='topleft';
				stop_draw=true;}
			else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
			{direction='bottomright';
				stop_draw=true;}
			else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
			{direction='bottomleft';
				stop_draw=true;}

		}
	}

	// General case with i=1 (right disk) //
	else if (((i==1) && (delta[1]>=0) && (delta[0]>=0)) || ((i==1) && (delta[1]>=0) && (delta[2]>=0))) {
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4) && (intersection == false))   
		{t=t+delta_line;
			yt=a*t+c;

			if ((Math.pow(t-xc[0],2)+Math.pow(yt-yc[0],2))<1)
			{i=0; 
				intersection=true;}
			else if ((Math.pow(t-xc[1],2)+Math.pow(yt-yc[1],2))<1)
			{i=1;
				intersection=true;}
			else if ((Math.pow(t-xc[2],2)+Math.pow(yt-yc[2],2))<1)
			{i=2;
				intersection=true;}
		}

		if (intersection == false) {
			if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
			{direction='topright';
				stop_draw=true;} 
			else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
			{direction='topleft';
				stop_draw=true;}
			else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
			{direction='bottomright';
				stop_draw=true;}
			else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
			{direction='bottomleft';
				stop_draw=true;}
		}
	}
	// General case with i=2 (bottom disk) //
	else if (((i==2) && (delta[2]>=0) && (delta[0]>=0)) || ((i==2) && (delta[2]>=0) && (delta[1]>=0))) {
		x_shift=x_final+pos_delta;
		y_shift=a*x_shift+c;
		if ((Math.pow(x_shift-xc[i],2)+Math.pow(y_shift-yc[i],2))<1)
			delta_line=-step; 
		else
			delta_line=step;

		while ((yt<4) && (yt>-4) && (t<4) && (t>-4) && (intersection == false)) 
		{t=t+delta_line;
			yt=a*t+c;

			if ((Math.pow(t-xc[0],2)+Math.pow(yt-yc[0],2))<1)
			{i=0; 
				intersection=true;}
			else if ((Math.pow(t-xc[1],2)+Math.pow(yt-yc[1],2))<1)
			{i=1;
				intersection=true;}
			else if ((Math.pow(t-xc[2],2)+Math.pow(yt-yc[2],2))<1)
			{i=2;
				intersection=true;}
		}

		if (intersection == false) {
			if ((((yt>4) && (t<4)) || ((yt>0) && (t>4))) && (delta_line>0))
			{direction='topright';
				stop_draw=true;} 
			else if ((((yt>4) && (t>-4)) || ((yt>0) && (t<-4))) && (delta_line<0))
			{direction='topleft';
				stop_draw=true;}
			else if ((((yt<-4) && (t<4)) || ((yt<0) && (t>4)))  && (delta_line>0))
			{direction='bottomright';
				stop_draw=true;}
			else if ((((yt<-4) && (t>-4)) || ((yt<0) && (t<-4))) && (delta_line<0))
			{direction='bottomleft';
				stop_draw=true;}
		}
	}

	if (!stop_draw) {
		setTimeout(function() {drawPath();}, step_anim);}
	else {
		setTimeout(function() {drawPathEnd();}, step_anim);
		stop_draw=false;}
}

function drawPathEnd() {

	// Draw last segment
	ctx.beginPath();
	ctx.moveTo((x_final*scale)+(width-edge)/2+edge, (-y_final*scale)+(height-edge)/2);
	ctx.lineTo((t*scale)+(width-edge)/2+edge, (-yt*scale)+(height-edge)/2);
	ctx.closePath();
	ctx.strokeStyle = 'red';
	ctx.stroke();

	// 4 possible directions for output //
	if (a==0) 
		theta=Math.PI;
	else if (direction == 'topright')
		theta=Math.atan(a);
	else if (direction == 'topleft')
		theta=Math.atan(a)+Math.PI;
	else if (direction == 'bottomright')
		theta=Math.atan(a)+2*Math.PI;
	else if (direction == 'bottomleft')
		theta=Math.atan(a)+Math.PI;

	document.getElementById('outputAngle').value=theta ; 
}

window.onload = function() {
	main(); }

