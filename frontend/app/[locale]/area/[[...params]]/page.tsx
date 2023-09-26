"use client";

import VelPlot from "./D3/d3plot";
import DisplacementMap from "./D3/d3map";

import { Divider, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

function AreaData({ params }: { params: { params: string }}) {
  let t = useTranslations("Area");
  const svaedi = require("../../D3/svaedi.json");
  const areaId = params.params[0];
  // @ts-ignore
  const areaName = svaedi.features.filter((item) => item.properties.id === areaId)[0].properties.name;

  return (
    <>
      <div className="flex flex-grow m-8 rounded-2xl shadow-xl bg-white">
        <div className="w-2/3 p-8 " style={{display: "block", position: "relative"}}>
          <DisplacementMap id="DispMap"
            area={areaId}

            defaultTimespan={"20100621-20110802"}

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
            <Typography variant="h3" fontSize={32} component="h1" className="mt-0 mb-3 font-bold ">
              {areaName}
            </Typography>
            <Typography variant="subtitle1" className="mb-4 ml-4">
              {t("landslide_area")}
            </Typography>
            <Typography variant="body1">
              {t(areaId)}
            </Typography>
            <Divider className="mt-4 mb-4"></Divider>
            <Typography variant="subtitle2" className="">
              {t("data_credit")}
            </Typography>
            <Typography variant="body2">
              {t("TSX_data_credit")}
            </Typography>
            
            <Typography variant="subtitle2" className="mt-3">
              {t("support")}
            </Typography>
            <Typography variant="body2">
              {t("support_tungpt")}
            </Typography>
          </div>
          <Divider flexItem />
          <div className="p-8 relative">
            <Typography variant="h5" className="mt-0 mb-4">{t("time_series")}</Typography>
            <VelPlot
              area={areaId}
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
