<template>
  <view class="order-detail" :style="{ paddingBottom: orderDetail.businessStatus === 1 || orderDetail.businessStatus === 2 ? '200rpx' : '40rpx' }">
    <!-- 顶部头部栏 -->
    <tech-header title="预约详情">
      <template #left>
        <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#fff" @click="handleBack" />
      </template>
      <template #right>
        <text class="history-btn" @click="handleHistory">接单历史</text>
      </template>
    </tech-header>

    <!-- 状态卡片 -->
    <view class="status-card">
      <view class="status-title-row">
        <view class="status-title" :style="{ color: orderDetail.businessStatus === 1 ? '#FF6B35' : orderDetail.businessStatus === 2 ? '#3B82F6' : '#22C55E' }">{{ businessStatus[orderDetail.businessStatus] }}</view>
        <view class="refund-status" v-if="orderDetail.refund">已退款</view>
      </view>
      <view class="status-desc" v-if="orderDetail.businessStatus === 1">
        <view style="color: #EF4444;" v-if="countdownTime.totalSeconds <= 0">已超时</view>
        <view v-if="countdownTime.totalSeconds > 0">
          <!-- 时分秒格式，并开启倒计时任务 -->
          <view class="time-countdown">
            距离服务开始还有{{ countdownTime.hours }}:{{ countdownTime.minutes }}:{{ countdownTime.seconds }}
          </view>
        </view>
      </view>
      <view class="status-desc" v-if="orderDetail.businessStatus === 2">
        <view class="time-countdown">距离服务结束时间还有
          {{ countdownTime.hours }}:{{ countdownTime.minutes }}:{{ countdownTime.seconds }}
        </view>
      </view>
      <view class="status-no" v-if="orderDetail.orderNo" @click="handleCopy(orderDetail.orderNo)">No. {{
        orderDetail.orderNo
      }}</view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image class="avatar" :src="orderDetail?.avatarUrl || defaultImageUrl" mode="aspectFill" />
      <view class="user-info">
        <view class="user-row">
          <text class="user-name">{{ orderDetail?.consignee }}</text>
          <!-- <view class="vip-tag">VIP客户</view> -->
        </view>
        <view class="user-row2">已服务{{ orderDetail?.serviceFrequency }}次</view>
      </view>
      <view class="user-contact" v-if="orderDetail?.businessStatus !== 3" @click="handleCall(orderDetail)">
        <tech-icon type="icon-dianhua" size="36rpx" color="var(--theme-color)" />
      </view>
    </view>

    <!-- 服务详情卡片 -->
    <view class="service-card">
      <view class="service-title">服务详情</view>
      <view class="service-row">
        <text class="label">服务项目</text>
        <text class="value">{{ orderDetail?.serviceProjectName }}</text>
      </view>
      <view class="service-row">
        <text class="label">服务时长</text>
        <text class="value">{{ orderDetail?.serviceProjectDuration }}分钟</text>
      </view>
      <view class="service-row">
        <text class="label">服务价格</text>
        <text class="value price">¥{{ orderDetail?.serviceProjectPrice }}</text>
      </view>
      <view class="service-row">
        <text class="label">下单时间</text>
        <text class="value">{{ dayjs(orderDetail?.orderCreateTime).format('YYYY-MM-DD HH:mm:ss') }}</text>
      </view>
      <view class="service-row">
        <text class="label">支付方式</text>
        <text class="value">{{ orderDetail?.payChannel }}(已支付)</text>
      </view>
      <view class="service-row">
        <text class="label">预约时间</text>
        <text class="value">{{ orderDetail?.bookTimeStr }}</text>
      </view>
      <view class="service-row" v-if="orderDetail?.businessStatus !== 1&&orderDetail?.startTime">
        <text class="label">服务开始时间</text>
        <text class="value">{{ dayjs(orderDetail?.startTime).format('YYYY-MM-DD HH:mm:ss') }}</text>
      </view>
      <view class="service-row" v-if="orderDetail?.businessStatus === 3&&orderDetail?.completeTime">
        <text class="label">服务完成时间</text>
        <text class="value">{{ dayjs(orderDetail?.completeTime).format('YYYY-MM-DD HH:mm:ss') }}</text>
      </view>
    </view>

    <!-- 服务地址卡片 -->
    <view class="address-card">
      <view class="address-row">
        <text class="address-title">服务地址</text>
        <view class="address-nav" v-if="orderDetail?.businessStatus !== 3" @click="handleNavigate(orderDetail)">
          <tech-icon type="icon-daohang" size="28rpx" color="var(--theme-color)" />
          导航前往
        </view>
      </view>
      <view class="address-info">
        <tech-icon type="icon-location" size="28rpx" color="var(--theme-color)" />
        <text class="address-text">{{ orderDetail?.address }}</text>
      </view>
      <view class="address-user">{{ orderDetail?.consignee }} {{ '·' + orderDetail?.mobile }}</view>
      <map class="address-map" :latitude="orderDetail?.lat" :longitude="orderDetail?.lng" :markers="markers" />
    </view>

    <!-- 客户备注卡片 -->
    <view class="remark-card">
      <view class="remark-title">客户备注</view>
      <view class="remark-content">{{ orderDetail?.orderRemarks ? orderDetail?.orderRemarks : '暂无备注' }}</view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar" v-if="orderDetail?.businessStatus !== 3">
      <button class="btn-cancel" @click="handleChangeStatus(8)">取消服务</button>
      <button class="btn-confirm" @click="handleChangeStatus(orderDetail?.serviceStatus + 1)">
        {{ actionList[(orderDetail?.serviceStatus + 1).toString()]?.label }}
      </button>
    </view>
    <tech-popup ref="markPopup" type="bottom" width="95%" height="800rpx">
      <view class="mark-popup-content">
        <view class="mark-popup-title">
          {{ actionList[(currentServiceStatus).toString()]?.label }}
        </view>
        <view class="mark-popup-body">
          <!-- 上传图片区域 -->
          <view class="upload-section">
            <view class="section-title">上传图片（选填）</view>
            <view class="image-list">
              <view class="image-item" v-for="(img, index) in uploadImages" :key="index">
                <image :src="img" class="uploaded-image" mode="aspectFill" />
                <view class="delete-btn" @click="deleteImage(index)">
                  <tech-icon type="icon-guanbi-quxiao" size="24rpx" color="#fff" />
                </view>
              </view>
              <view class="add-image-btn" @click="chooseImage" v-if="uploadImages.length < 9">
                <tech-icon type="icon-tupian" size="48rpx" color="#bbb" />
                <text>添加图片</text>
              </view>
            </view>
          </view>

          <!-- 备注输入区域 -->
          <view class="remark-section">
            <view class="section-title">备注（选填）</view>
            <textarea class="remark-input" v-model="remarkText" placeholder="请输入备注信息" maxlength="200" />
            <view class="char-count">{{ remarkText.length }}/200</view>
          </view>
        </view>

        <!-- 按钮区域 -->
        <view class="mark-popup-footer">
          <button class="btn-cancel" @click="cancelUpdate">取消</button>
          <button class="btn-confirm" @click="confirmUpdate">确认</button>
        </view>
      </view>
    </tech-popup>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onHide, onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, getReservationDetail, updateServiceStatus } from '@/api/order'
