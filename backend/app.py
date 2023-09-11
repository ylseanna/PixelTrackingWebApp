from flask import Flask, request
from flask import jsonify

import sys

import pandas as pd

app = Flask(__name__)

@app.route('/api')
def hello():
    return '''<p>This the api gateway</p>'''

@app.route('/api/testdata')
def testdata():
    df = pd.read_csv('data/data.csv', parse_dates=[0], dayfirst=True) #stinky Americans

    return df.to_json(orient='table')

@app.route('/api/pt')
def pt():
    import numpy as np
    
    
    area = request.args.get('area', default='tungpt')
    platform = request.args.get('platform', default='TSX')
    timespan = request.args.get('timespan')

    df = pd.read_csv(f'data/pt/{area}/{platform}/{timespan}/geocoded_offsets/AutoRIFT.data', skipinitialspace=True).rename(columns={"# Dx" : "Dx"})

    import json

    extent = None
    with open(f'data/extents/{area}.json') as f:
        extent = json.load(f)
    
    # Modify data
    
    df['Dx'] = df['Dx'] - np.median(df['Dx'].values)
    
    df['Dtot'] = np.sqrt(df['Dy']**2 + df['Dx']**2)
    # rad = np.pi/2 - np.arctan2(dy[i], -dx[i])
    # angle = np.degrees(rad) + head[i]
    
    print('helloooo', flush=True)
    
    from geojson import Feature, Point, FeatureCollection, dumps

    features = []
    for index, row in df.iterrows():
        if row['Lat'] < extent['maxlat'] and row['Lat'] > extent['minlat'] and row['Lon'] < extent['maxlon'] and row['Lon'] > extent['minlon']:
            point = Point((row['Lon'], row['Lat']))

            feature = Feature(geometry=point, properties={"Dx" : row['Dx'], "Dy" : row['Dy']})
            features.append(feature)




    feature_collection = FeatureCollection(features)

    return dumps(feature_collection)

if __name__ == "__main__":
    app.run(host='0.0.0.0')
