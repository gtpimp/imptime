import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class Tag extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {category, name, deleteTag} = this.props
        return (
            <div className="tag">
                { category &&
                    <div className="tag__component tag__component--category">{category}</div>
                }
                { category &&
                <div className="tag__component tag__component--separator">:</div>
                }
                <div className="tag__component tag__component--name">{name}</div>
                <div onClick={deleteTag}>x</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Tag)
