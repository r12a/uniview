# Converts Blocks.txt file to scriptGroups.js

open( SOURCEFILE, "Blocks.txt" ) || die "Could not read file.";
open( OUTFILE, ">scriptGroups.js" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new scriptGroups.js file...\n";
print OUTFILE "var titles = new Array(\n";
while ( <SOURCEFILE> ) {
	if ( index( $_, '#' ) != 0 ) { 
		chomp;
		s/\.\./¶/;
		s/; /¶/;
		@cRecord = split( /¶/ );
		if (index($_, '¶') > 0) { print OUTFILE "\[", hex( @cRecord[0] ), ",", hex( @cRecord[1] ), ",\"", @cRecord[2], "\",\"\",\"\"],\n" ; }
		print STDOUT $counter++, ' ' ;
		}
	}
print OUTFILE "\"▲\");";

print OUTFILE "\n\n\nvar scriptGroups = new Array;\n";
print OUTFILE "for (i=0; i<titles.length; i++) {\n";
print OUTFILE "\tscriptGroups[i] = titles[i].split('¶');\n";
print OUTFILE "\t}\n";


close( SOURCEFILE ) || die "Can't close source file";
close( OUTFILE ) || die "Can't close jsfile";
