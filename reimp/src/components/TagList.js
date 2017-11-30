import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Tag from './Tag'
import { getTags, ensureTagsLoaded } from '../actions/Tags'

class TagList extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { tag_ids, dispatch } = props
        dispatch(ensureTagsLoaded(tag_ids))
    }
    
    render() {
        const {tags, onDelete} = this.props
        return (
            <div className="tag_list">
              { map(tags, (tag) => <Tag tag_id={tag.id} onDelete={onDelete} />) }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_ids, onDelete } = this.props
    const tags = getTags(state, tag_ids)
    return {
        tag_ids,
        tags,
        onDelete
    }
}

export default connect(mapStateToProps)(TagList)
