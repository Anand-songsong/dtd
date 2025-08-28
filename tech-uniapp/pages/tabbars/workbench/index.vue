<template>
	<tech-header :right-icon="'none'">
		<template #left>
			<view class="header-left-title">您好，{{ myInfo.nickname }}</view>
		</template>
		<template #right>
			<view class="header-right-title">
				<view class="header-right-title-item">
					<tech-icon type="icon-gongneng" size="50rpx" color="#fff" />
					<image class="header-right-title-item-img" :src="myInfo.headImg"
						@click="previewImage(myInfo.headImg)" mode="aspectFill" />
				</view>
			</view>
		</template>
	</tech-header>
	<view class="workbench-container">
		<!-- 工作状态卡片 -->
		<view class="workbench-card">
			<view class="card-title">
				<text>工作状态：{{ serviceStatusNum === 0 ? '工作中' : '休息中' }}</text>
				<view class="status-radius"
					:style="{ backgroundColor: serviceStatusNum === 0 ? '#22C55E' : '#EF4444' }">
				</view>
			</view>
			<view class="workbench-btn">
				<button class="workbench-btn-begin" @click="handleServiceStatus(0)">开始接单</button>
				<button class="workbench-btn-stop" @click="handleServiceStatus(1)">暂停接单</button>
			</view>
			<view class="workbench-list">
				<view class="workbench-list-item">
					<view class="workbench-number">{{ homeStatistics.completeOrderNum }}</view>
					<view class="workbench-text">完成订单数</view>
				</view>
				<view class="workbench-list-item">
					<view class="workbench-number">￥{{ homeStatistics.incomeAmount }}</view>
					<view class="workbench-text">今日收入</view>
				</view>
				<view class="workbench-list-item">
					<view class="workbench-score">
						<text class="workbench-number">{{ homeStatistics.score }}</text>
						<tech-icon type="icon-xingxing1" size="36rpx" color="#facc15" />
					</view>
					<view class="workbench-text">评分</view>
				</view>

			</view>
		</view>
		<view class="reservation-order" v-if="homeStatistics?.upcoming">
			<tech-icon type="icon-naozhong" size="32rpx" color="var(--theme-color)" />
			<text>您有1个即将开始的预约，请及时处理</text>
		</view>
		<view class="appointment">
			<text>进行中服务</text>
		</view>
		<view class="workbench-card">
			<view class="card-top" v-if="reserveData?.inProgress"
				@click="navigateToOrderDetail(reserveData?.inProgress?.orderId)">
				<image :src="reserveData?.inProgress?.avatarUrl || defaultImageUrl" mode="aspectFill" />
				<view class="card-name">
					<text>{{ reserveData?.inProgress?.consignee }}</text>
					<text>{{ reserveData?.inProgress?.serviceProjectName }}</text>
				</view>
				<view class="card-time">
					<!-- 预约时段+项目时长后的时间 -->
					<text>{{ dayjs(reserveData?.inProgress?.startTime).format('HH:mm') }} - {{
						dayjs(reserveData?.inProgress?.startTime).add(reserveData?.inProgress?.serviceProjectDuration,
							'minute').format('HH:mm') }}</text>
				</view>
				<view class="card-status">
					<text>服务中</text>
				</view>
			</view>
			<view class="card-middle" v-if="reserveData?.inProgress"
				@click="navigateToOrderDetail(reserveData?.inProgress?.orderId)">
				<view class="middle-left">
					<view class="left-title" @click.stop="refreshProgress">
						<tech-icon type="icon-shuaxin" size="32rpx" color="#3B82F6"
							:class="{ 'icon-rotate': isRefreshing }" />
						<view>{{
							computedTime(reserveData?.inProgress?.startTime,
								reserveData?.inProgress?.serviceProjectDuration).percent
						}}</view>
					</view>
					<view class="left-progress">
						<progress
							:percent="computedTime(reserveData?.inProgress?.startTime, reserveData?.inProgress?.serviceProjectDuration).value"
							activeColor="#3B82F6" :border-radius="30" />
					</view>
				</view>
				<view class="middle-right">
					<tech-icon type="icon-shijian" size="24rpx" color="#3B82F6" />
					<text>延长时间</text>
				</view>
			</view>
			<view class="card-bottom" v-if="reserveData?.inProgress"
				@click="navigateToOrderDetail(reserveData?.inProgress?.orderId)">
				<view class="bottom-top">
					<tech-icon type="icon-location" size="24rpx" color="#8b919b" />
					<text>{{ reserveData?.inProgress?.address }}</text>
				</view>
				<view class="bottom-middle" @tap.stop="endService(reserveData?.inProgress)">结束服务</view>
			</view>
			<view class="placeholder" v-else>
				<tech-icon type="icon-weizhi" size="60rpx" color="#6B7280" />
				<text>当前没有进行中的服务</text>
				<text style="color: #6B7280;font-size: 24rpx;">开始接单后，您的服务会显示在这里</text>
			</view>
		</view>
		<view class="appointment">
			<text>即将服务</text>
			<text class="appointment-more" @click="navigateToMoreAppointments">查看全部</text>
		</view>
		<view class="workbench-card">
			<view class="card-top" v-if="reserveData?.upcoming"
				@click="navigateToOrderDetail(reserveData?.upcoming?.orderId)">
				<image :src="reserveData?.upcoming?.avatarUrl || defaultImageUrl" mode="aspectFill" />
				<view class="card-name">
					<text>{{ reserveData?.upcoming?.consignee }}</text>
					<text>{{ reserveData?.upcoming?.serviceProjectName }}</text>
				</view>
				<view class="card-time">
					<text>{{ reserveData?.upcoming?.bookTimeStr }}</text>
				</view>
				<view class="card-status toBeDone">
					<text>待服务</text>
				</view>
			</view>
			<view class="card-middle" v-if="reserveData?.upcoming"
				@click.stop="navigateToOrderDetail(reserveData?.upcoming?.orderId)">
				<view class="middle-info">
					<view class="left-title">
						<tech-icon type="icon-shijian" size="24rpx" color="#EF4444" />
						<!-- 当前时间距离预约时间的XX小时XX分钟-->
						<!-- 当时间小于0时提示已经超时 -->
						<view v-if="dayjs(reserveData?.upcoming?.bookTime).diff(dayjs(), 'minute') < 0">已超时</view>
						<view v-else>
							<view>还剩{{ dayjs(reserveData?.upcoming?.bookTime).diff(dayjs(),
								'hour') }}小时{{ dayjs(reserveData?.upcoming?.bookTime).diff(dayjs(), 'minute') -
									dayjs(reserveData?.upcoming?.bookTime).diff(dayjs(), 'hour') * 60 }}分钟</view>
						</view>
					</view>
					<view class="left-right" @tap.stop="handleRemind(reserveData?.upcoming?.orderId)"
						v-if="dayjs(reserveData?.upcoming?.bookTime).diff(dayjs(), 'minute') > 0">
						<tech-icon type="icon-naozhong" size="24rpx" color="#EF4444" />
						<text>提醒</text>
					</view>
				</view>

			</view>
			<view class="card-bottom" v-if="reserveData?.upcoming"
				@click.stop="navigateToOrderDetail(reserveData?.upcoming?.orderId)">
				<view class="bottom-top">
					<tech-icon type="icon-location" size="24rpx" color="#8b919b" />
					<text>{{ reserveData?.upcoming?.address }}</text>
				</view>
				<view class="bottom-button">
					<button class="bottom-button-item bottom-button-item-left"
						@tap.stop="openGuide(reserveData?.upcoming)">
						<tech-icon type="icon-location" size="24rpx" color="#8b919b" />
						<text>导航</text>
					</button>
					<button class="bottom-button-item bottom-button-item-right"
						@tap.stop="openContactPopup(reserveData?.upcoming)">
						<tech-icon type="icon-dianhua" size="24rpx" color="var(--theme-color)" />
						<text>联系客户</text>
					</button>
				</view>
			</view>
			<view class="placeholder" v-else>
				<tech-icon type="icon-shijian" size="60rpx" color="#3B82F6" />
				<text>暂无即将开始的服务</text>
				<text style="color: #6B7280;font-size: 24rpx;">客户成功预约后，会在这里显示</text>
			</view>
		</view>
		<view class="workbench-card">
			<view class="function-title">功能中心</view>
			<view class="function-list">
				<view class="function-item" v-for="item in functionList" :key="item.text"
					@click="handleQuickItem(item)">
					<view class="function-item-icon" :style="{ backgroundColor: item.bgColor }">
						<tech-icon :type="item.icon" size="36rpx" :color="item.iconColor" />
					</view>
					<view class="function-item-text">{{ item.text }}</view>
				</view>
			</view>
		</view>
		<!-- 状态更新弹窗 -->
		<uni-popup ref="statusPopup" type="center" :mask-click="false">
			<view class="status-popup">
				<view class="popup-header">
					<text class="popup-title">结束服务</text>
				</view>
				<view class="popup-content">
					<view class="upload-section">
						<text class="section-title">上传图片（可选）</text>
						<view class="image-list">
							<view v-for="(image, index) in uploadImages" :key="index" class="image-item">
								<image :src="image" mode="aspectFill" class="uploaded-image" />
								<view class="image-close" @click="removeImage(index)">×</view>
							</view>
							<view v-if="uploadImages.length < 9" class="image-upload-btn" @click="chooseImages">
								<tech-icon type="icon-tupian" size="48rpx" color="#ccc" />
								<text class="upload-text">添加图片</text>
							</view>
						</view>
					</view>
					<view class="remark-section">
						<text class="section-title">备注（可选）</text>
						<textarea v-model="remarkText" placeholder="请输入备注信息" class="remark-input" maxlength="200" />
						<text class="char-count">{{ remarkText.length }}/200</text>
					</view>
				</view>
				<view class="popup-actions">
					<button class="popup-btn btn-cancel" @click="closeStatusPopup">取消</button>
					<button class="popup-btn btn-confirm" @click="confirmUpdateStatus">确认结束</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import {
	updateLocation, getHomeStatistics,
	getReserveList, getHomeServiceStatus, updateHomeServiceStatus
} from '@/api/work'
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app"
import { ref, onMounted } from 'vue'
import { getOrderDetail, getUserPhone } from '@/api/order'
import { updateServiceStatus, remindReservation } from '@/api/order'
import { uploadFile } from '@/utils/request'
import { getAppInfo } from '@/api/login'
import { useStore } from 'vuex'
import { getUserInfo } from '@/api/my'
import { getImage } from '@/utils/request'
import { serviceStatus, actionList } from '@/config'
import dayjs from 'dayjs'
const store = useStore()
// 新增在线状态变量
const isOnline = ref(true)
const isRefreshing = ref(false)
const defaultImageUrl = ref('')
onMounted(async () => {
	getAppDetail()
	await updatelocation()
	await getData()
})
onShow(async () => {
	getData()
	setTimeout(async () => {
		defaultImageUrl.value = await getImage(store.state.appInfo.app.logo)
	}, 500)
	setTimeout(() => {
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		})
	}, 10)

})
function handleRemind(orderId) {
	remindReservation({
		orderId: orderId
	}).then(res => {
		setTimeout(() => {
			uni.showToast({ title: '提醒成功', icon: 'none' })
		}, 10)
		getData()
	})
}
function navigateToOrderDetail(orderId) {
	uni.navigateTo({
		url: `/pages/tabbars/order/detail?orderId=${orderId}`
	})
}
async function refreshProgress() {
	if (isRefreshing.value) return
	isRefreshing.value = true
	setTimeout(() => {
		isRefreshing.value = false
	}, 600) // 动画持续600ms
	await getData()
}
//计算服务中时间
function computedTime(startTime, serviceProjectDuration) {
	// 参数：开始时间，服务时长
	//根据当前时间计算一个大概的服务百分比
	const now = dayjs()
	const start = dayjs(startTime)
	const duration = serviceProjectDuration
	const currentPercent = now.diff(start, 'minute') / duration
	const resultPercent = (currentPercent * 100).toFixed(0) > 100 ? '已超时' : "服务中" + (currentPercent * 100).toFixed(0) + '%'
	const resultValue = (currentPercent * 100).toFixed(0) > 100 ? 100 : Number((currentPercent * 100).toFixed(0))
	return {
		percent: resultPercent,
		value: resultValue
	}
}
const myInfo = ref({})

