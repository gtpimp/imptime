import { get } from 'lodash'

export function getTableSizes(table_height, table_width, updated_measurements) {

    const height = get(updated_measurements, 'height', 0)
    const width = get(updated_measurements, 'width', 0)

    const new_state = {}

    if (table_width === 0) {
        new_state['table_width'] =  width
    }

    if (table_width - width > 50) {
        new_state['table_width'] =  width
    }

    if (table_height === 0) {
        new_state['table_height'] = height
    }

    if (table_height - height > 50) {
        new_state['table_height'] = height
    }
    return new_state
}
