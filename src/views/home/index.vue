<template>
    <a-layout>
        <a-layout-header>

        </a-layout-header>
        <a-layout-content>
            <a-card :bordered="false">
                <template #title>
                    {{ time }} · 欢迎回来
                </template>
            </a-card>
            <!-- <a-space size="large">
                <a-statistic title="Downloads" :value="125670" show-group-separator />
                <a-statistic extra="Comments" :value="40509" :precision="2" />
            </a-space> -->
        </a-layout-content>
    </a-layout>
</template>
<script setup>
import moment from 'moment'
const time = moment().format('YYYY-MM-DD')
</script>
