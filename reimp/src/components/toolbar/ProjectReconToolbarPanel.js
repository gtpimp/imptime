import React, {Component} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__PROJECT_RECON_PAGE
} from '../../actions/ItemListKeyRegistry'
import { getPageSelectedEntities } from '../../actions/Page'
import { printCurrentPage } from '../../actions/Print'
import { getProject } from '../../actions/Projects'
import { downloadProjectCostSummary } from '../../actions/CostSummary'

class ProjectReconToolbarPanel extends Component {

    onPrint = (evt) => {
        const { dispatch, project } = this.props
        evt.preventDefault()
        dispatch(printCurrentPage(`Recon_${project.name}`))
    }

    onDownloadAsCsv = (evt) => {
        const { dispatch, project } = this.props
        evt.preventDefault()
        dispatch(downloadProjectCostSummary(project.id))
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className={cx("icon--print", css`cursor:pointer`)}
                   onClick={this.onPrint} 
              />
              <div className={cx("icon--download_as_csv", css`cursor:pointer`)}
                   onClick={this.onDownloadAsCsv} 
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page_key = PAGE_KEY__PROJECT_RECON_PAGE
    const selected_project_ids = getPageSelectedEntities(state, page_key).project_ids
    const project_id = selected_project_ids && selected_project_ids[0]
    const project = getProject(state, project_id)
    
    return {
        page_key,
        project,
        project_id
    }
}


export default withRouter(connect(mapStateToProps)(ProjectReconToolbarPanel))
