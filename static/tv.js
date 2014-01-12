/* --- BoxOver ---
/* --- v 1.9 12 December 2005
By Oliver Bryant with help of Matthew Tagg
http://boxover.swazz.org */

if (typeof document.attachEvent!='undefined') {
   window.attachEvent('onload',init);
   document.attachEvent('onmousemove',moveMouse);
   document.attachEvent('onclick',checkMove); }
else {
   window.addEventListener('load',init,false);
   document.addEventListener('mousemove',moveMouse,false);
   document.addEventListener('click',checkMove,false);
}

var oDv=document.createElement("div");
var dvHdr=document.createElement("div");
var dvBdy=document.createElement("div");
var windowlock,boxMove,fixposx,fixposy,lockX,lockY,fixx,fixy,ox,oy,boxLeft,boxRight,boxTop,boxBottom,evt,mouseX,mouseY,boxOpen,totalScrollTop,totalScrollLeft;
boxOpen=false;
ox=10;
oy=10;
lockX=0;
lockY=0;

function init() {
	oDv.appendChild(dvHdr);
	oDv.appendChild(dvBdy);
	oDv.style.position="absolute";
	oDv.style.visibility='hidden';
	document.body.appendChild(oDv);	
}

function defHdrStyle() {
	dvHdr.innerHTML='<img  style="vertical-align:middle"  src="info.gif">&nbsp;&nbsp;'+dvHdr.innerHTML;
	dvHdr.style.fontWeight='bold';
	dvHdr.style.width='150px';
	dvHdr.style.fontFamily='arial';
	dvHdr.style.border='1px solid #A5CFE9';
	dvHdr.style.padding='3';
	dvHdr.style.fontSize='11';
	dvHdr.style.color='#4B7A98';
	dvHdr.style.background='#D5EBF9';
	dvHdr.style.filter='alpha(opacity=85)'; // IE
	dvHdr.style.opacity='0.85'; // Firefox
}

function defBdyStyle() {
	dvBdy.style.borderBottom='1px solid #A5CFE9';
	dvBdy.style.borderLeft='1px solid #A5CFE9';
	dvBdy.style.borderRight='1px solid #A5CFE9';
	dvBdy.style.width='150px';
	dvBdy.style.fontFamily='arial';
	dvBdy.style.fontSize='11';
	dvBdy.style.padding='3';
	dvBdy.style.color='#1B4966';
	dvBdy.style.background='#FFFFFF';
	dvBdy.style.filter='alpha(opacity=85)'; // IE
	dvBdy.style.opacity='0.85'; // Firefox
}

var cnt=0;

function checkElemBO(txt) {
   if ((txt.indexOf('header')>-1)&(txt.indexOf('body')>-1)&(txt.indexOf('[')>-1)&(txt.indexOf('[')>-1))
      return true;
   else
      return false;
}

