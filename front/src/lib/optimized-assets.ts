import manifest from '../../public/collection/optimized/manifest.json'

type SourceMap = Record<string, string>

type ManifestEntry = {
  placeholder?: string
  sources?: {
    webp?: SourceMap
    avif?: SourceMap
  }
}

type OptimizedAsset = {
  src: string
  fallback: string
  placeholder?: string
  sourceSet?: {
    webp?: SourceMap
    avif?: SourceMap
  }
}

const DEFAULT_WIDTH = 720

function pickClosestWidth(map?: SourceMap, preferredWidth = DEFAULT_WIDTH) {
  if (!map) return undefined

  const numericWidths = Object.keys(map)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  if (!numericWidths.length) return undefined

  let nearest = numericWidths[0]
  let minDiff = Math.abs(nearest - preferredWidth)

  for (const width of numericWidths) {
    const diff = Math.abs(width - preferredWidth)
    if (diff < minDiff) {
      nearest = width
      minDiff = diff
    }
  }

  return map[nearest]
}

export function getOptimizedAsset(path: string, preferredWidth = DEFAULT_WIDTH): OptimizedAsset {
  const entry = (manifest as Record<string, ManifestEntry>)[path]

  if (!entry?.sources) {
    return {
      src: path,
      fallback: path,
    }
  }

  const webpCandidate = pickClosestWidth(entry.sources.webp, preferredWidth)
  const avifCandidate = pickClosestWidth(entry.sources.avif, preferredWidth)

  return {
    src: webpCandidate ?? avifCandidate ?? path,
    fallback: path,
    placeholder: entry.placeholder,
    sourceSet: entry.sources,
  }
}


