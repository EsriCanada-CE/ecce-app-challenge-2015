import shapefile #this imports the shapefile module into python

reader = shapefile.Reader("open-data.shp") #reads the shapefile
fields = reader.fields[1:]
field_names = [field[0] for field in fields]
buffer = []
for sr in reader.shapeRecords():
     atr = dict(zip(field_names, sr.record))
     geom = sr.shape.__geo_interface__
     buffer.append(dict(type="Feature", \
      geometry=geom, properties=atr)) 
   
from json import dumps # writes the  the GeoJSON file
geojson = open("open-data.json", "w")
geojson.write(dumps({"type": "FeatureCollection",\
"features": buffer}, indent=2) + "\n")
geojson.close()