//获取appinit参数后进行重定向
function getAppDetail() {
	getAppInfo().then(async res => {
		if (res.error === 0 && res.data.ext) {
			getUserInfo().then(async result => {
				myInfo.value = result.data
				myInfo.value.headImg = await getImage(result.data.headImg)
			})
		}
	})
}

// 导航
function openGuide(data) {
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

const data = ref({})
const serviceOrderDetail = ref(null)
const homeStatistics = ref({})
const reserveData = ref({})
const serviceStatusNum = ref()
function handleServiceStatus(status) {
	updateHomeServiceStatus({
		serviceStatus: status
	}).then(res => {
		uni.showToast({ title: res.msg, icon: 'success' })
		serviceStatusNum.value = status
	})
}

function getData() {
	// 查询详细信息
	// getOrderDetail(res.data.serviceOrder.orderNo).then(detailRes => {
	// 	serviceOrderDetail.value = detailRes.data
	// })
	getHomeStatistics().then(res => {
		homeStatistics.value = res.data

		// homeStatistics.value.upcoming = {
		// 	consignee: "张大大",
		// 	address: "浙江省杭州市西湖区天目山路34号",
		// 	lng: "120.140904",
		// 	lat: "30.271808",
		// 	mobile: "17318001005",
		// 	avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132",
		// 	serviceProjectName: "肩颈理疗",
		// 	serviceProjectDuration: 60,
		// 	serviceStatus: 1,
		// 	startTime: "2025-07-14T18:00:00.000+08:00",
		// 	bookDay: "20250714",
		// 	bookHourLabel: "18:00",
		// 	bookTimeStr: "07-14·18:00",
		// 	businessStatus: 3,
		// 	completeTime: "2025-07-12T16:11:31.000+08:00",
		// 	bookTime: "2025-07-14T18:00:00.000+08:00"
		// } //2小时内待服务的预约
	})
	getReserveList().then(res => {
		reserveData.value = res.data
		// reserveData.value.upcoming = {
		// 	consignee: "张大大",
		// 	address: "浙江省杭州市西湖区天目山路34号",
		// 	lng: "120.140904",
		// 	lat: "30.271808",
		// 	mobile: "17318001005",
		// 	avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132",
		// 	serviceProjectName: "肩颈理疗",
		// 	serviceProjectDuration: 60,
		// 	serviceStatus: 1,
		// 	startTime: "2025-07-14T18:00:00.000+08:00",
		// 	bookDay: "20250714",
		// 	bookHourLabel: "18:00",
		// 	bookTimeStr: "07-14·18:00",
		// 	businessStatus: 3,
		// 	completeTime: "2025-07-12T16:11:31.000+08:00",
		// 	bookTime: "2025-07-14T18:00:00.000+08:00"
		// } //2小时内待服务的预约
		// reserveData.value.inProgress = {
		// 	orderId: 1,
		// 	consignee: "张大大",
		// 	address: "浙江省杭州市西湖区天目山路34号",
		// 	lng: "120.140904",
		// 	lat: "30.271808",
		// 	mobile: "17318001005",
		// 	avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132",
		// 	serviceProjectName: "肩颈理疗",
		// 	serviceProjectDuration: 60,
		// 	serviceStatus: 5,
		// 	startTime: "2025-07-21T13:08:00.000+08:00",
		// 	bookDay: "20250716",
		// 	bookHourLabel: "15:00",
		// 	bookTimeStr: "07-16·15:00",
		// 	businessStatus: 3,
		// 	completeTime: "2025-07-12T16:11:31.000+08:00",
		// 	bookTime: "2025-07-16T15:00:00.000+08:00"
		// }
	})
	getHomeServiceStatus().then(res => {
		serviceStatusNum.value = res.data
	})
}

function navigateToMoreAppointments() {
	uni.navigateTo({
		url: '/pages/tabbars/workbench/more-appointments?type=toBeOrdered'
	})
}
const orderData = ref({})
function endService(data) {
	//打开弹窗
	statusPopup.value.open()
	orderData.value = data

}
const handleQuickItem = (item) => {
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
			title: '功能未开放',
			icon: 'none'
		})
	}
}