function scanDOM(curNode) {
	cnt++;
	while(curNode)	{
		if (curNode.title) {
		  if (checkElemBO(curNode.title)) {
   			curNode.boHDR=getParam('(?:[^a-zA-Z]header|^header)',curNode.title);
   			curNode.boBDY=getParam('(?:[^a-zA-Z]body|^body)',curNode.title);
   			curNode.boCSSBDY=getParam('cssbody',curNode.title);			
   			curNode.boCSSHDR=getParam('cssheader',curNode.title);
   			curNode.IEbugfix=(getParam('hideselects',curNode.title)=='on')?true:false;
   			curNode.fixX=parseInt(getParam('fixedrelx',curNode.title));
   			curNode.fixY=parseInt(getParam('fixedrely',curNode.title));
   			curNode.absX=parseInt(getParam('fixedabsx',curNode.title));
   			curNode.absY=parseInt(getParam('fixedabsy',curNode.title));
   			curNode.offY=(getParam('offsety',curNode.title)!='')?parseInt(getParam('offsety',curNode.title)):10;
   			curNode.offX=(getParam('offsetx',curNode.title)!='')?parseInt(getParam('offsetx',curNode.title)):10;
   			curNode.fade=(getParam('fade',curNode.title)=='on')?true:false;
   			curNode.fadespeed=(getParam('fadespeed',curNode.title)!='')?getParam('fadespeed',curNode.title):0.04;
   			curNode.delay=(getParam('delay',curNode.title)!='')?parseInt(getParam('delay',curNode.title)):0;
   			if (getParam('requireclick',curNode.title)=='on') {
   				curNode.requireclick=true;
   				document.all?curNode.attachEvent('onclick',showHideBox):curNode.addEventListener('click',showHideBox,false);
   				document.all?curNode.attachEvent('onmouseover',hideBox):curNode.addEventListener('mouseover',hideBox,false);
   			}
   			else {// Note : if requireclick is on the stop clicks are ignored   			
	   			if (getParam('doubleclickstop',curNode.title)!='off') {
	   				document.all?curNode.attachEvent('ondblclick',pauseBox):curNode.addEventListener('dblclick',pauseBox,false);
	   			}	
	   			if (getParam('singleclickstop',curNode.title)=='on') {
	   				document.all?curNode.attachEvent('onclick',pauseBox):curNode.addEventListener('click',pauseBox,false);
	   			}
	   		}
   			curNode.windowLock=getParam('windowlock',curNode.title).toLowerCase()=='off'?false:true;
   			curNode.title='';
   			curNode.hasbox='true';
   	   }
		}
		scanDOM(curNode.firstChild);
		curNode=curNode.nextSibling;
	}
}

function getParam(param,list) {
	var reg = new RegExp(param+'\\s*=\\s*\\[\\s*(((\\[\\[)|(\\]\\])|([^\\]\\[]))*)\\s*\\]');
	var res = reg.exec(list);
	var returnvar;
	if(res)
		return res[1].replace('[[','[').replace(']]',']');
	else
		return '';
}

function Left(elem){	
	var x=0;
	if (elem.calcLeft)
		return elem.calcLeft;
	var oElem=elem;
	while(elem){
		 if ((elem.currentStyle)&& (!isNaN(parseInt(elem.currentStyle.borderLeftWidth)))&&(x!=0))
		 	x+=parseInt(elem.currentStyle.borderLeftWidth);
		 x+=elem.offsetLeft;
		 elem=elem.offsetParent;
	  } 
	oElem.calcLeft=x;
	return x;
	}

function Top(elem){
	 var x=0;
	 if (elem.calcTop)
	 	return elem.calcTop;
	 var oElem=elem;
	 while(elem){		
	 	 if ((elem.currentStyle)&& (!isNaN(parseInt(elem.currentStyle.borderTopWidth)))&&(x!=0))
		 	x+=parseInt(elem.currentStyle.borderTopWidth); 
		 x+=elem.offsetTop;
	         elem=elem.offsetParent;
 	 } 
 	 oElem.calcTop=x;
 	 return x;
 	 
}

var ah,ab;
function applyStyles() {
	if(ab)
		oDv.removeChild(dvBdy);
	if (ah)
		oDv.removeChild(dvHdr);
	dvHdr=document.createElement("div");
	dvBdy=document.createElement("div");
	CBE.boCSSBDY?dvBdy.className=CBE.boCSSBDY:defBdyStyle();
	CBE.boCSSHDR?dvHdr.className=CBE.boCSSHDR:defHdrStyle();
	dvHdr.innerHTML=CBE.boHDR;
	dvBdy.innerHTML=CBE.boBDY;
	ah=false;
	ab=false;
	if (CBE.boHDR!='') {		
		oDv.appendChild(dvHdr);
		ah=true;
	}	
	if (CBE.boBDY!=''){
		oDv.appendChild(dvBdy);
		ab=true;
	}	
}

var CSE,iterElem,LSE,CBE,LBE, totalScrollLeft, totalScrollTop, width, height ;
var ini=false;

