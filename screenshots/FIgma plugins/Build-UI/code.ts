type BuildUiMessage = {
  type: 'build-ui'
  json: string
  options: BuildOptions
}

type CancelMessage = {
  type: 'cancel'
}

type UiMessage = BuildUiMessage | CancelMessage

type BuildOptions = {
  targetMode: TargetMode
  newFrameWidth: NewFrameWidth
  autoLayoutMode: AutoLayoutMode
  removePreviousOutput: boolean
  clearFrame: boolean
  useSelectedFrameAsRoot: boolean
  fitToFrame: boolean
  autoResizeHeight: boolean
  bottomPadding: number
  renderHiddenLayers: boolean
  lockGeneratedLayers: boolean
}

type TargetMode = 'auto' | 'selected' | 'new'
type NewFrameWidth = '393' | '375' | 'json'
type AutoLayoutMode = 'off' | 'explicit' | 'smart'

type JsonRecord = Record<string, unknown>

type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

type AssetSpec = {
  id: string
  kind?: string
  mimeType?: string
  encoding?: string
  content: string
}

type NormalizedDocument = {
  name: string
  roots: JsonRecord[]
  frameBounds: Bounds
  assets: Record<string, AssetSpec>
}

type RenderContext = {
  options: BuildOptions
  scale: number
  sourceBounds: Bounds
  assets: Record<string, AssetSpec>
  createdNodes: SceneNode[]
  warnings: string[]
}

type RenderSummary = {
  created: number
  skipped: number
  warnings: string[]
  targetName: string
}

type RenderedChild = {
  node: SceneNode
  spec: JsonRecord
}

type FontCache = Record<string, Promise<boolean>>

type StrokeAlignValue = 'CENTER' | 'INSIDE' | 'OUTSIDE'
type StackDirection = 'VERTICAL' | 'HORIZONTAL'

const PLUGIN_DATA_KEY = 'build-ui-generated'
const PLUGIN_DATA_VALUE = '1'
const DEFAULT_FONT: FontName = { family: 'Inter', style: 'Regular' }
const FONT_CACHE: FontCache = {}

figma.showUI(__html__, { width: 680, height: 760, themeColors: true })

figma.ui.onmessage = async (message: UiMessage) => {
  if (message.type === 'cancel') {
    figma.closePlugin()
    return
  }

  if (message.type !== 'build-ui') {
    return
  }

  await buildUiFromJson(message)
}

async function buildUiFromJson(message: BuildUiMessage): Promise<void> {
  figma.ui.postMessage({ type: 'status', message: 'Citesc JSON-ul...' })

  try {
    const parsed = parseJson(message.json)
    const options = normalizeBuildOptions(message.options)
    const selectedTarget = findSelectedTargetFrame()
    const document = normalizeDocument(parsed, selectedTarget)
    const targetFrame = resolveTargetFrame(document, selectedTarget, options)
    const sourceBounds = getSourceBounds(document, targetFrame)
    const scale = getRenderScale(sourceBounds, targetFrame, options.fitToFrame)
    const context: RenderContext = {
      options,
      scale,
      sourceBounds,
      assets: document.assets,
      createdNodes: [],
      warnings: [],
    }

    resizeTargetHeight(targetFrame, document, sourceBounds, scale, options)
    cleanupTargetFrame(targetFrame, options)
    await renderDocumentIntoFrame(targetFrame, document, context)

    const selectableNodes = context.createdNodes.filter((node) => node.removed === false)
    if (selectableNodes.length > 0) {
      figma.currentPage.selection = selectableNodes.slice(0, 100)
      figma.viewport.scrollAndZoomIntoView(selectableNodes)
    } else {
      figma.currentPage.selection = [targetFrame]
      figma.viewport.scrollAndZoomIntoView([targetFrame])
    }

    const summary: RenderSummary = {
      created: context.createdNodes.length,
      skipped: context.warnings.filter((warning) => warning.startsWith('Skipped')).length,
      warnings: context.warnings,
      targetName: targetFrame.name,
    }

    figma.ui.postMessage({ type: 'built', summary })
    figma.notify(`Build-UI: creat ${summary.created} layer-e in "${targetFrame.name}".`)
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Eroare necunoscuta.'
    figma.ui.postMessage({ type: 'error', message: messageText })
    figma.notify(`Build-UI: ${messageText}`)
  }
}

function normalizeBuildOptions(options: BuildOptions): BuildOptions {
  return {
    targetMode: options.targetMode === 'selected' || options.targetMode === 'new' ? options.targetMode : 'auto',
    newFrameWidth: options.newFrameWidth === '375' || options.newFrameWidth === 'json' ? options.newFrameWidth : '393',
    autoLayoutMode:
      options.autoLayoutMode === 'off' || options.autoLayoutMode === 'explicit' ? options.autoLayoutMode : 'smart',
    removePreviousOutput: options.removePreviousOutput !== false,
    clearFrame: options.clearFrame === true,
    useSelectedFrameAsRoot: options.useSelectedFrameAsRoot !== false,
    fitToFrame: options.fitToFrame !== false,
    autoResizeHeight: options.autoResizeHeight !== false,
    bottomPadding: clamp(readNumber(options.bottomPadding) ?? 24, 0, 240),
    renderHiddenLayers: options.renderHiddenLayers !== false,
    lockGeneratedLayers: options.lockGeneratedLayers === true,
  }
}

function findSelectedTargetFrame(): FrameNode | ComponentNode | null {
  const selection = figma.currentPage.selection

  if (selection.length !== 1) {
    return null
  }

  const node = selection[0]
  if (node.type !== 'FRAME' && node.type !== 'COMPONENT') {
    return null
  }

  return node
}

function resolveTargetFrame(
  document: NormalizedDocument,
  selectedTarget: FrameNode | ComponentNode | null,
  options: BuildOptions,
): FrameNode | ComponentNode {
  if (options.targetMode !== 'new' && selectedTarget) {
    return selectedTarget
  }

  if (options.targetMode === 'selected') {
    throw new Error('Selecteaza exact un FRAME sau COMPONENT, sau schimba Destination pe Auto/New frame.')
  }

  return createTargetFrame(document, options)
}

function createTargetFrame(document: NormalizedDocument, options: BuildOptions): FrameNode {
  const frame = figma.createFrame()
  const width = getNewFrameWidth(document, options)
  const sourceHeight = Math.max(1, document.frameBounds.height || 844)
  frame.resize(width, sourceHeight)
  frame.name = document.name
  frame.x = round(figma.viewport.center.x - width / 2)
  frame.y = round(figma.viewport.center.y - Math.min(sourceHeight, 900) / 2)
  frame.fills = []
  frame.clipsContent = true
  figma.currentPage.appendChild(frame)
  return frame
}

function getNewFrameWidth(document: NormalizedDocument, options: BuildOptions): number {
  if (options.newFrameWidth === '375') {
    return 375
  }

  if (options.newFrameWidth === 'json') {
    return Math.max(1, round(document.frameBounds.width || 393))
  }

  return 393
}

function parseJson(json: string): unknown {
  if (!json.trim()) {
    throw new Error('Pasteaza un JSON inainte sa construiesti UI-ul.')
  }

  try {
    return JSON.parse(json)
  } catch (error) {
    const details = error instanceof Error ? error.message : 'JSON invalid.'
    throw new Error(`JSON invalid: ${details}`)
  }
}

function normalizeDocument(value: unknown, targetFrame: FrameNode | ComponentNode | null): NormalizedDocument {
  if (!isRecord(value)) {
    throw new Error('JSON-ul trebuie sa fie un obiect.')
  }

  const roots = extractRoots(value)
  if (roots.length === 0) {
    throw new Error('Nu gasesc niciun root renderabil. Foloseste root, roots[], screen, children[] sau components[].root.')
  }

  const frameBounds = extractFrameBounds(value, roots, targetFrame)
  const assets = extractAssets(value)
  const name = readString(value.name) ?? readString(value.componentName) ?? readString(value.title) ?? 'Build-UI Screen'

  return {
    name,
    roots,
    frameBounds,
    assets,
  }
}

