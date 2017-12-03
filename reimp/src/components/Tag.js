import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getTag, ensureTagsLoaded } from '../actions/Tags'

class Tag extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { tag_id, dispatch } = props
        if ( tag_id ) {
            dispatch(ensureTagsLoaded([tag_id]))
        }
    }

    render() {
        const {tag,  onDelete} = this.props

        if ( ! tag.id ) {
            return null
        }
        
        return (
            <div className="tag">
              <div className="tag__component tag__component__category">{tag.category_name}</div>
              <div className="tag__component tag__component__separator"></div>
              <div className="tag__component tag__component__name">{tag.name}</div>
              {  onDelete &&
                 <div className="tag__component tag__component__delete icon--small-cross" onClick={onDelete}></div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_id, onDelete } = props
    const tag = getTag(state, tag_id) || {}
    
    return {
        tag_id,
        tag,
        onDelete
    }
    
}


export default connect(mapStateToProps)(Tag)
