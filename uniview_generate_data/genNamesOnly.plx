# Converts UnicodeData.txt file to all-names.js

open( SOURCEFILE, "UnicodeData.txt" ) || die "Could not read file.";
open( JSFILE, ">all-names.js" ) || die "Could not open file.";

$counter = 0;
print STDOUT "Creating new names.php file...\n";
print JSFILE "var charData = {\n";
while ( <SOURCEFILE> ) {
	chomp;
	s/</[/g; s/>/]/g;
	@cRecord = split( /;/ );
	print JSFILE "\"\\u{", @cRecord[0],  "}\":\"", @cRecord[1], "\",\n";
	print STDOUT $counter++, ' ' ;
	}
print JSFILE "}";

close( SOURCEFILE ) || die "Can't close source file";
close( JSFILE ) || die "Can't close jsfile";