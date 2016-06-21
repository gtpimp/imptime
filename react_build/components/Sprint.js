import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import map from 'lodash/map'

export class Sprint extends Component {

    constructor(props) {
        super(props)
    }
    
    render_collapsed(sprint) {
	const { list_key } = this.props
	return (
	    <div key={this.key+".collapsed_sprint."+sprint.id}>
		Sprint: {sprint.name}
	    </div>
	)
    }
    
    render_expanded(sprint, index) {
        const { is_loading, is_selected } = this.props

	if ( sprint.loaded === false ) {
	    return (
		<tr key={this.key+"."+sprint.id+"."+index}
		    onClick={this.props.onClickedSprint}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>{sprint.id}</td>
	            { sprint.loaded === false &&
		      <td>Loading...</td>
		    }
		</tr>
	    )
	}
	if ( ! sprint.loaded ) {
            return (
		<tr key={this.key+"."+sprint.id+"."+index}
		    onClick={this.props.onClickedSprint}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>{sprint.id}</td>
		    <td>{sprint.name}</td>
		    <td>{sprint.status_name}</td>
		</tr>
            )
	}
    }

    render() {
        const { is_collapsed, is_expanded } = this.props

	if ( is_collapsed ) {
	    return this.render_collapsed()
	}
	else if ( is_expanded ) {
	    return this.render_expanded()
	} else {
	    return ( <div>Dev error</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { sprint, item_list } = state
    const { sprint_id, is_selected, is_collapsed, is_loading } = props
    const this_sprint = (sprint && sprint.items_by_id && sprint.items_by_id[sprint_id]) || {}
    
    return {
	sprint: this_sprint,
	sprint_id: sprint_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_collapsed: is_collapsed,
	is_expanded: !is_collapsed
    }
}

export default connect(mapStateToProps)(Sprint)
