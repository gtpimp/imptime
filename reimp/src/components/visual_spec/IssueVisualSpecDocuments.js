import React, {Component} from 'react'
import {connect} from 'react-redux'

class Visual_Spec_Documents extends Component {

    render() {
        // @Gareth: arrows should have --enabled --disabled if prev/next available
        // @Gareth: click behaviour as appropriate (i.e.nothing if disabled)


        return (
            <div className="visual_spec_documents">
                <div className="visual_spec_documents__preview">

                </div>
                <div className="visual_spec_documents__navigator-wrapper">
                    <div className="visual_spec_documents__navigator">
                        <div className="visual_spec_documents__navigator-component visual_spec_documents__navigator-component--enabled visual_spec_documents__navigator-component--arrow-left visual_spec_documents__navigator-prev">
                            <i className="material-icons">keyboard_arrow_left</i>
                        </div>
                        <div className="visual_spec_documents__navigator-component visual_spec_documents__navigator-number">3</div>
                        <div className="visual_spec_documents__navigator-component visual_spec_documents__navigator-component--of">of</div>
                        <div className="visual_spec_documents__navigator-component visual_spec_documents__navigator-count">3</div>
                        <div className="visual_spec_documents__navigator-component visual_spec_documents__navigator-component--disabled visual_spec_documents__navigator-component--arrow-right visual_spec_documents__navigator-next">
                            <i className="material-icons">keyboard_arrow_right</i>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Visual_Spec_Documents)
