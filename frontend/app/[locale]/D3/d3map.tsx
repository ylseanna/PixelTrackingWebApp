"use client";

import React, { ComponentProps, useEffect, useRef } from "react";
import {useTranslations} from "next-intl";

import * as d3Base from "d3"
// @ts-ignore
import { geoScaleBar } from "d3-geo-scale-bar"

// attach all d3 plugins to the d3 library
const d3 = Object.assign(d3Base, { geoScaleBar })


function ZoomMap(props: ComponentProps<any>) {
  const t = useTranslations("Common");

  useEffect(drawMap, [props.id, t]);

  function drawMap() {
    // data
    let strandlinaflakar = require("./strandlina_flakar.json");
    let joklaflakar = require("./flakar_joklar.json");
    let svaedi = require("./svaedi.json");

    // attachment point
    const node = document.getElementById("#" + props.id)!;

    node.replaceChildren() // only necessary for dev mode

    const width = 2000;
    const height = 1000;


    const zoom = d3.zoom()
      .scaleExtent([1, 200])
      .on("zoom", zoomed);


    let projection = d3.geoMercator()
      .center([-18.7,65]) // Set the center coordinates of the map
      .scale(7500) // Adjust the scale to fit the map nicely
      .translate([width / 2, height / 2]); // Set the translation to center the map

    let geoGenerator = d3.geoPath().projection(projection);

    let svg = d3.select(node)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "max-width: calc(100%); height: calc(100% - 64px);")
      .on("click", reset);


    let g = svg.append("g");

    let coast = g.append("g");

    coast.selectAll("path")
      .data(strandlinaflakar.features)
      .enter()
      .append("path")
      // @ts-ignore
      .attr("d", geoGenerator)
      .style("fill", "gray")
      .style("fill-opacity", "1");

    let joklar = g.append("g");

    joklar.selectAll("path")
      .data(joklaflakar.features)
      .enter()
      .append("path")
      // @ts-ignore
      .attr("d", geoGenerator)
      .style("fill", "white")
      .style("fill-opacity", "1");

    let pixeltracking = g.append("g");

    pixeltracking.selectAll("path")
      .data(svaedi.features)
      .enter()
      .append("path")
      .attr("cursor", "pointer")
      // @ts-ignore
      .attr("d", geoGenerator)
      .attr("id", (d,i) => {return svaedi.features[i].properties.id})
      .style("stroke", "black")
      .style("fill-opacity", "0")
      .style("stroke-width", "2")
      .attr("vector-effect", "non-scaling-stroke")
      // @ts-ignore
      .on("click", clicked)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().style("stroke-width", "3")
      })
      .on("mouseout", function(event, d) {
        d3.select(this).transition().style("stroke-width", "2")
      }
    );


    const scaleBar = d3.geoScaleBar().zoomClamp(false)
      .projection(projection)
      .size([width, height])
      .top(0.95)
      .left(0.025)
      .tickSize(null)
      .tickFormat((d: number) => d3.format(",")(+d.toFixed(1)))
      .label(t("km_unit"));

      const bar = svg.append("g")
      .attr("class", "scale-bar-wrapper")
      .call(scaleBar);


    function zoomed(event: { transform: any; }) {
      const {transform} = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
      scaleBar.zoomFactor(transform.k);
      bar.call(scaleBar);
    }

    function clicked(event: Event, d: d3Base.GeoPermissibleObjects) {
      const [[x0, y0], [x1, y1]] = geoGenerator.bounds(d);

      event.stopPropagation();
      svg.transition().duration(750).call(
        // @ts-ignore
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(50, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
      );
    }

    function reset() {
      svg.transition().duration(750).call(
        // @ts-ignore
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()!).invert([width / 2, height / 2])
      );
    }

    // @ts-ignore
    svg.call(zoom);

    svg.node();
  };

  return <div id={"#" + props.id} style={{position: "fixed", height: "100vh", width: "100vw"}}></div>;
}
export default ZoomMap;
