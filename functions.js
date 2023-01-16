// functions.js
// this file contains most of the javascript functions needed to run UniView
// all of the language specific text is in functions-text.js
// © Richard Ishida

// constants for U array record fields
//const HEX_NUM = 0 // hex number
const CHAR_NAME = 0 // character name
const GEN_CAT = 1 // general category
const CAN_COMB_CL = 2 // canonical combining class
const BIDI_CAT = 3 // bidi category
const DECOMP_MAP = 4 // decomposition mapping
const UC_MAP = 5 // uppercase mapping
const LC_MAP = 6 // lowercase mapping
const TC_MAP = 7 // titlecase mapping
//const BETA = 15 // beta indicator
//const GRAPHIC_FIELD = 16; // where graphic information is found
const AGE_FIELD = 8; // where Unicode version is found
const SUBTITLE_FIELD = 9; // where subtitle reference is found
const DEC_DIG_VALUE = 10 // decimal digit value
const DIG_VALUE = 11 // digit value
const NUMERIC_VALUE = 12 // numeric value
const UNICODE_1_NAME = 13 // Unicode 1 name
const ISO_COMMENT = 14 // ISO 10646 comment


// character types
const NONCHARACTER = 0   // unrecognised code point
const UNASSIGNED = 1  // unassigned code point inside a defined block
const IN_U_DB = 2 // a character in the u.js database
const HAN_HANG_TANG = 3 // Han, Hangul, or Tangut character
const SURROGATE = 4  // a surrogate code point
const PRIVATEUSE = 5 // a private use character



// Global variables
var _notesArray = []
var _newNotesArray = false;
var _currentFont = _defaultFont;
var _lastOperation = ''; // used for switching between graphics and lists etc to refresh the left panel
if (document.all) { var IE = 'true'; }
var _tempList = false; // true if results of search or c&p displayed (for font change)
var _IE = false;
var _notesLoaded = false;
var databaseAvailable = true;
//var desc = new Array;
var _selections = []
var _newCodepoint;
var _newCharacterList;
var _newContent, _resultdiv, _counter;
var _copy2Picker = false; // determines whether characters clicked on are copied to the character area
var _border = '1px solid #eee';

const CSHELP = '<img src="images/cshelp.png" class="cshelp" alt="Context-sensitive help" />';
var _displayStyle = 'matrix'; // initial format of a unicode range, possible values are 'list' or 'matrix'
var _showNumbers = true; // initial presence or absence of hex numbering around a matrix
var _utf8 = false; // default way of showing characters
var unassignedChar = '#f2f2f2';// background colour for unassigned characters in the matrix
var unassignedFiltered = '#f2f2f2';// background colour for unassigned characters after a filter has been applied in the matrix
var filterHighlight = '#F9F5DE';// background colour of characters highlighted using a filter in the matrix
var _defaultFont = "";
var _casefield = ''; // used for ajax parameter when converting case
var _charScriptGroup = "Latin"; // records the unicode block of the character in the right panel
var _block = ''; // remembers which block was displayed
var _showNotes = false  // determines whether or not to display notes for individual characters



function togglePanelDestination () {
	var buttons
	if(_copy2Picker) { 
		document.getElementById('clickto').src='images/clicktopanel.png'
		document.getElementById('cpAreaToggle').style.backgroundColor='#EDE4D0'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#a52a2a'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (var i=0;i<buttons.length;i++)  buttons[i].style.color = 'white'
			}
		_copy2Picker=false
		} 
	else{ 
		document.getElementById('clickto').src='images/clicktocparea.png'
		document.getElementById('cpAreaToggle').style.backgroundColor='#a52a2a'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#EDE4D0'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (i=0;i<buttons.length;i++)  buttons[i].style.color = '#666'
			}
		_copy2Picker=true
		}
	}

function adjacentChar (codepoint, direction) {
	// output: shows the next or previous character in the database in the details panel
	// codepoint: integer, the decimal Unicode scalar value of the character currently displayed
	// direction: integer, either 1 or -1
	
	while (codepoint !== 0 && codepoint !== U.length) {
		codepoint += direction
        var charType = getCharType(codepoint)
		if (charType === IN_U_DB || charType === HAN_HANG_TANG) { break }
		}
	printProperties(codepoint)
	}


function addLine (codepoint, newContent) { 
	// Displays one line in a list of characters in the left panel
	// codepoint: the dec codepoint for the character to display
	// newContent: the node to which to add this line (typically a new node)
    // calls to decodeunicode images have been removed
    var img, span
	var cRecord = getDataFor(codepoint).split(';')
    var cpHex = codepoint.toString(16).toUpperCase()
    while (cpHex.length < 4) cpHex = '0'+cpHex
	var uplus = ''
	if (document.getElementById('uPlusToggle').checked) { uplus = 'U+' }

    // set up the div for the line
	var div = newContent.appendChild( document.createElement( 'div' ))
		setOnclick( codepoint, div )
		div.title = 'Hex: '+codepoint.toString(16).toUpperCase()+' Dec: '+codepoint
		if (cRecord[CHAR_NAME].indexOf('Unassigned') > -1) { 
			div.className = 'empty'
			}
		else { div.className = 'ch' }

    // if the charType is IN_U_DB, there is a graphic
    // if HAN_HANG_TANG, there is a character but no graphic
    var charType = getCharType(codepoint)

    // add character if listC1 is checked in options
	if (document.getElementById('listC1').checked) { 
		if (charType > 1 && charType < 4) { 
			if (document.getElementById('graphicsToggle').checked === false || charType === 3) {
				span = div.appendChild( document.createElement( 'span' ))
				span.className = 'chSpan'
				span.appendChild( document.createTextNode( getCharFromInt(codepoint) ))
				}
			else { 
				img = div.appendChild( document.createElement( 'img' ))
                scriptGroup = findScriptGroup(codepoint)
                img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/'+cpHex+'.png' 
                }
			}
		}

	if (document.getElementById('listN').checked) { 
		div.appendChild( document.createTextNode( '\u00A0\u200E'+uplus+cpHex ))
		}
        
	if (document.getElementById('listC2').checked) { 
		if (charType > 1 && charType < 4) { 
			if (document.getElementById('graphicsToggle').checked === false || charType === 3) {
				span = div.appendChild( document.createElement( 'span' ))
				span.className = 'chSpan'
				span.appendChild( document.createTextNode( getCharFromInt(codepoint) ))
				}
			else { 
				img = div.appendChild( document.createElement( 'img' ))
                scriptGroup = findScriptGroup(codepoint)
                img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/'+cpHex+'.png' 
                }
			}
		}

    if (document.getElementById('listNm').checked) { 
		div.appendChild( document.createTextNode( ' '+cRecord[CHAR_NAME] ))
		}
    return false
	}
	

function addtocharSelect ( codepoint ) {
	// adds a character to the text area, regardless of whether the up arrow is highlighted
	// codepoint: integer, the decimal Unicode codepoint to be added
	var field = document.getElementById( 'picker' )
	field.value += getCharFromInt(codepoint)
	}


function addtoPicker (codepoint) { 
	// codepoint: dec integer, the character to be added
	// _cluster: boolean, global variable, set if this is a consonant cluster (used for vowels that surround base)
	// _view: string, indicates which view is showing - this is important, since non-intelligent ordering is needed in the default view
	
//	if (! _copy2Picker) { return; }
	var outputNode = document.getElementById( 'picker' ); // points to the output text area
	var ch = getCharFromInt(codepoint);
	
	//IE support
	if (document.all) { 
		outputNode.value = outputNode.value+ch;
		//outputNode.focus();
	    //range = document.selection.createRange();
		
		//range.text = ch; 
	    //range.select(); 
		//outputNode.focus();
		}
	// Mozilla and Safari support
	else if (outputNode.selectionStart || outputNode.selectionStart == '0') {
		var startPos = outputNode.selectionStart;
		var endPos = outputNode.selectionEnd;
		var cursorPos = startPos;
		var scrollTop = outputNode.scrollTop;
		var baselength = 0;
		
		outputNode.value = outputNode.value.substring(0, startPos)
              + ch
              + outputNode.value.substring(endPos, outputNode.value.length);
		cursorPos += ch.length;

		//outputNode.focus();
		outputNode.selectionStart = cursorPos;
		outputNode.selectionEnd = cursorPos;
		outputNode.scrollTop = scrollTop;
		}
	else {
		outputNode.value += ch;
		//outputNode.focus();
		}
	}
	
function isMatrix () {
	// returns true if the left panel contains a matrix, else false
	nodeArray = document.getElementById('chart').getElementsByTagName("td")
	if (nodeArray.length > 0) { return true }
	else { return false }
	}


function changeFont (fontName) {
	// changes the font used for character display
	// fontName: string, the name of the font to apply
	// _defaultFont: string, set in prefs.js
	// _currentFont: string, allows changes to persist
	
	//deal with accidents or resets
	if (fontName == sApplyFont || fontName == '') {
		document.getElementById('chFont').value = _defaultFont;
		_currentFont = _defaultFont;
		}
	else { _currentFont = fontName; }
		
	// make the changes
	var leftpanel = document.getElementById('chart');
	
	if ( isMatrix() ) {
		nodeArray = leftpanel.getElementsByTagName("td");
		for (var i=0; i < nodeArray.length; i++) { 
			if (nodeArray[i].className != 'hexNum') {
				nodeArray[i].style.fontFamily = _currentFont;
				}
	    	}
	   }
		
	else { nodeArray = leftpanel.getElementsByTagName('span') 
		for (var i=0; i < nodeArray.length; i++) { 
			if (nodeArray[i].className == 'chSpan') {
				nodeArray[i].style.fontFamily = _currentFont; 
				}
	    	}
		} 
		
	if ( document.getElementById('largeChar')) {
		document.getElementById('largeChar').style.fontFamily = _currentFont;
		}
 	}

	
function changeFontSize (size) {
	var leftpanel = document.getElementById('chart');
	
	if ( (_lastOperation == "range" || _lastOperation == "customrange") 
		&& !(document.getElementById('listMatrixToggle').checked) ) {
		nodeArray = leftpanel.getElementsByTagName("td");
		for (var i=0; i < nodeArray.length; i++) { 
			if (nodeArray[i].className != 'hexNum') {
				nodeArray[i].style.fontSize = size;
				}
	    	}
	   }
		
	else { nodeArray = leftpanel.getElementsByTagName('span'); 
		for (var i=0; i < nodeArray.length; i++) { 
			if (nodeArray[i].className.match(/ch/)) {
				nodeArray[i].style.fontSize = size; 
				}
	    	}
		}  
	}
	
	
function changeHeight ( height ) { 
	// changes the height of the visible text in the left panel by user request
	// height: user specified height (including px, etc.)
	var panel = document.getElementById( 'listOutput' );
	panel.style.height = height;
	}

	
function clearHighlighting () {
	// removes any highlighting from the left panel

    var nodeArray = document.getElementById('chart').querySelectorAll('.ch')
	// clear out any existing highlighting
	for (var i=0; i < nodeArray.length; i++) { 
		nodeArray[i].classList.remove('dim','c1-1','c2-0','c2-1','c3-0','c3-1','c3-2','c4-0','c4-1','c5-0','c5-1','c5-2','c6-0','c6-1','c6-2','c6-3','c7-0','c8-0','c9-0','c10-0','c11-0','c12-0','c13-0','c14-0','c15-0')
	    }
	}

function clearInputFields ( ) {
	// clears the cut & paste and codepoint fields
	//var field = document.getElementById( 'charSelect' );
	//field.value = '';
	field = document.getElementById( 'charNum' );
	field.value = '';
	field.focus();
	}


function clearMainInput ( ) {
        // clears the main input field in UniView lite
        document.getElementById( 'maininput' ).value = '';
        document.getElementById( 'maininput' ).focus();
        }


function convertChar2CP ( textString ) { 
	var haut = 0;
	var n = 0;
	var CPstring = '';
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			CPstring += 'Error in convertChar2CP: byte out of range ' + dec2hex(b) + '!';
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) {
				CPstring += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
				haut = 0;
				continue;
				}
			else {
				CPstring += 'Error in convertChar2CP: surrogate out of range ' + dec2hex(haut) + '!';
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b;
			}
		else {
			CPstring += dec2hex(b) + ' ';
			}
		}
	return CPstring.substring(0, CPstring.length-1);
	}


function convertChar2Dec ( textString ) { 
	// converts one or more characters in a string to a sequence of decimal code point numbers, separated by spaces
	var haut = 0;
	var n = 0;
	CPstring = '';
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			CPstring += 'Error ' + dec2hex(b) + '!';
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) {
				CPstring += 0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00) + ' ';
				haut = 0;
				continue;
				}
			else {
				CPstring += '!erreur ' + haut + '!';
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b;
			}
		else {
			CPstring += b + ' ';
			}
		}
	CPstring = CPstring.substring(0, CPstring.length-1);
	return CPstring;
	}


function convertCP2Char ( textString ) {
	var outputString = ''
	textString = textString.replace(/^\s+/, '')
	if (textString.length == 0) return ""

	textString = textString.replace(/\s+/g, ' ')
	var listArray = textString.split(' ')
	for ( var i = 0; i < listArray.length; i++ ) {
		var n = parseInt(listArray[i], 16)
		if (n <= 0xFFFF) outputString += String.fromCharCode(n)
		else if (n <= 0x10FFFF) {
			n -= 0x10000
			outputString += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF))
			} 
		else outputString += 'convertCP2Char error: Code point out of range: '+dec2hex(n)
		}
	return( outputString )
	}


function convertDec2CP ( textString ) {
	CPstring = '';
	var outputString = '';
	textString = textString.replace(/^\s+/, '');
	if (textString.length == 0) { return ""; }
	textString = textString.replace(/\s+/g, ' ');
	var listArray = textString.split(' ');
	for (var i = 0; i < listArray.length; i++) {
		if (i > 0) { outputString += ' ';}
		var n = parseInt(listArray[i], 10);
		outputString += dec2hex(n);
		}
	return outputString;
	}


function createList (formField) {
	// output: a list of characters for a range given by formField displayed in the left panel
	// formField: a string of the form 'XXXX:YYYY' indicating a range of characters in hex notation
	
	_tempList = false;
	var HexURange = formField.split(':');
	var start = parseInt( HexURange[0], 16 );
	var end = parseInt( HexURange[1], 16 );
	var subtitle; 
	
	var listDiv = document.getElementById( 'listOutput' );
	var oldContent = document.getElementById('chart');

	var newContent = document.createElement( 'div' );
		newContent.className = 'charList';
		newContent.id = 'chart';
	
	var prevSubtitle = '';
	for (i=start; i<=end; i++) {
        var charType = getCharType(i)
		if (charType > UNASSIGNED) {
			var cRecord = getDataFor(i).split(';')
			currSubtitle = cRecord[SUBTITLE_FIELD]
			if ( currSubtitle !== '' && currSubtitle !== prevSubtitle ) {
				subtitle = document.createElement('div')
				subtitle.className = 'subcat'
				subtitle.appendChild(document.createTextNode(st[cRecord[SUBTITLE_FIELD]]))
				newContent.appendChild(subtitle)
				prevSubtitle = currSubtitle
				}
			used = addLine( i, newContent )
			}
		} 
	var removedNode = listDiv.replaceChild( newContent, oldContent )
	}


