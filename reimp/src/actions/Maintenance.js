export const MAINTENANCE_MODE_ACTIVE = 'MAINTENANCE_MODE_ACTIVE'
export const MAINTENANCE_MODE_INACTIVE = 'MAINTENANCE_MODE_INACTIVE'

export function enableMaintenanceMode() {
    return {
        type: MAINTENANCE_MODE_ACTIVE
    }
}

export function disableMaintenanceMode() {
    return {
        type: MAINTENANCE_MODE_INACTIVE
    }
}

export function isMaintenanceModeActive(state) {
    return state.maintenance.is_active || false
}
