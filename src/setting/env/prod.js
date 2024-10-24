import { Notification } from "@arco-design/web-vue";
import { getToken } from "@/utils/auth"

const env = 'test'
export default {
    env,
    req: {
        url: `https://core-api-${env}.mcga.com.cn`,
        err_handler: {
            all: (err) => {
                console.log(err);
                Notification.error(err.message)
                throw err
            }
        },
        g: getToken,
        ignore_path: [
            '/user/login'
        ]
    },
}