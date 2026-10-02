import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import MobileFrame from '@/app/components/MobileFrame'
import PreLoginScreen from '@/app/components/PreLoginScreen'
import PreLoginActiveScreen from '@/app/components/PreLoginActiveScreen'
import { DEVICE_PREVIEW_PROFILES, DevicePreviewProvider } from '@/app/components/demo/DevicePreview'
import { LanguageProvider, useLanguage } from '@/app/contexts/LanguageContext'
import { COUNTRIES, COUNTRY_META } from '@/app/registry/demoConfig'
import { LOCAL_LANGUAGE_BY_COUNTRY } from '@/app/registry/languageByCountry'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import { SelectionChip, ToolPanel } from './toolsUi'
import { useTemporaryPreloginPicture } from './useTemporaryPreloginPicture'
import { createPreloginCropBlob, getCoverCrop } from './preloginPictureCrop'

type PreviewMode = 'both' | 'active' | 'inactive'
const NOOP = () => {}
const PREVIEW_PHONE = DEVICE_PREVIEW_PROFILES.find((profile) => profile.id === 'iphone-16')!
const FIELD_CLASS =
  'mt-[6px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[10px] py-[9px] text-[13px] text-[var(--uc-text)] focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]'

function ImageGuidelines() {
  return (
    <ToolPanel title="Image guidelines" className="mb-[20px]">
      <ul className="grid gap-[16px] text-[13px] leading-[18px] text-[var(--uc-text-muted)] sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <strong className="mb-[4px] block text-[var(--uc-text)]">Use a portrait image</strong>A ratio close to 9:19.5
          works well. Aim for {PREVIEW_PHONE.width * 3} × {PREVIEW_PHONE.height * 3} px or larger, within 40 megapixels.
        </li>
        <li>
          <strong className="mb-[4px] block text-[var(--uc-text)]">Leave room for cropping</strong>Keep faces and
          important details away from the edges. Zoom and move the photo to choose the framing. Avoid embedded text and
          logos.
        </li>
        <li>
          <strong className="mb-[4px] block text-[var(--uc-text)]">Check text readability</strong>Leave calm areas
          behind the white logo and heading. The inactive screen covers the lower image. Check both layouts with their
          original gradients.
        </li>
        <li>
          <strong className="mb-[4px] block text-[var(--uc-text)]">Download the finished crop</strong>Upload the
          exported PNG centered, without extra zoom. Keep the same screen proportions to preserve the framing. Images
          are processed only in your browser.
        </li>
      </ul>
    </ToolPanel>
  )
}

function PicturePreview({
  active,
  imageUrl,
  position,
  zoom,
}: {
  active: boolean
  imageUrl?: string
  position: string
  zoom: number
}) {
  return (
    <section
      aria-label={active ? 'Active app preview' : 'Inactive app preview'}
      className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]"
    >
      <div className="border-b border-[var(--uc-border)] px-[16px] py-[12px]">
        <h2 className="text-[16px] font-bold text-[var(--uc-text)]">{active ? 'Active app' : 'Inactive app'}</h2>
        <p className="mt-[2px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          {active ? 'Welcome message and log in' : 'Product information and activation'}
        </p>
      </div>
      <div className="min-h-[610px] flex-1" {...{ inert: '' }}>
        <MobileFrame statusBarVariant="dark">
          {active ? (
            <PreLoginActiveScreen
              onOtherClick={NOOP}
              onLanguageClick={NOOP}
              backgroundImageUrl={imageUrl}
              backgroundPosition={position}
              backgroundZoom={zoom}
            />
          ) : (
            <PreLoginScreen
              onOtherClick={NOOP}
              onLanguageClick={NOOP}
              backgroundImageUrl={imageUrl}
              backgroundPosition={position}
              backgroundZoom={zoom}
            />
          )}
        </MobileFrame>
      </div>
    </section>
  )
}

