UW Team SDS &ndash; ECCE App Challenge
==================

Majuratan(Maju) Sadagopan

Jonathan Van Dusen

Shanqi Zhang


**NOTE:** *This app, in its current state, only provides simulated results for the ION rapid transit network, based on a hypothetical schedule we created ourselves. The app serves to demonstrate how these transit changes could be visualized and demonstrated to the public, and therefore should not currently be relied upon for accurate ION routing.*


## Assumptions:

To support this app's analysis, we've created a hypothetical schedule for the ION LRT and aBRT, based on [information from Grand River Transit](http://rapidtransit.regionofwaterloo.ca/en/projectinformation/frequentlyaskedquestions.asp?_mid_=26033). This only includes the system's Phase 1 of development (Kitchener—Waterloo LRT + Cambridge aBRT), as there is no similar information posted for Phase 2 (Cambridge LRT). In particular:
* The ION LRT will take 46 minutes to travel between Conestoga Mall and Fairview Park Mall (19 km)
* The ION aBRT will take 33 minutes to travel between Fairview Park Mall and the Ainslie Street Terminal (17 km)
* ION trips will be scheduled every 8 minutes during peak periods, and every 10-15 minutes during off-peak periods
* ION will operate between the hours of 5:00 a.m. and 1:00 a.m.

Therefore, our schedule:
* Calculates stop times based on the average speed between the route's start and end locations
* Assumes peak hours between X:00 and X:00, X:00 and X:00, and X:00 and X:00
* Assumes off-peak hours between X:00 and X:00, X:00 and X:00, and X:00 and X:00

You can download the GTFS data for our hypothetical schedule [here].


## Data sources:

* Road network (analysis layers): [National Road Network - Ontario](http://open.canada.ca/data/en/dataset/c0d1f299-179c-47b2-bcd8-da1ba68a8032), from Government of Canada. Contains information licensed under the [Open Government Licence – Canada](http://open.canada.ca/en/open-government-licence-canada).
* Regional boundary (for clipping the above road network): [Regional Municipality of Waterloo Regional Boundary](http://www.regionofwaterloo.ca/en/regionalGovernment/RegionalBoundary.asp)
* GRT bus network: [Regional Municipality of Waterloo GTFS Data](http://www.regionofwaterloo.ca/en/regionalGovernment/GRT_GTFSdata.asp) (GRT_Merged_GTFS.zip)
* ION routes and stops: from Regional Municipality of Waterloo, via University of Waterloo Geospatial Centre

