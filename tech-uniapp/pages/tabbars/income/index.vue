<template>
    <view class="income-detail">
        <view class="header-fixed">
            <tech-header title="">
                <template #left>
                    <view class="income-detail-title" style="color: #fff;">收入明细</view>
                </template>
                <template #right>
                    <tech-icon type="icon-rili" size="32rpx" color="#fff" />
                </template>
            </tech-header>

            <!-- tabs -->
            <tech-tabs :tabs="tabs" @change="handleTabChange" />
        </view>
        <!-- 总收入卡片 -->
        <view class="income-summary-card">
            <view class="summary-row1">
                <view class="summary-label"><text>{{ tabs[data.type].name }}</text>总收入</view>
                <view class="summary-value">￥{{ summary?.amount ? summary.amount : 0 }}</view>
            </view>
            <view class="summary-row2">完成订单数 <text class="order-count">{{ summary?.orderNum ? summary.orderNum : 0
                    }}单</text></view>
        </view>

        <!-- 收入明细列表 -->
        <view class="income-list">
            <view v-for="(group, idx) in groupList" :key="group.date" class="group-item" v-if="groupList.length > 0">
                <view class="group-title">{{ group.date }} {{ group.week }}</view>
                <view v-for="item in group.items" :key="item.id" class="group-item-info">
                    <view class="item-left">
                        <view class="item-time">

                            <text class="time-text">{{ dayjs(item.successTime).format('HH:mm') }}</text>
                            <tech-icon type="icon-rili" size="28rpx" color="var(--theme-color)" />
                        </view>

                    </view>
                    <view class="item-middle">
                        <view class="item-title">{{ item.itemName }}</view>
                        <view class="item-user">{{ item.orderNo }}</view>
                    </view>
                    <view class="item-right">￥{{ item.amount }}</view>
                </view>
            </view>
            <tech-noData v-else-if="groupList.length === 0" />
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { getIncomeList, getIncomeStat } from '@/api/income'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
const tabs = [
    {
        name: '全部',
        value: 0
    },
    {
        name: '本周',
        value: 1
    },
    {
        name: '本月',
        value: 2
    },
    {
        name: '上月',
        value: 3
    }
]
const summary = ref()
const data = ref({
    page: 1,
    listRows: 10,
    type: 0
})
const incomeDataList = ref([])
const total = ref('')
function getIncomeStatData() {
    getIncomeStat(data.value.type).then(res => {
        summary.value = res.data
    })
}
function getIncomeDetailData() {
    if (incomeDataList.value.length === total.value) {
        return
    }
    getIncomeList(data.value).then(res => {
        incomeDataList.value = res.data.data
        total.value = res.data.total
        getGroupList()
    })
}
const groupList = ref([])
function getGroupList() {
    const result = {}
    // 遍历所有订单数据
    incomeDataList.value.forEach(item => {
        // 从 successTime 中提取日期
        const date = dayjs(item.successTime).format('YYYY-MM-DD')
        var datas = dayjs(item.successTime).day()
        var week = ['日', '一', '二', '三', '四', '五', '六']
        var weekStr = '星期' + week[datas]
        // 如果这个日期还没有分组，就创建一个新的分组
        if (!result[date]) {
            result[date] = {
                list: [],
                week: weekStr
            }
        }
        // 根据类型分类
        result[date].list.push(item)
    })

    // 将结果转换为数组格式，方便在模板中使用
    const list = Object.keys(result).map(date => {
        return {
            date: dayjs(date).format('M月D日'),
            week: result[date].week,
            items: result[date].list
        }
    })

    // 按日期倒序排列
    list.sort((a, b) => {
        const dateA = dayjs(a.date, 'M月D日')
        const dateB = dayjs(b.date, 'M月D日')
        return dateB - dateA
    })
    groupList.value = list
    return list
}
function handleTabChange(e) {
    total.value = ''
    data.value.page = 1
    data.value.type = e
    getIncomeDetailData()
    getIncomeStatData()
}
onShow(() => {
    data.value.page = 1
    getIncomeStatData()
    getIncomeDetailData()
    setTimeout(() => {
        uni.pageScrollTo({
            scrollTop: 0,
            duration: 0
        })
    }, 10)
})
onReachBottom(() => {
    data.value.page += 1
    getIncomeDetailData()
})
onPullDownRefresh(() => {
    data.value.page = 1
    getIncomeDetailData()
    getIncomeStatData()
    uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.income-detail {
    background: var(--background-color);
    min-height: calc(100vh - 220rpx);
    padding-bottom: 120rpx;
}

.header-fixed {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

.income-summary-card {
    background: #fff;
    border-radius: 20rpx;
    margin: 24rpx 24rpx 24rpx 24rpx;
    padding: 32rpx 32rpx 24rpx 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.06);

    .summary-row1 {
        display: flex;
        flex-direction: column;

        .summary-label {
            color: #888;
            font-size: 24rpx;
            margin-right: 24rpx;
        }

        .summary-value {
            color: var(--theme-color);
            font-size: 44rpx;
            font-weight: bold;
        }
    }

    .summary-row2 {
        color: #888;
        font-size: 24rpx;
        margin-top: 18rpx;
        display: flex;
        flex-direction: column;

        .order-count {
            color: #000000;
            font-weight: bold;
            margin-left: 8rpx;
        }
    }
}

.income-list {
    margin: 0 24rpx;
    min-height: 200rpx;

    .group-item {
        margin-top: 20rpx;
    }

    .group-title {
        color: #4B5563;
        background-color: #F3F4F6;
        font-size: 26rpx;
        font-weight: 500;
        height: 80rpx;
        line-height: 80rpx;
        padding-left: 24rpx;
    }

    .group-item-info {
        background: #fff;
        display: flex;
        align-items: center;
        padding: 24rpx 24rpx 20rpx 24rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
        border-bottom: 1rpx solid #e5e7eb;

        .item-left {
            display: flex;
            flex-direction: column;
            gap: 4rpx;

            .item-time {
                display: flex;
                align-items: center;
                flex-direction: column;
                color: var(--theme-color);
                font-size: 24rpx;
                gap: 6rpx;

                .time-text {
                    color: #4B5563;
                }
            }

        }

        .item-middle {
            display: flex;
            flex-direction: column;
            gap: 4rpx;
            font-size: 24rpx;
            margin-left: 40rpx;

            .item-title {
                color: #222;
                font-size: 28rpx;
                font-weight: 500;
            }

            .item-user {
                color: #888;
                font-size: 24rpx;
            }

        }

        .item-right {
            color: var(--theme-color);
            font-size: 24rpx;
            font-weight: bold;
            margin-left: auto;  }
    }
}
</style>