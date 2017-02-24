import React  from 'react';
import RIEEditBase from './RIEEditBase';
import { connect } from 'react-redux'

export class RIEInput extends RIEEditBase {
    
    constructor(props){
        super(props);
	this.onChange = this.onChange.bind(this)
    }

    onChange() {
	this.props.onChange(this.editField.value)
    }

    render() {
	const { value, is_editing, is_readonly } = this.props

	return (
	    <div>
		{ is_editing &&
		  <input
	              ref={(ref) => this.editField = ref}
	              value={value}
		      onChange={this.onChange}
		  />
		}
		{ is_readonly &&
		  <span>{value}</span>
		}
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(RIEInput)
