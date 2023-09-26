"use client";

import React, { ComponentProps, useEffect } from "react";
import * as d3 from "d3";
import { useTranslations } from "next-intl";

import { InterpResponse } from "./interfaces";
import { ButtonGroup, IconButton, Tooltip } from "@mui/material";
import Link from "next/link";
import { Dataset, Download } from "@mui/icons-material";

function VelPlot(props: ComponentProps<any>) {
  const t = useTranslations("Plots");

  useEffect(drawChart, [props.height, props.id, props.width, props.area, t]);

  function drawChart() {
    let margin = { top: 5, right: 0, bottom: 40, left: 55 },
      viewwidth = props.width + margin.left + margin.right,
      viewheight = props.height + margin.top + margin.bottom,
      width = props.width - margin.left - margin.right,
      height = props.height - margin.top - margin.bottom;

    const node = document.getElementById("#" + props.id)!;
    node.replaceChildren(); // only necessary for dev mode

    let svg = d3
      .select(node) //
      .append("svg")
      .attr("viewBox", [0, 0, viewwidth, viewheight])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "max-width: calc(100%); height: calc(100%);");

    async function GeneratePlot() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/pt_interp?area=${props.area}&method=default`
      );

      const json: InterpResponse = await response.json();

      function TimeString(timestring: string) {
        return d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")(timestring);
      }

      let xlim_min: string[] = [];
      let xlim_max: string[] = [];
      let ymaxvals: number[] = [];

      json.interpolated_values.forEach((platform) => {
        xlim_min.push(platform.data[0]["start_time"]);
        xlim_max.push(platform.data[platform.data.length - 1]["end_time"]);

        platform.data.forEach((datum) => {
          ymaxvals.push(datum["veltot"] + datum["error"]);
        });
      });

      // GENERATE X-axis
      let x = d3
        .scaleTime()
        // @ts-ignore
        .domain([TimeString(d3.min(xlim_min)), TimeString(d3.max(xlim_max))])
        .range([0, props.width]);

      let xAxis = d3.axisBottom(x);

      // svg.append("g");
      //   .attr("transform", "translate(" + margin.left + "," + (viewheight - margin.bottom) + ")")
      //   .call(xAxis.ticks(d3.timeMonth).tickSizeOuter(0));

      // svg.selectAll(".tick text").remove();

      svg
        .append("g")
        .attr(
          "transform",
          "translate(" + margin.left + "," + (viewheight - margin.bottom) + ")"
        )
        .call(xAxis.ticks(d3.timeYear).tickSize(10).tickSizeOuter(0));

      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + viewwidth / 2 + "," + (viewheight - 5) + ")"
        )
        .style("text-anchor", "middle")
        .style("font", "14px Roboto")
        .attr("fill", "black")
        .text(t("axes_date"));

      // GENERATE Y-axis

      let y = d3
        .scaleLinear()
        // @ts-ignore
        .domain([0, 1.1 * d3.max(ymaxvals)])
        .range([props.height, 0]);

      svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(y).tickSizeOuter(0));

      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + 19 + "," + props.height / 2 + ") rotate(270)"
        ) // width transform is font-size plus margin
        .style("text-anchor", "middle")
        .style("font", "14px Roboto")
        .attr("fill", "black")
        .text(t("axes_vel"));

      // ADD points

      let graph = svg
        .append("g")
        .attr("id", "graph")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      json.interpolated_values.forEach((platform) => {
        let platformscatter = graph.append("g").attr("id", platform.platform);

        svg.append("clipPath")
        .attr("id","cliprect")
        .append("rect")        // attach a rectangle
        .attr("fill", "none")
        .attr("height", props.height)    // set the height
        .attr("width", props.width);    // set the width

        const color : string = "teal";

        platformscatter
          .attr("clip-path", "url(#cliprect)")
          .selectAll("path")
          .data(platform.data)
          .join("circle")

          .each((d: any, i) => {
            console.log(d);

            const data : any[]= [
              {
                time: TimeString(d.cent_time),
                value: d.veltot + d.error,
              },
              { 
                time: TimeString(d.cent_time), 
                value: d.veltot - d.error 
              }
            ];

            var line = d3
              .line()
              .x(function (d) {
                // @ts-ignore
                return x(d.time);
              })
              .y(function (d) {
                // @ts-ignore
                return y(d.value);
              });

            platformscatter
              .append("path")
              // @ts-ignore
              .data([data])
              .attr("d", line)
              .attr("stroke", color)
              .attr("stroke-width", 2.5)
              .attr("stroke-linecap","round");
          })
          .attr("cx", function (d) {
            // @ts-ignore
            return x(TimeString(d.cent_time));
          })
          .attr("cy", function (d) {
            return y(d.veltot);
          })
          .attr("r", 4)
          .style("fill", color);
      });
    }

    GeneratePlot();
  }

  return (
    <>
      <div className={"mb-12"} id={"#" + props.id}></div>
      <ButtonGroup
        className="absolute bottom-0 right-0 m-8"
        variant="contained"
      >
        <Tooltip title={"View data"} arrow>
          <Link
            href={`/api/pt_interp?area=${props.area}&method=default`}
            target="_blank"
          >
            <IconButton component="label">
              <Dataset />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip title={"Download data"} arrow>
          <Link
            href={`/api/pt_interp?area=${props.area}&method=default`}
            target="_blank"
            download={"pt_interp.json"}
          >
            <IconButton component="label">
              <Download />
            </IconButton>
          </Link>
        </Tooltip>
      </ButtonGroup>
    </>
  );
}
export default VelPlot;