// 新增切换在线状态方法
const toggleOnlineStatus = () => {
	isOnline.value = !isOnline.value
	updateTechnicianStatus({
		serviceStatus: isOnline.value ? 0 : 1
	}).then(res => {
		uni.showToast({
			title: res.msg,
			icon: 'success'
		})
	})
}

const updatelocation = () => {
	uni.getLocation({
		type: 'gcj02',
		success: (res) => {
			const { latitude, longitude } = res
			updateLocation({
				lat: latitude.toFixed(7),
				lng: longitude.toFixed(7)
			}).then(res => {
				uni.showToast({
					title: res.msg,
					icon: 'success'
				})
			})
		}
	})
}

//功能中心
const functionList = ref([
	{
		icon: 'icon-shourumingxi',
		text: '收入明细',
		iconColor: '#ff6b35',
		bgColor: '#ffece5',
		url: '/pages/tabbars/income/index',
		tabbar: true
	},
	{
		icon: 'icon-tixian1',
		text: '提现',
		iconColor: '#ff9500',
		bgColor: '#fff1de',
		url: '/pages/tabbars/profile/withdrawal'
	},
	{
		icon: 'icon-shezhi1',
		text: '接单设置',
		iconColor: '#5856d6',
		bgColor: '#e9e9fa',
		url: '/pages/tabbars/workbench/orderSetting'
	},
	{
		icon: 'icon-a-zaixianxuexikaoshipeixunkecheng-60',
		text: '课程培训',
		iconColor: '#ff2d55',
		bgColor: '#ffe4e9',
		url: ''
	},
	{
		icon: 'icon-pingjiaguanli',
		text: '评价管理',
		iconColor: '#ffcc00',
		bgColor: '#fff9de',
		url: ''
	},
	{
		icon: 'icon-header-07',
		text: '客户管理',
		iconColor: '#34c759',
		bgColor: '#e5f8ea',
		url: ''
	},
	{
		icon: 'icon-jinengrenzheng',
		text: '技能认证',
		iconColor: '#af52de',
		bgColor: '#f5e9fb',
		url: ''
	},
	{
		icon: 'icon-bangzhuzhongxin',
		text: '帮助中心',
		iconColor: '#ff9500',
		bgColor: '#fff1de',
		url: ''
	},
])

