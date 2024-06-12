# Converts Blocks.txt file to scriptGroups.js

open( SOURCEFILE, "DerivedAge.txt" ) || die "Could not read file.";
open( OUTFILE, ">age.txt" ) || die "Could not open file.";

$counter = 0;
@agearray = ();
print STDOUT "Creating list of derived ages...\n";
#print OUTFILE "<?php\n\$a=array();\n";
while ( <SOURCEFILE> ) {
	if ( index( $_, '#' ) != 0 ) { 
		chomp;
		s/\.\./¶/;
		s/; /¶/;
		s/#/¶/;
		@cRecord = split( /¶/ );
		if (index($_, '¶') > 0) { 
			$recordlength = @cRecord;
			@cRecord[1] =~ s/\s//;			
			@cRecord[2] =~ s/\s//;			
			@cRecord[3] =~ s/\s//;
			
			
			# deal with singletons
			if ($recordlength == 3) {
				@cRecord[1] =~ s/10\.0/s/;
				@cRecord[1] =~ s/11\.0/t/;
				@cRecord[1] =~ s/12\.0/u/;
				@cRecord[1] =~ s/13\.0/v/;
				@cRecord[1] =~ s/14\.0/w/;
				@cRecord[1] =~ s/15\.0/x/;
				@cRecord[1] =~ s/16\.0/y/;
				@cRecord[1] =~ s/1\.1/a/;
				@cRecord[1] =~ s/2\.0/b/;
				@cRecord[1] =~ s/2\.1/c/;
				@cRecord[1] =~ s/3\.0/d/;
				@cRecord[1] =~ s/3\.1/e/;
				@cRecord[1] =~ s/3\.2/f/;
				@cRecord[1] =~ s/4\.0/g/;
				@cRecord[1] =~ s/4\.1/h/;
				@cRecord[1] =~ s/5\.0/i/;
				@cRecord[1] =~ s/5\.1/j/;
				@cRecord[1] =~ s/5\.2/k/;
				@cRecord[1] =~ s/6\.0/l/;
				@cRecord[1] =~ s/6\.1/m/;
				@cRecord[1] =~ s/6\.2/n/;
				@cRecord[1] =~ s/6\.3/o/;
				@cRecord[1] =~ s/7\.0/p/;
				@cRecord[1] =~ s/8\.0/q/;
				@cRecord[1] =~ s/9\.0/r/;
				@agearray[hex(@cRecord[0])] = @cRecord[1];
				print OUTFILE hex(@cRecord[0]), ":", @cRecord[1], "\n";
				}
			
			# deal with ranges
			else {
				for ($i=hex(@cRecord[0]); $i<hex(@cRecord[1])+1; $i++) {
					@cRecord[2] =~ s/10\.0/s/;
					@cRecord[2] =~ s/11\.0/t/;
					@cRecord[2] =~ s/12\.0/u/;
					@cRecord[2] =~ s/13\.0/v/;
					@cRecord[2] =~ s/14\.0/w/;
					@cRecord[2] =~ s/15\.0/x/;
					@cRecord[2] =~ s/16\.0/y/;
					@cRecord[2] =~ s/1\.1/a/;
					@cRecord[2] =~ s/2\.0/b/;
					@cRecord[2] =~ s/2\.1/c/;
					@cRecord[2] =~ s/3\.0/d/;
					@cRecord[2] =~ s/3\.1/e/;
					@cRecord[2] =~ s/3\.2/f/;
					@cRecord[2] =~ s/4\.0/g/;
					@cRecord[2] =~ s/4\.1/h/;
					@cRecord[2] =~ s/5\.0/i/;
					@cRecord[2] =~ s/5\.1/j/;
					@cRecord[2] =~ s/5\.2/k/;
					@cRecord[2] =~ s/6\.0/l/;
					@cRecord[2] =~ s/6\.1/m/;
					@cRecord[2] =~ s/6\.2/n/;
					@cRecord[2] =~ s/6\.3/o/;
					@cRecord[2] =~ s/7\.0/p/;
					@cRecord[2] =~ s/8\.0/q/;
					@cRecord[2] =~ s/9\.0/r/;

					@agearray[$i] = @cRecord[2];
					print OUTFILE $i, ":", @cRecord[2], "\n";
					}
				}
			print STDOUT $counter++, ' ' ;
			}
			
		
#		print OUTFILE "\"", hex( @cRecord[0] ), "¶", hex( @cRecord[1] ), "¶", @cRecord[2], "¶\",\n" ; }
		}
	}

#	print OUTFILE "\n?>";
print STDOUT "\nAge array 1164 is ", @agearray[1164], "\n";

close( SOURCEFILE ) || die "Can't close source file";
close( OUTFILE ) || die "Can't close jsfile";
