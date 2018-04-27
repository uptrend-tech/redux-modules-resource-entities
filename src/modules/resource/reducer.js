import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import {initialState, getResourceState, getList, getDetail} from './selectors'
import {
  RESOURCE_CREATE_SUCCESS,
  RESOURCE_DELETE_SUCCESS,
  RESOURCE_DETAIL_READ_REQUEST,
  RESOURCE_DETAIL_READ_SUCCESS,
  RESOURCE_LIST_CREATE_REQUEST,
  RESOURCE_LIST_CREATE_SUCCESS,
  RESOURCE_LIST_READ_REQUEST,
  RESOURCE_LIST_READ_SUCCESS,
  RESOURCE_UPDATE_SUCCESS,
} from './actions'

// Return the data the reducer should use to store from action payload.
// To support the entities redux-module we must store the `entities` value
// if present instead of the `data` value.
const getDataFromPayload = payload => {
  const data = get(payload, 'data')
  return get(payload, 'entities', data)
}

// eslint-disable-next-line complexity
const updateOrDeleteReducer = (state, {type, payload, meta}) => {
  const data = getDataFromPayload(payload)
  const resource = get(meta, 'resource')
  const needle = get(meta, 'request.needle')
  const needleIsObject = typeof needle === 'object'
  const list = getList(state, resource)
  const index = needleIsObject ? findIndex(list, needle) : list.indexOf(needle)

  if (index < 0) {
    return state
  }

  // console.warn(state, {type, payload, meta})

  switch (type) {
    case RESOURCE_UPDATE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [
            ...list.slice(0, index),
            needleIsObject ? {...list[index], ...data} : data,
            ...list.slice(index + 1),
          ],
        },
      }
    case RESOURCE_DELETE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [...list.slice(0, index), ...list.slice(index + 1)],
        },
      }
    // istanbul ignore next
    default:
      return state
  }
}

// eslint-disable-next-line complexity
export default (state = initialState, {type, payload, meta}) => {
  const resource = get(meta, 'resource')

  if (!resource) return state

  const data = getDataFromPayload(payload)

  switch (type) {
    case RESOURCE_CREATE_SUCCESS: {
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [data, ...getList(state, resource)],
        },
      }
    }

    case RESOURCE_LIST_CREATE_REQUEST:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: getList(initialState, resource),
        },
      }

    case RESOURCE_LIST_CREATE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: data,
        },
      }

    case RESOURCE_LIST_READ_REQUEST:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: getList(initialState, resource),
        },
      }

    case RESOURCE_LIST_READ_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: data,
        },
      }

    case RESOURCE_DETAIL_READ_REQUEST:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          detail: getDetail(initialState, resource),
        },
      }

    case RESOURCE_DETAIL_READ_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          detail: data,
        },
      }

    case RESOURCE_UPDATE_SUCCESS:
    case RESOURCE_DELETE_SUCCESS:
      return updateOrDeleteReducer(state, {type, payload, meta})

    default:
      return state
  }
}
