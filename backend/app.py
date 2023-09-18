from functools import lru_cache

from flask import Flask, request

from geojson import Feature, Point, FeatureCollection, dumps

import os

import json
import pandas as pd
import numpy as np

app = Flask(__name__)

# Constants
PT_ROOT = "data/pt"  # PT data directory root
PT_DIRLIST = None    # Recursive directory listing of the PT directory


def init():
    """Initializes variables needed for handling requests"""
    global PT_DIRLIST

    # Create a recursive directory listing of the PT directory
    PT_DIRLIST = {root: dirs for root, dirs, files in os.walk(PT_ROOT)}


init()


@app.route('/api')
def hello():
    return '''<p>This the api gateway</p>'''


@app.route('/api/testdata')
def testdata():
    df = pd.read_csv('data/data.csv', parse_dates=[0], dayfirst=True)  # Stinky Americans

    return df.to_json(orient='table')


@app.route('/api/pt')
def pt():
    area = request.args.get('area', default='tungpt')
    platform = request.args.get('platform', default='TSX')
    timespan = request.args.get('timespan')

    # Use separate cached function for generating data
    return render_pt(area, platform, timespan)


@lru_cache
def render_pt(area, platform, timespan):
    if f"{PT_ROOT}/{area}/{platform}/{timespan}" not in PT_DIRLIST or not os.path.isfile(f"data/extents/{area}.json"):
        # TODO: Return proper error
        return "Error"

    df = pd.read_csv(f'{PT_ROOT}/{area}/{platform}/{timespan}/geocoded_offsets/AutoRIFT.data', skipinitialspace=True).rename(columns={"# Dx": "Dx"})

    extent = None
    with open(f'data/extents/{area}.json') as f:
        extent = json.load(f)

    # Modify data

    df['Dx'] = df['Dx'] - np.median(df['Dx'].values)
    df['Dy'] = df['Dy'] - np.median(df['Dy'].values)

    df['Dtot'] = np.sqrt(df['Dy']**2 + df['Dx']**2)
    # rad = np.pi/2 - np.arctan2(dy[i], -dx[i])
    # angle = np.degrees(rad) + head[i]

    print(df)

    features = []
    for index, row in df.iterrows():
        if row['Lat'] < extent['maxlat'] and row['Lat'] > extent['minlat'] and row['Lon'] < extent['maxlon'] and row['Lon'] > extent['minlon']:
            point = Point((row['Lon'], row['Lat']))
            
            rad = np.pi/2 - np.arctan2(row['Dy'], -row['Dx'])
            angle = np.degrees(rad) + row['heading']
                        
            dx = np.abs(row['Dtot']) * np.cos(np.deg2rad(angle))
            dy = np.abs(row['Dtot']) * np.sin(np.deg2rad(angle))

            feature = Feature(geometry=point, properties={"Dx": dx, "Dy": dy})
            features.append(feature)

    feature_collection = FeatureCollection(features)

    return dumps(feature_collection)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
