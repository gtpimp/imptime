
import {
    ensureSprintUserRateLoaded,
    getSprintUserRate,
    updateSprintUserRates,
    getLoadingSprintUserRateIds,
    getInvalidatedSprintUserRateIds
} from './SprintUserRates'

export const ensureSprintUserVelocityLoaded = ensureSprintUserRateLoaded
export const getSprintUserVelocity = getSprintUserRate
export const updateSprintUserVelocities = updateSprintUserRates
export const getLoadingSprintUserVelocityIds = getLoadingSprintUserRateIds
export const getInvalidatedSprintUserVelocityIds = getInvalidatedSprintUserRateIds