import { businessStatus, actionList } from '@/config'
import { uploadFile } from '@/utils/request'
import dayjs from 'dayjs'
import { getImage } from '@/utils/request'
import { useStore } from 'vuex'
const store = useStore()
const defaultImageUrl = ref('')
function handleCall(orderDetail) {
  uni.showModal({
    title: '提示',
    content: `${orderDetail?.consignee}\n\r${orderDetail?.mobile}，是否拨打？`,
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: orderDetail?.address?.mobile
        })
      }
    }
  })
}
function handleCopy(orderNo) {
  uni.setClipboardData({
    data: orderNo,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'none'
      })
    }
  })
}
const orderDetail = ref({})
const countdownTime = ref({
  hours: '00',
  minutes: '00',
  seconds: '00',
  totalSeconds: 0
})
let countdownTimer = null

// 弹窗相关
const markPopup = ref(null)
const currentServiceStatus = ref(0)
const uploadImages = ref([])
const remarkText = ref('')

const markers = computed(() => [
  {
    latitude: orderDetail.value?.address?.lat,
    longitude: orderDetail.value?.address?.lng,
    title: orderDetail.value?.address?.address,
    iconPath: '/static/marker.png',
    width: 20,
    height: 20,
  }
])
// 格式化时间，补零
function formatTime(num) {
  return num < 10 ? `0${num}` : `${num}`
}

