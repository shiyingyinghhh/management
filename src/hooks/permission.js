import { useUserStore } from '@/store';
import { useStorage } from '@vueuse/core';

export default function usePermission() {
      const auth = useStorage('auth_keys', [])
  return {
    accessRouter(route) {
      return  true
      // return (
      //   !route.meta?.requiresAuth ||
      //   // !route.meta?.roles ||
      //   // route.meta?.roles?.includes('*') ||
      //   // route.meta?.roles?.includes(userStore.role) ||
      //   auth.value.includes(route.meta?.auth)
      // )
    },
    findFirstPermissionRoute(_routers, role = 'admin') {
      const cloneRouters = [..._routers];
      while (cloneRouters.length) {
        const firstElement = cloneRouters.shift();
        if (
          firstElement?.meta?.roles?.find((el) => {
            return el.includes('*') || el.includes(role);
          })
        )
          return { name: firstElement.name };
        if (firstElement?.children) {
          cloneRouters.push(...firstElement.children);
        }
      }
      return null;
    },
    // You can add any rules you want
  };
}
