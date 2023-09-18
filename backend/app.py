from functools import lru_cache

from flask import Flask, request
from flask_caching import Cache

from geojson import Feature, Point, FeatureCollection, dumps

import os

import json
import pandas as pd
import numpy as np

# Flask-Caching config
config = {
    "CACHE_DEFAULT_TIMEOUT": 0,
    "CACHE_TYPE": "FileSystemCache",
    "CACHE_DIR": "cache"
}

app = Flask(__name__)
app.config.from_mapping(config)
if os.environ.get("ENV") == "development":
    # Disable cache if running in development mode
    app.config["CACHE_TYPE"] = "NullCache"
cache = Cache(app)

# Constants
PT_ROOT = "data/pt"  # PT data directory root
PT_DIRLIST = None    # Recursive directory listing of the PT directory


def init():
    """Initializes variables needed for handling requests"""
    global PT_DIRLIST

    # Create a recursive directory listing of the PT directory
    PT_DIRLIST = {root: dirs for root, dirs, files in os.walk(PT_ROOT)}


init()


class ArgumentError(Exception):
    """Error used when the user inputs invalid argument values"""
    status_code = 404

    def __init__(self, message, status_code=None):
        super(ArgumentError, self).__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def response(self):
        return {"message": self.message, "status": self.status_code}


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

    # Validate arguments
    if f"{PT_ROOT}/{area}/{platform}/{timespan}" not in PT_DIRLIST or not os.path.isfile(f"data/extents/{area}.json"):
        raise ArgumentError("Invalid argument values.")

    # Use separate cached function for generating data
    return render_pt(area, platform, timespan)


@app.errorhandler(ArgumentError)
def handle_errors(e):
    return e.response(), e.status_code


@cache.memoize()
def render_pt(area, platform, timespan):
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
