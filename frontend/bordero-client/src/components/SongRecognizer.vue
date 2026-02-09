<script setup lang="ts">
import { ref } from 'vue'
import { useAudioFilesStore } from '../../stores/audioFiles'

// Props to receive the list of audio files from the parent component
const props = defineProps<{
  audioFiles: File[]
}>()

// Emit event to send recognized songs back to the parent component
const emit = defineEmits<{
  'songs-recognized': [songs: any[]]
}>()

// Use the audio files store to manage recorded and uploaded audio files
const audioFilesStore = useAudioFilesStore()

// Local state to manage recognition results and selected file
const results = ref<any[]>([])
const selectedFile = ref<File | null>(null)

// Function to handle the song recognition process
const recognizeSong = async () => {
  if (!selectedFile.value) {
    alert('Seleziona un file da analizzare')
    return
  }

  // Setup the recognition state in the store
  audioFilesStore.startRecognition()
  // Prepare the form data to send the selected audio file to the backend for recognition
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    // Send the audio file to the backend for recognition
    const response = await fetch('http://localhost:8000/recognize', {
      method: 'POST',
      body: formData
    })

    // HTTP errors handling
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(errorData.detail || `Errore HTTP ${response.status}`)
    }

    // Async handling of the response from the backend
    const data = await response.json()
    
    if (data.success) {
      // Update the local results state and emit the recognized songs to the parent component
      results.value.push({
        file: selectedFile.value.name,
        ...data
      })
      emit('songs-recognized', data.songs)
      // Mark the recognition process as complete in the store
      audioFilesStore.completeRecognition()
    } else {
      const errorMsg = data.error
      audioFilesStore.setRecognitionError(errorMsg)
    }
  } catch (error) {
    // Log the error in the console and update the store with the error message
    console.error('Errore riconoscimento:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    audioFilesStore.setRecognitionError(errorMessage)
  }
}
</script>

<template>
  <div>
    <!-- Dropdown to select the audio file to recognize -->
    <v-select
      v-model="selectedFile"
      :items="audioFiles"
      item-title="name"
      label="Seleziona un file da analizzare"
      return-object
      prepend-icon="mdi-music"
      class="mb-4"
    >
      <!-- No data in the dropdown menuhandling-->
      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title>Nessun brano caricato per il riconoscimento</v-list-item-title>
        </v-list-item>
      </template>
    </v-select>

    <!-- Recognizing status -->
    <v-alert
      v-if="audioFilesStore.recognitionStatus.isRecognizing"
      type="info"
      class="mb-4"
    >
      Riconoscimento in corso...
    </v-alert>

    <!-- Error message if recognition fails -->
    <v-alert
      v-else-if="audioFilesStore.recognitionStatus.error"
      type="error"
      class="mb-4"
    >
      Errore durante il riconoscimento
      <div class="text-caption">{{ audioFilesStore.recognitionStatus.error }}</div>
    </v-alert>

    <!-- Button to start recognition (disabled if no file is selected or recognition is already in progress) -->
    <v-btn
      color="primary"
      :disabled="!selectedFile || audioFilesStore.recognitionStatus.isRecognizing"
      :loading="audioFilesStore.recognitionStatus.isRecognizing"
      block
      size="large"
      @click="recognizeSong"
    >
      <v-icon left>mdi-magnify</v-icon>
      Riconosci Canzone
    </v-btn>

    <v-divider class="my-6" v-if="results.length > 0"></v-divider>

    <div v-if="results.length > 0">
      <h3 class="mb-4">Risultati Riconoscimento</h3>
      
      <!-- Recognized songs results -->
      <v-card
        v-for="(result, i) in results"
        :key="i"
        class="mb-3"
        variant="outlined"
      >
        <v-card-title class="d-flex align-center">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          {{ result.file }}
        </v-card-title>
        <v-card-subtitle>
          canzoni riconosciute: {{ result.song_count || 1 }}
        </v-card-subtitle>
      </v-card>
    </div>
  </div>
</template>