function createMatrix ( formField ) { 
	// output: a grid format list of characters in the left panel
	// formField: a string of the form 'XXXX:YYYY' indicating a range of characters in hex notation
    // calls for decodeunicode images have been removed
	var table, tbody, tr, td, img
	var cRecord
	_tempList = false

	var listDiv = document.getElementById( 'listOutput' )
	var oldtable = document.getElementById('chart')

	table = document.createElement( 'table' )
		table.className = 'chartChar'
		table.id = 'chart'
	tbody = table.appendChild( document.createElement( 'tbody' ))

	var cCell = 0;
	var HexURange = formField.split(':')
	var remainder = 0

	// adjust start and end points to multiples of 16
	var start = parseInt(HexURange[0], 16)
	var rangestart = start
	remainder = start%16
	if (remainder > 0) { start -= remainder } 

	var end = parseInt(HexURange[1], 16)
	var rangeend = end
	remainder = end%16
	if (remainder > 0) { end += (15-remainder) } 


	// work out what the range is
	var cols = Math.ceil((end-start+1)/16)
	var character = ''
	var totalCodes = cols*16
	var notFound = true
	var showNumbers = true
    if (document.getElementById('hideNumbers').checked) { showNumbers = false }

	for (i=-1; i<16; i++) {
		tr = tbody.appendChild( document.createElement( 'tr' ))
		
		// Create number column
		td = tr.appendChild( document.createElement( 'td' ))
			td.className = 'hexNum'
		if (showNumbers && i>-1) {
			td.appendChild( document.createTextNode( i.toString(16).toUpperCase() ))
			}
		else { td.appendChild( document.createTextNode( '\u00A0' )) }
		
		for (j=0; j<cols; j++) {
			cCell = start+i+(j*16)
			charType = getCharType(cCell)
				
			// if first row, add numbers or blanks
			if (i === -1) { 
				td = tr.appendChild( document.createElement( 'td' ))
				td.className = 'hexNum'
				if (showNumbers) {
					var numStr = (cCell+1).toString(16).toUpperCase()
					td.appendChild( document.createTextNode( numStr.slice(0,numStr.length-1) ))
					}
				else { td.appendChild( document.createTextNode( '\u00A0' )) }
				}
				
			// otherwise, add character info
			else {  
				hexNum = cCell.toString(16).toUpperCase()
				td = tr.appendChild( document.createElement( 'td' ))
					td.title = 'Hex: '+cCell.toString(16).toUpperCase()+' Dec: '+cCell
					setOnclick( cCell, td )
					setMouseover( cCell, td )
					setMouseout( td )
					td.className = 'ch'
                
                // not a character or unassigned character
				if (charType < 2) {
                    td.classList.add('empty')
                    }
                
                // character has image and images required
				if (charType === IN_U_DB) {
                    if (document.getElementById('graphicsToggle').checked === true) {
                        while( hexNum.length < 4 ) hexNum = '0' + hexNum
                        img = td.appendChild( document.createElement( 'img' ))
                        cRecord = U[cCell].split(';')
                        scriptGroup = findScriptGroup(cCell)
                        img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/'+hexNum+'.png'
                        }
                    else {
                        td.appendChild( document.createTextNode( getCharFromInt(cCell) ))
                        td.classList.add('chSpan')
                        }
                    }
            
                // surrogates
				if (charType === SURROGATE) {
                    td.appendChild( document.createTextNode( 'X' ))              
                    td.classList.add('empty')
                    }
              
                // private use or no image char (eg. CJK)
				if (charType === PRIVATEUSE || charType === HAN_HANG_TANG) {
                    td.appendChild( document.createTextNode( getCharFromInt(cCell) ))              
                    td.classList.add('chSpan')
                    }

                if (cCell<rangestart || cCell>rangeend) { // ie. outside the custom range but in same column
					td.className = 'outofrange';
					}
				}
			}
		}
	var removedNode = listDiv.replaceChild( table, oldtable );

	if (document.getElementById('fontSize')) { document.getElementById('fontSize').value = '100%'; }
	}


function displayUnorderedList ( string ) { 
	// output: a list of the characters contained in string to the left panel, or if a single character, ouputs character details to right panel
	// string: a string of characters

	var dugraphics = false;
	
	_tempList = true;
	var codepoint = 0;
	var listDiv = document.getElementById( 'listOutput' );
	var oldContent = document.getElementById('chart');

	var newContent = document.createElement( 'div' );
		newContent.className = 'charList';
		newContent.id = 'chart';

	for (i=0; i<string.length; i++) {
		codepoint = string.charCodeAt( i ); 
		if (0xD800 <= codepoint && codepoint <= 0xDBFF && i<string.length-1) {
			codepoint = 0x10000 + ((codepoint - 0xD800) << 10) + (string.charCodeAt( i+1 ) - 0xDC00);
			i++; 
			}
				
		var used = addLine( codepoint, newContent );
		if (used) { dugraphics = true; }	
		}
	
	var removedNode = listDiv.replaceChild( newContent, oldContent );
//	if (document.getElementById('graphicsToggle').checked == true) { document.getElementById('ack').style.display = 'block'; }
//	else { document.getElementById('ack').style.display = 'none'; }
	if (dugraphics) { document.getElementById('ack').style.display = 'block'; }
	else { document.getElementById('ack').style.display = 'none'; }

	if (document.getElementById('fontSize')) { document.getElementById('fontSize').value = '100%'; }
	}


function doN11n (form) {
	var str = document.getElementById('picker').value
	if (form == 'nfc') { document.getElementById('picker').value = str.normalize('NFC') }
	else { document.getElementById('picker').value = str.normalize('NFD') }
	alert( 'Edit buffer contents normalized to '+form.toUpperCase() )
	}
	
	
	
function drawPropertyList (newContent, resultdiv, counter) {
	if (counter == 0) { resultdiv.appendChild( document.createTextNode( sNoMatch )); }
	else { 
		var msg  = 'Number of characters matched: '+counter;
		resultdiv.appendChild( document.createTextNode( msg )); 
		}

	var listDiv = document.getElementById( 'listOutput' );
	oldContent = document.getElementById('chart');

		removedNode = listDiv.replaceChild( newContent, oldContent );
	_lastOperation = "listproperties";

	if (document.getElementById('generalCat').value != 'startup') {
		highlightList( 2, document.getElementById('generalCat').value );
		}
	if (document.getElementById('directionality').value != 'startup') {
		highlightList( 4, document.getElementById('directionality').value );
		}
	document.getElementById('fontSize').value = '100%';
	
	if (document.getElementById('graphicsToggle').checked == true) { document.getElementById('ack').style.display = 'block'; }
	else { document.getElementById('ack').style.display = 'none'; }
	}


function drawSearchList (newContent, resultdiv, counter, dugraphics) {
	if (counter == 0) { resultdiv.appendChild( document.createTextNode( sNoMatch )); }
	else { 
		var msg  = 'Number of characters matched: '+counter;
		resultdiv.appendChild( document.createTextNode( msg )); 
		}

	var listDiv = document.getElementById( 'listOutput' );
	var oldContent = document.getElementById('chart');

	removedNode = listDiv.replaceChild( newContent, oldContent );

	if (document.getElementById('fontSize')) { document.getElementById('fontSize').value = '100%'; }
	
//	if (document.getElementById('graphicsToggle').checked == true) { document.getElementById('ack').style.display = 'block'; }
//	else { document.getElementById('ack').style.display = 'none'; }
	if (dugraphics) { document.getElementById('ack').style.display = 'block'; }
	else { document.getElementById('ack').style.display = 'none'; }
	}


function drawSelection (range) {
	if (document.getElementById('listMatrixToggle').checked)
		{ createList(range); }
	else { createMatrix(range); }
	}


function findScriptGroup ( charNum ) { 
	// output: returns the name of the script group in which charNum falls
	// charNum: a decimal number representing the code point of the character in question
	if (charNum < 128) { return 'Basic Latin' }
	var i=1
	while ( i<scriptGroups.length && charNum > scriptGroups[i][0] ) i++
	if ( i === scriptGroups.length ) { return( sNotAChar ) }
	if ( scriptGroups[i-1][1] >= charNum ) { return( scriptGroups[i-1][2]) }
	if ( scriptGroups[i][0] == charNum ) { return( scriptGroups[i][2]) }
	return( sNotAChar )
	}
	
	
function isListShowing () {
	// returns true if the left panel contains a list, false if a matrix
	// if there is nothing in the left panel, it checks Show range as List
	var tableRows = document.getElementById('chart').getElementsByTagName("tr");
	if (tableRows.length > 0) { return true; }// it's a table
	else { return false; }
	}



function findString ( searchString ) { 
	// effect: if local is set, highlights characters in left panel that match searchString, otherwise, outputs a list of characters in the left panel 
	// searchString: a string of text to search for in the database, can have regular expression syntax
	console.log('searchString', searchString)
	
	// if the Find box is empty or just white space and local is not selected, just quit
	searchString = searchString.replace(/\s+/g, ' ');
	searchString = searchString.replace(/^\s+/, '');
	searchString = searchString.replace(/\s+$/, '');
	if (searchString == '' && ! document.getElementById('localSearch').checked) { return; }
	console.log('searchString', searchString)

	// if the Local checkbox is ticked, make a copy of whats in the left panel
	// do this now, before the panel is cleared for 'searching...' message
	if (document.getElementById('localSearch').checked) { 
		var nodeArray = new Array;
		var leftpanel = document.getElementById('chart');
		if (isListShowing()) { nodeArray = leftpanel.getElementsByTagName("td"); }
		else { nodeArray = leftpanel.getElementsByTagName("div"); }
		if (nodeArray.length == 0) { alert("You are indicating you want to do a local search, but there is no content in the left panel to search on."); return; }
		}

	// clear the search box
	if (document.getElementById('select')) {
			document.getElementById('select').value = 'none';
			}

	_tempList = true;
	var counter = 0;
	var i = 0;
	
	// figure out what text to search on
	var showDescription = true; 
	if (document.getElementById('searchDesc').checked != true) {  showDescription = false; }
	var showName = true; 
	if (document.getElementById('searchNames').checked != true) {  showName = false; }
	var showOther = true; 
	if (document.getElementById('searchOther').checked != true) {  showOther = false; }
	if (! (showDescription || showName || showOther)) { alert('Select one of Names, Descriptions or Other under the search term.'); return; }

	// if the localSearch checkbox is ticked just work locally
	if (document.getElementById('localSearch').checked) { 
		var re = new RegExp(searchString, "i"); 
		var found = false;
		var chcounter = 0;
		var titlepart;
		var cRecord;
		var newclass;
	
		clearHighlighting();
		// dim everything, so we can undim matches (makes the logic easier)
		for (var i=0; i < nodeArray.length; i++) {
			if (nodeArray[i].className.match(/ch/)) {
				newclass = nodeArray[i].className+' dim';
				nodeArray[i].className = newclass;
				}
			}

		// now undim matches
		for (var i=0; i < nodeArray.length; i++) {
			decCP = nodeArray[i].title.split(' ')[3];
			if (nodeArray[i].className.match(/ch/) && U[decCP]) {
				var fields = U[decCP].split(";")
				var found = false
				if (showName && fields[CHAR_NAME].search(re, 0) > -1) {
					newclass = nodeArray[i].className.replace('dim', '');
					nodeArray[i].className = newclass;
					found = true;
					}
				if (! found && showOther && (fields[UNICODE_1_NAME].search(re, 0) > -1 || fields[ISO_COMMENT].search(re, 0) > -1)) {
					newclass = nodeArray[i].className.replace('dim', '');
					nodeArray[i].className = newclass;
					found = true;
					}
				if (! found && desc[decCP] && showDescription && desc[decCP].search(re, 0) > -1 ) {
					newclass = nodeArray[i].className.replace('dim', '');
					nodeArray[i].className = newclass;
					counter++;
					}
				}
			}
		}
		
	// otherwise search the database, excluding certain ranges
	else { 
	
		var records = '';
		var count = 0;
		var re = new RegExp(searchString, "i");
		found = false;
		for (i=0; i<scriptGroups.length-1; i++) {
			if (scriptGroups[i][0] !== 131072 && scriptGroups[i][0] !== 13312 && scriptGroups[i][0] !== 44032 && 
				scriptGroups[i][0] !== 57344 && scriptGroups[i][0] !== 983040 && scriptGroups[i][0] !== 1048576) { 
				for (j=scriptGroups[i][0]; j<=scriptGroups[i][1]; j++) {
					if (U[j]) {
						fields = U[j].split(';')
						found = false
                        hexCP = j.toString(16).toUpperCase()
                        while (hexCP.length < 4) hexCP = '0'+hexCP
						
						if (showName && fields[CHAR_NAME].search(re, 0) > -1) {
							records += hexCP+' ';
							found = true; count++;
							}
						if (! found && showOther && (fields[UNICODE_1_NAME].search(re, 0) > -1 || fields[ISO_COMMENT].search(re, 0) > -1)) {
							records += hexCP+' ';
							found = true; count++;
							}
						if (! found && desc[j] && showDescription && desc[j].search(re, 0) > -1 ) {
							records += hexCP+' '; count++;
							}
						}
					}
				}
			}

		showCodepoint(records, 'hex');
		document.getElementById('searchResultCount').innerHTML = count+" records found";
		document.getElementById('searchResultCount').style.display = block;	
		}
	}

	


function getCharFromInt ( n ) {
	// converts a decimal integer into a Unicode character
	// n: integer, the decimal Unicode codepoint to be converted
	// output: a character
	var outputString;
    if (n <= 0xFFFF) {
		outputString = String.fromCharCode(n);
		} 
	else if (n <= 0x10FFFF) {
		n -= 0x10000
		outputString = String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
		} 
	else {
		outputString = '!error ' + dec2hex(n) +'!';
		}
	return( outputString );
	}





function getCharType (codepoint) {
	// codepoint: the dec codepoint for the character to display
	// return values: 0 not a character; 1 unassigned character in a block; 2 character listed in u.js; 3 character not listed in u.js; 4 surrogate; 5 private use
    if ((codepoint >= 0x3400 && codepoint <= 0x4DBF) || (codepoint >= 0x4E00 && codepoint <= 0x9FFF) ||           // CJK Ext A, CJK main
        (codepoint >= 0x20000 && codepoint <= 0x2A6DF) || (codepoint >= 0x2A700 && codepoint <= 0x2B73F) ||     // CKL Ext B, C
        (codepoint >= 0x2B740 && codepoint <= 0x2B81F) || (codepoint >= 0x2B820 && codepoint <= 0x2CEAF) || (codepoint >= 0x2CEB0 && codepoint <= 0x2EBEF) ||   // CJK Ext D, E, F
        (codepoint >= 0x30000 && codepoint <= 0x3134F) || (codepoint >= 0x31350 && codepoint <= 0x323AF) || // CJK G, H
        (codepoint >= 0xAC00 && codepoint <= 0xD7AF) ||   // hangul syllables
        (codepoint >= 0x17000 && codepoint <= 0x187FF)  // tangut
        ) { 
        return HAN_HANG_TANG
        }
    else if ( U[codepoint] ) {
        return IN_U_DB
        }
    else if ((codepoint >= 57344 && codepoint <= 63743) || (codepoint > 983040 && codepoint < 1048573) || 
        (codepoint >= 1048576 && codepoint <= 1114109)) { // private use
        return PRIVATEUSE
        }
    else if (codepoint >= 55296 && codepoint <= 57343) { // surrogates
        return HAN_HANG_TANG
        }
    else if (findScriptGroup(codepoint) !== sNotAChar) return 1  // unassigned character in block
    
    else return NONCHARACTER  // unrecognized character
	}


function getDataFor (codepoint) {
	// codepoint: the dec codepoint for the character to display
	
	var charType = getCharType(codepoint)
	var hexcp = codepoint.toString(16).toUpperCase()
    while (hexcp.length<4) hexcp='0'+hexcp
	// return values: 0 not a character; 1 unassigned character in a block; 2 character listed in u.js; 3 character not listed in u.js; 4 surrogate; 5 private use
	if ( charType == IN_U_DB ) return U[codepoint]
	else if (charType < IN_U_DB) return hexcp+";[Unassigned code point];;;;;;;;;;;;;;;;;"
	else if (charType == HAN_HANG_TANG) return hexcp+";["+ findScriptGroup( codepoint )+"];Lo;0;L;;;;;N;;;;;;;;;"
	else if (charType == PRIVATEUSE) return hexcp+";["+ findScriptGroup( codepoint )+"];Co;0;L;;;;;N;;;;;;;;;"
	else if (charType > SURROGATE) return hexcp+";["+ findScriptGroup( codepoint )+"];;;;;;;;;;;;;;;;;"
	else { 
        alert("Error in getDataFor: Unexpected value for charType")
		return hexcp+";[Error];;;;;;;;;;;;;;;;;"
		}
	}
		

