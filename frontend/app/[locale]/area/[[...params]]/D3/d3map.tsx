"use client";

import React, { ComponentProps, useEffect, useRef } from "react";
import {useTranslations} from "next-intl";
import Image from "next/image";


import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import * as d3Base from "d3"
// @ts-ignore
import { geoScaleBar } from "d3-geo-scale-bar"
import { ButtonGroup, IconButton } from "@mui/material";
import Link from "next/link";
import { Dataset, Download } from "@mui/icons-material";

// attach all d3 plugins to the d3 library
const d3 = Object.assign(d3Base, { geoScaleBar })


function DisplacementMap(props: ComponentProps<any>) {
  const t = useTranslations();

  const margin = { top: 0, right: 0, bottom: 80, left: 0 };

  useEffect(drawMap, [props.id, props.width, props.height, props.minlon, props.maxlon, props.minlat, props.maxlat, margin.top, margin.right, margin.bottom, margin.left, t]);

  function drawMap() {
    // dataCommon


    // attachment point
    const node = document.getElementById(props.id)!;

    node.replaceChildren(); // only necessary for dev mode



    const mapWidth = props.width,
          mapHeight = props.height;

    const width = props.width + margin.right + margin.left,
          height = props.height + margin.top + margin.bottom;


    let projection = d3.geoMercator().scale(1); //dummy projection

    let tempPath = d3.geoPath(projection);


    function calculateScaleCenter(maxlon : number, minlon : number, maxlat: number, minlat : number) {
      let bbox: any = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[minlon,maxlat],[maxlon,maxlat],[maxlon,minlat],[minlon,minlat],[minlon,maxlat]]]
        }
      };

      let bbox_path = tempPath.bounds(bbox),
      scale = Math.max(
        mapWidth / (bbox_path[1][0] - bbox_path[0][0]),
        mapHeight / (bbox_path[1][1] - bbox_path[0][1])
      );


      let center = [
            (maxlon + minlon) / 2,
            (maxlat + minlat) / 2];

      return {
        "scale": scale,
        "center": center,
        "bbox" : {type: "FeatureCollection", features: [bbox]}
      };
    }

    const MapExtent = calculateScaleCenter(props.maxlon, props.minlon, props.maxlat, props.minlat);

    projection
    // @ts-ignore
      .center(MapExtent.center) // Set the center coordinates of the map
      .scale(MapExtent.scale) // Adjust the scale to fit the map nicely
      .translate([(margin.left + mapWidth) / 2, (margin.top + mapHeight) / 2]); // Set the translation to center the map

    let geoGenerator = d3.geoPath().projection(projection);

    let svg = d3.select(node)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "max-width: calc(100%); height: calc(100%);");


    let map = svg.append("g").attr("class", "map-wrapper");

    map.selectAll("path")
      .data(MapExtent.bbox.features)
      .enter()
      .append("path")
      .attr("d", geoGenerator)
      .style("fill-opacity", "0")
      .style("outline-opacity", 0)
      .style("outline", "solid")
      .style("outline-width", 3)
      .style("outline-offset", "-3px");

    const scaleBar = d3.geoScaleBar().zoomClamp(false)
      .projection(projection)
      .size([width, height])
      .top(.94)
      .left(0.01)
      .label(t("Common.km_unit"))
      .distance(2);

    const bar = map.append("g")
      .attr("class", "scale-bar-wrapper")
      .call(scaleBar);

    async function plotVectors() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/pt?timespan=20100621-20110802`);

      const json = await response.json();

      let vectors = map.append("g");

      const colour : string = "black";

      vectors.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .each((d: any, i) => {
          const coords = geoGenerator.centroid(d);

          const scaling = 10;

          const secondarycoords = [coords[0] + scaling * d.properties.Dx, coords[1] - scaling * d.properties.Dy]; //positive x, negative y

          vectors.append("polyline")
          // @ts-ignore
          .attr("points", [coords, secondarycoords])
          .attr("stroke", colour)
          .attr("stroke-width", 2);
        })
        // @ts-ignore
        .attr("d", geoGenerator.pointRadius(2.5))
        .attr("fill", colour);
    }

    plotVectors();

    svg.node();
  };

  function generateItems(timespan : string) {
    const timespans : string[] = timespan.split("-")


    let date1 = new Date(Date.parse())
    let date2 = new Date(Date.parse(timespans[1].substring(0,4) + "-" + timespans[0].substring(4,6) + "-" + timespans[0].substring(6,8)))



    return  <MenuItem value={timespan}>{
      timespans[0].substring(0,4) + "-" + timespans[0].substring(4,6) + "-" + timespans[0].substring(6,8)
      + " "}&mdash;{" " + timespans[1].substring(0,4) + "-" + timespans[1].substring(4,6) + "-" + timespans[1].substring(6,8)}
      </MenuItem>
  };

  return <>
   <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">{t("Area.timespan")}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={props.timespan}
        label={t("Area.timespan")}
        placeholder={props.timespan}
        onChange={console.log("changed")}
        >
          {
            generateItems(props.timespan)
          }        
               
      </Select>
    </FormControl>
    <div className="mt-4">
      <Image
        // className="rounded-xl"
        priority={true}
        style={
        {
          position:"absolute",
          height: "auto",
          width: "calc(100% - 4rem)",
          marginTop: margin.top,
          marginBottom: margin.bottom,
          paddingLeft: margin.left,
          marginRight: margin.right,
        }
        } src={
          `${process.env.NEXT_PUBLIC_APP_BASE_PATH}/media/projected_20100621-20110802.png`
        } width={props.width} height={props.height} alt=""></Image>
      <div id={props.id} style={{position:"absolute", height: "auto", width: "calc(100% - 4rem)"}}></div>
    </div>

    <ButtonGroup className="absolute bottom-0 right-0 m-8" variant="contained">
      <Link  href={"/api/pt?timespan=" + props.timespan} target="_blank">
        <IconButton component="label">
            <Dataset />
        </IconButton>
      </Link>
      <Link  href={"/api/pt?timespan=" + props.timespan} target="_blank" download={"pt_vectors_" + props.timespan + ".json"}>
        <IconButton component="label">
            <Download />
        </IconButton>
      </Link>
    </ButtonGroup>
    
      
  </>;
}
export default DisplacementMap;
