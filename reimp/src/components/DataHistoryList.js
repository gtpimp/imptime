import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import classNames from 'classnames'
import { css } from 'emotion'
import DivTable from '../components/DivTable'
import ModalDialog from './ModalDialog';

class DataHistoryList extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            impDataHistoryStore: [],
            isOpen: false 
        };
      }

    componentDidMount() {
        const impDataHistoryStore = JSON.parse(localStorage.getItem('impDataHistoryStore')) || []
        this.setState({
            impDataHistoryStore: impDataHistoryStore
        })
    }
    
    toggleModal = () => {
    this.setState({
        isOpen: !this.state.isOpen
        });
    }

    render() {

        return (
            <div>
              <DivTable>
                  
              { map(this.state.impDataHistoryStore, (entry) => {
              
                    return (
                        
                        <div className="auto-clock-list__row" key={entry.field_name}>
                            <div className={classNames("auto_clock-list__auto_clock_name")} onClick={this.toggleModal}>
                                <div className={classNames("auto-clock-entry", "entry__"+entry.field_name)}>
                                    <div className={css`display: flex`}>
                                        <div className="auto-clock-entry__label">
                                            Field: 
                                        </div>
                                        {entry.field_name}
                                    </div>
                                    
                                    <div className="auto-clock-entry__description">
                                        <div className="auto-clock-entry__label">
                                            Value
                                        </div>
                                        { entry.field_value }
                                    </div>
                                </div>
                            </div>
                        
                            { this.state.isOpen && 
                                <ModalDialog isOpen={true}
                                            variant="large"
                                            contentLabel="">
                                    <div className="editable-property-modal__row editable-property-modal__row--header">
                                        <label htmlFor="assigned" className="editable-property-modal__title">View Data History Entry</label>
                                        <div className="editable-property-modal__close"><i className="material-icons" onClick={this.toggleModal} >close</i></div>
                                    </div>
                                    <div className="editable-property-modal__content">
                                        <div className="auto-clock__form">
                                            <div className="auto-clock-entry__label">Field Name: </div>
                                            <div className="other_user">{entry.field_name} </div>
                                        </div>

                                        <textarea rows="3" className="textarea textarea--text-component textarea--description">
                                            { entry.field_value }
                                        </textarea>
                                    </div>
                                </ModalDialog>
                            }
                        </div>
                    )
              })}
              </DivTable>
            </div>
        )
    }
}

function mapStateToProps() {

    return {
    }
}

export default connect(mapStateToProps)(DataHistoryList)
