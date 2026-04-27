import { useEffect } from 'react'

const DEFAULT_SITE_NAME = 'Yun Yeh Tseng'
const DEFAULT_DESCRIPTION = 'Creative Developer & Designer Portfolio'

function updateMetaTag(selector, value) {
  let tag = document.querySelector(selector)

  if (!tag) {
    tag = document.createElement('meta')
    const match = selector.match(/^meta\[(.+?)="(.+?)"\]$/)
    if (match) {
      tag.setAttribute(match[1], match[2])
    }
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', value)
}

export function useSeo({ title, description, lang }) {
  useEffect(() => {
    const nextTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_NAME
    const nextDescription = description || DEFAULT_DESCRIPTION

    document.title = nextTitle
    document.documentElement.lang = lang || 'en'
    updateMetaTag('meta[name="description"]', nextDescription)
    updateMetaTag('meta[property="og:title"]', nextTitle)
    updateMetaTag('meta[property="og:description"]', nextDescription)
    updateMetaTag('meta[name="twitter:title"]', nextTitle)
    updateMetaTag('meta[name="twitter:description"]', nextDescription)
  }, [description, lang, title])
}
