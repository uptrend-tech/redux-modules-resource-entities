import {put, call} from 'redux-saga/effects'
import * as actions from '../actions'
import createSagas from '../sagas'

const sagas = createSagas()

const api = {
  post: () => {},
  get: () => {},
  put: () => {},
  delete: (path, data) => Promise.resolve({data}),
}

const thunk = '123'
const resource = 'resources'
const entityType = 'resource'
const autoCaseKeys = false
const meta = {thunk, resource, entityType, autoCaseKeys}

describe('createResource', () => {
  const payload = {data: 'foo'}

  it('calls success', () => {
    const detail = 'detail'
    const generator = sagas.createResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.post], `/${resource}`, 'foo'),
    )
    expect(generator.next({data: {Data: detail}}).value).toEqual(
      put(
        actions.resourceCreateSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {data: {Data: detail}}),
          payload,
          thunk,
        ),
      ),
    )
  })

  it('calls failure', () => {
    const generator = sagas.createResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.post], `/${resource}`, 'foo'),
    )
    expect(generator.throw('test').value).toEqual(
      put(
        actions.resourceCreateFailure(
          resource,
          entityType,
          'test',
          payload,
          thunk,
        ),
      ),
    )
  })
})

describe('readResourceList', () => {
  const payload = {params: {_limit: 1}}

  it('calls success', () => {
    const detail = [1, 2, 3, {Data: 'foo'}]
    const generator = sagas.readResourceList(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.get], `/${resource}`, payload.params),
    )
    expect(generator.next({data: detail}).value).toEqual(
      put(
        actions.resourceListReadSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {data: detail}),
          payload,
          thunk,
        ),
      ),
    )
  })

  it('calls failure', () => {
    const generator = sagas.readResourceList(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.get], `/${resource}`, payload.params),
    )
    expect(generator.throw('test').value).toEqual(
      put(
        actions.resourceListReadFailure(
          resource,
          entityType,
          'test',
          payload,
          thunk,
        ),
      ),
    )
  })
})

describe('readResourceDetail', () => {
  const payload = {needle: 1, params: {flag: 1}}

  it('calls success', () => {
    const detail = {Data: 'foo'}
    const generator = sagas.readResourceDetail(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.get], `/${resource}/1`, payload.params),
    )
    expect(generator.next({data: detail}).value).toEqual(
      put(
        actions.resourceDetailReadSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {data: detail}),
          payload,
          thunk,
        ),
      ),
    )
  })

  it('calls failure', () => {
    const generator = sagas.readResourceDetail(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.get], `/${resource}/1`, payload.params),
    )
    expect(generator.throw('test').value).toEqual(
      put(
        actions.resourceDetailReadFailure(
          resource,
          entityType,
          'test',
          payload,
          thunk,
        ),
      ),
    )
  })
})

describe('updateResource', () => {
  const detail = {Data: 'foo'}
  const payload = {needle: 1, data: detail}

  it('calls success', () => {
    const generator = sagas.updateResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.put], `/${resource}/1`, detail),
    )
    expect(generator.next({data: detail}).value).toEqual(
      put(
        actions.resourceUpdateSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {data: detail}),
          payload,
          thunk,
        ),
      ),
    )
  })

  it('calls failure', () => {
    const generator = sagas.updateResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.put], `/${resource}/1`, detail),
    )
    expect(generator.throw('test').value).toEqual(
      put(
        actions.resourceUpdateFailure(
          resource,
          entityType,
          'test',
          payload,
          thunk,
        ),
      ),
    )
  })
})

