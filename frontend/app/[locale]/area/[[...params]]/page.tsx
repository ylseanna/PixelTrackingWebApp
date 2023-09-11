"use client";

import Image from "next/image";
import VelPlot from "./D3/d3plot";
import DisplacementMap from "./D3/d3map";

import d3 from "d3";
import { Divider } from "@mui/material";
import { useTranslations } from "next-intl";


function AreaData() {
  let t = useTranslations('Area');

  return (
    <>
      <div className="flex flex-grow m-8 rounded-2xl shadow-xl bg-white">
        <div className="w-2/3 p-8 " style={{display: 'block', position: 'relative'}}>
          <DisplacementMap id = 'DispMap'

            // size of basemap
            width={1182} 
            height={700} 
            
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
            <h1 className="mt-0">Tungnakvíslarjökull</h1>
          </div>
          <Divider flexItem />
          <div className="p-8">
            <h3 className="mt-0">{t('time_series')}</h3>
            <VelPlot 
            id = 'LinePlot'
            width={500} 
            height={200} />
          </div>
        </div>
        
      </div>
    </>
  );
}

export default AreaData;
