import React, { Component } from 'react';
import { css, cx } from 'react-emotion'
import loading_gif from '../images/loading.gif'

class Loading extends Component {

    render() {
        return (
            <div>
              <img alt="Loading" src={ loading_gif } />
            </div>
        )
    }
}

export default Loading
