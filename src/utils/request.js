import { getToken } from './storage'
import qs from 'qs'
let req_cli = {}
const init = (options) => {
    if(req_cli && Object.keys(req_cli).length > 0) return
    req_cli = params => {
        const access_token = getToken()
        if(!params.headers) params.headers = {}
        if (options.ignore_path.indexOf(params.url) == -1 && access_token && typeof access_token == 'string') Object.assign(params.headers, {
            access_token
        })
        const opt = {
            method: params.method,
            body: params.data ? JSON.stringify(params.data) : '',
            headers: Object.assign(params.headers, {
                'Content-Type': 'application/json',
                'x-mcga-token': access_token
            }),
            mode: 'cors'
        }
        if (['get'].indexOf(params.method) > -1) {
            const _params = params.data && Object.keys(params.data).length ? qs.stringify(params.data) : ''
            if (params.url.indexOf('?') > -1) params.url += `&${_params}`
            else params.url += `?${_params}`
            delete opt.body
        }
        return fetch(`${options.base_url}${params.url}`, opt).then(res => res.json()).then(res => {
            if (res.code != 0) {
                options.err_proc(res)
                return
            }
            return res.data?.data || res?.data || res?.result || res
        })
    }
}

export default (option) => {
    const { url, ignore_path = [], err_handler = {} } = option
    const err_proc = (err) => {
        if (!err.code) throw err
        else if (err_handler[err.err_region]) { err_handler[err.err_region](err) }
        else err_handler.all(err)
    }
    init({ base_url: url, err_proc, ignore_path })
    const sub = (s) => new Proxy(s, {
        get(s, p, receiver) {
            if (['get', 'post', 'delete', 'patch', 'put'].indexOf(p) > -1) return (data) => req_cli({ url: `${s.path}`, method: p, data })
            else return sub({ path: `${s.path || ''}/${p}` })
        },
        set(s, p, v, receiver) { return false }
    })
    return sub({})
}