// Customised function for inner window dimension
function SHW() {
   if (document.body && (document.body.clientWidth !=0)) {
      width=document.body.clientWidth;
      height=document.body.clientHeight;
   }
   if (document.documentElement && (document.documentElement.clientWidth!=0) && (document.body.clientWidth + 20 >= document.documentElement.clientWidth)) {
      width=document.documentElement.clientWidth;   
      height=document.documentElement.clientHeight;   
   }   
   return [width,height];
}


var ID=null;
function moveMouse(e) {
   if (!ini) {      
      scanDOM(document.body.firstChild);
      ini=true;
   }
	e?evt=e:evt=event;	
	//evt=event;
		
	CSE=evt.target?evt.target:evt.srcElement;
	if ((CSE!=LSE)&&(!isChild(CSE,dvHdr))&&(!isChild(CSE,dvBdy))){
		
		if (!CSE.boxItem) {
			iterElem=CSE;
			while ((!iterElem.hasbox)&&(iterElem.parentNode))
					iterElem=iterElem.parentNode; 
			CSE.boxItem=iterElem;
			}
		iterElem=CSE.boxItem;
		if (CSE.boxItem.title)
		  if (checkElemBO(CSE.boxItem.title)) {		      
		      ini=false;
		   }
		if (CSE.boxItem&&CSE.boxItem.hasbox)  {
			LBE=CBE;
			CBE=iterElem;
			if (CBE!=LBE) {
				applyStyles();
				if (!CBE.requireclick)
					if (CBE.fade) {
						if (ID!=null)
							clearTimeout(ID);
						ID=setTimeout("fadeIn("+CBE.fadespeed+")",CBE.delay);
					}
					else {
						if (ID!=null)
							clearTimeout(ID);
						COL=1;
						ID=setTimeout("oDv.style.visibility='visible';ID=null;",CBE.delay);						
					}
				if (CBE.IEbugfix) {hideSelects();} 
				fixposx=!isNaN(CBE.fixX)?Left(CBE)+CBE.fixX:CBE.absX;
				fixposy=!isNaN(CBE.fixY)?Top(CBE)+CBE.fixY:CBE.absY;			
				lockX=0;
				lockY=0;
				boxMove=true;
				ox=CBE.offX?CBE.offX:10;
				oy=CBE.offY?CBE.offY:10;
			}
		}
		else if (!isChild(CSE,dvHdr) && !isChild(CSE,dvBdy) && (boxMove))	{
			// The conditional here fixes flickering between tables cells.
			if ((!isChild(CBE,CSE)) || (CSE.tagName!='TABLE')) {   			
   			CBE=null;
   			fadeOut();
   			showSelects();
			}
		}
		LSE=CSE;
	}
	else if (((isChild(CSE,dvHdr) || isChild(CSE,dvBdy))&&(boxMove))) {
		totalScrollLeft=0;
		totalScrollTop=0;
		
		iterElem=CSE;
		while(iterElem) {
			if(!isNaN(parseInt(iterElem.scrollTop)))
				totalScrollTop+=parseInt(iterElem.scrollTop);
			if(!isNaN(parseInt(iterElem.scrollLeft)))
				totalScrollLeft+=parseInt(iterElem.scrollLeft);
			iterElem=iterElem.parentNode;			
		}
		if (CBE!=null) {
			boxLeft=Left(CBE)-totalScrollLeft;
			boxRight=parseInt(Left(CBE)+CBE.offsetWidth)-totalScrollLeft;
			boxTop=Top(CBE)-totalScrollTop;
			boxBottom=parseInt(Top(CBE)+CBE.offsetHeight)-totalScrollTop;
			doCheck();
		}
	}
	
	if (boxMove&&CBE) {
		// This added to alleviate bug in IE6 w.r.t DOCTYPE
		bodyScrollTop=document.documentElement&&document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop;
		bodyScrollLet=document.documentElement&&document.documentElement.scrollLeft?document.documentElement.scrollLeft:document.body.scrollLeft;
		mouseX=evt.pageX?evt.pageX-bodyScrollLet:evt.clientX-document.body.clientLeft;
		mouseY=evt.pageY?evt.pageY-bodyScrollTop:evt.clientY-document.body.clientTop;
		if ((CBE)&&(CBE.windowLock)) {
			mouseY < -oy?lockY=-mouseY-oy:lockY=0;
			mouseX < -ox?lockX=-mouseX-ox:lockX=0;
			mouseY > (SHW()[1]-oDv.offsetHeight-oy)?lockY=-mouseY+SHW()[1]-oDv.offsetHeight-oy:lockY=lockY;
			mouseX > (SHW()[0]-dvBdy.offsetWidth-ox)?lockX=-mouseX-ox+SHW()[0]-dvBdy.offsetWidth:lockX=lockX;			
		}
		oDv.style.left=((fixposx)||(fixposx==0))?fixposx:bodyScrollLet+mouseX+ox+lockX+"px";
		oDv.style.top=((fixposy)||(fixposy==0))?fixposy:bodyScrollTop+mouseY+oy+lockY+"px";		
		
	}
}

