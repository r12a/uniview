# Converts UnicodeData.txt file to Names.php

open( SOURCEFILE, "UnicodeData.txt" ) || die "Could not read file.";
open( JSFILE, ">Names.php" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new names.php file...\n";
print JSFILE "<?php\n\$names = array();\n";
while ( <SOURCEFILE> ) {
	chomp;
	s/</[/g; s/>/]/g;
	@cRecord = split( /;/ );
	print JSFILE "\$names[", hex( @cRecord[0] ),  "]=\"", @cRecord[1], "\";\n";
	print STDOUT $counter++, ' ' ;
	}
print JSFILE "?>";

close( SOURCEFILE ) || die "Can't close source file";
close( JSFILE ) || die "Can't close jsfile";