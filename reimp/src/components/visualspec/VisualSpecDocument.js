import React, {Component} from 'react'
import each from 'lodash/each'
import map from 'lodash/map'
import keys from 'lodash/keys'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import {connect} from 'react-redux'
import '../sass/visual-spec-document.scss'

class VisualSpecDocument extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch, list_key, sprint_id} = this.props
    }

    componentWillReceiveProps() {
        const {dispatch, list_key} = this.props
    }

    onCollapse() {
        const {dispatch, list_key} = this.props
    }

    onExpand() {
        const {dispatch, list_key} = this.props
    }

    render() {

        return (
            <div className="visual-spec-document">
              This is a visual spec document
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(VisualSpecDocument)
