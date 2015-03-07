# -*- coding: utf-8 -*-
"""
Created on Tue Mar  3 02:31:55 2015

@author: rep
"""
import fiona
import json

def ct_to_da(in_shape):
    C = 0
    orec={"type":"FeatureCollection","features":[]}
    print "Making lookup Table"
    for rec in in_shape:
        rec['properties']= dict(rec['properties'])
        orec['features'].append(rec)
        C +=1
    return orec

in_shape= fiona.open('../data/census_2011/sample_shape.shp','r')
shapes = open('../front_end/data.json','wb')
recs = ct_to_da(in_shape)
shapes.write(json.dumps(recs))
shapes.close()