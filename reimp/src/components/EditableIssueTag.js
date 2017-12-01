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
    addTagToIssues,
    deleteTagFromIssues
} from '../actions/Issues'
import {
    updateTags
} from '../actions/Tags'
import { has_permission } from '../actions/Users'

class EditableIssueTag extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    onChange(new_value) {
        const { dispatch } = this.props
        dispatch(updateTags(new_value.tags))
    }

    onDelete(tag_id) {
        const { dispatch, issue_ids } = this.props
        dispatch(deleteTagFromIssues(tag_id, issue_ids))
    }

    onCreate(tag_name, tag_category_name) {
        const { dispatch, issue_ids } = this.props
        dispatch(addTagToIssues(tag_name, tag_category_name, issue_ids))
    }

    render() {
        const { issue, can_edit, tag, tag_id } = this.props

        return (
            <div>
              { tag.id &&
                <EditableProperty property_key={'issue_tag_'+tag_id}
                                  initial_value={tag_id}
                                  onChange={this.onChange}
                                  can_edit={true}
                    >
                  <TagForm tag_id={tag_id} />
                  <Tag tag_id={tag_id} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }
              { tag.id &&
                <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>delete</button>
              }
              { ! tag.id &&
                <EditableProperty property_key={'issue_tag_new'}
                                  initial_value=''
                                  onChange={this.onChange}
                                  can_edit={true}
                    >
                  <TagForm tag_id={tag_id} />
                  <div className="text-component--readonly"></div>
                  <div className="text-component--empty">
                    <button className="button button--primary issue_sidebar--button">Create tag</button>
                  </div>
                </EditableProperty>
              }
            </div>
                  
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_ids, tag_id } = props

    return {
        issue_ids,
        tag_id,
    }
}


export default connect(mapStateToProps)(EditableIssueTag)
