<template>
  <div class="w-[175px] h-[170px] flex flex-col justify-between items-center">
    <div class="w-[90px] h-[90px] mt-2  rounded-md cursor-pointer">
      <img @click="handle.clickBlock" class="w-[90px] h-[90px] object-scale-down cursor-pointer rounded-md"
        :src="data.fullUrl">
    </div>
    <div class="w-full h-[60px] flex flex-col justify-center items-center">
      <span class="truncate cursor-pointer">
        {{ data.justName }}
      </span>
      <span class="mt-1 text-[12px] leading-3 text-gray-400">{{ data.lastModified || '' }}</span>
      <span class="mt-1 text-[12px] leading-3 text-gray-400">{{ data.size ? fileSize(data.size) : '' }}</span>
    </div>
  </div>
</template>
<script setup>
import { defineProps, inject, computed } from 'vue'
const myHandle = inject('my-handle')

const props = defineProps({
  data: {
    type: Object,
    default: {
      type: '',
      justName: '',
      title: '',
      lastModified: ''
    }
  }
})

const data = computed(() => props.data)

const handle = {
  clickBlock: () => {
    if(props.data.type == 'dir') myHandle.clickBlock(props.data)
    else myHandle.preview(props.data)
  }
}

</script>
