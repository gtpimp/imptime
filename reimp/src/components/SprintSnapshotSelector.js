import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { getVisibleItemIds } from '../actions/ItemList'
import { css } from 'emotion'
import Modal from 'react-modal'
import Floater from "react-floater"
import ModalDialog from './ModalDialog'
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
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
// import PopupPanelButton from './PopupPanelButton'
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
        this.onStartEditingSprintSnapshot = this.onStartEditingSprintSnapshot.bind(this)
        this.onCancelEditingSprintSnapshot = this.onCancelEditingSprintSnapshot.bind(this)
        this.onSaveSprintSnapshotDescription = this.onSaveSprintSnapshotDescription.bind(this)
        this.hideSelector = this.hideSelector.bind(this)
        this.state = { editing_sprint_snapshot: null }
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, sprint_id, sprint} = props
        if ( ! sprint || sprint_id !== this.props.sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        dispatch(fetchSprintSnapshotsIfNeeded(LIST_KEY__SPRINT_SNAPSHOT_LIST))
    }

    onChangeSprintSnapshot(snapshot_id) {
        // const { dispatch } = this.props
        alert("ouch")
    }

    onCreateCandidateSprintSnapshot() {
        const { dispatch } = this.props
        dispatch(startCandidateSprintSnapshot())
    }

    onCancelCreateCandidateSprintSnapshot(event) {
        const { dispatch } = this.props
        event.preventDefault()
        dispatch(cancelCandidateSprintSnapshot())
    }

    onSaveCandidateSprintSnapshot(new_values) {
        const { dispatch, sprint_id } = this.props
        dispatch(updateCandidateDescription(new_values.description))
        dispatch(saveCandidateSprintSnapshot(sprint_id))
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
        const { snapshots } = this.props
        return (
            <div>
              { map(snapshots, (snapshot) =>
                  <PopupPanelLink key={snapshot.id}>
                    <div className={css`display:flex; flex-direction: row`}
                         onClick={() => this.onChangeSprintSnapshot(snapshot.id) } >
                      {snapshot.description}
                    </div>
                  </PopupPanelLink>
                )}
            </div>
        )
    }

    render() {
        const { is_active, candidate_sprint_snapshot } = this.props
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
                  Snapshots for sprint 
                </PopupPanelHeading>
                <PopupPanelText>
                  SprintSnapshots are summaries of sprint values at a moment in time
                  <br/>
                  They can be used to compare how a sprint has changed over time, 
                  <br/>
                  typically for reporting purposes.
                </PopupPanelText>
                { this.renderSprintSnapshots() }
                { is_creating_candidate_sprint_snapshot && this.renderSprintSnapshotCreator() }
                { is_editing_sprint_snapshot_description && this.renderSprintSnapshotDescriptionEditor() }
              </div>
            </ModalDialog>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)
    const snapshot_ids = getVisibleItemIds(state, LIST_KEY__SPRINT_SNAPSHOT_LIST)
    const snapshots = getSprintSnapshots(state, snapshot_ids)
    const candidate_sprint_snapshot = getCandidateSprintSnapshot(state) || null
    const is_active = isSprintSnapshotSelectorActive(state) || false

    return {
        sprint_id,
        sprint,
        is_active,
        candidate_sprint_snapshot,
        snapshots
    }
}

export default connect(mapStateToProps)(SprintSnapshotSelector)
