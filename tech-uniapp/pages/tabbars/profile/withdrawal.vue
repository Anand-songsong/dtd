<template>
  <view class="withdrawal-page">
    <!-- 顶部头部栏 -->
    <tech-header title="提现申请" backgroundColor="#fff" titleColor="#000">
      <template #left>
        <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#000" @click="handleBack" />
      </template>
    </tech-header>

    <!-- 可提现余额卡片 -->
    <view class="balance-card">
      <view class="balance-label">可提现余额</view>
      <view class="balance-value">￥{{ withdrawnAmount }}</view>
    </view>

    <!-- 提现金额输入区 -->
    <view class="input-section">
      <view class="input-label">提现金额</view>
      <view class="input-row">
        <text class="input-prefix">￥</text>
        <input class="input-money" type="number" placeholder="请输入提现金额" v-model="amount" />
        <view class="input-all" @click="handleAllWithdraw">全部提现</view>
      </view>
    </view>

    <!-- 提现账户信息 -->
    <view class="account-section">
      <view class="account-label">提现账户</view>
      <view class="account-row" v-if="activeBank.id">
        <view class="account-bank">
          <tech-icon type="icon-yinhangqia" size="44rpx" color="#4B5563" />
          <view class="bank-info">
            <view class="bank-name">{{ activeBank.bankName }}</view>
            <view class="bank-no">尾号 {{ activeBank?.cardNo?.slice(-4) }}</view>
          </view>
        </view>
        <view class="account-change" @click="handleChangeBankCard">更换</view>
      </view>
      <view class="account" v-else>暂无绑定的银行卡，<text style="color: var(--theme-color);" @click="handleAddBankCard">去绑定</text></view>
    </view>

    <!-- 查看提现申请记录 -->
    <view class="record-section" @click="handleRecord">
      <view class="record-row">
        <tech-icon type="icon-lishijilu" size="32rpx" color="var(--theme-color)" />
        <view class="record-text">查看提现申请记录</view>
        <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#bbb" />
      </view>
    </view>

    <!-- 提现说明 -->
    <view class="tip-section">
      <view class="tip-title">提现手续费：</view>
      <view class="tip-content">单笔提现金额0.5%，最低1元</view>
      <view class="tip-title">预计到账时间：</view>
      <view class="tip-content">1-2个工作日内到账</view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer-bar">
      <button class="btn-confirm" @click="handleWithdraw">确认提现</button>
    </view>
    <tech-popup ref="popup" type="bottom" height="500rpx">
      <view class="bank-button-list">
        <view class="bank-confirm" @click="handleConfirm">确定</view>
        <view class="bank-cancel" @click="handleCancel">取消</view>
      </view>
      <picker-view indicator-style="height: 60rpx;" style="width: 100%; height: 300rpx;" :value="[pickerIndex]"
        @change="changeBankCard">
        <picker-view-column>
          <view v-for="(item, idx) in myBankCardList" :key="item.id" class="bank-picker-item"
            :class="{ active: idx === pickerIndex }">
            <view class="bank-picker-name">{{ item.bankName }}{{ item.cardName }}
              尾号 {{ item?.cardNo?.slice(-4) }}</view>
          </view>
        </picker-view-column>
      </picker-view>
    </tech-popup>
  </view>
</template> 

