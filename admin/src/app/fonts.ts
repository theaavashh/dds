import localFont from 'next/font/local'

export const customFont = localFont({
  src: '../../public/fonts/AkzidenzGroteskPro-Ext.woff2',
  variable: '--font-custom',
  display: 'swap',
})
