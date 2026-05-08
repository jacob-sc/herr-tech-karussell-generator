/**
 * PNG export for Instagram Carousel slides.
 *
 * Renders each slide DOM element at 1080×1350 (4:5) using html2canvas
 * with a scale factor of 1080/SLIDE_WIDTH = 2.571… — the clientside
 * equivalent of Playwright's device_scale_factor. No layout reflow,
 * same DOM tree as preview.
 *
 * Output: a ZIP containing `slide-01.png` through `slide-N.png`.
 */

import { SLIDE_WIDTH } from '@/components/carousel/SlideFrame'

const TARGET_WIDTH = 1080 // Instagram recommended width
const SCALE = TARGET_WIDTH / SLIDE_WIDTH

export interface ExportPngOptions {
  /** Container holding all slide DOM elements (each tagged with data-slide) */
  container: HTMLElement
  /** Optional progress callback: (done, total) */
  onProgress?: (done: number, total: number) => void
  /** Filename prefix; slides will be e.g. `carousel-slide-01.png` */
  filePrefix?: string
}

export async function exportCarouselAsPngZip({
  container,
  onProgress,
  filePrefix = 'slide',
}: ExportPngOptions): Promise<Blob> {
  const [{ default: html2canvas }, { default: JSZip }] = await Promise.all([
    import('html2canvas'),
    import('jszip'),
  ])

  const slideEls = Array.from(container.querySelectorAll<HTMLElement>('[data-slide]'))
  if (slideEls.length === 0) {
    throw new Error('Keine Slides im Container gefunden.')
  }

  const zip = new JSZip()

  for (let i = 0; i < slideEls.length; i++) {
    onProgress?.(i, slideEls.length)
    const canvas = await html2canvas(slideEls[i], {
      scale: SCALE,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/png',
        1.0,
      )
    })
    zip.file(`${filePrefix}-${String(i + 1).padStart(2, '0')}.png`, blob)
  }

  onProgress?.(slideEls.length, slideEls.length)
  return zip.generateAsync({ type: 'blob' })
}

/**
 * Convenience: trigger direct download of the ZIP.
 */
export async function downloadCarouselPngZip(
  options: ExportPngOptions & { filename?: string },
): Promise<void> {
  const blob = await exportCarouselAsPngZip(options)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = options.filename ?? 'karussell.zip'
  a.click()
  URL.revokeObjectURL(url)
}