function getRange ( str ) {
	// returns hex start and end values for a range, separated by colon
	// str the name of the range, as specified in the scriptGroups.js,
	//   but possibly with underscores instead of spaces
	var lcstr = str.replace( /_/g, ' ' ).toLowerCase()
	var start, end
	var range = ''
	for (i=1; i<scriptGroups.length; i++) {
		if (scriptGroups[i][2].toLowerCase() == lcstr) {
			start = parseInt(scriptGroups[i][0])
			start = start.toString(16).toUpperCase()
			if (start.length == 3) { start = '0'+start }
			end = parseInt(scriptGroups[i][1])
			end = end.toString(16).toUpperCase()
			if (end.length == 3) { end = '0'+end }
			range = start+':'+end
			document.getElementById('block').value = range;
			break;
			}
		}
	return range;
	}

	
function highlightList ( field, searchString ) { 
	// Highlights in the left panel all characters that fall into the category in searchString
	// field: integer, the field in the record to search for a match
	// searchString: string, the specific setting to search for in the field
	var nodeArray = new Array
	var titlepart
	var cRecord
	var newclass
	
	// clear the search box
	//document.getElementById('searchString').value = '';
	
	var leftpanel = document.getElementById('chart')

	// get a list of characters
	//nodeArray = document.getElementById('chart').getElementsByTagName("div"); 
	//if (nodeArray.length == 0) { 
	//	nodeArray = document.getElementById('chart').getElementsByTagName("td");
	//	}
	nodeArray = document.getElementById('chart').querySelectorAll('div.ch')
	if (nodeArray.length === 0) { 
		nodeArray = document.getElementById('chart').querySelectorAll('td.ch');
		}

	// clear out any existing highlighting
	clearHighlighting()
  	
	// if you set searchstring to 'none' to clear highlighting, clear and quit
	if (searchString == 'none' || searchString == 'startup') return  

	// if looking for combining class 0, don't use regex
	if (searchString === '0') {
		for (var i=0; i < nodeArray.length; i++) {
			titlepart = nodeArray[i].title.split(' ');
			if (nodeArray[i].className.match(/ch/) && U[titlepart[3]]) {
				cRecord = U[titlepart[3]].split( ';' );
				if ( cRecord[field] != 0 ) {
					newclass = nodeArray[i].className+' dim';
					nodeArray[i].className = newclass;
					}
				}
	    	}
		return;
		}
		
	// otherwise search and highlight
	searchStringRE = new RegExp(searchString)
	for (var i=0; i<nodeArray.length; i++) {
		titlepart = nodeArray[i].title.split(' ')
		if (nodeArray[i].classList.contains('ch') && U[titlepart[3]]) {
			cRecord = U[ titlepart[3] ].split( ';' )
			if ( cRecord[field].search(searchStringRE) == -1 ) {
                newclass = nodeArray[i].className+' dim'
				nodeArray[i].className = newclass;
				}
	    	}
		}
	}
 	

function highlight2List () {
	// identifies all highlighted characters in the left panel, and replaces the current
	// contents of the panel with a list of these
	var nodeArray = new Array;
	var highlights = new Array;
	
	var leftpanel = document.getElementById('chart');

	// get a list of characters
	nodeArray = document.getElementById('chart').getElementsByTagName("div"); 
	if (nodeArray.length == 0) { 
		nodeArray = document.getElementById('chart').getElementsByTagName("td");
		}
	//if ( (_lastOperation == "range" || _lastOperation == "customrange") 
	//	&& !(document.getElementById('listMatrixToggle').checked) ) {
	//	nodeArray = leftpanel.getElementsByTagName("td"); 
	//	}
	//else { nodeArray = leftpanel.getElementsByTagName("div"); }
		
	// build a list of characters
	var str = ''; var found=false;
	for (var i=0; i < nodeArray.length; i++) { 
		//if (nodeArray[i].style.borderTopWidth == '2px') { 
		if (nodeArray[i].className.match(/ch/) && (! nodeArray[i].className.match(/dim/))) { 
			found = true;
			var titlefields = nodeArray[i].title.split(' ');
			str += getCharFromInt(titlefields[3]);
			}
	    }
	if (! found) { alert('No highlighted characters found.'); return; }

	displayUnorderedList(str);
	}

	
function listProperties ( searchString ) { console.log('>>> listProperties (', searchString, ')')
	// effect: outputs in the left panel a list of characters whose properties match searchString
	// searchString: a string of text to search for in the database that wil be used as a regular expression

	_tempList = true
	var counter = 0
	var i = 0
	var field
	document.getElementById('propertyResultCount').style.display = 'none'

	// if searching in current range
	if (document.getElementById('locallist').checked) { console.log('local') // if the Local checkbox is ticked
		searchString = searchString.replace(/;/g,'')
		// work out which field to search in
        var directionality = new Set(['L','R','EN','ES','ET','AN','CS','NSM','BN','WS','ON'])
        if (directionality.has(searchString)) field = BIDI_CAT

        
		//var directionality = { L:'', R:'', EN:'', ES:'', ET:'', AN:'', CS:'', NSM:'', BN:'', WS:'', ON:'' }
		//if (searchString in directionality) { field = 4 }
		else if (searchString === '0') { field = CAN_COMB_CL }
		else { field = GEN_CAT } 
		
		highlightList(field, searchString)
		}
	else { console.log('else')
		var listDiv = document.getElementById( 'listOutput' )
		var oldContent = document.getElementById('chart')

		// put up a temporary message to say searching
		var tempContent = document.createElement( 'div' )
			tempContent.className = 'charList'
			tempContent.id = 'chart'
		tempContent.appendChild( document.createTextNode( sSearching ))
		var removedNode = listDiv.replaceChild( tempContent, oldContent )
		oldContent = document.getElementById('chart')
	
		// create container for list
		var newContent = document.createElement( 'div' )
			newContent.className = 'charList'
			newContent.id = 'chart'
		var resultdiv = newContent.appendChild( document.createElement('div'))
			resultdiv.style.color = 'brown'
			resultdiv.style.fontSize = '80%'
	
		_lastOperation = "listproperties"
		_newContent = newContent; _resultdiv = resultdiv; _searchString = searchString;
		//uri = 'getproperties.php?search=/'+searchString+'/'; 
		//httpRequest('GET', uri, true, ajaxGetSearchList);
		
		var records = ''
		var count = 0
		var re = new RegExp(searchString)
		found = false
		for (i=0; i<scriptGroups.length-1; i++) { 
			if (scriptGroups[i][0] !== 131072 && scriptGroups[i][0] !== 13312 && scriptGroups[i][0] !== 44032 && scriptGroups[i][0] !== 19968 
				&& scriptGroups[i][0] !== 57344 && scriptGroups[i][0] !== 983040 && scriptGroups[i][0] !== 1048576) {  
				for (j=scriptGroups[i][0]; j<scriptGroups[i][1]; j++) {
					if (U[j]) {
						found = false
						
						if (U[j].search(re, 0) > -1) { 
							records += j.toString(16)+' '
							found = true; count++
							}
						}
					}
				}
			}

		showCodepoint(records, 'hex');
		document.getElementById('propertyResultCount').innerHTML = count+" records found";
		document.getElementById('propertyResultCount').style.display = 'block';	

		}
	}


function highlightByTag (tag) {
	// identifies characters that are associated with a given tag (in u.js)
	// and highlights them
	var nodes = []
	
	var leftpanel = document.getElementById('chart');

	// clear previous filter
	nodes = leftpanel.querySelectorAll(".dim")
	for (var n=0;n<nodes.length;n++) { 
		nodes[n].className = nodes[n].className.replace(/dim/,'')
		}

	// get a list of character nodes 
	nodes = leftpanel.querySelectorAll(".ch") 

	// build a list of characters that aren't greyed out
	var str = ''; var found=false;
	for (var i=0;i<nodes.length;i++) { 
		//if (nodes[i].className.match(/dim/) === null) { 
		//	found = true;
			var titlefields = nodes[i].title.split(' ')
			var dec = titlefields[3]
			var re = "\\b"+tag+"\\b"
			if (T[dec] && T[dec].match(re) === null) nodes[i].className += ' dim'
			if (!T[dec]) nodes[i].className += ' dim'
		//	}
	    }
	//if (! found) { alert('No characters found for that tag.'); return; }

	}

function nonHighlight2List () {
	// identifies all unhighlighted characters in the left panel, and replaces the current
	// contents of the panel with a list of these
	var nodeArray = new Array;
	
	var leftpanel = document.getElementById('chart');

	// get a list of characters
	nodeArray = document.getElementById('chart').getElementsByTagName("div"); 
	if (nodeArray.length == 0) { 
		nodeArray = document.getElementById('chart').getElementsByTagName("td");
		}
	//if ( (_lastOperation == "range" || _lastOperation == "customrange") 
	//	&& !(document.getElementById('listMatrixToggle').checked) ) {
	//	nodeArray = leftpanel.getElementsByTagName("td"); 
	//	}
	//else { nodeArray = leftpanel.getElementsByTagName("div"); }
		
	// build a list of characters
	var str = ''; var found=false;
	for (var i=0; i < nodeArray.length; i++) { 
		if (nodeArray[i].className.match(/ch/) && (nodeArray[i].className.match(/dim/))) { 
			found = true;
			var titlefields = nodeArray[i].title.split(' ');
			str += getCharFromInt(titlefields[3]);
			}
	    }
	if (! found) { alert('No unhighlighted characters found.'); return; }

	/* var str = ''; 
	for (var i=0; i < nodeArray.length; i++) { 
		if (nodeArray[i].style.borderTopWidth != '2px'  && nodeArray[i].className == 'ch') { 
			var titlefields = nodeArray[i].title.split(' ');
			str += getCharFromInt(titlefields[3]);
			}
	    } */

	displayUnorderedList(str);
	}

	
function output2CharArea () { 
	// creates a list of all characters in the left panel and adds them to the character area
	var nodeArray = new Array;
	var highlights = new Array;
	var cCell;
	var str=''; //debugger; var testint;
	
	var leftpanel = document.getElementById('chart');
	
	var tableRows = leftpanel.getElementsByTagName("tr");
	if (tableRows.length > 0) {  
		var cols = tableRows[0].getElementsByTagName('td').length; 
		var tableCells = leftpanel.getElementsByTagName("td"); 
		for (var j=1; j<cols; j++){
			for (var i=0; i<17; i++) {
				// get a list of characters
				cCell = tableCells[j+(i*cols)]; //testint = j+(i*cols);
				//if (cCell.className.match(/ch/) && !cCell.className.match(/dim/)) {
				if (cCell.classList.contains('ch') && !cCell.classList.contains('dim') && !cCell.classList.contains('empty')) {
					var titlefields = cCell.title.split(' ');
//					str += getCharFromInt(titlefields[3]);
					addtoPicker(titlefields[3]);
					}
				}
			}
		}
	else {
		var divs = leftpanel.getElementsByTagName("div"); 
		for (var i=0; i<divs.length; i++) {
			// get a list of characters
				cCell = divs[i]; 
				if (cCell.className.match(/ch/) && !cCell.className.match(/dim/)) { 
					var titlefields = cCell.title.split(' ');
//					str += getCharFromInt(titlefields[3]);
					addtoPicker(titlefields[3]);
					}
			}
		}
	}

	
function previewChar ( hexCode ) {
	// converts a hex code dropped into the drop point to a character displayed below
	// hexCode: string, the hex code of the character
	var hexStart = '1234567890abcdefABCDEF';
	var notHex = false;
	var ccPadding = ''; // will be space if combining char
	
	// delete all spaces
	while ( hexCode.indexOf( ' ' ) > -1 ) {
		hexCode = hexCode.replace(' ', '');
		}
		
	// if not a hex number, set notHex to true
	for (i=0; i<hexCode.length; i++) {
		if ( hexStart.indexOf( hexCode.charAt(i) ) == -1 ) { notHex = true; break; }
		}
	if (hexCode.length > 6) { notHex = true; }
	
	if (notHex) { alert( sNotHex ); return; }
	else {
		var decCode = parseInt( hexCode, 16 );

		//check for combining character
		if (U[decCode]) {
			cRecord = U[decCode].split(';');
			if (cRecord[CAN_COMB_CL] > 0) { ccPadding = '\u00A0'; }  // ie. this is a combining character
			}
		
		var preview = document.getElementById('preview');
		var dropPoint = preview.firstChild;
		var newText = document.createTextNode( ccPadding + getCharFromInt(decCode));
		var removedText = preview.replaceChild(newText, dropPoint);
		preview.style.fontFamily = _currentFont;
		}
	}


/* function refreshRange () {
	// this is used when switching to/ from graphics or list
	// each operation that puts text in the left panel should be represented
	switch (_lastOperation) {
	case 'codepoint': showCodepoint(document.getElementById('charNum').value); break;
	case 'cutpaste': showCharacterList(document.getElementById('charSelect').value); break;
	case 'range': showSelection( document.getElementById('block').value ); break;
	case 'search': findString(document.getElementById('searchString').value); break;
	case 'listproperties': listProperties(document.getElementById('select').value); break;
	default: if (document.getElementById('customRange1').value != '') {
			showRange( document.getElementById('customRange1').value );
			}
		}
	}
*/

function removeNonChars () {
	// identifies all unassigned characters in the left panel, and removes them
	var nodeArray = new Array;
	nodeArray = document.getElementById('chart').getElementsByTagName("div"); 
	if (nodeArray.length == 0) { return; } // don't do this on a matrix
		
	// build a list of characters
	var str = ''; 
	for (var i=0; i<nodeArray.length; i++) { 
		if (nodeArray[i].className == 'ch') { 
			var titlefields = nodeArray[i].title.split(' ');
			str += getCharFromInt(titlefields[3]);
			}
	    }

	displayUnorderedList(str);
	}


function redrawList () {
	// redraws a list in the left panel after a setting has been changed 
	
	// build a list of characters
	var nodeArray = new Array;
	nodeArray = document.getElementById('chart').getElementsByTagName("div"); 
	if (nodeArray.length == 0) { return; } // don't do this on a matrix

	var str = ''; 
	for (var i=0; i<nodeArray.length; i++) { 
		var titlefields = nodeArray[i].title.split(' ');
		if (nodeArray[i].className.match(/ch/)) {
			str += getCharFromInt(titlefields[3]);
			}
	    }

	displayUnorderedList(str);
	}


function setOnclick ( codepoint, node ) {
	//sets the event functions for node, used by createMatrix, createList, etc.
	node.onclick = function(){ if (_copy2Picker) { addtoPicker(codepoint); } else { printProperties(codepoint); window.location = '#title'; } };
	node.ondblclick = function () { addtocharSelect(codepoint) };
	}
	
function setMouseover ( codepoint, node ) {
	// sets the mouseover event funtion used by createMatrix (only)
	node.onmouseover = function(){ showName(codepoint, node); }
	}

function setMouseout ( node ) {
	// sets the mouseover event funtion used by createMatrix (only)
	node.onmouseout = function(){ hideName(); }
	}
	

