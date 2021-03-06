import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { guid } from '@/utils/uuid'
import crypto from 'crypto'

const state = {
  token: getToken(),
  refreshToken: getRefreshToken(),
  name: '',
  avatar: '',
  roles: [],
  isInitAdminMenu: false
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_RRTOKEN: (state, refreshToken) => {
    state.refreshToken = refreshToken
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ADMINMENUS: (state, isInitAdminMenu) => {
    state.isInitAdminMenu = isInitAdminMenu
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    var md5 = crypto.createHash('md5')
    md5.update(password)
    const passwordMd5 = md5.digest('hex')
    return new Promise((resolve, reject) => {
      login({ LoginName: username.trim(), Password: passwordMd5, ClientID: guid() })
        .then(response => {
          // 保存登录token到vuex
          commit('SET_TOKEN', response.Data.AccessToken.AccessToken)
          // 保存token到cookies
          setToken(response.Data.AccessToken.AccessToken)
          // 保存刷新token到vuex
          commit('SET_RRTOKEN', response.Data.AccessToken.RefreshToken)
          // 保存刷新token到cookies
          setRefreshToken(response.Data.AccessToken.RefreshToken)

          const { Role, UserName } = response.Data
          var roles = []
          roles.push(Role)

          commit('SET_NAME', UserName)
          commit('SET_AVATAR', 'avatar')
          commit('SET_ROLES', roles)

          resolve({ 'IsPassPwdCheck': response.Data.IsPassPwdCheck })
        }).catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        // const data = { }
        // // 先忽略权限
        // data.roles = ['admin']
        // const { roles, name, avatar } = data

        // // roles must be a non-empty array
        // if (!roles || roles.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        // commit('SET_ROLES', roles)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户注销
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        // token和刷新token的清空
        commit('SET_TOKEN', '')
        commit('SET_RRTOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        removeRefreshToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_RRTOKEN', '')
      removeToken()
      removeRefreshToken()
      resolve()
    })
  },
  setAdminMenus({ commit }) {
    commit('SET_ADMINMENUS', true)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

