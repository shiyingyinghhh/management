
<script setup>
import { inject, ref, reactive, computed, watch, onMounted, provide } from 'vue'
import _, { isNull } from 'lodash'
import { block } from '@/utils/block'
import Block from './block.vue'
import Share from './share.vue'
import Preview from './preview.vue'

const props = inject('props')

const msgApi = {
    info: alert,
    error: alert,
}

const refShare = ref()

const data = reactive({
    res: { objects: [] }
}), options = reactive({
    contentType: 'card',
    spinning: false,
    checkedAll: false,
    params: {
        prefix: `${props.pid ? `${props.pid}/` : ''}`,
        maxKeys: 12,
        nextToken: ''
    },
    nextTokens: [],
    nomore: false,

    create: {
        open: false,
        data: ''
    },
    search: {},
    showBar: false,

    listCols: [
        { title: '', dataIndex: 'name', key: 'checked', width: 20 },
        { title: '文件名', dataIndex: 'justName', key: 'justName', width: '40vw' },
        { title: '修改时间', dataIndex: 'lastModified', key: 'lastModified' },
        { title: '大小', dataIndex: 'size', key: 'size' }
    ],

    share: {
        open: false,
        data: null,
        spinning: false
    },
    preview: {
        open: false
    }
})

const showBatch = computed(() => _.get(data, 'res.objects', []).filter(q => q.checked).length)
const bread = computed(() => options.params.prefix.split('/').filter(q => q != props.pid && !!q))

watch(() => options.search.key, (val) => {
    if (!val) {
        handle.load()
    }
})