function showAge () {
	// displays information for characters in the left panel about which version of Unicode 
	// they made their their debut
	
    nodeArray = document.getElementById('chart').querySelectorAll('.ch')
    for (var i=0; i<nodeArray.length; i++) {
        if (! nodeArray[i].classList.contains('empty')) {
            decCP = nodeArray[i].title.split(' ')[3]
            if (! U[decCP]) continue
            fields = U[decCP].split(';')
            switch (fields[AGE_FIELD]) {
                case '': c = 'c1-0'; break;
                case 'a': c = 'c1-1'; break;
                case 'b': c = 'c2-0'; break;
                case 'c': c = 'c2-1'; break;
                case 'd': c = 'c3-0'; break;
                case 'e': c = 'c3-1'; break;
                case 'f': c = 'c3-2'; break;
                case 'g': c = 'c4-0'; break;
                case 'h': c = 'c4-1'; break;
                case 'i': c = 'c5-0'; break;
                case 'j': c = 'c5-1'; break;
                case 'k': c = 'c5-2'; break;
                case 'l': c = 'c6-0'; break;
                case 'm': c = 'c6-1'; break;
                case 'n': c = 'c6-2'; break;
                case 'o': c = 'c6-3'; break;
                case 'p': c = 'c7-0'; break;
                case 'q': c = 'c8-0'; break;
                case 'r': c = 'c9-0'; break;
                case 's': c = 'c10-0'; break;
                case 't': c = 'c11-0'; break;
                case 'u': c = 'c12-0'; break;
                case 'v': c = 'c13-0'; break;
                case 'w': c = 'c14-0'; break;
                case 'x': c = 'c15-0'; break;
                }
            nodeArray[i].classList.add(c)
            }
        }
	}

function showCharacterList ( string ) { 
	// output: a list of the characters contained in string to the left panel, or if a single character, outputs character details to right panel
	// string: a string of characters

	_lastOperation = "cutpaste";

	displayUnorderedList(string); 
	}



function convert2upper ( string, detail ) { 
	// output: ...
	// string: a string of characters
	// detail: if false, just outputs the converted character, otherwise '<source> -> <converted>'

	codepoints = convertChar2Dec(string).split(' ')
	var uppercase = ''
	var lowercase = ''
	var titlecase = ''
	var singletons = ''
	var notfound
	
	if (detail) {
		for (var i=0; i<codepoints.length; i++) {
			cRecord = U[codepoints[i]].split(';')
			notfound = true
			if (cRecord[UC_MAP]) {
				uppercase += ' '+getCharFromInt(parseInt(cRecord[0],16))+'→'+getCharFromInt(parseInt(cRecord[UC_MAP],16))
				notfound = false
				}
			if (cRecord[LC_MAP]) {
				lowercase += ' '+getCharFromInt(parseInt(cRecord[0],16))+'→'+getCharFromInt(parseInt(cRecord[LC_MAP],16))
				notfound = false
				}
			if (cRecord[TC_MAP]) {
				titlecase += ' '+getCharFromInt(parseInt(cRecord[0],16))+'→'+getCharFromInt(parseInt(cRecord[TC_MAP],16))
				notfound = false
				}
			if (notfound) { singletons += ' '+getCharFromInt(parseInt(cRecord[0],16)) }
			}
		}
	else {
		for (var i=0; i<codepoints.length; i++) {
			cRecord = U[codepoints[i]].split(';')
			notfound = true
			if (cRecord[UC_MAP]) {
				uppercase += getCharFromInt(parseInt(cRecord[UC_MAP],16))
				notfound = false
				}
			else { uppercase += getCharFromInt(parseInt(cRecord[0],16)) }
			if (cRecord[LC_MAP]) {
				lowercase += getCharFromInt(parseInt(cRecord[LC_MAP],16))
				notfound = false
				}
			else { lowercase += getCharFromInt(parseInt(cRecord[0],16)) }
			if (cRecord[TC_MAP]) {
				titlecase += getCharFromInt(parseInt(cRecord[TC_MAP],16))
				notfound = false
				}
			else { titlecase += getCharFromInt(parseInt(cRecord[0],16)) }
			if (notfound) { singletons += ' '+getCharFromInt(parseInt(cRecord[0],16)) }
			}
		}
	
	if (uppercase=='') { uppercase = 'None found.' }
	if (lowercase=='') { lowercase = 'None found.' }
	if (titlecase=='') { titlecase = 'None found.' }
	if (singletons=='') { singletons = 'None found.' }
	uppercase = '<div class="caseconversion"><p>To upper:<br />'+uppercase+'</p>'
	lowercase = '<p>To lower:<br />'+lowercase+'</p>'
	titlecase = '<p>To titlecase:<br />'+titlecase+'</p>'
	singletons = '<p>Characters without conversion:<br />'+singletons+'</p></div>'
	document.getElementById('charInfo').innerHTML = uppercase+lowercase+titlecase+singletons
	}



function expandList ( string ) { 
	// output: a list of the characters contained in string in the text area, with a-d replaced by abcd and all spaces removed
	// string: a string of characters, - and space have special meanings

	codepoints = convertChar2CP(string).split(' '); 
	newlist = '';
	for (i=0;i<codepoints.length;i++) {
		if (codepoints[i] != '20' && codepoints[i] != '2D') {
			newlist += codepoints[i]+' ';
			}
		if (codepoints[i] == '2D' && i>0 && i<codepoints.length+1) {
			for (j=1; j<(parseInt(codepoints[i+1],16)-parseInt(codepoints[i-1],16)); j++) {
				newlist += (parseInt(codepoints[i-1],16)+j).toString(16)+' ';
				}
			}
		}
	//alert(newlist);
		
	return convertCP2Char(newlist.substring(0, newlist.length-1));	
	}

function showName ( codepoint, node ) {
	// display character name for characters in a matrix
	if (U[codepoint]) {
		cRecord = U[codepoint].split(';')
        var hexvalue = codepoint.toString(16).toUpperCase()
        while (hexvalue.length < 4) hexvalue = '0'+hexvalue
		span = document.createElement( 'span' )
		span.appendChild(document.createTextNode( hexvalue+' '+cRecord[CHAR_NAME] ))
		var namedisplay = document.getElementById('namedisplay')
		namedisplay.replaceChild( span, namedisplay.firstChild )
		}
	}
	
function hideName () {
	// hide character name for characters in a matrix
	span = document.createElement( 'span' )
	span.appendChild(document.createTextNode( '\u00a0' ))
	var namedisplay = document.getElementById('namedisplay');
	namedisplay.replaceChild( span, namedisplay.firstChild )
	}
	
function originalshowName ( codepoint, node ) {
	// display character name for characters in a matrix
	span = document.createElement( 'span' );
	span.setAttribute( 'id', 'charname' );
	charinfo = document.createTextNode( node.title );
	span.appendChild(charinfo);
	var chardata = document.getElementById('chardata');	
	chardata.replaceChild( span, chardata.firstChild );
	}


function dec2hex ( textString ) {
 return (textString+0).toString(16).toUpperCase();
}


function convertTextArea (str) {
// Convert escapes to characters in str (used for text area)
// Treats bare numbers as hex values - doesn't handle dec numbers
	str = convertUnicode2Char(str)
	str = convert0x2Char(str)
	str = convertuBracket2Char(str)
	str = convertuBrSequence2Char(str)
	str = convertxBracket2Char(str)
	str = convertx002Char(str)
	str = convertHexNCR2Char(str)
	str = convertDecNCR2Char(str)
	str = convertU0000002Char(str)
	str = convertU00002Char(str)
	str = convertCSS2Char(str, false)
	str = convertpEnc2Char(str)
	str = convertGreenNumbers2Char(str, 'hex')

	return str
	
	}



