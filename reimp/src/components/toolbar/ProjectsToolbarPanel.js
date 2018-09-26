import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import { PAGE_KEY__PROJECTS_PAGE } from '../../actions/ItemListKeyRegistry'
import IconButton from '../IconButton'
import summary_icon from '../../images/icon_summary.svg'

class ProjectsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onSummaryClicked = this.onSummaryClicked.bind(this)
    }
    
    onSummaryClicked() {
        const { history, project_id } = this.props
        history.push('/projects/' + project_id + '/executiveSummary')
    }
    
    render() {
        const { project_id } = this.props
        return (
            <div className="toolbar-panel">
              { project_id && 
                <IconButton
                    icon={ summary_icon }
                    label="Summary"
                    onButtonClick={this.onSummaryClicked}/>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page = state.page || {}
    const selected_project_ids = (page[PAGE_KEY__PROJECTS_PAGE] || {}).project_ids || []
    const project_id = (selected_project_ids.length > 0 && selected_project_ids[0])
    
    return {
        project_id
    }
}

export default withRouter(connect(mapStateToProps)(ProjectsToolbarPanel))
