
// Constants which will be generated later, for now assume this has happened somehow

export const GLOBAL_SETTINGS = {}

import { set_local_settings } from './external_config/local_settings'

GLOBAL_SETTINGS.WEBSOCKET_BASE_URL = "wss://localhost:443/refresh"
GLOBAL_SETTINGS.API_BASE_URL = "http://localhost:8000/"

set_local_settings(GLOBAL_SETTINGS)
