<template>
    <view class="tech-draggle">
        <view class="tech-draggle-item" v-for="(item, index) in modelValue" :key="index" :class="{
            'dragging': draggingIndex === index,
            'drag-over': dragOverIndex === index,
            'drag-preview': isDragging && draggingIndex !== index
        }" @tap="handleTap(index)" @touchstart="handleTouchstart($event, index)"
            @touchmove="handleTouchmove($event, index)" @touchend="handleTouchend($event, index)"
            @touchcancel="handleTouchcancel">
            <image :src="item" mode="aspectFill" class="tech-draggle-item-img" />
            <view class="tech-draggle-item-del" @click.stop="handleDel(item)">
                <tech-icon :type="delIcon" size="24rpx" color="#fff" />
            </view>
        </view>
        <view class="tech-draggle-item-add tech-draggle-item" v-if="showAddButton && maxCount >= modelValue.length" @click="handleAdd">
            <tech-icon type="icon-add-s" size="50rpx" color="#bbb" />
            <text class="tech-draggle-item-add-text">{{ showReorderTip ? '长按图片可拖动排序' : '点击添加图片' }}</text>
        </view>

        <!-- 拖拽预览层 -->
        <view v-if="isDragging && draggingIndex !== -1" class="drag-preview-layer" :style="dragPreviewStyle">
            <image :src="modelValue[draggingIndex]" mode="aspectFill" class="drag-preview-image" />
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, watch } from 'vue'
const emit = defineEmits(['del', 'update:modelValue', 'add', 'reorder'])
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    delIcon: {
        type: String,
        default: 'icon-shanchu'
    },
    maxCount: {
        type: Number,
        default: 9
    },
    showReorderTip: {
        type: Boolean,
        default: true
    }
})

// 获取全局方法
const { proxy } = getCurrentInstance()

// 拖拽状态管理
const draggingIndex = ref(-1)
const dragOverIndex = ref(-1)
const isDragging = ref(false)
const longPressTimer = ref(null)
const longPressDelay = 300 // 长按触发时间（毫秒）

// 监听数据变化，确保拖拽状态重置
watch(() => props.modelValue, (newVal, oldVal) => {
    if (newVal !== oldVal && isDragging.value) {
        isDragging.value = false
        draggingIndex.value = -1
        dragOverIndex.value = -1
    }
}, { deep: true })

// 触摸位置信息
const touchInfo = reactive({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0
})

// 拖拽预览样式
const dragPreviewStyle = computed(() => {
    if (!isDragging.value || draggingIndex.value === -1) return {}

    // 调整预览层位置，避免干扰位置计算
    const offsetX = 50 // 预览层宽度的一半
    const offsetY = 50 // 预览层高度的一半

    return {
        left: touchInfo.currentX - offsetX + 'px',
        top: touchInfo.currentY - offsetY + 'px',
        pointerEvents: 'none' // 确保预览层不接收事件
    }
})

// 是否显示添加按钮
const showAddButton = computed(() => {
    return !isDragging.value && props.modelValue.length < props.maxCount
})

// 删除图片
function handleDel(item) {
    emit('del', item)
}

// 添加图片
function handleAdd() {
    emit('add')
}

// 点击事件
function handleTap(index) {
    if (isDragging.value) {
        return
    }
    // 调用全局的previewImage方法
    proxy.previewImage(props.modelValue, index)
}

// 触摸开始
function handleTouchstart(event, index) {
    const touch = event.touches[0]
    touchInfo.startX = touch.clientX
    touchInfo.startY = touch.clientY
    touchInfo.currentX = touch.clientX
    touchInfo.currentY = touch.clientY
    touchInfo.startTime = Date.now()

    // 开始长按计时器
    longPressTimer.value = setTimeout(() => {
        startDrag(index)
    }, longPressDelay)
}

// 触摸移动
function handleTouchmove(event, index) {
    const touch = event.touches[0]
    touchInfo.currentX = touch.clientX
    touchInfo.currentY = touch.clientY

    // 如果还没开始拖拽，检查是否应该取消长按
    if (!isDragging.value) {
        const distance = Math.sqrt(
            Math.pow(touch.clientX - touchInfo.startX, 2) +
            Math.pow(touch.clientY - touchInfo.startY, 2)
        )

        // 如果移动距离超过阈值，取消长按
        if (distance > 10) {
            clearTimeout(longPressTimer.value)
        }
        return
    }

    // 如果正在拖拽，阻止默认行为
    event.preventDefault()

    // 计算拖拽位置
    updateDragPosition(index)
}

// 触摸结束
function handleTouchend(event, index) {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchInfo.startTime

    clearTimeout(longPressTimer.value)

    if (isDragging.value) {
        event.preventDefault()
        endDrag(index)
    }
}

// 触摸取消
function handleTouchcancel() {
    clearTimeout(longPressTimer.value)
    if (isDragging.value) {
        endDrag()
    }
}

// 开始拖拽
function startDrag(index) {
    // 确保状态完全重置
    isDragging.value = false
    draggingIndex.value = -1
    dragOverIndex.value = -1

    // 延迟一帧后开始新的拖拽
    setTimeout(() => {
        isDragging.value = true
        draggingIndex.value = index

        // 添加震动反馈（如果支持）
        if (uni.vibrateShort) {
            uni.vibrateShort()
        }
    }, 0)
}

