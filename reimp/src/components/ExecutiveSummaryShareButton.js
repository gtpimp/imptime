import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import {
    ensureProjectsLoaded,
    getProject
} from '../actions/Projects'
import {
    ensureSprintsLoaded,
    getSprint,
    getExecutiveSummaryUrl
} from '../actions/Sprints'
import PrimaryButton from '../components/PrimaryButton'
import ModalDialog from './ModalDialog'

class ExecutiveSummaryShareButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }

    componentDidMount() {
        const {sprint_id, project_id, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    toggleModal = () => {
        const { visible } = this.state
        this.setState({visible: !visible})
    }

    onShareExecutiveSummary = () => {
        this.toggleModal()
    }

    renderShareModal = () => {
        const { executive_summary_url } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.toggleModal}
                         title="Share Executive Summary?"
                         variant="large"
                         onRequestClose={ this.toggleModal }>
              <a target="_blank" href={ executive_summary_url }>{ executive_summary_url }</a>
            </ModalDialog>
        )
    }

    render() {
        const { visible } = this.state
        return (
            <Fragment>
              <PrimaryButton
                  label="Share Executive Summary"
                  onButtonClick={this.onShareExecutiveSummary} />
              { visible && this.renderShareModal() }
            </Fragment>
        )
    }
}
function mapStateToProps(state, props) {
    const sprint_id = props.sprint_id
    const project_id = props.project_id
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const executive_summary_url = getExecutiveSummaryUrl(project_id, sprint_id)
    return {
        sprint_id: sprint_id,
        project_id: project_id,
        project: project,
        sprint: sprint,
        executive_summary_url: executive_summary_url
    }
}
export default connect(mapStateToProps)(ExecutiveSummaryShareButton)
