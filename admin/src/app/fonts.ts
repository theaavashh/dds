import localFont from 'next/font/local'

export const customFont = localFont({
  src: '../../public/fonts/AkzidenzGroteskPro-Ext.woff2',
  variable: '--font-custom',
  display: 'swap',
})

export const titleFont = localFont({
  src: '../../public/fonts/title-regular.f7f2da3f7d1f78b3f788.woff2',
  variable: '--font-title',
  display: 'swap',
})
