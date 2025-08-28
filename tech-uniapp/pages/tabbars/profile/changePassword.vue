<template>
	<view class="change-password">
		<tech-header :title="title" backgroundColor="#fff" titleColor="#000">
			<template #left>
				<tech-icon type="icon-xiangzuojiantou" size="30rpx" color="#000" @click="handleBack" />
			</template>
		</tech-header>
		<view class="form-group">
			<view class="form-item">
				<text class="label">手机号</text>
				<text class="value">{{ mobile }}</text>
			</view>
			<view class="form-item">
				<text class="label">验证码</text>
				<view class="code-input">
					<input 
						type="number" 
						v-model="code" 
						placeholder="请输入验证码"
						maxlength="6"
						class="input"
					/>
					<button 
						class="code-btn" 
						:disabled="counting > 0"
						@click="sendCode"
					>
						{{ counting > 0 ? `${counting}s后重发` : '获取验证码' }}
					</button>
				</view>
			</view>
			<view class="form-item">
				<text class="label">新密码</text>
				<input 
					type="password" 
					v-model="password" 
					placeholder="请输入新密码"
					class="input"
				/>
			</view>
			<view class="form-item">
				<text class="label">确认密码</text>
				<input 
					type="password" 
					v-model="confirmPassword" 
					placeholder="请再次输入新密码"
					class="input"
				/>
			</view>
		</view>
		
		<button class="submit-btn" @click="submitChange">确认修改</button>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { sendSmsCode, resetPassword } from '@/api/login'
import { getCurrentUserInfo } from '@/api/my'
const mobile = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const counting = ref(0)
let timer = null
const title = ref('修改密码')
async function getUserInfo(){
	await getCurrentUserInfo().then(res => {
		title.value = res.data.verification.password?'修改密码':'设置密码'
	})
}
onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	mobile.value = currentPage.$page?.options?.mobile || ''
	getUserInfo()
})
function handleBack(){
	uni.navigateBack()
}
// 发送验证码
async function sendCode() {
	try {
		await sendSmsCode({
			mobile: mobile.value,
			event: 'resetPassword'
		})
		
		// 开始倒计时
		counting.value = 60
		timer = setInterval(() => {
			counting.value--
			if (counting.value <= 0) {
				clearInterval(timer)
			}
		}, 1000)
		
		uni.showToast({
			title: '验证码已发送',
			icon: 'success'
		})
	} catch (error) {
		uni.showToast({
			title: '发送失败',
			icon: 'none'
		})
	}
}

// 提交修改
async function submitChange() {
	if (!code.value) {
		uni.showToast({
			title: '请输入验证码',
			icon: 'none'
		})
		return
	}
	
	if (!password.value) {
		uni.showToast({
			title: '请输入新密码',
			icon: 'none'
		})
		return
	}
	
	if (password.value.length < 6) {
		uni.showToast({
			title: '密码长度不能小于6位',
			icon: 'none'
		})
		return
	}
	
	if (password.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		})
		return
	}
	
	try {
		await resetPassword({
			mobile: mobile.value,
			code: code.value,
			password: password.value
		})
		
		uni.showToast({
			title: '修改成功',
			icon: 'success'
		})
		
		// 返回账号页面
		setTimeout(() => {
			uni.navigateBack()
		}, 800)
	} catch (error) {
		uni.showToast({
			title: '修改失败',
			icon: 'none'
		})
	}
}

// 组件销毁时清除定时器
onUnmounted(() => {
	if (timer) {
		clearInterval(timer)
	}
})
</script>

<style lang="scss" scoped>
.change-password {
	min-height: 100vh;
	background-color: var(--background-color);
}

.form-group {
	padding: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
	margin: 20rpx;
}

.form-item {
	padding: 30rpx 0;
	border-bottom: 1px solid #e0eaff;
	
	&:last-child {
		border-bottom: none;
	}
}

.label {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 16rpx;
	display: block;
}

.value {
	font-size: 28rpx;
	color: #666;
}

.input {
	width: 95%;
	height: 80rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}

.code-input {
	display: flex;
	gap: 20rpx;
	
	.input {
		flex: 1;
	}
	
	.code-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: var(--theme-color);
		color: #fff;
		font-size: 24rpx;
		border-radius: 8rpx;
		padding: 0;
		
		&:disabled {
			background: #ccc;
		}
	}
}

.submit-btn {
	width: 95%;
	height: 88rpx;
	line-height: 88rpx;
	background: var(--theme-color);
	color: #fff;
	font-size: 32rpx;
	border-radius: 12rpx;
	border: none;
	box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
}
</style>