// 更新拖拽位置
function updateDragPosition(currentIndex) {
    if (!isDragging.value) return

    // 计算当前触摸位置对应的索引
    const newIndex = calculateDropIndex(touchInfo.currentX, touchInfo.currentY)

    // 确保索引在有效范围内
    if (newIndex >= 0 && newIndex < props.modelValue.length && newIndex !== dragOverIndex.value) {
        dragOverIndex.value = newIndex
    }
}

// 计算放置位置
function calculateDropIndex(x, y) {
    // 获取屏幕信息
    const systemInfo = uni.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const rpxToPx = screenWidth / 750

    // 计算每个项目的实际尺寸（rpx转px）
    const itemWidth = screenWidth * 0.3 // 30%宽度
    const itemHeight = 200 * rpxToPx // 200rpx高度
    const margin = 20 * rpxToPx // 20rpx间距

    // 获取容器元素的实际位置
    let containerTop = 0
    let scrollTop = 0

    // #ifdef H5
    // H5环境下获取容器位置和滚动位置
    const container = document.querySelector('.tech-draggle')
    if (container) {
        const rect = container.getBoundingClientRect()
        containerTop = rect.top
        scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    }
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序环境下获取容器位置
    const query = uni.createSelectorQuery()
    query.select('.tech-draggle').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec((res) => {
        if (res && res[0]) {
            containerTop = res[0].top || 0
        }
        if (res && res[1]) {
            scrollTop = res[1].scrollTop || 0
        }
    })
    // #endif

    // 计算相对于容器的Y坐标
    const relativeY = y - containerTop

    // 计算行列
    const col = Math.floor(x / (itemWidth + margin))
    const row = Math.floor(relativeY / (itemHeight + margin))

    // 计算索引（每行3个）
    const calculatedIndex = row * 3 + col


    // 确保索引在有效范围内
    if (calculatedIndex >= 0 && calculatedIndex < props.modelValue.length) {
        return calculatedIndex
    }
    const offsets = [-50, -30, -20, -10, 0, 10, 20, 30, 50, 80, 100]

    for (let offset of offsets) {
        const testY = relativeY + offset
        const testCol = Math.floor(x / (itemWidth + margin))
        const testRow = Math.floor(testY / (itemHeight + margin))
        const testIndex = testRow * 3 + testCol

        if (testIndex >= 0 && testIndex < props.modelValue.length) {
            return testIndex
        }
    }

    // 如果还是超出范围，返回最后一个有效索引
    const lastValidIndex = props.modelValue.length - 1
    return lastValidIndex >= 0 ? lastValidIndex : -1
}

// 结束拖拽
function endDrag(index) {
    if (!isDragging.value) return

    const fromIndex = draggingIndex.value
    const toIndex = dragOverIndex.value

    // 执行排序
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        reorderItems(fromIndex, toIndex)
    } else {
        // 即使没有排序，也通知父组件拖拽结束
        emit('reorder', {
            fromIndex: fromIndex,
            toIndex: toIndex,
            newList: [...props.modelValue],
            movedItem: null,
            isReordered: false
        })
    }
    
    // 重置状态 - 确保完全重置
    setTimeout(() => {
        isDragging.value = false
        draggingIndex.value = -1
        dragOverIndex.value = -1
    }, 100)
}

// 重新排序
function reorderItems(fromIndex, toIndex) {
    const newList = [...props.modelValue]
    const item = newList.splice(fromIndex, 1)[0]
    newList.splice(toIndex, 0, item)
    
    // 更新本地数据
    emit('update:modelValue', newList)
    
    // 通知父组件拖拽排序完成
    emit('reorder', {
        fromIndex,
        toIndex,
        newList,
        movedItem: item,
        isReordered: true
    })
    
    // 等待数据更新后再重置状态
    setTimeout(() => {
    }, 50)
}
</script>

<style lang="scss" scoped>
.tech-draggle {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20rpx;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
    .tech-draggle-item-add {
        border: 2rpx dashed #d0d0d0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: #fafafa;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            border-color: var(--theme-color);
            background: rgba(var(--theme-color-rgb), 0.05);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .tech-draggle-item {
        position: relative;
        height: 200rpx;
        margin-bottom: 20rpx;
        border-radius: 10rpx;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &.dragging {
            opacity: 0.3;
            transform: scale(0.95);
        }

        &.drag-over {
            border: 2rpx dashed #007aff;
            background: rgba(0, 122, 255, 0.1);
            transform: scale(1.05);
        }

        &.drag-preview {
            opacity: 0.7;
            transform: scale(0.9);
        }

        .tech-draggle-item-img {
            width: 100%;
            height: 100%;
            border-radius: 16rpx;
        }

        .tech-draggle-item-del {
            position: absolute;
            top: 10rpx;
            right: 10rpx;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 50%;
            width: 50rpx;
            height: 50rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
    }

    .tech-draggle-item-add-text {
        font-size: 20rpx;
        color: #999;
        margin-top: 20rpx;
        position: absolute;
        bottom: -30rpx;
        left: 0;
        right:0;
        text-align: center;
    }

    .drag-preview-layer {
        position: fixed;
        width: 100rpx;
        height: 100rpx;
        z-index: 9999;
        
        .drag-preview-image {
            width: 100%;
            height: 100%;
            border-radius: 10rpx;
            box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
        }
    }
}
</style>