<script setup>
import { ref , computed } from 'vue'
import { getMyFund, getMyBankCardList, applyWithdraw , getRichText } from '@/api/my'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
const store = useStore()
const init = computed(() => store.state.init)
const amount = ref()
const withdrawnAmount = ref('')
const myBankCardList = ref([])
const popup = ref(null)
const pickerIndex = ref(0)
const bankId = ref(0)
const activeBankId = ref(0)
const activeBank = ref({})
function handleBack() {
  uni.navigateBack()
}
function handleRecord() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/withdrawal-record'
  })
}
function handleAddBankCard() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/addBankCard'
  })
}
function handleConfirm() {
  bankId.value = activeBankId.value
  activeBank.value = myBankCardList.value[pickerIndex.value]
  popup.value.close()
}
function handleCancel() {
  popup.value.close()
}
function changeBankCard(e) {
  pickerIndex.value = e.detail.value[0]
  activeBankId.value = myBankCardList.value[pickerIndex.value].id
}
function handleChangeBankCard() {
  popup.value.open()
}
function handleAllWithdraw() {
  if (withdrawnAmount.value > 0) {
    amount.value = withdrawnAmount.value
  } else {
    uni.showToast({
      title: '可提现金额为0',
      icon: 'none'
    })
  }
}
function handleWithdraw() {
  if (bankId.value === 0) {
    uni.showToast({
      title: '请选择银行卡',
      icon: 'none'
    })
    return
  }
  if (Number(amount.value) === 0) {
    uni.showToast({
      title: '提现金额不能为0',
      icon: 'none'
    })
    return
  }
  if (amount.value === '') {
    uni.showToast({
      title: '请输入提现金额',
      icon: 'none'
    })
    return
  }
  if (amount.value > withdrawnAmount.value) {
    uni.showToast({
      title: '提现金额不能大于可提现金额',
      icon: 'none'
    })
    return
  }
  
  applyWithdraw({
    targetId: activeBank.value.id,
    wdAmount: Number(amount.value)
  }).then(res => {
    uni.showToast({
      title: res.msg,
      icon: 'success'
    })
    setTimeout(() => {
      getMyFund().then(res => {
        withdrawnAmount.value = res.data.withdrawnAmount
      })
    }, 100);
  })
}
onShow(() => {
  //可提现金额
  getMyFund().then(res => {
    withdrawnAmount.value = res.data.withdrawnAmount
  })
  //我的银行卡列表
  getMyBankCardList().then(res => {
    myBankCardList.value = res.data
    bankId.value = res.data?.[0]?.id || 0
    activeBank.value = res.data?.[0] || {}
  })
  getRichText(init.value?.app?.notices?.withdrawn_notice?.id || 6).then(res => {

  })
})
</script>

<style lang="scss" scoped>
.withdrawal-page {
  background: var(--background-color);
  min-height: 100vh;
}

.balance-card {
  background: var(--theme-color-linear-gradient);
  border-radius: 20rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 40rpx 0 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .balance-label {
    color: #fff;
    font-size: 26rpx;
    margin-bottom: 12rpx;
  }

  .balance-value {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
  }
}

.input-section {
  background: #fff;
  border-radius: 0;
  margin: 32rpx 0 0 0;
  padding: 0 24rpx 0 24rpx;

  .input-label {
    color: #222;
    font-size: 28rpx;
    margin: 32rpx 0 16rpx 0;
  }

  .input-row {
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    padding-bottom: 16rpx;

    .input-prefix {
      color: #888;
      font-size: 32rpx;
      margin-right: 8rpx;
    }

    .input-money {
      flex: 1;
      border: none;
      font-size: 32rpx;
      color: #222;
      background: transparent;
      outline: none;
    }

    .input-all {
      color: var(--theme-color);
      font-size: 26rpx;
      margin-left: 16rpx;
    }
  }
}

.account-section {
  background: #fff;
  margin-top: 32rpx;
  padding: 0 24rpx 0 24rpx;

  .account-label {
    color: #222;
    font-size: 28rpx;
    margin: 32rpx 0 16rpx 0;
  }

  .account-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1rpx solid #eee;
    padding-bottom: 16rpx;

    .account-bank {
      display: flex;
      align-items: center;

      .bank-info {
        margin-left: 16rpx;

        .bank-name {
          color: #222;
          font-size: 28rpx;
        }

        .bank-no {
          color: #888;
          font-size: 24rpx;
          margin-top: 4rpx;
        }
      }
    }

    .account-change {
      color: var(--theme-color);
      font-size: 26rpx;
      margin-left: 24rpx;
    }
  }
  .account{
    color: #222;
    font-size: 28rpx;
    margin-top: 16rpx;
  }
}

.record-section {
  background: #fff;
  margin-top: 32rpx;
  padding: 0 24rpx;

  .record-row {
    display: flex;
    align-items: center;
    padding: 32rpx 0;
    border-bottom: 1rpx solid #eee;

    .record-text {
      flex: 1;
      color: #222;
      font-size: 28rpx;
      margin-left: 16rpx;
    }
  }
}

.bank-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    color: var(--theme-color) !important;
  }

  .bank-picker-name {
    font-size: 36rpx;
  }
}

.bank-button-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;

  .bank-confirm {
    color: var(--theme-color);
  }
}

.tip-section {
  background: #f3f4f6;
  margin: 32rpx 24rpx 0 24rpx;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 16rpx 24rpx;
  color: #4B5563;
  .tip-title {
    font-size: 24rpx;
    margin-top: 8rpx;
  }

  .tip-content {
    font-size: 24rpx;
    margin-bottom: 8rpx;
  }
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 32rpx 32rpx 32rpx;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.04);

  .btn-confirm {
    flex: 1;
    background: var(--theme-color);
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 28rpx;
    height: 88rpx;
    line-height: 88rpx;
    font-weight: bold;
  }
}
</style>