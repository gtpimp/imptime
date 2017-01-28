import React, {Component} from 'react'
import {connect} from 'react-redux'

class Attachments extends Component {

    render() {
        // @Gareth: arrows should have --enabled --disabled if prev/next available
        // @Gareth: click behaviour as appropriate (i.e.nothing if disabled)


        return (
            <div className="attachments">
                <div className="attachments__preview">

                </div>
                <div className="attachments__navigator-wrapper">
                    <div className="attachments__navigator">
                        <div className="attachments__navigator-component attachments__navigator-component--enabled attachments__navigator-component--arrow-left attachments__navigator-prev">
                            <i className="material-icons">keyboard_arrow_left</i>
                        </div>
                        <div className="attachments__navigator-component attachments__navigator-number">3</div>
                        <div className="attachments__navigator-component attachments__navigator-component--of">of</div>
                        <div className="attachments__navigator-component attachments__navigator-count">3</div>
                        <div className="attachments__navigator-component attachments__navigator-component--disabled attachments__navigator-component--arrow-right attachments__navigator-next">
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


export default connect(mapStateToProps)(Attachments)