onPullDownRefresh(async () => {
	updatelocation()
	await getData()
	uni.stopPullDownRefresh()
})
async function openContactPopup(data) {
	let consignee = null
	let mobile = null
	if (data.orderId) {
		const res = await getUserPhone(data.orderId)
		consignee = res.data.consignee
		mobile = res.data.mobile
	} else {
		consignee = data.consignee
		mobile = data.mobile
	}
	uni.showModal({
		title: '联系人信息',
		content: `姓名：${consignee}\n手机号：${mobile}`,
		confirmText: '拨打电话',
		success: (res) => {
			if (res.confirm) {
				uni.makePhoneCall({ phoneNumber: mobile })
			}
		}
	})
}
// 弹窗相关数据
const statusPopup = ref(null)
const uploadImages = ref([])
const remarkText = ref('')
const currentOrderNo = ref('')
const currentServiceStatus = ref('')

// 选择图片
function chooseImages() {
	uni.chooseImage({
		count: 9 - uploadImages.value.length,
		sizeType: ['original', 'compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			uploadImages.value.push(...res.tempFilePaths)
		}
	})
}
// 移除图片
function removeImage(index) {
	uploadImages.value.splice(index, 1)
}
// 关闭弹窗
function closeStatusPopup() {
	statusPopup.value.close()
	uploadImages.value = []
	remarkText.value = ''
	currentOrderNo.value = ''
	currentServiceStatus.value = ''
}
// 打开弹窗
function updateOrderStatus(orderNo, serviceStatus) {
	currentOrderNo.value = orderNo
	currentServiceStatus.value = serviceStatus
	statusPopup.value.open()
}
// 确认更新
async function confirmUpdateStatus() {
	uni.showLoading({ title: '更新中...' })
	try {
		const photos = []
		if (uploadImages.value.length > 0) {
			for (const image of uploadImages.value) {
				const result = await uploadFile(image)
				if (result && result.path) {
					photos.push(result.path)
				}
			}
		}
		const locationResult = await new Promise((resolve, reject) => {
			uni.getLocation({ type: 'gcj02', success: resolve, fail: reject })
		})
		const res = await updateServiceStatus({
			orderId: orderData.value.orderId,
			action: 'completed',
			lng: locationResult.longitude,
			lat: locationResult.latitude,
			remark: remarkText.value,
			photos: photos
		})
		if (res.error === 0) {
			uni.showToast({ title: '状态已更新', icon: 'success' })
			closeStatusPopup()
			await getData()
		} else {
			uni.showToast({ title: res.msg || '更新失败', icon: 'none' })
		}
	} catch (error) {
		console.error('更新状态失败:', error)
		uni.showToast({ title: '更新失败', icon: 'none' })
	} finally {
		uni.hideLoading()
	}
}
</script>

