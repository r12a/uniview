<?php
# outputs a u.js file that adds information about where the graphic for each 
# character comes from: m means mygraphics, empty means decodeunicode
mb_internal_encoding("UTF-8");

include('tempu.php');
include('tempSubtRefs.php');  // sets the stref array
include('age.php');  // contains the derived ages array: $age
include('graphicranges.php'); 


$graphicInfo = Array ();
for ($i = 0; $i<count($ranges); $i++) {
	$range = explode(':',  $ranges[$i]);
	$start = hexdec($range[0]);
	$end = hexdec($range[1]);
	for ($j=$start; $j<$end+1; $j++) {
		$graphicInfo[$j] = 'm';
		}
	}

$Ucounter = 0;
$totalGraphics = 0;
$diff = 'U = new Array();'."\n";

while($Ucounter < 1114110) {
	#print $Ucounter.'   '.$Uocounter.'*'."\n";
	if (isset($a[$Ucounter])) { $cAge = $a[$Ucounter]; }
	else { $cAge = '1.0'; }
	if (isset($U[$Ucounter]) && isset($graphicInfo[$Ucounter]) ) {
		$diff .= 'U['.$Ucounter.']="'.$U[$Ucounter].';;m;'.$stref[$Ucounter].";".$cAge."\";\n";
		$Ucounter++;
		$totalGraphics++;
		}
	else if (isset($U[$Ucounter])) {
		if (isset($stref[$Ucounter])) {
			$diff .= 'U['.$Ucounter.']="'.$U[$Ucounter].';;;'.$stref[$Ucounter].";".$cAge."\";\n";
			}
		else { // things like start of CJK blocks etc
			$diff .= 'U['.$Ucounter.']="'.$U[$Ucounter].';;;;'.";".$cAge."\";\n";
			}
		$Ucounter++;
		}
	else {
		$Ucounter++;
		}
	}
print '<p>Done</p>';
print '<p>'.$totalGraphics.' graphics.</p>';

$outfile = fopen('u.js','w');
fwrite( $outfile, $diff  );
fclose($outfile);



?>