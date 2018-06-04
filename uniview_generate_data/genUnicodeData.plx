# Converts UnicodeData-XXX.txt file to tempu.php
# doGraphics.php completes the job

open( SOURCEFILE, "UnicodeData.txt" ) || die "Could not read file.";
open( JSFILE, ">tempu.php" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new tempu.js file...\n";
print JSFILE "<?php\n\$U = array();\n";
while ( <SOURCEFILE> ) {
	chomp;
	s/</[/g; s/>/]/g;
	@cRecord = split( /;/ );
	print JSFILE "\$U[", hex( @cRecord[0] ),  "]=\"", $_, "\";\n";
	print STDOUT $counter++, ' ' ;
	}
print JSFILE "?>";

close( SOURCEFILE ) || die "Can't close source file";
close( JSFILE ) || die "Can't close target file";