// config.js
import cfg from "./config_env_file.js"

export default {
    backendUrl: () => {
        //FRONTEND_BACKEND_PROTOCOL + "://" + LISTEN_HOSTANDPORT + "/v1"
        return cfg.FRONTEND_BACKEND_PROTOCOL+ "://" + cfg.LISTEN_HOSTANDPORT+ "/v1"
    }
}