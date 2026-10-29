// Reuse the existing server validator, rather than creating a second cookie
// protocol. No mobile-entry or share-token issuance route is invoked here.
// @ts-expect-error Existing JavaScript endpoint has no declaration file.
import access from '../../api/access.js'

export async function legacySharedReader(request: Request): Promise<boolean> {
  let statusCode = 0
  let authenticated = false
  const response = {
    setHeader() {},
    status(value: number) { statusCode = value; return this },
    json(body: unknown) { authenticated = !!body && typeof body === 'object' && 'authenticated' in body && body.authenticated === true },
    end() {},
  }
  await access({ method: 'GET', url: '/api/access', headers: { cookie: request.headers.get('cookie') ?? '' } }, response)
  return statusCode === 200 && authenticated
}
