# [Open Wi-Finder](http://openwifinder.com)
## Built for the Esri Canada Center of Excellence 2015 App Challenge
### *Robert Smith, Matt Kalebic, and Suthee Sangiambut // McGill University*
—

#### **What it does:** 
*Open Wi-Finder was built to address the existing paucity of information regarding Wi-Fi access in Canadian cities. It employs a scalable, platform-independent approach and requires an existing connection for GPS functionality. The application serves two purposes:*

1. On the citizen-facing side of the application, users use their GPS location to either a) find a Wi-Fi hotspot nearby or b) contribute the location of a Wi-Fi hotspot. Each Wi-Fi hotspot will possess attribute information regarding SSID, whether or not it is free, and hours of accessibility. 
2. The Wi-Fi point locations, embedded with the aforementioned information, are available for download on the analytics side of the application. Governments and civic hackers can identify pockets and clusters of Wi-Fi access, overlay census tract data to conduct socioeconomic analyses within these areas, and formulate policies accordingly. 

We hope that Open Wi-Finder will allow for steps to be taken toward mending the digital divide caused by the confluence of cities and networked infrastructure. Furthermore, the application aids governments in establishing a comprehensive catalogue of public and private wireless access points via a novel, crowdsourced approach. 

#### **How to use it:**
Simply go to the [Open Wi-Finder](http://openwifinder.com) website and start exploring -- we've taken care of the rest!

You'll see a set of buttons in the lower left corner of the application. Use these to obtain your current location, find the closest Wi-Fi hotspot, and contribute a hotspot location. See our [video](http://youtu.be/ksdQD9k1XcQ) on YouTube for more information. 

#### Utilizes:
* [ArcGIS API for Javascript](https://developers.arcgis.com/javascript/)
* [CodyHouse Full-Screen Pop-Out Navigation](http://codyhouse.co/gem/full-screen-pop-out-navigation/)
* [Firebase ](https://www.firebase.com) 


#### Roadmap:
* **Implement n-minute trade area method for delimitating hotspot coverage.** A walking time distance of fifteen minutes will be used to approximate access to each hotspot location.
* **Further develop analytics functionality.** Datasets containing all attribute information for hotspots will be available in JSON and CSV format. Clustering and heat maps will be implemented to visualize the flow of hotspots throughout a city. 
* **Introduce gamification to charter unexplored areas.** An objective-based system which rewards users for discovering free Wi-Fi hotspots is currently in the works. 

### Long-term vision and applications:
Once a significant amount of Wi-Fi data has been crowdsourced, government analysts and civic hacker enthusiasts alike can visually model the flow of wireless access over a given area using tools such as Esri's [Point Density (Spatial Analyst)](http://help.arcgis.com/en/arcgisdesktop/10.0/help/index.html#//009z0000000v000000.htm). Statistical analysis can be performed using tools such as R or Python to determine the degree of influence certain socioeconomic characteristics may have on wireless coverage in the area. Predictor variables may be based on information provided in spatial and financial datasets such as the aforementioned census data, or other available open datasets. ArcGIS can be used to delimitate wireless access areas, visually identify clusters and pockets throughout the city, and isolate socioeconomic data within each area for comparative analysis.

The results of these inquiries will be instrumental in identifying pockets lacking adequate wireless coverage. In an increasingly networked age, the potential to connect through open networks has become an important tool for community development. Mesh networks are one alternative for filling the identified pockets of poor wireless coverage, whereby communities re-broadcast a signal and circumvent traditional problems with WLAN networking. A basic cost valuation for deployment and approximate area of coverage can be calculated using ArcGIS once the pockets are determined, building the foundation for future research and development.
