# -*- coding: utf-8 -*-
"""
Created on Wed Mar  4 14:31:10 2015
Written By: Matthew Tenney Date: Feb 2015

This script parses various StatCan data tables collecting community indicator values of interest. 
Right now we are using on the 2011 NHS - grabbing information on Income, Housing, Transportation, and other demographic
variables. For Age Groups we are using 0-19, 20-35, 36-55, 55+ as cohorts. Age and Housing Types are at the Dissemination Area
scale - where the rest are taken at the Census Tract and attributed to the DA. 

The lookup table function creates a mapping between which DA's are a part of which CT's. 

This won't work for 2006 data. 

"""

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
schema = {'geometry': 'Polygon',
 'properties': {
"DAUID":'str',
'Age_19_>':'int',
"Age_20_34":'int',
"Age_35_54":'int',
"Age_55_<":'int',
    
'Age_19_>_M':'int',
"Age_20_34_M":'int',
"Age_35_54_M":'int',
"Age_55_<_M": 'int',
    
'Age_19_>_F':'int',
"Age_20_34_F":'int',
"Age_35_54_F":'int',
"Age_55_<_F":'int',

'Med_Inc':'int',
"Med_Inc_M":'int',
"Med_Inc_F":'int',

'Avg_Inc':'int',
"Avg_Inc_M":'int',
"Avg_Inc_F":'int',
    

"Tot_Pop":'int',
"Tot_Pop_M":'int',
"Tot_Pop_F":'int',

"CT_Pop_T":'int',
"CT_Pop_M":'int',
"CT_Pop_F":'int',

"Married_CML_T":'int',
"Married_CML_M":'int',
"Married_CML_F":'int',

"Single_T":'int',
"Single_M":'int',
"Single_F":'int',
    
'Total_dwellings':'int',
'Single_house':'int',
'Apt_Build':'int',
'Housing_Other':'int',
'Apart':'int',
"Med_Rent":'int',
"Avg_Rent":'int',
"Med_Home_Val":'int',
"Avg_Home_Val":'int',

"%_Rented":'float',
"%_Owned":'float',

"%_HS_Edu_T":'float',
"%_HS_Edu_M":'float',
"%_HS_Edu_F":'float',

"%_SC_Edu_T":'float',
"%_SC_Edu_M":'float',
"%_SC_Edu_F":'float',

"%_UN_Edu_T":'float',
"%_UN_Edu_M":'float',  
"%_UN_Edu_F":'float',
    
"Health_Avg_Dist":'float',
"Num_Parks":'int',
"%_Green_Space":'float',
    
"Walkscore":"int",

'Trans_Car_%':'float',
'Trans_Pub_%':'float',
'Trans_Walk_%':'float',
'Trans_Cycle_%':'float',
'Trans_Other_%':'float',

'CDNAME':'str',
'CSDNAME':'str',
'CCSNAME':'str',
'CTUID':'str',
'PRNAME':'str',
'UID':'int',
'RecCount':'int',
'CulCount':'int',
'GasCount':'int',
'Area':'float'

}}

