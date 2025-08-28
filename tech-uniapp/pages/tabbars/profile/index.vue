<template>
  <view class="profile-page">
    <!-- 顶部图片和信息区 -->
    <view class="profile-header-pure">
      <image class="header-bg" src="https://mu-dtd.oss-cn-hangzhou.aliyuncs.com/static/login_banner.png" 
      @tap="previewImage('https://mu-dtd.oss-cn-hangzhou.aliyuncs.com/static/login_banner.png')" mode="aspectFill" />
      <view class="profile-info-pure-row">
        <view class="avatar-box">
          <image class="avatar" :src="userInfo.headImg" @tap="previewImage(userInfo.headImg)" mode="aspectFill" />
        </view>
        <view class="profile-base">
          <view class="profile-tags">
            <view class="tag gold" v-if="userInfo.skillLevel">{{ userInfo.skillLevel }}</view>
            <view class="tag gold" v-if="userInfo.workYear">{{ userInfo.workYear }}年经验</view>
          </view>
          <view class="name">{{ userInfo.nickname }}</view>
          <view class="desc">{{ userInfo.serviceDescription }}</view>
          
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="profile-stats">
      <view class="stat-item">
        <view class="stat-value">{{ userInfo.serviceDuration }}</view>
        <view class="stat-label">总服务时长(小时)</view>
      </view>
      <view class="stat-item stat-item-order">
        <view class="stat-value">{{ userInfo.orderNum }}</view>
        <view class="stat-label">累计订单</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ userInfo.favorableRate }}</view>
        <view class="stat-label">好评率</view>
      </view>
    </view>

    <!-- 钱包余额卡片 -->
    <view class="wallet-card">
      <view class="wallet-row">
        <view class="wallet-info">
          <view class="wallet-label">钱包余额</view>
          <view class="wallet-value">￥{{ myFund.withdrawnAmount }}</view>
          <view class="wallet-tip">冻结金额：￥{{ myFund.distributedAmount }}</view>
        </view>
        <button class="wallet-btn" @click="handleWithdraw">立即提现</button>
      </view>

    </view>

    <!-- 功能区 -->
    <view class="profile-grid">
      <view class="grid-item" v-for="item in gridList" :key="item.text" @click="handleGridItem(item)">
        <view class="icon-circle">
          <tech-icon :type="item.icon" size="44rpx" color="var(--theme-color)" />
        </view>
        <view class="grid-text">{{ item.text }}</view>
      </view>
    </view>

    <!-- 常用工具 -->
    <view class="profile-tools">
      <view class="tools-title">常用工具</view>
      <view class="tools-list">
        <view class="tool-item" v-for="item in toolList" :key="item.text" @click="handleToolItem(item)">
          <view class="icon-circle">
            <tech-icon :type="item.icon" size="36rpx" color="var(--theme-color)" />
          </view>
          <view class="tool-text">{{ item.text }}</view>
        </view>
      </view>
    </view>

    <!-- 账户与安全 -->
    <view class="profile-safe">
      <view class="safe-title">账户与安全</view>
      <view class="safe-list">
        <view class="safe-item" @click="handleUserInfo">
          <view class="icon-circle">
            <tech-icon type="icon-gerenxinxi" size="36rpx" color="var(--theme-color)" />
          </view>
          <view class="safe-text">个人信息</view>
          <view class="safe-desc">完善个人资料</view>
          <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#bbb" />
        </view>
        <view class="safe-item" @click="handleBankCard">
          <view class="icon-circle">
            <tech-icon type="icon-yinhangqia" size="36rpx" color="var(--theme-color)" />
          </view>
          <view class="safe-text">银行卡</view>
          <view class="safe-desc">管理提现账户</view>
          <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#bbb" />
        </view>
        <view class="safe-item" @click="handleAccountSecurity">
          <view class="icon-circle">
            <tech-icon type="icon-shezhi1" size="36rpx" color="var(--theme-color)" />
          </view>
          <view class="safe-text">账户安全</view>
          <view class="safe-desc">保障账户安全</view>
          <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#bbb" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { getUserInfo , getMyFund } from '@/api/my'
