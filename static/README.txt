XSLTv is a grid viewing program for XMLTV data files. It requires only an xmltv data file and a modern browser. All processing is completely client-side, resulting in a very simple installation, but a performance hit.
XSLTv is by Eric Lofgren. http://www.ericandchar.com/xsltvgrid
Features:

	* No complex installation - it could run off of your windows desktop.
	* Everything controlled by stylesheets - css files mimicking seven common web-based tv listings grids are included.
	* DHTML popups show more information about shows (i.e. description, rating and original airdate or release year)
	* Supports xmltv channel icons.
	* Cross-browser: Tested on Firefox 1.0.7, 1.5.0.1, IE6 and IE7. (This program uses features which Safari does not support, namely XSLT.)
	* Preferences allow changing grid width and number of columns.
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Simple install:
Extract. Add an xmltv file titled tv.xml to the same directory. Open tv.html in a browser.

Upgrade instructions:
Extract the new archive into the old directory, overwriting everything. Refresh.

More info:
1. Get XMLTV installed and working. (http://xmltv.org/wiki/)
2. Drop all the files into a directory on your webserver. Note: This software does not require a webserver; it works perfectly from a directory on a windows machine.
3a. Put a current xmltv file (which must be titled tv.xml) in the same directory. I use a cron job to automate this. This requires permissions on the tv.xml file to overwrite it each time (see the bashscripts directory for more information. The smaller the xml file, the quicker this will run; sorting seems to help with speed, but is not required.
3b. Put current xmltv files titled with the date of the listings (YYYYMMDD.xml) in the same directory. Do this with a command like this: tv_split --output %Y%m%d.xml tv.xml
4. Load tv.html in a webbrowser. Note: This file (and only this file) may be freely renamed (e.g. to index.html).

Problems:
Some browsers restrict xmlhttprequests on local files, which gets in the way when using XSLTv in a local directory. (Not a problem on webservers.)
In Opera, go to opera:config, search for "xmlhttp" and check the box by "Allow File XMLHttpRequest". THIS IS A SECURITY RISK.
In Chrome, run chrome.exe with the command-line parameter "--disable-web-security". THIS IS A SECURITY RISK.

* Optionally, put your icons directory (which should be called "icons" and should contain the images referenced in the xml tree) in the web tree. In North America, obtain icons with tv_grab_na_icons; subsequent tv_grab_na_dd calls will add the necessary references to your xml file. Note: Where I live, several icons are .gif files with a .jpg extension. Don't correct them. The links in the xml are to the .jpg extension, and the browser will display it anyhow. 
* Optionally, if you are installing XSLTv on a webserver with SSI, change the filename to tv.shtml, and the server time will be used instead of the client time.
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Options: (this hasn't been updated for a few versions)

Grid
----
1. Display hours: How many hours to display, 1-9. Default is 4.
2. Automatic table size: When checked, XSLTv will automatically select a table width appropriate to the number of hours to be displayed. Default is checked.
3. Table width: When (2) is not checked, you may specify a table width in pixels. This must be an integer between 1 and 9999. With the included stylesheets, the minimum is actually around 200px. Default is 800.
4. Start with next hour after: XSLTv can automatically skip to the next hour if you load it after a certain time. Thus, if this option is set to :45, and the page is loaded at 10:50, the grid will start at 11:00 instead of 10:00. Default is :00, which means the current time is simply truncated (if the page is loaded at 10:59, the listings grid will still start at 10:00).

Popups
------
5.	Channel popups: Deselect to disable the popups that appear when hovering over the channel headings. Default is checked.
6.	Description popups: Deselect to disable the popups that appear when hovering over the programs. This can result in a small performance improvement. Default is checked.
7.	Popup delay: Millisecond delay before popups (both kinds) appear. Must be an integer between 0 and 9999 (0 to 9.999 seconds). Default is 0.
8-14.	These options enable/disable all the contents of the program popup. Default is all enabled.

Local Options
-------------
15.	Language: Select a language for the interface. Visit the forum at http://www.ericandchar.com/bb to help improve the translations.
16.	Fix gaps in listings: Select this option if your listings file has gaps between programs, causing the display to look bad. To use this option you must first sort your xml file with the --by-channel option. Default is unchecked.
17.	Absolute icon references: By default, XSLTv looks for icons in a ./icons directory (no matter what is actually listed as the directory - XSLTv strips off all but the file name). By checking this box, XLSTv will treat the icon reference as a URL instead. Default is unchecked.
18.	Display day first in dates: Select to switch to dd/mm/yyyy. Deselect to display dates as mm/dd/yyyy. Default is unchecked. This field will automatically be filled when selecting a grabber, but may be changed.
19.	Grabber: Select the grabber you are using. This currently affects how the channels are labeled, the language of the months dropdown menu, and the sort order of channels. If your grabber isn't included, it may be similar to one of the ones that is. Request your grabber be added at www.ericandchar.com/xsltvgrid

Other Options
-------------
20.	On Click: Select what happens when clicking on programs. Currently, choices are 'do nothing,' "Search IMDB" (for the title), or "URL in XML" (which is especially useful if you use tv_imdb)
21.	Highlight linked programs: If you are using the "URL in XML" option above, you may want to highlight clickable programs somehow. Checking this box changes the font color for clickable programs.
22.	Highlight movies rated at or over: Select a number to highlight (with a brighter background color) movies with a high star rating. Select "All" to highlight all movies (which still works if you disable the next option).
23.	Category Highlighting: Uncheck to disable the colors applied to News/Sports/Movies, etc. The movies highlighted by the previous option are not affected.
24.	Highlight new shows: If a show's date is today, it will be given a darker border. This is nice for avoiding reruns.
25.	Show movie release dates: Add the release date of movies in parentheses in the grid.
26.	Use daily files: Check to use step 3b above instead of step 3a - search for a YYYYMMDD.xml file instead of tv.xml. The file will only be reloaded if moving to a new day.
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
This software is published under the U of I/NCSA open source license.
Copyright 2006-2007 Eric Lofgren