def inital_records(in_shape):
    out_recs = {}
    print "Making out Table"
    for rec in in_shape:
        geom,rec = rec['geometry'],rec['properties']
        out_rec = {'geometry':geom,'properties':{
            "DAUID":rec['DAUID'],
            'Age_19_>':0,
            "Age_20_34":0,
            "Age_35_54":0,
            "Age_55_<":0,
                
            'Age_19_>_M':0,
            "Med_Inc_M":0,
            "Med_Inc_F":0,
                
            'Avg_Inc':0,
            "Avg_Inc_M":0,
            "Avg_Inc_F":0,

            "Age_20_34_M":0,
            "Age_35_54_M":0,
            "Age_55_<_M": 0,
                
            'Age_19_>_F':0,
            "Age_20_34_F":0,
            "Age_35_54_F":0,
            "Age_55_<_F":0,
                
                
            'Med_Inc':0,
            "Med_Inc_M":0,
            "Med_Inc_F":0,
                
            'Avg_Inc':0,
            "Avg_Inc_M":0,
            "Avg_Inc_F":0,

            "Tot_Pop":0,
            "Tot_Pop_M":0,
            "Tot_Pop_F":0,
            
            "CT_Pop_T":0,
            "CT_Pop_M":0,
            "CT_Pop_F":0,
            
            "Married_CML_T":0,
            "Married_CML_M":0,
            "Married_CML_F":0,
            
            "Single_T":0,
            "Single_M":0,
            "Single_F":0,
                
            'Total_dwellings':0,
            'Single_house':0,
            'Apt_Build':0,
            'Housing_Other':0,
            'Apart':0,
            "Med_Rent":0,
            "Avg_Rent":0,
            "Med_Home_Val":0,
            "Avg_Home_Val":0,
            
            "%_Rented":0.0,
            "%_Owned":0.0,
            
            "%_HS_Edu_T":0.0,
            "%_HS_Edu_M":0.0,
            "%_HS_Edu_F":0.0,
            
            "%_SC_Edu_T":0.0,
            "%_SC_Edu_M":0.0,
            "%_SC_Edu_F":0.0,
            
            "%_UN_Edu_T":0.0,
            "%_UN_Edu_M":0.0,  
            "%_UN_Edu_F":0.0,
                
            "Health_Avg_Dist":0.0,
            "Num_Parks":0,
            "%_Green_Space":float(rec['green'])*100,
                
            "Walkscore":0,
            
            'Trans_Car_%':0.0,
            'Trans_Pub_%':0.0,
            'Trans_Walk_%':0.0,
            'Trans_Cycle_%':0.0,
            'Trans_Other_%':0.0,
            
            'CDNAME':str(rec['CDNAME']),
            'CSDNAME':str(rec['CSDNAME']),
            'CCSNAME':str(rec['CCSNAME']),
            'CTUID':str(rec['CTUID']),
            'PRNAME':str(rec['PRNAME']),
            'UID':str(rec['UID']),
            'RecCount':int(rec['reccount']),
            'CulCount':int(rec['culcount']),
            'GasCount':int(rec['gascount']),
            'Area':float(rec['gascount'])
            
            }}
        
        out_recs[rec['DAUID']]= out_rec
    return out_recs

def percent(tot,por):
    if tot > 0:
        return (float(por)/float(tot))*100
    else:
        return None

def ct_to_da(in_shape):
    l_table = {}
    print "Making lookup Table"
    for rec in in_shape:
        l_table[rec['properties']['CTUID']] = rec['properties']['DAUID']
    return l_table
            
            
            

        