<style lang="scss" scoped>
.workbench-container {
	background: var(--background-color);
	box-sizing: border-box;
	padding: 24rpx 20rpx 40rpx 20rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.header-left-title {
	font-size: 28rpx;
	color: #fff;
}

.header-right-title {
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-right-title-item {
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-right-title-item-img {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-left: 16rpx;
}

.workbench-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 20rpx 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
	min-height: 300rpx;

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		text {
			font-size: 28rpx;
			color: #000;
			margin-top: 20rpx;
		}
	}
}

.card-top {
	display: flex;
	align-items: center;
	gap: 10rpx;
	border-bottom: 1px solid #f2f2f7;
	padding-bottom: 20rpx;

	image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
	}

	.card-name {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		margin-left: 20rpx;

		&>text:last-child {
			color: #888;
			font-size: 24rpx;
		}
	}

	.card-time {
		font-size: 24rpx;
		color: #888;
		margin-left: auto;
		margin-right: 10rpx;
	}

	.card-status {
		font-size: 24rpx;
		padding: 10rpx 20rpx;
		background: #EFF6FF;
		color: #3B82F6;
		border-radius: 24rpx;

		&.toBeDone {
			background: var(--theme-color-light);
			color: var(--theme-color);
		}
	}
}

.card-middle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 20rpx;
	border-bottom: 1px solid #f2f2f7;
	padding-bottom: 20rpx;

	.middle-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10rpx;
		width: 100%;

		.left-title {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			justify-items: space-between;
			gap: 20rpx;
			font-size: 24rpx;
			color: #EF4444;
		}

		.left-right {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 10rpx;
			font-size: 24rpx;
			margin-left: auto;
			padding: 10rpx 20rpx;
			background-color: #F3F4F6;
			border-radius: 24rpx;
		}
	}

	.middle-left {
		width: 65%;

		.left-title {
			font-size: 24rpx;
			margin-bottom: 10rpx;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 10rpx;
			color: #3B82F6;
		}
	}

	.middle-right {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		font-size: 24rpx;
		background-color: #F3F4F6;
		padding: 10rpx 20rpx;
		border-radius: 24rpx;
		color: #3B82F6;
	}
}