function doCheck() {	
	if (   (mouseX < boxLeft)    ||     (mouseX >boxRight)     || (mouseY < boxTop) || (mouseY > boxBottom)) {
		if (!CBE.requireclick)
			fadeOut();
		if (CBE.IEbugfix) {showSelects();}
		CBE=null;
	}
}

function pauseBox(e) {
   e?evt=e:evt=event;
	boxMove=false;
	evt.cancelBubble=true;
}

function showHideBox(e) {
	oDv.style.visibility=(oDv.style.visibility!='visible')?'visible':'hidden';
}

function hideBox(e) {
	oDv.style.visibility='hidden';
}

var COL=0;
var stopfade=false;
function fadeIn(fs) {
		ID=null;
		COL=0;
		oDv.style.visibility='visible';
		fadeIn2(fs);
}

function fadeIn2(fs) {
		COL=COL+fs;
		COL=(COL>1)?1:COL;
		oDv.style.filter='alpha(opacity='+parseInt(100*COL)+')';
		oDv.style.opacity=COL;
		if (COL<1)
		 setTimeout("fadeIn2("+fs+")",20);		
}


function fadeOut() {
	oDv.style.visibility='hidden';
	
}

function isChild(s,d) {
	while(s) {
		if (s==d) 
			return true;
		s=s.parentNode;
	}
	return false;
}

var cSrc;
function checkMove(e) {
	e?evt=e:evt=event;
	cSrc=evt.target?evt.target:evt.srcElement;
	if ((!boxMove)&&(!isChild(cSrc,oDv))) {
		fadeOut();
		if (CBE&&CBE.IEbugfix) {showSelects();}
		boxMove=true;
		CBE=null;
	}
}

function showSelects(){
   var elements = document.getElementsByTagName("select");
   for (i=0;i< elements.length;i++){
      elements[i].style.visibility='visible';
   }
}

function hideSelects(){
   var elements = document.getElementsByTagName("select");
   for (i=0;i< elements.length;i++){
   elements[i].style.visibility='hidden';
   }
}
/*END popup stuff */

/* Style Switching Stuff */
function setActiveStyleSheet(title) {
  var i, a, main;
  for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
      a.disabled = true;
      if(a.getAttribute("title") == title) a.disabled = false;
    }
  }
}

function getActiveStyleSheet() {
  var i, a;
  for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title") && !a.disabled) return a.getAttribute("title");
  }
  return null;
}

function getPreferredStyleSheet() {
  var i, a;
  for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1
       && a.getAttribute("rel").indexOf("alt") == -1
       && a.getAttribute("title")
       ) return a.getAttribute("title");
  }
  return null;
}

window.onload = function(e) {
  var cookie = readCookie("style");
  var title = cookie ? cookie : getPreferredStyleSheet();
  setActiveStyleSheet(title);
}

