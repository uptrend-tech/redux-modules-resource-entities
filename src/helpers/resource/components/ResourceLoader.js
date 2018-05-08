import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  resourceListCreateRequest,
  resourceListReadRequest,
  resourceDetailReadRequest,
} from '../../../modules/resource/actions'

class ResourceLoader extends React.Component {
  state = {
    result: null,
    error: null,
    loading: false,
  }

  componentDidMount() {
    if (this.props.loadOnMount) {
      this.loadResource()
    }
  }

  getStatusObj() {
    const error = !!this.state.error
    const loading = this.state.loading
    const success = !!this.state.result
    const initial = !error && !loading && !success

    return {error, initial, loading, success}
  }

  getStatusViewError(error) {
    const {renderError} = this.props
    return renderError ? renderError(error) : null
  }

  getStatusViewInitial() {
    const {renderInitial} = this.props
    return renderInitial ? renderInitial() : null
  }

  getStatusViewLoading() {
    const {renderLoading} = this.props
    return renderLoading ? renderLoading() : null
  }

  getStatusViewSuccess(result) {
    const {renderSuccess} = this.props
    return renderSuccess ? renderSuccess(result) : null
  }

  getStatusView() {
    const {error, result} = this.state
    const status = this.getStatusObj()

    if (status.error) {
      return this.getStatusViewError(error)
    } else if (status.loading) {
      return this.getStatusViewLoading()
    } else if (status.success) {
      return this.getStatusViewSuccess(result)
    } else if (status.initial) {
      return this.getStatusViewInitial()
    }

    return null
  }

  loadResource = params => {
    this.setState({loading: true})
    this.requestResource(params).then(
      this.loadResourceSuccess,
      this.loadResourceError,
    )
  }

  loadResourceError = error => {
    this.setState({loading: false, error})
  }

  loadResourceSuccess = payload => {
    this.setState({
      result: payload.data,
      error: null,
      loading: false,
    })
  }

  onEventLoadResource = e => {
    e.preventDefault()
    this.loadResource()
  }

  requestResource = params => {
    return this.props.list
      ? this.requestResourceList(params)
      : this.requestResourceDetail(params)
  }

  requestResourceDetail = () => {
    const {requestDetailRead, resource, resourceId, entityType} = this.props
    return requestDetailRead(resource, resourceId, entityType)
  }

  requestResourceList = dynamicParams => {
    const {postRequest, requestParams} = this.props
    const params = {...dynamicParams, ...requestParams}
    return postRequest
      ? this.requestResourceListCreate(params)
      : this.requestResourceListRead(params)
  }

  requestResourceListCreate = params => {
    const {entityType, resource, requestListCreate} = this.props
    return requestListCreate(resource, params, entityType)
  }

  requestResourceListRead = params => {
    const {entityType, resource, requestListRead} = this.props
    return requestListRead(resource, params, entityType)
  }

  resetState = () => {
    this.setState({
      result: null,
      error: null,
      loading: false,
    })
  }

  render() {
    if (typeof this.props.children !== 'function') {
      throw new Error('Children should be a Function!')
    }

    const {result, error} = this.state
    return this.props.children({
      onEventLoadResource: this.onEventLoadResource,
      loadResource: this.loadResource,
      status: this.getStatusObj(),
      statusView: this.getStatusView(),
      error,
      result,
    })
  }
}

ResourceLoader.propTypes = {
  children: PropTypes.func.isRequired,
  entityType: PropTypes.string,
  list: PropTypes.bool.isRequired,
  loadOnMount: PropTypes.bool,
  postRequest: PropTypes.bool,
  renderError: PropTypes.func,
  renderInitial: PropTypes.func,
  renderLoading: PropTypes.func,
  renderSuccess: PropTypes.func,
  requestDetailRead: PropTypes.func,
  requestListCreate: PropTypes.func,
  requestListRead: PropTypes.func,
  requestParams: PropTypes.object,
  resource: PropTypes.string.isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

const mapDispatchToProps = {
  requestDetailRead: resourceDetailReadRequest,
  requestListCreate: resourceListCreateRequest,
  requestListRead: resourceListReadRequest,
}

export default connect(null, mapDispatchToProps)(ResourceLoader)
