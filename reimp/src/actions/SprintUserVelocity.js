
import {
    ensureSprintUserRateLoaded,
    getSprintUserRate,
    updateSprintUserRates,
    getLoadingSprintUserRateIds,
    getInvalidatedSprintUserRateIds,
    isSurLoading,
    isSurInvalidated
} from './SprintUserRates'

export const ensureSprintUserVelocityLoaded = ensureSprintUserRateLoaded
export const getSprintUserVelocity = getSprintUserRate
export const updateSprintUserVelocities = updateSprintUserRates
export const getLoadingSprintUserVelocityIds = getLoadingSprintUserRateIds
export const getInvalidatedSprintUserVelocityIds = getInvalidatedSprintUserRateIds
export const isSuvLoading = isSurLoading
export const isSuvInvalidated = isSurInvalidated

