# ECCE 2015 App Challenge: PredictION


1. Mission statement for the app (i.e. what the app seeks to achieve and why)

2. Statement of the characteristics of the app that make it appealing, interesting and useful  (i.e. how  does it help the end user)

3. A video with voice over that demonstrates use of the app

4. A well-structured readme file on GitHub that states the goals of the app and how to use it

5. Completed GitHub code repository with instructions for download and installation

6. User interface (quality of user experience)

7. Reliability (i.e. not prone to crash).


# Mission Statement

When the city is proposing a new transit line or change an existing transit line, how will those plans affect peoples’ mobility and activity?  PredictION is a web mapping tool that allows public to explore how their everyday commute will be changed by authoritative plans. Specifically, PredictION allows user to compare their commuting cost under current public transit system with that of the proposed service. Meanwhile, government agencies can use PredictION to publish their proposed public transit services in reference with General Transit Feed Specifications to predict the impacts of possible changes in the transit system. By doing so, PredictION provides a unique platform to enable two-way government-citizen interactions in that, 1) government can provide interactive mapping and visualisation tools for public to use open data and, 2) citizens can have better understandings of how their own lives will be impacted by authoritative plans.

Currently, Region of Waterloo is developing a rapid transit (RT) line connecting the spine of Waterloo, Kitchener, and Cambridge. We used open transit data from Region of Waterloo as an example to show how people can examine RT’s impact on public transit system using PredictION.



#Statement of Characteristics


***Unique Functionality***


**GTFS Back End**

PredictION used customized scripts and models to 1) automatically generate GTFS-formatted public transit data using hypothetical time windows and schedules and, 2) create routing query and service area analysis layer based on both realistic and hypothetical public transit schedules. 


**Routing using Present and Proposed Transit Service**

PredictION allows users to search for trip times on current transit services as well as proposed transit services. Users can compare both services simultaneously because PredictION supports visualization of multiple route queries at the same time.


**Service Area Analysis**

PredictION supports service area analysis of current and proposed transit services for predefined times of ten, twenty and thirty minutes. Multiple service area analyses can be visualized simultaneously to compare current and proposed services. 



***Location and Scope***

The initial build of PredictION has been developed for Phase 1 of the ION Rapid Transit project in the Region of Waterloo. Due to the exploratory nature of the application, stops have been limited to points of interest in the Region of Waterloo and times have been limited to one hour intervals throughout the day. 

The datasets used to develop this application were acquired from open data portals provided by the Region of Waterloo, the City of Waterloo, the Province of Ontario and the City of Kitchener. Specific details of each datasets are available in the GitHUB readme for this application.  



***Design and Development***

PredictION was developed using a workflow that took advantage of ArcMap, Python, ArcGIS Server and ArcGIS Web AppBuilder. 

ArcMap was used to take advantage of the network analyst extension and python was used to automate data processing tasks. 

ArcGIS Web AppBuilder was used because it allowed our team to quickly setup and deploy a fully functional application with minimal configuration. The interface of the Web AppBuilder’s “Query” widget was modified to better support the routing and service-area analysis tasks.



***Creating the Data***

Creating and manipulating GTFS data was a major challenge throughout this project. The ION GTFS dataset was created using a customized python script and an ArcGIS toolbox developed by Melinda Morang from ESRI was used to import the data into ArcMap. 

ArcGIS model builder and python was used to publish GTFS data as a service.