import { onShow , onPullDownRefresh } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getImage } from "@/utils/request"

onShow(() => {
  getUserInfoData()
  getMyFundData()
  setTimeout(() => {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  }, 10)
})
onPullDownRefresh(() => {
  getUserInfoData()
  getMyFundData()
  uni.stopPullDownRefresh()
})
const userInfo = ref({})
async function getUserInfoData() {
  await getUserInfo().then(async res => {
    userInfo.value = res.data
    userInfo.value.headImg = await getImage(userInfo.value.headImg)
  })
}
const myFund = ref({})
async function getMyFundData() {
  await getMyFund().then(res => {
    myFund.value = res.data
  })
}
const gridList = [
  { icon: 'icon-fuwuguanli', text: '服务管理' },
  { icon: 'icon-shourumingxi', text: '收入明细', url: '/pages/tabbars/income/index', tabbar: true },
  { icon: 'icon-nuokuaqiuduanjiexiouyuanhuanchan_GRZX_FWPI', text: '服务评价' },
  { icon: 'icon-zhuanyejineng', text: '专业技能' },
  { icon: 'icon-rili', text: '排班日历' },
  { icon: 'icon-a-zaixianxuexikaoshipeixunkecheng-60', text: '培训课程' },
  { icon: 'icon-kehuguanli', text: '客户管理' },
  { icon: 'icon-jiankangzhengming', text: '健康证明' },
]
const toolList = [
  { icon: 'icon-jiedanshezhi', text: '接单设置', url: '/pages/tabbars/workbench/orderSetting' },
  { icon: 'icon-jiaotongbutie', text: '交通补贴' },
  { icon: 'icon-fuwushouye-baoxianfuwu', text: '保险服务' },
  { icon: 'icon-group48', text: '在线客服' },
  { icon: 'icon-changjianwenti', text: '常见问题' },
  { icon: 'icon-guanyu_o', text: '关于我们' },
]
function handleGridItem(item) {
  if (item.url) {
    if (item.tabbar) {
      uni.switchTab({
        url: item.url
      })
    } else {
      uni.navigateTo({
        url: item.url
      })
    }
  } else {
    uni.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  }
}
function handleUserInfo() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/userInfo'
  })
}
function handleBankCard() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/bankCardList'
  })
}
function handleAccountSecurity() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/account-security'
  })
}
function handleToolItem(item) {
  if (item.url) {
    uni.navigateTo({
      url: item.url
    })
  }
}
function handleWithdraw() {
  uni.navigateTo({
    url: '/pages/tabbars/profile/withdrawal'
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  background: var(--background-color);
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.profile-header-pure {
  width: 100%;
  position: relative;

  .header-bg {
    width: 100%;
    height: 320rpx;
    object-fit: cover;
    display: block;
    border-radius: 0;
    box-shadow: none;
  }

  .profile-info-pure-row {
    background: #fff;
    position: relative;
    margin-top: -60rpx;
    padding: 32rpx 32rpx 0 0;
    box-shadow: none;
    border-radius: 0;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    z-index: 2;

    .avatar-box {
      margin-left: 32rpx;
      margin-right: 24rpx;
      position: absolute;
      top: -50%;
      left: 0;
      transform: translateY(15%);
      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 6rpx solid #fff;
        object-fit: cover;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      }
    }

    .profile-base {
      flex: 1;
      margin-top: -32rpx;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12rpx;
      margin-left: 160rpx;
      margin-bottom: 20rpx;
      .name {
        font-size: 32rpx;
        color: #222;
        margin-bottom: 4rpx;
        text-align: left;
      }

      .desc {
        color: #6B7280;
        font-size: 24rpx;
        margin-bottom: 8rpx;
        text-align: left;
      }

      .profile-tags {
        display: flex;
        gap: 12rpx;
        margin-bottom: 0;

        .tag {
          font-size: 22rpx;
          padding: 2rpx 14rpx;
          border-radius: 8rpx;
        }

        .gold {
          background: var(--theme-color-light);
          color: var(--theme-color);
        }
      }
    }
  }
}

.profile-stats {
  background: #fff;
  border-radius: 0 0 20rpx 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.06);
  border-top: 1rpx solid #f2f2f2;
  padding: 24rpx 0;
  .stat-item {
    width: 33.33%;
    height: 90%;
    text-align: center;
    &.stat-item-order{
      border-right: 1rpx solid #f2f2f2;
      border-left: 1rpx solid #f2f2f2;
    }
    .stat-value {
      color: #000000;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .stat-label {
      color: #888;
      font-size: 24rpx;
    }
  }
}

.wallet-card {
  background: var(--theme-color-linear-gradient);
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 32rpx 32rpx 24rpx 32rpx;
  color: #fff;
  position: relative;

  .wallet-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .wallet-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .wallet-label {
        font-size: 24rpx;
        margin-bottom: 12rpx;
      }

      .wallet-value {
        font-size: 44rpx;
        font-weight: bold;
        margin-bottom: 0;
      }
    }

    .wallet-btn {
      background: transparent;
      color: #fff;
      border: 1rpx solid #fff;
      border-radius: 20rpx;
      font-size: 28rpx;
      height: 64rpx;
      line-height: 64rpx;
      padding: 0 32rpx;
      margin: 0;

      &::after {
        border: none;
      }
    }
  }

  .wallet-tip {
    color: #fff;
    font-size: 22rpx;
    margin-top: 18rpx;
    opacity: 0.8;
    text-align: left;
  }
}