window.onunload = function(e) {
  var title = getActiveStyleSheet();
  createCookie("style", title, 365);
}

var cookie = readCookie("style");
var title = cookie ? cookie : getPreferredStyleSheet();
setActiveStyleSheet(title);

/*END style switching stuff */

/*RealTime Clock stuff */
var mydate=new Date(currenttime);

function addzero(t){
   var output=(t.toString().length==1)? "0"+t : t;
   return output;
}
function displaytime(){
   mydate.setSeconds(mydate.getSeconds()+1);
   if(twelvehour.toString()=="true"){myhours=mydate.getHours() == 0 ? 12 : (mydate.getHours() > 12 ? mydate.getHours() - 12 : mydate.getHours());mydate.getHours() > 11 ? ampm=' PM' : ampm=' AM';}else{myhours=addzero(mydate.getHours());ampm='';}
   var timestring=myhours+":"+addzero(mydate.getMinutes())+":"+addzero(mydate.getSeconds())+ampm;
   document.getElementById('barclock').innerHTML=timestring;
   var timestring=timestring+"<br/>"+daynames[mydate.getDay()]+"<br/>";
   if(dayfirst.toString()=="true"){timestring+=mydate.getDate()+" "+monthnames[mydate.getMonth()]+" "+mydate.getFullYear();}
   else{timestring+=monthnames[mydate.getMonth()]+" "+mydate.getDate()+", "+mydate.getFullYear();}
   document.getElementById('clock').innerHTML=timestring;
   if(refreshonthe>=0){
		if(mydate.getMinutes()==refreshonthe && mydate.getSeconds()==0){var newdate=new Date(mydate);newdate.setMinutes(newdate.getMinutes() + (60 - offsetminutes));Init(hours,newdate.getHours(),newdate.getDate(),newdate.getMonth()+1,newdate.getFullYear());}
   }
}
window.onload=function(){
   setInterval("displaytime()", 1000);
}
/*END clock stuff */

/*show_hide toggles an html div. Second parameter is optional (True or False)*/
/*Code by Ivan Georgiev at http://devcorner.georgievi.net/articles/javascript/javascriptshowhide/ */
function show_hide(id, show) {
        if (el = document.getElementById(id)) {
                if (null==show) show = el.style.display=='none';
                el.style.display = (show ? '' : 'none');
        }
}
/*END SHOW_HIDE*/

/*COOKIE HANDLERS*/
function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
/*END COOKIE HANDLERS*/

