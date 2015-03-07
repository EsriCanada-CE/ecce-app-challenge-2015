# -*- coding: utf-8 -*-
"""
Created on Fri Feb 27 23:25:30 2015

@author: zeke
"""




"""
Written By: Matthew Tenney Date: Feb 2015

This script parses various StatCan data tables collecting community indicator values of interest. 
Right now we are using on the 2011 NHS - grabbing information on Income, Housing, Transportation, and other demographic
variables. For Age Groups we are using 0-19, 20-35, 36-55, 55+ as cohorts. Age and Housing Types are at the Dissemination Area
scale - where the rest are taken at the Census Tract and attributed to the DA. 

The lookup table function creates a mapping between which DA's are a part of which CT's. 

This won't work for 2006 data. 



"""

import csv
import fiona

community = {

"Demographics":{
    "Age_Pop":{
        "youth":{'Total':0,"Male":0,"Female":0},"yadult":{'Total':0,"Male":0,"Female":0},\
        "adult":{'Total':0,"Male":0,"Female":0},"oadult":{'Total':0,"Male":0,"Female":0}},\
    "Tot_Pop":{'Total':0,"Male":0,"Female":0},
    "CT_Pop":{'Total':0,"Male":0,"Female":0},\
    "Marital_Status":{
        "Married_CML":{'Total':0,"Male":0,"Female":0},"Single":{'Total':0,"Male":0,"Female":0}}
    },\

"Housing":{
    'Total_private_dwellings':0,
    'Housing_Types':{
               'Single_detached_house':0,'Apartment_Buildings':0,'Other':0,'Apartments':0},
    "Rent":{"Median":0,"Average":0},
    "Housing_Value":{"Median":0,"Average":0},
    "Rented_%":0,"Owned_%":0},\
    
"Education":{"HighSchool_Less_%":{'Total':0,"Male":0,"Female":0}, 
             "Some_College_%":{'Total':0,"Male":0,"Female":0},
             "University_Above_%":{'Total':0,"Male":0,"Female":0}},\

"Health":{"Access_Health":{'Avg_Dist':0}},\

"ParksnRec":{"Num_Parks":0,"Green_Space_%":0},\

"Transport":{"Walkscore":0,"Parking":0,"Mode_Trans":{'Car_%pop':0,'Public_Trans_%pop':0,'Walk_%pop':0,'Cycle_%pop':0,'Other_%pop':0}},\

"Services":{},\

"EmergencySevices":{"Crime_Stats":{"Total":0}},\

"Utilities":{}}
transit_mode = [
'  Car, truck or van - as a driver',
'  Car, truck or van - as a passenger',
'  Public transit',
'  Walked',
'  Bicycle',
'  Other methods'
]
Education = [
'Total population aged 25 to 64 years by highest certificate, diploma or degree',
'  No certificate, diploma or degree',
'  High school diploma or equivalent',
'  Postsecondary certificate, diploma or degree',
'    Apprenticeship or trades certificate or diploma',
'    College, CEGEP or other non-university certificate or diploma',
'    University certificate or diploma below bachelor level',
'    University certificate, diploma or degree at bachelor level or above',
"      Bachelor's degree",
'      University certificate, diploma or degree above bachelor level',
'Total population aged 15 years and over by major field of study - Classification of Instructional Programs (CIP) 2011',
'  No postsecondary certificate, diploma or degree',
'  Education',
'  Visual and performing arts, and communications technologies',
'  Humanities',
'  Social and behavioural sciences and law',
'  Business, management and public administration',
'  Physical and life sciences and technologies',
'  Mathematics, computer and information sciences',
'  Architecture, engineering, and related technologies',
'  Agriculture, natural resources and conservation',
'  Health and related fields',
'  Personal, protective and transportation services',
'  Other fields of study']

Housing =[
"Total private dwellings", 
'   Single-detached house',
'   Apartment, building that has five or more storeys',
'   Movable dwelling',
'   Other dwelling',
'      Semi-detached house',
'      Row house',
'      Apartment, duplex',
'      Apartment, building that has fewer than five storeys',
'      Other single-attached house']


Other_Housing = ['      Semi-detached house','   Movable dwelling','      Other single-attached house']

Apartments= ['      Row house',
'      Apartment, duplex',
'      Apartment, building that has fewer than five storeys']


