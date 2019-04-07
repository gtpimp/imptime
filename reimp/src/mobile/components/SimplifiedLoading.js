import React, { Component } from 'react';
import loading_gif from '../../images/loading.gif'

class SimplifiedLoading extends Component {

    render() {
        return (
            <div>
              <img alt="Loading" src={ loading_gif } />
            </div>
        )
    }
}

export default SimplifiedLoading
