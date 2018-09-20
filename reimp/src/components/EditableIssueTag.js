import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import Tag from './Tag'
import TagForm from './form/TagForm'
import {
    addOrEditIssueTag,
    deleteTagFromIssues
} from '../actions/Issues'
import { ensureTagsLoaded, getTag } from '../actions/Tags'

class EditableIssueTag extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, tag_id } = props
        if ( tag_id ) {
            dispatch(ensureTagsLoaded([tag_id]))
        }
    }
    
    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        const tag_id = new_value.tag_id || this.props.tag_id
        const name = new_value.name || null
        const category_name = new_value.category_name || null
        dispatch(addOrEditIssueTag(name, category_name, issue_ids, tag_id))
    }

    onDelete(ev) {
        const { dispatch, issue_ids, tag_id } = this.props
        if ( ev ) {
            ev.stopPropagation()
        }
        if ( ! window.confirm("Delete this tag?") ) {
            return false
        }
        dispatch(deleteTagFromIssues(tag_id, issue_ids))
    }

    render() {
        const { can_edit, tag_id, project_id } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_tags'>
              { tag_id &&
                <EditableProperty property_key={'issue_tag_'+tag_id}
                                  initial_value={tag_id}
                                  edit_as_modal={true}
                                  action_label="Issue tags"
                                  modal_variant="large"
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <TagForm tag_id={tag_id} can_edit={can_edit} project_id={project_id}/>
                  <Tag tag_id={tag_id} can_edit={can_edit} onDelete={(ev) => this.onDelete(ev)} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }
              { ! tag_id &&
                <EditableProperty property_key={'issue_tag_new'}
                                  edit_as_modal={true}
                                  initial_value=''
                                  modal_variant="large"
                                  action_label="Issue tags" 
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <TagForm tag_id={tag_id} project_id={project_id} />
                  <div className="text-component--readonly"></div>
                  <div className="text-component--empty">
                    { can_edit && 
                      [
                          <div key="newtag" className="icon--add" data-tooltip="Create tag"></div>,
                          <p key="newtaglabel">Add tag</p>
                      ]
                    }
                  </div>
                </EditableProperty>
              }
            </PermissionInspectorHighlighter>
            
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_ids, tag_id, project_id } = props
    const tag = (tag_id && getTag(tag_id)) || {}

    return {
        tag,
        project_id,
        issue_ids,
        tag_id,
        can_edit: true
    }
}


export default connect(mapStateToProps)(EditableIssueTag)
