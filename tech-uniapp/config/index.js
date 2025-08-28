

const base_config = {
    "development": "https://ttt.wulingdaojia.com",
    // "development": "https://tt.wulingdaojia.com",
    "production": "",
    timeOut: 5000
}

const env = process.env.NODE_ENV || "development"
export default base_config[env]
export const MAP_KEY = 'MWLBZ-WAOC3-D723X-RYD26-SFLOE-S3FZF'
export const referer = 'tech-uniapp'
export const appId = 'p7y04i88'
//服务状态
export const serviceStatus = {
    "1": "待确认",
    "2": "待出发",
    "3": "已出发",
    "4": "已到达",
    "5": "服务中",
    "6": "服务完成",
    "7": "提前终止",
    "8": "服务取消",
}
//订单状态
export const orderStatus = {
    "1": "待支付",
    "2": "进行中",
    "3": "已取消",
    "4": "已关闭",
    "5": "已完成",
}
export const severStatusClass = {
    "1": "text-doing",
    "2": "text-toBeDo",
    "3": "text-done",
}
export const businessStatus = {
    "1": "待服务",
    "2": "服务中",
    "3": "已完成",
}
export const actionList = {
    "1": {
        label: '接单',
        action: 'create'//创建
    },
    "2": {
        label: '确认接单',
        action: 'confirm'//确认
    },
    "3": {
        label: '已出发',
        action: 'set_off'//已出发
    },

    "4": {
        label: '已到达',
        action: 'arrived'//已到达
    },
    "5": {
        label: '开始服务',
        action: 'start'//开始服务
    },
    "6": {
        label: '服务完成',
        action: 'completed'//服务完成
    },
    "7": {
        label: '服务终止',
        action: 'termination'//服务终止
    },
    "8": {
        label: '服务取消',
        action: 'cancel'//服务取消
    },
}