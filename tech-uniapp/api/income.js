import { get, post, put, del } from '@/utils/request'
//收入统计
export const getIncomeStat = (type) => get('/api/tech/income/stat?type=' + type)

//收入列表
export const getIncomeList = (params) => get('/api/tech/income/page?type=' + params.type + '&page=' + params.page + '&listRows=' + params.listRows)