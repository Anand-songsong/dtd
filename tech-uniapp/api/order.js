import { get, post, put, del } from '@/utils/request'

//获取进行中的订单
export const getOrderingList = (params) => post('/api/tt/order/in_progress/services', params)
//获取已完成订单
export const getCompletedOrderList = (params) => post('/api/tt/order/completed/services', params)
//订单明细
export const getOrderDetail = (orderNo) => get(`/api/tt/order/detail/${orderNo}`)
//更新服务信息  
export const updateServiceStatus = (params) => put(`/api/tech/exec/reservation`, params)
//订单统计
export const getOrderCount = () => get('/api/tt/order/stat/num')
//订单统计fu
export const getOrderStat = () => get('/api/tech/reservation/stat')
//预约服务列表
export const getReservationList = (params) => get(`/api/tech/reservation/page?businessStatus=${params.businessStatus}&page=${params.page}&listRows=${params.listRows}`)
//更新预约状态
export const updateReservationStatus = () => put('/api/tech/reservation')
//预约服务详情
export const getReservationDetail = (orderId) => get(`/api/tech/reservation/detail?orderId=${orderId}`)
//预约提醒
export const remindReservation = (params) => put('/api/tech/reservation/remind', params)
// 获取用户手机号
export const getUserPhone = (orderId) => get(`/api/tech/contact/customer?orderId=${orderId}`)
// 已完成订单的评价
export const getOrderComment = (params) => get(`/api/tech/reservation/comment?orderId=${params.orderId}`)