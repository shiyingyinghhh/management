import _ from 'lodash'
import config from '@/setting/index'
export const default_block = {
    id: '20744204ea0dba1528559f3bfa29ee2e',
    ticket: 'FrV%2FDNy5Ie4pVlbP8yVB4x0ujOAimIDVBhltBycmGRoPQCrn8GVKwrNAXTfhgcFHhBpR5Pr9GgTNBvFhk3k6fTSRontQnyIdp0vpTUdLM3wBG8Q9yKg3N6iAQLkidQA5',
}


export const assets_block = {
    "id": "7033004cfee0774cde9cfe93d9967748",
    "ticket": "pAzVsg0oitZ9psE3Nbv1jHXkp7%2BIrHVyqG0v3fpRq16EgGibdVBgqkzH5hqeAjVFhBpR5Pr9GgTNBvFhk3k6fTSRontQnyIdp0vpTUdLM3wBG8Q9yKg3N6iAQLkidQA5"
}


export const baseUrl = config.block_url
export const defineProxy = (origin) =>
    new Proxy(origin, {
        get: (target, p) => {
            if(!_.get(target, p, false)) _.set(target, p, {})
            return defineProxy(_.get(target, p))
        },
        set: (target, p, v) => _.set(target, p, v)
    })

export const defineReqPath = ({ path = '' }) => new Proxy({ path }, {
    get: (target, p) => { 
        if (p == 'value') return target.path
        return defineReqPath({ path: `${target.path}/${p}` })
    },
    set: () => { },
})

export const builder = {
    path: defineReqPath({ path: baseUrl }),
    header: (id, ticket, title) => _.pickBy({
        'x-store-blockid': id || default_block.id,
        'x-store-ticket': ticket || default_block.ticket,
        'x-store-meta-title': title,
        'Content-Type': 'application/json;charset=utf-8'
    })
}

export const block = {
    create: (params) => {
        return fetch(builder.path.block.value, {
            method: 'POST',
            headers: builder.header(),
            body: JSON.stringify(params)
        })
    },
    list: ({ prefix, maxKeys, nextToken }, options = {}) => {
        return fetch(builder.path.block.list.value + `?prefix=${prefix}&max_keys=${maxKeys}${ nextToken ? `&next_token=${nextToken}` : '' }`, {
            method: 'GET',
            headers: builder.header(options.id, options.ticket),
        })
    },
    search: (params, options = {}) => {
        const _params = _.toPairs(params).map(i => {
            const _p = { field: i[0] }
            if (typeof i[1] == 'object') {
                const keys = Object.keys(i[1])
                if(!keys.length) return null
                _p.operation = keys[0]
                _p.value = i[1][keys[0]]
            } else {
                _p.value = i[1]
            }
            return _p
        }).filter(q=>!!q)
        return fetch(builder.path.block.search.value, {
            method: 'POST',
            headers: builder.header(options.id, options.ticket),
            body: JSON.stringify({ metas: _params })
        })
    },
    auth: (params) => {
        return fetch(builder.path.block.authorize.value, {
            method: 'POST',
            headers: builder.header(options.id, options.ticket),
            body: JSON.stringify(params)
        })
    },
    hooks: (params) => {
        return fetch(builder.path.block.hooks.value, {
            method: 'POST',
            header: builder.header(options.id, options.ticket),
            body: JSON.stringify(params)
        })
    },

    front_end_save: (key, options = {}) => {
        return fetch(builder.path[key].value, {
            method: 'POST',
            headers: {
                ...builder.header(options.id, options.ticket),
                front_end: true,
                'Content-Type': `text/plain;chartset=utf-8`
            },
            body: ''
        })
    },

    save: (key, content, options = {}) => {
        const opt = {}
        if(content instanceof File) opt.type = content.type
        return fetch(builder.path[key].value, {
            method: 'PUT',
            headers: {
                ...builder.header(options.id, options.ticket),
                'Content-Type': `${content instanceof String ? 'text/plain' : opt.type};chartset=utf-8`
            },
            body: new Blob([content], opt)
        })
    },

    save_normal: (url, content, options = {}) => {
        const opt = {}
        if(content instanceof File) opt.type = content.type
        return fetch(url, {
            method: 'PUT',
            headers: {
                ...builder.header(options.id, options.ticket, options.title),
                'Content-Type': 'text/plain;chartset=utf-8'
            },
            body: new Blob([content], opt)
        })
    },

    front_end_get: (key, options = {}) => {
        return fetch(builder.path[key].value, {
            method: 'GET',
            headers: {
                ...builder.header(options.id, options.ticket),
                front_end: true
            }
        })
    },

    get: (key, options = {}) => {
        return fetch(builder.path[key].value, {
            method: 'GET',
            headers: builder.header(options.id, options.ticket)
        })
    },

    get_normal: (url, options = {}) => {
        return fetch(url, {
            headers: url.indexOf('ticket') == -1 ? builder.header(options.id, options.ticket) : {}
        })
    },

    del: (key, options = {}) => {
        return fetch(builder.path[key].value, {
            method: 'DELETE',
            headers: builder.header(options.id, options.ticket, options.title)
        })
    },

    curl: (key, options = {}) => {
        return builder.path[`${key}?blockid=${options.id || default_block.id}&ticket=${options.ticket || default_block.ticket}`].value
    },

    download: (key, filename = new Date().getTime(), options = {}) => {
        return fetch(builder.path[key].value, {
            method: 'GET',
            headers: builder.header(options.id, options.ticket)
        }).then(res => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(res instanceof Blob ? res : new Blob([res]))
            link.download = filename
            link.click()
            URL.revokeObjectURL(link.href)
        })
    },

    builder: {
        full: (key) => `${baseUrl}/$${key}`,
        create: defineProxy({
            pid: '',
            fingerprint: {
                email: '',
                level: 1,
            },
            attr: {
                title: '',
                description: '',
            },
        })
    }
}