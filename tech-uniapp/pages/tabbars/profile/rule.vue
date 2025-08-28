<template>
    <view class="rule">
        <tech-header title="用户服务协议" backgroundColor="#fff" titleColor="#000">
            <template #left>
                <tech-icon type="icon-xiangzuojiantou" size="30rpx" color="#000" @click="handleBack" />
            </template>
        </tech-header>
    </view>
</template>
<script setup>
function handleBack() {
    uni.navigateBack()
}
</script>
<style lang="scss" scoped>
.rule {
    background: var(--background-color);
    min-height: 100vh;
}
</style>