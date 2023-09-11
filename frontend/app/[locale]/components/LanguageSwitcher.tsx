'use client';

import { useLocale } from 'next-intl';
import Link from 'next-intl/link';

import Button from '@mui/material/Button';
import { usePathname } from 'next-intl/client';
import { Tooltip } from '@mui/material';


export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div id='lngSwitcher'>
      {locale === 'is'
        ? (
          <Tooltip title='Switch to English'><Link className='link' href={pathname} locale="en"><Button variant="outlined" sx={{ color: '#fff' }}>English</Button></Link></Tooltip>
        )
        : (
          <Tooltip title='Skipta yfir í íslensku'><Link className='link' href={pathname} locale="is"><Button variant="outlined" sx={{ color: '#fff' }}>Íslenska</Button></Link></Tooltip>
        )
      }
    </div>
  );
}
