<template>
    <view class="withdrawal-record">
        <view class="header-fixed">
            <tech-header backgroundColor="#fff" title="提现记录" titleColor="#000">
                <template #left>
                    <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#000" @click="handleBack" />
                </template>
            </tech-header>
        </view>
        <view class="record-list-wrapper">
            <text class="record-list-wrapper-title">历史提现总额</text>
            <text class="record-list-wrapper-amount">￥{{ withdrawalStat.totalWithdrawAmount }}</text>
            <text class="record-list-wrapper-count">共{{ withdrawalStat.totalWithdrawCount }}次申请提现</text>
        </view>
        <scroll-view class="record-list" scroll-y @scrolltolower="loadMore" :refresher-enabled="true"
            :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
            <view class="record-item" v-for="(item, index) in recordList" :key="index">
                <view class="card-top">
                    <view class="price">￥{{ item.wdAmount }}</view>
                    <view class="status" :class="getStatusClass(item.status)">
                        <tech-icon :type="getIcon(item.status).type" size="24rpx" :color="getIcon(item.status).color" />
                        {{ getStatusText(item.status) }}
                    </view>
                </view>
                <view class="card-middle">
                    <view class="card-icon">
                        <tech-icon type="icon-yinhangqia" size="32rpx" color="#16A34A" />
                    </view>
                    <view class="card-in">{{ }}{{ }}</view>
                </view>
                <view class="card-bottom">
                    <tech-icon type="icon-shijian" size="24rpx" color="#999" />
                    <text>申请时间：{{}}</text>
                    <text class="status-text" v-if="item.status === 1">待审核</text>
                    <text class="status-text" v-if="item.status === 2">预计到账：1-2个在工作日</text>
                    <text class="status-text" v-if="item.status === 3">到账时间：{{ item.successTime }}</text>
                    <text class="status-text reason" v-if="item.status === 4">原因：{{ item.reason }}</text>
                </view>
            </view>
            <view class="loading" v-if="loading">
                <text>加载中...</text>
            </view>
            <view class="no-more" v-if="noMore && recordList.length > 0">
                <text>没有更多数据了</text>
            </view>
            <tech-noData text="暂无提现记录" v-else-if="!loading && recordList.length === 0" />
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWithdrawalRecord , getWithdrawalStat } from '@/api/my';

// 分页参数
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);
const isRefreshing = ref(false);
const recordList = ref([]);
const total = ref(0);
const totalAmount = ref(0);
const withdrawalStat = ref({});
//获取提现统计
const getWithdrawalStatData = async () => {
    const res = await getWithdrawalStat();
    withdrawalStat.value = res.data;
}
// 获取提现记录数据
const fetchRecords = async (pageNum) => {
    try {
        const res = await getWithdrawalRecord({
            page: pageNum,
            listRows: pageSize.value
        });
        total.value = res.data.total;
        if (res.error === 0 && res.data && res.data.data) {
            return res.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('获取提现记录失败:', error);
        return [];
    }
};
// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        1: '待审核',
        2: '处理中',
        3: '已到账',
        4: '已拒绝'
    };
    return statusMap[status] || '未知';
};

// 获取状态样式类
const getStatusClass = (status) => {
    const classMap = {
        1: 'status-pending',
        2: 'status-processing',
        3: 'status-success',
        4: 'status-failed'
    };
    return classMap[status] || '';
};

function getIcon(status) {
    const iconMap = {
        1: 'icon-shuaxin',
        2: 'icon-shuaxin',
        3: 'icon-icon_duihao-mian',
        4: 'icon-gantanhao-yuankuang'
    };
    const colorMap = {
        1: '#FF6B35',
        2: '#FF6B35',
        3: '#22C55E',
        4: '#EF4444'
    };
    return {
        type: iconMap[status],
        color: colorMap[status]
    };
}
// 初始加载
onMounted(async () => {
    await getWithdrawalStatData();
    await loadInitialData();
});

