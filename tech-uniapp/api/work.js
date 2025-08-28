import { get, post , put , del } from '@/utils/request'

// 更新位置信息
export const updateLocation = (data) => {
	return put('/api/tt/technician/update/location', data)
}
//待设置的休息时间
export const getRestTime = () => {
	return get('/api/tt/technician/work/times')
}
//更新休息时间
export const updateRestTime = (data) => {
	return put('/api/tt/technician/update/work/times', data)
}
//更新技师状态
export const updateTechnicianStatus = (data) => {
	return put('/api/tt/technician/update/status', data)
}
//获取首页数据
export const getHomeData = () => {
	return get('/api/tt/technician/data')
}
//收入明细
export const getIncomeDetail = (data) => {
	return get('/api/tt/order/income/page?page='+data.page+'&listRows='+data.listRows)
}
//首页统计
export const getHomeStatistics = () => {
	return get('/api/tech/index/stat')
}
//预约列表
export const getReserveList = (data) => {
	return get('/api/tech/index/reservation')
}
//获取首页服务状态
export const getHomeServiceStatus = () => {
	return get('/api/tech/service/status')
}
//更新首页服务状态
export const updateHomeServiceStatus = (data) => {
	return put('/api/tech/service/status', data)
}
//获取接单设置
export const getOrderSetting = () => {
	return get('/api/tech/receiving/order/setting')
}
//更新接单设置
export const updateOrderSetting = (data) => {
	return put('/api/tech/receiving/order/setting', data)
}
//根据经纬度获取城市信息
export const getCityByLocation = (data) => {
	return post('/api/map/city/info', data)
}