function extractRoots(document: JsonRecord): JsonRecord[] {
  const roots: JsonRecord[] = []
  const components = readArray(document.components).filter(isRecord)

  for (const component of components) {
    const root = component.root
    if (isRecord(root)) {
      roots.push(root)
    }
  }

  if (roots.length > 0) {
    return roots
  }

  const explicitRoots = readArray(document.roots).filter(isRecord)
  if (explicitRoots.length > 0) {
    return explicitRoots
  }

  if (isRecord(document.root)) {
    return [document.root]
  }

  if (isRecord(document.screen)) {
    const screen = document.screen
    if (isRecord(screen.root)) {
      return [screen.root]
    }

    if (readArray(screen.children).length > 0 || readArray(screen.layers).length > 0 || hasNodeType(screen)) {
      return [screen]
    }

    const topLevelChildren = readArray(document.children).filter(isRecord)
    if (topLevelChildren.length > 0) {
      return [
        {
          ...screen,
          type: readString(screen.type) ?? 'container',
          children: topLevelChildren,
        },
      ]
    }
  }

  const layers = readArray(document.layers).filter(isRecord)
  if (layers.length > 0) {
    return [createVirtualRoot(document, layers)]
  }

  const children = readArray(document.children).filter(isRecord)
  if (children.length > 0 || hasNodeType(document)) {
    return [document]
  }

  return []
}

function createVirtualRoot(document: JsonRecord, children: JsonRecord[]): JsonRecord {
  const screen = isRecord(document.screen) ? document.screen : document
  const width = readNumber(screen.width) ?? readNumber(document.width) ?? 390
  const height = readNumber(screen.height) ?? readNumber(document.height) ?? 844

  return {
    type: 'container',
    name: readString(document.name) ?? readString(document.title) ?? 'Build-UI Screen',
    bounds: { x: 0, y: 0, width, height },
    fills: readUnknown(document.fills) ?? readUnknown(document.background) ?? readUnknown(screen.background),
    children,
  }
}

function hasNodeType(value: JsonRecord): boolean {
  return typeof value.type === 'string' || typeof value.figmaType === 'string'
}

function extractFrameBounds(document: JsonRecord, roots: JsonRecord[], targetFrame: FrameNode | ComponentNode | null): Bounds {
  const frameCandidate = isRecord(document.frame)
    ? document.frame
    : isRecord(document.screen)
      ? document.screen
      : document

  const frameWidth = readNumber(frameCandidate.width)
  const frameHeight = readNumber(frameCandidate.height)
  if (frameWidth && frameHeight) {
    return { x: 0, y: 0, width: frameWidth, height: frameHeight }
  }

  const union = getUnionBounds(roots.map((root) => getNodeBounds(root)))
  if (union.width > 0 && union.height > 0) {
    return union
  }

  return { x: 0, y: 0, width: targetFrame?.width ?? 393, height: targetFrame?.height ?? 844 }
}

function extractAssets(document: JsonRecord): Record<string, AssetSpec> {
  const assets: Record<string, AssetSpec> = {}

  for (const asset of readArray(document.assets)) {
    if (!isRecord(asset)) {
      continue
    }

    const id = readString(asset.id)
    const content = readString(asset.content)
    if (!id || !content) {
      continue
    }

    assets[id] = {
      id,
      content,
      kind: readString(asset.kind),
      mimeType: readString(asset.mimeType),
      encoding: readString(asset.encoding),
    }
  }

  return assets
}

function getSourceBounds(document: NormalizedDocument, targetFrame: FrameNode | ComponentNode): Bounds {
  if (document.frameBounds.width > 0 && document.frameBounds.height > 0) {
    return document.frameBounds
  }

  const union = getUnionBounds(document.roots.map((root) => getNodeBounds(root)))
  if (union.width > 0 && union.height > 0) {
    return union
  }

  return { x: 0, y: 0, width: targetFrame.width, height: targetFrame.height }
}

function getRenderScale(sourceBounds: Bounds, targetFrame: FrameNode | ComponentNode, fitToFrame: boolean): number {
  if (!fitToFrame || sourceBounds.width <= 0) {
    return 1
  }

  const scaleX = targetFrame.width / sourceBounds.width
  return Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1
}

function resizeTargetHeight(
  targetFrame: FrameNode | ComponentNode,
  document: NormalizedDocument,
  sourceBounds: Bounds,
  scale: number,
  options: BuildOptions,
): void {
  if (!options.autoResizeHeight) {
    return
  }

  const contentBounds = getDocumentContentBounds(document.roots, options.renderHiddenLayers)
  const sourceBottom = Math.max(
    sourceBounds.y + sourceBounds.height,
    contentBounds.height > 0 ? contentBounds.y + contentBounds.height : sourceBounds.y + sourceBounds.height,
  )
  const targetHeight = Math.ceil(Math.max(1, (sourceBottom - sourceBounds.y) * scale + options.bottomPadding))

  if (Math.abs(targetFrame.height - targetHeight) > 0.5) {
    targetFrame.resize(targetFrame.width, targetHeight)
  }
}

function cleanupTargetFrame(targetFrame: FrameNode | ComponentNode, options: BuildOptions): void {
  if (options.clearFrame) {
    for (const child of [...targetFrame.children]) {
      child.remove()
    }
    return
  }

  if (!options.removePreviousOutput) {
    return
  }

  for (const child of [...targetFrame.children]) {
    if (child.getPluginData(PLUGIN_DATA_KEY) === PLUGIN_DATA_VALUE) {
      child.remove()
    }
  }
}

async function renderDocumentIntoFrame(
  targetFrame: FrameNode | ComponentNode,
  document: NormalizedDocument,
  context: RenderContext,
): Promise<void> {
  targetFrame.name = targetFrame.name || document.name

  if (context.options.useSelectedFrameAsRoot && document.roots.length === 1 && canMapRootToTarget(document.roots[0])) {
    const root = document.roots[0]
    applyRootStyleToTarget(targetFrame, root, context)
    const renderedChildren = await renderChildren(targetFrame, root, getNodeBounds(root), context)
    applyContainerAutoLayout(targetFrame, root, renderedChildren, context)
    return
  }

  for (const root of document.roots) {
    await renderNode(targetFrame, root, context.sourceBounds, context)
  }
}

function canMapRootToTarget(root: JsonRecord): boolean {
  const kind = getNodeKind(root)
  return kind === 'container' || kind === 'group' || kind === 'frame' || readChildren(root).length > 0
}

function applyRootStyleToTarget(targetFrame: FrameNode | ComponentNode, root: JsonRecord, context: RenderContext): void {
  applyPaints(targetFrame, root, context)
  applyInferredAppBackground(targetFrame, root, context)
  applyStrokes(targetFrame, root, context)
  applyCorners(targetFrame, root, context)
  applyEffects(targetFrame, root, context)

  const layout = isRecord(root.layout) ? root.layout : null
  const clipsContent = readBoolean(root.clipsContent) ?? (layout ? readBoolean(layout.clipsContent) : undefined)
  if (typeof clipsContent === 'boolean') {
    targetFrame.clipsContent = clipsContent
  } else {
    targetFrame.clipsContent = true
  }
}

function applyInferredAppBackground(targetFrame: FrameNode | ComponentNode, root: JsonRecord, context: RenderContext): void {
  if (!hasFills(targetFrame) || !looksLikeDeviceShellRoot(root)) {
    return
  }

  const appBackground = findDominantContentPaint(root, context)
  if (appBackground) {
    targetFrame.fills = [appBackground]
  }
}

function looksLikeDeviceShellRoot(root: JsonRecord): boolean {
  const rootBounds = getNodeBounds(root)
  const rootFill = getPrimarySolidColor(root)
  if (!rootFill || !isDarkColor(rootFill)) {
    return false
  }

  const children = readChildren(root)
  if (children.length === 0) {
    return false
  }

  const largestChildBounds = children
    .map((child) => getNodeBounds(child))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0]

  if (!largestChildBounds || rootBounds.width <= 0 || rootBounds.height <= 0) {
    return false
  }

  const widthRatio = largestChildBounds.width / rootBounds.width
  const areaRatio = (largestChildBounds.width * largestChildBounds.height) / (rootBounds.width * rootBounds.height)
  return widthRatio > 0.55 && widthRatio < 0.96 && areaRatio > 0.45
}