// 初始数据加载
const loadInitialData = async () => {
    loading.value = true;
    const data = await fetchRecords(page.value);
    recordList.value = data;
    loading.value = false;
    //假数据
    // recordList.value = [
    //     {
    //         wdNo: 1111110, //申请单号
    //         wdAmount: 10, //提现金额
    //         rateFee: 0, //手续费
    //         status: 4, //1.待审核 2.处理中 3.成功 4.失败
    //         createTime: "2025-06-19T21:32:59.000+08:00", //申请时间
    //         successTime: null, //成功时间
    //         reason: '提现失败', //失败原因
    //         targetSource: null //提现目标
    //     }
    // ]
    // 判断是否还有更多数据
    if (data.length < pageSize.value) {
        noMore.value = true;
    }
};

// 下拉刷新
const onRefresh = async () => {
    isRefreshing.value = true;
    page.value = 1;
    noMore.value = false;
    const data = await fetchRecords(page.value);
    recordList.value = data;
    isRefreshing.value = false;

    // 判断是否还有更多数据
    if (data.length < pageSize.value) {
        noMore.value = true;
    }
};

// 加载更多
const loadMore = async () => {
    if (loading.value || noMore.value) return;

    loading.value = true;
    page.value++;

    const data = await fetchRecords(page.value);
    if (data.length === 0) {
        noMore.value = true;
    } else {
        recordList.value = [...recordList.value, ...data];
    }
    loading.value = false;

    // 判断是否还有更多数据
    if (data.length < pageSize.value) {
        noMore.value = true;
    }
};
function handleBack() {
    uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.withdrawal-record {
    min-height: 100vh;
    background-color: var(--background-color);
    display: flex;
    flex-direction: column;

    .header-fixed {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
    }

    .record-list-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16rpx;
        padding: 10rpx;
        margin: 20rpx;
        height: 200rpx;
        background: linear-gradient(90deg, var(--theme-color) 0%, var(--theme-color-linear) 100%);
        border-radius: 16rpx;
        color: #fff;

        .record-list-wrapper-title {
            font-size: 24rpx;
        }

        .record-list-wrapper-amount {
            font-size: 36rpx;
        }

        .record-list-wrapper-count {
            font-size: 24rpx;
        }
    }

    .record-list {
        flex: 1;
        padding: 20rpx;
        height: calc(100vh - 100rpx - var(--window-top));
        box-sizing: border-box;

        .record-item {
            background-color: #fff;
            border-radius: 16rpx;
            padding: 30rpx;
            margin-bottom: 20rpx;
            box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
            .card-top{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .price{
                    font-size: 32rpx;
                    font-weight: bold;
                }
                .status{
                    display: flex;
                    align-items: center;
                    gap: 8rpx;
                    font-size: 24rpx;
                    padding: 4rpx 16rpx;
                    border-radius: 20rpx;
                }
            }
            .card-middle{
                display: flex;
                align-items: center;
                gap: 8rpx;
                height: 100rpx;
                font-size: 24rpx;
                color: #999;
                .card-icon{
                    width: 64rpx;
                    height: 64rpx;
                    text-align: center;
                    line-height: 64rpx;
                    background-color: #DCFCE7;
                    border-radius: 20rpx;
                }
            }
            .card-bottom{
                display: flex;
                align-items: center;
                gap: 8rpx;
                font-size: 24rpx;
                color: #999;
                .status-text{
                    margin-left: auto;
                }
            }
        }

        .status {
            color: #007AFF;

            &.status-pending {
                color: #FF6B35;
                background-color: #FFEDD5;
            }

            &.status-processing {
                color: #FF6B35;
                background-color: #FFEDD5;
            }

            &.status-success {
                color: #15803D;
                background-color: #DCFCE7;
            }

            &.status-failed {
                color: #B91C1C;
                background-color: #FEE2E2;
            }
        }

        .reason {
            color: #FF3B30;
        }

        .loading,
        .no-more,
        .empty-data {
            text-align: center;
            padding: 30rpx;
            color: #999;
            font-size: 28rpx;
        }

        .empty-data {
            padding: 100rpx 30rpx;
            color: #999;
        }
    }
}
</style>