import { useEffect } from 'react'
import { siteConfig } from '../../config/site'

export default function SEOHead({ title, description, image, url }) {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`

  const metaDescription = description || siteConfig.tagline
  const metaImage = image || `${siteConfig.domain}/og-image.jpg`
  const metaUrl = url || siteConfig.domain

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (name, content, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', metaDescription)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', metaDescription, true)
    setMeta('og:image', metaImage, true)
    setMeta('og:url', metaUrl, true)
    setMeta('og:type', 'website', true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', metaDescription)
    setMeta('twitter:image', metaImage)
  }, [fullTitle, metaDescription, metaImage, metaUrl])

  return null
}