function findDominantContentPaint(root: JsonRecord, context: RenderContext): SolidPaint | null {
  const rootBounds = getNodeBounds(root)
  const candidates: Array<{ area: number; paint: SolidPaint }> = []

  function visit(spec: JsonRecord): void {
    const paint = getPrimarySolidPaint(spec, context)
    if (paint && !isDarkColor({ ...paint.color, a: paint.opacity ?? 1 })) {
      const bounds = getNodeBounds(spec)
      candidates.push({ area: bounds.width * bounds.height, paint })
    }

    for (const child of readChildren(spec)) {
      visit(child)
    }
  }

  for (const child of readChildren(root)) {
    visit(child)
  }

  const minimumArea = rootBounds.width * rootBounds.height * 0.18
  const candidate = candidates
    .filter((item) => item.area >= minimumArea)
    .sort((a, b) => b.area - a.area)[0]

  return candidate?.paint ?? null
}

function getPrimarySolidPaint(spec: JsonRecord, context: RenderContext): SolidPaint | null {
  const styles = isRecord(spec.styles) ? spec.styles : null
  const paint = firstNonEmptyPaintArray([
    readPaintArray(styles?.fills, context),
    readPaintArray(spec.fills, context),
    readPaintArray(spec.fill, context),
    readPaintArray(spec.background, context),
    readPaintArray(spec.backgroundColor, context),
  ])[0]

  return paint && paint.type === 'SOLID' ? paint : null
}

function getPrimarySolidColor(spec: JsonRecord): RGBA | null {
  const styles = isRecord(spec.styles) ? spec.styles : null
  return (
    toRgba(getFirstPaintColor(styles?.fills)) ??
    toRgba(getFirstPaintColor(spec.fills)) ??
    toRgba(spec.fill) ??
    toRgba(spec.background) ??
    toRgba(spec.backgroundColor)
  )
}

function getFirstPaintColor(value: unknown): unknown {
  if (Array.isArray(value) && isRecord(value[0])) {
    return value[0].color
  }

  return value
}

function isDarkColor(color: RGBA): boolean {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722 < 0.28 && color.a > 0.6
}

function applyContainerAutoLayout(
  container: FrameNode | ComponentNode,
  spec: JsonRecord,
  renderedChildren: RenderedChild[],
  context: RenderContext,
): void {
  if (context.options.autoLayoutMode === 'off' || renderedChildren.length === 0 || hasNonGeneratedChildren(container, renderedChildren)) {
    return
  }

  const explicitLayout = getExplicitLayout(spec)
  if (explicitLayout) {
    if (shouldApplyExplicitLayout(spec, explicitLayout, renderedChildren)) {
      applyAutoLayout(container, explicitLayout, renderedChildren, context)
      return
    }

    if (context.options.autoLayoutMode === 'explicit') {
      return
    }
  }

  if (context.options.autoLayoutMode !== 'smart') {
    return
  }

  const inferredLayout = inferAutoLayout(spec, renderedChildren)
  if (inferredLayout) {
    applyAutoLayout(container, inferredLayout, renderedChildren, context)
  }
}

function hasNonGeneratedChildren(container: FrameNode | ComponentNode, renderedChildren: RenderedChild[]): boolean {
  if (container.getPluginData(PLUGIN_DATA_KEY) === PLUGIN_DATA_VALUE) {
    return false
  }

  return container.children.length !== renderedChildren.length
}

function getExplicitLayout(spec: JsonRecord): JsonRecord | null {
  const layout = isRecord(spec.layout) ? spec.layout : null
  if (!layout) {
    return null
  }

  const mode = readString(layout.mode) ?? readString(layout.layoutMode)
  return isAutoLayoutDirection(mode) ? layout : null
}

function shouldApplyExplicitLayout(spec: JsonRecord, layout: JsonRecord, renderedChildren: RenderedChild[]): boolean {
  if (readBoolean(layout.enabled) === false || readBoolean(layout.apply) === false) {
    return false
  }

  if (renderedChildren.every((child) => readString(getAutoLayoutChildSpec(child.spec).layoutPositioning) === 'ABSOLUTE')) {
    return false
  }

  const mode = readString(layout.mode) ?? readString(layout.layoutMode)
  if (!isAutoLayoutDirection(mode)) {
    return false
  }

  const childBounds = renderedChildren
    .filter((child) => readString(getAutoLayoutChildSpec(child.spec).layoutPositioning) !== 'ABSOLUTE')
    .map((child) => getNodeBounds(child.spec))

  if (childBounds.length < 2) {
    return childBounds.length === 1
  }

  if (hasMeaningfulOverlap(childBounds)) {
    return false
  }

  return isStackConsistent(getNodeBounds(spec), childBounds, layout, mode)
}

function isStackConsistent(parentBounds: Bounds, childBounds: Bounds[], layout: JsonRecord, direction: StackDirection): boolean {
  const sorted =
    direction === 'VERTICAL'
      ? [...childBounds].sort((a, b) => a.y - b.y)
      : [...childBounds].sort((a, b) => a.x - b.x)
  const padding = isRecord(layout.padding) ? layout.padding : layout
  const expectedFirst = direction === 'VERTICAL'
    ? parentBounds.y + (readNumber(padding.top) ?? 0)
    : parentBounds.x + (readNumber(padding.left) ?? 0)
  const first = direction === 'VERTICAL' ? sorted[0].y : sorted[0].x

  if (Math.abs(first - expectedFirst) > 4) {
    return false
  }

  const expectedGap = readNumber(layout.gap) ?? readNumber(layout.itemSpacing)
  if (typeof expectedGap !== 'number' || sorted.length < 2) {
    return true
  }

  const gaps = sorted.slice(1).map((bounds, index) => {
    const previous = sorted[index]
    return direction === 'VERTICAL' ? bounds.y - (previous.y + previous.height) : bounds.x - (previous.x + previous.width)
  })

  return gaps.every((gap) => Math.abs(gap - expectedGap) <= 6)
}

function inferAutoLayout(parentSpec: JsonRecord, renderedChildren: RenderedChild[]): JsonRecord | null {
  if (renderedChildren.length < 2) {
    return null
  }

  const parentBounds = getNodeBounds(parentSpec)
  const childBounds = renderedChildren.map((child) => getNodeBounds(child.spec))

  if (hasMeaningfulOverlap(childBounds)) {
    return null
  }

  const horizontal = inferStackLayout(parentBounds, childBounds, 'HORIZONTAL')
  const vertical = inferStackLayout(parentBounds, childBounds, 'VERTICAL')

  if (horizontal && !vertical) {
    return horizontal
  }

  if (vertical && !horizontal) {
    return vertical
  }

  if (horizontal && vertical) {
    return horizontal.confidence > vertical.confidence ? horizontal : vertical
  }

  return null
}

function inferStackLayout(
  parentBounds: Bounds,
  childBounds: Bounds[],
  direction: StackDirection,
): (JsonRecord & { confidence: number }) | null {
  const sorted =
    direction === 'VERTICAL'
      ? [...childBounds].sort((a, b) => a.y - b.y)
      : [...childBounds].sort((a, b) => a.x - b.x)

  const hasAxisOverlap = sorted.some((bounds, index) => {
    if (index === 0) {
      return false
    }

    const previous = sorted[index - 1]
    return direction === 'VERTICAL'
      ? bounds.y < previous.y + previous.height - 1
      : bounds.x < previous.x + previous.width - 1
  })

  if (hasAxisOverlap) {
    return null
  }

  const gaps = sorted.slice(1).map((bounds, index) => {
    const previous = sorted[index]
    return direction === 'VERTICAL' ? bounds.y - (previous.y + previous.height) : bounds.x - (previous.x + previous.width)
  })

  if (gaps.some((gap) => gap < -1)) {
    return null
  }

  const centerSpread = getCenterSpread(sorted, direction === 'VERTICAL' ? 'x' : 'y')
  const crossSize = direction === 'VERTICAL' ? parentBounds.width : parentBounds.height
  const alignmentScore = 1 - clamp(centerSpread / Math.max(1, crossSize), 0, 1)
  const gapVariance = getVariance(gaps)
  const confidence = alignmentScore - Math.min(0.4, gapVariance / 400)

  if (confidence < 0.42) {
    return null
  }

  const minX = Math.min(...sorted.map((bounds) => bounds.x))
  const minY = Math.min(...sorted.map((bounds) => bounds.y))
  const maxX = Math.max(...sorted.map((bounds) => bounds.x + bounds.width))
  const maxY = Math.max(...sorted.map((bounds) => bounds.y + bounds.height))

  return {
    mode: direction,
    gap: Math.max(0, round(median(gaps))),
    padding: {
      top: Math.max(0, round((minY - parentBounds.y))),
      right: Math.max(0, round(parentBounds.x + parentBounds.width - maxX)),
      bottom: Math.max(0, round(parentBounds.y + parentBounds.height - maxY)),
      left: Math.max(0, round(minX - parentBounds.x)),
    },
    primaryAxisSizingMode: 'FIXED',
    counterAxisSizingMode: 'FIXED',
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    confidence,
  }
}

