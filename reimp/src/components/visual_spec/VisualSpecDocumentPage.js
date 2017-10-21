import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../../actions/Breadcrumbs'
import VisualSpecDocumentEditor from './VisualSpecDocumentEditor'

import { PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE } from '../../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../../actions/Page'

class VisualSpecDocumentPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(true))
        dispatch(set_toolbars(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE, ['visual-spec-document']))
    }

    componentWillReceiveProps() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(true))
    }
    
    render() {

        const { visual_spec_document_id } = this.props
        
        return (
            <div>
              <VisualSpecDocumentEditor visual_spec_document_id={visual_spec_document_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const visual_spec_document_id = props.params.visualSpecDocumentId
    
    return {
        visual_spec_document_id
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