function FastDatePicker() {
	/* Fast Date Picker 0.02 (http://fastdatepicker.sourceforge.net/)

	Copyright (c) 2005-2006, Jonas Koch Bentzen
	All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

		* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
		* Neither the name of the product nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	_______________________________________________________________________________________________
	// Default settings (see the above example on how to change them):

	/* The name of your own function or method which is called whenever a user selects a
	date. The name should not be quoted or followed by "()". */
	this.handleSelection = handleSelection

	/* Set this to true if you want the first day displayed to be Sunday. Set it to false
	if you want the first day displayed to be Monday. */
	this.weekStartsWithSunday = true

	/* If you want emphasize some of the week days (e.g. Saturday and Sunday), write the
	number of those days here as an array literal. 0 = Sunday, 1 = Monday, etc. */
	this.emphasizedDaysOfWeek = [0, 6]

	/* Set this to true or false depending on whether you want the current date to be
	highlighted. */
	this.highlightToday = true

	/* By default, the calendar will open with the month and year contained in this Date
	object. */
	this.date = new Date()

	/* If you want the users to be able to select all dates (even dates in the past), set
	this to null. If the users should only be allowed to select dates from a certain date
	onwards, set this to a Date object representing the first selectable date. This date
	and all future dates will then be selectable. */
	this.firstSelectableDate = new Date()

	// The names (or abbreviations) of the months in your language.
	this.monthNames = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')

	/* The names (or abbreviations) of the days of week in your language. Start with
	Sunday - even if you have set this.weekStartsWithSunday to false. */
	this.daysOfWeek = new Array('S', 'M', 'T', 'W', 'T', 'F', 'S')



	// Private variables - don't change these:

	this.CSSSelectorPrefix = 'fastDatePicker'
	this.tableBody = document.createElement('tbody')
	this.cellYearMonth



	this.isLeapYear = function(year) {
		return (year % 4 == 0 && !(year % 100 == 0 && year % 400 != 0))
	}



	this.numDaysInMonth = function() {
		switch (this.date.getMonth()) {
			case 1: // February
				return (this.isLeapYear(this.date.getFullYear())) ? 29 : 28
			case 3: // April
			case 5: // June
			case 8: // September
			case 10: // November
				return 30
			default:
				return 31
		}
	}



	this.deleteDays = function() {
		for (var i = 7; i >= 2; i--) {
			this.tableBody.removeChild(this.tableBody.lastChild)
		}
	}



	this.previousMonth = function(event) {
		var calendarObject = (event) ? event.target.calendarObject : window.event.srcElement.calendarObject
		var currentMonth = calendarObject.date.getMonth()

		calendarObject.date.setDate(1)

		if (currentMonth == 0) {
			calendarObject.date.setFullYear(calendarObject.date.getFullYear() - 1, 11)
		}
		else {
			calendarObject.date.setMonth(currentMonth - 1)
		}

		calendarObject.deleteDays()
		calendarObject.renderDays()
	}



	this.nextMonth = function(event) {
		var calendarObject = (event) ? event.target.calendarObject : window.event.srcElement.calendarObject
		var currentMonth = calendarObject.date.getMonth()

		calendarObject.date.setDate(1)

		if (currentMonth == 11) {
			calendarObject.date.setFullYear(calendarObject.date.getFullYear() + 1, 0)
		}
		else {
			calendarObject.date.setMonth(currentMonth + 1)
		}

		calendarObject.deleteDays()
		calendarObject.renderDays()
	}



	this.selectDay = function(event) {
		var callingElement = (event) ? event.target : window.event.srcElement

		callingElement.calendarObject.date.setDate(callingElement.firstChild.nodeValue)

		callingElement.calendarObject.handleSelection()
	}



	this.renderHead = function() {
		var row, cell, key

		// Month selection row:

		row = document.createElement('tr')
		row.id = this.CSSSelectorPrefix+'RowYearMonth'

		cell = document.createElement('td')
		cell.className = this.CSSSelectorPrefix+'SelectableElement'
		cell.calendarObject = this
		try {
			cell.addEventListener('click', this.previousMonth, false)
		}
		catch (exception) {
			cell.onclick = this.previousMonth
		}
		cell.appendChild(document.createTextNode('<'))
		row.appendChild(cell)

		this.cellYearMonth = document.createElement('td')
		this.cellYearMonth.id = this.CSSSelectorPrefix+'CellYearMonth'
		this.cellYearMonth.colSpan = 5
		this.cellYearMonth.appendChild(document.createTextNode(''))
		row.appendChild(this.cellYearMonth)

		cell = document.createElement('td')
		cell.className = this.CSSSelectorPrefix+'SelectableElement'
		cell.calendarObject = this
		try {
			cell.addEventListener('click', this.nextMonth, false)
		}
		catch (exception) {
			cell.onclick = this.nextMonth
		}
		cell.appendChild(document.createTextNode('>'))
		row.appendChild(cell)

		this.tableBody.appendChild(row)



		// Days of the week:

		row = document.createElement('tr')
		row.id = this.CSSSelectorPrefix+'RowDaysOfWeek'

		for (var i = 0; i < 7; i++) {
			if (this.weekStartsWithSunday) {
				key = i
			}
			else {
				key = (i == 6) ? 0 : i + 1
			}

			cell = document.createElement('td')
			for (var j = 0; j < this.emphasizedDaysOfWeek.length; j++) {
				if (this.emphasizedDaysOfWeek[j] == key) {
					cell.className = this.CSSSelectorPrefix+'EmphasizedDaysOfWeek'
				}
			}
			cell.appendChild(document.createTextNode(this.daysOfWeek[key]))
			row.appendChild(cell)
		}

		this.tableBody.appendChild(row)
	}



	this.renderDays = function() {
		var row, cell
		var numDaysInMonth = this.numDaysInMonth()
		var dayCounter = 1

		this.cellYearMonth.firstChild.nodeValue = this.monthNames[this.date.getMonth()]+' '+this.date.getFullYear()

		var start = this.date.getDay()
		if (!this.weekStartsWithSunday) start = (start == 0) ? 6 : start - 1

		if (this.highlightToday) {
			var date = new Date()

			if (this.date.getFullYear() == date.getFullYear() && this.date.getMonth() == date.getMonth()) {
				var today = date.getDate()
			}
		}

		for (var i = 0; i < 42; i++) {
			if (i % 7 == 0) row = document.createElement('tr')

			cell = document.createElement('td')

			if (i >= start && dayCounter <= numDaysInMonth) {
				this.date.setDate(dayCounter)

				if (today && dayCounter == today) cell.id = this.CSSSelectorPrefix+'CellToday'

				cell.appendChild(document.createTextNode(dayCounter))

				if (!this.firstSelectableDate || this.date.getTime() >= this.firstSelectableDate) {
					cell.className = this.CSSSelectorPrefix+'SelectableElement'
					cell.calendarObject = this
					try {
						cell.addEventListener('click', this.selectDay, false)
					}
					catch (exception) {
						cell.onclick = this.selectDay
					}
				}
				else {
					cell.className = this.CSSSelectorPrefix+'NonSelectableElement'
				}

				dayCounter++
			}
			else {
				/* Adding a non-breaking space in order to make sure that the
				cell is as high as those cells that have content: */
				cell.appendChild(document.createTextNode(String.fromCharCode(160)))
			}

			row.appendChild(cell)
			if (i % 7 == 0) this.tableBody.appendChild(row)
		}
	}



	this.calendar = function() {
		this.date.setDate(1)

		if (this.firstSelectableDate) {
			this.firstSelectableDate.setHours(0, 0, 0, 0)
			this.firstSelectableDate = this.firstSelectableDate.getTime()
		}

		var table = document.createElement('table')
		table.id = this.CSSSelectorPrefix+'Table'

		this.renderHead()

		this.renderDays()

		table.appendChild(this.tableBody)

		return table
	}
}
/*END FASTDATEPICKER*/

