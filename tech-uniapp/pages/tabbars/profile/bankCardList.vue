<template>
  <view class="bank-card-page">
    <!-- 固定头部 -->
    <tech-header title="银行卡管理" backgroundColor="#fff" titleColor="#000" style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 10;" >
      <template #left>
        <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#000" @click="handleBack" />
      </template>
    </tech-header>
    <view style="height: 100rpx;"></view> <!-- 占位 -->

    <!-- 默认提现账户 -->
    <view class="section-title">默认提现账户</view>
    <view class="card-item default" v-if="defaultCard.id">
      <view class="card-icon-box">
        <tech-icon type="icon-yinhangka" size="48rpx" color="#4cd964" />
      </view>
      <view class="card-info">
        <view class="bank-name-row">
          <text class="bank-name">{{ defaultCard.bankName }}</text>
          <view class="default-tag">默认</view>
        </view>
        <view class="bank-num">{{ defaultCard.cardNo }}</view>
        <view class="bank-type">{{ defaultCard.cardName }}</view>
      </view>
    </view>
    <view class="card-item" v-else>
      暂无绑定的银行卡<text style="color: var(--theme-color);margin-left: 10rpx;" @click="handleAddCard">去绑定</text>
    </view>
    <!-- 其他银行卡 -->
    <view class="section-title" v-if="otherCards.length > 0">其他银行卡</view>
    <view class="card-item" v-for="(card, idx) in otherCards" :key="card.id">
      <view class="card-icon-box">
        <tech-icon :type="'icon-yinhangka'" size="48rpx" :color="card.color" />
      </view>
      <view class="card-info">
        <view class="bank-name-row">
          <text class="bank-name">{{ card.bank }}</text>
        </view>
        <view class="bank-num">**** **** **** {{ card.num }}</view>
        <view class="bank-type">{{ card.owner }}</view>
      </view>
      <view class="card-action">
        <tech-icon type="icon-gengduo" size="36rpx" color="#bbb" @click="openAction(idx)" />
        <view v-if="showActionIdx === idx" class="action-popup">
          <view class="action-item" @click="setDefault(idx)">
            <tech-icon type="icon-xiangzuojiantou" size="24rpx" color="#007aff" style="transform: rotate(-90deg);margin-right:8rpx;" v-if="false"/>
            <text>设为默认</text>
            <tech-icon type="icon-xiangzuojiantou" size="24rpx" color="#007aff" style="transform: rotate(-90deg);margin-left:8rpx;" v-if="true"/>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加新银行卡按钮 -->
    <button class="add-btn" @click="handleAddCard">+ 添加新银行卡</button>

    <!-- 说明 -->
    <view class="tips-box">
      <view>· 最多可绑定3张银行卡</view>
      <view>· 默认使用第一张绑定的银行卡作为提现账户</view>
      <view>· 提现到账时间：1-2个工作日</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getMyBankCardList } from '@/api/my'
import { onShow } from '@dcloudio/uni-app'
const otherCards = ref([
])
const showActionIdx = ref(-1)
function handleBack() {
  uni.navigateBack()
}
function openAction(idx) {
  showActionIdx.value = showActionIdx.value === idx ? -1 : idx
}
function setDefault(idx) {
  uni.showToast({ title: '已设为默认', icon: 'success' })
  showActionIdx.value = -1
}
const myBankCardList = ref([])
const defaultCard = ref({})
const totalCard = ref(0)
function getMyBankCardListData(){
  getMyBankCardList().then(res => {
    myBankCardList.value = res.data || []
    defaultCard.value = res.data?.[0] || {}
    otherCards.value = res.data?.slice(1) || []
    totalCard.value = res.data?.length || 0
  })
}
function handleAddCard(){
  if(totalCard.value >= 3){
    uni.showToast({
      title: '最多可绑定3张银行卡',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: '/pages/tabbars/profile/addBankCard'
  })
}
onShow(() => {
  getMyBankCardListData()
})
</script>

<style lang="scss" scoped>
.bank-card-page {
  background: var(--background-color);
  min-height: 100vh;
}
.section-title {
  font-size: 26rpx;
  color: #222;
  font-weight: bold;
  margin: 24rpx 0 12rpx 32rpx;
}
.card-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx 18rpx 24rpx;
  padding: 24rpx 32rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx 0 rgba(0,0,0,0.03);
  .card-icon-box {
    width: 72rpx;
    height: 72rpx;
    background: #f3f6fa;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
  }
  .card-info {
    flex: 1;
    .bank-name-row {
      display: flex;
      align-items: center;
      .bank-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #222;
        margin-right: 16rpx;
      }
      .default-tag {
        background: var(--theme-color);
        color: #fff;
        font-size: 22rpx;
        border-radius: 10rpx;
        padding: 2rpx 16rpx;
        margin-left: 8rpx;
      }
    }
    .bank-num {
      font-size: 24rpx;
      color: #888;
      margin: 8rpx 0 0 0;
    }
    .bank-type {
      font-size: 22rpx;
      color: #bbb;
      margin-top: 4rpx;
    }
  }
  .card-action {
    margin-left: 16rpx;
    position: relative;
    .action-popup {
      position: absolute;
      top: 40rpx;
      right: 0;
      background: #fff;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 16rpx 0 rgba(0,0,0,0.08);
      z-index: 10;
      min-width: 140rpx;
      .action-item {
        display: flex;
        align-items: center;
        color: var(--theme-color);
        font-size: 26rpx;
        padding: 18rpx 24rpx;
        cursor: pointer;
        line-height: 44rpx;
      }
    }
  }
}
.card-item.default {
  border: 2rpx solid var(--theme-color);
  box-shadow: 0 4rpx 16rpx 0 rgba(0,122,255,0.08);
  .default-tag {
    background: var(--theme-color);
  }
}
.add-btn {
  width: 92%;
  margin: 32rpx 4% 0 4%;
  height: 88rpx;
  line-height: 88rpx;
  background: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  &::after{
    border: none;
  }
}
.tips-box {
  background: #f3f4f6;
  border-radius: 16rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx;
  color: #888;
  font-size: 22rpx;
  line-height: 36rpx;
}
</style>