.profile-grid {
  background: transparent;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 0 0 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 24rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    box-shadow: 0px 0px 0px  rgba(0, 0, 0, 0), 0px 0px 0px  rgba(0, 0, 0, 0), 0px 1px 2px  rgba(0, 0, 0, 0.05);

    .icon-circle {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: var(--theme-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8rpx;
    }

    .grid-text {
      color: #222;
      font-size: 24rpx;
      margin-top: 12rpx;
    }
  }
}

.profile-tools {
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  .tools-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-left: 32rpx;
    margin-bottom: 12rpx;
  }

  .tools-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 16rpx 24rpx 16rpx;
    justify-content: space-between;
    .tool-item {
      width: 15%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24rpx;

      .icon-circle {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8rpx;
        box-shadow: 0px 0px 0px  rgba(0, 0, 0, 0), 0px 0px 0px  rgba(0, 0, 0, 0), 0px 1px 2px  rgba(0, 0, 0, 0.05);
      }

      .tool-text {
        color: #666;
        font-size: 22rpx;
        margin-top: 8rpx;
      }
    }
  }
}

.profile-safe {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 24rpx 24rpx;
  padding: 24rpx 0 0 0;

  .safe-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-left: 32rpx;
    margin-bottom: 12rpx;
  }

  .safe-list {
    .safe-item {
      display: flex;
      align-items: center;
      padding: 10rpx 32rpx;
      border-top: 1rpx solid #f2f2f2;
      position: relative;
      min-height: 100rpx;

      .icon-circle {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: var(--theme-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 18rpx;
      }

      .safe-text {
        font-size: 26rpx;
        color: #222;
        margin-left: 18rpx;
        font-weight: 500;
      }

      .safe-desc {
        font-size: 22rpx;
        color: #888;
        margin-left: auto;
        margin-right: 10rpx;
      }

      tech-icon:last-child {
        position: absolute;
        right: 32rpx;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .safe-item:last-child {
      border-bottom: none;
    }
  }
}
</style>