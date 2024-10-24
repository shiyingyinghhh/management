import { DirectiveBinding } from 'vue';
function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding;
  const auth: any = localStorage.getItem('auth_keys')
  if (Array.isArray(value)) {
    if (value.length > 0) {
      const hasPermission = auth.includes(value);
      if (!hasPermission && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','user']"`);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
