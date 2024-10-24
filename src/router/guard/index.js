import { setRouteEmitter } from '@/utils/route-listener';
function setupPageGuard(router) {
    router.beforeEach(async (to) => {
        setRouteEmitter(to);
    });
    router.beforeEach(async (to) => {
        if (to.path == '/login') return
        else {

        }
        return;
    });
}

export default function createRouteGuard(router) {
    setupPageGuard(router);
}