import { GetterTree, ActionTree, MutationTree } from 'vuex'
import axios, { AxiosError, AxiosResponse } from 'axios'

const state = () => ({})

export type RootSubState = ReturnType<typeof state>

export interface RootState extends RootSubState {}

const getters: GetterTree<RootState, RootState> = {}

const mutations: MutationTree<RootState> = {}

const actions: ActionTree<RootState, RootState> = {
  async uploadMedia({ commit }, data) {
    try {
      const res = await this.$axios.post<MediaLiteItem[]>('/media', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data && res.data.length > 0) return res.data[0]
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data)
        if (error.response?.status == 413 || (typeof error.response?.data == 'string' && error.response?.data.includes('large')))
          throw 'File is too large'
      }
      throw error
    }
  },

  async submitFeedback({}, data: FeedbackItem) {
    try {
      console.log({
        email: data.email,
        message: data.message,
        type: data.type,
        sdk_version: data.sdk_version,
        app_version: data.app_version,
        auth_token: data.auth_token,
        user_agent: data.user_agent,
        device_id: data.device_id,
      })
      await this.$axios.post(data.feedback_url, data)
    } catch (e) {
      console.log('feedback error.')
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}

// Types
export interface MediaLiteItem {
  /** Format: int64 */
  id: number
  url: string
  thumbnail_url?: string | null
  large_url?: string | null
  display_label?: string | null
  /** Format: int32 */
  display_order?: number
  is_image: boolean
  description?: string | null
  is_primary: boolean
}

export type ResponseError<T> =
  | [T | null, AxiosError | Error | string | null]
  | [T | null, AxiosError | Error | string | null, number | null | undefined]

export interface FeedbackItem {
  email?: string | null
  message?: string
  type: number
  sdk_version: string
  app_version: string
  auth_token: string
  user_agent?: string | null
  device_id?: string | null
  attachments: MediaLiteItem[] | null
  feedback_url: string
  media_url: string
}
