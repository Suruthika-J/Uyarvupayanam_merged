from PIL import Image
import os

path = r"c:\Users\Priya Dharshini\OneDrive\Desktop\Uyarvu Payanam\Uyarvu-Payanam\frontend\src\uyarvu-logo.png"

try:
    img = Image.open(path)
    img = img.convert("RGBA")

    datas = img.getdata()

    newData = []
    
    # We will compute the brightness or if it's close to black
    for item in datas:
        # Check if the pixel is black or dark grey
        if item[0] < 30 and item[1] < 30 and item[2] < 30:
            # changing the black pixels to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(path, "PNG")
    print("Background removed successfully")
except Exception as e:
    print("Error:", e)
