<template>
	<view>
		<view class="account-page">
		<view class="account-section">
			<view class="avatar-row">
				<image :src="userInfo.avatar" class="avatar" />
				<view class="nickname">{{ userInfo.nickname }}</view>
			</view>
			<view class="info-row" @tap="goToChangePhone">
				<text>手机号</text>
				<view class="info-right">
					<text>{{ userInfo.mobile }}</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
			<view class="info-row" @click="openUsernamePopup">
				<text>用户名</text>
				<view class="info-right">
					<text>{{ userInfo.username }}</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
			<view class="info-row"><text>性别</text><text>{{ userInfo.gender == 1 ? '女' : userInfo.gender == 0 ? '男' : '未知' }}</text></view>
			<view class="info-row"><text>第三方绑定</text>
				<text v-if="userInfo.thirdOauth.length === 0">无</text>
				<text v-else>{{ userInfo.thirdOauth.map(i=>i.platform).join('、') }}</text>
			</view>
			<!-- <view class="info-row"><text>邮箱验证</text><text :class="{ok:userInfo.verification?.email}">{{ userInfo.verification?.email ? '已绑定' : '未绑定' }}</text></view> -->
			<!-- <view class="info-row">
				<text>手机号验证</text>
				<view class="info-right">
					<text :class="{ok:userInfo.verification?.mobile}">{{ userInfo.verification?.mobile ? '已绑定' : '未绑定' }}</text>
				</view>
			</view> -->
			<view class="info-row" @tap="goToChangePassword">
				<text>密码设置</text>
				<view class="info-right">
					<text :class="{ok:userInfo.verification?.password}">{{ userInfo.verification?.password ? '已设置' : '未设置' }}</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
			<view class="info-row">
				<text>用户名设置</text>
				<view class="info-right">
					<text :class="{ok:userInfo.verification?.username}">{{ userInfo.verification?.username ? '已设置' : '未设置' }}</text>
				</view>
			</view>
		</view>
		<view class="danger-row" @click="deleteAccount">注销账号</view>
		<button class="logout-btn" @click="logout">退出登录</button>
        </view>

		<!-- 用户名编辑弹窗 -->
		<uni-popup ref="usernamePopup" type="center">
			<view class="popup-content">
				<view class="popup-title">修改用户名</view>
				<input 
					class="username-input" 
					v-model="editUsername" 
					placeholder="请输入用户名"
					maxlength="20"
				/>
				<view class="popup-btns">
					<button class="popup-btn cancel" @click="closeUsernamePopup">取消</button>
					<button class="popup-btn confirm" @click="submitUsername">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { getCurrentUserInfo } from '@/api/my'
import { ref, onMounted } from 'vue'
import { onShow , onPullDownRefresh } from '@dcloudio/uni-app'
import { getImage } from '@/utils/request'
import { deleteAccountOut, logOut, changeName  } from '@/api/login'
import { removeToken } from '@/utils/auth'
const userInfo = ref({
	avatar: '',
	nickname: '',
	mobile: '',
	gender: 1,
	username: '',
	thirdOauth: [],
	verification: {},
	appId: '',
})

const usernamePopup = ref(null)
const editUsername = ref('')

onMounted(() => {
	getUser()
})

onShow(() => {
	getUser()
})
onPullDownRefresh(() => {
	getUser()
	uni.stopPullDownRefresh()
})

async function getUser() {
	const res = await getCurrentUserInfo()
	userInfo.value = res.data
	if (userInfo.value.avatar) {
		userInfo.value.avatar = await getImage(userInfo.value.avatar)
	}
}

function logout() {
	// 退出登录逻辑
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: async (res) => {
			if (res.confirm) {
				// 清除token等
                await logOut()
				removeToken()
				uni.reLaunch({ url: '/pages/login/index' })
			}
		}
	})
}

async function deleteAccount() {
	uni.showModal({
		title: '注销账号',
		content: '注销账号后将无法恢复，确定要注销吗？',
		success: async (res) => {
			if (res.confirm) {
				// 调用注销接口
                await deleteAccountOut()
				uni.showToast({ title: '已注销', icon: 'none' })
			}
		}
	})
}

// 打开用户名编辑弹窗
function openUsernamePopup() {
	editUsername.value = userInfo.value.username
	usernamePopup.value.open()
}

// 关闭用户名编辑弹窗
function closeUsernamePopup() {
	usernamePopup.value.close()
}

// 提交用户名修改
async function submitUsername() {
	if (!editUsername.value.trim()) {
		uni.showToast({
			title: '用户名不能为空',
			icon: 'none'
		})
		return
	}
	
	try {
		await changeName({
			username: editUsername.value.trim()
		})
		userInfo.value.username = editUsername.value.trim()
		uni.showToast({
			title: '修改成功',
			icon: 'success'
		})
		closeUsernamePopup()
	} catch (error) {
		uni.showToast({
			title: '修改失败',
			icon: 'none'
		})
	}
}

// 跳转到修改手机号页面
function goToChangePhone() {
	uni.navigateTo({
		url: `/pages/tabbars/profile/changePhone?mobile=${userInfo.value.mobile}`
	})
}

// 跳转到修改密码页面
function goToChangePassword() {
	uni.navigateTo({
		url: `/pages/tabbars/profile/changePassword?mobile=${userInfo.value.mobile}`
	})
}
</script>

<style scoped>
.account-page {
	padding: 30rpx;
	background: var(--background-color);
	height: calc(100vh - 60rpx);
}
.account-section {
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.04);
	padding: 30rpx 24rpx 10rpx 24rpx;
	margin-bottom: 40rpx;
}
.avatar-row {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}
.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 24rpx;
	border: 2rpx solid #1677ff;
}
.nickname {
	font-size: 32rpx;
	color: #1677ff;
	font-weight: bold;
}
.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 18rpx 0;
	border-bottom: 1px solid #e0eaff;
	font-size: 28rpx;
	color: #333;
}
.info-row:last-child {
	border-bottom: none;
}
.info-row text.ok {
	color: #1677ff;
}
.danger-row {
	width: 100%;
	background: #fff0f0;
	color: #ff4d4f;
	text-align: center;
	padding: 28rpx 0;
	border-radius: 12rpx;
	font-size: 30rpx;
	margin-bottom: 40rpx;
	margin-top: 10rpx;
	border: 1rpx solid #ffb3b3;
}
.logout-btn {
	width: 100%;
	background: linear-gradient(90deg, #1677ff 0%, #69a6ff 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	padding: 18rpx 0;
	margin-top: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
}

.info-right {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.popup-content {
	background: #fff;
	border-radius: 16rpx;
	padding: 40rpx;
	width: 560rpx;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.username-input {
	border: 1px solid #e0eaff;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	margin-bottom: 30rpx;
}

.popup-btns {
	display: flex;
	gap: 20rpx;
}

.popup-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.popup-btn.cancel {
	background: #f5f5f5;
	color: #666;
}

.popup-btn.confirm {
	background: #1677ff;
	color: #fff;
}
</style>