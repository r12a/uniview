# Converts Blocks.txt file to scriptGroups.js

open( SOURCEFILE, "DerivedAge.txt" ) || die "Could not read file.";
open( OUTFILE, ">age.php" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating list of derived ages...\n";
print OUTFILE "<?php\n\$a=array();\n";
while ( <SOURCEFILE> ) {
	if ( index( $_, '#' ) != 0 ) { 
		chomp;
		s/\.\./¶/;
		s/; /¶/;
		s/#/¶/;
		@cRecord = split( /¶/ );
		if (index($_, '¶') > 0) { 
			# deal with singletons
			$recordlength = @cRecord;
			@cRecord[1] =~ s/\s//;
			@cRecord[2] =~ s/\s//;
			@cRecord[3] =~ s/\s//;
			if ($recordlength == 3) {
				print OUTFILE "\$a[", hex(@cRecord[0]), "]='", @cRecord[1], "';\n";
				}
			else {
				for ($i=hex(@cRecord[0]); $i<hex(@cRecord[1])+1; $i++) {
					print OUTFILE "\$a[", $i, "]='", @cRecord[2], "';\n";
					}
				}
			print STDOUT $counter++, ' ' ;
			}
#		print OUTFILE "\"", hex( @cRecord[0] ), "¶", hex( @cRecord[1] ), "¶", @cRecord[2], "¶\",\n" ; }
		}
	}

	print OUTFILE "\n?>";

close( SOURCEFILE ) || die "Can't close source file";
close( OUTFILE ) || die "Can't close jsfile";
