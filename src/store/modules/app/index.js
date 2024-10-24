import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import defaultSettings from '@/config/settings.json';
import _ from 'lodash';

defaultSettings.serverMenu.forEach((menu) => {
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((sub_menu) => {
      localStorage.setItem(sub_menu.name, JSON.stringify(sub_menu.config));
    });
  } else {
    localStorage.setItem(menu.name, JSON.stringify(menu.config));
  }
});

const useAppStore = defineStore('app', {
  state: () => ({ ...defaultSettings }),

  getters: {
    appCurrentSetting(state) {
      return { ...state };
    },
    appDevice(state) {
      return state.device;
    },
    appAsyncMenus(state) {
      return state.serverMenu;
    },
  },

  actions: {
    // Update app settings
    updateSettings(partial) {
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device) {
      this.device = device;
    },
    toggleMenu(value) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig() {
      let notifyInstance = null;
      try {
        notifyInstance = Notification.info({
          id: 'menuNotice', // Keep the instance id the same
          content: 'loading',
          closable: true,
        });
        const { data } = [
          //TODO: add menu
        ];
        this.serverMenu = data;
        notifyInstance = Notification.success({
          id: 'menuNotice',
          content: 'success',
          closable: true,
        });
      } catch (error) {
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: 'error',
          closable: true,
        });
      }
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
    getMenuConfig(name) {
      return 
    }
  },
});

export default useAppStore;
