import React, {Component} from 'react'

class TickCross extends Component {

    render() {
        const { value } = this.props

        return (
            <div className="tickcross">
              { value == true && <div className="tickcross__tick">Yes</div> }
              { value == false && <div className="tickcross__cross">No</div> }
            </div>
        )
    }
    
}

export default TickCross
