import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureFeaturesLoaded, getFeature
} from '../actions/Features'
import {withRouter, Link} from 'react-router-dom'

class FeatureName extends Component {

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
	const { dispatch, feature_id, feature } = props
	if ( feature.loaded === false ) {
	    dispatch(ensureFeaturesLoaded([feature_id]))
	}
    }

    render_inline_small() {
	const { feature } = this.props

	return (
	    <Link className="feature_name--inline-small"
                  to={'/projects/' + feature.project_id + '/features/' + feature.id}
                  key={this.key+".collapsed_feature."+feature.id} >
	      {feature.name }
	    </Link>
	)
    }

    render() {
        const { feature_id, feature, render_mode, loading_value } = this.props

        if ( ! feature_id ) {
            return (
                <Link to={'/projects/' + feature.project_id + '/features/' + feature.id}>
                </Link>
            )
        }

	if ( feature.loaded === false ) {
	    return (
                <Link to={'/projects/' + feature.project_id + '/features/' + feature.id}>
                  {loading_value}
                </Link>
            )
	}

	if ( render_mode === 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { feature_id, render_mode, loading_value, display_mode } = props
    const feature = ((feature_id && (getFeature(state, feature_id))) || { 'loaded': false, 'id': feature_id }) || { 'featurename': 'no-one' }

    return {
	feature: feature,
        feature_id: feature_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "...",
        display_mode: display_mode || ["name"]
    }
}

export default withRouter(connect(mapStateToProps)(FeatureName))
