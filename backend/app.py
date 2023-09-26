from flask import Flask, request, make_response
from flask_caching import Cache

from geojson import Feature, Point, FeatureCollection, dumps

import os

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Flask-Caching config
config = {
    "CACHE_DEFAULT_TIMEOUT": 0,
    "CACHE_TYPE": "FileSystemCache",
    "CACHE_DIR": "cache",
}

app = Flask(__name__)
app.config.from_mapping(config)
if os.environ.get("ENV") == "development":
    # Disable cache if running in development mode
    app.config["CACHE_TYPE"] = "NullCache"
cache = Cache(app)

# Constants
PT_ROOT = "data/pt"  # PT data directory root
PT_DIRLIST = None  # Recursive directory listing of the PT directory


def init():
    """Initializes variables needed for handling requests"""
    global PT_DIRLIST

    # Create a recursive directory listing of the PT directory
    PT_DIRLIST = {root: dirs for root, dirs, files in os.walk(PT_ROOT)}


init()


class ArgumentError(Exception):
    """Error used when the user inputs invalid argument values"""

    status_code = 400

    def __init__(self, message, status_code=None):
        super(ArgumentError, self).__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def response(self):
        return {"message": self.message, "status": self.status_code}


@app.route("/api")
def hello():
    return """<p>This the api gateway</p>"""


@app.route("/api/testdata")
def testdata():
    df = pd.read_csv(
        "data/data.csv", parse_dates=[0], dayfirst=True
    )  # Stinky Americans

    return df.to_json(orient="table")


@app.route("/api/pt_interp")
def pt_interp():
    area = request.args.get("area")
    
    method = request.args.get("method", default="recalculate")

    if f"{PT_ROOT}/{area}" not in PT_DIRLIST or not os.path.isfile(
        f"data/extents/{area}.json"
    ):
        raise ArgumentError("Invalid argument values, please specify a valid area id.")

    if method == "default":
        default_response = None
        with open(f"{PT_ROOT}/{area}/default_interp.json") as f:
            default_response = json.load(f)
        return default_response
    elif method == "recalculate":
        return render_pt_interp(area)
    


@app.route("/api/pt")
def pt():
    area = request.args.get("area", default="tungpt")
    platform = request.args.get("platform", default="TSX")
    timespan = request.args.get("timespan")

    # Validate arguments
    if f"{PT_ROOT}/{area}/{platform}" not in PT_DIRLIST or not os.path.isfile(
        f"data/extents/{area}.json"
    ):
        raise ArgumentError("Invalid argument values.")

    # Give list of date ids to allow dynamic generation
    if timespan == None:
        return {"timespans": os.listdir(f"{PT_ROOT}/{area}/{platform}")}
    elif f"{PT_ROOT}/{area}/{platform}/{timespan}" not in PT_DIRLIST:
        raise ArgumentError("Invalid timespan value.")

    # Use separate memoized function for generating data
    data = render_pt(area, platform, timespan)
    
    # Return response with JSON mimetype
    response = make_response(data)
    response.mimetype = "application/json"
    return response


@app.errorhandler(ArgumentError)
def handle_errors(e):
    return e.response(), e.status_code


@cache.memoize()
def render_pt(area, platform, timespan):
    df = pd.read_csv(
        f"{PT_ROOT}/{area}/{platform}/{timespan}/geocoded_offsets/AutoRIFT.data",
        skipinitialspace=True,
    ).rename(columns={"# Dx": "Dx"})

    extent = None
    with open(f"data/extents/{area}.json") as f:
        extent = json.load(f)

    # Modify data

    df["Dx"] = df["Dx"] - np.median(df["Dx"].values)
    df["Dy"] = df["Dy"] - np.median(df["Dy"].values)

    df["Dtot"] = np.sqrt(df["Dy"] ** 2 + df["Dx"] ** 2)

    rad = np.pi / 2 - np.arctan2(df["Dy"], -df["Dx"])

    angle = np.degrees(rad) + df["heading"]

    df["Dx"] = np.abs(df["Dtot"]) * np.cos(np.deg2rad(angle))
    df["Dy"] = np.abs(df["Dtot"]) * np.sin(np.deg2rad(angle))

    print(df)

    features = []
    for index, row in df.iterrows():
        if (
            row["Lat"] < extent["maxlat"]
            and row["Lat"] > extent["minlat"]
            and row["Lon"] < extent["maxlon"]
            and row["Lon"] > extent["minlon"]
        ):
            point = Point((row["Lon"], row["Lat"]))

            feature = Feature(
                geometry=point, properties={"Dx": row["Dx"], "Dy": row["Dy"]}
            )
            features.append(feature)

    feature_collection = FeatureCollection(features)

    return dumps(feature_collection)


