import {takeEvery, put, call} from 'redux-saga/effects'
import {
  createCamelKeys,
  createSnakeKeys,
  consoleErrorRecovery,
  safeSaga,
} from '../../utils'
import * as actions from './actions'

//  eslint-disable-next-line max-lines-per-function
const sagasFactory = ({
  // Function to customize auto camelCasing response data keys
  camelCaseKeyPred,
  // Function to customize auto snake_casing request data keys
  snakeCaseKeyPred,
} = {}) => {
  const camelKeys = createCamelKeys(camelCaseKeyPred)
  const snakeKeys = createSnakeKeys(snakeCaseKeyPred)

  const resourceNeedlePath = (resource, needle) => {
    if (!needle) return `/${resource}`
    return `/${resource}/${needle}`
  }

  const apiResponseData = (autoCaseKeys, response) => {
    return autoCaseKeys === false ? response.data : camelKeys(response.data)
  }

  const apiResponseToPayload = (autoCaseKeys, response) => ({
    api: {response},
    data: apiResponseData(autoCaseKeys, response),
  })

  function* createResource(
    api,
    {data},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    try {
      const resp = yield call(
        [api, api.post],
        `/${resource}`,
        autoCaseKeys ? snakeKeys(data) : data,
      )
      const action = actions.resourceCreateSuccess(
        resource,
        entityType,
        apiResponseToPayload(autoCaseKeys, resp),
        {data},
        thunk,
      )
      yield put(action)
    } catch (e) {
      yield put(
        actions.resourceCreateFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          {data},
          thunk,
        ),
      )
    }
  }

  function* createResourceList(
    api,
    {data},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    const params = autoCaseKeys ? snakeKeys(data) : data
    try {
      const resp = yield call([api, api.post], `/${resource}`, params)
      const action = actions.resourceListCreateSuccess(
        resource,
        entityType,
        apiResponseToPayload(autoCaseKeys, resp),
        params,
        thunk,
      )
      yield put(action)
    } catch (e) {
      yield put(
        actions.resourceListCreateFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          data,
          thunk,
        ),
      )
    }
  }

  function* readResourceList(
    api,
    {params},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    try {
      const resp = yield call([api, api.get], `/${resource}`, params)

      yield put(
        actions.resourceListReadSuccess(
          resource,
          entityType,
          apiResponseToPayload(autoCaseKeys, resp),
          {params},
          thunk,
        ),
      )
    } catch (e) {
      yield put(
        actions.resourceListReadFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          {params},
          thunk,
        ),
      )
    }
  }

  function* readResourceDetail(
    api,
    {needle, params},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    try {
      const resp = yield call(
        [api, api.get],
        resourceNeedlePath(resource, needle),
        params,
      )
      yield put(
        actions.resourceDetailReadSuccess(
          resource,
          entityType,
          apiResponseToPayload(autoCaseKeys, resp),
          {needle, params},
          thunk,
        ),
      )
    } catch (e) {
      yield put(
        actions.resourceDetailReadFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          {needle, params},
          thunk,
        ),
      )
    }
  }

  function* updateResource(
    api,
    {needle, data},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    try {
      const resp = yield call(
        [api, api.put],
        resourceNeedlePath(resource, needle),
        autoCaseKeys ? snakeKeys(data) : data,
      )
      yield put(
        actions.resourceUpdateSuccess(
          resource,
          entityType,
          apiResponseToPayload(autoCaseKeys, resp),
          {needle, data},
          thunk,
        ),
      )
    } catch (e) {
      yield put(
        actions.resourceUpdateFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          {needle, data},
          thunk,
        ),
      )
    }
  }

  function* deleteResource(
    api,
    {needle},
    {resource, thunk, entityType, autoCaseKeys},
  ) {
    try {
      const resp = yield call(
        [api, api.delete],
        resourceNeedlePath(resource, needle),
      )

      yield put(
        actions.resourceDeleteSuccess(
          resource,
          entityType,
          apiResponseToPayload(autoCaseKeys, resp),
          {needle},
          thunk,
          resp.status === 200, // update on 200
        ),
      )
    } catch (e) {
      yield put(
        actions.resourceDeleteFailure(
          resource,
          entityType,
          autoCaseKeys ? camelKeys(e) : e,
          {needle},
          thunk,
        ),
      )
    }
  }

  function* watchResourceCreateRequest(api, {payload, meta}) {
    yield call(createResource, api, payload, meta)
  }

  function* watchResourceListCreateRequest(api, {payload, meta}) {
    yield call(createResourceList, api, payload, meta)
  }

  function* watchResourceListReadRequest(api, {payload, meta}) {
    yield call(readResourceList, api, payload, meta)
  }

  function* watchResourceDetailReadRequest(api, {payload, meta}) {
    yield call(readResourceDetail, api, payload, meta)
  }

  function* watchResourceUpdateRequest(api, {payload, meta}) {
    yield call(updateResource, api, payload, meta)
  }

  function* watchResourceDeleteRequest(api, {payload, meta}) {
    yield call(deleteResource, api, payload, meta)
  }

  function* rootSaga({api}) {
    const safe = safeSaga(consoleErrorRecovery)

    yield takeEvery(
      actions.RESOURCE_CREATE_REQUEST,
      safe(watchResourceCreateRequest, api),
    )

    yield takeEvery(
      actions.RESOURCE_LIST_CREATE_REQUEST,
      safe(watchResourceListCreateRequest, api),
    )

    yield takeEvery(
      actions.RESOURCE_LIST_READ_REQUEST,
      safe(watchResourceListReadRequest, api),
    )

    yield takeEvery(
      actions.RESOURCE_DETAIL_READ_REQUEST,
      safe(watchResourceDetailReadRequest, api),
    )

    yield takeEvery(
      actions.RESOURCE_UPDATE_REQUEST,
      safe(watchResourceUpdateRequest, api),
    )

    yield takeEvery(
      actions.RESOURCE_DELETE_REQUEST,
      safe(watchResourceDeleteRequest, api),
    )
  }

  return {
    apiResponseData,
    apiResponseToPayload,
    createResource,
    createResourceList,
    deleteResource,
    readResourceDetail,
    readResourceList,
    resourceNeedlePath,
    updateResource,
    watchResourceCreateRequest,
    watchResourceDeleteRequest,
    watchResourceDetailReadRequest,
    watchResourceListCreateRequest,
    watchResourceListReadRequest,
    watchResourceUpdateRequest,

    rootSaga,
  }
}

export default sagasFactory