function applyAutoLayout(
  container: FrameNode | ComponentNode,
  layout: JsonRecord,
  renderedChildren: RenderedChild[],
  context: RenderContext,
): void {
  const mode = readString(layout.mode) ?? readString(layout.layoutMode)
  if (!isAutoLayoutDirection(mode)) {
    return
  }

  container.layoutMode = mode
  container.primaryAxisSizingMode = readSizingMode(layout.primaryAxisSizingMode) ?? 'FIXED'
  container.counterAxisSizingMode = readSizingMode(layout.counterAxisSizingMode) ?? 'FIXED'
  container.primaryAxisAlignItems = readPrimaryAxisAlign(layout.primaryAxisAlignItems) ?? 'MIN'
  container.counterAxisAlignItems = readCounterAxisAlign(layout.counterAxisAlignItems) ?? 'MIN'

  const padding = isRecord(layout.padding) ? layout.padding : layout
  container.paddingTop = scaledNumber(padding.top, context.scale, 0)
  container.paddingRight = scaledNumber(padding.right, context.scale, 0)
  container.paddingBottom = scaledNumber(padding.bottom, context.scale, 0)
  container.paddingLeft = scaledNumber(padding.left, context.scale, 0)
  container.itemSpacing = scaledNumber(layout.gap ?? layout.itemSpacing, context.scale, 0)

  const clipsContent = readBoolean(layout.clipsContent)
  if (typeof clipsContent === 'boolean') {
    container.clipsContent = clipsContent
  }

  for (const child of renderedChildren) {
    applyAutoLayoutChild(child.node, child.spec)
  }
}

function applyAutoLayoutChild(node: SceneNode, spec: JsonRecord): void {
  if (!hasAutoLayoutChildProps(node)) {
    return
  }

  const childSpec = getAutoLayoutChildSpec(spec)
  const positioning = readString(childSpec.layoutPositioning)
  node.layoutPositioning = positioning === 'ABSOLUTE' ? 'ABSOLUTE' : 'AUTO'

  const layoutGrow = readNumber(childSpec.layoutGrow)
  if (typeof layoutGrow === 'number') {
    node.layoutGrow = layoutGrow
  }

  const layoutAlign = readString(childSpec.layoutAlign)
  if (layoutAlign === 'STRETCH' || layoutAlign === 'INHERIT') {
    node.layoutAlign = layoutAlign
  }
}

function getAutoLayoutChildSpec(spec: JsonRecord): JsonRecord {
  return isRecord(spec.autoLayoutChild) ? spec.autoLayoutChild : spec
}

async function renderChildren(
  parent: FrameNode | ComponentNode,
  parentSpec: JsonRecord,
  parentSourceBounds: Bounds,
  context: RenderContext,
): Promise<RenderedChild[]> {
  const renderedChildren: RenderedChild[] = []

  for (const child of readChildren(parentSpec)) {
    const node = await renderNode(parent, child, parentSourceBounds, context)
    if (node) {
      renderedChildren.push({ node, spec: child })
    }
  }

  return renderedChildren
}

async function renderNode(
  parent: FrameNode | ComponentNode,
  spec: JsonRecord,
  parentSourceBounds: Bounds,
  context: RenderContext,
): Promise<SceneNode | null> {
  if (spec.visible === false && !context.options.renderHiddenLayers) {
    context.warnings.push(`Skipped hidden layer "${readString(spec.name) ?? 'Unnamed'}".`)
    return null
  }

  const node = await createSceneNode(spec, context)
  parent.appendChild(node)

  markGenerated(node, context)
  applyBounds(node, spec, parentSourceBounds, context)
  await applyNodeContentAndStyle(node, spec, context)

  if (isAppendableNode(node) && !hasImportableAsset(spec)) {
    const renderedChildren = await renderChildren(node, spec, getNodeBounds(spec), context)
    applyContainerAutoLayout(node, spec, renderedChildren, context)
  }

  return node
}

async function createSceneNode(spec: JsonRecord, context: RenderContext): Promise<SceneNode> {
  const assetNode = createAssetNode(spec, context)
  if (assetNode) {
    return assetNode
  }

  const kind = getNodeKind(spec)
  const figmaType = readString(spec.figmaType)?.toUpperCase()
  const children = readChildren(spec)

  if (kind === 'text' || figmaType === 'TEXT' || hasTextContent(spec)) {
    await loadFont(getTextFont(spec))
    return figma.createText()
  }

  if (kind === 'ellipse' || figmaType === 'ELLIPSE') {
    return figma.createEllipse()
  }

  if (kind === 'line' || figmaType === 'LINE') {
    return figma.createLine()
  }

  if (kind === 'container' || kind === 'frame' || kind === 'group' || children.length > 0) {
    const frame = figma.createFrame()
    frame.fills = []
    frame.clipsContent = readBoolean(spec.clipsContent) ?? false
    return frame
  }

  return figma.createRectangle()
}

function createAssetNode(spec: JsonRecord, context: RenderContext): SceneNode | null {
  const inlineAsset = readInlineAsset(spec)
  const assetRef = readString(spec.assetRef) ?? readString(spec.assetId)
  const asset = inlineAsset ?? (assetRef ? context.assets[assetRef] : null)

  if (!asset) {
    return null
  }

  if (assetRef && !inlineAsset && !context.assets[assetRef]) {
    context.warnings.push(`Asset "${assetRef}" nu exista in JSON.`)
    return null
  }

  const mime = (asset.mimeType ?? '').toLowerCase()
  const kind = (asset.kind ?? '').toLowerCase()

  if (kind === 'svg' || mime.includes('svg')) {
    if (asset.encoding && asset.encoding !== 'plain') {
      context.warnings.push(`Asset SVG "${asset.id}" are encoding ${asset.encoding}; folosesc fallback rectangle.`)
      return null
    }

    try {
      return figma.createNodeFromSvg(asset.content)
    } catch (error) {
      context.warnings.push(`Nu pot importa SVG "${asset.id}": ${getErrorMessage(error)}`)
      return null
    }
  }

  if (kind.includes('png') || mime.includes('png')) {
    try {
      const rectangle = figma.createRectangle()
      const image = figma.createImage(base64ToUint8Array(asset.content))
      rectangle.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }]
      return rectangle
    } catch (error) {
      context.warnings.push(`Nu pot importa PNG "${asset.id}": ${getErrorMessage(error)}`)
      return null
    }
  }

  return null
}

function hasImportableAsset(spec: JsonRecord): boolean {
  return Boolean(readString(spec.assetRef) ?? readString(spec.assetId) ?? readInlineAsset(spec)?.content)
}

function readInlineAsset(spec: JsonRecord): AssetSpec | null {
  const asset = isRecord(spec.asset) ? spec.asset : null
  const dataUrl = readString(asset?.dataUrl) ?? readString(asset?.url) ?? readString(spec.dataUrl)

  if (!dataUrl) {
    return null
  }

  const parsed = parseDataUrl(dataUrl)
  if (!parsed) {
    return null
  }

  return {
    id: readString(spec.id) ?? readString(spec.name) ?? 'inline-asset',
    kind: parsed.mimeType.includes('svg') ? 'svg' : parsed.mimeType.includes('png') ? 'png2x' : undefined,
    mimeType: parsed.mimeType,
    encoding: parsed.encoding,
    content: parsed.content,
  }
}

