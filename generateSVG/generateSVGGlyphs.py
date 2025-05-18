import xml.etree.ElementTree as ET
import os
import sys


# Check if additional arguments were passed
# the argument 'test' produces a coloured background behind the glyph
if len(sys.argv) > 1:
    argument = sys.argv[1]  # Get the first argument after the script name
    if argument == "test":
        print("Test mode activated!")
        fill_colour = "antiquewhite"
    else:
        print(f"Unknown argument: {argument}")
else:
    print("No extra argument provided.")
    fill_colour = "white"


# Load the SVG font file
svg_font_path = "font.svg"
tree = ET.parse(svg_font_path)
root = tree.getroot()

# SVG fonts may have namespace declarations, so handle them dynamically
namespace = {"svg": root.tag.split("}")[0].strip("{")}

# Locate the <font> element (may vary in structure)
font_element = root.find(".//svg:font", namespace)

if font_element:
    glyphs = font_element.findall(".//svg:glyph", namespace)

    # Locate the <font-face> element
    font_face = root.find(".//svg:font-face", namespace)

    if font_face is not None:
        bbox_attr = font_face.get("bbox")
        ascent_attr = font_face.get("ascent")
        descent_attr = font_face.get("descent")
        cap_height = int(ascent_attr) + abs(int(descent_attr))

        if bbox_attr:
            # Extract values from the bbox attribute
            bbox_values = list(map(float, bbox_attr.strip().split()))
            bbox_x, bbox_y, bbox_width, bbox_height = bbox_values

            print(f"Bounding Box Values:")
            print(f"X Min: {bbox_x}")
            print(f"Y Min: {bbox_y}")
            print(f"Width: {bbox_width}")
            print(f"Height: {bbox_height}")
        else:
            print("No bbox attribute found.")
    else:
        print("No <font-face> element found.")
    
    # bbox_x, bbox_y, bbox_width, bbox_height = -493, -241, 1111, 1004
    #center_x = abs(bbox_width)
    #center_y = abs(bbox_y + bbox_height)

    # ascent="800"
    # descent="-200"
    # x-height="536"
    # cap-height="714"
    # bbox="-1522 -830 3209 1289"
    
    bbox_height = abs(bbox_x) + bbox_height


    for glyph in glyphs:
        unicode_char = glyph.get("unicode")
        path_data = glyph.get("d")

        #if unicode_char and path_data:
        if path_data:
            # Get the glyph name
            glyph_name = glyph.get("glyph-name")
            
            # Convert character to Unicode code point
            unicode_codepoint = ""
            if unicode_char:
                unicode_codepoint = f"{ord(unicode_char):04X}"  # Converts to hex format (e.g., U+0041 for 'A')
            
            # Determine horizontal centering
            # glyph_width = int(glyph.get("horiz-adv-x", bbox_width ))  # Get width from font
            glyph_width = int(glyph.get("horiz-adv-x", 0))  # Get width from font
            # print (glyph_width)
            glyph_height = int(glyph.get("vert-adv-y", bbox_height))  # Get height from font
            
            center_x = (bbox_width - glyph_width) / 2
            center_y = (bbox_height - cap_height) / 2
            y_gaps = (bbox_height - cap_height) / 2
            baseline_y = (bbox_height - abs(int(descent_attr)) / 2)
            baseline_y = y_gaps + abs(int(ascent_attr))

            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {bbox_width} {bbox_height}">
<rect width="100%" height="100%" fill="{fill_colour}"/>
<g transform="translate({center_x}, {baseline_y}) scale(1,-1)">
<path d="{path_data}" fill="black"/>
</g> 
            </svg>'''

            fname = unicode_codepoint if unicode_codepoint else glyph_name
            file_name = f"{fname}.svg"
            # file_name = f"{glyph_name}.svg"

            subdirectory = "glyphs"  # Define the subdirectory name
            os.makedirs(subdirectory, exist_ok=True)  # Ensure the subdirectory exists

            file_path = os.path.join(subdirectory, file_name)  # Construct full file path

            with open(file_path, "w") as f:
                f.write(svg_content)

            #with open(file_name, "w") as f:
            #    f.write(svg_content)
            print(f"Generated: {file_path}")

    print("Conversion complete!")
else:
    print("No <font> element found in the SVG file.")
