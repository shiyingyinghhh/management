<template>
    <div class="flex-1 grid grid-cols-12 rounded-md px-4 py-8 gap-4 bg-white">
        <div class="col-span-12">
           <My class="min-h-[200px]" :data="data"></My>
        </div>
    </div>
</template>
<script setup>
import { provide, defineProps, reactive, onMounted } from 'vue'
import { block } from '@/utils/block'
import Menu from './menu.vue'
import My from './my.vue'

const props = defineProps({
    pid: {
        type: String,
        default: '101'
    },
    blockId: {
        type: String,
        default: ''
    },
    blockTicket: {
        type: String,
        default: ''
    },
})
provide('props', props)
provide('block', block)

//load list
const data = reactive({
    res: { objects: [] },
    params: {
        prefix: `${props.pid.endsWith('/') ? props.pid : `${props.pid}/`}`,
        maxKeys: 10,
        nextToken: ''
    }
})
const loadList = () => {
    block.list(data.params, { id: props.blockId, ticket: props.blockTicket })
        .then(res => {
            data.params.nextToken = res.nextToken
            data.res = res
            data.res.objects.map(async i => {
                i.justName = i.name.substring(i.name.lastIndexOf('/') + 1)
                i.type = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].indexOf(i.name.substring(i.name.lastIndexOf('.'))) != -1 ? 'img' : 'file'
                if (i.type == 'img') {
                    try { i.url = await block.curl(i.name, { id: props.blockId, ticket: props.blockTicket }) } catch (error) { }
                }
                return i
            })
        })
}

onMounted(() => {
    loadList()
})

</script>