function parseDataUrl(dataUrl: string): { mimeType: string; encoding: 'plain' | 'base64'; content: string } | null {
  const match = dataUrl.match(/^data:([^;,]+)(?:;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i)
  if (!match) {
    return null
  }

  const mimeType = match[1].toLowerCase()
  const isBase64 = Boolean(match[2])
  const payload = match[3]

  if (isBase64) {
    if (mimeType.includes('svg')) {
      return { mimeType, encoding: 'plain', content: uint8ArrayToString(base64ToUint8Array(payload)) }
    }

    return { mimeType, encoding: 'base64', content: payload }
  }

  try {
    return { mimeType, encoding: 'plain', content: decodeURIComponent(payload) }
  } catch (_error) {
    return { mimeType, encoding: 'plain', content: payload }
  }
}

function markGenerated(node: SceneNode, context: RenderContext): void {
  node.setPluginData(PLUGIN_DATA_KEY, PLUGIN_DATA_VALUE)
  if (context.options.lockGeneratedLayers) {
    node.locked = true
  }
  context.createdNodes.push(node)
}

function applyBounds(
  node: SceneNode,
  spec: JsonRecord,
  parentSourceBounds: Bounds,
  context: RenderContext,
): void {
  const bounds = getNodeBounds(spec)
  const x = round((bounds.x - parentSourceBounds.x) * context.scale)
  const y = round((bounds.y - parentSourceBounds.y) * context.scale)
  const width = Math.max(0.01, round(bounds.width * context.scale))
  const height = Math.max(0.01, round(bounds.height * context.scale))

  setNodePosition(node, x, y)
  resizeNode(node, width, height, context)

  const layer = isRecord(spec.layer) ? spec.layer : spec
  const rotation = readNumber(layer.rotation)
  if (typeof rotation === 'number' && 'rotation' in node) {
    node.rotation = rotation
  }
}

async function applyNodeContentAndStyle(node: SceneNode, spec: JsonRecord, context: RenderContext): Promise<void> {
  node.name = readString(spec.name) ?? defaultNodeName(spec)
  node.visible = readBoolean(spec.visible) ?? true
  node.locked = context.options.lockGeneratedLayers || (readBoolean(spec.locked) ?? false)

  applyLayerStyle(node, spec)
  applyPaints(node, spec, context)
  applyStrokes(node, spec, context)
  applyCorners(node, spec, context)
  applyEffects(node, spec, context)

  if (node.type === 'TEXT') {
    await applyText(node, spec, context)
  }
}

function applyLayerStyle(node: SceneNode, spec: JsonRecord): void {
  const layer = isRecord(spec.layer) ? spec.layer : spec
  const opacity = readNumber(layer.opacity)
  const blendMode = readString(layer.blendMode)

  if (typeof opacity === 'number' && 'opacity' in node) {
    node.opacity = clamp(opacity, 0, 1)
  }

  if (blendMode && 'blendMode' in node && isBlendMode(blendMode)) {
    node.blendMode = blendMode
  }
}

async function applyText(node: TextNode, spec: JsonRecord, context: RenderContext): Promise<void> {
  const textSpec = getTextSpec(spec)
  const characters = getTextCharacters(spec)
  const font = getTextFont(spec)
  const bounds = getNodeBounds(spec)

  const loadedFont = await loadFont(font)
  node.fontName = loadedFont
  node.characters = characters
  node.textAutoResize = 'NONE'

  const fontSize = readNumber(textSpec.fontSize) ?? readNumber(spec.fontSize)
  const resolvedFontSize = typeof fontSize === 'number' ? Math.max(1, round(fontSize * context.scale)) : undefined
  if (typeof resolvedFontSize === 'number') {
    node.fontSize = resolvedFontSize
  }

  const textAlignHorizontal = readString(textSpec.textAlignHorizontal) ?? readString(spec.textAlignHorizontal)
  if (isTextAlignHorizontal(textAlignHorizontal)) {
    node.textAlignHorizontal = textAlignHorizontal
  }

  const textAlignVertical = readString(textSpec.textAlignVertical) ?? readString(spec.textAlignVertical)
  if (isTextAlignVertical(textAlignVertical)) {
    node.textAlignVertical = textAlignVertical
  }

  const lineHeight = toLineHeight(textSpec.lineHeight ?? spec.lineHeight, context.scale)
  if (lineHeight) {
    node.lineHeight = lineHeight
  }

  const letterSpacing = toLetterSpacing(textSpec.letterSpacing ?? spec.letterSpacing, context.scale)
  if (letterSpacing) {
    node.letterSpacing = letterSpacing
  }

  const paragraphSpacing = readNumber(textSpec.paragraphSpacing)
  if (typeof paragraphSpacing === 'number') {
    node.paragraphSpacing = round(paragraphSpacing * context.scale)
  }

  const textCase = readString(textSpec.textCase)
  if (isTextCase(textCase)) {
    node.textCase = textCase
  }

  const textDecoration = readString(textSpec.textDecoration)
  if (isTextDecoration(textDecoration)) {
    node.textDecoration = textDecoration
  }

  applyTextFills(node, spec, context)
  await applyTextSegments(node, textSpec, context)
  preventAccidentalTextWrap(node, spec, characters, bounds, resolvedFontSize ?? 16, context)
}

function preventAccidentalTextWrap(
  node: TextNode,
  spec: JsonRecord,
  characters: string,
  bounds: Bounds,
  fontSize: number,
  context: RenderContext,
): void {
  const textSpec = getTextSpec(spec)
  if (!characters || characters.includes('\n') || readBoolean(textSpec.allowWrap) === true || readBoolean(spec.allowWrap) === true) {
    return
  }

  const currentWidth = Math.max(1, bounds.width * context.scale)
  const currentHeight = Math.max(1, bounds.height * context.scale)
  const estimatedWidth = estimateTextWidth(characters, fontSize)

  if (estimatedWidth <= currentWidth + 2) {
    return
  }

  try {
    node.resize(Math.ceil(estimatedWidth + 4), currentHeight)
  } catch (error) {
    context.warnings.push(`Nu pot extinde textul "${node.name}": ${getErrorMessage(error)}`)
  }
}

function estimateTextWidth(characters: string, fontSize: number): number {
  let width = 0

  for (const character of characters) {
    if (character === ' ') {
      width += fontSize * 0.32
    } else if ('.,:;!|'.includes(character)) {
      width += fontSize * 0.24
    } else if ('0123456789'.includes(character)) {
      width += fontSize * 0.56
    } else if (character === character.toUpperCase() && character !== character.toLowerCase()) {
      width += fontSize * 0.64
    } else {
      width += fontSize * 0.54
    }
  }

  return width
}

async function applyTextSegments(node: TextNode, textSpec: JsonRecord, context: RenderContext): Promise<void> {
  const segments = readArray(textSpec.segments).filter(isRecord)

  for (const segment of segments) {
    const start = readNumber(segment.start)
    const end = readNumber(segment.end)
    if (typeof start !== 'number' || typeof end !== 'number' || start < 0 || end > node.characters.length || start >= end) {
      continue
    }

    const font = getFontFromValue(segment.fontName) ?? DEFAULT_FONT
    const loadedFont = await loadFont(font)
    node.setRangeFontName(start, end, loadedFont)

    const fontSize = readNumber(segment.fontSize)
    if (typeof fontSize === 'number') {
      node.setRangeFontSize(start, end, Math.max(1, round(fontSize * context.scale)))
    }

    const fills = readPaintArray(segment.fills, context)
    if (fills.length > 0) {
      node.setRangeFills(start, end, fills)
    }

    const lineHeight = toLineHeight(segment.lineHeight, context.scale)
    if (lineHeight) {
      node.setRangeLineHeight(start, end, lineHeight)
    }

    const letterSpacing = toLetterSpacing(segment.letterSpacing, context.scale)
    if (letterSpacing) {
      node.setRangeLetterSpacing(start, end, letterSpacing)
    }

    const textDecoration = readString(segment.textDecoration)
    if (isTextDecoration(textDecoration)) {
      node.setRangeTextDecoration(start, end, textDecoration)
    }

    const textCase = readString(segment.textCase)
    if (isTextCase(textCase)) {
      node.setRangeTextCase(start, end, textCase)
    }
  }
}

function applyTextFills(node: TextNode, spec: JsonRecord, context: RenderContext): void {
  const textSpec = getTextSpec(spec)
  const fills = readPaintArray(textSpec.fills, context)
  if (fills.length > 0) {
    node.fills = fills
    return
  }

  const color = readUnknown(textSpec.color) ?? readUnknown(spec.color)
  const paint = toSolidPaint(color)
  if (paint) {
    node.fills = [paint]
  }
}

function applyPaints(node: SceneNode, spec: JsonRecord, context: RenderContext): void {
  if (!hasFills(node)) {
    return
  }

  const styles = isRecord(spec.styles) ? spec.styles : null
  const paints = firstNonEmptyPaintArray([
    readPaintArray(styles?.fills, context),
    readPaintArray(spec.fills, context),
    readPaintArray(spec.fill, context),
    readPaintArray(spec.background, context),
    readPaintArray(spec.backgroundColor, context),
  ])

  if (paints.length > 0) {
    node.fills = paints
    return
  }

  const solidPaint =
    toSolidPaint(spec.fill) ??
    toSolidPaint(spec.background) ??
    toSolidPaint(spec.backgroundColor) ??
    (getNodeKind(spec) === 'text' ? toSolidPaint(spec.color) : null)

  if (solidPaint) {
    node.fills = [solidPaint]
  }
}

function applyStrokes(node: SceneNode, spec: JsonRecord, context: RenderContext): void {
  if (!hasStrokes(node)) {
    return
  }

  const styles = isRecord(spec.styles) ? spec.styles : null
  const strokes = firstNonEmptyPaintArray([readPaintArray(styles?.strokes, context), readPaintArray(spec.strokes, context)])
  const simpleStroke = toSolidPaint(spec.stroke) ?? toSolidPaint(spec.borderColor)

  if (strokes.length > 0) {
    node.strokes = strokes
  } else if (simpleStroke) {
    node.strokes = [simpleStroke]
  }

  const strokeWeight = readNumber(styles?.strokeWeight) ?? readNumber(spec.strokeWeight) ?? readNumber(spec.borderWidth)
  if (typeof strokeWeight === 'number') {
    node.strokeWeight = Math.max(0, round(strokeWeight * context.scale))
  }

  const strokeAlign = readString(styles?.strokeAlign) ?? readString(spec.strokeAlign)
  if (isStrokeAlign(strokeAlign)) {
    node.strokeAlign = strokeAlign
  }

  const dashPattern = readNumberArray(styles?.dashPattern) ?? readNumberArray(spec.dashPattern)
  if (dashPattern) {
    node.dashPattern = dashPattern.map((value) => round(value * context.scale))
  }
}

function applyCorners(node: SceneNode, spec: JsonRecord, context: RenderContext): void {
  if (!hasCornerRadius(node)) {
    return
  }

  const styles = isRecord(spec.styles) ? spec.styles : null
  const radius =
    readNumber(styles?.cornerRadius) ??
    readNumber(spec.cornerRadius) ??
    readNumber(spec.radius) ??
    readNumber(spec.borderRadius)

  if (typeof radius === 'number') {
    node.cornerRadius = Math.max(0, round(radius * context.scale))
  }

  if (!hasRectangleCornerRadii(node)) {
    return
  }

  const cornerRadii = isRecord(styles?.cornerRadii) ? styles?.cornerRadii : isRecord(spec.cornerRadii) ? spec.cornerRadii : null
  if (!cornerRadii) {
    return
  }

  const topLeft = readNumber(cornerRadii.topLeft)
  const topRight = readNumber(cornerRadii.topRight)
  const bottomRight = readNumber(cornerRadii.bottomRight)
  const bottomLeft = readNumber(cornerRadii.bottomLeft)

  if (typeof topLeft === 'number') {
    node.topLeftRadius = Math.max(0, round(topLeft * context.scale))
  }
  if (typeof topRight === 'number') {
    node.topRightRadius = Math.max(0, round(topRight * context.scale))
  }
  if (typeof bottomRight === 'number') {
    node.bottomRightRadius = Math.max(0, round(bottomRight * context.scale))
  }
  if (typeof bottomLeft === 'number') {
    node.bottomLeftRadius = Math.max(0, round(bottomLeft * context.scale))
  }
}

function applyEffects(node: SceneNode, spec: JsonRecord, context: RenderContext): void {
  if (!hasEffects(node)) {
    return
  }

  const styles = isRecord(spec.styles) ? spec.styles : null
  const effects = firstNonEmptyEffectArray([readEffectArray(styles?.effects, context), readEffectArray(spec.effects, context)])
  if (effects.length > 0) {
    node.effects = effects
    return
  }

  if (isRecord(spec.shadow)) {
    const color = toRgba(spec.shadow.color) ?? { r: 0, g: 0, b: 0, a: 0.18 }
    const x = readNumber(spec.shadow.x) ?? readNumber(spec.shadow.offsetX) ?? 0
    const y = readNumber(spec.shadow.y) ?? readNumber(spec.shadow.offsetY) ?? 8
    const radius = readNumber(spec.shadow.blur) ?? readNumber(spec.shadow.radius) ?? 24
    node.effects = [
      {
        type: 'DROP_SHADOW',
        color,
        offset: { x: x * context.scale, y: y * context.scale },
        radius: radius * context.scale,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ]
  }
}

function getNodeBounds(spec: JsonRecord): Bounds {
  const bounds = isRecord(spec.bounds) ? spec.bounds : null
  const layer = isRecord(spec.layer) ? spec.layer : null

  const x = readNumber(bounds?.x) ?? readNumber(layer?.x) ?? readNumber(spec.x) ?? 0
  const y = readNumber(bounds?.y) ?? readNumber(layer?.y) ?? readNumber(spec.y) ?? 0
  const width = readNumber(bounds?.width) ?? readNumber(layer?.width) ?? readNumber(spec.width) ?? defaultWidth(spec)
  const height = readNumber(bounds?.height) ?? readNumber(layer?.height) ?? readNumber(spec.height) ?? defaultHeight(spec)

  return {
    x,
    y,
    width: Math.max(0, width),
    height: Math.max(0, height),
  }
}

function defaultWidth(spec: JsonRecord): number {
  if (getNodeKind(spec) === 'text') {
    return 240
  }

  const children = readChildren(spec)
  if (children.length > 0) {
    const union = getUnionBounds(children.map((child) => getNodeBounds(child)))
    return Math.max(100, union.x + union.width)
  }

  return 120
}

function defaultHeight(spec: JsonRecord): number {
  if (getNodeKind(spec) === 'text') {
    return 32
  }

  const children = readChildren(spec)
  if (children.length > 0) {
    const union = getUnionBounds(children.map((child) => getNodeBounds(child)))
    return Math.max(80, union.y + union.height)
  }

  return 80
}

function getUnionBounds(boundsList: Bounds[]): Bounds {
  const validBounds = boundsList.filter((bounds) => bounds.width > 0 && bounds.height > 0)
  if (validBounds.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const minX = Math.min(...validBounds.map((bounds) => bounds.x))
  const minY = Math.min(...validBounds.map((bounds) => bounds.y))
  const maxX = Math.max(...validBounds.map((bounds) => bounds.x + bounds.width))
  const maxY = Math.max(...validBounds.map((bounds) => bounds.y + bounds.height))

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function getDocumentContentBounds(roots: JsonRecord[], includeHiddenLayers: boolean): Bounds {
  const bounds: Bounds[] = []

  function visit(node: JsonRecord): void {
    if (node.visible === false && !includeHiddenLayers) {
      return
    }

    bounds.push(getNodeBounds(node))

    for (const child of readChildren(node)) {
      visit(child)
    }
  }

  for (const root of roots) {
    visit(root)
  }

  return getUnionBounds(bounds)
}

function hasMeaningfulOverlap(boundsList: Bounds[]): boolean {
  for (let firstIndex = 0; firstIndex < boundsList.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < boundsList.length; secondIndex += 1) {
      const first = boundsList[firstIndex]
      const second = boundsList[secondIndex]
      const overlapWidth = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x))
      const overlapHeight = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y))
      const overlapArea = overlapWidth * overlapHeight
      const smallerArea = Math.min(first.width * first.height, second.width * second.height)

      if (smallerArea > 0 && overlapArea / smallerArea > 0.12) {
        return true
      }
    }
  }

  return false
}

