# Shared Card guard specification storage

User requested durable autosave and history for every visitor of the published application, with no Git publication or deployment in this task. Existing Confluence-style editor, flow IDs and design system remain unchanged. This extends the approved storage contract; continue implementation inline under the user's explicit instruction.

Use a private Vercel Blob store connected to the existing mobile-banking-cee project. Store the current document/index as a small JSON manifest, immutable revision documents at unique paths, and original images as private blobs. No credentials or public blob URLs reach document JSON. Authenticated API responses hydrate image bytes for the existing editor/Word serializers.

The manifest is read with `useCache: false` and committed using `ifMatch` against its ETag. Initial creation forbids overwrites. Save and restore require the expected document revision; concurrent losers receive 409 and preserve browser recovery. Asset-only manifest races retry without overwriting a newer document. A revision becomes visible only when its manifest commit succeeds. No automatic expiry/deletion of committed history or original images.

Images upload directly using short-lived tokens scoped to an exact generated image pathname, PNG/JPEG and 5 MB. Finalization validates actual bytes/dimensions and registers SHA-256 identity with existing 50-image/20-MB limits. Reads authenticate the existing mb_access cookie and stream only registered images. Document responses omit image bytes to remain below Function payload limits. Store credentials remain server-only. Production and preview use separate namespace defaults; localhost uses files unless explicitly configured to test cloud storage.

Clean read-mode documents refresh on focus/visibility and a modest polling interval. The mounted editor, pending local edits, saves, restores and attachments block replacement; stale edits remain recoverable. Keeping the visible editor document and its base revision together is required to preserve CAS conflict detection. This is shared versioned authoring, without simultaneous character-level merging.

Provision storage and connect production credentials without deploying. Verify independently-created repository instances, simultaneous saves, concurrent asset registration, restore, private image reads, invalid input, auth/origin, client hydration and actual remote persistence. Supply a backup/import utility which never replaces an existing namespace. Preserve the local source/history and do not silently copy QA drafts into production.

References: https://vercel.com/docs/vercel-blob/using-blob-sdk and https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage .
