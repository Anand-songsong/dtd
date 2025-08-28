<template>
    <uni-popup ref="popup" @close="popupClose" :type="type" :borderRadius="type === 'center' ? '20rpx' : type === 'bottom' ? '20rpx 20rpx 0 0' : '0 0 20rpx 20rpx'">
        <view class="popup-content" :style="{height: height, width: width, borderRadius: type === 'center' ? '20rpx' : type === 'bottom' ? '20rpx 20rpx 0 0' : '0 0 20rpx 20rpx'}">
            <slot></slot>
        </view>
    </uni-popup>
</template>
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['open', 'close', 'popupClose'])
const props = defineProps({
    type: {
        type: String,
        default: 'bottom'
    },
    height: {
        type: String,
        default: '300rpx'
    },
    width: {
        type: String,
        default: '100%'
    }
})
const popup = ref(null)

const open = () => {
    popup.value.open()
    emit('open')
}
const close = () => {
    popup.value.close()
    emit('close')
}
const popupClose = () => {
    emit('popupClose')
    emit('close')
}
defineExpose({
    open,
    close
})
</script>
<style lang="scss" scoped>
.popup-content {
    background: #fff;
    padding: 20rpx;
}
</style>