.card-bottom {
	display: flex;
	flex-direction: column;
	margin-top: 20rpx;

	.bottom-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10rpx;
		margin-top: 30rpx;

		.bottom-button-item {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			font-size: 24rpx;
			border-radius: 16rpx;
			flex: 1;
			padding: 8rpx 20rpx;
			height: 60rpx;
			line-height: 60rpx;
			background-color: #fff;
			border: 1px solid #E5E7EB;

			&::after {
				border: none;
			}

			&.bottom-button-item-left {
				color: #4B5563;
			}

			&.bottom-button-item-right {
				color: var(--theme-color);
				border: 1px solid var(--theme-color);
			}
		}
	}

	.bottom-top {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 10rpx;
		font-size: 24rpx;
		color: #888;
		margin-bottom: 10rpx;
	}

	.bottom-middle {
		font-size: 24rpx;
		color: #fff;
		background-color: #3B82F6;
		padding: 10rpx 20rpx;
		height: 50rpx;
		border-radius: 12rpx;
		line-height: 50rpx;
		text-align: center;
		margin-top: 30rpx;
	}
}

.card-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.status-radius {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #43cf7c;
	margin-left: 16rpx;
}

.rest-radius {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #f8f8f8;
	margin-left: 16rpx;
}

.workbench-btn {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.workbench-btn-begin {
	background: var(--theme-color);
	color: #fff;
	border: none;
	border-radius: 16rpx;
	padding: 0rpx 105rpx;
	font-size: 26rpx;

	&::after {
		border: none;
	}
}

.workbench-btn-stop {
	background: #f8f8f8;
	color: #222;
	border: none;
	border-radius: 16rpx;
	padding: 0rpx 105rpx;
	font-size: 26rpx;
	border: 1px solid #dfe2e6;

	&::after {
		border: none;
	}
}

.reservation-order {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 16rpx;
	font-size: 24rpx;
	border-radius: 16rpx;
	border: 1px solid var(--theme-color);
	padding: 20rpx;
	background: var(--theme-color-light);
	color: var(--theme-color);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.workbench-list {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid #F3F4F6;
	padding-top: 20rpx;
	margin-top: 40rpx;
}

.workbench-list-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;

	.workbench-number {
		font-size: 32rpx;
		font-weight: bold;
		color: var(--theme-color);
		margin-right: 10rpx;
	}

	.workbench-text {
		font-size: 24rpx;
		color: #888;
		margin-top: 10rpx;
	}
}

.appointment {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.appointment-more {
		font-size: 24rpx;
		color: var(--theme-color);
	}
}

.appointment-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.appointment-address {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.appointment-address-item {
		font-size: 24rpx;
		color: #888;
	}
}

.appointment-proName {
	font-size: 24rpx;
	color: #888;
	margin-top: 30rpx;
	padding: 20rpx;
	background-color: #f9fafb;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	display: flex;
	gap: 16rpx;
	flex-direction: column;
}

.appointment-btn {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.appointment-btn-outline {
	background: #fff;
	color: #4B5563;
	border: 1px solid #d6d9df;
	border-radius: 16rpx;
	width: 45%;
	height: 80rpx;
	font-size: 26rpx;
	line-height: 80rpx;

	&::after {
		border: none;
	}
}

.appointment-btn-main {
	color: var(--theme-color);
	border: 1px solid var(--theme-color);
	border-radius: 16rpx;
	width: 45%;
	height: 80rpx;
	font-size: 26rpx;
	line-height: 80rpx;
	background-color: #fff;

	&::after {
		border: none;
	}
}

// 一行四个，两行显示
.function-list {
	display: grid;
	grid-template-columns: repeat(4, 0.5fr);
	gap: 10rpx;
	margin-top: 24rpx;

	.function-item {
		background: #fff;
		border-radius: 16rpx;
		padding: 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10rpx;

		.function-item-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.function-item-text {
			font-size: 22rpx;
			color: #222;
		}
	}
}




.income-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 32rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.income-title {
	color: #888;
	font-size: 24rpx;
}

.income-amount {
	color: #222;
	font-size: 48rpx;
	font-weight: bold;
	margin: 8rpx 0;
}

.income-extra {
	color: #888;
	font-size: 22rpx;
}

.income-up {
	color: #43cf7c;
}

.income-status {
	padding: 8rpx 28rpx;
	border-radius: 32rpx;
	font-size: 24rpx;
	font-weight: bold;
	background-color: #f2f2f7;

	&.online {
		background: #43cf7c;
		color: #fff;
	}
}

.order-card {
	.order-title {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.title-item {
			font-size: 28rpx;
			color: #222;
		}
	}

	.order-cation {
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		min-height: 120rpx;
		text-align: center;
		line-height: 120rpx;
	}
}

.order-icon {
	margin-right: 20rpx;
}

.order-info {
	flex: 1;
}

.order-desc {
	font-size: 22rpx;
	color: #888;
	margin-top: 8rpx;
}

.order-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	height: 100%;
}

.order-timer {
	color: #007aff;
	font-size: 22rpx;
	margin-bottom: 12rpx;
}

.order-btn {
	background: #007aff;
	color: #fff;
	border: none;
	border-radius: 32rpx;
	padding: 0rpx 32rpx;
	font-size: 26rpx;
	font-weight: bold;
}

.data-overview {

	.data-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;

		.data-title-item {
			font-size: 28rpx;
			color: #222;
		}

		.icon {
			font-size: 28rpx;
			color: var(--theme-color);
		}
	}

	.data-card {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.data-item {
			flex: 1;

		}
	}
}

