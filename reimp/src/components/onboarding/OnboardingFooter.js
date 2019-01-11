import React, {Component} from 'react'
import { cx, css } from 'emotion'

import { default_theme as theme } from '../../theme/default'
import PagePrimaryButton from '../PagePrimaryButton'

class OnboardingFooter extends Component {
    render() {        
        const {
            current_step,
            onLogout,
            onNextStep,
            onPrevStep,
            onComplete,
            next_step_label
        } = this.props

        return (
            <div className={ footer }>
              <div className={ left }>
                { current_step === 1 &&
                  <PagePrimaryButton
                      label="Logout"
                      onButtonClick={ onLogout } />
                }
                { onPrevStep && 
                  <PagePrimaryButton
                      label="Back"
                      onButtonClick={ onPrevStep } />
                }
              </div>
              <div className={ center }>
                <span className={ cx(circle, { [circle_active]: current_step >= 1 }) }></span>
                <span className={ cx(circle, { [circle_active]: current_step >= 2 }) }></span>
                <span className={ cx(circle, { [circle_active]: current_step >= 3 }) }></span>
                <span className={ cx(circle, { [circle_active]: current_step >= 4 }) }></span>
              </div>
              <div className={ right }>
                { onNextStep &&
                  <PagePrimaryButton
                      label={next_step_label || "Next"}
                      onButtonClick={ onNextStep } />
                }
                { !onNextStep && 
                  <PagePrimaryButton
                      label="Close"
                      onButtonClick={ onComplete } />
                }
              </div>
            </div>
        )
    }
}
export default OnboardingFooter

const footer = css`
display: flex;
height: 50px;
justify-content: space-between;
align-items: center;
padding: 18px;
position: absolute;
bottom: 0;
left: 0;
width: 100%;
`

const left = css``

const center = css`
display: flex;
width: 90px;
justify-content: space-between;
`

const right = css``

const circle = css`
display: block;
width: 6px; 
height: 6px; 
border-radius: 50%; 
background-color: ${theme.colours.white};
border: 1px solid ${theme.colours.list_text};
`

const circle_active = css`
display: block;
width: 6px; 
height: 6px; 
border-radius: 50%; 
background-color: ${theme.colours.list_text};
`