function getCenterSpread(boundsList: Bounds[], axis: 'x' | 'y'): number {
  const centers = boundsList.map((bounds) => (axis === 'x' ? bounds.x + bounds.width / 2 : bounds.y + bounds.height / 2))
  return Math.max(...centers) - Math.min(...centers)
}

function getVariance(values: number[]): number {
  if (values.length < 2) {
    return 0
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[middle]
  }

  return (sorted[middle - 1] + sorted[middle]) / 2
}

function readChildren(spec: JsonRecord): JsonRecord[] {
  const children = readArray(spec.children).filter(isRecord)
  if (children.length > 0) {
    return children
  }

  return readArray(spec.layers).filter(isRecord)
}

function getNodeKind(spec: JsonRecord): string {
  const type = readString(spec.type)?.toLowerCase()
  const figmaType = readString(spec.figmaType)?.toLowerCase()

  if (type) {
    return normalizeKind(type)
  }

  if (figmaType) {
    return normalizeKind(figmaType)
  }

  if (hasTextContent(spec)) {
    return 'text'
  }

  if (readChildren(spec).length > 0) {
    return 'container'
  }

  return 'shape'
}

function normalizeKind(value: string): string {
  if (value === 'frame' || value === 'component' || value === 'component_set' || value === 'instance' || value === 'section') {
    return 'container'
  }

  if (value === 'rectangle' || value === 'shape' || value === 'card') {
    return 'shape'
  }

  if (value === 'vector' || value === 'boolean_operation' || value === 'star' || value === 'polygon') {
    return 'vector'
  }

  return value
}

