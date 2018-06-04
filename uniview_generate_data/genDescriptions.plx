# Converts NamesList.txt file to descriptions.php
# you need to manually remove the first entry at the moment

# 090726  made it output a php file, rather than js, and changed name from genNamesList to genDescriptions
# 080128	made it output array with direct access, rather than one that needs to be searched serially
#			fixed bug that meant it was producing spurious entries in multiline comments


open( SOURCEFILE, "NamesList.txt" ) || die "Could not read NamesList.txt.";
open( OUTFILE, ">descriptions.js" ) || die "Could not open descriptions.js.";
open( STFILE, ">subtitles.js" ) || die "Could not open subtitles.js.";
open( REFFILE, ">tempSubtRefs.php" ) || die "Could not open tempSubtRefs.php.";

$counter = 0;
$buffer = '';
$currHex = '';
$titlecount = -1;

print OUTFILE "var desc = new Array();\n";
print STFILE "var st = new Array();\n";
print REFFILE "<?php\n\$stref = array();\n";
print STDOUT "Creating new descriptions.js file...\n";
while ( <SOURCEFILE> ) {
	if ( (index( $_, '@' ) != 0) && (index( $_, "\t\t") != 0) ) { # if line doesn't begin with @ or two tabs
		chomp;
		s/</[/;
		s/>/]/;
		s/\"/\'/g;
		s/\t\*/\t•/;
		s/\tx/\t→/;
		s/\t:/\t≡/;
		s/\t#/\t≈/;
		s/\t/¶/;
		if ( index( $_, '¶' ) != 0 ) {		# if this line begins with a number
			if ( $buffer ne '' ) {		# if we have collected data
				print OUTFILE 'desc[',  hex( $currHex ), ']="', $buffer, '";', "\n";  # print info to descriptions file
				$buffer = '';
				}
			$currHex = substr( $_, 0, index( $_, '¶') );	
			print REFFILE '$stref[', hex( $currHex ), ']=', $titlecount, ";\n"; 	# print current subtitle number to temp ref file
			print STDOUT $counter++, ' ' ;
			}
		else {  # this is data to collect in the buffer
			$buffer .= $_ ;
			}
		}
	elsif ( index( $_, "@\t" ) == 0) { # this is a subcategory
		if ( $buffer ne '' ) {		# if we have collected data
			print OUTFILE 'desc[', hex( $currHex ), ']="', $buffer, '";', "\n";  # print info to descriptions file
			$buffer = '';
			}
		chomp;
		$titlecount++;
		print STFILE "st[$titlecount]=\"", substr( $_, 3), "\";\n";
		}
	}	

#	print OUTFILE '$desc[0x', substr( $buffer, 0, index( $buffer, '¶') ), ']='; 	# print the hex number as an index to the array
#				print OUTFILE "\"", substr( $buffer, index( $buffer, '¶')+2 ), "\";\n";			# print the rest of the stored line
#				print REFFILE '$stref[0x', substr( $buffer, 0, index( $buffer, '¶') ), ']=', $titlecount, ";\n"; 	# print current subtitle number to ref file
#				$buffer = substr( $_, 0, index( $_, '¶') );									# and set store to be the new number
#				print STDOUT $counter++, ' ' ;
#				print STDOUT $counter++, ' ', $buffer, "\n" ;
#				}
#			else {	# this line is start of a new character record
#				if ($buffer != '') { print REFFILE '$stref[0x', $buffer, ']=', $titlecount, ";\n" }; 	# print current subtitle number to ref file
#				$buffer = substr( $_, 0, index( $_, '¶') );		#	so take just the number and start a new stored line
#				}
#			}
#		else {	$buffer .= $_ ;									# else, just add this line to the currently stored line
#			}
#		}
#	else {
#		if ( (index( $_, "@\t" ) == 0) ) {
#				print OUTFILE '$desc[0x', substr( $buffer, 0, index( $buffer, '¶') ), ']='; 	# print the hex number as an index to the array
#				print OUTFILE "\"", substr( $buffer, index( $buffer, '¶')+2 ), "\";\n";			# print the rest of the stored line
#				print REFFILE '$stref[0x', substr( $buffer, 0, index( $buffer, '¶') ), ']=', $titlecount, ";\n"; 	# print current subtitle number to ref file
#				$buffer = '';
#			chomp;
#			$titlecount++;
#			print STFILE "st[$titlecount]=\"", substr( $_, 3), "\";\n";
#			}
#		}
#	}

print REFFILE "?>";

close( SOURCEFILE ) || die "Can't close NamesList.txt";
close( OUTFILE ) || die "Can't close descriptions.php";
close( STFILE ) || die "Can't close subtitles.js";
close( REFFILE ) || die "Can't close tempSubtRefs.php";
