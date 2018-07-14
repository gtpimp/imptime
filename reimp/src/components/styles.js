import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const DefaultListRowStyle = {display: 'flex',
                             flexDirection: 'row',
                             minHeight: '40px',
                             font: theme.fonts.list_items,              
                             paddingLeft: '18px',
                             backgroundColor: theme.colours.left_panel_background,
                             
                             ':hover': {
                                 backgroundColor: theme.colours.list_rollover
                             }
}

const TableCellStyle = {display: 'flex',
                        font: theme.fonts.list_items,
                        paddingLeft: '6px',
                        verticalAlign: 'middle',
                        alignItems: 'center',
                        flex: '0 0 190px',
                        color: theme.colours.list_text
}

const StatusCircle = {height: '16px',
                      width: '16px',
                      borderRadius: '8px',
                      opacity: '0.5'}

export const ProjectRowDiv = styled('div')(props => (DefaultListRowStyle,
                                                     {backgroundColor: props.is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,
                                                      ':hover': {
                                                          backgroundColor: props.is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                                      }}
)
)

export const SprintRowDiv = styled('div')(props => (DefaultListRowStyle,
                                                    {backgroundColor: props.is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,
                                                     ':hover': {
                                                         backgroundColor: props.is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                                     }}
)
)

export const ProjectStatusDiv = styled('div')(props => (StatusCircle,
                                                        {backgroundColor: props.colour}))

export const SprintStatusDiv = styled('div')(props => (StatusCircle,
                                                       {backgroundColor: props.status_ok ? 'green' : 'lightgray'
                                                       }))


export const TableCellDiv = styled('div')(props => (TableCellStyle))
    export const TableCellSecondaryDiv = styled('div')(props => (TableCellStyle,
                                                                 {color: theme.colours.normal_text}))
export const TableCellLinkDiv = styled('div')(props => ({':hover': {textDecoration: 'underline'}}))
