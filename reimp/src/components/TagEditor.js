import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import Modal from 'react-modal';
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'

import { addTag } from '../actions/Issue'

class TagEditor extends Component {

    constructor(props) {
        super(props)
        this.saveTag = this.saveTag.bind(this)
    }

    saveTag(raw_tag) {
        const { dispatch } = this.props
        const tag_components = raw_tag.split(":")
        const tag_category_name = tag_components[0]
        const tag_name = tag_components[1]
        const {closeTagEditor, selected_ids} = this.props
        dispatch(addTag(selected_ids, tag_category_name, tag_name, closeTagEditor))
    }

    render() {
        const {isOpen, closeTagEditor, selected_items} = this.props

        return (
            <Modal isOpen={isOpen}
                   onRequestClose={closeTagEditor}
                   contentLabel="Tag editor">

                <h2>Edit tags</h2>
                {map(selected_items, function(issue, index) {
                     return (
                         <div key={index}>
                             {issue.number}
                             {issue.subject}
                         </div>
                     )
                 })}

                     Enter in format: tag_category:tag_name

                     <RIEModeToggler initialValue=""
                                     propName="raw_tag"
                                     initialState="editing"
                                     onChange={this.saveTag}
                                     onCancel={closeTagEditor}>
                         <RIEInput/>
                     </RIEModeToggler>

            </Modal>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default connect(mapStateToProps)(TagEditor)
