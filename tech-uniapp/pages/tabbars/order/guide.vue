<template>
    <view class="guide-page">
        <web-view :src="routeUrl" style="width:100vw;height:100vh;" />
    </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { MAP_KEY, referer } from '@/config'
const routeUrl = ref('')

onLoad((query) => {
    // 终点经纬度和名称
    const { lat, lng, name, slat, slng } = query
    // 腾讯地图key和referer（请替换为你自己的）
    const key = MAP_KEY
    // 组装url，支持用户选择交通方式
    routeUrl.value = `https://apis.map.qq.com/tools/routeplan/eword=${name}&epointx=${lng}&epointy=${lat}&spointx=${slng}&spointy=${slat}&?referer=${referer}&key=${key}`
})
</script>