youthc =['   0 to 4 years',
'   5 to 9 years',
'   10 to 14 years',
'   15 to 19 years']
yadultc =['   20 to 24 years',
'   25 to 29 years',
'   30 to 34 years']
adultc =['   35 to 39 years',
'   40 to 44 years',
'   45 to 49 years',
'   50 to 54 years']
oadultc =['   55 to 59 years',
'   60 to 64 years',
'   65 to 69 years',
'   70 to 74 years',
'   75 to 79 years',
'   80 to 84 years',
'   85 years and over']

def percent(tot,por):
    if tot > 0:
        return (float(por)/float(tot))*100
    else:
        return None

def ct_to_da(in_shape,keys):
    l_table = {}
    C = 0
    orec={"type":"FeatureCollection","features":[]}
    print "Making lookup Table"
    for rec in in_shape:
        if rec['properties']['DAUID'] in keys:
            l_table[rec['properties']['CTUID']] = rec['properties']['DAUID']
            rec['properties']= dict(rec['properties'])
            orec['features'].append(rec)
            C +=1
    print "Finished Lookup Table",C - len(keys),"Unmatched"
    return l_table,orec


def initalize(re):
    firstline = True #skip first line of the csv file as it is just the heading 
    ref_dict = {}
    while True:
        try:
           row = re.next()
           if firstline:
               firstline = False
               continue
           if row['Geo_Code'] and row['Geo_Code'] != 'Geo_Code':
               ref_dict[row['Geo_Code']] = community
        except StopIteration:
          break
    return ref_dict
    