/*This function fills in the autosize field when the checkbox is checked, and enables it when unchecked*/
function sizeform(){
		if (document.getElementById('autosize').checked) {
			document.getElementById('tablewidth').disabled=true;
			document.getElementById('tablewidth').value=(350+(document.getElementById('hours').selectedIndex  * 150));
			var v=Number(document.getElementById('tablewidth').value); createCookie('tablewidth',v,365);
		} else {
			document.getElementById('tablewidth').disabled=false;
		}
}
/*END SIZEFORM*/

function checkNumeric(objName,minval, maxval)
<!-- http://www.shiningstar.net -->
{
	var numberfield = objName;
	if (chkNumeric(objName,minval,maxval) == false)
	{
		numberfield.select();
		numberfield.focus();
		return false;
	}
	else
	{
		return true;
	}
}

/*CHECKNUMERIC functions to validate numeric form fields*/
function chkNumeric(objName,minval,maxval)
{
var checkOK = "0123456789";
var checkStr = objName;
var allValid = true;
var decPoints = 0;
var allNum = "";

for (i = 0;  i < checkStr.value.length;  i++)
{
ch = checkStr.value.charAt(i);
for (j = 0;  j < checkOK.length;  j++)
if (ch == checkOK.charAt(j))
break;
if (j == checkOK.length)
{
allValid = false;
break;
}
if (ch != ",")
allNum += ch;
}
if (!allValid)
{	
alertsay = "Please enter only these values \""
alertsay = alertsay + checkOK + "\" in the \"" + checkStr.name + "\" field."
alert(alertsay);
return (false);
}

// set the minimum and maximum
var chkVal = allNum;
var prsVal = parseInt(allNum);
if (chkVal != "" && !(prsVal >= minval && prsVal <= maxval))
{
alertsay = "Please enter a value greater than or "
alertsay = alertsay + "equal to \"" + minval + "\" and less than or "
alertsay = alertsay + "equal to \"" + maxval + "\" in the \"" + checkStr.name + "\" field."
alert(alertsay);
return (false);
}
}
/*END CHECKNUMERIC*/