.data-item {
	background: #fff;
	border-radius: 16rpx;
	flex: 1;
	margin: 0 8rpx;
	padding: 24rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.data-item:first-child {
	margin-left: 0;
}

.data-item:last-child {
	margin-right: 0;
}

.data-title {
	color: #888;
	font-size: 22rpx;
}

.data-value {
	color: var(--theme-color);
	font-size: 32rpx;
	font-weight: bold;
}

.quick-actions {
	.quick-title {
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}
}

.quick-row {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
	margin-bottom: 60rpx;
}

.quick-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: #222;
	font-size: 22rpx;
	width: 120rpx;
	height: 120rpx;
	justify-content: center;
	margin: 0 auto;

	.icon {
		font-size: 40rpx;
		border-radius: 50%;
		background-color: #fff;
		padding: 14rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
	}
}

.quick-item text {
	margin-top: 8rpx;
	font-size: 28rpx;
	color: #666;
}

.order-status-bar {
	width: 180rpx;
	height: 50rpx;
	line-height: 50rpx;
	text-align: center;
	border-radius: 32rpx;
	font-size: 24rpx;
	margin-bottom: 18rpx;
	margin-top: 24rpx;

	// 状态色
	&.status-pending {
		background: #ffb300;
		color: #fff;
	}

	&.status-wait {
		background: var(--theme-color);
		color: #fff;
	}

	&.status-go {
		background: #43cf7c;
		color: #fff;
	}

	&.status-arrive {
		background: #007aff;
		color: #fff;
	}

	&.status-doing {
		background: #3c9cff;
		color: #fff;
	}

	&.status-done {
		background: #bbb;
		color: #fff;
	}

	&.status-cancel {
		background: #ff4d4f;
		color: #fff;
	}
}