def get_age_cohorts(re,ref_dict,use_l_table=False,l_table=None):
    firstline = True #skip first line of the csv file as it is just the heading      
    c = 0
    while True:
        try:
            c += 1
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
                        ref_dict[k]['properties']['CT_Pop_T'] += int(row['Total'])
                    if row['Male']: 
                        ref_dict[k]['properties']['CT_Pop_M'] += int(row['Male'])
                    if row['Female']:
                        ref_dict[k]['properties']['CT_Pop_F'] += int(row['Female'])
                
                if row['Characteristic']== '   Married or living with a common-law partner':
                    if row['Total']:
                        ref_dict[k]['properties']['Married_CML_T'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Married_CML_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Married_CML_F'] += int(row['Female'])           
                
                if row['Characteristic']== '   Not married and not living with a common-law partner':
                    if row['Total']:
                        ref_dict[k]['properties']['Single_T'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Single_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Single_F'] += int(row['Female'])            
                
                if row['Characteristic']== 'Total population by age groups':
                    if row['Total']:
                        ref_dict[k]['properties']['Tot_Pop'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Tot_Pop_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Tot_Pop_F'] += int(row['Female'])           
                
                if row['Characteristic'] in youthc:
                    if row['Total']:    
                       ref_dict[k]['properties']['Age_19_>'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Age_19_>_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Age_19_>_F'] += int(row['Female'])            
                
                elif row['Characteristic'] in yadultc:     
                    if row['Total']:    
                       ref_dict[k]['properties']['Age_20_34'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Age_20_34_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Age_20_34_F'] += int(row['Female']) 
                elif row['Characteristic'] in adultc:     
                    if row['Total']:    
                       ref_dict[k]['properties']['Age_20_34'] += int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Age_20_34_M'] += int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Age_20_34_F'] += int(row['Female']) 
                elif row['Characteristic'] in oadultc:     
                    if row['Total']:    
                       ref_dict[k]['properties']['Age_35_54']+= int(row['Total'])
                    if row['Male']:    
                        ref_dict[k]['properties']['Age_35_54_M']+= int(row['Male'])
                    if row['Female']:   
                        ref_dict[k]['properties']['Age_35_54_F']+= int(row['Female'])
    
                if row['Characteristic'] == "Total private dwellings":
                    if row['Total']:
                        ref_dict[k]['properties']['CT_Pop_T'] += int(row['Total'])
                if row['Characteristic']=='   Single-detached house':
                    if row['Total']:
                       ref_dict[k]['properties']['Total_dwellings'] += int(row['Total'])
                
                if row['Characteristic']=='   Apartment, building that has five or more storeys':         
                    if row['Total']:
                       ref_dict[k]['properties']['Apt_Build'] += int(row['Total'])
               
                if row['Characteristic'] in Apartments:
                    if row['Total']:
                        ref_dict[k]['properties']['Apart'] +=   int(row['Total'])

                if row['Characteristic'] in Other_Housing:
                    if row['Total']:
                        ref_dict[k]['properties']['Housing_Other'] +=    int(row['Total'])

                if row['Characteristic'] == '  Median value of dwellings ($)':
                    if row['Total']:
                        ref_dict[k]['properties']['Med_Home_Val'] = int(row['Total'])

                if row['Characteristic'] == '  Average value of dwellings ($)':
                    if row['Total']:
                        ref_dict[k]['properties']['Avg_Home_Val'] = int(row['Total'])

                if row['Characteristic'] == '  Median monthly shelter costs for rented dwellings ($)':
                    if row['Total']:
                        ref_dict[k]['properties']['Med_Rent'] = int(row['Total'])

                if row['Characteristic'] == '  Average monthly shelter costs for rented dwellings ($)':
                    if row['Total']:
                         ref_dict[k]['properties']['Avg_Rent'] = int(row['Total'])       

                if row['Characteristic']=='Total number of private households by tenure':
                    if row['Total']:
                        tot_hous = int(row['Total'])

                if row['Characteristic']=='  Owner':
                    if row['Total']:
                        ref_dict[k]['properties']['%_Owned'] = percent(tot_hous,int(row['Total']))

                if row['Characteristic']=='  Renter':
                    if row['Total']:
                        ref_dict[k]['properties']['%_Rented'] = percent(tot_hous,int(row['Total']))

                if row['Characteristic']=='  Car, truck or van - as a driver':
                    if row['Total']:
                        cc = int(row['Total'])

                if row['Characteristic']=='  Car, truck or van - as a passenger':
                    if row['Total']:
                        cc += int(row['Total'])
                    ref_dict[k]['properties']['Trans_Car_%'] = percent(ref_dict[k]['properties']['CT_Pop_T'],cc)
                        
                if row['Characteristic']=='  Public transit':
                    if row['Total']:
                        ref_dict[k]['properties']['Trans_Pub_%'] = percent(ref_dict[k]['properties']['CT_Pop_T'],int(row['Total']))

                if row['Characteristic']=='  Walked':
                    if row['Total']:
                        ref_dict[k]['properties']['Trans_Walk_%'] =percent(ref_dict[k]['properties']['CT_Pop_T'],int(row['Total']))

                if row['Characteristic']=='  Bicycle':
                    if row['Total']:
                        ref_dict[k]['properties']['Trans_Cycle_%'] = percent(ref_dict[k]['properties']['CT_Pop_T'],int(row['Total']))

                if row['Characteristic']=='  Other methods':
                    if row['Total']:
                        ref_dict[k]['properties']['Trans_Other_%'] = percent(ref_dict[k]['properties']['CT_Pop_T'],int(row['Total']))
                        

                if row['Characteristic'] == 'Total population aged 15 years and over by highest certificate, diploma or degree':
                    #This is a quick fix to skip 10 lines on the csv file so we don't double add values
                    [re.next() for i in range(9)]
                    row = re.next()
                    
                if row['Characteristic'] =='  No certificate, diploma or degree':
                    if row['Total']:    
                        tot_no_deg = int(row['Total'])
                    if row['Male']:                        
                        ma_no_deg = int(row['Male'])
                    if row['Female']:
                        fe_no_deg = int(row['Female'])
                    
                    row = re.next() #Again skipping to the next line to combine No Degree/HighSchool
                    
                if row['Characteristic']=='  High school diploma or equivalent':
                    if row['Total']:    
                        tot_no_deg += int(row['Total'])
                    if row['Male']:                        
                        ma_no_deg += int(row['Male'])
                    if row['Female']:
                        fe_no_deg += int(row['Female'])
                    ref_dict[k]['properties']["%_HS_Edu_T"] = percent(ref_dict[k]['properties']['CT_Pop_T'],tot_no_deg)
                    ref_dict[k]['properties']["%_HS_Edu_M"] = percent(ref_dict[k]['properties']['CT_Pop_M'],ma_no_deg)
                    ref_dict[k]['properties']["%_HS_Edu_F"] = percent(ref_dict[k]['properties']['CT_Pop_F'],fe_no_deg)
                    row = re.next()
                    
                if row['Characteristic']==    '  Postsecondary certificate, diploma or degree':
                    if row['Total']:    
                        tot_no_deg = int(row['Total'])
                    if row['Male']:                        
                        ma_no_deg = int(row['Male'])
                    if row['Female']:
                        fe_no_deg = int(row['Female'])
                    row = re.next()    
                if row['Characteristic']=='    Apprenticeship or trades certificate or diploma':
                    if row['Total']:    
                        tot_no_deg += int(row['Total'])
                    if row['Male']:                 
                        ma_no_deg += int(row['Male'])
                    if row['Female']:
                        fe_no_deg += int(row['Female'])
                    row = re.next()    
                if row['Characteristic']=='    College, CEGEP or other non-university certificate or diploma':
                    if row['Total']:    
                        tot_no_deg += int(row['Total'])
                    if row['Male']:                        
                        ma_no_deg += int(row['Male'])
                    if row['Female']:
                        fe_no_deg += int(row['Female'])
                    row = re.next()    
                if row['Characteristic']=='    University certificate or diploma below bachelor level':
                    if row['Total']:    
                        tot_no_deg += int(row['Total'])
                    if row['Male']:                        
                        ma_no_deg += int(row['Male'])
                    if row['Female']:
                        fe_no_deg += int(row['Female'])
                        
                    ref_dict[k]['properties']["%_SC_Edu_T"] = percent(ref_dict[k]['properties']['CT_Pop_T'],tot_no_deg)
                    ref_dict[k]['properties']["%_SC_Edu_T"] = percent(ref_dict[k]['properties']['CT_Pop_M'],ma_no_deg)
                    ref_dict[k]['properties']["%_SC_Edu_T"] = percent(ref_dict[k]['properties']['CT_Pop_F'],fe_no_deg)
                    row = re.next()
                    
                if row['Characteristic'] == '    University certificate, diploma or degree at bachelor level or above':
                    if row['Total']:
                        ref_dict[k]['properties']["%_UN_Edu_T"] = percent(ref_dict[k]['properties']['CT_Pop_T'],int(row['Total']))
                    if row['Total']:                        
                        ref_dict[k]['properties']["%_UN_Edu_M"] = percent(ref_dict[k]['properties']['CT_Pop_M'],int(row['Male']))
                    if row['Total']:
                        ref_dict[k]['properties']["%_UN_Edu_F"] = percent(ref_dict[k]['properties']['CT_Pop_F'],int(row['Female']))
                
                if row['Characteristic']=='  Median income ($)':
                    if row['Total']:    
                        ref_dict[k]['properties']["Med_Inc"] += int(row['Total'])
                    if row['Male']:                        
                        ref_dict[k]['properties']["Med_Inc_M"] += int(row['Male'])
                    if row['Female']:
                        ref_dict[k]['properties']["Med_Inc_F"] += int(row['Female'])
                if row['Characteristic']=='  Average income ($)':
                    if row['Total']:    
                        ref_dict[k]['properties']["Avg_Inc"] += int(row['Total'])
                    if row['Male']:                        
                        ref_dict[k]['properties']["Avg_Inc_M"] += int(row['Male'])
                    if row['Female']:
                        ref_dict[k]['properties']["Avg_Inc_F"] += int(row['Female'])                
#            if c >10:
#                break
        except StopIteration:
          break
    return ref_dict


import fiona
import csv

in_shape= fiona.open('../data/census_2011/final_shape_prj.shp','r')
out_shape= fiona.open('../data/census_2011/complete_data.shp','w',"ESRI Shapefile", schema=schema, crs=in_shape.crs)
re1 = csv.DictReader(open('../data/501.csv','rb'),fieldnames=['Geo_Code', 'Prov_name', 'Geo_nom', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])

ref_dict = inital_records(in_shape)
ref_dict= get_age_cohorts(re1,ref_dict)

l_table = ct_to_da(in_shape)


re = csv.DictReader(open('../data/401.csv','rb'),fieldnames=['Geo_Code', 'Prov_Name', 'CMA_CA_Name', 'CT_Name', 'GNR', 'Topic', 'Characteristic', 'Note', 'Total', 'Flag_Total', 'Male', 'Flag_Male', 'Female', 'Flag_Female'])


ref_dict= get_age_cohorts(re,ref_dict,True,l_table)

for k,v in ref_dict.items():
    out_shape.write(v)
    vk = set(v['properties'].keys())
    sk = set(schema['properties'].keys())
out_shape.close()