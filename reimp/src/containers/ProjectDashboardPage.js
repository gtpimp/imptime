import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import InviteUserForm from '../components/form/InviteUserForm'
import Modal from 'react-modal';
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    setPageFlag,
    clearPageFlag,
    getPageFlag
} from '../actions/Page'
import { saveInviteUser } from '../actions/Users'

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
        this.onStartInviteUser = this.onStartInviteUser.bind(this)
        this.onCancelInviteUser = this.onCancelInviteUser.bind(this)
        this.onSaveInviteUser = this.onSaveInviteUser.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_DASHBOARD_PAGE, ['project-dashboard']))
        this.refresh(project_id)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id)
        }
    }
    
    refresh(project_id) {
        const { dispatch, project } = this.props
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project_id, label: project.name} ]))
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project_id]))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    onStartInviteUser() {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onCancelInviteUser() {
        const { dispatch } = this.props
        dispatch(clearPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onSaveInviteUser(user_email) {
        const { dispatch } = this.props
        dispatch(saveInviteUser(PAGE_KEY__PROJECT_DASHBOARD_PAGE, user_email))
    }

    renderInviteUser() {
        const { project } = this.props

        const that = this
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={that.onCancelInviteUser}
                   contentLabel="Invite to this project">

                <div>
                    <InviteUserForm onChange={this.onSaveInviteUser}/>
                    <button onClick={this.onCancelInviteUser}>Cancel</button>
                </div>
            </Modal>
        )
    }
    
    render() {

        const { project, is_inviting_user } = this.props
        
        return (
            <div>
                Project {project.name}

                { is_inviting_user && this.renderInviteUser() }

                { ! is_inviting_user &&
                  <div>
                      
                      <button onClick={this.onStartInviteUser}>Invite somebody to this project</button>
                      <br/>
                      <button onClick={this.navigateToSprintsPage}>Take me to your sprints</button>
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id)
    const is_inviting_user = getPageFlag(state, PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user')
    return {
        project_id: project_id,
        project: project || {},
        is_inviting_user: is_inviting_user
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)

