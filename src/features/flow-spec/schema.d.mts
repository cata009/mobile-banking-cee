import type { SpecDocument } from './types'
export function safeSpecLink(value: unknown): value is string
export function validateSpecDocument(value: unknown): asserts value is SpecDocument