const handle = {
    load: () => {
        options.spinning = true
        options.checkedAll = false
        options.showBar = false
        const _params = _.cloneDeep(options.params)
        if (options.search.key) {
            _params.prefix = `${_params.prefix.endsWith('/') ? _params.prefix : `${_params.prefix}/`}${options.search.key}`
        }
        block.list(_params, { id: props.blockId, ticket: props.blockTicket })
            .then(res => {
                options.params.nextToken = res.nextToken
                options.nextTokens.push(res.nextToken)
                options.nomore = res.objects.length < 10
                res.objects = res.objects.map(i => {
                    if (!i.lastModified) {
                        let justName = i.name.replace(options.params.prefix, '')
                        return {
                            justName: justName.substring(0, justName.length > 1 ? justName.length - 1 : 1),
                            type: 'dir',
                            fullUrl: 'https://prod-oss.mcga.com.cn/project-station/_static/icon-disk-dir.png',
                            name: i.name,
                            checked: false,
                            showBar: false
                        }
                    } else {
                        i.justName = i.name.replace(options.params.prefix, '')
                        const key = i.justName.substring(i.justName.lastIndexOf('.'))
                        i.type = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].indexOf(key) != -1 ? 'image' : 'file'
                        if (i.type == 'image') {
                            i.fullUrl = block.curl(i.name, { id: props.blockId, ticket: props.blockTicket })
                        } else {
                            i.fullUrl = 'https://prod-oss.mcga.com.cn/project-station/_static/icon-disk-file.png'
                        }
                        i.checked = false
                        i.showBar = false
                        i.lastModified = dateFormat(i.lastModified)
                        return i
                    }
                })
                data.res = res
            }).finally(() => {
                options.spinning = false
            })
    },
    nextPage: () => {
        handle.load()
    },
    prePage: () => {
        _.set(options, 'params.nextToken', options.nextTokens.length >= 2 ? options.nextTokens[options.nextTokens.length - 3] : '')
        options.nextTokens.pop()
        handle.load()
    },
    toDir: (index) => {
        const prefix = [props.pid]
        for (let i = 0; i < bread.value.length; i++) if (index > i) prefix.push(bread.value[i])
        prefix.push('')
        options.params.prefix = prefix.join('/')
        handle.load()
    },
    search: () => {
        handle.load()
    },
    checkedItem: (index) => {
        _.delay(() => {
            options.checkedAll = _.get(data, `res.objects`).filter(q => q.checked).length == _.get(data, `res.objects`).length
            options.showBar = _.get(data, `res.objects`).filter(q => q.checked).length > 0
        }, 100)
    },
    checkedAllSwitch: () => {
        options.checkedAll = !options.checkedAll
        options.showBar = options.checkedAll
        _.get(data, 'res.objects').map(i => {
            i.checked = options.checkedAll
            return i
        })
    },
    check2Upload: () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.addEventListener('change', (e) => {
            const file = _.get(e, 'target.files.0')
            if (!file) return
            const { name } = file
            block.save(`${options.params.prefix}${name}`, file, {
                id: props.blockId,
                ticket: props.blockTicket,
                title: name
            }).then(res => {
                _.delay(handle.load, 200)
                msgApi.info('上传成功')
            })
        })
        input.click()
    },
    createDir: () => {
        if (!options.create.data) {
            msgApi.error('文件夹名称不能为空')
            return
        }
        block.save(`${options.params.prefix}${options.create.data}/`, isNull, {
            id: props.blockId,
            ticket: props.blockTicket,
            title: encodeURIComponent(options.create.data)
        }).then(res => {
            _.delay(handle.load, 200)
            msgApi.info('新建成功')
        })
        options.create.data = ''
        options.create.open = false
    },
    clickBlock: (item) => {
        if (item.type == 'dir') {
            options.params.prefix = `${options.params.prefix}${item.justName}/`
            handle.load()
        } else {
            //process click file
            item = toRaw(item)
            block.download(item.name, item.justName, { id: props.blockId, ticket: props.blockTicket })
        }
    },
    deleteFile: async (name) => {
        await block.del(name, { id: props.blockId, ticket: props.blockTicket })
        msgApi.info('操作成功')
        handle.load()
    },
    deleteFiles: async () => {
        const rms = _.get(data, 'res.objects', []).filter(q => q.checked)
        for (let index = 0; index < rms.length; index++) {
            const item = rms[index]
            await block.del(item.name, { id: props.blockId, ticket: props.blockTicket })
        }
        msgApi.info('操作成功')
        handle.load()
    },
    openShare: (object) => {
        options.share.open = true
        options.share.spinning = false
        options.share.data = object
    },
    shareFiles: async (object) => {
        options.share.spinning = true
        const { auth, email, time } = refShare.value.auth()
        const errBack = (msg) => {
            options.share.spinning = false
            msgApi.error(msg)
            return
        }
        const success = () => {
            msgApi.info('分享成功')
            options.share.spinning = false
            options.share.open = false
        }
        if (auth.length == 0) errBack('请选择分享授权')
        // else if (!email) errBack('请填写邮箱') 
        else if (!time) errBack('请选择分享有效时间')
        else {
            if (object) {
                const preference = { expires: new Date().getTime() + time * 60 * 1000 }
                if (email) _.set(performance, 'email', email)
                block.auth({
                    statement: `${object.name}:${auth.join('|')}`,
                    preference
                }, { id: props.blockId, ticket: props.blockTicket })
                    .then(res => {
                        options.share.data = null
                        const { id, ticket } = res
                        console.log('res', res);
                        console.log(`http://localhost:3002/#/bt/disk/share?pid=${object.name}&id=${id}&ticket=${ticket}`);
                        success()
                    })
            } else {
                //batch
                errBack('暂不支持批量分享')
            }
        }
    },
    handleTableRow: (record) => {
        return {
            onMouseenter: () => record.showBar = true,
            onMouseleave: () => record.showBar = false
        }
    },
    preview: (object) => {
        options.preview.open = true
        options.preview.data = object
        document.getElementById('previewLabel').click()
    },
    closePreview: () => {
        options.preview.open = false
        options.preview.data = {}
    }
}

onMounted(() => {
    handle.load()
})

provide('my-handle', handle)

</script>

