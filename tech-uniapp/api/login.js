import { get , post , put , del } from '@/utils/request'
//发送短信获取验证码
export const sendSmsCode = (data) => post('/api/sendSms', data)
//短信验证码登录
export const smslogin = (data) => post('/api/user/smsLogin', data)
//账户密码登录
export const passwordLogin = (data) => post('/api/user/accountLogin',data)
//获取openID
export const getOpenId = (code) => get('/api/third/wx/mp/openId?code=' + code)
//当前应用信息
export const getAppInfo = () => get('/api/init')
//当前登录人信息
export const getProfileInfo = () => get('/api/user/profile')
//注销账号
export const deleteAccountOut = () => post('/api/user/logoff')
//退出登录
export const logOut = () => post('/api/user/logout')
//修改用户名
export const changeName = (data) => post('/api/user/changeUsername', data)
//修改手机号
export const changePhone = (data) => post('/api/user/changeMobile', data)
//重置密码
export const resetPassword = (data) => post('/api/user/resetPassword', data)