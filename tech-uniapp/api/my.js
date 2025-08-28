import { get, post, put } from '@/utils/request'
//我的资金
export const getMyFund = () => get('/api/tt/technician/funds')
//技师信息
export const getTechnicianInfo = () => get('/api/tt/technician/info')
//更新技师信息
export const updateTechnicianInfo = (data) => put('/api/tt/technician/update/info', data)
//当前登陆人信息
export const getCurrentUserInfo = () => get('/api/user/profile')

//我绑定的银行卡列表
export const getMyBankCardList = () => get('/api/tt/tech/withdraw/bank/records')
//绑定银行卡
export const bindBankCard = (data) => post(' /api/tt/tech/withdraw/bind/bank', data)
//获取省市区tree接口
export const getProvinceCityTree = (name) => get(`/api/data/area?nextLevel=1&name=${name}`)
//申请提现
export const applyWithdraw = (data) => post('/api/tt/tech/withdraw/apply', data)
//提现申请记录
export const getWithdrawalRecord = (data) => get(`/api/tt/tech/withdraw/apply/records?page=${data.page}&listRows=${data.listRows}`)
//获取用户富文本
export const getUserRichText = (id) => {
    return get(`/api/data/richtext/${id}`)
}
//获取个人详情
export const getUserDetail = () => get('/api/tech/information')
//修改个人信息
export const updateUserInfo = (data) => put('/api/tech/information', data)
//获取个人信息
export const getUserInfo = () => get('/api/tech/profile')
//初始化接口
export const init = () => get('/api/init')
//获取富文本
export const getRichText = (id) => get(`/api/data/richtext/${id}`)
//提现统计
export const getWithdrawalStat = () => get('/api/tt/tech/withdraw/stat')