<template>
    <div class="flex-1 w-full min-h-[200px] pt-2" :class="{ 'drawer drawer-end': options.preview.open }">
        <div class="card">
            <div class="w-full h-[20px] mb-8 px-1.5 flex flex-row justify-between items-center rounded bg-inherit">
                <div class="flex flex-row justify-start items-center gap-4">
                    <div @click="handle.check2Upload"
                        class=" w-20 flex flex-row justify-center text-center py-1 tracking-widest bg-blue-500 text-white cursor-pointer transition hover:ring-1 text-[14px]">
                        <i class="ri-upload-2-line px-0.5"></i>
                        <span>上传</span>
                    </div>
                    <div onclick="newDir.showModal()"
                        class=" w-20 flex flex-row justify-center text-center py-1 tracking-widest bg-gray-100 cursor-pointer transition hover:ring-1 text-[14px]">
                        <i class="ri-add-line px-0.5"></i>
                        <span>新建</span>
                    </div>
                </div>
                <div class="flex flex-row justify-start items-center gap-4">
                    <div class="relative">
                        <label for="Search" class="sr-only"> 搜索文件 </label>
                        <input type="text" id="Search" v-model="options.search.key" placeholder="搜索文件"
                            class="w-full rounded-md outline-none border-gray-200 border-solid focus:border-blue-300 border py-2 shadow-sm px-2 min-w-[300px]" />
                        <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                            <button type="button" class="text-gray-600 hover:text-gray-700" @click.stop="handle.search">
                                <span class="sr-only">搜索文件</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                    stroke="currentColor" class="h-4 w-4">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </button>
                        </span>
                    </div>
                </div>
            </div>

            <div class="w-full h-[20px] mb-6 px-1.5 flex flex-row justify-between items-center rounded bg-inherit">
                <div class="text-[18px]">我的文件</div>
                <div class="flex flex-row justify-end items-center">
                    <!-- <div class="flex flex-row items-center px-1.5 py-0.5 rounded bg-gray-50 cursor-pointer">
                        <i class="ri-sort-desc text-[16px] px-0.5"></i>
                        <span>文件名</span>
                    </div> -->
                    <div class="ml-1 flex flex-row items-center rounded py-0.5 text-[16px] bg-gray-50 transition gap-[4px]">
                        <div @click="options.contentType = 'list'"
                            :class="{ 'text-neutral-900 bg-gray-200': options.contentType == 'list', 'hover:bg-gray-200 hover:text-neutral-900': options.contentType != 'list' }"
                            class="px-1 text-gray-500 rounded cursor-pointer">
                            <i class="ri-list-check"></i>
                        </div>
                        <div @click="options.contentType = 'card'"
                            :class="{ 'text-neutral-900 bg-gray-200': options.contentType == 'card', 'hover:bg-gray-200 hover:text-neutral-900': options.contentType != 'card' }"
                            class="px-1 text-gray-500 rounded cursor-pointer">
                            <i class="ri-layout-grid-fill"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full h-[20px] mb-6 px-1.5 flex flex-row justify-start items-center rounded bg-inherit">
                <div v-if="options.params.prefix != `${props.pid}/`" @click="handle.toDir(bread.length - 1)"
                    class="text-blue-500 cursor-pointer mr-4">返回上一级</div>
                <div class="text-blue-500 flex flex-row justify-start items-center" v-for="(_bread, _index) in bread"
                    :key="_index">
                    <div class="cursor-pointer" v-if="_index == 0"
                        @click="options.params.prefix = `${props.pid}/`; handle.load()">我的文件</div>
                    <div class="px-2">></div>
                    <div :class="{ 'cursor-pointer': _index != bread.length - 1 }" @click="handle.toDir(_index + 1)">{{
                        _bread }}</div>
                </div>
            </div>

            <div class="w-full h-[20px] mb-3 px-1.5 flex flex-row justify-between items-center rounded bg-inherit">
                <div v-if="options.contentType == 'card'">
                    <div class="form-control">
                        <label class="label cursor-pointer gap-2 items-center">
                            <span class="label-text text-[12px]">全选</span>
                            <input type="checkbox" :checked="options.checkedAll" @click="handle.checkedAllSwitch"
                                class="checkbox rounded w-[18px] h-[18px]" />
                        </label>
                    </div>
                </div>
                <div>
                    <div v-if="showBatch" class="flex flex-row justify-end items-center">
                        <div
                            class="flex justify-center text-blue-500 items-center py-1 px-1 rounded-lg cursor-pointer hover:text-orange-400">
                            <i class="ri-share-line text-[18px]"></i>
                        </div>
                        <!-- <a-popconfirm title="确认删除所选内容？" ok-text="是的" cancel-text="取消" @confirm="handle.deleteFiles()">
                            <div
                                class="flex justify-center text-red-500 items-center py-1 px-1 rounded-lg cursor-pointer hover:text-orange-400">
                                <i class="ri-delete-bin-line text-[18px]"></i>
                            </div>
                        </a-popconfirm> -->
                        <span class="ml-1 text-gray-500 text-[14px]">批量操作</span>
                    </div>
                </div>
            </div>


            <div v-if="options.contentType == 'card'" class=" flex-1">
                <div class="flex flex-wrap gap-8">
                    <div class="w-[175px] h-[220px] rounded-md transition shadow-sm hover:bg-gray-50"
                        v-for="(item, index) in data.res.objects" :key="index" @mouseenter="item.showBar = true"
                        @mouseleave="item.showBar = false">
                        <div v-if="!options.showBar && !item.showBar"
                            class="w-full h-[30px] flex flex-row justify-between items-center pt-3 px-1.5 mb-2"></div>
                        <div v-else class="w-full h-[30px] flex flex-row justify-between items-center pt-3 px-1.5 mb-2">
                            <input type="checkbox" class="checkbox pl-1.5 ml-2 w-[18px] h-[18px] rounded"
                                :checked="item.checked"
                                @click="() => { item.checked = !item.checked; handle.checkedItem(index) }" />
                            <div
                                class="flex h-[30px] text-[18px] font-medium text-blue-500 bg-white rounded-md px-1.5 gap-2">
                                <div @click="handle.openShare(item)" onclick="share.showModal()"
                                    class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path
                                            d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z">
                                        </path>
                                    </svg>
                                </div>
                                <div v-if="item.type != 'dir'" @click="handle.clickBlock(item)"
                                    class="flex justify-center items-center p  y-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path
                                            d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z">
                                        </path>
                                    </svg>
                                </div>
                                <div
                                    class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path
                                            d="M4.5 10.5C3.675 10.5 3 11.175 3 12C3 12.825 3.675 13.5 4.5 13.5C5.325 13.5 6 12.825 6 12C6 11.175 5.325 10.5 4.5 10.5ZM19.5 10.5C18.675 10.5 18 11.175 18 12C18 12.825 18.675 13.5 19.5 13.5C20.325 13.5 21 12.825 21 12C21 11.175 20.325 10.5 19.5 10.5ZM12 10.5C11.175 10.5 10.5 11.175 10.5 12C10.5 12.825 11.175 13.5 12 13.5C12.825 13.5 13.5 12.825 13.5 12C13.5 11.175 12.825 10.5 12 10.5Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <Block :data="item"></Block>
                    </div>
                </div>
            </div>

            <div class="flex flex-row justify-end px-8 items-end">
                <div class=" inline-flex items-center justify-center rounded py-1 gap-3 text-black">
                    <a :class="{ 'pointer-events-none text-gray-500': options.nextTokens.length == 1 }"
                        @click="handle.prePage"
                        class="inline-flex h-8 w-8 items-center justify-center border rounded-md rtl:rotate-180">
                        <span class="sr-only"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </a>
                    <div>
                        <label for="PaginationPage" class="sr-only"></label>
                        <span class="text-lg">{{ options.nextTokens.length }}</span>
                    </div>
                    <a :class="{ 'pointer-events-none text-gray-500': options.nomore }" @click="handle.nextPage"
                        class="inline-flex border rounded-md h-8 w-8 items-center justify-center rtl:rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- <a-spin v-else :spinning="options.spinning">
                <a-table :dataSource="data.res.objects" :columns="options.listCols" :customRow="handle.handleTableRow">
                    <template #headerCell="{ column }">
                        <template v-if="column.key === 'checked'">
                            <a-checkbox v-model:checked="data.checkedAll"
                                @click.stop="handle.checkedAllSwitch"></a-checkbox>
                        </template>
                    </template>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'checked'">
                            <a-checkbox v-model:checked="record.checked" @change="handle.checked"></a-checkbox>
                        </template>
                        <template v-else-if="column.key === 'justName'">
                            <div class="flex flex-row justify-between items-center">
                                <div class=" flex flex-row justify-start items-center gap-2">
                                    <div class="w-[30px] h-[30px] cursor-pointer">
                                        <img class="w-full h-full object-scale-down cursor-pointer" :src="record.fullUrl" />
                                    </div>
                                    <div> {{ record.justName }} </div>
                                </div>
                                <div>
                                    <div v-if="!options.showBar && !record.showBar"
                                        class="flex h-[30px] text-[18px] font-medium text-blue-500 px-1.5 gap-2"></div>
                                    <div v-else class="flex h-[30px] text-[18px] font-medium text-blue-500 px-1.5 gap-2">
                                        <div v-if="record.type == 'dir'" @click.stop="handle.clickBlock(record)"
                                            class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                            <i class="ri-corner-down-right-line"></i>
                                        </div>
                                        <div
                                            class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                            <i class="ri-share-line"></i>
                                        </div>
                                        <div v-if="record.type != 'dir'" @click.stop="handle.clickBlock(record)"
                                            class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                            <i class="ri-download-line"></i>
                                        </div>
                                        <div
                                            class="flex justify-center items-center py-0.5 px-0.5 rounded-lg cursor-pointer hover:text-orange-400">
                                            <i class="ri-more-line"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="column.key === 'lastModified'">
                            {{ record.lastModified ? dateFormat(record.lastModified) : '' }}
                        </template>
                        <template v-else-if="column.key === 'size'">
                            {{ record.size ? fileSize(record.size) : '' }}
                        </template>
                    </template>
                </a-table>
            </a-spin> -->
        </div>
        <dialog id="newDir" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box">
                <h3 class="font-bold text-lg">新建目录</h3>
                <div class="flex flex-1 my-4">
                    <input v-model="options.create.data" placeholder="请输入目录名称..."
                        class="mt-2 p-2 w-full rounded-md border border-solid border-gray-100" />
                </div>
                <div class="modal-action">
                    <form method="dialog">
                        <div class="flex-1 flex justify-end items-center gap-2">
                            <button
                                class="flex px-8 py-2 rounded justify-center items-center border border-solid border-gray-100 cursor-pointer transition ease-in-out hover:shadow select-none">
                                取消</button>
                            <button @click="handle.createDir"
                                class="flex px-8 py-2 rounded justify-center items-center bg-blue-600 text-white cursor-pointer transition ease-in-out hover:shadow select-none">
                                确认</button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
        <dialog id="share" class="modal modal-bottom sm:modal-middle bg-white">
            <h3 class="font-bold text-lg">分享设置</h3>
            <div class="flex flex-1 my-4">
                <share ref="refShare"></share>
            </div>
            <div class="modal-action">
                <form method="dialog">
                    <div class="flex-1 flex justify-end items-center gap-2">
                        <button
                            class="flex px-8 py-2 rounded justify-center items-center border border-solid border-gray-100 cursor-pointer transition ease-in-out hover:shadow select-none">
                            取消</button>
                        <button @click="handle.shareFiles(options.share.data)"
                            class="flex px-8 py-2 rounded justify-center items-center bg-blue-600 text-white cursor-pointer transition ease-in-out hover:shadow select-none">
                            确认</button>
                    </div>
                </form>
            </div>
        </dialog>
        <!-- <div class="drawer drawer-end"> -->
        <input id="preview" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
            <label id="previewLabel" for="preview" class="drawer-button"></label>
        </div>
        <div class="drawer-side">
            <label for="preview" aria-label="close sidebar" class="drawer-overlay"></label>
            <preview :open="options.preview.open" :data="options.preview.data"></preview>
        </div>
        <!-- </div> -->
</div></template>