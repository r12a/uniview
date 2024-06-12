# Converts Blocks-X.txt file to code for pull down menu

open( SOURCEFILE, "Blocks.txt" ) || die "Could not read file.";
open( OUTFILE, ">menu.txt" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new menu text...\n";
while ( <SOURCEFILE> ) {
	if ( index( $_, '#' ) != 0 ) { 
		chomp;
		s/\.\./¶/;
		s/; /¶/;
		@cRecord = split( /¶/ );
		print OUTFILE "<option value=\"", @cRecord[0], ":", @cRecord[1], "\">", @cRecord[2], "</option>\n" ;
		print STDOUT $counter++, ' ' ;
		}
	}

close( SOURCEFILE ) || die "Can't close source file";
close( OUTFILE ) || die "Can't close jsfile";