function cleanHexCPs (codepoints) {
	// takes text containing hex codepoint values and extracts the codepoints into a 
	// space separated list
	// codepoints: string, the text to be parsed
	
	codepoints = codepoints.replace(/\\U/g,' ');
	codepoints = codepoints.replace(/\\u/g,' ');
	codepoints = codepoints.replace(/&#x/g,' ');
	codepoints = codepoints.replace(/[^A-Za-z0-9]/g,' ');
	codepoints = codepoints.replace(/\b\S*[^A-Fa-f0-9\s]\S*\b/g,' ');
	codepoints = codepoints.replace(/\s+/g, ' ');
	codepoints = codepoints.replace(/^\s+/, '');
	codepoints = codepoints.replace(/\s+$/, '');
	return codepoints;
	}
	
function cleanDecCPs (codepoints) {
	// takes text containing dec codepoint values and extracts the codepoints into a 
	// space separated list
	// codepoints: string, the text to be parsed
	
	codepoints = codepoints.replace(/&#/g,' ');
	codepoints = codepoints.replace(/[^A-Za-z0-9]/g,' ');
	codepoints = codepoints.replace(/\b\S*[^0-9\s]\S*\b/g,' ');
	codepoints = codepoints.replace(/\s+/g, ' ');
	codepoints = codepoints.replace(/^\s+/, '');
	codepoints = codepoints.replace(/\s+$/, ''); 
	return convertDec2CP(codepoints);
	}


function showCodepoint (codepoints, base) {
	// output: a list of the characters contained in string to the left panel, or if a single character, ouputs character details to right panel
	// codepoints: a set of one or more hex codepoint values
	// base: one of 'hex' or 'dec', indicates base of codepoints

	codepoints = codepoints.replace( /_/g, ' ' ); // for when list supplied by URI
	//if (document.getElementById('decimal').checked == true) { codepoints = cleanDecCPs(codepoints); }
	if (base=='dec') { codepoints = cleanDecCPs(codepoints); }
	else { codepoints = cleanHexCPs(codepoints); } 
	if ( codepoints == '' || codepoints == ' ') { alert('No codepoints found.'); return 0; }
	if ( codepoints.match(/[^abcdefABCDEF0-9\s]/)) { alert('Can\'t work out what the codepoints are. Unexpected characters found. Boiled down to: '+codepoints); return 0; }

	var characterList = convertCP2Char(codepoints);
	_lastOperation = "codepoint";

	showCharacterList(characterList);
	}
	
	
function showConverter (codepoints, origin) {
	if (document.getElementById('decimal').checked == true) { codepoints = cleanDecCPs(codepoints); }
	else { codepoints = cleanHexCPs(codepoints); } 
	if ( codepoints == '' || codepoints == ' ') { alert('No codepoints found.'); return 0; }
	if ( codepoints.match(/[^abcdefABCDEF0-9\s]/)) { alert('Can\'t work out what the codepoints are. Unexpected characters found. Boiled down to: '+codepoints); return 0; }
	converter = window.open('../app-conversion/index.html?codepoints='+codepoints+'&origin='+origin, 'converter');
	converter.focus();
	}


function showList (property) {
	if (document.getElementById('searchOther').checked != true) { alert('You need to select the checkbox next to Other (under the Search field) for this to work.'); }  
	else { 
		if (document.getElementById('locallist').checked != true) { 
			var result = confirm('You haven\'t selected the Local checkbox. This request may take a long time. Do you want to continue?'); 
			if (! result) { return false; }
			}
		listProperties(property);  
		_lastOperation = 'listproperties'; 
		}
	}


function showProperties (value) { console.log('>>> showProperties (', value, ')')
	if (document.getElementById('searchOther').checked !== true) {  
		alert('You need to select the checkbox next to Other (under the Search field) for this to work.') 
		}  
	else if (document.getElementById('locallist').checked !== true && value == ';0;') {  
		alert('You can only search for Combining Class 0 locally.')
		return false
		}  
	else { 
		if (document.getElementById('locallist').checked !== true) { 
			var result = confirm('You haven\'t selected the Local checkbox. This request may take a long time. Do you want to continue?'); 
			if (! result) { return false }
			}
		listProperties(value)  
		}
	}


function showRange () {
	// clean up the range and check whether we have already downloaded the data
	// if so, it call drawSelection to draw characters
	// if not, calls ajax to download character data and then call drawSelection
	
	// remove any formatting characters and get start and end
	rawrange = tidyRange(document.getElementById('customRange1').value);
	if (rawrange != 0) { 
		rangeArray = rawrange.split(':');
		}
	else { return; }
	rangeArray = rawrange.split(':');
	if ( rangeArray[0] == '' ) { showCodepoint(rangeArray[1]); return; }
	if ( rangeArray[1] == '' ) { showCodepoint(rangeArray[0]); return; }
	
	// check the range isn't too big or too small
	size = parseInt(rangeArray[1], 16)-parseInt(rangeArray[0], 16); 
	if (size > 2000) { 
		result = confirm('This range contains '+size+' characters. Displaying it will take a long time. Do you want to continue?');  
		if (!result) { return; }
		}
	if ( size < 1) { alert('Range incorrectly specified (start higher than end). Range identified: '+rawrange); return; }

	// reconstruct a clean range
	range = rangeArray[0]+":"+rangeArray[1];
	document.getElementById('customRange1').value = range;

	_lastOperation = "customrange";

    drawSelection(range); 
	}



function normaliseName (name) {
	name = name.replace(/ /g, '');
	name = name.toLowerCase();
	return name;
	}


function showSelection (range) {
	// checks whether the range has already been shown,
	
	//check the range is ok
	if ( range == '' ) { return }  
	rangeArray = range.split(':')
	size = parseInt(rangeArray[1], 16)-parseInt(rangeArray[0], 16)
	if (size > 2000) { 
		result = confirm('This block contains '+size+' characters. Displaying it will take a long time. Do you want to continue?')
		if (!result) { return }
		}
		
	_lastOperation = 'range'
	
	// fill in the custom range field
	document.getElementById('customRange1').value = rangeArray[0]+':'+rangeArray[1]
	
	// add pointer to block info, if such exists
	var infoptr = scriptInfoPointer(rangeArray[0])
	if (infoptr) { 
		document.getElementById('blockInfoPointer').innerHTML = 
        `<span  onclick="displayBlockData('${ infoptr }')">
        <img style="vertical-align:baseline;" src="images/info.gif" alt="info"/>
        <span style="font-size:1.2rem; margin-inline-start:1rem;">${ scriptGroups[infoptr][2] }</span>
        <span id="blockname" style="font-weight: bold; margin-inline-start:1rem;">[${ scriptGroups[infoptr][3] }]</span>
        </span>`
		}
	else { document.getElementById('blockInfoPointer').innerHTML = '' }
	
    drawSelection(range)
    displayTags(listTags())
    //if (document.getElementById('showNotesToggle').checked) highlightIndexChars()
		
	}



function highlightIndexChars () {
	if (document.getElementById('chart')) {
		charlist = document.querySelectorAll('#chart td.ch')
		for (var i=0;i<charlist.length;i++) {
			path = charlist[i].title.split(' ')
			if (charInfoPointer(path[1])) {
				//charlist[i].style.color = 'red'
				//charlist[i].style.border = '1px solid #FF7704'
                charlist[i].classList.add('notesAvailable')
				}
			}
		}
	}
	
	
function unhighlightIndexChars () {
	if (document.getElementById('chart')) {
		charlist = document.querySelectorAll('#chart td.ch')
		for (var i=0;i<charlist.length;i++) {
			path = charlist[i].title.split(' ')
			if (charInfoPointer(path[1])) {
                charlist[i].classList.remove('notesAvailable')
				}
			}
		}
	}
	
	

function charInfoPointerXXX (codepoint) {
	// find the name of the file in /block/, if one exists,
	// for the character in codepoint
	// codepoint: hex codepoint value
	// returns: the filename, if successful
	//          otherwise ''
	
	var charNum = parseInt(codepoint,16) 
	if (charNum < 128) { return scriptGroups[0][3] }
	var i=1
	while ( i<scriptGroups.length && charNum > scriptGroups[i][1] ) { i++ } 
	if ( i == scriptGroups.length ) { return '' }
	else { 
		if (foundInList(charNum, scriptGroups[i][3])) {	return( scriptGroups[i][3] ) }
		else { return '' }
		}
	}


function foundInList (ch, range) { 
	// takes a list of decimal numbers, with ranges represented as xxx:yyy
	// and a decimal code point, and returns true if the codepoint is in the list
	// ch: the codepoint to search for
	// range: the list of codepoints, with ranges separated by spaces
	
	var runs = range.split(' ')
	ch = parseInt(ch)
	for (i=0;i<runs.length;i++) {
		var startEnd = runs[i].split(":")
		//alert(i+'--'+startEnd[0]+' '+startEnd[1])
		if (startEnd.length == 1 && ch == parseInt(startEnd[0])) { return true } 
		else if (startEnd.length > 1 && (ch >= parseInt(startEnd[0]) && ch <= parseInt(startEnd[1]))) { return true }
		}
	return false
	}


	

function displayTags (list) {
	var out = ''
	
	out += '<a href="none" onclick="showProperties(\'(;Lu;|;Ll;|;Lt;|;Lm;|;Lo;)\'); return false;">letter</a> '
	out += ' • <a href="none" onclick="showProperties(\'(;Mn;|;Mc;|;Me;)\'); return false;">mark</a> '
	out += ' • <a href="none" onclick="showProperties(\'(;Nd;|;Nl;|;No;)\'); return false;">number</a> '
	out += ' • <a href="none" onclick="showProperties(\'(;Pc;|;Pd;|;Ps;|;Pe;|;Pi;|;Pf;|;Po;)\'); return false;">punctuation</a> '
	out += ' • <a href="none" onclick="showProperties(\'(;Sm;|;Sc;|;Sk;|;So;)\'); return false;">symbol</a> '
	out += ' • <a href="none" onclick="showProperties(\'(;Cc;|;Cf;|;Co;|;Cn;)\'); return false;">other</a> '
	out += ' • <a href="none" onclick="showProperties(\'none\'); return false;">X</a><br/>'
	
	if (list.length > 0) {
		for (var i=0;i<list.length;i++) {
			if (list[i] !== '') {
                out += '<a href="none" onclick="highlightSubtitles(\''+list[i]+'\'); return false;">'+st[list[i]]+'</a> '
                if (i<list.length-1) out += ' • '
                }
			}
		}
    
	document.getElementById('tags').innerHTML = out
	}


function listTags () {
	// get a list of tags for the displayed characters
	
	var out = []
	var leftpanel = document.getElementById('chart')
	var subtitleSet = new Set([])

	nodes = leftpanel.querySelectorAll(".ch") 

	// build a list of tags for subtitles
	for (var i=0;i<nodes.length;i++) { 
		var titlefields = nodes[i].title.split(' ')
		var dec = titlefields[3]
        
        // add links for each subtitle in the block
        var cRecord = getDataFor(dec).split(';')
		currSubtitle = cRecord[SUBTITLE_FIELD]
        if (! subtitleSet.has(currSubtitle)) {
            subtitleSet.add(currSubtitle)        
            out.push(currSubtitle)
            }
	    }
	out.sort()
	return out
	}


function highlightSubtitles (subt) {
    // when a user clicks on a link at the bottom of a matrix, this highlights a subsection
    // subt, decimal pointer to st list
    
	nodes = document.getElementById('chart').querySelectorAll(".ch") 

	// clear existing highlights
	for (var i=0;i<nodes.length;i++) {
        nodes[i].classList.remove('dim')
        }

	// build a list of tags for subtitles
	for (var i=0;i<nodes.length;i++) { 
		var titlefields = nodes[i].title.split(' ')
		var dec = titlefields[3]
        
        // add links for each subtitle in the block
        var cRecord = getDataFor(dec).split(';')
        if (cRecord[SUBTITLE_FIELD] !== subt) nodes[i].classList.add('dim')
	    }
    }


function showUnihan (codepoints, inputtype) {
	// inputtype: one of 'hex', 'dec' or 'char', indicates the form of the incoming codepoints
	if (inputtype == 'dec') { codepoints = cleanDecCPs(codepoints); }
	else if (inputtype == 'hex') { codepoints = cleanHexCPs(codepoints); } 
	else { codepoints = convertChar2CP(codepoints); }
	if ( codepoints == '' || codepoints == ' ') { alert('No codepoints found.'); return 0; }
	if ( codepoints.match(/[^abcdefABCDEF0-9\s]/)) { alert('Can\'t work out what the codepoints are. Unexpected characters found. Boiled down to: '+codepoints); return 0; }
	
	var cplist = codepoints.split(' ');
	
	if (cplist.length > 5) { 
		var result = confirm('This request will open '+cplist.length+' windows. Do you want to continue?'); 
		if (! result) { return false; }
	}

	for (var i=0; i<cplist.length; i++) {
		unihan = window.open('http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint='+cplist[i]+'&useutf8=true', 'unihan'+i);
		unihan.focus();
		}
	}

	
function tidyRange (rawrange) {
	// boils down a range to colon separated hex numbers
	// if error found, returns 0
	rawrange = rawrange.replace(/^\s+/, '');
	rawrange = rawrange.replace(/\s+$/, '');
	rawrange = rawrange.replace(/\s+/, ':');
	rawrange = rawrange.replace(/[\\uUx\&\#\+\;]/g,'');
	rawrange = rawrange.replace(/-/g, ':');
	rawrange = rawrange.replace(/\.+/g, ':');
	if ( rawrange == '' || rawrange == ' ' || rawrange == ':') { alert('No range specified.'); return 0; }
	if ( rawrange.match(/[^abcdefABCDEF0-9\:]/)) { alert('Range incorrectly specified. Unexpected characters found. Range identified: '+rawrange); return 0; }
	if (!rawrange.match(/:/)) { rawrange += ':'; }
	rangeArray = rawrange.split(':');
	if ( rangeArray.length>2 ) { alert('Range incorrectly specified. Two hex numbers expected. Range identified: '+rawrange); return 0; }

	return rawrange;
	}


function toggleDisplay (checkbox) { 
	// if show range as list is selected and the last operation was choose block or range
	// this calls those functions again so that the change is applied
	if (_lastOperation == 'range') {
		showSelection( document.getElementById('block').value ); 
		}
	if (_lastOperation == 'customrange') {
		showRange( document.getElementById('customRange1').value ); 
		}
	}
		
		
function toggleNotesX (checkbox) { 
	// if show notes is selected sets _showNotes to true and sets localStorage
	if (! document.getElementById('showNotesToggle').checked)  {
		_showNotes = false
		localStorage.setItem('showNotes', false)
		document.getElementById('notesIframe').src = 'blank.html'
        unhighlightIndexChars()
		}
	else {
		_showNotes = true
		localStorage.setItem('showNotes', true)
        highlightIndexChars()
		}
	}
		
		
function toggleNotes (checkbox) {     
	// if show notes is selected sets _showNotes to true and sets localStorage
	if (! document.getElementById('showNotesToggle').checked)  {
		_showNotes = false
		localStorage.setItem('showNotes', false)
		document.getElementById('notesIframe').src = 'blank.html'
        //unhighlightIndexChars()
		}
	else {
		_showNotes = true
		localStorage.setItem('showNotes', true)
        if (document.getElementById('largeChar')) printProperties(parseInt(document.getElementById('largeChar').title))
        //highlightIndexChars()
		}
	}
		
		
function toggleSpan2Img (node, decchar) {
	
	}

	
function toggleGraphic (graphic) { 
	// switch characters to graphics and vice versa
    // this doesn't just redraw the matrix or list, because that would obliterate highlighting
    
	var leftpanel = document.getElementById('chart')
	var titlefields, img, span, text, hexNum, charType
	
	// check whether we're dealing with a table or list
	var tableRows = leftpanel.getElementsByTagName("tr")
    
	if (isMatrix()) { 
		var tds = leftpanel.querySelectorAll('td')
		for (let i=0; i<tds.length; i++) {
			if (tds[i].classList.contains('ch')) { 
				titlefields = tds[i].title.split(' ')
				hexNum = titlefields[1].toUpperCase()
                while (hexNum.length < 4) hexNum = '0' + hexNum  // padd with zeros
                charType = getCharType(parseInt(titlefields[3]))
                
                // change text to img
				if (document.getElementById('graphicsToggle').checked === true && charType === IN_U_DB &&
                    tds[i].classList.contains('chSpan')) { 
					img = document.createElement( 'img' )
				    scriptGroup = findScriptGroup(parseInt(titlefields[3]))
				    img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/'+hexNum+'.png'
					text = tds[i].firstChild
					tds[i].replaceChild(img, text)
                    tds[i].classList.remove('chSpan')
					}
                
                // change img to text
				else if (! tds[i].classList.contains('empty')) {
                    ch = getCharFromInt(titlefields[3])
                    tds[i].textContent = ch
                    tds[i].classList.add('chSpan')
					}
				}
			}
		}

	else { // this is a list
		var divs = leftpanel.getElementsByTagName('div')
		for (let i=0; i<divs.length; i++) {
			if (divs[i].classList.contains('ch')) { 
				titlefields = divs[i].title.split(' ')
				hexNum = titlefields[1].toUpperCase()
                while (hexNum.length < 4) hexNum = '0' + hexNum  // padd with zeros
                charType = getCharType(parseInt(titlefields[3]))
 
                // change span to img
				if (document.getElementById('graphicsToggle').checked == true && charType === IN_U_DB) {
					img = document.createElement( 'img' )
				    scriptGroup = findScriptGroup(parseInt(titlefields[3]))
				    img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/'+hexNum+'.png' 
					span = divs[i].getElementsByTagName('span')[0]
					divs[i].replaceChild(img, span)
					}
                
                // change img to span
				else {   
					var ch = document.createTextNode(getCharFromInt(titlefields[3]))
					span = document.createElement('span') 
					span.className = 'chSpan'
					span.appendChild(ch)
					img = divs[i].firstChild
					divs[i].replaceChild(span, img)
					}
				}
			}
		}

	// change the large character on the right, if there is one
	if (document.getElementById('largeChar')) {
		printProperties(parseInt(document.getElementById('largeChar').title));
		}
	}
	
function toggleNumbers () {
	var nodeArray = document.getElementById('chart').getElementsByTagName("td");
	
	if (nodeArray.length>0) {
		// get range
		var ptr = 0;
		while (ptr<nodeArray.length && nodeArray[ptr].className != 'ch' && nodeArray[ptr].className != 'empty') {
			ptr++;
			}
		var titlefields = nodeArray[ptr].title.split(' ');
		var start = titlefields[1];
		titlefields = nodeArray[nodeArray.length-1].title.split(' ');
		var end = titlefields[1];
		
		showSelection( start+':'+end );
		}
	}

	




function printProperties ( codepoint ) {
	// displays a description of a single character in the right panel, plus any notes
	// codepoint: a decimal integer representing the Unicode scalar value of the character to be       displayed
    
	var MsPadding = ''  // Will be set to a space if this is a non-spacing mark
	var description = false
	var div, span, img, table, tbody, tr, td, button, cpHex
    //document.getElementById('descKey').innerHTML = ''
    dRecord = []
    out = ''

    // get the hex code point value
    cpHex = codepoint.toString(16).toUpperCase()
    while (cpHex.length < 4) cpHex = '0'+cpHex
    
	var listDiv = document.getElementById( 'charOutput' )
	var oldContent = document.getElementById('charInfo')
	listDiv.style.display = 'block'

    charData = getDataFor(codepoint)
	charType = getCharType( codepoint )
	scriptGroup = findScriptGroup(codepoint)
	
    // set up navigational graphics
    out += `<div><span id="charNavigation" `
        if (_copy2Picker) out += ` style="background:#EDE4D0;"`
        else out += ` style="background: #a52a2a;"`
        out += `>`
    
    out += `<button class="clearButtonTop" onclick="listDiv.style.display = 'none'">Close</button>`
    out += `<button class="moveForwardBack" title="${ sPrevChar }" onclick="adjacentChar( ${ codepoint }, -1)">Previous</button>`
    out += `<button class="moveForwardBack" title="${ sNextChar }" onclick="adjacentChar( ${ codepoint }, 1)">Next</button>`
    out += `</span>`
    out += `</div>\n`
   
    
	if (charType == IN_U_DB || charType == HAN_HANG_TANG || charType == PRIVATEUSE) { 
		cRecord = charData.split(';')
		if (cRecord[CAN_COMB_CL] > 0) { MsPadding = '\u00A0' }  // ie. this is a combining character

		// draw the large character
        out += `<div class="largeCharDiv">`
        
         // add img, if available and graphic toggle set
		if (document.getElementById('graphicsToggle').checked === true && charType === IN_U_DB) {
            out += `<img id="largeChar" alt="${ codepoint }" title="${ codepoint }" src="../c/${ scriptGroup.replace(/ /g,'_')+'/large/'+cpHex }.png">`
            }       
        // otherwise add text
		else { 
            out += `<span id="largeChar" class="copyme" title="${ codepoint }">${ MsPadding + getCharFromInt(codepoint) }</span>`
            }
        out += `</div>\n`

		
        // character no. & name
        out += `<div id="characterName" class="copyme" title="Click on this to copy it to the clipboard.">`
        out += `<span style="margin-inline-end:.75em;">U+${ cpHex }:</span>`
        out += `${ ' '+cRecord[CHAR_NAME] }`
        out += `</div>\n`



        // fill out properties table
        out += `<table class="propsTable" style="width:90%; clear:both;"><tbody>`

        out += `<tr><td>General category:</td><td>${ cRecord[GEN_CAT]+' - '+generalProp[ cRecord[GEN_CAT] ] }</td></tr><tr>`

        out += `<tr><td>Canonical combining class:</td><td>${ cRecord[CAN_COMB_CL]+' - '+combClass[ cRecord[CAN_COMB_CL] ] }</td></tr><tr>`

        string = cRecord[BIDI_CAT] + ' - ' + bidiProp[ cRecord[BIDI_CAT] ]
        if (cRecord[9] == 'Y' ) { string += sMirrored }
        out += `<tr><td>Bidirectional category:</td><td>${ string }</td></tr><tr>`

        if (cRecord[DECOMP_MAP]) {
            out += `<tr><td>Character decomposition mapping:</td><td>${ cRecord[DECOMP_MAP] } \u00A0\u00A0 `
            cps = cRecord[DECOMP_MAP].split(' ')
            dresult = ''
            for (n=0; n<cps.length; n++) {
                if (cps[n].charAt(0) != '[') {
                    dresult += getCharFromInt(parseInt(cps[n],16))+''
                    }
                }
            out += `<span class="copyme characterSpan">${ dresult }</span>`
            out += `</td></tr>`
            }

        if (cRecord[DEC_DIG_VALUE]) out += `<tr><td>Decimal digit value:</td><td>${ cRecord[DEC_DIG_VALUE] }</td></tr><tr>`

        if (cRecord[DIG_VALUE]) out += `<tr><td>Digit value:</td><td>${ cRecord[DIG_VALUE] }</td></tr><tr>`

        if (cRecord[NUMERIC_VALUE]) out += `<tr><td>Numeric value:</td><td>${ cRecord[NUMERIC_VALUE] }</td></tr><tr>`

        if (cRecord[UNICODE_1_NAME]) out += `<tr><td>Unicode 1.0 name:</td><td>${ cRecord[UNICODE_1_NAME] }</td></tr><tr>`

        if (cRecord[ISO_COMMENT]) out += `<tr><td>10646 comment field:</td><td>${ cRecord[ISO_COMMENT] }</td></tr><tr>`

        if (cRecord[UC_MAP]) {
            dresult = getCharFromInt(parseInt(cRecord[UC_MAP],16))
            out += `<tr><td>Uppercase mapping:</td><td>${ cRecord[UC_MAP] } \u00A0\u00A0 <span class="ie">${ dresult }</span></td></tr><tr>`
            }

        if (cRecord[LC_MAP]) {
            dresult = getCharFromInt(parseInt(cRecord[LC_MAP],16))
            out += `<tr><td>Lowercase mapping:</td><td>${ cRecord[UC_MAP] } \u00A0\u00A0 <span class="ie">${ dresult }</span></td></tr><tr>`
            }

        if (cRecord[TC_MAP]) {
            dresult = getCharFromInt(parseInt(cRecord[TC_MAP],16))
            out += `<tr><td>Titlecase mapping:</td><td>${ cRecord[TC_MAP] } \u00A0\u00A0 <span class="ie">${ dresult }</span></td></tr><tr>`
            }


        // add derived age
        out += `<tr><td>Unicode version:</td><td>${ age2VersionMap[cRecord[AGE_FIELD]] }</td></tr><tr>`

        // add link to CLDR properties demo
        out += `<tr><td class="padBlockStart padBlockEnd" colspan="2"><a href="http://unicode.org/cldr/utility/character.jsp?a=${ cpHex }" target="cldr" style="font-size:110%;">Show character properties</a></td></tr><tr>`



        //add link to UniHan db
        var pageNum = 0
        var approx = ''
        if (scriptGroup == 'CJK Unified Ideographs') { pageNum = Math.floor(((codepoint-0x4E00)/40)+2); blockstart = '4E00'; approx = ' [35Mb file!]'  }
        if (scriptGroup == 'CJK Unified Ideographs Extension A') { pageNum = Math.floor(((codepoint-13312)/56.25)+2); blockstart = '3400'; approx = ', approx [6Mb file!]' }
        if (scriptGroup == 'CJK Unified Ideographs Extension B') { pageNum = Math.floor(((codepoint-0x20000)/58.67)+2); blockstart = '20000'; approx = ', approx [40Mb file!]' }
        if (scriptGroup == 'CJK Unified Ideographs Extension C') { pageNum = Math.floor(((codepoint-0x2A700)/78.26)+2); blockstart = '2A700'; approx = ', approx' }
        if (scriptGroup == 'CJK Unified Ideographs Extension D') { pageNum = Math.floor(((codepoint-0x2B740)/80)+2); blockstart = '2B740' }
        if (scriptGroup == 'CJK Unified Ideographs Extension E') { pageNum = Math.floor(((codepoint-0x2B820)/80)+2); blockstart = '2B820' }
        if (scriptGroup == 'CJK Unified Ideographs Extension F') { pageNum = Math.floor(((codepoint-0x2CEB0)/80)+2); blockstart = '2CEB0' }
        if (scriptGroup == 'Hangul Syllables') { pageNum = Math.floor(((codepoint-0xAC00)/256)+2); blockstart = 'AC00' }


        // add link to Unihan db
        if (pageNum > 0 && scriptGroup != 'Hangul Syllables') out += `<p style="margin-block-start:18px;">View data in <a href="http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${ cpHex }&useutf8=true" target="unihan">Unihan database</a></p>`

        // add pointer to PDF code chart page
        if (pageNum > 0 && scriptGroup) out += `<p>View in <a href="http://www.unicode.org/charts/PDF/U${ blockstart }.pdf#page=${ pageNum }" target="unihan">PDF code charts</a> (page ${ pageNum+approx })</p>`


        // add character if in graphics mode
        if (document.getElementById('graphicsToggle').checked == true)
            out += `<tr><td>As text:</td><td id="characterAsText" class="astext" title="Click on this to copy it to the clipboard">${ MsPadding }<span class="characterSpan copyme">${getCharFromInt(codepoint) }</td></span></tr>`


        // add decimal value
        out += `<tr><td>Decimal:</td><td class="copyme">${ codepoint }</td></tr><tr>`

        // add NCR value
        out += `<tr><td>HTML escape:</td><td class="copyme">${ '&amp;#x'+codepoint.toString(16).toLocaleUpperCase()+';' }</td></tr><tr>`

        // add URL encoded value
        out += `<tr><td>URL escape:</td><td class="copyme">${ convertChar2pEsc(codepoint) }</td></tr><tr>`



        // add link to Conversion tool
        out += `<tr><td colspan="2"><a href="../app-conversion/index.html?q=${ getCharFromInt(codepoint) }" target="conversion">More alternative forms</a></td></tr><tr>`

        out += `</tbody></table>`



        //show Unicode block, with link
        _charScriptGroup = scriptGroup
        out += `<p class="padBlockStart"><strong>Unicode block: <a href="#" onclick="showSelection( getRange(_charScriptGroup) ); return false;">${ _charScriptGroup }</a></strong></p>`

        //display script group
        _charScriptGroup = scriptGroup
        out += `<p class="padBlockStart"><strong>Script group: <span class="subcat">${ st[cRecord[SUBTITLE_FIELD]] }</span></strong></p>`

        // return block directory name if scriptGroups says that there are character notes for this block
        var blockfile = charInfoPointer(cpHex)



        // display Description heading
        if (desc[eval('0x'+cpHex)] || blockfile) {
            out += `<p class="padBlockStart"><strong>Description:</strong></p>`
            out += `<div id="descKey"></div>`
            
            // display any Unicode descriptions
            if (desc[eval('0x'+cpHex)]) {
                dRecord = desc[eval('0x'+cpHex)].split('¶')
                description = true
                for (var j=0; j < dRecord.length; j++ ) {
                    out += `<div class="descLine">${ printDescriptionLine( dRecord[j] ) }</div>`
                    }
                }


function printDescriptionLine (line) {
    // takes a line from a Unicode description for a character and outputs marked up version
    // line is a string for a single description line in descriptions.js
    
    //console.log('printDescriptionLine', line[0],'in')
    //console.log(line)
    switch (line[0]) {
        case '\u2192':  temp = line.replace(/\(/,'').replace(/\)/,'')
                        if (temp.includes(' - ')) {
                            temparray = temp.split(' - ')
                            if (temparray.length === 1) thecharacter = String.fromCodePoint('0x'+temparray[0].replace(/\u2192/,'').trim())
                            else thecharacter = String.fromCodePoint('0x'+temparray[1].trim())
                            temp = `<span class="descSymbol">\u2192</span> ${ temparray[1] } <span class="descCharacterSpan copyme">${ thecharacter }</span> ${ temparray[0].replace(/\u2192/,'') }`
                            return temp
                            }
                        else return  `<span class="descSymbol">\u2192</span> ${ line.slice(1) }`
                        break;
        case '\u2022':  return `<span class="descSymbol">\u2022</span> ${ line.slice(1) }`
                        break;
        case '\u2261':  return `<span class="descSymbol">\u2261</span> ${ line.slice(1) }`
                        break;
        case '\u003D':  return `<span class="descSymbol">\u003D</span> ${ line.slice(1) }`
                        break;
        case '\u0025':  return `<span class="descSymbol">\u203B</span> ${ line.slice(1) }`
                        break;
        case '\u2248':  return `<span class="descSymbol">\u2248</span> ${ line.slice(1) }`
                        break;
        case '\u007E':  return `<span class="descSymbol">\u007E</span> ${ line.slice(1) }`
                        break;
        default: return line
        }
    }


 //           out += `<div id="descKey"></div>`
            
            

            // display notes if there are any, and if required
            if (blockfile && document.getElementById('showNotesToggle').checked) {
                out += `<div>`
                out += `<div class="notesexpl"><a href="../scripts/${ blockfile }/block.html#char${ cpHex }" target="blockdata" style="font-size:80%;">Open the notes page in a separate window.</a></div>`

                document.getElementById('notesIframe').src = '../scripts/'+blockfile+'/block.html?char='+cpHex
                }


            // if _showNotes isn't on, just mention that there are some notes
            else if (blockfile) {
                out += `<div>`
                out += `<div class="notesexpl" style="font-size:80%; font-style:italic;">Notes are available for this block.</div>`

                document.getElementById('notesIframe').src = 'blank.html'
                }
            else document.getElementById('notesIframe').src = 'blank.html'

            out += `</p>`
            }
        else document.getElementById('notesIframe').src = 'blank.html'
        }
    
		
	else { // this is either  an unassigned character or a surrogate character
		var group = findScriptGroup(codepoint)
		
		// character no. & name
        var hexcpvalue = cpHex
		while (hexcpvalue.length < 4) { hexcpvalue = '0'+hexcpvalue; }
        out += `<div style="margin-block-start:10px;">U+${ hexcpvalue } Unassigned character.</div>`
		
		//find script group
        out += `<p style="margin-block-start:18px"><strong>Unicode block: </strong><a href="#" onclick="showSelection( getRange(scriptGroup) ); return false;">Unicode block: </a></p>`
		}

    
    oldContent.innerHTML = out
    
    
    // ensure that the top of the information shows
    document.getElementById('charOutputWrapper').scrollTop = 0 
    
    if (dRecord.length > 0) makeDescKey(dRecord)
    
    
    var ies = document.querySelectorAll('.ie')
    for (i=0;i<ies.length;i++) ies[i].addEventListener('click', copyToClipboard )

    var elementsToCopy = document.querySelectorAll('.copyme')
    for (i=0;i<elementsToCopy.length;i++) elementsToCopy[i].addEventListener('click', copyToClipboard )
    }





function printPropertiesZ ( codepoint ) { 
	// displays a description of a single character in the right panel, plus any notes
	// codepoint: a decimal integer representing the Unicode scalar value of the character to be displayed
    
	var MsPadding = ''  // Will be set to a space if this is a non-spacing mark
	var description = false
	var div, span, img, table, tbody, tr, td, button, cpHex
    document.getElementById('descKey').innerHTML = ''
    dRecord = []

    // get the hex code point value
    cpHex = codepoint.toString(16).toUpperCase()
    while (cpHex.length < 4) cpHex = '0'+cpHex
    
	var listDiv = document.getElementById( 'charOutput' )
	var oldContent = document.getElementById('charInfo')
	listDiv.style.display = 'block'

	var newContent = document.createElement( 'div' )
        newContent.className = 'charInfo'
        newContent.setAttribute( 'id', 'charInfo' )

	charData = getDataFor(codepoint)
	charType = getCharType( codepoint )
	scriptGroup = findScriptGroup(codepoint)
	
    // set up navigational graphics
	div = newContent.appendChild( document.createElement( 'div' ))
	span = div.appendChild(document.createElement('span'))
		span.id = 'charNavigation';
		if (_copy2Picker) span.style.backgroundColor = '#EDE4D0'
		else span.style.backgroundColor = '#a52a2a'
	button = span.appendChild( document.createElement( 'button' ))
		button.onclick = function () { listDiv.style.display = 'none' };
		button.appendChild(document.createTextNode('Close'))
		button.className = 'clearButtonTop'
	button = span.appendChild( document.createElement( 'button' ))
		button.onclick = function () { adjacentChar( codepoint, -1 ) }
		button.appendChild(document.createTextNode('Previous'))
		button.title = sPrevChar
		button.className = 'moveForwardBack';
	button = span.appendChild( document.createElement( 'button' ))
		button.onclick = function () { adjacentChar( codepoint, 1 ) }
		button.appendChild(document.createTextNode('Next'))
		button.title = sPrevChar
		button.className = 'moveForwardBack' 


	if (charType == IN_U_DB || charType == HAN_HANG_TANG || charType == PRIVATEUSE) { 
		cRecord = charData.split(';')
		if (cRecord[CAN_COMB_CL] > 0) { MsPadding = '\u00A0' }  // ie. this is a combining character

		// draw the large character
		div = newContent.appendChild( document.createElement( 'div' ))
        div.className = 'largeCharDiv'
        
         // add img, if available and graphic toggle set
		if (document.getElementById('graphicsToggle').checked === true && charType === IN_U_DB) {
			img = div.appendChild( document.createElement( 'img' ))
            img.setAttribute( 'id', 'largeChar' )
            img.title = codepoint
            img.src = '../c/'+scriptGroup.replace(/ /g,'_')+'/large/'+cpHex+'.png'; 
            }       
        // otherwise add text
		else { 
			span = div.appendChild( document.createElement( 'span' ))
            span.setAttribute( 'id', 'largeChar' )
            span.title = codepoint
            span.className = 'largeChar'
            span.appendChild( document.createTextNode( MsPadding + getCharFromInt(codepoint) ))
			}
        
		
		// character no. & name
        span = document.createElement('span')
        span.appendChild( document.createTextNode('U+'+cpHex+':'))
        span.style.marginRight = '.75em'
        
		div = newContent.appendChild( document.createElement( 'div' ))
        div.id = 'characterName'
        div.addEventListener('click', copyToClipboard)
        div.style.cursor = 'pointer'
        div.title = 'Click on this to copy it to the clipboard.'
        div.style.marginTop = '10px'
        div.appendChild(span)
		div.appendChild( document.createTextNode( ' '+cRecord[CHAR_NAME] ))


		// add warning if this character is new or changed in a beta version
        // retired in v15 because it's easier to create a new version, so this info no longer in the database
		/*if (cRecord[15]) {
			div = newContent.appendChild( document.createElement( 'div' ));
				div.className = 'beta';
			if (cRecord[15] == 'n') { 
				div.appendChild( document.createTextNode( 'This is a new character in the beta version. The properties may change.' )); 
				}
			else { 
				div.appendChild( document.createTextNode( 'The properties of this character have changed in the beta version. That change is not yet stable. ' )); 
				a = div.appendChild( document.createElement('a'));
					a.href = '/tools/uniview_archive/uniview5.1.0f/uniview.php?char='+cRecord[0];
					a.target = 'old version';
				a.appendChild( document.createTextNode( 'See the previous version.' )); 
				}
			}*/
		
		// fill out properties table		
		table = newContent.appendChild( document.createElement( 'table' ))
        table.className = 'propsTable'
        table.width = '90%'
        table.style.clear = 'both'
		tbody = table.appendChild( document.createElement( 'tbody' ))
			
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( sGeneralCat ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( cRecord[GEN_CAT]+' - '+generalProp[ cRecord[GEN_CAT] ] ))

		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
			td.appendChild( document.createTextNode( sCanonCombClass ))
		td = tr.appendChild( document.createElement( 'td' ))
			td.appendChild( document.createTextNode( cRecord[CAN_COMB_CL]+' - '+combClass[ cRecord[CAN_COMB_CL] ] ))

		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
			td.appendChild( document.createTextNode( sBidiCat ))
		td = tr.appendChild( document.createElement( 'td' ))
			string = cRecord[BIDI_CAT] + ' - ' + bidiProp[ cRecord[BIDI_CAT] ]
			if (cRecord[9] == 'Y' ) { string += sMirrored }
			td.appendChild( document.createTextNode( string ))

		if (cRecord[DECOMP_MAP]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
            td.appendChild( document.createTextNode( sCharDecompMap ))
			td = tr.appendChild( document.createElement( 'td' ))
            td.appendChild( document.createTextNode( cRecord[DECOMP_MAP] +  ' \u00A0\u00A0 '))
            cps = cRecord[DECOMP_MAP].split(' ')
            dresult = ''
            for (n=0; n<cps.length; n++) {
                if (cps[n].charAt(0) != '[') {
                    dresult += getCharFromInt(parseInt(cps[n],16))+''
                    }
                }
            iespan = document.createElement('span')
            iespan.setAttribute('class', 'ie')
            iespan.appendChild( document.createTextNode( dresult ))
            td.appendChild( iespan )
			}

		if (cRecord[DEC_DIG_VALUE]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sDecDigitValue ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( cRecord[DEC_DIG_VALUE] ))
			}

		if (cRecord[DIG_VALUE]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sDigitValue ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( cRecord[DIG_VALUE] ))
			}

		if (cRecord[NUMERIC_VALUE]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sNumValue ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( cRecord[NUMERIC_VALUE] ))
			}

		if (cRecord[UNICODE_1_NAME]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sUnicode1Name ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( cRecord[UNICODE_1_NAME] ))
			}

		if (cRecord[ISO_COMMENT]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( s10646Comment ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( cRecord[ISO_COMMENT] ))
			}

		if (cRecord[UC_MAP]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sUppercaseMap ))
			td = tr.appendChild( document.createElement( 'td' ))
				dresult = getCharFromInt(parseInt(cRecord[UC_MAP],16))+''
				td.appendChild( document.createTextNode( cRecord[UC_MAP] +' \u00A0\u00A0 ' ))
				iespan = document.createElement('span')
				iespan.setAttribute('class', 'ie')
				iespan.appendChild( document.createTextNode( dresult ))
				td.appendChild( iespan )
			}

		if (cRecord[LC_MAP]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sLowercaseMap ))
			td = tr.appendChild( document.createElement( 'td' ))
				dresult = getCharFromInt(parseInt(cRecord[LC_MAP],16))+''
				td.appendChild( document.createTextNode( cRecord[LC_MAP] +' \u00A0\u00A0 ' ))
				iespan = document.createElement('span')
				iespan.setAttribute('class', 'ie')
				iespan.appendChild( document.createTextNode( dresult ))
				td.appendChild( iespan )
			}

		if (cRecord[TC_MAP]) {
			tr = tbody.appendChild( document.createElement( 'tr' ))
			td = tr.appendChild( document.createElement( 'td' ))
				td.appendChild( document.createTextNode( sTitlecaseMap ))
			td = tr.appendChild( document.createElement( 'td' ))
				dresult = getCharFromInt(parseInt(cRecord[TC_MAP],16))
				td.appendChild( document.createTextNode( cRecord[TC_MAP] +' \u00A0\u00A0 ' ))
				iespan = document.createElement('span')
				iespan.setAttribute('class', 'ie')
				iespan.appendChild( document.createTextNode( dresult ))
				td.appendChild( iespan );
			}
		
		// add derived age
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
			td.appendChild( document.createTextNode( 'Unicode version:' ))
			td.setAttribute('style', 'padding-bottom:15px;')
		td = tr.appendChild( document.createElement( 'td' ))
			td.appendChild( document.createTextNode( age2VersionMap[cRecord[AGE_FIELD]] ))
			td.setAttribute('style', 'padding-bottom:15px;')
		
		// add link to CLDR properties demo
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
			td.setAttribute('colspan', '2')
			a = td.appendChild( document.createElement( 'a' ))
			a.appendChild( document.createTextNode( 'Show character properties' ))
			a.setAttribute( 'href', 'http://unicode.org/cldr/utility/character.jsp?a='+cpHex )
			a.setAttribute( 'target', 'cldr' )
			a.style.fontSize = '110%'
			td.setAttribute('style', 'padding-bottom:15px;')



		//add link to UniHan db
		var pageNum = 0
		var approx = ''
		if (scriptGroup == 'CJK Unified Ideographs') { pageNum = Math.floor(((codepoint-0x4E00)/40)+2); blockstart = '4E00'; approx = ' [35Mb file!]'  }
		if (scriptGroup == 'CJK Unified Ideographs Extension A') { pageNum = Math.floor(((codepoint-13312)/56.25)+2); blockstart = '3400'; approx = ', approx [6Mb file!]' }
		if (scriptGroup == 'CJK Unified Ideographs Extension B') { pageNum = Math.floor(((codepoint-0x20000)/58.67)+2); blockstart = '20000'; approx = ', approx [40Mb file!]' }
		if (scriptGroup == 'CJK Unified Ideographs Extension C') { pageNum = Math.floor(((codepoint-0x2A700)/78.26)+2); blockstart = '2A700'; approx = ', approx' }
		if (scriptGroup == 'CJK Unified Ideographs Extension D') { pageNum = Math.floor(((codepoint-0x2B740)/80)+2); blockstart = '2B740' }
		if (scriptGroup == 'CJK Unified Ideographs Extension E') { pageNum = Math.floor(((codepoint-0x2B820)/80)+2); blockstart = '2B820' }
		if (scriptGroup == 'CJK Unified Ideographs Extension F') { pageNum = Math.floor(((codepoint-0x2CEB0)/80)+2); blockstart = '2CEB0' }
		if (scriptGroup == 'Hangul Syllables') { pageNum = Math.floor(((codepoint-0xAC00)/256)+2); blockstart = 'AC00' }
			
		// add link to Unihan db
		if (pageNum > 0 && scriptGroup != 'Hangul Syllables') {
			p = newContent.appendChild( document.createElement( 'p' ))
            p.style.marginTop = "18px"
			p.appendChild( document.createTextNode( 'View data in ' ))
			a = p.appendChild( document.createElement( 'a' ))
			a.appendChild( document.createTextNode( 'UniHan database' ))
			a.setAttribute( 'href', 'http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint='+cpHex+'&useutf8=true' )
			a.setAttribute( 'target', 'unihan' )
			}
		
		// add pointer to PDF code chart page
		if (pageNum > 0 && scriptGroup) {
			p = newContent.appendChild( document.createElement( 'p' ))
			p.appendChild( document.createTextNode( 'View in ' ))
			a = p.appendChild( document.createElement( 'a' ))
			a.appendChild( document.createTextNode( 'PDF code charts' ))
			a.setAttribute( 'href', 'http://www.unicode.org/charts/PDF/U'+blockstart+'.pdf#page='+pageNum )
			a.setAttribute( 'target', 'unihan' )
			p.appendChild( document.createTextNode( ' (page '+pageNum+approx+')' ))
			}
			
		
		// add character if in graphics mode
		if (document.getElementById('graphicsToggle').checked == true) { 
			tr = tbody.appendChild( document.createElement( 'tr' ))
            td = tr.appendChild( document.createElement( 'td' ))
            td.appendChild( document.createTextNode( 'As text:' ))
            td = tr.appendChild( document.createElement( 'td' ))
            td.className = 'astext'
            td.id = 'characterAsText'
            td.addEventListener('click', copyToClipboard)
            td.title = 'Click on this to copy it to the clipboard.'
            td.style.cursor = 'pointer'
            td.appendChild( document.createTextNode( MsPadding + getCharFromInt(codepoint) ))
			}

		// add decimal value
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( 'Decimal:' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( codepoint ))

		// add NCR value
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( 'HTML escape:' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( '&#x'+codepoint.toString(16).toLocaleUpperCase()+';' ))

		// add URL encoded value
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( 'URL escape:' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( convertChar2pEsc(codepoint) ))

		// add link to Conversion tool
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.setAttribute( 'colspan', '2')
        td.innerHTML = '<a href="../app-conversion/index.html?q='+getCharFromInt(codepoint)+'" target="conversion">More alternative forms</a>'


			
		//add link to CLDR
		//p = newContent.appendChild( document.createElement( 'p' ))
        //p.style.marginTop = "18px"
		//p.appendChild( document.createTextNode( 'More properties at ' ))
		//a = p.appendChild( document.createElement( 'a' ))
		//a.appendChild( document.createTextNode( 'See more Character Properties' ))
		//a.setAttribute( 'href', 'http://unicode.org/cldr/utility/character.jsp?a='+cpHex )
		//a.setAttribute( 'target', 'cldr' )
		//a.style.fontSize = '120%'
		
		//add link to decodeUnicode
		//p = newContent.appendChild( document.createElement( 'p' ))
        //p.style.marginTop = "0px"
		//p.appendChild( document.createTextNode( 'Descriptions at ' ))
		//a = p.appendChild( document.createElement( 'a' ))
		//a.appendChild( document.createTextNode( 'decodeUnicode' ))
		//a.setAttribute( 'href', 'http://www.decodeunicode.org/U+'+cpHex )
		//a.setAttribute( 'target', 'decodeunicode' )
		
		//add link to FileFormat
		//p = newContent.appendChild( document.createElement( 'p' ))
        //p.style.marginTop = "0px"
		//p.appendChild( document.createTextNode( 'Java data at ' ))
		//a = p.appendChild( document.createElement( 'a' ))
		//a.appendChild( document.createTextNode( 'FileFormat' ))
		//a.setAttribute( 'href', 'http://www.fileformat.info/info/unicode/char/'+cpHex )
		//a.setAttribute( 'target', 'fileformat' )
		

		
		

		//find script group
		_charScriptGroup = scriptGroup
		p = newContent.appendChild( document.createElement( 'p' ))
        p.style.marginTop = "18px"
		strong = p.appendChild( document.createElement( 'strong' ))
		strong.appendChild( document.createTextNode( sScriptGroup ))
		a = p.appendChild( document.createElement( 'a' ))
        a.href = '#'
        a.onclick = function () { showSelection( getRange(_charScriptGroup) ); return false; }
		a.appendChild( document.createTextNode( _charScriptGroup ))
		
		
		// display script group
		p = newContent.appendChild( document.createElement( 'p' ))
		p.style.marginTop = "18px"
		strong = p.appendChild( document.createElement( 'strong' ))
		strong.appendChild( document.createTextNode( 'Script group: ' ))
		span = p.appendChild( document.createElement( 'span') )
        span.className = 'subcat';
		span.appendChild( document.createTextNode( st[cRecord[SUBTITLE_FIELD]] ))


		// return block name if this character listed as contained in block doc
		var blockfile = charInfoPointer(cpHex)
		
		
		// display Description heading
		if (desc[eval('0x'+cpHex)] || blockfile) { 
			p = newContent.appendChild( document.createElement( 'p' ))
            p.style.marginTop = "18px"
			strong = p.appendChild( document.createElement( 'strong' ))
			strong.appendChild( document.createTextNode( sDescription ))

			// display any Unicode descriptions
			if (desc[eval('0x'+cpHex)]) {
				dRecord = desc[eval('0x'+cpHex)].split('¶')
				description = true
				for (var j=0; j < dRecord.length; j++ ) {
                    dRecord[j] = dRecord[j].replace(/\[/,'<').replace(/\]/,'>')
                    
                    if (dRecord[j][0] === '\u2192') {
                        temp = dRecord[j].replace(/\(/,'').replace(/\)/,'')
                        temparray = temp.split('-')
                        thecharacter = String.fromCodePoint('0x'+temparray[1].trim())
                        temp = `\u2192 ${ temparray[1] } ${ thecharacter } ${ temparray[0].replace(/\u2192/,'') }`
                        dRecord[j] = temp
                        }
					p.appendChild( document.createTextNode( dRecord[j] ))
					p.appendChild( document.createElement( 'br' ))
					}
				}


			// display notes if there are any, and if required
			if (blockfile && document.getElementById('showNotesToggle').checked) {  
				p.appendChild( document.createElement( 'br' ))
				span = p.appendChild( document.createElement('span') )
				span.className = 'notesexpl'
				a = span.appendChild( document.createElement('a'))
				a.href = '../scripts/'+blockfile+'/block.html#char'+cpHex
				a.target = 'blockdata'
				a.appendChild( document.createTextNode('Open the notes page in a separate window.'))
				span.style.fontSize = '80%'

				document.getElementById('notesIframe').src = '../scripts/'+blockfile+'/block.html?char='+cpHex
				}
			// if _showNotes isn't on, just mention that there are some notes
			else if (blockfile) {  
				p.appendChild( document.createElement( 'br' ))
				span = p.appendChild( document.createElement('span') )
				span.className = 'notesexpl'
				span.appendChild( document.createTextNode( 'Notes are available for this character.' ))
				span.style.fontSize = '80%'

				document.getElementById('notesIframe').src = 'blank.html'
				}
			else document.getElementById('notesIframe').src = 'blank.html'
			}
		else document.getElementById('notesIframe').src = 'blank.html'
		}
		
		
		
	else { // this is either  an unassigned character or a surrogate character
		var group = findScriptGroup(codepoint)
		
		// character no. & name
		div = newContent.appendChild( document.createElement( 'div' ))
        div.style.marginTop = '10px'
		var hexcpvalue = cpHex
		while (hexcpvalue.length < 4) { hexcpvalue = '0'+hexcpvalue; }
		div.appendChild( document.createTextNode( 'U+'+hexcpvalue+' '+'Unassigned character.' ))
		
		//find script group
		p = newContent.appendChild( document.createElement( 'p' ))
        p.style.marginTop = "18px"
		strong = p.appendChild( document.createElement( 'strong' ))
		strong.appendChild( document.createTextNode( sScriptGroup ))
		a = p.appendChild( document.createElement( 'a' ))
        a.href = '#'
        a.onclick = function () { showSelection( getRange(scriptGroup) ); return false; }
		a.appendChild( document.createTextNode( scriptGroup ))
		}
		
		
	var removedNode = listDiv.replaceChild( newContent, oldContent )

		
	div = newContent.appendChild( document.createElement( 'div' ))
    div.id = 'charNavigation'
    if (_copy2Picker) div.style.backgroundColor = '#EDE4D0'
    else div.style.backgroundColor = '#a52a2a'
	button = div.appendChild( document.createElement( 'button' ))
    button.onclick = function () { listDiv.style.display = 'none'; }
    button.appendChild(document.createTextNode('Close'))
    button.className = 'clearButtonBottom'
    
    // ensure that the top of the information shows
    document.getElementById('charOutputWrapper').scrollTop = 0 
    
    if (dRecord.length > 0) makeDescKey(dRecord)
	}	


