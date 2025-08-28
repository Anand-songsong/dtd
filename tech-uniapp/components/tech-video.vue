<template>
    <view class="video-container">
        <video class="tech-video" :src="src" ref="videoRef" :id="videoId" @loadedmetadata="handleLoadeddata"></video>
        <!-- <view class="duration">{{ duration }}</view> -->
    </view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({
    src: {
        type: String,
        required: true
    }
})
const videoRef = ref(null)
const videoId = ref('video' + Math.random().toString(36).substring(2, 15))
const duration = ref(0)
const emits = defineEmits(['loadeddata'])

function handleLoadeddata(e) {
    // 视频时长要进行处理，duration数据返回的是秒钟，超过60s展示位xx：xx，小于60s展示为00：xx，去掉小数
    const durationSeconds = parseInt(e.detail.duration.toFixed(0))
    
    let formattedDuration = ''
    
    if (durationSeconds >= 3600) {
        // 超过1小时，显示为 xx:xx:xx 格式
        const hours = Math.floor(durationSeconds / 3600)
        const minutes = Math.floor((durationSeconds % 3600) / 60)
        const seconds = durationSeconds % 60
        formattedDuration = hours.toString().padStart(2, '0') + ':' + 
                           minutes.toString().padStart(2, '0') + ':' + 
                           seconds.toString().padStart(2, '0')
    } else if (durationSeconds >= 60) {
        // 超过60秒但小于1小时，显示为 xx:xx 格式，分钟补零
        const minutes = Math.floor(durationSeconds / 60)
        const seconds = durationSeconds % 60
        formattedDuration = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
    } else {
        // 小于60秒，显示为 00:xx 格式
        formattedDuration = '00:' + durationSeconds.toString().padStart(2, '0')
    }
    
    // 更新本地duration
    duration.value = formattedDuration
    
    // 发送事件给父组件
    emits('loadeddata', {
        duration: formattedDuration, 
        uniqueId: videoId.value, 
        src: props.src
    })
}
</script>
<style lang="scss" scoped>
.video-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.tech-video {
    width: 100%;
    height: 100%;
    position: relative;

}

.duration {
    position: absolute;
    bottom: -10rpx;
    right: 10rpx;
    color: #fff;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 20rpx;
    font-size: 24rpx;
    padding: 5rpx 10rpx;
}
</style>