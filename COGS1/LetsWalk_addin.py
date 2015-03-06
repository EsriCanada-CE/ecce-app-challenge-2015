import arcpy
import pythonaddins
import xml.dom.minidom as DOM 
import os
import time

class DriveDistClass(object):
    """Implementation for LetsWalk_addin.DriveDist (ComboBox)"""
    def __init__(self):
        self.items = ["1 km", "2 km", "3 km", "5 km", "10 km", "15 km", "20 km"]
        self.editable = True
        self.enabled = True
        self.dropdownWidth = 'WWWW'
        self.width = 'WWWW'
        self.text = ''
    def onEditChange(self, text):
        self.text = text

class GetTrailsClass(object):
    def onMouseDownMap(self, x, y, button, shift):

        if arcpy.Exists(r'in_memory\location'):
            arcpy.Delete_management(r'in_memory\location')
        point = arcpy.Point(x,y)

        in_location = arcpy.PointGeometry(point)

        in_trails = "SurreyWalkingTrails"

        # Load these values from the combo boxes
        select_drive_distance = DriveDist.text
        select_hike_time = str(WalkDur.text)
        select_hike_speed = WalkPace.text
        

        # Setting up arrays to match the combo boxes
        drive_distance = ["1 km", "2 km", "3 km", "5 km", "10 km", "15 km", "20 km" ]
        drive_distance_list = [1000,2000,3000,5000,10000,15000,20000]
        hike_time = ["15 min", "30 min", "45 min", "1 hr", "1.5 hr", "2 hr", "2.5 hr", "3 hr", "4 hr" ]
        hike_time_list = [0.25,0.5,0.75,1,1.5,2,2.5,3,4]
        hike_speed = ["Regular", "Athletic"] 
        hike_speed_list = ["Regular", "Athletic"] 

        if select_drive_distance in drive_distance and select_hike_time in hike_time and select_hike_speed in hike_speed:

            # Grabbing the selection from the combo boxes
            use_select_drive_distance = drive_distance_list[drive_distance.index(select_drive_distance)]
            use_select_hike_time = hike_time_list[hike_time.index(select_hike_time)]
            use_select_hike_speed = hike_speed_list[hike_speed.index(select_hike_speed)]

            # Create a buffer around the input
            arcpy.Buffer_analysis(in_location, r"in_memory/Drive_Buffer", use_select_drive_distance)
            path_to_layer = os.path.join(os.path.dirname(__file__), r'drive_buff.lyr')
            arcpy.ApplySymbologyFromLayer_management ("Drive_Buffer", path_to_layer)

            # Clear any selected features
            arcpy.SelectLayerByAttribute_management(in_trails, "CLEAR_SELECTION")

            # Select trails which are within the buffer (partially inside is good)
            arcpy.SelectLayerByLocation_management(in_trails, 'WITHIN', r"in_memory/Drive_Buffer", '', 'NEW_SELECTION')
             
            where_clause = '"' + str(use_select_hike_speed) + '" < ' + str(use_select_hike_time) + ' AND "' + str(use_select_hike_speed) + '" > ' + str(use_select_hike_time/2)
            arcpy.SelectLayerByAttribute_management(in_trails, 'SUBSET_SELECTION', where_clause)

            # Check if any trails were selected
            # If trails were not selected, disable the output map button
            # If trails were selected, enable the output map button
            matchcount = int(arcpy.GetCount_management(in_trails).getOutput(0)) 
            if matchcount == 0:
                pythonaddins.MessageBox('No features matched spatial and attribute criteria', 0)
                mxd = arcpy.mapping.MapDocument("CURRENT")
                for df in arcpy.mapping.ListDataFrames(mxd):
                    for tbl in arcpy.mapping.ListTableViews(mxd, "", df):
                        arcpy.mapping.RemoveTableView(df, tbl)
                    for lyr in arcpy.mapping.ListLayers(mxd, "*", df):
                        if 'Selected_Trails' in str(lyr.name):
                            arcpy.mapping.RemoveLayer(df, lyr)
                        else:
                            pass

            else:
                arcpy.CopyFeatures_management(in_trails, r"in_memory/Selected_Trails") 
                path_to_layer2 = os.path.join(os.path.dirname(__file__), r'Sel_Trails.lyr')
                arcpy.ApplySymbologyFromLayer_management ("Selected_Trails", path_to_layer2)

            # Clear any selected features
            arcpy.SelectLayerByAttribute_management(in_trails, "CLEAR_SELECTION")

            arcpy.RefreshActiveView()

            return in_location
            return point

        else:
            pythonaddins.MessageBox("Invalid selection, make sure each field in the tool is populated from the drop down", "Invalid Input", 0)


