<template>
    <div class="card shadow-none">
        <input v-model="data.email" placeholder="请输入邮箱"
                        class="mt-2 p-2 w-full rounded-md border border-solid border-gray-100" />
        <div class="my-4">
            <div class="flex flex-wrap gap-2">
                <div @click="() => { item.checked = !item.checked; handle.changeTime(item, item.checked) }"
                    :class="{ 'bg-blue-100 border border-solid border-blue-300 text-blue-600': item.checked, 'bg-gray-50 border border-solid border-gray-300 text-gray-600': !item.checked }"
                    v-for="(item, index) in shareTimeTag" :key="index"
                    class="flex flex-row justify-center items-center px-3 py-1 rounded cursor-pointer">
                    {{ item.title }}
                </div>
            </div>
        </div>
        <div class="flex flex-wrap gap-2">
            <div @click="() => { item.checked = !item.checked; handle.changeAuth(index) }"
                :class="{ 'bg-blue-100 border border-solid border-blue-300 text-blue-600': item.checked, 'bg-gray-50 border border-solid border-gray-300 text-gray-600': !item.checked }"
                v-for="(item, index) in shareAuthTag" :key="index"
                class="flex flex-row justify-center items-center px-3 py-1 rounded cursor-pointer">
                {{ item.title }}
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive, defineExpose } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import _ from 'lodash'
const localEmail = useLocalStorage('share-email')
const shareAuthTag = ref([]), shareTimeTag = ref([]), data = reactive({
    email: localEmail
})
onMounted(() => {
    shareAuthTag.value = [
        { title: '读取', value: 'GET', checked: true },
        { title: '修改', value: 'PUT' },
        // { title: '删除', value: 'DELETE' }
    ]
    shareTimeTag.value = [
        { title: '10分钟', value: 10 },
        { title: '30分钟', value: 30 },
        { title: '1小时', value: 60 },
        { title: '3小时', value: 180 },
        { title: '1天', value: 60 * 24 },
        { title: '2天', value: 60 * 48 }
    ]
    data.email = ''
    data.time = 15
})

const handle = {
    changeTime: (tag, checked) => {
        shareTimeTag.value.map(i => {
            if (i.value != tag.value) i.checked = false
        })
    },
    changeAuth: (index) => {
        if (index == 0) shareAuthTag.value[0].checked = true
    }
}

defineExpose({
    auth: () => ({
        auth: shareAuthTag.value.filter(tag => tag.checked).map(tag => tag.value),
        email: data.email,
        time: _.get(_.findLast(shareTimeTag.value, q => q.checked), 'value')
    })
})
</script>