export function PreloginPictureTesterTool() {
  const demo = useDemo()
  const { language: appLanguage } = useLanguage()
  const [country, setCountry] = useState<CountryId>(demo.country)
  const [languageMode, setLanguageMode] = useState<'en' | 'local'>(appLanguage === 'en' ? 'en' : 'local')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('both')
  const [horizontal, setHorizontal] = useState(50)
  const [vertical, setVertical] = useState(50)
  const [zoom, setZoom] = useState(100)
  const [exportScale, setExportScale] = useState(3)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState(false)
  const exportRequest = useRef(0)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const { picture, error, loading, loadFile, reset } = useTemporaryPreloginPicture()
  const language = languageMode === 'en' ? 'en' : LOCAL_LANGUAGE_BY_COUNTRY[country]
  const position = `${horizontal}% ${vertical}%`
  const outputWidth = PREVIEW_PHONE.width * exportScale
  const outputHeight = PREVIEW_PHONE.height * exportScale
  const crop = picture
    ? getCoverCrop(
        picture.width,
        picture.height,
        PREVIEW_PHONE.width,
        PREVIEW_PHONE.height,
        horizontal,
        vertical,
        zoom / 100,
      )
    : null

  useEffect(
    () => () => {
      exportRequest.current += 1
    },
    [],
  )

  const cancelExport = () => {
    exportRequest.current += 1
    setExporting(false)
    setExportError(null)
    setDownloaded(false)
  }

  const chooseFile = (file?: File) => {
    if (!file) return
    cancelExport()
    loadFile(file)
  }
  const resetImage = () => {
    reset()
    cancelExport()
    setHorizontal(50)
    setVertical(50)
    setZoom(100)
    if (fileInput.current) fileInput.current.value = ''
  }

  const downloadCrop = async () => {
    if (!picture || !crop || loading || exporting) return
    const request = ++exportRequest.current
    setExporting(true)
    setExportError(null)
    setDownloaded(false)
    try {
      const blob = await createPreloginCropBlob(picture.image, crop, outputWidth, outputHeight)
      if (request !== exportRequest.current) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const stem = picture.name.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}._-]/gu, '-') || 'image'
      link.href = url
      link.download = `${stem}-prelogin-${outputWidth}x${outputHeight}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownloaded(true)
    } catch (error) {
      if (request === exportRequest.current)
        setExportError(error instanceof Error ? error.message : 'The cropped image could not be exported. Try again.')
    } finally {
      if (request === exportRequest.current) setExporting(false)
    }
  }

  return (
    <div data-tool-prelogin-picture="true">
      <ImageGuidelines />

      <div className="grid items-stretch gap-[20px] md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="min-w-0" data-picture-editor="true">
          <ToolPanel
            title="Your image"
            className="flex h-full flex-col"
            bodyClassName="flex flex-1 flex-col"
            action={
              <button
                type="button"
                onClick={resetImage}
                disabled={!picture && !loading && !error}
                className="text-[12px] font-bold text-[var(--uc-action)] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
              >
                Reset image
              </button>
            }
          >
            {/* Drag/drop supplements the accessible native file chooser. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              role="group"
              aria-label="Image drop zone"
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                chooseFile(event.dataTransfer.files[0])
              }}
              className={`rounded-[6px] border border-dashed p-[12px] text-center ${dragging ? 'border-[var(--uc-action)] bg-[var(--uc-action-soft)]' : 'border-[var(--uc-border)] bg-[var(--uc-surface-muted)]'}`}
            >
              <p className="flex items-center justify-center gap-[6px] text-[13px] leading-[18px] text-[var(--uc-text)]">
                <AppIcon name="camera" size={18} color="var(--uc-text-muted)" />
                Drop an image here
              </p>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-[8px] rounded-[6px] bg-[var(--uc-action-strong)] px-[16px] py-[8px] text-[13px] font-bold text-[var(--uc-static-white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
              >
                Choose image
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Choose a prelogin image"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                  chooseFile(event.currentTarget.files?.[0])
                  event.currentTarget.value = ''
                }}
              />
              <p className="mt-[8px] text-[11px] leading-[16px] text-[var(--uc-text-muted)]">
                JPG, PNG or WebP · Up to 10 MB
              </p>
            </div>

            {loading && (
              <p role="status" className="mt-[12px] text-[13px] text-[var(--uc-text-muted)]">
                Reading your image…
              </p>
            )}
            {error && (
              <p role="alert" className="mt-[12px] text-[13px] leading-[18px] text-[var(--uc-red-main)]">
                {error}
              </p>
            )}
            {picture ? (
              <div className="mt-[14px]" aria-live="polite">
                <div className="flex items-center gap-[10px]">
                  <img
                    src={picture.url}
                    alt="Uploaded original"
                    className="h-[60px] w-[60px] shrink-0 rounded-[4px] bg-[var(--uc-surface-muted)] object-contain"
                  />
                  <div className="min-w-0">
                    <p className="break-all text-[12px] font-bold text-[var(--uc-text)]">{picture.name}</p>
                    <p className="mt-[2px] text-[11px] text-[var(--uc-text-muted)]">
                      {picture.width} × {picture.height} px · {(picture.bytes / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {(picture.width < PREVIEW_PHONE.width * 3 || picture.height < PREVIEW_PHONE.height * 3) && (
                  <p className="mt-[8px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                    Below the recommended {PREVIEW_PHONE.width * 3} × {PREVIEW_PHONE.height * 3} px. Check sharpness in
                    the preview.
                  </p>
                )}
                {picture.width > picture.height && (
                  <p className="mt-[8px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                    Landscape image: the phone crops the sides. Adjust the horizontal position to keep your subject
                    visible.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-[12px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                The current app image is shown until you choose your own.
              </p>
            )}

            <div className="mt-[16px] space-y-[12px] border-t border-[var(--uc-border)] pt-[14px]">
              <p className="text-[13px] font-bold text-[var(--uc-text)]">Image position</p>
              <p className="text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                Zoom and move the photo to choose the framing.
              </p>
              <label htmlFor="prelogin-picture-zoom" className="block text-[12px] text-[var(--uc-text)]">
                <span className="flex justify-between gap-[8px]">
                  <span>Zoom</span>
                  <span className="text-[var(--uc-text-muted)]">{zoom}%</span>
                </span>
                <input
                  id="prelogin-picture-zoom"
                  type="range"
                  aria-label="Zoom"
                  min="100"
                  max="300"
                  value={zoom}
                  disabled={!picture}
                  className="mt-[8px] w-full accent-[var(--uc-action)] disabled:opacity-40"
                  onChange={(event) => {
                    setZoom(Number(event.target.value))
                    setDownloaded(false)
                  }}
                />
              </label>
              {(
                [
                  ['Horizontal position', horizontal, setHorizontal],
                  ['Vertical position', vertical, setVertical],
                ] as const
              ).map(([label, value, setValue]) => (
                <label
                  key={label}
                  htmlFor={label === 'Horizontal position' ? 'prelogin-picture-x' : 'prelogin-picture-y'}
                  aria-label={label}
                  className="block text-[12px] text-[var(--uc-text)]"
                >
                  <span className="flex justify-between gap-[8px]">
                    <span>{label}</span>
                    <span className="text-[var(--uc-text-muted)]">{value}%</span>
                  </span>
                  <input
                    id={label === 'Horizontal position' ? 'prelogin-picture-x' : 'prelogin-picture-y'}
                    type="range"
                    aria-label={label}
                    min="0"
                    max="100"
                    value={value}
                    disabled={!picture}
                    className="mt-[8px] w-full accent-[var(--uc-action)] disabled:opacity-40"
                    onChange={(event) => {
                      setValue(Number(event.target.value))
                      setDownloaded(false)
                    }}
                  />
                </label>
              ))}
              <button
                type="button"
                disabled={!picture}
                onClick={() => {
                  setHorizontal(50)
                  setVertical(50)
                  setDownloaded(false)
                }}
                className="text-[12px] font-bold text-[var(--uc-action)] disabled:opacity-40"
              >
                Center image
              </button>
            </div>
            <div className="flex-1" />
            <div className="mt-[16px] space-y-[12px] border-t border-[var(--uc-border)] pt-[14px]">
              <p className="text-[13px] font-bold text-[var(--uc-text)]">Export your crop</p>
              <label
                htmlFor="prelogin-picture-resolution"
                className="block text-[12px] font-bold text-[var(--uc-text)]"
              >
                Export resolution
                <select
                  id="prelogin-picture-resolution"
                  value={exportScale}
                  onChange={(event) => {
                    setExportScale(Number(event.target.value))
                    setDownloaded(false)
                  }}
                  className={FIELD_CLASS}
                >
                  {[1, 2, 3].map((scale) => (
                    <option key={scale} value={scale}>
                      {scale}× · {PREVIEW_PHONE.width * scale} × {PREVIEW_PHONE.height * scale} px
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                Photo only, at the exact preview proportions. No logo, text or gradients are included.
              </p>
              {crop && (crop.sw + 0.5 < outputWidth || crop.sh + 0.5 < outputHeight) && (
                <p className="text-[12px] leading-[17px] text-[var(--uc-orange-main)]">
                  This crop will be enlarged. Choose a lower export resolution or a larger original for sharper results.
                </p>
              )}
              <button
                type="button"
                onClick={() => void downloadCrop()}
                disabled={!picture || loading || exporting}
                className="w-full rounded-[6px] bg-[var(--uc-action-strong)] px-[12px] py-[11px] text-[13px] font-bold text-[var(--uc-static-white)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
              >
                {exporting ? 'Preparing download…' : 'Download cropped image'}
              </button>
              {exportError && (
                <p role="alert" className="text-[12px] leading-[17px] text-[var(--uc-red-main)]">
                  {exportError}
                </p>
              )}
              {downloaded && (
                <p role="status" className="text-[12px] leading-[17px] text-[var(--uc-text)]">
                  Cropped image downloaded. Upload it to the final app centered, with no additional zoom.
                </p>
              )}
            </div>
          </ToolPanel>
        </div>

        <div className="flex min-w-0 flex-col" data-picture-previews="true">
          <div className="mb-[16px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[16px]">
            <div className="grid gap-[12px] sm:grid-cols-2">
              <label htmlFor="prelogin-picture-country" className="text-[12px] font-bold text-[var(--uc-text)]">
                Preview country
                <select
                  id="prelogin-picture-country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value as CountryId)}
                  className={FIELD_CLASS}
                >
                  {COUNTRIES.map((id) => (
                    <option key={id} value={id}>
                      {COUNTRY_META[id].nameEN}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="prelogin-picture-language" className="text-[12px] font-bold text-[var(--uc-text)]">
                Preview language
                <select
                  id="prelogin-picture-language"
                  value={languageMode}
                  onChange={(event) => setLanguageMode(event.target.value as 'en' | 'local')}
                  className={FIELD_CLASS}
                >
                  <option value="en">English</option>
                  <option value="local">Local language ({LOCAL_LANGUAGE_BY_COUNTRY[country].toUpperCase()})</option>
                </select>
              </label>
            </div>
            <div role="group" aria-label="Preview layouts" className="mt-[14px] flex flex-wrap gap-[6px]">
              {(
                [
                  ['both', 'Both screens'],
                  ['active', 'Active app only'],
                  ['inactive', 'Inactive app only'],
                ] as const
              ).map(([mode, label]) => (
                <SelectionChip key={mode} active={previewMode === mode} onClick={() => setPreviewMode(mode)}>
                  {label}
                </SelectionChip>
              ))}
            </div>
          </div>

          <DemoProvider key={country} initialState={{ ...demo, country, product: 'PI' }}>
            <LanguageProvider key={language} initialLanguage={language}>
              <DevicePreviewProvider>
                <div
                  className={`grid flex-1 gap-[16px] ${previewMode === 'both' ? 'sm:grid-cols-2' : 'mx-auto w-full max-w-[560px]'}`}
                >
                  {previewMode !== 'inactive' && (
                    <PicturePreview active imageUrl={picture?.url} position={position} zoom={zoom / 100} />
                  )}
                  {previewMode !== 'active' && (
                    <PicturePreview active={false} imageUrl={picture?.url} position={position} zoom={zoom / 100} />
                  )}
                </div>
              </DevicePreviewProvider>
            </LanguageProvider>
          </DemoProvider>
        </div>
      </div>
    </div>
  )
}
