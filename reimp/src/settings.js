
// Constants which will be generated later, for now assume this has happened somehow

export const GLOBAL_SETTINGS = { __CONFIGURED: false }

GLOBAL_SETTINGS.WEBSOCKET_BASE_URL = "wss://localhost:443/refresh"
GLOBAL_SETTINGS.API_BASE_URL = "http://localhost:8000/"

// Local settings are loaded by App.js
/* 
 * require.ensure(['./external_config/react_local_settings'], function() {
 *     let local_settings = require('./external_config/react_local_settings')
 *     local_settings.set_local_settings(GLOBAL_SETTINGS)
 *     GLOBAL_SETTINGS.__CONFIGURED = true
 * })*/
