<script setup lang="ts">
import { computed } from 'vue'
import { useAudioFilesStore } from '../stores/audioFiles'

const audioFilesStore = useAudioFilesStore()

const isRecognizing = computed(() => audioFilesStore.recognitionStatus.isRecognizing)
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>BorderòAI</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-tabs color="primary" align-tabs="center" grow>
          <!-- Tab names must correspond to the route names -->
          <v-tab :to="{ name: 'Recording' }" :disabled="isRecognizing" exact>Registra</v-tab>
          <v-tab :to="{ name: 'Recognize' }" exact>Riconosci</v-tab>
          <v-tab :to="{ name: 'BorderoForm' }" :disabled="isRecognizing" exact>Compila</v-tab>
        </v-tabs>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

