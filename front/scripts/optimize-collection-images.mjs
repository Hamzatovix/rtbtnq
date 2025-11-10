import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const inputDir = path.join(process.cwd(), 'public', 'collection')
const outputDir = path.join(inputDir, 'optimized')

const TARGET_WIDTHS = [360, 720, 1080]

const WEBP_OPTIONS = {
  quality: 78,
  effort: 5,
}

const AVIF_OPTIONS = {
  quality: 55,
  effort: 5,
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function getBaseName(fileName) {
  const extIndex = fileName.indexOf('.')
  return extIndex === -1 ? fileName : fileName.slice(0, extIndex)
}

async function generatePlaceholder(sourcePath) {
  const buffer = await sharp(sourcePath)
    .resize(32, 32, { fit: 'inside' })
    .webp({ quality: 45 })
    .toBuffer()

  return `data:image/webp;base64,${buffer.toString('base64')}`
}

async function writeManifest(manifest) {
  const manifestPath = path.join(outputDir, 'manifest.json')
  const sortedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
  const orderedManifest = Object.fromEntries(sortedEntries)
  await fs.writeFile(manifestPath, JSON.stringify(orderedManifest, null, 2), 'utf8')
}

async function main() {
  const files = await fs.readdir(inputDir)
  const imageFiles = files.filter((file) => /\.(png|jpg|jpeg)$/i.test(file))

  if (!imageFiles.length) {
    console.log('Нет файлов для оптимизации в', inputDir)
    return
  }

  await ensureDir(outputDir)

  const manifest = {}

  for (const file of imageFiles) {
    const filePath = path.join(inputDir, file)
    const baseName = getBaseName(file)
    const placeholder = await generatePlaceholder(filePath)

    const entry = {
      placeholder,
      sources: {
        webp: {},
        avif: {},
      },
    }

    const image = sharp(filePath)
    const metadata = await image.metadata()
    const maxWidth = metadata.width || Math.max(...TARGET_WIDTHS)

    for (const width of TARGET_WIDTHS) {
      const targetWidth = Math.min(width, maxWidth)
      const outputNameWebp = `${baseName}-${targetWidth}.webp`
      const outputNameAvif = `${baseName}-${targetWidth}.avif`

      await image
        .clone()
        .resize({ width: targetWidth, fit: 'inside', withoutEnlargement: true })
        .webp(WEBP_OPTIONS)
        .toFile(path.join(outputDir, outputNameWebp))

      await image
        .clone()
        .resize({ width: targetWidth, fit: 'inside', withoutEnlargement: true })
        .avif(AVIF_OPTIONS)
        .toFile(path.join(outputDir, outputNameAvif))

      entry.sources.webp[targetWidth] = `/collection/optimized/${outputNameWebp}`
      entry.sources.avif[targetWidth] = `/collection/optimized/${outputNameAvif}`
    }

    manifest[`/collection/${file}`] = entry
  }

  await writeManifest(manifest)
  console.log('✅ Оптимизация завершена. Создан манифест и варианты в', outputDir)
}

main().catch((error) => {
  console.error('Ошибка оптимизации изображений:', error)
  process.exit(1)
})


