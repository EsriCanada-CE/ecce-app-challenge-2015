# Welcome to Community Open-Data Engage (CODE)

## What is CODE?
Run Our Live Demo [HERE](http://www.esri.ca/en)
Check out the Video [HERE](https://www.youtube.com/watch?v=bWuAien2Ld0&feature=youtu.be)


> CODE is an application designed to help citizens better understand the neighbourhoods we live in through open-data. For this app challenge - we tried to cut across all of the themes and connect the techniques often left to geographers (i.e, spatial analysis) with the ideas of neogeography (Turner 2006).


#Theory Behind CODE
> “They might be really good at making an app and taking near real time transit data and coming up with a beautiful app with a fantastic algorithm that will tell you within the millisecond how fast the bus is coming,” Tracy Lauriault, a postdoctoral researcher at the National Institute for Regional and Spatial Analysis (NIRSA), said. “But those aren’t the same people who will sit at a transit committee meeting.”

> While the power of data may be limitless (c.f., Kitchin 2014), the time and expertise most people have to 'wrangling' insights for this information is limited. So CODE aims to help bridge that gap and let anyone who wants to use open data to better engage with their community! 

> So CODE provides a tool for citizens to explore and make sense of their community through comprehensive neighborhood profiles. It also provides a platform for citizens to engage with each other through social media and voluneteered content that can help connect people in their local areas. While not all of the features CODE was intended to have are implemented you can see the basic ideas with our "community feedback tool" where people can share comments and critical input with fellow citizens and cities at specific locations; and a social media plug-in to find people around you and participate in real-time geo-community based discussions.

> Behind the scenes of CODE there are three core components: an interactive visualization to explore spatial data or the "front_end"; the anayltical tools and spatial analysis done in python using custom-made and Esri's GIS software; and of course you - the user. 


----
## To Engage Usage
1a. Visit our user interface [here] (http://www.code.ca/en).
2. Alternatively, visit our GitHub repoistory [here](https://github.com/terratenney/super_secret).
3. Clone repository
4. Rune pyhton -m SimpleHTTPServer from the front_end directory OR run from the scripts folder: test_server.py (require library dependenices fiona and cherrypy) 
5. Open up your browse and navigate to http://localhost:8000/home.html in a browser 

----
## Components

**Geospatial Data Viewer:**

CODE pulls community oriented spatial information from the following open-data portals.

>[City of Vancouver Open Data Catalogue] (http://vancouver.ca/your-government/open-data-catalogue.aspx)

>[City of Edmonton Open Data Catalogue] (https://data.edmonton.ca/)

>[Open Data Government of Canada] (http://open.canada.ca/en/open-data)

CODE then dynamically runs pre-defined spatial and network analysis, and pushes the results into the UI. Users toggle between different layers and explore statistical and text descriptions of neighbourhoods.

*Included Layers*

* Demographic information (income, age, education levels, house values)
* Emergency services
* Hospitals and medical centres
* Schools
* Cultural facilities
* Parks
* Gas Stations
* Grocery Stores

**Community Input**

This component allows users to input their own spatial information or comment on existing features. Once a message has been reviewed and accepted by the admin, it will be visible within the interface to all users as a separate “community input” layer.

**Community Discussion**

The social-media component is a search app that lets you see who is tweeting in your area and easily send them a message to interact with local citizens. This tool facilitates productive discussion on important community topics.

##Technical Components
We wrote several python scripts to automatically download shapefiles direct from open-data repositories. Next, fac_count.py and route_finder are used to run network analysis to closest facilities, count community features within each neighbourhood, and calculate the percent green space of community extents. We then use shapefiletogeojson to output as json or .js files.

We access the spatial information through Leaflets layer functionality using JavaScript functions.

##CODE code

When a user specifies a community indicator, a newly styled layer will appear using the following code:

    layer =  L.geoJson(edmon_data, {
          style: houseStyle,
          onEachFeature: onEachFeature
      }).addTo(map);
        currentLayer = "houseStyle";
     };

Interactivity is enabled through the following options 
    
    onEachFeature(feature, layer){
    showGraph();
    zoomtoFeature();
    highlightFeature();
    resetHighlight();
    }

For detailed code comments, please see map.js or edmon_map.html

###Known Bugs
Lack of descriptive information in popup balloons comes from unstandardized data formats. Would be very easy to implement properly
   

## Bug Reporting

You can send CODE bug reports to <bug-code@engage.ca>.

**Copyright (C) 2015 Matthew Tenney, Jin Xing, and Carl Hughes**

This file is part of our lab.

CODE is a free application; you can redistribute it and/or modify it. CODE is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
A PARTICULAR PURPOSE.

----
## changelog
* 4-Mar-2015 created

----
## thanks
* [ESRI Canada](http://www.esri.ca/en)
* [GIC (McGill University)](http://gic.geog.mcgill.ca/)
