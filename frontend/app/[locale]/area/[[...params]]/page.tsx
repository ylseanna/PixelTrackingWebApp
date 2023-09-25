"use client";

import Image from "next/image";
import VelPlot from "./D3/d3plot";
import DisplacementMap from "./D3/d3map";

import d3 from "d3";
import { Divider, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

function AreaData() {
  let t = useTranslations("Area");

  return (
    <>
      <div className="flex flex-grow m-8 rounded-2xl shadow-xl bg-white">
        <div className="w-2/3 p-8 " style={{display: "block", position: "relative"}}>
          <DisplacementMap id="DispMap"

            timespan={"20100621-20110802"}

            // size of basemap
            width={1182/1.2} 
            height={700/1.2} 
            
            // bbox features
            maxlon={-19.259033}
            minlon={-19.414215}
            maxlat={63.676115}
            minlat={63.635284}

            />
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="flex flex-col w-1/3">
          <div className="flex-grow p-8">
            <Typography variant="h3" style={{fontSize: "14"}}>
              Tungnakvíslarjökull
            </Typography>
          </div>
          <Divider flexItem />
          <div className="p-8 relative">
            <h3 className="mt-0">{t("time_series")}</h3>
            <VelPlot 
            id="LinePlot"
            width={500/1.3} 
            height={200/1.3} />
          </div>
        </div>
        
      </div>
    </>
  );
}

export default AreaData;
