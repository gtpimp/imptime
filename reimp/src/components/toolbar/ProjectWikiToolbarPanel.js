import React, {Component} from 'react'
import {connect} from 'react-redux'
import { get } from 'lodash'
import '../../sass/toolbar-panel.css'
import { startCandidateWiki } from '../../actions/Wikis'
import {
    getGloballySelectedEntityIds
} from '../../actions/Page'

class ProjectWikiToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewWikiPageClick = this.onNewWikiPageClick.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
    }

    onNewWikiPageClick() {
        const { dispatch, project_id } = this.props
        dispatch(startCandidateWiki(project_id))
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary" onClick={this.onNewWikiPageClick}>
                + New Page
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = get(getGloballySelectedEntityIds(state), ["project_ids"], [0])[0]

    return {
        project_id
    }
}

export default connect(mapStateToProps)(ProjectWikiToolbarPanel)
