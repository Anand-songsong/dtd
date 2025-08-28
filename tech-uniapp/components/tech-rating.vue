<template>
  <view class="tech-rating">
    <view 
      v-for="(star, index) in stars" 
      :key="index" 
      class="star-item"
    >
      <!-- 背景星星（灰色） -->
      <tech-icon 
        type="icon-xingxing1" 
        :size="size" 
        :color="inactiveColor" 
        class="star-background"
      />
      <!-- 前景星星（彩色，根据填充度显示） -->
      <tech-icon 
        type="icon-xingxing1" 
        :size="size" 
        :color="activeColor" 
        class="star-foreground"
        :style="{ 
          clipPath: `inset(0 ${100 - star.fillPercent}% 0 0)`,
          position: 'absolute',
          top: 0,
          left: 0
        }"
      />
    </view>
    <text v-if="showScore" class="score-text">{{ score }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: [Number, String],
    default: 0
  },
  maxScore: {
    type: Number,
    default: 5
  },
  size: {
    type: [Number, String],
    default: 24
  },
  showScore: {
    type: Boolean,
    default: false
  },
  activeColor: {
    type: String,
    default: '#facc15'
  },
  inactiveColor: {
    type: String,
    default: '#E5E7EB'
  }
})

const stars = computed(() => {
  const score = parseFloat(props.score) || 0
  const starCount = 5 // 固定5颗星
  
  return Array.from({ length: starCount }, (_, index) => {
    const starPosition = index + 1
    let fillPercent = 0
    
    if (score >= starPosition) {
      // 完全填充
      fillPercent = 100
    } else if (score > index) {
      // 部分填充（小数部分）
      const decimal = score - index
      fillPercent = Math.round(decimal * 100)
    }
    
    return {
      fillPercent
    }
  })
})
</script>

<style lang="scss" scoped>
.tech-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
  
  .star-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: v-bind(size + 'rpx');
    height: v-bind(size + 'rpx');
  }
  
  .star-background {
    position: relative;
    z-index: 1;
  }
  
  .star-foreground {
    z-index: 2;
  }
  
  .score-text {
    margin-left: 8rpx;
    font-size: 24rpx;
    color: #666;
  }
}
</style> 