var timeout	= 500;
var closetimer	= 0;
var ddmenuitem	= 0;

// open hidden layer
function mopen(id) {	
	// cancel close timer
	mcancelclosetime();
	// close old layer
	if(ddmenuitem) ddmenuitem.style.visibility = 'hidden';
	// get new layer and show it
	ddmenuitem = document.getElementById(id);
	ddmenuitem.style.visibility = 'visible';
	}
	
// close showed layer
function mclose() {
	if(ddmenuitem) ddmenuitem.style.visibility = 'hidden';
	}

// go close timer
function mclosetime() {
	closetimer = window.setTimeout(mclose, timeout);
	}

// cancel close timer
function mcancelclosetime(){
	if(closetimer) {
		window.clearTimeout(closetimer);
		closetimer = null;
		}
	}


function makeDescKeyX (lines) {
    // makes a (tailored) key for items in a description list
    // called when building the right side of the app
    //console.log('makeDescKey(', lines, ')')
    
    out = ''
    legend = ''
    
    const uniqueSet = new Set()
    for (i=1;i<lines.length;i++) uniqueSet.add(lines[i][0])
    const backToArray = [...uniqueSet]
        
    out += '<div id="descKeyList">Key to symbols:</div>'

    for (j=0;j<backToArray.length;j++) {
        switch (backToArray[j]) {
            case '\u2022': legend = 'Informative note'; break
            case '\u2192': legend = 'Related characters'; break
            case '\u003D': legend = 'Informative alias'; break
            case '\u0025': legend = 'Normative alias'; break
            case '\u2261': legend = 'Canonical equivalent'; break
            case '\u2248': legend = 'Compatibility equivalent'; break
            case '\u007E': legend = 'Standardised variant'; break
            }
        // change % to 203B
        if (backToArray[j] === '%') backToArray[j] = '\u203B'
        out += `<div><span>${ backToArray[j] }</span> ${ legend }</div>`
        }
    
    //out += '</div>'
    
    document.getElementById('descKey').innerHTML = out
    }


