import { createNativeUpdateProxy } from '../scripts/native-spike/ota/native-proxy.mjs'

// Modern Vercel Node Functions use the standard Request/Response fetch interface.
export default {
  fetch(request) {
    return createNativeUpdateProxy({ backendOrigin: process.env.NATIVE_OTA_BACKEND_ORIGIN })(request)
  },
}
