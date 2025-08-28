<template>
	<view>
		<view class="income-detail">
			<view class="income-detail-item">
				<view class="income-detail-item-title">
					<text>收入明细</text>
				</view>
			</view>
			<view v-if="incomeList.length > 0" class="income-list">
				<view v-for="(item, index) in incomeList" :key="index" class="income-item">
					<view class="income-item-left">
						<view class="income-type">{{ item.orderType === 'message' ? '服务' : '路费' }}</view>
						<view class="income-time">{{ formatDate(item.successTime) }}</view>
					</view>
					<view class="income-item-right">
						<view class="income-amount" :class="item.type == '1' ? 'income-in' : 'income-out'">
							{{ item.type == '1' ? '+' : '-' }}{{ item.amount }}
						</view>
						<view class="income-order">订单号：{{ item.orderNo }}</view>
					</view>
				</view>
			</view>
			<view v-else class="empty-data">
				<image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
				<text class="empty-text">暂无数据</text>
			</view>
			<view v-if="loading" class="loading">加载中...</view>
			<view v-if="!hasMore && incomeList.length > 0" class="no-more">没有更多数据了</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { getIncomeDetail } from '@/api/work'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'

const incomeList = ref([])
const page = ref(1)
const loading = ref(false)
const hasMore = ref(true)

// 格式化日期
const formatDate = (date) => {
	//返回yyyy-mm-dd HH：mm：ss，数据格式2025-06-06T19:17:12.000+08:00
	return date.split('T')[0] + ' ' + date.split('T')[1].split('.')[0]
}

// 获取收入明细数据
const getIncomeList = async (isLoadMore = false) => {
	if (loading.value || !hasMore.value) return
	loading.value = true
	
	try {
		const res = await getIncomeDetail({
			page: page.value,
			listRows: 6
		})
		
		if (res.error === 0) {
			const { data } = res.data
			if (isLoadMore) {
				incomeList.value = [...incomeList.value, ...data]
			} else {
				incomeList.value = data
			}
			
			hasMore.value = data.length === 6
			if (hasMore.value) {
				page.value++
			}
		}
	} catch (error) {
		console.error('获取收入明细失败:', error)
	} finally {
		loading.value = false
	}
}

onLoad(() => {
	getIncomeList()
})

onReachBottom(() => {
	getIncomeList(true)
})
</script>

<style lang="scss" scoped>
.income-detail {
	padding: 20rpx;
	background: var(--background-color);
	min-height: 100vh;
	.income-list {
		margin-top: 20rpx;
		
		.income-item {
			display: flex;
			justify-content: space-between;
			padding: 20rpx;
			background-color: #fff;
			margin-bottom: 20rpx;
			border-radius: 8rpx;
			border-bottom: 1rpx solid #e5e5e5;
			.income-item-left {
				.income-type {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 10rpx;
				}
				
				.income-time {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.income-item-right {
				text-align: right;
				
				.income-amount {
					font-size: 32rpx;
					font-weight: bold;
					margin-bottom: 10rpx;
					
					&.income-in {
						color: #07c160;
					}
					
					&.income-out {
						color: #ff4d4f;
					}
				}
				
				.income-order {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
	
	.empty-data {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		
		.empty-image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 20rpx;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.loading, .no-more {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 24rpx;
	}
}
</style>