function makeDescKey (lines) {
    // makes a (tailored) key for items in a description list
    // called when building the right side of the app
    //console.log('makeDescKey(', lines, ')')
    
    out = ''
    legend = ''
    
    const uniqueSet = new Set()
    for (i=1;i<lines.length;i++) uniqueSet.add(lines[i][0])
    const backToArray = [...uniqueSet]
        
    out += '<details id="descKeyList"><summary>Key to symbols:</summary>'

    for (j=0;j<backToArray.length;j++) {
        switch (backToArray[j]) {
            case '\u2022': legend = 'Informative note'; break
            case '\u2192': legend = 'Related characters'; break
            case '\u003D': legend = 'Informative alias'; break
            case '\u0025': legend = 'Normative alias'; break
            case '\u2261': legend = 'Canonical equivalent'; break
            case '\u2248': legend = 'Compatibility equivalent'; break
            case '\u007E': legend = 'Standardised variant'; break
            }
        // change % to 203B
        if (backToArray[j] === '%') backToArray[j] = '\u203B'
        out += `<div><span>${ backToArray[j] }</span> ${ legend }</div>`
        }
    
    out += `</details>`
    
    document.getElementById('descKey').innerHTML = out
    }


function switchpanel (panel) { 
	document.getElementById('initialpanel').style.display = 'none';
	document.getElementById('rangepanel').style.display = 'none';
	document.getElementById('optionspanel').style.display = 'none';

	document.getElementById(panel).style.display = 'block';
	
	document.getElementById('initialpaneltab').className = '';
	document.getElementById('rangepaneltab').className = '';
	document.getElementById('optionspaneltab').className = '';
	var tab = panel+'tab';
	document.getElementById(tab).className = 'ontab';
	}


