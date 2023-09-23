"use client";

import React, { ComponentProps, useEffect } from "react";
import * as d3 from "d3";
import { useTranslations } from "next-intl";


function VelPlot(props: ComponentProps<any>) {

  const t = useTranslations("Plots");

  useEffect(drawChart, [props.height, props.id, props.width, t]);


  function drawChart() {
    let margin = { top: 5, right: 0, bottom: 35, left: 55 },
      viewwidth = props.width + margin.left + margin.right,
      viewheight = props.height + margin.top + margin.bottom,
      width = props.width - margin.left - margin.right,
      height = props.height - margin.top - margin.bottom;

    const node = document.getElementById("#" + props.id)!;
    node.replaceChildren() // only necessary for dev mode

    let svg = d3.select(node) //
      .append("svg")
      .attr("viewBox", [0, 0, viewwidth, viewheight])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "max-width: calc(100%); height: calc(100%);");


      async function Plot() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/testdata`);

        const json = await response.json();

        function TimeString(timestring: string) {
          return d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")(timestring);
        }

        // GENERATE X-axis
        let x = d3.scaleTime()
          .domain([TimeString(json.data[0].date)!, TimeString(json.data[json.data.length-1].date)!])
          .range([0, props.width]);

        let xAxis = d3.axisBottom(x);

        svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (viewheight - margin.bottom) + ")")
          .call(xAxis.ticks(d3.timeMonth).tickSizeOuter(0));

        svg.selectAll(".tick text").remove();

        svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (viewheight - margin.bottom) + ")")
          .call(xAxis.ticks(d3.timeYear).tickSize(10).tickSizeOuter(0));

        svg.append("text")
          .attr("transform", "translate(" + (viewwidth/2 ) + "," + (viewheight - 5) + ")")
          .style("text-anchor", "middle")
          .style("font", "14px Roboto")
          .attr("fill", "black")
          .text(t("axes_date"));

        // GENERATE Y-axis

        const yvals = json.data.map((element: { value: any; }) => {return element.value});

        let y = d3.scaleLinear()
        // @ts-ignore
          .domain([0, 1.1 * d3.max(yvals)])
          .range([props.height, 0]);

        svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top+ ")")
          .call(d3.axisLeft(y).tickSizeOuter(0));

        svg.append("text")
          .attr("transform", "translate(" + 19 + "," + (props.height/2) + ") rotate(270)") // width transform is font-size plus margin
          .style("text-anchor", "middle")
          .style("font", "14px Roboto")
          .attr("fill", "black")
          .text(t("axes_vel"));

        // ADD line

        svg.append("path")
          .datum(json.data)
          .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
          .attr("fill", "none")
          .attr("stroke", "grey")
          .attr("stroke-width", 1.5)
          .attr(
            "d",
            d3.line()
              .x(function(d: any) {
                return x(TimeString(d.date)!);
              })
              .y(function(d: any) {
                return y(d.value);
              })
          );

      }

      Plot();

    // d3.csv("/public/data.csv", (d) => {
    //   // @ts-ignore
    //   return { date: d3.timeParse("%d-%m-%Y")(d.date), value: d.value };
    // }).then((data) => {
    //   // Add X axis --> it is a date format
    //   // @ts-ignore
    //   let x = d3.scaleTime().domain(d3.extent(data.map((x) => x.date))).range([0, width]);
    //   svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));

    //   // Add Y axis
    //   let y = d3.scaleLinear()
    //   // @ts-ignore
    //     .domain([
    //       0,
    //       d3.max(data, function (d) {
    //         return +!d.value;
    //       }),
    //     ])
    //     .range([height, 0]);
    //   svg.append("g").call(d3.axisLeft(y));

    //   // Add the line
    //   svg.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr(
    //       "d",
    //       // @ts-ignore
    //       d3
    //         .line()
    //         .x(function(d) {
    //           // @ts-ignore
    //           return x(d.date);
    //         })
    //         .y(function(d) {
    //           // @ts-ignore
    //           return y(d.value);
    //         })
    //     );
    // });
  }

  return <div id={"#" + props.id}></div>;
}
export default VelPlot;
