import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const DefaultListRowStyle

export const ProjectRowDiv = glamorous.div({display: 'flex',
                                     flexDirection: 'row',
                                     minHeight: '40px',
                                     font: theme.fonts.list_items,              
                                     paddingLeft: '24px',
                                     backgroundColor: theme.colours.left_panel_background,
                                     
                                     ':hover': {
                                         backgroundColor: theme.colours.list_rollover
                                     }},
                                    ({is_selected}) => (
                                        {backgroundColor: is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,
                                         ':hover': {
                                             backgroundColor: is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                         }}
                                    )

)
