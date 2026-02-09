<script setup lang="ts">
import AudioRecorder from '../components/AudioRecorder.vue'
import { useAudioFilesStore } from '../../stores/audioFiles'

// Use the audio files store to manage recorded and uploaded audio files
const audioFilesStore = useAudioFilesStore()

// Handles the event emitted by AudioRecorder when a new audio blob is recorded
const handleAudioRecorded = (blob: Blob) => {
  const file = new File([blob], `Registrazione-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`, { type: 'audio/wav' })
  audioFilesStore.addFile(file)
}

// Handles the file upload event from the file input and it allows multiple files to be added at once
const handleFileUpload = (files: File | File[]) => {
  const fileArray = Array.isArray(files) ? files : [files]
  audioFilesStore.addFiles(fileArray)
}
</script>

<template>
  <v-card class="mt-4">
    <v-card-text>
      <!-- Component for recording audio -->
      <h2 class="mb-4">Registra Audio</h2>
      <AudioRecorder @audio-recorded="handleAudioRecorded" />

      <v-divider class="my-6"></v-divider>
      <!-- Component for uploading audio files -->
      <h3 class="mb-2">Oppure carica un file</h3>
      <v-file-input
        label="Seleziona file audio"
        accept="audio/*"
        multiple
        @update:model-value="handleFileUpload"
        prepend-icon="mdi-music"
      ></v-file-input>

      <!-- List of uploaded audio files -->
      <v-list v-if="audioFilesStore.audioFiles.length > 0">
        <v-list-subheader>File caricati ({{ audioFilesStore.audioFiles.length }})</v-list-subheader>
        <v-list-item
          v-for="(file, i) in audioFilesStore.audioFiles"
          :key="i"
          :title="file.name"
        >
          <template v-slot:prepend>
            <v-icon>mdi-music-note</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