/*selectOption - utility for choosing an option in a select box based on value rather than index*/
function selectOption(value, options) {
	for (var i = 0; i < options.length; i++) {
		if (options[i].value == value) options[i].selected = true
	}
}
/*END SELECTOPTION*/

/*getObject and and moveObject used for positioning popup calendar and preferences relative to mouse*/
function getObject( obj ) {

  // step 1
  if ( document.getElementById ) {
    obj = document.getElementById( obj );

  // step 2
  } else if ( document.all ) {
    obj = document.all.item( obj );

  //step 3
  } else {
    obj = null;
  }

  //step 4
  return obj;
  }
function moveObject( obj, e ) {

  // step 1
  var tempX = 0;
  var tempY = 0;
  var offsetY = 5;
  var offsetX = 5;
  var objHolder = obj;

  // step 2
  obj = getObject( obj );
  if (obj==null) return;

  // step 3
  if (document.all) {
    tempX = event.clientX + document.body.scrollLeft;
    tempY = event.clientY + document.body.scrollTop;
  } else {
    tempX = e.pageX;
    tempY = e.pageY;
  }

  // step 4
  if (tempX < 0){tempX = 0}
  if (tempY < 0){tempY = 0}

  // step 5
  obj.style.top  = (tempY + offsetY) + 'px';
  obj.style.left = (tempX + offsetX) + 'px';

  // step 6
  show_hide(objHolder);
  }
/*END POSITIONING SCRIPTS*/

/*these two scripts fill in the month and year selection boxes*/
function populateYearSelectionBox() {
	var date = new Date()
	var thisYear = date.getFullYear()
	var option

	for (var i = thisYear-2; i <= thisYear + 10; i++) {
		option = document.createElement('option')
		option.value = i
		option.appendChild(document.createTextNode(i))

		document.getElementById('year').appendChild(option)
	}
}
function populateMonthSelectionBox(){
var option;
for(var i = 0; i<12; i++) {
	option = document.createElement('option')
	option.value = i;
	option.appendChild(document.createTextNode(monthnames[i]));
	document.getElementById('month').appendChild(option);
}
}
/*END YEAR-MONTH SELECTION*/

function switchtab(tabelement,fieldsetelement,on){
	if(on){
	show_hide(fieldsetelement,true);
	document.getElementById('prefiframe').style.width=document.getElementById('menu').offsetWidth;
	document.getElementById('prefiframe').style.height=document.getElementById('menu').offsetHeight;
	document.getElementById(tabelement).style.backgroundColor='#fff';
	document.getElementById(tabelement).style.color='#000';
	document.getElementById(tabelement).style.borderBottom='1px solid #fff';
	}
	else{
	show_hide(fieldsetelement,false);
	document.getElementById('prefiframe').style.width=document.getElementById('menu').offsetWidth;
	document.getElementById('prefiframe').style.height=document.getElementById('menu').offsetHeight;
	document.getElementById(tabelement).style.backgroundColor='#f3f3f3';
	document.getElementById(tabelement).style.color='#666';
	document.getElementById(tabelement).style.borderBottom='1px solid #ccc';
	}
	document.getElementById('prefiframe').style.width=document.getElementById('menu').offsetWidth;document.getElementById('prefiframe').style.height=document.getElementById('menu').offsetHeight;
}