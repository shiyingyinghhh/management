import debug from '@/utils/env'
import dev from '@/setting/env/dev'
import prod from '@/setting/env/prod'
import Req from '@/utils/request'

const config = debug ? dev : prod
// const config = prod
export const req = Req(config.req)
export default config

export const login_url = config.login_url
export const oauth_project_station_url = config.oauth_project_station_url
export const env = config.env