// 计算倒计时
function calculateCountdown() {
  //当前订单状态为1时开启
  const now = dayjs()
  let diffSeconds = 0
  if(orderDetail.value.businessStatus === 1){
    const bookTime = dayjs(orderDetail.value.bookTime)
    diffSeconds = bookTime.diff(now, 'second')
  }else if(orderDetail.value.businessStatus === 2){
    //状态为2时，结束时间为服务开始时间+服务时长
    const startTime = dayjs(orderDetail.value.startTime)
    const serviceDuration = orderDetail.value.serviceProjectDuration
    const completeTime = startTime.add(serviceDuration, 'minute')
    diffSeconds = completeTime.diff(now, 'second')
  }else{
    return
  }


  if (diffSeconds <= 0) {
    countdownTime.value = {
      hours: '00',
      minutes: '00',
      seconds: '00',
      totalSeconds: 0
    }
    stopCountdown()
    return
  }

  const hours = Math.floor(diffSeconds / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  countdownTime.value = {
    hours: formatTime(hours),
    minutes: formatTime(minutes),
    seconds: formatTime(seconds),
    totalSeconds: diffSeconds
  }
}

// 开始倒计时
function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  calculateCountdown()
  countdownTimer = setInterval(() => {
    calculateCountdown()
  }, 1000)
}

// 停止倒计时
function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function getDetail(orderNo) {
  getOrderDetail(orderNo).then(res => {
    orderDetail.value = res.data
    if (orderDetail.value.businessStatus === 1 || orderDetail.value.businessStatus === 2) {
      startCountdown()
    }
  })
}

function getReservationDetailData(orderId) {
  getReservationDetail(orderId).then(res => {
    orderDetail.value = res.data
    if (orderDetail.value.businessStatus === 1 || orderDetail.value.businessStatus === 2) {
      startCountdown()
    }
  })
}

const orderNo = ref('')
const orderId = ref('')
onLoad((options) => {
  orderNo.value = options.orderNo
  orderId.value = options.orderId
  // if (orderId.value) {
  //   getReservationDetailData(orderId.value)
  // } else {
  //   getDetail(orderNo.value)
  // }
})
onShow(() => {
  if (orderId.value) {
    getReservationDetailData(orderId.value)
  } else {
    getDetail(orderNo.value)
  }
  setTimeout(async () => {
    defaultImageUrl.value = await getImage(store.state.appInfo.app.logo)
  }, 500)
})

onHide(() => {
  stopCountdown()
})
function handleBack() {
  uni.navigateBack()
}
function handleNavigate(data) {
  uni.showLoading({
    title: '定位中...'
  })
  const { lat, lng, address } = data
  const name = encodeURIComponent(address)
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      uni.hideLoading()
      const slat = res.latitude
      const slng = res.longitude
      uni.navigateTo({
        url: `/pages/tabbars/order/guide?lat=${lat}&lng=${lng}&name=${name}&slat=${slat}&slng=${slng}`
      })
    },
    fail: () => {
      uni.showToast({ title: '定位失败', icon: 'none' })
    }
  })
}
// 选择图片
function chooseImage() {
  uni.chooseImage({
    count: 9 - uploadImages.value.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 检查文件大小限制（10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      const oversizedFiles = res.tempFiles.filter(file => file.size > maxSize)

      if (oversizedFiles.length > 0) {
        uni.showToast({
          title: '图片大小不能超过10MB',
          icon: 'none'
        })
        return
      }

      uploadImages.value.push(...res.tempFilePaths)
    }
  })
}

// 删除图片
function deleteImage(index) {
  uploadImages.value.splice(index, 1)
}

// 打开状态更新弹窗
function handleChangeStatus(serviceStatus) {
  currentServiceStatus.value = serviceStatus
  uploadImages.value = []
  remarkText.value = ''
  markPopup.value.open()
}

// 取消更新
function cancelUpdate() {
  markPopup.value.close()
}