@cache.memoize()
def render_pt_interp(area):
    class Estimation:
        # IWD. Check: https://stackoverflow.com/questions/36031338/interpolate-z-values-in-a-3d-surface-starting-from-an-irregular-set-of-points/36037288#36037288
        def __init__(self, lon, lat, values):
            self.x = lon
            self.y = lat
            self.v = values

        def estimate(self, x, y, using="ISD"):
            """
            Estimate point at coordinate x,y based on the input data for this
            class.
            """
            if using == "ISD":
                return self._isd(x, y)

        def _isd(self, x, y):
            import geopy.distance

            # d = np.sqrt((x-self.x)**2+(y-self.y)**2)
            d = self.x.copy()
            for i in range(len(d)):
                distance = geopy.distance.geodesic((self.x[i], self.y[i]), (x, y)).m
                d[i] = distance
            if d.min() > 0:
                v = np.sum(self.v * (1 / d**4)) / np.sum(1 / d**4)
                return v
            else:
                return self.v[d.argmin()]

    default_pointlat = 63.651974
    default_pointlon = -19.344262

    platforms_interp = []
    
    files = os.listdir(f"{PT_ROOT}/{area}")
    
    for platform in [i for i in files if not i.endswith(".json")]:
            
        interpolated_values = []
        
        for timespan in sorted(os.listdir(f"{PT_ROOT}/{area}/{platform}")):
            # import data
                        
            df = pd.read_csv(
                f"{PT_ROOT}/{area}/{platform}/{timespan}/geocoded_offsets/AutoRIFT.data",
                skipinitialspace=True,
            ).rename(columns={"# Dx": "Dx"})

            log = None
            with open(f"{PT_ROOT}/{area}/{platform}/{timespan}/log.json") as f:
                log = json.load(f)
                
            # process for heading and offset

            df["Dx"] = df["Dx"] - np.median(df["Dx"].values)
            df["Dy"] = df["Dy"] - np.median(df["Dy"].values)

            df["Dtot"] = np.sqrt(df["Dy"] ** 2 + df["Dx"] ** 2)

            rad = np.pi / 2 - np.arctan2(df["Dy"], -df["Dx"])

            angle = np.degrees(rad) + df["heading"]

            df["Dx"] = np.abs(df["Dtot"]) * np.cos(np.deg2rad(angle))
            df["Dy"] = np.abs(df["Dtot"]) * np.sin(np.deg2rad(angle))
            
            # interpolation

            eX = Estimation(df["Lon"], df["Lat"], df["Dx"])
            eY = Estimation(df["Lon"], df["Lat"], df["Dy"])

            # interp_Dx, interp_Dy, interp_Dtot = (2, 2, 2)

            interp_Dx = eX.estimate(default_pointlon, default_pointlat)
            interp_Dy = eY.estimate(default_pointlon, default_pointlat)

            interp_Dtot = np.sqrt(interp_Dy**2 + interp_Dx**2)
            
            # Timestamps and velocities

            start_time = datetime.fromisoformat(
                log["frame_metadata"][0]["reference"]["begintime"]
            )

            end_time = datetime.fromisoformat(
                log["frame_metadata"][1]["secondary"]["begintime"]
            )

            dt = end_time - start_time

            cent_time = start_time + dt / 2

            dt_yrs = dt / timedelta(days=365.2425)

            velx = interp_Dx / dt_yrs
            vely = interp_Dy / dt_yrs

            veltot = interp_Dtot / dt_yrs
            
            # error
            
            error = 1 # for now
            
            # save

            interpolated_values.append(
                {
                    "cent_time": cent_time.isoformat(timespec='milliseconds'),
                    "start_time": start_time.isoformat(timespec='milliseconds'),
                    "end_time": end_time.isoformat(timespec='milliseconds'),
                    "Dx": interp_Dx,
                    "Dy": interp_Dy,
                    "Dtot": interp_Dtot,
                    "velx": velx,
                    "vely": vely,
                    "veltot": veltot,
                    "error": error
                }
            )
        
        platforms_interp.append({
            "coordinates" : {"lat": default_pointlat, "lon": default_pointlon},
            "platform" : platform,
            "data": interpolated_values
            })

    return {"interpolated_values": platforms_interp}


if __name__ == "__main__":
    app.run(host="0.0.0.0")
