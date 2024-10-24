<template>
    <!-- <a-drawer class="" :closable="disabled.indexOf('close') != -1" style="background-color: rgba(10,10,10,0.8)" v-model:open="props.open" @close="handle.closePreview" width="100vw">
        <template #closeIcon>
            <div @click="myHandle.closePreview" class="p-2">
                <i class="ri-close-fill text-white text-[26px]"></i>
            </div>
        </template> -->
        <div class=" w-[80vw] h-screen">
            <div class="h-full grid grid-cols-4">
                <div class=" col-span-3">
                    <div class="w-full h-[100%] py-8 min-h-[600px] flex flex-col justify-between">
                        <div></div>
                        <div class="w-full flex flex-row justify-center items-center min-h-[600px]">
                            <img class="max-h-[70vh] object-scale-down" :src="data.fullUrl" />
                        </div>
                        <div class="w-full flex flex-row justify-center items-center gap-4 text-white text-[24px]">
                            <div class="p-2 cursor-pointer" @click="myHandle.clickBlock(props.data)">
                                <svg class="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z"></path></svg>
                            </div>
                            <div v-if="disabled.indexOf('close') != -1" class="p-2 cursor-pointer" @click="handle.delete">
                                <svg class="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h-full border-l-2 border-t-0 border-r-0 border-b-0 border-gray-300/70 border-solid col-span-1 px-[24px] pt-44 flex flex-col justify-start items-start gap-2 text-white">
                    <h2 class="text-base">文件详情</h2>
                    <div class="grid grid-cols-4 gap-4 text-[14px]" v-for="(col, index) in cols" :key="index">
                        <div class="col-span-1  min-w-[100px] flex items-center">{{ col.title }}</div>
                        <div class="col-span-3 flex items-center">{{ data[col.name] }}</div>
                    </div>
                </div>
            </div>
        </div>
    <!-- </a-drawer> -->
</template>
<script setup>
import { inject, defineProps, computed } from 'vue'
import _ from 'lodash'
import { fileSize } from '@/utils/file'
const myHandle = inject('my-handle')

const cols = [
    { title: '文件名', name: 'justName' },
    { title: '最后修改', name: 'lastModified' },
    { title: '文件大小', name: 'size' },
]

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Array,
        default: []
    },
    data: {
        type: Object,
        default: {
            "name": "101/top_cover.webp",
            "lastModified": "2023-12-11T06:41:04.000Z",
            "etag": "2B3A69FB2928A499938D084320C2F102",
            "size": 8806,
            "justName": "top_cover.webp",
            "type": "image",
            "fullUrl": "http://keep.store.f2i.cn/v1/101/top_cover.webp?blockid=9a0397850862ad5e772ea7331e23bfc7&ticket=QkoHLanaehzqMJ8c5wycwpqaGmOu0IkTq2p8zUN3VfGJmmuIGxElfJdYwoKPosQLhBpR5Pr9GgTNBvFhk3k6fTSRontQnyIdp0vpTUdLM3wBG8Q9yKg3N6iAQLkidQA5",
            "checked": false,
            "showBar": false
        }
    }
}), data = computed(() => {
    const _t = _.cloneDeep(props.data)
    // if (_t.lastModified) _t.lastModified = dateFormat(_t.lastModified)
    if (_t.size) _t.size = fileSize(_t.size)
    return _t
})

const handle = {
    delete: () => {
        myHandle.deleteFile(props.data.name)
        myHandle.closePreview()
    }
}
</script>