// 确认更新
function confirmUpdate() {
  uni.showLoading({
    title: '更新中...'
  })

  // 先上传图片
  const uploadPromises = uploadImages.value.map(imagePath => {
    return uploadFile(imagePath)
  })

  Promise.all(uploadPromises).then(uploadResults => {
    const photoUrls = uploadResults.map(result => result.path)

    // 获取位置信息
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        const slat = res.latitude
        const slng = res.longitude

        // 更新服务状态
        updateServiceStatus({
          orderId: orderDetail.value.orderId,
          action: actionList[currentServiceStatus.value]?.action,
          lat: slat,
          lng: slng,
          remarks: remarkText.value,
          photos: photoUrls
        }).then(result => {
          uni.hideLoading()
          setTimeout(() => {
            uni.showToast({
              title: result.msg,
              icon: 'none'
            })
          }, 10)

          // 关闭弹窗
          markPopup.value.close()

          // 刷新数据
          if (orderId.value) {
            getReservationDetailData(orderId.value)
          } else {
            getDetail(orderNo.value)
          }
          if(serviceStatus === 8){
            uni.navigateBack()
          }
        }).catch(error => {
          uni.hideLoading()
          uni.showToast({
            title: '更新失败',
            icon: 'none'
          })
        })
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  }).catch(error => {
    uni.hideLoading()
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  })
}
function handleHistory() {
  uni.showToast({
    title: '暂未开放',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.order-detail {
  background: var(--background-color);
  min-height: calc(100vh);
}

.status-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 32rpx 32rpx 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.06);

  .status-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .status-title {
    color: #007aff;
    font-size: 32rpx;
    font-weight: bold;
  }

  .refund-status {
    color: #EF4444;
    font-size: 24rpx;
    font-weight: bold;
  }

  .status-desc {
    color: #4b5563;
    font-size: 24rpx;
    margin-bottom: 8rpx;

    .time-countdown {
      color: #6B7280;
      font-size: 26rpx;
    }
  }

  .status-no {
    color: #bbb;
    font-size: 22rpx;
  }
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.06);

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    object-fit: cover;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .user-row {
      display: flex;
      align-items: center;

      .user-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #222;
      }

      .vip-tag {
        background: #FFF7E6;
        color: #FF914D;
        font-size: 22rpx;
        border-radius: 8rpx;
        padding: 2rpx 14rpx;
        margin-left: 12rpx;
      }
    }

    .user-row2 {
      color: #888;
      font-size: 22rpx;
      margin-top: 8rpx;
    }
  }

  .user-contact {
    margin-left: 16rpx;
    background: var(--theme-color-light);
    border-radius: 50%;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.service-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.06);

  .service-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-bottom: 18rpx;
  }
  .service-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 26rpx;
    color: #222;
    margin-bottom: 18rpx;

    .label {
      color: #888;
      width: 160rpx;
    }

    .value {
      color: #222;
    }

    .price {
      color: var(--theme-color);
      font-weight: bold;
    }
  }
}

.address-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.06);

  .address-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .address-title {
      font-size: 28rpx;
      color: #222;
      font-weight: bold;
    }

    .address-nav {
      color: var(--theme-color);
      font-size: 24rpx;
    }
  }

  .address-info {
    display: flex;
    align-items: center;
    margin: 18rpx 0 0 0;

    .address-text {
      margin-left: 8rpx;
      color: #222;
      font-size: 24rpx;
    }
  }

  .address-user {
    color: #888;
    font-size: 22rpx;
    margin: 8rpx 0 18rpx 36rpx;
  }

  .address-map {
    width: 100%;
    height: 160rpx;
    border-radius: 12rpx;
    object-fit: cover;
    margin-top: 8rpx;
  }
}

.remark-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.06);

  .remark-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .remark-content {
    color: #374151;
    font-size: 24rpx;
    background-color: #f9fafb;
    padding: 20rpx;
    border-radius: 12rpx;
  }
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx 32rpx 32rpx;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 10;

  .btn-cancel {
    flex: 1;
    background: #fff;
    color: #888;
    border: 1rpx solid #eee;
    border-radius: 44rpx;
    font-size: 28rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin-right: 24rpx;

    &::after {
      border: none;
    }
  }

  .btn-confirm {
    flex: 2;
    background: var(--theme-color);
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 28rpx;
    height: 88rpx;
    font-weight: bold;
    line-height: 88rpx;

    &::after {
      border: none;
    }
  }
}

.history-btn {
  color: #fff;
  font-size: 26rpx;
  margin-right: 8rpx;
}

.mark-popup-content {
  padding: 32rpx;
  height: 100%;
  display: flex;
  flex-direction: column;

  .mark-popup-title {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    text-align: center;
    margin-bottom: 32rpx;
  }

  .mark-popup-body {
    overflow-y: auto;

    .section-title {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 16rpx;
    }

    .upload-section {
      margin-bottom: 32rpx;

      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .image-item {
          position: relative;
          width: 160rpx;
          height: 160rpx;

          .uploaded-image {
            width: 100%;
            height: 100%;
            border-radius: 12rpx;
            object-fit: cover;
          }

          .delete-btn {
            position: absolute;
            top: 8rpx;
            right: 8rpx;
            width: 40rpx;
            height: 40rpx;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .add-image-btn {
          width: 160rpx;
          height: 160rpx;
          border: 2rpx dashed #ddd;
          border-radius: 12rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 24rpx;

          text {
            margin-top: 8rpx;
          }
        }
      }
    }

    .remark-section {
      .remark-input {
        width: 90%;
        height: 200rpx;
        border: 1rpx solid #eee;
        border-radius: 12rpx;
        padding: 16rpx;
        font-size: 26rpx;
        color: #333;
        background: #fafafa;
      }

      .char-count {
        text-align: right;
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }

  .mark-popup-footer {
    display: flex;
    gap: 24rpx;

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 28rpx;
      font-weight: 500;

      &::after {
        border: none;
      }
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }

    .btn-confirm {
      background: var(--theme-color);
      color: #fff;
    }
  }
}
</style>