def get_age_cohorts(re,ref_dict,use_l_table=False,l_table=None):
    firstline = True #skip first line of the csv file as it is just the heading      
    while True:
        try:
            row = re.next()
            if firstline:
                firstline = False
                continue
            if use_l_table:
                if row['Geo_Code'] in l_table.keys():
                    k = l_table[row['Geo_Code']]
                else:
                    continue
            else:
                k = row['Geo_Code']
            
            if k in ref_dict.keys():
                if row['Characteristic']== 'Total population in private households by citizenship':
                    #this grabs the total CT population so we can calculate % ratios in Education/Others to the DA level
                    if row['Total']:
                        ref_dict[k]["Demographics"]['CT_Pop']['Total'] = int(row['Total'])
                    if row['Male']: 
                        ref_dict[k]["Demographics"]['CT_Pop']['Male']  = int(row['Male'])
                    if row['Female']:
                        ref_dict[k]["Demographics"]['CT_Pop']['Female']  = int(row['Female'])
                
                if row['Characteristic']== '   Married or living with a common-law partner':
                    if row['Total']:
                        ref_dict[k]["Demographics"]["Marital_Status"]["Married_CML"]['Total']+= int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Marital_Status"]["Married_CML"]['Male']+= int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Marital_Status"]["Married_CML"]['Female']+= int(row['Female'])           
                
                if row['Characteristic']== '   Not married and not living with a common-law partner':
                    if row['Total']:
                        ref_dict[k]["Demographics"]["Marital_Status"]["Single"]['Total']+= int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Marital_Status"]["Single"]['Male']+= int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Marital_Status"]["Single"]['Female']+= int(row['Female'])            
                
                if row['Characteristic']== 'Total population by age groups':
                    if row['Total']:
                        ref_dict[k]["Demographics"]["Tot_Pop"]['Total']=ref_dict[k]["Demographics"]["Tot_Pop"]['Total']+ int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Tot_Pop"]['Male']=ref_dict[k]["Demographics"]["Tot_Pop"]['Male']+ int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Tot_Pop"]['Female']=ref_dict[k]["Demographics"]["Tot_Pop"]['Female']+ int(row['Female'])           
                
                if row['Characteristic'] in youthc:
                    if row['Total']:
                        ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Total']=ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Total']+ int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Male']=ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Male']+ int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Female']=ref_dict[k]["Demographics"]["Age_Pop"]["youth"]['Female']+ int(row['Female'])           
                
                elif row['Characteristic'] in yadultc:     
                    if row['Total']:    
                       ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Total']=ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Total']+ int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Male']=ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Male']+ int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Female']=ref_dict[k]["Demographics"]["Age_Pop"]["yadult"]['Female']+ int(row['Female']) 
                elif row['Characteristic'] in adultc:     
                    if row['Total']:    
                       ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Total']=ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Total']+ int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Male']=ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Male']+ int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Female']=ref_dict[k]["Demographics"]["Age_Pop"]["adult"]['Female']+ int(row['Female']) 
                elif row['Characteristic'] in oadultc:     
                    if row['Total']:    
                       ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Total']=ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Total']+ int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Male']=ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Male']+ int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Female']=ref_dict[k]["Demographics"]["Age_Pop"]["oadult"]['Female']+ int(row['Female'])
                

                if row['Characteristic'] == "Total private dwellings":
                    if row['Total']:
                        ref_dict[k]["Housing"]['Total_private_dwellings'] =ref_dict[k]["Housing"]['Total_private_dwellings']+ int(row['Total'])
                if row['Characteristic']=='   Single-detached house':
                    if row['Total']:
                       ref_dict[k]["Housing"]['Housing_Types']['Single_detached_house'] += int(row['Total'])
                if row['Characteristic']=='   Apartment, building that has five or more storeys':         
                    if row['Total']:
                       ref_dict[k]["Housing"]['Housing_Types']['Apartment_Buildings'] += int(row['Total'])
                if row['Characteristic'] in Apartments:
                    if row['Total']:
                        ref_dict[k]["Housing"]['Housing_Types']['Apartments'] = ref_dict[k]["Housing"]['Housing_Types']['Apartments'] +    int(row['Total'])
                if row['Characteristic'] in Other_Housing:
                    if row['Total']:
                        ref_dict[k]["Housing"]['Housing_Types']['Other'] = ref_dict[k]["Housing"]['Housing_Types']['Other']+    int(row['Total'])
                if row['Characteristic'] == '  Median value of dwellings ($)':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Housing_Value']['Median'] = int(row['Total'])
                if row['Characteristic'] == '  Average value of dwellings ($)':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Housing_Value']['Average'] = int(row['Total'])
                if row['Characteristic'] == '  Median monthly shelter costs for rented dwellings ($)':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Rent']['Median'] = int(row['Total'])
                if row['Characteristic'] == '  Average monthly shelter costs for rented dwellings ($)':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Rent']['Average'] = int(row['Total'])        
                if row['Characteristic']=='Total number of private households by tenure':
                    if row['Total']:
                        tot_hous = int(row['Total'])
                if row['Characteristic']=='  Owner':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Owned_%'] = percent(tot_hous,int(row['Total']))
                if row['Characteristic']=='  Renter':
                    if row['Total']:
                        ref_dict[k]["Housing"]['Rented_%'] = percent(tot_hous,int(row['Total']))
                if row['Characteristic']=='  Car, truck or van - as a driver':
                    if row['Total']:
                        cc = int(row['Total'])
                if row['Characteristic']=='  Car, truck or van - as a passenger':
                    if row['Total']:
                        cc += int(row['Total'])
                    ref_dict[k]["Transport"]['Mode_Trans']['Car_%pop'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],cc)
                        
                if row['Characteristic']=='  Public transit':
                    if row['Total']:
                        ref_dict[k]["Transport"]['Mode_Trans']['Public_Trans_%pop'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],int(row['Total']))
                if row['Characteristic']=='  Walked':
                    if row['Total']:
                        ref_dict[k]["Transport"]['Mode_Trans']['Walk_%pop'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],int(row['Total']))
                if row['Characteristic']=='  Bicycle':
                    if row['Total']:
                        ref_dict[k]["Transport"]['Mode_Trans']['Cycle_%pop'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],int(row['Total']))
                if row['Characteristic']=='  Other methods':
                    if row['Total']:
                        ref_dict[k]["Transport"]['Mode_Trans']['Other_%pop'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],int(row['Total']))
                        
                if row['Characteristic'] == 'Total population aged 15 years and over by highest certificate, diploma or degree':
                    #This is a quick fix to skip 10 lines on the csv file so we don't double add values
                    [re.next() for i in range(9)]
                    row = re.next()
                if row['Characteristic'] in Education:
                    if row['Characteristic'] =='  No certificate, diploma or degree':
                        if row['Total']:    
                            tot_no_deg = int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg = int(row['Male'])
                        if row['Total']:
                            fe_no_deg = int(row['Female'])
                        
                        row = re.next() #Again skipping to the next line to combine No Degree/HighSchool
                    if row['Characteristic']=='  High school diploma or equivalent':
                        if row['Total']:    
                            tot_no_deg += int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg += int(row['Male'])
                        if row['Total']:
                            fe_no_deg += int(row['Female'])
                        ref_dict[k]['Education']['HighSchool_Less_%']['Total'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],tot_no_deg)
                        ref_dict[k]['Education']['HighSchool_Less_%']['Male'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Male'],ma_no_deg)
                        ref_dict[k]['Education']['HighSchool_Less_%']['Female'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Female'],fe_no_deg)
                        row = re.next()
                    if row['Characteristic']==    '  Postsecondary certificate, diploma or degree':
                        if row['Total']:    
                            tot_no_deg = int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg = int(row['Male'])
                        if row['Total']:
                            fe_no_deg = int(row['Female'])
                        row = re.next()    
                    if row['Characteristic']=='    Apprenticeship or trades certificate or diploma':
                        if row['Total']:    
                            tot_no_deg += int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg += int(row['Male'])
                        if row['Total']:
                            fe_no_deg += int(row['Female'])
                        row = re.next()    
                    if row['Characteristic']=='    College, CEGEP or other non-university certificate or diploma':
                        if row['Total']:    
                            tot_no_deg += int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg += int(row['Male'])
                        if row['Total']:
                            fe_no_deg += int(row['Female'])
                        row = re.next()    
                    if row['Characteristic']=='    University certificate or diploma below bachelor level':
                        if row['Total']:    
                            tot_no_deg += int(row['Total'])
                        if row['Total']:                        
                            ma_no_deg += int(row['Male'])
                        if row['Total']:
                            fe_no_deg += int(row['Female'])
                            
                        ref_dict[k]['Education']['Some_College_%']['Total'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],tot_no_deg)
                        ref_dict[k]['Education']['Some_College_%']['Male'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Male'],ma_no_deg)
                        ref_dict[k]['Education']['Some_College_%']['Female'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Female'],fe_no_deg)
                        row = re.next()
                        
                    if row['Characteristic']=='    University certificate, diploma or degree at bachelor level or above':
                        if row['Total']:    
                            ref_dict[k]['Education']['University_Above_%']['Total'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Total'],int(row['Total']))
                        if row['Total']:                        
                            ref_dict[k]['Education']['University_Above_%']['Male'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Male'],int(row['Male']))
                        if row['Total']:
                            ref_dict[k]['Education']['University_Above_%']['Female'] = percent(ref_dict[k]["Demographics"]['CT_Pop']['Female'],int(row['Female']))
                
        except StopIteration:
          break
    return ref_dict


def run():
    re = csv.DictReader(open('../data/501.csv','rb'),fieldnames=['Geo_Code', 'Prov_name', 'Geo_nom', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])
    re1 = csv.DictReader(open('../data/501.csv','rb'),fieldnames=['Geo_Code', 'Prov_name', 'Geo_nom', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])
    ref_dict = initalize(re)
    
    ref_dict= get_age_cohorts(re1,ref_dict)
    
    in_shape= fiona.open('../data/census_2011/sample_shape.shp','r')
    
    l_table,shapes = ct_to_da(in_shape,ref_dict.keys())
    
    re = csv.DictReader(open('../data/401.csv','rb'),fieldnames=['Geo_Code', 'Prov_Name', 'CMA_CA_Name', 'CT_Name', 'GNR', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_Total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])
    re1 = csv.DictReader(open('../data/401.csv','rb'),fieldnames=['Geo_Code', 'Prov_Name', 'CMA_CA_Name', 'CT_Name', 'GNR', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_Total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])
    
    ref_dict= get_age_cohorts(re1,ref_dict,True,l_table)
    for k,v in ref_dict:
        

#    out_array = []
#    for k,v in ref_dict.items():
#            rec = {'id':k,'community':v}
#            out_array.append(rec)
#    return [{'com_profiles':out_array},shapes]


cp,shps = run()

schema = {}

print "Writing Json"
import json
shapes = open('../data/shapes.json','wb')
com_profiles = open('../data/com_profiles.json','wb')
shapes.write(json.dumps(shapes))
com_profiles.write(json.dumps(com_profiles))
shapes.close()
com_profiles.close()
print "Done! \n\n\n"




import pprint
pp = pprint.PrettyPrinter(indent=4)




pp.pprint(cp['com_profiles'][0]['community'])