describe('deleteResource', () => {
  const payload = {needle: 1}
  it('calls success withOUT updates', () => {
    const generator = sagas.deleteResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.delete], `/${resource}/1`),
    )
    expect(generator.next({status: 204}).value).toEqual(
      put(
        actions.resourceDeleteSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {status: 204}),
          payload,
          thunk,
          false,
        ),
      ),
    )
  })

  it('calls success WITH UPDATES', () => {
    const generator = sagas.deleteResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.delete], `/${resource}/1`),
    )
    expect(generator.next({status: 200}).value).toEqual(
      put(
        actions.resourceDeleteSuccess(
          resource,
          entityType,
          sagas.apiResponseToPayload(false, {status: 200}),
          payload,
          thunk,
          true,
        ),
      ),
    )
  })

  it('calls failure', () => {
    const generator = sagas.deleteResource(api, payload, meta)
    expect(generator.next().value).toEqual(
      call([api, api.delete], `/${resource}/1`),
    )
    expect(generator.throw('test').value).toEqual(
      put(
        actions.resourceDeleteFailure(
          resource,
          entityType,
          'test',
          payload,
          thunk,
        ),
      ),
    )
  })
})

test('watchResourceCreateRequest', () => {
  const payload = {data: 1}
  const generator = sagas.watchResourceCreateRequest(api, {payload, meta})
  expect(generator.next().value).toEqual(
    call(sagas.createResource, api, payload, meta),
  )
})

test('watchResourceListReadRequest', () => {
  const payload = {params: {_limit: 1}}
  const generator = sagas.watchResourceListReadRequest(api, {payload, meta})
  expect(generator.next().value).toEqual(
    call(sagas.readResourceList, api, payload, meta),
  )
})

test('watchResourceDetailReadRequest', () => {
  const payload = {needle: 1}
  const generator = sagas.watchResourceDetailReadRequest(api, {
    payload,
    meta,
  })
  expect(generator.next().value).toEqual(
    call(sagas.readResourceDetail, api, payload, meta),
  )
})

test('watchResourceUpdateRequest', () => {
  const payload = {needle: 1, data: {id: 1}}
  const generator = sagas.watchResourceUpdateRequest(api, {payload, meta})
  expect(generator.next().value).toEqual(
    call(sagas.updateResource, api, payload, meta),
  )
})

test('watchResourceDeleteRequest', () => {
  ;(() => {
    const payload = {needle: 1}
    const generator = sagas.watchResourceDeleteRequest(api, {payload, meta})
    expect(generator.next({payload, meta}).value).toEqual(
      call(sagas.deleteResource, api, payload, meta),
    )
  })()
  ;(() => {
    const payload = {needle: 2, data: {id: 3}}
    const generator = sagas.watchResourceDeleteRequest(api, {payload, meta})
    expect(generator.next({payload, meta}).value).toEqual(
      call(sagas.deleteResource, api, payload, meta),
    )
  })()
})

// TODO re-enable these after we can mock safe sagas
// test('saga', () => {
//   const generator = saga({ api });
//   expect(generator.next().value).toEqual(
//     takeEvery(
//       actions.RESOURCE_BULK_DOWNLOAD_REQUEST,
//       sagas.watchResourceBulkDownloadRequest,
//       api,
//     ),
//   );
//   expect(generator.next().value).toEqual(
//     takeEvery(actions.RESOURCE_CREATE_REQUEST, sagas.watchResourceCreateRequest, api),
//   );
//   expect(generator.next().value).toEqual(
//     takeEvery(
//       actions.RESOURCE_LIST_READ_REQUEST,
//       sagas.watchResourceListReadRequest,
//       api,
//     ),
//   );
//   expect(generator.next().value).toEqual(
//     takeEvery(
//       actions.RESOURCE_DETAIL_READ_REQUEST,
//       sagas.watchResourceDetailReadRequest,
//       api,
//     ),
//   );
//   expect(generator.next().value).toEqual(
//     takeEvery(actions.RESOURCE_UPDATE_REQUEST, sagas.watchResourceUpdateRequest, api),
//   );
//   expect(generator.next().value).toEqual(
//     takeEvery(actions.RESOURCE_DELETE_REQUEST, sagas.watchResourceDeleteRequest, api),
//   );
// });
