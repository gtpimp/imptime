import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import {Link} from 'react-router-dom'
import { getVisibleItemIds } from '../actions/ItemList'
import { css } from 'emotion'
import Modal from 'react-modal'
import Floater from "react-floater"
import ModalDialog from './ModalDialog'
import Timestamp from './Timestamp'
import SprintName from './SprintName'
import { initList,
         update_list_pagination,
         invalidateList
} from '../actions/ItemList'

import { getSprintSnapshots,
         fetchSprintSnapshotsIfNeeded,
         startCandidateSprintSnapshot,
         saveCandidateSprintSnapshot,
         updateCandidateDescription,
         cancelCandidateSprintSnapshot,
         getCandidateSprintSnapshot,
         deleteSprintSnapshots,
         updateSprintSnapshotDescription
} from '../actions/SprintSnapshots'
import SprintSnapshotDescriptionForm from './form/SprintSnapshotDescriptionForm'
import Pagination from './Pagination'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import PopupPanelButton from './PopupPanelButton'
import PopupPanelLink from './PopupPanelLink'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelText from './PopupPanelText'
import { LIST_KEY__SPRINT_SNAPSHOT_LIST } from '../actions/ItemListKeyRegistry'
import { isSprintSnapshotSelectorActive, stopSprintSnapshotSelector } from '../actions/SprintSnapshots'

class SprintSnapshotSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeSprintSnapshot = this.onChangeSprintSnapshot.bind(this)
        this.onCreateCandidateSprintSnapshot = this.onCreateCandidateSprintSnapshot.bind(this)
        this.onCancelCreateCandidateSprintSnapshot = this.onCancelCreateCandidateSprintSnapshot.bind(this)
        this.onSaveCandidateSprintSnapshot = this.onSaveCandidateSprintSnapshot.bind(this)
        this.onCancelCreateCandidateSprintSnapshot = this.onCancelCreateCandidateSprintSnapshot.bind(this)
        this.onStartEditingSprintSnapshot = this.onStartEditingSprintSnapshot.bind(this)
        this.onCancelEditingSprintSnapshot = this.onCancelEditingSprintSnapshot.bind(this)
        this.onSaveSprintSnapshotDescription = this.onSaveSprintSnapshotDescription.bind(this)
        this.onRefresh = this.onRefresh.bind(this)
        this.hideSelector = this.hideSelector.bind(this)
        this.state = { editing_sprint_snapshot: null }
    }

    componentDidMount() {
        const { dispatch, list_key } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { page_size: 10 }))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, sprint_id, sprint, list_key} = props
        if ( ! sprint || sprint_id !== this.props.sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        dispatch(fetchSprintSnapshotsIfNeeded(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	if ( event ) {
	    event.stopPropagation()
	}
	dispatch(invalidateList(list_key))
	dispatch(fetchSprintSnapshotsIfNeeded(list_key))
    }

    onChangeSprintSnapshot(snapshot_id) {
        // const { dispatch } = this.props
        
        alert("ouch")
    }

    onCreateCandidateSprintSnapshot() {
        const { dispatch, sprint_id } = this.props
        dispatch(startCandidateSprintSnapshot(sprint_id))
    }

    onCancelCreateCandidateSprintSnapshot(event) {
        const { dispatch } = this.props
        if ( event ) {
            event.preventDefault()
        }
        dispatch(cancelCandidateSprintSnapshot())
    }

    onSaveCandidateSprintSnapshot(new_values) {
        const { dispatch } = this.props
        dispatch(updateCandidateDescription(new_values.description))
        dispatch(saveCandidateSprintSnapshot((snapshot_id) => this.onCancelCreateCandidateSprintSnapshot()))
    }

    onStartEditingSprintSnapshot(event, snapshot) {
        event.preventDefault()
        this.setState({editing_sprint_snapshot: snapshot})
    }

    onCancelEditingSprintSnapshot(event) {
        event.preventDefault()
        this.setState({editing_sprint_snapshot: null})
    }

    onSaveSprintSnapshotDescription(new_values) {
        const { dispatch } = this.props
        dispatch(updateSprintSnapshotDescription(this.state.editing_sprint_snapshot.id, new_values.description))
        this.setState({editing_sprint_snapshot: null})
    }

    deleteSprintSnapshot(event, snapshot) {
        const { dispatch } = this.props
        event.preventDefault()
        if (! window.confirm("Delete sprint snapshot " + snapshot.description + "?") ) {
            return
        }
        dispatch(deleteSprintSnapshots([snapshot.id]))
    }

    hideSelector() {
        const { dispatch } = this.props
        dispatch(stopSprintSnapshotSelector())
    }

    renderSprintSnapshotEditButtons(snapshot) {
        return (
            <div className={css`display:flex; flex-direction: row; margin-right: 20px;`}>
              <Floater
                  description="Delete snapshot"
                  disableHoverToClick
                  event="hover"
                  eventDelay={0}
                  placement="bottom"
                  content={<div>Delete this snapshot</div>}
              >
                <div className="snapshot-editor-button-bar__button icon--small-delete" onClick={(event) => this.deleteSprintSnapshot(event, snapshot)}/>
              </Floater>
              <Floater
                  description="Edit snapshot"
                  disableHoverToClick
                  event="hover"
                  eventDelay={0}
                  placement="bottom"
                  content={<div>Edit the snapshot description</div>}
              >
                <div className="snapshot-editor-button-bar__button icon--edit" onClick={(event) => this.onStartEditingSprintSnapshot(event, snapshot)}/>
              </Floater>
            </div>
        )
    }

    renderSprintSnapshotCreator() {
        const { candidate_sprint_snapshot } = this.props
        return (
            <SprintSnapshotDescriptionForm onCancel={this.onCancelCreateCandidateSprintSnapshot}
                                           initial_value={candidate_sprint_snapshot.description}
                                           onSubmitted={this.onSaveCandidateSprintSnapshot}/>
        )
    }

    renderSprintSnapshotDescriptionEditor() {
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={this.onCancelCreateCandidateSprintSnapshot}
                   contentLabel="Edit Description">
              <SprintSnapshotDescriptionForm onCancel={this.onCancelEditingSprintSnapshot}
                             initial_value={this.state.editing_sprint_snapshot.description}
                             onSubmitted={this.onSaveSprintSnapshotDescription}/>
            </Modal>
        )
    }

    renderSprintSnapshots() {
        const { snapshots, list_key, project_id, sprint_id } = this.props

        if ( ! snapshots || snapshots.length === 0 ) {
            return null
        }
         
        return (
            <div>
              <PopupPanelHeading>
                Previous snapshots
              </PopupPanelHeading>

              <Pagination list_key={list_key} on_changed={this.onRefresh} hide_if_one_page={true} />
              { map(snapshots, (snapshot) =>
                  <PopupPanelLink key={snapshot.id}>
                    <Link to={'/projects/'+project_id+'/sprints/'+sprint_id+'/snapshots/'+snapshot.id}
                          onClick={(evt) => evt.stopPropagation()}
                    >
                      <div className={css`display:flex; 
                                        flex-direction: row; 
                                        justify-content: space-between`}>
                        {snapshot.description}
                        <Timestamp format="dateshort-time" value={snapshot.created_at} />
                      </div>
                    </Link>
                  </PopupPanelLink>
                )}
            </div>
        )
    }

    render() {
        const { is_active, sprint_id, candidate_sprint_snapshot } = this.props
        const is_creating_candidate_sprint_snapshot = candidate_sprint_snapshot || false
        const is_editing_sprint_snapshot_description = this.state.editing_sprint_snapshot || false

        if ( ! is_active ) {
            return null
        }
        
        return (
            <ModalDialog isOpen={true}
                         onClose={this.hideSelector}
                         title="Sprint Snapshots"
                         variant="large">

              <div className={css`display: flex;
                                flex-direction: column;
                            `}>
                <PopupPanelHeading>
                  Snapshots for sprint <SprintName sprint_id={sprint_id}/>
                </PopupPanelHeading>
                <PopupPanelText>
                  SprintSnapshots are summaries of sprint values at a moment in time
                  <br/>
                  They can be used to compare how a sprint has changed, 
                  <br/>
                  which is useful for reporting purposes.
                </PopupPanelText>
                { ! is_creating_candidate_sprint_snapshot && ! is_editing_sprint_snapshot_description && (
                      <PopupPanelButton onClick={this.onCreateCandidateSprintSnapshot}>Take snapshot</PopupPanelButton>
                  )}
                { is_creating_candidate_sprint_snapshot && this.renderSprintSnapshotCreator() }
                { is_editing_sprint_snapshot_description && this.renderSprintSnapshotDescriptionEditor() }
                { this.renderSprintSnapshots() }
              </div>
            </ModalDialog>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const list_key = LIST_KEY__SPRINT_SNAPSHOT_LIST
    const sprint = getSprint(state, sprint_id)
    const project_id = sprint && sprint.project_id
    const snapshot_ids = getVisibleItemIds(state, list_key)
    const snapshots = getSprintSnapshots(state, snapshot_ids)
    const candidate_sprint_snapshot = getCandidateSprintSnapshot(state) || null
    const is_active = isSprintSnapshotSelectorActive(state) || false

    return {
        project_id,
        sprint_id,
        sprint,
        is_active,
        candidate_sprint_snapshot,
        snapshots,
        list_key
    }
}

export default connect(mapStateToProps)(SprintSnapshotSelector)
