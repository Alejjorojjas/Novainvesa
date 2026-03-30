import { useEffect } from 'react'
import SEOHead from '../components/common/SEOHead'
import HeroBanner from '../components/home/HeroBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import { usePixel } from '../hooks/usePixel'

export default function Home() {
  const { trackPageView } = usePixel()

  useEffect(() => {
    trackPageView()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEOHead />
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  )
}
