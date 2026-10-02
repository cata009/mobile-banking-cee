import { useEffect, useRef, useState } from 'react'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_IMAGE_PIXELS = 40_000_000
const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export interface TemporaryPreloginPicture {
  image: HTMLImageElement
  url: string
  name: string
  width: number
  height: number
  bytes: number
}

/** Blob URLs never leave this component or enter persistent demo state. */
export function useTemporaryPreloginPicture() {
  const [picture, setPicture] = useState<TemporaryPreloginPicture | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const currentUrl = useRef<string | null>(null)
  const pending = useRef<{ url: string; image: HTMLImageElement } | null>(null)

  const cancelPending = () => {
    if (!pending.current) return
    pending.current.image.onload = null
    pending.current.image.onerror = null
    URL.revokeObjectURL(pending.current.url)
    pending.current = null
  }

  useEffect(
    () => () => {
      const request = pending.current
      if (request) {
        request.image.onload = null
        request.image.onerror = null
        URL.revokeObjectURL(request.url)
        pending.current = null
      }
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
      currentUrl.current = null
    },
    [],
  )

  const reset = () => {
    cancelPending()
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
    currentUrl.current = null
    setPicture(null)
    setError(null)
    setLoading(false)
  }

  const loadFile = (file: File) => {
    cancelPending()
    setLoading(false)
    setError(null)
    if (!SUPPORTED_TYPES.has(file.type)) {
      setError('Choose a JPG, PNG or WebP image. Other file formats are not supported.')
      return
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      setError('Choose a non-empty image of 10 MB or less.')
      return
    }

    const url = URL.createObjectURL(file)
    const image = new Image()
    const request = { url, image }
    pending.current = request
    setLoading(true)

    const fail = (message: string) => {
      if (pending.current !== request) return
      cancelPending()
      setLoading(false)
      setError(message)
    }
    image.onerror = () => fail('This image could not be read. Try another JPG, PNG or WebP file.')
    image.onload = () => {
      if (pending.current !== request) return
      const width = image.naturalWidth
      const height = image.naturalHeight
      if (width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS) {
        fail('Choose an image with valid dimensions and no more than 40 megapixels.')
        return
      }
      image.onload = null
      image.onerror = null
      pending.current = null
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
      currentUrl.current = url
      setPicture({ url, image, name: file.name, width, height, bytes: file.size })
      setLoading(false)
    }
    image.src = url
  }

  return { picture, error, loading, loadFile, reset }
}