class UploadAGOLClass(object):
    """Implementation for LetWalk_addin.UploadAGOL (Button)"""
    def __init__(self):
        self.enabled = True
        self.checked = False
    def onClick(self):

        mxd = arcpy.mapping.MapDocument("CURRENT")

        for df in arcpy.mapping.ListDataFrames(mxd):
            for tbl in arcpy.mapping.ListTableViews(mxd, "", df):
                arcpy.mapping.RemoveTableView(df, tbl)
            for lyr in arcpy.mapping.ListLayers(mxd, "*", df):
                if 'base' in str(lyr.name) or 'Base' in str(lyr.name) or 'Nat' in str(lyr.name) or 'Drive_Buffer' in str(lyr.name) or 'SurreyWalkingTrails' in str(lyr.name):
                    arcpy.mapping.RemoveLayer(df, lyr)
                else:
                    pass

        arcpy.RefreshActiveView()

        system_time = time.strftime("%Y%m%d_%H%M%S")
        mxd_ws = mxd.filePath
        workspace = str(mxd_ws.rstrip('LetsWalk_1.mxd'))
        agol_mxd = workspace + os.sep + "scratch_mxd" + os.sep + "AGOL_Upload" + system_time+ ".mxd"

        if arcpy.Exists(agol_mxd) == False:
            mxd.saveACopy(agol_mxd)
        else:
            arcpy.Delete_management(agol_mxd)
            mxd.saveACopy(agol_mxd)

        service_base = 'LetsWalk'
        service = service_base + system_time

        # build paths to data
        mapDoc = arcpy.mapping.MapDocument(agol_mxd)

        sddraft = os.path.join(workspace, service + '.sddraft')
        sd = os.path.join(workspace, service + '.sd')

        # create sddraft
        if os.path.exists(sddraft): os.remove(sddraft)
        arcpy.mapping.CreateMapSDDraft(mapDoc, sddraft, service, 'MY_HOSTED_SERVICES', summary="LetsWalk", tags='LetsWalk')

        # read sddraft xml
        doc = DOM.parse(sddraft)
        typeNames = doc.getElementsByTagName('TypeName')
        for typeName in typeNames:
            # Get the TypeName we want to disable.
            if typeName.firstChild.data == "MapServer":
                typeName.firstChild.data = "FeatureServer"
        # turn on caching in the configuration properties
        configProps = doc.getElementsByTagName('ConfigurationProperties')[0]
        propArray = configProps.firstChild
        propSets = propArray.childNodes
        for propSet in propSets:
            keyValues = propSet.childNodes
            for keyValue in keyValues:
                if keyValue.tagName == 'Key':
                    if keyValue.firstChild.data == "WebCapabilities":
                        # turn on caching
                        keyValue.nextSibling.firstChild.data = "Query,Create,Update,Delete,Uploads,Editing"
                        
        # output to a new sddraft
        outXml = os.path.join(workspace, service + '.sddraft')   
        if os.path.exists(outXml): os.remove(outXml)
        f = open(outXml, 'w')     
        doc.writexml( f )     
        f.close() 

        # analyze new sddraft for errors
        analysis = arcpy.mapping.AnalyzeForSD(outXml)

        arcpy.StageService_server(outXml, sd)
        con = 'My Hosted Services' 
        arcpy.UploadServiceDefinition_server(sd, con)

        del mxd
        del agol_mxd       

class WalkDurClass(object):
    """Implementation for LetsWalk_addin.WalkDur (ComboBox)"""
    def __init__(self):
        self.items = ["15 min", "30 min", "45 min", "1 hr", "1.5 hr", "2 hr", "2.5 hr", "3 hr", "4 hr" ]
        self.editable = True
        self.enabled = True
        self.dropdownWidth = 'WWWW'
        self.width = 'WWWW'
        self.text = ''
    def onEditChange(self, text):
        self.text = text

class WalkPaceClass(object):
    """Implementation for LetsWalk_addin.WalkPace (ComboBox)"""
    def __init__(self):
        self.items = ['Regular', 'Athletic']
        self.editable = True
        self.enabled = True
        self.dropdownWidth = 'WWWWW'
        self.width = 'WWWWW'
        self.text = ''
    def onEditChange(self, text):
        self.text = text