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
        const { dispatch, tag_id, issue_ids } = this.props
        dispatch(addOrEditIssueTag(new_value.name, new_value.category_name, issue_ids, tag_id))
    }

    onDelete() {
        const { dispatch, issue_ids, tag_id } = this.props
        if ( ! confirm("Delete this tag?") ) {
            return false
        }
        dispatch(deleteTagFromIssues(tag_id, issue_ids))
    }

    render() {
        const { issue, can_edit, tag_id } = this.props

        return (
            <div>
              { tag_id &&
                <EditableProperty property_key={'issue_tag_'+tag_id}
                                  initial_value={tag_id}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <TagForm tag_id={tag_id} />
                  <Tag tag_id={tag_id} can_edit={can_edit} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }
              { tag_id && can_edit && 
                <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>delete</button>
              }
              { ! tag_id &&
                <EditableProperty property_key={'issue_tag_new'}
                                  initial_value=''
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <TagForm tag_id={tag_id} />
                  <div className="text-component--readonly"></div>
                  <div className="text-component--empty">
                    { can_edit && 
                      <button className="button button--primary issue_sidebar--button">Create tag</button>
                    }
                  </div>
                </EditableProperty>
              }
            </div>
            
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_ids, tag_id } = props
    const tag = (tag_id && getTag(tag_id)) || {}

    return {
        tag,
        issue_ids,
        tag_id,
        can_edit: true
    }
}


export default connect(mapStateToProps)(EditableIssueTag)