function defaultNodeName(spec: JsonRecord): string {
  const kind = getNodeKind(spec)
  if (kind === 'text') {
    return 'Text'
  }
  if (kind === 'container') {
    return 'Frame'
  }
  return 'Layer'
}

function hasTextContent(spec: JsonRecord): boolean {
  if (typeof spec.characters === 'string' || typeof spec.content === 'string' || typeof spec.label === 'string') {
    return true
  }

  return isRecord(spec.text) && typeof spec.text.characters === 'string'
}

function getTextSpec(spec: JsonRecord): JsonRecord {
  if (isRecord(spec.text)) {
    return spec.text
  }

  return spec
}

function getTextCharacters(spec: JsonRecord): string {
  const text = spec.text
  if (typeof text === 'string') {
    return text
  }

  const textSpec = getTextSpec(spec)
  return (
    readString(textSpec.characters) ??
    readString(spec.characters) ??
    readString(spec.content) ??
    readString(spec.label) ??
    ''
  )
}

function getTextFont(spec: JsonRecord): FontName {
  const textSpec = getTextSpec(spec)
  return getFontFromValue(textSpec.fontName) ?? getFontFromValue(spec.fontName) ?? DEFAULT_FONT
}

function getFontFromValue(value: unknown): FontName | null {
  if (!isRecord(value)) {
    return null
  }

  const family = readString(value.family)
  const style = readString(value.style)
  if (!family || !style) {
    return null
  }

  return { family, style }
}

async function loadFont(font: FontName): Promise<FontName> {
  const cacheKey = `${font.family}__${font.style}`
  if (!FONT_CACHE[cacheKey]) {
    FONT_CACHE[cacheKey] = figma
      .loadFontAsync(font)
      .then(() => true)
      .catch(async () => {
        const fallbackKey = `${DEFAULT_FONT.family}__${DEFAULT_FONT.style}`
        if (!FONT_CACHE[fallbackKey]) {
          FONT_CACHE[fallbackKey] = figma.loadFontAsync(DEFAULT_FONT).then(() => true)
        }
        await FONT_CACHE[fallbackKey]
        return false
      })
  }

  const loadedRequestedFont = await FONT_CACHE[cacheKey]
  return loadedRequestedFont ? font : DEFAULT_FONT
}

function setNodePosition(node: SceneNode, x: number, y: number): void {
  if ('x' in node) {
    node.x = x
  }
  if ('y' in node) {
    node.y = y
  }
}

function resizeNode(node: SceneNode, width: number, height: number, context: RenderContext): void {
  if (!('resize' in node) || typeof node.resize !== 'function') {
    return
  }

  try {
    node.resize(width, height)
  } catch (error) {
    context.warnings.push(`Nu pot redimensiona "${node.name}": ${getErrorMessage(error)}`)
  }
}

function isAppendableNode(node: SceneNode): node is FrameNode | ComponentNode {
  return node.type === 'FRAME' || node.type === 'COMPONENT'
}

function hasFills(node: SceneNode): node is SceneNode & { fills: readonly Paint[] | PluginAPI['mixed'] } {
  return 'fills' in node
}

function hasStrokes(
  node: SceneNode,
): node is SceneNode & {
  strokes: readonly Paint[]
  strokeWeight: number | PluginAPI['mixed']
  strokeAlign: StrokeAlignValue
  dashPattern: readonly number[]
} {
  return 'strokes' in node
}

function hasCornerRadius(node: SceneNode): node is SceneNode & { cornerRadius: number | PluginAPI['mixed'] } {
  return 'cornerRadius' in node
}

function hasRectangleCornerRadii(
  node: SceneNode,
): node is RectangleNode | FrameNode | ComponentNode | ComponentSetNode | InstanceNode {
  return 'topLeftRadius' in node
}

function hasEffects(node: SceneNode): node is SceneNode & { effects: readonly Effect[] } {
  return 'effects' in node
}

function hasAutoLayoutChildProps(
  node: SceneNode,
): node is SceneNode & {
  layoutPositioning: 'AUTO' | 'ABSOLUTE'
  layoutGrow: number
  layoutAlign: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT'
} {
  return 'layoutPositioning' in node && 'layoutGrow' in node && 'layoutAlign' in node
}

function readPaintArray(value: unknown, _context: RenderContext): Paint[] {
  if (Array.isArray(value)) {
    const paints = value.map((item) => toPaint(item)).filter((paint): paint is Paint => paint !== null)
    return paints
  }

  const paint = toPaint(value)
  return paint ? [paint] : []
}

function firstNonEmptyPaintArray(candidates: Paint[][]): Paint[] {
  return candidates.find((candidate) => candidate.length > 0) ?? []
}

function toPaint(value: unknown): Paint | null {
  if (!isRecord(value)) {
    return toSolidPaint(value)
  }

  const type = readString(value.type)
  if (!type || type === 'SOLID') {
    return toSolidPaint(value)
  }

  if (type.startsWith('GRADIENT_')) {
    const stops = readArray(value.gradientStops).filter(isRecord)
    if (stops.length === 0) {
      return null
    }

    return {
      type: type as GradientPaint['type'],
      visible: readBoolean(value.visible) ?? true,
      opacity: readNumber(value.opacity) ?? 1,
      blendMode: isBlendMode(readString(value.blendMode)) ? (readString(value.blendMode) as BlendMode) : 'NORMAL',
      gradientStops: stops.map((stop) => ({
        position: readNumber(stop.position) ?? 0,
        color: toRgba(stop.color) ?? { r: 0, g: 0, b: 0, a: 1 },
      })),
      gradientTransform: readTransform(value.gradientTransform),
    }
  }

  return null
}

function toSolidPaint(value: unknown): SolidPaint | null {
  const color = toRgb(value)
  if (!color) {
    return null
  }

  const rgba = toRgba(value)
  const opacityFromColor = rgba ? rgba.a : undefined
  const opacity = isRecord(value) ? readNumber(value.opacity) : undefined

  return {
    type: 'SOLID',
    color,
    opacity: opacity ?? opacityFromColor ?? 1,
    visible: isRecord(value) ? (readBoolean(value.visible) ?? true) : true,
    blendMode: isRecord(value) && isBlendMode(readString(value.blendMode)) ? (readString(value.blendMode) as BlendMode) : 'NORMAL',
  }
}

function toRgb(value: unknown): RGB | null {
  const rgba = toRgba(value)
  if (!rgba) {
    return null
  }

  return { r: rgba.r, g: rgba.g, b: rgba.b }
}

function toRgba(value: unknown): RGBA | null {
  if (typeof value === 'string') {
    return parseColorString(value)
  }

  if (!isRecord(value)) {
    return null
  }

  if (typeof value.hex === 'string') {
    return parseColorString(value.hex)
  }

  if (typeof value.css === 'string') {
    return parseColorString(value.css)
  }

  if (isRecord(value.color)) {
    return toRgba(value.color)
  }

  if (isRecord(value.rgba)) {
    return readRgbaRecord(value.rgba)
  }

  if (isRecord(value.rgb)) {
    return readRgbaRecord(value.rgb)
  }

  return readRgbaRecord(value)
}

function readRgbaRecord(value: JsonRecord): RGBA | null {
  const r = readNumber(value.r)
  const g = readNumber(value.g)
  const b = readNumber(value.b)
  const a = readNumber(value.a) ?? 1

  if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
    return null
  }

  const normalized = r > 1 || g > 1 || b > 1
  return {
    r: clamp(normalized ? r / 255 : r, 0, 1),
    g: clamp(normalized ? g / 255 : g, 0, 1),
    b: clamp(normalized ? b / 255 : b, 0, 1),
    a: clamp(a, 0, 1),
  }
}

