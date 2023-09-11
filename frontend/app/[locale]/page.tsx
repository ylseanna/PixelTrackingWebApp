'use client';

import { useTranslations } from "next-intl";
import ZoomMap from "./D3/d3map";


function MyApp() {
  let t = useTranslations('Common')
  return (
    <>
      <ZoomMap
      id='MainMap' />

      <div className="fixed flex bottom-0 right-0 p-3 rounded-tl-lg bg-gray-700 text-white text-xs font-medium shadow-xl">{t('lmi_data')}</div>
    </>
  );
}

export default MyApp;
