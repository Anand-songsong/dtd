//配置vuex全局储存
import { createStore } from 'vuex'
import { getAppInfo } from '@/api/login'

const store = createStore({
    state: {
        appInfo: {},
        userInfo: {},
        provinceCityTree: [],
        init: {},
        cityTree: [],
        currentCity: '',
        currentCityList: []
    },
    mutations: {
        setAppInfo(state, appInfo) {
            state.appInfo = appInfo
        },
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo
        },
        setProvinceCityTree(state, provinceCityTree) {
            state.provinceCityTree = provinceCityTree
        },
        setInit(state, init) {
            state.init = init
        },
        setCityTree(state, cityTree) {
            state.cityTree = cityTree
        },
        setCurrentCity(state, currentCity) {
            state.currentCity = currentCity
        },
        setCurrentCityList(state, currentCityList) {
            state.currentCityList = currentCityList
        }
    },
    actions: {
        getAppInfo({ commit }, data) {
            commit('setAppInfo', data)
        },
        getUserInfo({ commit }, data) {
            commit('setUserInfo', data)
        },
        getProvinceCityTree({ commit }, data) {
            commit('setProvinceCityTree', data)
        },
        getInit({ commit }, data) {
            commit('setInit', data)
        },
        getCityTree({ commit }, data) {
            commit('setCityTree', data)
        },
        getCurrentCity({ commit }, data) {
            commit('setCurrentCity', data)
        },
        getCurrentCityList({ commit }, data) {
            commit('setCurrentCityList', data)
        }
    }
})

export default store
