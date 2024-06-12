# Converts UnicodeData-XXX.txt file to u.php
# Includes age data and pointers to subtitles



##################################################
# Read in DerivedAge.txt and store data in @agearray, using short forms
##################################################
open( AGEFILE, "DerivedAge.txt" ) || die "Could not read file.";

$counter = 0;
@agearray = ();
print STDOUT "Creating list of derived ages...\n";
while ( <AGEFILE> ) {
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
			
		
		}
	}

print STDOUT "\nAge array 1164 is ", @agearray[1164], "\n";

close( AGEFILE ) || die "Can't close source file";





##################################################
# Read in tempSubtRefs.txt and store data in @refsarray
##################################################
open( REFSFILE, "tempSubtRefs.txt" ) || die "Could not read file.";

$counter = 0;
@refsarray = ();
print STDOUT "Creating list of subtitle references...\n";
while ( <REFSFILE> ) {
	if ( index( $_, '#' ) != 0 ) { 
		chomp;
		@cRecord = split( /:/ );
		if (index($_, ':') > 0) { 
			@refsarray[@cRecord[0]] = @cRecord[1];
			print STDOUT $counter++, ' ' ;
			}
		}
	}

print STDOUT "\nSubtitle index for 1164 is ", @refsarray[1164], "\n";

close( REFSFILE ) || die "Can't close source file";





###################################################################
#  Make the u.js file
###################################################################



open( SOURCEFILE, "UnicodeData.txt" ) || die "Could not read file.";
open( JSFILE, ">u.js" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new u.js file...\n";
print JSFILE "U = new Array()\n";
while ( <SOURCEFILE> ) {
	chomp;
	s/</[/g; s/>/]/g;
	@cRecord = split( /;/ );
	#print JSFILE "U[", hex( @cRecord[0] ),  "]=\"", $_, "\"\n";
	print JSFILE "U[", hex( @cRecord[0] ),  "]=\"", @cRecord[1], ";", @cRecord[2], ";",  @cRecord[3], ";",  @cRecord[4], ";",  @cRecord[5], ";",  @cRecord[12], ";",  @cRecord[13], ";",  @cRecord[14], ";",  @agearray[hex( @cRecord[0] )], ";",  @refsarray[hex( @cRecord[0] )], ";",  @cRecord[6], ";",  @cRecord[7], ";",  @cRecord[8], ";",  @cRecord[10], ";",  @cRecord[11], "\"\n";
	print STDOUT $counter++, ' ' ;
	}

close( SOURCEFILE ) || die "Can't close source file";
close( JSFILE ) || die "Can't close target file";