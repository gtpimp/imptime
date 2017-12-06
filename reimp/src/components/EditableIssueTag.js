import React, {Component} from 'react'
import { intersection, map } from 'lodash'
import {connect} from 'react-redux'
import classNames from 'classnames' 
import EditableProperty from './form/EditableProperty'
import Tag from './Tag'
import TagForm from './form/TagForm'
import {
    updateIssueSubject,
    getIssues,
    addOrEditIssueTag,
    deleteTagFromIssues
} from '../actions/Issues'
import { updateTags, ensureTagsLoaded, getTag } from '../actions/Tags'
import { has_permission } from '../actions/Users'

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
        if ( ! confirm("Delete this tag?") ) {
            return false
        }
        dispatch(deleteTagFromIssues(tag_id, issue_ids))
    }

    render() {
        const { issue, can_edit, tag_id, project_id } = this.props

        return (
            <div>
            { tag_id &&
              <EditableProperty property_key={'issue_tag_'+tag_id}
                                initial_value={tag_id}
                                edit_as_modal={true}
                                action_label="Issue tags"
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
                                action_label="Issue tags" 
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <TagForm tag_id={tag_id} project_id={project_id} />
                <div className="text-component--readonly"></div>
                <div className="text-component--empty">
                  { can_edit && 
                    <div className="icon--add" data-tooltip="Create tag"></div>
                  }
                </div>
              </EditableProperty>
            }
            </div>
            
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
