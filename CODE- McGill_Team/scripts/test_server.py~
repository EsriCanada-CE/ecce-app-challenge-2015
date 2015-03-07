# -*- coding: utf-8 -*-
"""
Created on Sun Mar  1 12:36:56 2015

@author: rep
"""

import json
import cherrypy

import os
import logging

#com_profile,shapes = census_parsing.run()
cur_dir = os.path.dirname(os.path.realpath(__file__))
os.chdir('../front_end')
com_profile,shapes = 'Nothing','Nothing'
class HelloWorld(object):
    def home(self):
        page = '../front_end/home.html'
        return open(page)
    home.exposed = True
    
    def van_map(self):
        page = '../front_end/van_map.html'
        return open(page)
    van_map.exposed = True
    
    def edmon_map(self):
        page = '../front_end/edmon_map.html'
        return open(page)
    edmon_map.exposed = True

    def van_map_profiles(self):
        return open(com_profile)
    van_map_profiles.exposed = True
    
    def van_map_shapes(self):
        return open(shapes)
    van_map_shapes.exposed = True
    
    def edmon_map_profiles(self):
        return open(com_profile)
    edmon_map_profiles.exposed = True
    
    def edmon_map_shapes(self):
        return open(shapes)
    edmon_map_shapes.exposed = True
#    
    def about_team(self):
        page = '../front_end/about_team.html'
        return open(page)
    
    def about_app(self):
        page = '../front_end/about_app.html'
        return open(page)
        
        
        
cherrypy.quickstart(HelloWorld(),'/',{'/':{
                'tools.staticdir.on': True,
                'tools.staticdir.dir': os.path.abspath(os.curdir)
            }})