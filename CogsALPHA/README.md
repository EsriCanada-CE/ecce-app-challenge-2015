
## CogsAlpha

# App Overview

# Creators:

Nicole Serrafero

Jing Yan

Jasmine Hunter

#Description

This application seeks to provide users a method to attend Pan Am Games events using Toronto’s Bike Share program.

# Link to App

[Bike to the Pan Am Games!] (https://cogsnscc.maps.arcgis.com/apps/webappviewer/index.html?id=bfff5165dbb74b95b6c83b4a4e972d5e)

# Basic use of the App

A user can determine the current number of available bicycles and docks at each Bike Share terminal. When clicking on a terminal, 
they can learn its location, the number of bikes and docks that are available, and the terminal’s number. 
The user can also view easily the locations that different sporting events take place.They can review the type
of event occurring, the date, venue name, address, a link to the municipality’s website, and an image of the venue linked to the venue’s website. 


## Explanation of Widgets

# Widgets Used

Five widgets were used:

* query
* bookmark
* legend
* layer list
* directions
* basemap
* about

# Query
This widget was configured so that the user can  query the  event data by three methods. These methods are:

* by event
* by date
* by venue

Once a user has completed the query of their choice a list will be returned. The points from the list will appear on the map. The user can also click an event and the map will zoom to its location.

# Legend
The Legend contains the symbology for the Pan Am Games, obtained from the Pan Am Games website. It also displays the graduated symbols for the Bike Share terminals. 
These are displayed based on the number of available bikes, where the larger symbols represent terminals with a larger number of available bikes. 
This widget also displays that the bike friendly routes are in a light green colour. 

# Layers List
Allows the user to turn layers on and off as they need. 

# Directions
Find directions between destinations if you are driving a truck, a car, or walking. 

# Basemap
The user can select a basemap from the pre-loaded list. Once selected, the basemap will change on the map.

# Bookmark
The user can create and save bookmarks based on the location and extent of the map.

# About
Contains information about the app.

## Data Sources

**Toronto Pan Am Venues** - Retrieved as a shapefile from the [Toronto Open data website](http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=9e56e03bb8d1e310VgnVCM10000071d60f89RCRD)

**Toronto Pan Am Events** - Retrieved from the [Pan am Games website] (http://www.ticketmaster.ca/artist/1957123?brand=to2015enca&lang=en-ca&ac_link=TO2015_landing_ballot#artist_table_focus)
 and put into excel for cleanup. After cleanup was complete the table was joined to the Venues shapefile. The pictures for each event were obtained from the website as well. These can be changed if there is an issue.
 
**Bike lanes** - Retrieved as a shapefile from the [Toronto Open data website](http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=9e56e03bb8d1e310VgnVCM10000071d60f89RCRD)

**Bike Share Toronto Points** - Retrieved as a XML file from the [Toronto Open data website](http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=9e56e03bb8d1e310VgnVCM10000071d60f89RCRD)

----
## changelog
* 17-Feb-2013 