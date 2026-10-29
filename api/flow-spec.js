import { createSpecHandler } from '../scripts/flow-spec/server.mjs'
import { createPersonalSpecAuthorizer } from '../scripts/flow-spec/personal-access.mjs'

export default createSpecHandler({ authorize: createPersonalSpecAuthorizer() })
