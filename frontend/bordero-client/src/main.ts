import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
    dark: {
        dark: true,
        colors: {
          primary: '#6366f1',
          error: '#ef4444',
          info: '#3b82f6',
          success: '#10b981',
          background: '#0f172a',
          surface: '#1e293b',
        }
      }
    }
  },
  defaults: {
    VBtn: {
      elevation: 0,
      rounded: 'lg'
    },
    VCard: {
      elevation: 0,
      rounded: 'lg'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VFileInput: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(router)

app.mount('#app')