.order-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;

	.order-title {
		font-size: 28rpx;
		color: #222;
		font-weight: bold;
	}

	.order-datetime {
		color: #888;
		font-size: 22rpx;
	}
}

.order-address {
	display: flex;
	align-items: center;
	color: #888;
	font-size: 22rpx;
	margin-bottom: 12rpx;

	uni-icons {
		margin-right: 8rpx;
	}
}

.order-amount {
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 16rpx;
	margin-bottom: 16rpx;

	.amount-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;

		&:last-child {
			margin-bottom: 0;
			padding-top: 8rpx;
			border-top: 1px solid #eee;
		}

		.amount-label {
			font-size: 24rpx;
			color: #666;
		}

		.amount-value {
			font-size: 24rpx;
			color: #333;

			&.highlight {
				color: #ff4d4f;
				font-weight: bold;
			}
		}
	}
}

.order-map {
	margin-bottom: 16rpx;
}

.order-card-actions {
	display: flex;
	justify-content: space-between;
	margin-top: 8rpx;

	button {
		flex: 1;
		margin-right: 12rpx;
		border-radius: 18rpx;
		font-size: 20rpx;
		padding: 0 0;
		height: 62rpx;
		background: #fff;
		border: 2rpx solid var(--theme-color);
		color: var(--theme-color);
		display: flex;
		align-items: center;
		justify-content: center;

		uni-icons {
			margin-right: 4rpx;
			font-size: 20rpx;
		}
	}

	.order-btn-main {
		background: var(--theme-color);
		color: #fff;
		border: none;
		margin-right: 0;
	}
}

.status-popup {
	background: #fff;
	border-radius: 20rpx;
	width: 90vw;
	max-width: 700rpx;
	min-width: 0;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx 32rpx 24rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	text-align: left;
}

.popup-content {
	padding: 32rpx;
	max-height: 60vh;
	overflow-y: auto;
	width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.upload-section,
.remark-section {
	width: 100%;
	position: relative;
	margin-bottom: 32rpx;
}

.image-list {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-top: 16rpx;
}

.image-item,
.image-upload-btn {
	width: 120rpx;
	height: 120rpx;
	position: relative;
}

.uploaded-image {
	width: 100%;
	height: 100%;
	border-radius: 8rpx;
	position: relative;
}

.image-close {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	width: 32rpx;
	height: 32rpx;
	line-height: 32rpx;
	background: #ff4757;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	font-weight: bold;
}

.image-upload-btn {
	border: 2rpx dashed #ddd;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
}

.upload-text {
	font-size: 20rpx;
	color: #999;
	margin-top: 8rpx;
}

.remark-input {
	width: 100%;
	height: 160rpx;
	padding: 16rpx;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	resize: none;
}

.char-count {
	position: absolute;
	bottom: 8rpx;
	right: 16rpx;
	font-size: 24rpx;
	color: #999;
}

.popup-actions {
	display: flex;
	gap: 16rpx;
	padding: 24rpx 32rpx 32rpx 32rpx;
	border-top: 1rpx solid #f0f0f0;
}

.popup-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;
	width: 100%;
	line-height: 80rpx;

	&::after {
		border: none;
	}
}

.btn-cancel {
	background: #f8f9fa;
	color: #666;
}

.icon-rotate {
	animation: rotate 0.6s linear infinite;
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.btn-confirm {
	background: linear-gradient(90deg, var(--theme-color), var(--theme-color-linear));
	color: #fff;
}
</style>