function tabswitch (target, others) { 
	// target: the id value of the tab you want to open
	// others: a list of id values of tabs to close, separated by spaces
	var othersArray = others.split(' ');
	for (var i=0; i<othersArray.length; i++) {
		document.getElementById(othersArray[i]).style.display = 'none';
		}

	document.getElementById(target).style.display = 'block';
	
	for (var i=0; i<othersArray.length; i++) {
		document.getElementById(othersArray[i]+'tab').className = '';
		}
	document.getElementById(target+'tab').className = 'ontab';
	}


function scriptInfoPointer (codepoint) {
	// if this is the first character of a block, and if there
	// is block info available for that block, returns a pointer to
	// the block data object
	// range: two hex codepoints separated by colon
	// returns: a pointer to the scriptGroups array, if successful
	//          otherwise ''
	
	charNum = parseInt(codepoint,16)
	if (charNum < 128) return 1
	var i=1
	while ( i<scriptGroups.length && charNum > scriptGroups[i][0] ) {
		i++
		}
	if ( i == scriptGroups.length ) return( '' )
	if ( scriptGroups[i][0] == charNum && scriptGroups[i][3]) return( i )
	return( '' )
	}


function foundInList (ch, range) { 
	// takes a list of decimal numbers, with ranges represented as xxx:yyy
	// and a decimal code point, and returns true if the codepoint is in the list
	// ch: the codepoint to search for
	// range: the list of codepoints, with ranges separated by spaces
	
	var runs = range.split(' ')
	ch = parseInt(ch)
	for (i=0;i<runs.length;i++) {
		var startEnd = runs[i].split(":")
		//alert(i+'--'+startEnd[0]+' '+startEnd[1])
		if (startEnd.length == 1 && ch == parseInt(startEnd[0])) { return true } 
		else if (startEnd.length > 1 && (ch >= parseInt(startEnd[0]) && ch <= parseInt(startEnd[1]))) { return true }
		}
	return false
	}


function charInfoPointerX (codepoint) {
    // SUPERCEDED!  This function requires scriptGroups to be constantly updated each time
    // a character description is added to a block.
    // The new version below simply detects whether scriptGroups has anything in field 3
    // If so, and there is no character description, the display function will still handle it
    // the new version removes the call to foundInList
    
	// find the name of the file in the /block/ directory, if one exists,
	// for the character in codepoint
	// only returns the block name if the code point is listed in the 4th field of a scriptGroups row
	// codepoint: hex codepoint value
	// returns: the filename, if successful
	//          otherwise ''
	
	charNum = parseInt(codepoint,16); 
	if (charNum < 128) { return scriptGroups[0][3]; }
	var i=1;
	while ( i<scriptGroups.length && charNum > scriptGroups[i][1] ) {
		i++; 
		} 
	if ( i == scriptGroups.length ) { return ''; }
	else { 
		if (foundInList(charNum, scriptGroups[i][4])) {	return( scriptGroups[i][3] ); }
		else { return '' }
		}
	}


function charInfoPointer (codepoint) {
	// find the name of the file in the /block/ directory, if one exists,
	// for the character in codepoint
	// returns the block name if one appears in the 5th field of a scriptGroups row
	// codepoint: hex codepoint value
	// returns: the ISO code (which is now the same as the file path), if successful
	//          otherwise ''
	
	charNum = parseInt(codepoint,16)
	if (charNum < 128) { return scriptGroups[0][3] }
	var i=1
	while ( i<scriptGroups.length && charNum > scriptGroups[i][1] ) i++
	if ( i == scriptGroups.length ) { return '' }
	else { 
		if (scriptGroups[i][4]) { return( scriptGroups[i][4] ) }
		else { return '' }
		}
	}


function displayBlockData (block) {
	// displays block data in the right hand pane, if any
	// block: string from 4th field of scriptGroups record for block in question, identifies 
	// the object to be used, eg. myanmar
	// console.log('displayBlockData (', block, ')')
	var blockname = scriptGroups[block][3]
	
	info = window.open('../scripts/links.html?iso='+blockname, 'info')
    info.focus()
	}



function createAnnotatedList (start, end) {
	// retunrs a list of all characters from the start to the end codepoint
	// start: dec, first codepoint
	// end: dec, last codepoint
	
	var str = '';
	var ptr = start;
	while (ptr < end+1) {
		if (U[ptr]) { str += getCharFromInt(ptr); }
		ptr++;
		}
	return str;
	}



function  dec2hex2 ( textString ) {
	var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	return hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
	}


function convertChar2pEsc ( n ) {
	// codepoint: dec, the codepoint to be transformed
	var outputString = "";
	if (n == '') { return ""; }
	if (n == 0x20) { outputString += '%20'; }
	else if (n >= 0x41 && n <= 0x5A) { outputString += String.fromCharCode(n); } // alpha
	else if (n >= 0x61 && n <= 0x7A) { outputString += String.fromCharCode(n); } // alpha
	else if (n >= 0x30 && n <= 0x39) { outputString += String.fromCharCode(n); } // digits
	else if (n == 0x2D || n == 0x2E || n == 0x5F || n == 0x7E) { outputString += String.fromCharCode(n); } // - . _ ~
	else if (n <= 0x7F) { outputString += '%'+dec2hex2(n); }
	else if (n <= 0x7FF) { outputString += '%'+dec2hex2(0xC0 | ((n>>6) & 0x1F)) + '%' + dec2hex2(0x80 | (n & 0x3F)); } 
	else if (n <= 0xFFFF) { outputString += '%'+dec2hex2(0xE0 | ((n>>12) & 0x0F)) + '%' + dec2hex2(0x80 | ((n>>6) & 0x3F)) + '%' + dec2hex2(0x80 | (n & 0x3F)); } 
	else if (n <= 0x10FFFF) {outputString += '%'+dec2hex2(0xF0 | ((n>>18) & 0x07)) + '%' + dec2hex2(0x80 | ((n>>12) & 0x3F)) + '%' + dec2hex2(0x80 | ((n>>6) & 0x3F)) + '%' + dec2hex2(0x80 | (n & 0x3F)); } 
	else { outputString += '!Error ' + dec2hex(n) +'!'; }
	return( outputString );
	}


// close layer when click-out
//document.onclick = mclose; 



function addSpacesToPicker (sep) {
	// adds a separator between each character in the edit buffer
	// sep: a string to use as separator
	
	var charList = document.getElementById('picker').value
	var cpList = convertChar2CP(charList)
	var cpArray = cpList.split(' ')
	var out = ''
	for (var i=0;i<cpArray.length-1;i++) {
		out += convertCP2Char(cpArray[i])+sep
		}
	out += convertCP2Char(cpArray[cpArray.length-1])
	document.getElementById('picker').value = out
	}

function countPickerChars () {
	// counts how many characters are in the text area
	
	var charList = document.getElementById('picker').value
	var cpList = convertChar2CP(charList)
	var cpArray = cpList.split(' ')
	return cpArray.length;
	}

function convertPicker2Hex () {
    // converts the characters in the text area to a sequence of hex codepoint values
    
    var chars = [...document.getElementById('picker').value]
    var out = ''
    for (let i=0;i<chars.length;i++) {
        var temp = chars[i].codePointAt(0).toString(16).toUpperCase()
        while (temp.length < 4) temp = '0'+temp
        out += temp+' '
        }
    document.getElementById('picker').value = out.trim()
    }

function convertPicker2CharsOLD () {
    // converts a sequence of hex codepoint values in the text area to characters
    
    var str = document.getElementById('picker').value
    str = str.replace(/\&|\#|x|;|U|\+|\\|u/g,' ')
    str = str.replace(/\s+/g,' ')
    str = str.trim()
    
    var chars = str.split(' ')
    var out = ''
    for (let i=0;i<chars.length;i++) {
        var temp = chars[i].codePointAt(0).toString(16).toUpperCase()
        out += String.fromCodePoint(parseInt(chars[i],16))
        }
    document.getElementById('picker').value = out.trim()
    }


function convertPicker2Chars () {
    // converts a sequence of hex codepoint values in the text area to characters
    
    var str = document.getElementById('picker').value
    str = str.replace(/\&|\#|x|;|U|\+|\\|u/g,' ')
    str = str.replace(/\s+/g,' ')
    str = str.trim()
    
    document.getElementById('picker').value = convertGreenNumbers2Char(str, 'hex')
    }


function rotatePickerContent () {
	// takes the content of the text area and turns it into a list, one item per line
	// if there is a space, it segments on spaces, otherwise each character
	
	var text = document.getElementById('picker').value
	var itemArray = []
	if (text.includes(' ')) itemArray = text.split(' ')
	else itemArray = [...text]
	
	out = ''
	for (let i=0;i<itemArray.length;i++) out += itemArray[i]+'\n'
	
	document.getElementById('picker').value = out
	}





function togglePanelDestinationX () {
	var buttons
	if(_copy2Picker) { 
		document.getElementById('clickDirection').innerHTML='<img src="images/sendToPanel.png" alt="🢂" title="Add character information to the right panel.">'
		document.getElementById('clickDirection').style.marginTop='4em'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#a52a2a'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (var i=0;i<buttons.length;i++)  buttons[i].style.color = 'white'
			}
		_copy2Picker=false
		} 
	else{ 
		document.getElementById('clickDirection').innerHTML='<img src="images/sendToText.png" alt="🢅" title="Send characters to the text area.">'
		document.getElementById('clickDirection').style.marginTop='0'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#EDE4D0'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (i=0;i<buttons.length;i++)  buttons[i].style.color = '#666'
			}
		_copy2Picker=true
		}
	}





function togglePanelDestination () {
	var buttons
	if(_copy2Picker) { 
		document.getElementById('clickDirection').innerHTML='<img src="images/sendToPanel.png" alt="🢂" title="Add character information to the right panel.">'
		//document.getElementById('clickDirection').style.marginTop='4em'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#a52a2a'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (var i=0;i<buttons.length;i++)  buttons[i].style.color = 'white'
			}
		_copy2Picker=false
		} 
	else{ 
		document.getElementById('clickDirection').innerHTML='<img src="images/sendToText.png" alt="🢅" title="Send characters to the text area.">'
		document.getElementById('clickDirection').style.marginTop='0'
		if (document.getElementById('charNavigation')) {
			document.getElementById('charNavigation').style.backgroundColor='#EDE4D0'
			buttons = document.getElementById('charNavigation').querySelectorAll('button')
			for (i=0;i<buttons.length;i++)  buttons[i].style.color = '#666'
			}
		_copy2Picker=true
		}
	}



// FUNCTIONS FOR EXPORTING TEXT AREA TO ANOTHER APP


function showCodepoints () {
	var output = document.getElementById('output')
	showNameDetails(getHighlightedText(output), defaults.language, template.blocklocation, 'c', document.getElementById('panel') )
	document.querySelector('#panel #title').style.fontFamily = output.style.fontFamily
	output.focus()
	}

function openEscapeWindow () {
	var chars =  document.getElementById('picker').value
	var converter = window.open('../app-conversion/index.html?q='+	encodeURIComponent(chars), 'converter') 
	converter.focus()
	}

function openAnalyseWindow () {
	var chars =  document.getElementById('picker').value
	var analyse = window.open('../app-analysestring/index.html?chars='+	encodeURIComponent(chars), 'analyse') 
	analyse.focus()
	}

function openUniqueAnalyseWindow () {
	var chars =  document.getElementById('picker').value
    filtered = [...chars]
    const uniqueSet = new Set(filtered)
    const backToArray = [...uniqueSet]
    chars = backToArray.join('')
	analyse = window.open('../app-analysestring/index.html?chars='+	encodeURIComponent(chars), 'analyse')
	analyse.focus()
	}

function openListWindow () {
	var chars =  document.getElementById('picker').value
	var listchar = window.open('../app-listcharacters/index.html?chars='+	encodeURIComponent(chars), 'listchar') 
	listchar.focus()
	}

function openUsageWindow () {
	var chars =  document.getElementById('picker').value
    // reduce characters to one of each
    filtered = [...chars]
    const uniqueSet = new Set(filtered)
    const backToArray = [...uniqueSet]
    chars = backToArray.join('')
	var usage = window.open('../app-charuse/index.html?charlist='+	encodeURIComponent(chars), 'usage') 
	usage.focus()
	}

function openFontlistWindow (scriptName) {
	var chars =  document.getElementById('picker').value
    scriptName = ''
    if (document.getElementById('blockname')) {
        scriptName = document.getElementById('blockname').textContent.trim()
	    flist = window.open('../scripts/fontlist/index.html?script='+scriptName+'&text='+ encodeURIComponent(chars), 'flist')
        }
    else alert('Can only send to the Font Lister if a script code is displayed.\nChoose a block in order to display one.')
	flist.focus()
	}

function openListbidiWindow (scriptName) {
	var chars =  document.getElementById('picker').value
	var listbidi = window.open('../scripts/apps/listbidi/index.html?chars='+encodeURIComponent(chars), 'listbidi') 
	listbidi.focus()
	}
    
function openListcatsWindow (scriptName) {
	var chars =  document.getElementById('picker').value
	var listcats = window.open('../scripts/apps/listcategories/index.html?chars='+	encodeURIComponent(chars), 'listcats') 
	listcats.focus()
	}

function openListlinebreakWindow (scriptName) {
	var chars =  document.getElementById('picker').value
	var listlines = window.open('../scripts/apps/listlinebreak/index.html?chars='+	encodeURIComponent(chars), 'listlines') 
	listlines.focus()
	}

function openListindicWindow (scriptName) {
	var chars =  document.getElementById('picker').value
	var listindic = window.open('../scripts/apps/listindic/index.html?chars='+encodeURIComponent(chars), 'listindic') 
	listindic.focus()
	}

function openScriptPageWindow () { // TBD !
    if (template.noteslocation === '') return
	var output = document.getElementById('output')
	var chars = getHighlightedText(output)
    chars = [...chars]
	var scriptdesc = window.open('../scripts/'+template.noteslocation+'?index='+encodeURIComponent(chars[0]), 'scriptdesc')
	scriptdesc.focus()
	}

function openBlockPageWindow () {
	var chars =  document.getElementById('picker').value.trim()
    var char = chars.codePointAt(0)
    var infoptr = getScriptInfoPointer(char)-1
    var hex = char.toString(16).toUpperCase()
    while (hex.length < 4) hex = '0'+hex
    
    if (scriptGroups[infoptr][5]) {
        var scriptName = scriptGroups[infoptr][5].trim()
        var blockdesc = window.open('../scripts/'+scriptName+'/block.html#char'+hex, 'blockdesc') 
        blockdesc.focus()
        }
    else alert('Can only open a Character Notes page if a corresponding notes page exists.\nThere is no notes page for the character U+'+hex+'.')
	}

function openGClusterWindow () {
	var chars =  document.getElementById('picker').value
	var gcluster = window.open('../scripts/apps/graphemes/index.html?q='+encodeURIComponent(chars), 'gcluster') 
	gcluster.focus()
	}




function getScriptInfoPointer (charNum) {
    // finds the array item corresponding to the script of a character
	// codepoint: dec code point value
	// returns: a pointer to the scriptGroups array, if successful
	//          otherwise ''
	
	if (charNum < 128) return 1
	var i=1
	while ( i<scriptGroups.length && charNum > scriptGroups[i][0] ) {
		i++
		}
    console.log(charNum,i)
	if ( i == scriptGroups.length ) return( '' )
    else return i
	}



// EVENTS

function copyToClipboard (evt) {
    // Copies the content of an element to the clipboard when clicked on
    // Currently applied to #characterName and #characterAsText
    console.log(evt)
    var node = evt.target
	node.contentEditable=true
	node.focus()
	document.execCommand('selectAll')
	document.execCommand('copy')
	node.contentEditable=false
	}






