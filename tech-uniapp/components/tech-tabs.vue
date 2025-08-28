<template>
    <view class="tabs" :style="{ width }">
        <view class="tab" v-for="item, index in tabs" :key="index" :class="{ active: index === activeIndex }"
            @click="changeTab(index)">{{ item.name }}</view>
        <view
          class="tab-underline"
          :style="{
            width: 100 / tabs.length + '%',
            transform: `translateX(${activeIndex * 100}%)`
          }"
        />
    </view>
</template>
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['change'])
const props = defineProps({
    tabs: {
        type: Array,
        default: () => []
    },
    width: {
        type: String,
        default: '100vw'
    },
    propIndex: {
        type: Number,
        default: 0
    }
})
const activeIndex = ref(props.propIndex)
function changeTab(index) {
    activeIndex.value = index
    emit('change', index)
}
</script>
<style lang="scss" scoped>
.tabs {
    position: relative;
    display: flex;
    justify-content: space-between;
    background: #fff;
    .tab {
        color: #333;
        font-size: 16px;
        padding: 10px 0;
        width: 33.3%;
        text-align: center;
        padding-bottom: 30rpx;
        border-bottom: 2px solid #E5E7EB;
        position: relative;
        z-index: 1;
    }
    .active {
        color: var(--theme-color);
        border-bottom: none;
    }
    .tab-underline {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        background: var(--theme-color);
        border-radius: 2px;
        transition: transform 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 2;
    }
}
</style>