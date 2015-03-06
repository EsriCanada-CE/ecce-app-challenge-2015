#!/bin/env node

// The next set of cesi updates is April 15!
// We've been informed that the columns
// will may change so we're not automatically updating
// the arcgis feature services automatically (yet)

import request from 'request';
import csv from 'csv-parser';
import fs from 'fs';
import mkdirp from 'mkdirp';
import _ from 'lodash';
import through from 'through2';
import toArray from 'stream-to-array';

const tables = [
    {id:1, emission: '2012 GHG Emissions (kilotonnes of carbon dioxide equivalent)',
     url: 'NAICS Data Link', unit: 'kilotonnes'},  // GHG
    {id:5, emission: '2012 NOx Emissions (t)',
     url: 'NAICS Data Link', unit: 'tons'},  // NOx
    {id:6, emission: '2012 SOx Emissions (t)',
     url: 'NAICS Data Link', unit: 'tons'},  // SOx
    {id:7, emission: '2012 VOC Emissions (t)',
     url: 'NAICS Data Link', unit: 'tons'},  // VOC
    {id:9, emission: '2012 NH3 Emissions (t)',
     url: 'NAICS Data Link', unit: 'tons'},  // NH3
    {id:11, emission: '2012 Hg Emissions (kg)',
     url: 'NAICS Data Link', unit: 'kilograms'} // Hg
];

mkdirp.sync('temp');

tables.forEach(table => {
    let url = `http://maps-cartes.ec.gc.ca/CESI_Services/DataService/${table.id}/en`;
    console.log('Downloading', url);
    let stream = request(url)
      .pipe(csv({separator: '\t'}))
      .pipe(through.obj(function(row, enc, cb) {
        let props = {
          facility_name: row['Facility Name'],
          city: row.City,
          prov: row.Province,
          address: row.Address,
          postal_code: row['Postal Code'],
          url: row[table.url],
          emission: row[table.emission],
          year: 2012,
          unit: table.unit
        };
        this.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [+row.Longitude, +row.Latitude]
            },
            properties: props
        });
        cb();
      }));

    // Pipe the stream to an array, format as geojson (wgs84) and pipe to fie
    toArray(stream, (err, arr) => {
        let json = JSON.stringify({
           'type': 'FeatureCollection',
           'features': arr
        }, null, 2);
        let file = `./temp/${table.id}.json`;
        fs.writeFile(file, json, () => console.log('writing', file));
    });
});
