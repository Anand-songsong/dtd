<template>
	<view class="change-phone">
		<tech-header title="验证原手机号">
			<template #left>	
				<tech-icon type="icon-xiangzuojiantou" size="30rpx" color="#fff" @click="handleBack" />
			</template>
		</tech-header>
		<view class="form-group">
			<!-- 第一步：验证原手机号 -->
			<template v-if="step === 'check'">
				<view class="form-item">
					<text class="label">原手机号</text>
					<text class="value">{{ mobile }}</text>
				</view>
				<view class="form-item">
					<text class="label">验证码</text>
					<view class="code-input">
						<input 
							type="number" 
							v-model="checkCode" 
							placeholder="请输入验证码"
							maxlength="6"
							class="input"
						/>
						<button 
							class="code-btn" 
							:disabled="counting > 0"
							@click="sendCheckCode"
						>
							{{ counting > 0 ? `${counting}s后重发` : '获取验证码' }}
						</button>
					</view>
				</view>
			</template>
			
			<!-- 第二步：输入新手机号 -->
			<template v-else>
				<view class="form-item">
					<text class="label">新手机号</text>
					<input 
						type="number" 
						v-model="newMobile" 
						placeholder="请输入新手机号"
						maxlength="11"
						class="input"
					/>
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
							@click="sendNewCode"
						>
							{{ counting > 0 ? `${counting}s后重发` : '获取验证码' }}
						</button>
					</view>
				</view>
			</template>
		</view>
		
		<button class="submit-btn" @click="submitChange">
			{{ step === 'check' ? '验证原手机号' : '确认修改' }}
		</button>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { sendSmsCode, changePhone } from '@/api/login'

const mobile = ref('')
const newMobile = ref('')
const code = ref('')
const checkCode = ref('')
const counting = ref(0)
const step = ref('check') // 'check' 或 'change'
let timer = null
function handleBack(){
	uni.navigateBack()
}
onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	mobile.value = currentPage.$page?.options?.mobile || ''
})

// 发送原手机号验证码
async function sendCheckCode() {
	try {
		await sendSmsCode({
			mobile: mobile.value,
			event: 'changeMobile'
		})
		
		startCounting()
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

// 发送新手机号验证码
async function sendNewCode() {
	if (!newMobile.value) {
		uni.showToast({
			title: '请输入新手机号',
			icon: 'none'
		})
		return
	}
	
	if (!/^1[3-9]\d{9}$/.test(newMobile.value)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}
	
	try {
		await sendSmsCode({
			mobile: newMobile.value,
			event: 'changeMobile'
		})
		
		startCounting()
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

// 开始倒计时
function startCounting() {
	counting.value = 60
	timer = setInterval(() => {
		counting.value--
		if (counting.value <= 0) {
			clearInterval(timer)
		}
	}, 1000)
}

// 提交修改
async function submitChange() {
	if (step.value === 'check') {
		// 验证原手机号
		if (!checkCode.value) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			})
			return
		}
		
		try {
			await changePhone({
				mobile: mobile.value,
				checkCode: checkCode.value,
				step: 'check'
			})
			
			// 验证通过，进入第二步
			step.value = 'change'
			checkCode.value = ''
			counting.value = 0
			clearInterval(timer)
		} catch (error) {
			uni.showToast({
				title: '验证失败',
				icon: 'none'
			})
		}
	} else {
		// 修改新手机号
		if (!newMobile.value) {
			uni.showToast({
				title: '请输入新手机号',
				icon: 'none'
			})
			return
		}
		
		if (!code.value) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			})
			return
		}
		
		try {
			await changePhone({
				mobile: newMobile.value,
				code: code.value,
				step: 'change'
			})
			
			uni.showToast({
				title: '修改成功',
				icon: 'success'
			})
			
			// 返回账号页面
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} catch (error) {
			uni.showToast({
				title: '修改失败',
				icon: 'none'
			})
		}
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
.change-phone {
	min-height: 100vh;
	background-color: var(--background-color);
}

.form-group {
	background: #fff;
	border-radius: 16rpx;
	padding: 0 24rpx;
	margin-bottom: 40rpx;
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