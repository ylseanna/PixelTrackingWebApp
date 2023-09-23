"use client";

import React, { ComponentProps, useEffect, useRef } from "react";
import {useTranslations} from 'next-intl';
import Image from "next/image";

import * as d3Base from 'd3'
// @ts-ignore
import { geoScaleBar } from 'd3-geo-scale-bar'

// attach all d3 plugins to the d3 library
const d3 = Object.assign(d3Base, { geoScaleBar })


function DisplacementMap(props: ComponentProps<any>) {
  const t = useTranslations('Common');

  const margin = { top: 0, right: 0, bottom: 80, left: 0 };

  useEffect(drawMap, [props.id, props.width, props.height, props.minlon, props.maxlon, props.minlat, props.maxlat, margin.top, margin.right, margin.bottom, margin.left, t]);

  function drawMap() {
    // data


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
        type: 'Feature',
        geometry: {
          type: 'Polygon',
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
        'scale': scale,
        'center': center,
        'bbox' : {type: 'FeatureCollection', features: [bbox]}
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
      .attr('preserveAspectRatio', 'xMidYMid meet')
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
      .style("outline-offset", '-3px');

    const scaleBar = d3.geoScaleBar().zoomClamp(false)
      .projection(projection)
      .size([width, height])
      .top(.94)
      .left(0.01)
      .label(t('km_unit'))
      .distance(2);

    const bar = map.append("g")
      .attr("class", "scale-bar-wrapper")
      .call(scaleBar);

    async function plotVectors() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/pt?timespan=20100621-20110802`);

      const json = await response.json();

      let vectors = map.append("g");

      const colour : string = 'black';

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

  return <>
    <Image
      // className="rounded-xl"
      priority={true}
      style={
      {
        position:"absolute",
        height: 'auto',
        width: 'calc(100% - 4rem)',
        marginTop: margin.top,
        marginBottom: margin.bottom,
        paddingLeft: margin.left,
        marginRight: margin.right,
      }
      } src={
        `${process.env.NEXT_PUBLIC_APP_BASE_PATH}/media/projected_20100621-20110802.png`
      } width={props.width} height={props.height} alt=""></Image>
    <div id={props.id} style={{position:"absolute", height: 'auto', width: 'calc(100% - 4rem)'}}></div>
  </>;
}
export default DisplacementMap;
