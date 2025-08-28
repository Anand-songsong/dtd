<template>
    <view class="tech-header" :style="headerStyle">
        <!-- 状态栏占位 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
        
        <!-- 头部内容区域 -->
        <view class="header-content" :style="contentStyle">
            <!-- 左侧插槽或图标，仅有内容时渲染 -->
            <template v-if="$slots.left">
                <view class="header-left">
                    <slot name="left"></slot>
                </view>
            </template>
            <template v-else-if="leftIcon && leftIcon !== 'none'">
                <view class="header-left-icon" @click="handleLeftClick">
                    <uni-icons :type="leftIcon" size="44rpx" :color="iconColor" />
                </view>
            </template>

            <!-- 标题区域，绝对居中 -->
            <view class="header-title" :style="titleStyle" @click="handleTitleClick">
                <text v-if="title" class="title-text">{{ title }}</text>
                <slot v-else name="title"></slot>
            </view>

            <!-- 右侧插槽或图标，仅有内容时渲染 -->
            <template v-if="$slots.right">
                <view class="header-right">
                    <slot name="right"></slot>
                </view>
            </template>
            <template v-else-if="rightIcon && rightIcon !== 'none'">
                <view class="header-right-icon" @click="handleRightClick">
                    <uni-icons :type="rightIcon" size="44rpx" :color="iconColor" />
                </view>
            </template>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 定义组件属性
const props = defineProps({
    // 背景色
    backgroundColor: {
        type: String,
        default: 'linear-gradient(90deg, var(--theme-color) 0%, var(--theme-color-linear) 100%)'
    },
    // 标题
    title: {
        type: String,
        default: ''
    },
    // 标题颜色
    titleColor: {
        type: String,
        default: '#fff'
    },
    // 标题字体大小
    titleSize: {
        type: String,
        default: '32rpx'
    },
    // 标题是否加粗
    titleBold: {
        type: Boolean,
        default: false
    },
    // 整个header的高度
    height: {
        type: String,
        default: '88rpx'
    },
    // 内容区域的marginTop
    marginTop: {
        type: String,
        default: '0'
    },
    // 左侧图标
    leftIcon: {
        type: String,
        default: ''
    },
    // 右侧图标
    rightIcon: {
        type: String,
        default: ''
    },
    // 图标颜色
    iconColor: {
        type: String,
        default: '#fff'
    },
    // 是否显示状态栏
    showStatusBar: {
        type: Boolean,
        default: true
    }
})

// 定义事件
const emit = defineEmits(['leftClick', 'rightClick', 'titleClick'])

// 状态栏高度
const statusBarHeight = ref(0)

// 计算头部样式
const headerStyle = computed(() => {
    return {
        background: props.backgroundColor,
        height: props.showStatusBar ? `calc(${props.height} + ${statusBarHeight.value}px)` : props.height
    }
})

// 计算内容区域样式
const contentStyle = computed(() => {
    return {
        marginTop: props.marginTop,
        height: props.height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

// 计算标题样式
const titleStyle = computed(() => {
    return {
        color: props.titleColor,
        fontSize: props.titleSize,
        fontWeight: props.titleBold ? 'bold' : 'normal',
        position: 'absolute',
        left: 0,
        right: 0,
        margin: 'auto',
        textAlign: 'center',
    }
})

// 获取状态栏高度
onMounted(() => {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight || 0
})

// 左侧图标点击事件
const handleLeftClick = () => {
    emit('leftClick')
}

// 右侧图标点击事件
const handleRightClick = () => {
    emit('rightClick')
}

// 标题点击事件
const handleTitleClick = () => {
    emit('titleClick')
}
</script>

<style lang="scss" scoped>
.tech-header {
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 10;
}

.status-bar {
    width: 100%;
}

.header-content {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32rpx;
    box-sizing: border-box;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-left,
.header-left-icon {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 88rpx;
    height: 88rpx;
    margin-right: auto;
}

.header-right,
.header-right-icon {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 88rpx;
    height: 88rpx;
    margin-left: auto;
}

.header-title {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    .title-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        width: 100%;
    }
}

.header-left-icon,
.header-right-icon {
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:active {
        opacity: 0.7;
    }
}
</style>