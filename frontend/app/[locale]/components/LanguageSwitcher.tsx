'use client';

import { useLocale } from 'next-intl';
import Link from 'next-intl/link';

import Button from '@mui/material/Button';
import { usePathname, useRouter } from 'next-intl/client';
import { Tooltip } from '@mui/material';

import { MouseEvent } from 'react';


export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Change locale programmatically to prevent page from reloading
  function changeLocale(locale: string) {
    router.push(pathname, { locale: locale });
  }

  return (
    <div id='lngSwitcher'>
      {locale === 'is'
        ? (
          <Tooltip title='Switch to English'>
            <Link className='link' href={pathname} locale="en" onClick={(e: MouseEvent) => { e.preventDefault(); changeLocale('en'); } }>
              <Button variant="outlined" sx={{ color: '#fff' }}>English</Button>
            </Link>
          </Tooltip>
        )
        : (
          <Tooltip title='Skipta yfir í íslensku'>
            <Link className='link' href={pathname} locale="is" onClick={(e: MouseEvent) => { e.preventDefault(); changeLocale('is'); } }>
              <Button variant="outlined" sx={{ color: '#fff' }}>Íslenska</Button>
            </Link>
          </Tooltip>
        )
      }
    </div>
  );
}
