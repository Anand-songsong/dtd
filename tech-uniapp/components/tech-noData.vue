<template>
    <view class="no-data">
        <tech-icon type="icon-wushuju" size="100rpx" color="#9CA3AF" />
        <view class="no-data-text">{{ text }}</view>
    </view>
</template>
<script setup>
const props = defineProps({
    text: {
        type: String,
        default: '暂无数据'
    }
})
</script>
<style lang="scss" scoped>
.no-data{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 100rpx;
    height: 100%;
    .no-data-text{
        color: #9CA3AF;
        font-size: 28rpx;
        margin-top: 20rpx;
    }
}
</style>