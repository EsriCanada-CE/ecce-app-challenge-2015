# -*- coding: utf-8 -*-
"""
Created on Thu Mar  5 05:22:05 2015

@author: rep
"""

import os

files = os.listdir('.')
layer_names = open('./Vancouver_layer_names.txt','w')
#layer_names.write('Vancouver_layer Layer Names: \n')
out = open('edmon_data_complete'+'.'+'js','w')
for f in files:
    if f.startswith('ed') and f.endswith('json'):
        name,ex = f.split('.')
        
        fl = open(f,'r').read()
        s = 'var '+name+' =['+fl+' ];\n'
        out.write(s)
        #layer_names.write( name +'\n')
out.close()
#layer_names.close()
