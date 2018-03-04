import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getTagCategoryName } from '../actions/Tags'

class TagCategory extends Component {

    render() {
        const {name} = this.props

        return (<div className="tag_category_name">{name}</div>)
    }
}

function mapStateToProps(state, props) {
    const { tag_category_id } = props
    const name = getTagCategoryName(state, tag_category_id) || {}
    return { name }

}

export default connect(mapStateToProps)(TagCategory)
