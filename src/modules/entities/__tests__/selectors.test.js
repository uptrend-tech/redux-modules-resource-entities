import cases from 'jest-in-case'
import selectorsFactory from '../selectors'
import {getSchemas, getEntitiesState} from '../../../utils/test/fixtures'

const selectors = selectorsFactory({
  schemas: getSchemas(),
})

let state = getEntitiesState()

test('initialState', () => {
  expect(selectors.initialState).toEqual({})
})

describe('getEntity', () => {
  beforeEach(() => {
    state = getEntitiesState()
  })

  cases(
    'empty object returned for non-existing entity',
    opts => {
      expect(selectors.getEntity(opts.state, opts.entity)).toEqual({})
    },
    [{state: {}, entity: 'team'}, {state, entity: 'no-match-entity'}],
  )

  cases(
    'returns entity',
    opts => {
      const entity = opts.state[opts.entity]
      expect(selectors.getEntity(opts.state, opts.entity)).toBe(entity)
    },
    [{state, entity: 'team'}, {state, entity: 'user'}],
  )
})

describe('getDetail', () => {
  beforeEach(() => {
    state = getEntitiesState()
  })

  cases(
    'returns undefined',
    opts => {
      expect(
        selectors.getDetail(opts.state, opts.entity, opts.id),
      ).toBeUndefined()
    },
    [
      {state: {}, entity: 'team', id: 1},
      {state: {}, entity: 'team', id: '2'},
      {state, entity: 'team', id: 99999},
      {state, entity: 'user', id: 'miss'},
    ],
  )

  cases(
    'returns entityDetail',
    opts => {
      const entityDetail = opts.state[opts.entity][opts.id]
      expect(selectors.getDetail(opts.state, opts.entity, opts.id)).toBe(
        entityDetail,
      )
    },
    [
      {state, entity: 'team', id: 1},
      {state, entity: 'team', id: 'aaa-bbb'},
      {state, entity: 'user', id: 1},
    ],
  )
})

describe('getList', () => {
  beforeEach(() => {
    state = getEntitiesState()
  })

  cases(
    'returns no results as empty list',
    opts => {
      expect(selectors.getList(opts.state, opts.entity, opts.ids)).toEqual([])
    },
    [
      {state: {}, entity: 'team', ids: [1]},
      {state: {}, entity: 'team', ids: ['2']},
      {state, entity: 'team', ids: [99999]},
      {state, entity: 'user', ids: [99999, 'miss']},
    ],
  )

  cases(
    'returns entityDetailList',
    opts => {
      const result = selectors.getList(opts.state, opts.entity, opts.ids)
      expect(result).toEqual(opts.result)
    },
    [
      {state, entity: 'team', ids: [1], result: [state.team[1]]},
      {
        state,
        entity: 'team',
        ids: [1, 2],
        result: [state.team[1], state.team[2]],
      },
      {
        state,
        entity: 'user',
        ids: ['aaa', 'ccc'],
        result: [state.user.aaa, state.user.ccc],
      },
    ],
  )
})