function parseColorString(value: string): RGBA | null {
  const input = value.trim()
  const hex = input.match(/^#?([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/i)
  if (hex) {
    const raw = hex[1]
    const expanded =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : raw
    const r = parseInt(expanded.slice(0, 2), 16) / 255
    const g = parseInt(expanded.slice(2, 4), 16) / 255
    const b = parseInt(expanded.slice(4, 6), 16) / 255
    const a = expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }

  const rgba = input.match(/^rgba?\(([^)]+)\)$/i)
  if (rgba) {
    const parts = rgba[1].split(',').map((part) => Number(part.trim()))
    if (parts.length >= 3 && parts.every((part) => Number.isFinite(part))) {
      return {
        r: clamp(parts[0] / 255, 0, 1),
        g: clamp(parts[1] / 255, 0, 1),
        b: clamp(parts[2] / 255, 0, 1),
        a: clamp(parts[3] ?? 1, 0, 1),
      }
    }
  }

  return null
}

function readTransform(value: unknown): Transform {
  if (!Array.isArray(value) || value.length !== 2) {
    return [
      [1, 0, 0],
      [0, 1, 0],
    ]
  }

  const rowA = Array.isArray(value[0]) ? value[0].map((item) => readNumber(item) ?? 0).slice(0, 3) : [1, 0, 0]
  const rowB = Array.isArray(value[1]) ? value[1].map((item) => readNumber(item) ?? 0).slice(0, 3) : [0, 1, 0]

  return [
    [rowA[0] ?? 1, rowA[1] ?? 0, rowA[2] ?? 0],
    [rowB[0] ?? 0, rowB[1] ?? 1, rowB[2] ?? 0],
  ]
}

function readEffectArray(value: unknown, context: RenderContext): Effect[] {
  if (!Array.isArray(value)) {
    return []
  }

  const effects = value.map((item) => toEffect(item, context)).filter((effect): effect is Effect => effect !== null)
  return effects
}

function firstNonEmptyEffectArray(candidates: Effect[][]): Effect[] {
  return candidates.find((candidate) => candidate.length > 0) ?? []
}

function toEffect(value: unknown, context: RenderContext): Effect | null {
  if (!isRecord(value)) {
    return null
  }

  const type = readString(value.type)
  if (type === 'DROP_SHADOW' || type === 'INNER_SHADOW') {
    const offset = isRecord(value.offset) ? value.offset : {}
    return {
      type,
      color: toRgba(value.color) ?? { r: 0, g: 0, b: 0, a: 0.18 },
      offset: {
        x: (readNumber(offset.x) ?? 0) * context.scale,
        y: (readNumber(offset.y) ?? 0) * context.scale,
      },
      radius: (readNumber(value.radius) ?? 0) * context.scale,
      spread: (readNumber(value.spread) ?? 0) * context.scale,
      visible: readBoolean(value.visible) ?? true,
      blendMode: isBlendMode(readString(value.blendMode)) ? (readString(value.blendMode) as BlendMode) : 'NORMAL',
    }
  }

  if (type === 'LAYER_BLUR' || type === 'BACKGROUND_BLUR') {
    return {
      type,
      radius: (readNumber(value.radius) ?? 0) * context.scale,
      visible: readBoolean(value.visible) ?? true,
      blurType: 'NORMAL',
    }
  }

  return null
}

function toLineHeight(value: unknown, scale: number): LineHeight | null {
  if (!isRecord(value)) {
    return null
  }

  const unit = readString(value.unit)
  if (unit === 'AUTO') {
    return { unit: 'AUTO' }
  }

  const numericValue = readNumber(value.value)
  if (typeof numericValue !== 'number') {
    return null
  }

  if (unit === 'PERCENT') {
    return { unit: 'PERCENT', value: numericValue }
  }

  return { unit: 'PIXELS', value: Math.max(1, round(numericValue * scale)) }
}

function toLetterSpacing(value: unknown, scale: number): LetterSpacing | null {
  if (!isRecord(value)) {
    return null
  }

  const unit = readString(value.unit)
  const numericValue = readNumber(value.value)
  if (typeof numericValue !== 'number') {
    return null
  }

  if (unit === 'PERCENT') {
    return { unit: 'PERCENT', value: numericValue }
  }

  return { unit: 'PIXELS', value: round(numericValue * scale) }
}

function base64ToUint8Array(value: string): Uint8Array {
  const normalized = value
    .replace(/^data:[^,]+,/, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/\s/g, '')
  const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  const outputLength = Math.floor((normalized.length * 3) / 4) - padding
  const bytes = new Uint8Array(Math.max(0, outputLength))
  let outputIndex = 0

  for (let index = 0; index < normalized.length; index += 4) {
    const encoded1 = lookup.indexOf(normalized[index])
    const encoded2 = lookup.indexOf(normalized[index + 1])
    const encoded3 = lookup.indexOf(normalized[index + 2])
    const encoded4 = lookup.indexOf(normalized[index + 3])
    const chunk = (encoded1 << 18) | (encoded2 << 12) | ((encoded3 & 63) << 6) | (encoded4 & 63)

    if (outputIndex < bytes.length) {
      bytes[outputIndex] = (chunk >> 16) & 255
      outputIndex += 1
    }
    if (outputIndex < bytes.length) {
      bytes[outputIndex] = (chunk >> 8) & 255
      outputIndex += 1
    }
    if (outputIndex < bytes.length) {
      bytes[outputIndex] = chunk & 255
      outputIndex += 1
    }
  }

  return bytes
}

function uint8ArrayToString(bytes: Uint8Array): string {
  const chunks: string[] = []
  const chunkSize = 8192

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.slice(index, index + chunkSize)))
  }

  return chunks.join('')
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readUnknown(value: unknown): unknown {
  return value
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function readNumberArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const numbers = value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
  return numbers.length === value.length ? numbers : null
}

function scaledNumber(value: unknown, scale: number, fallback: number): number {
  const number = readNumber(value)
  return typeof number === 'number' ? Math.max(0, round(number * scale)) : fallback
}

function isAutoLayoutDirection(value: string | undefined): value is StackDirection {
  return value === 'VERTICAL' || value === 'HORIZONTAL'
}

function readSizingMode(value: unknown): 'FIXED' | 'AUTO' | null {
  return value === 'FIXED' || value === 'AUTO' ? value : null
}

function readPrimaryAxisAlign(value: unknown): 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' | null {
  return value === 'MIN' || value === 'CENTER' || value === 'MAX' || value === 'SPACE_BETWEEN' ? value : null
}

function readCounterAxisAlign(value: unknown): 'MIN' | 'CENTER' | 'MAX' | 'BASELINE' | null {
  return value === 'MIN' || value === 'CENTER' || value === 'MAX' || value === 'BASELINE' ? value : null
}

function isBlendMode(value: string | undefined): value is BlendMode {
  return (
    value === 'PASS_THROUGH' ||
    value === 'NORMAL' ||
    value === 'DARKEN' ||
    value === 'MULTIPLY' ||
    value === 'LINEAR_BURN' ||
    value === 'COLOR_BURN' ||
    value === 'LIGHTEN' ||
    value === 'SCREEN' ||
    value === 'LINEAR_DODGE' ||
    value === 'COLOR_DODGE' ||
    value === 'OVERLAY' ||
    value === 'SOFT_LIGHT' ||
    value === 'HARD_LIGHT' ||
    value === 'DIFFERENCE' ||
    value === 'EXCLUSION' ||
    value === 'HUE' ||
    value === 'SATURATION' ||
    value === 'COLOR' ||
    value === 'LUMINOSITY'
  )
}

function isStrokeAlign(value: string | undefined): value is StrokeAlignValue {
  return value === 'CENTER' || value === 'INSIDE' || value === 'OUTSIDE'
}

function isTextAlignHorizontal(value: string | undefined): value is TextNode['textAlignHorizontal'] {
  return value === 'LEFT' || value === 'CENTER' || value === 'RIGHT' || value === 'JUSTIFIED'
}

function isTextAlignVertical(value: string | undefined): value is TextNode['textAlignVertical'] {
  return value === 'TOP' || value === 'CENTER' || value === 'BOTTOM'
}

function isTextCase(value: string | undefined): value is TextCase {
  return value === 'ORIGINAL' || value === 'UPPER' || value === 'LOWER' || value === 'TITLE' || value === 'SMALL_CAPS' || value === 'SMALL_CAPS_FORCED'
}

function isTextDecoration(value: string | undefined): value is TextDecoration {
  return value === 'NONE' || value === 'UNDERLINE' || value === 'STRIKETHROUGH'
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'eroare necunoscuta'
}
