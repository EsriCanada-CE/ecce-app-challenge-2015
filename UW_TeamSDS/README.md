UW Team SDS &ndash; ECCE App Challenge
==================

Majuratan(Maju) Sadagopan

Jonathan Van Dusen

Shanqi Zhang


**NOTE:** *This app, in its current state, only provides simulated results for the ION rapid transit network, based on a hypothetical schedule we created ourselves. The app serves to demonstrate how these transit changes could be visualized and demonstrated to the public, and therefore should not currently be relied upon for accurate ION routing.*


## Assumptions:

To support this app's analysis, we've created a hypothetical schedule for the ION LRT and aBRT, based on [information from Grand River Transit](http://rapidtransit.regionofwaterloo.ca/en/projectinformation/frequentlyaskedquestions.asp?_mid_=26033). In particular:
* The ION LRT will take 46 minutes to travel between Conestoga Mall and Fairview Park Mall
* The ION aBRT will take 33 minutes to travel between Fairview Park Mall and the Ainslie Street Terminal
* ION trips will be scheduled every 8 minutes during peak periods, and every 10-15 minutes during off-peak periods
* ION will operate between the hours of 5:00 a.m. and 1:00 a.m.

Therefore, our schedule:
* Calculates stop times based on the average speed between the route's start and end locations (e.g., the 46 minutes between Conestoga and Fairview divided by the length of this route)
* Assumes peak hours between X:00 and X:00, X:00 and X:00, and X:00 and X:00
* Assumes off-peak hours between X:00 and X:00, X:00 and X:00, and X:00 and X:00