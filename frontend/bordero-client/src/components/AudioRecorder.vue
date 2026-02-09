<script setup lang="ts">
import { ref } from 'vue'

// Emit event to send the recording blob back to the parent component
const emit = defineEmits<{
  'audio-recorded': [blob: Blob]
}>()

// Manage the recording state and the media recorder instance
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])

const startRecording = async () => {
  try {
    //Get access to the device microphone and start recording audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    // Asynchronously handle the recording and create a blob from the recorded audio when it is stopped
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    // Asynchronously handle the recording stop event, emit the recorded audio to the parent component and trigger the download
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      emit('audio-recorded', audioBlob)
      downloadRecording(audioBlob)
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (error) {
    console.error('Errore accesso microfono:', error)
    alert('Impossibile accedere al microfono')
  }
}

// Function to stop the recording and release the microphone resources
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
    isRecording.value = false
  }
}

// Function to download the recorded audio as a WAV file
const downloadRecording = (blob: Blob) => {
  // Create a temporary download link for the recorded audio to download it as a wav file
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Registrazione-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  // Remove the temporary link after the download is triggered
  document.body.removeChild(a)
}
</script>

<template>
  <!-- Audio Recorder Component -->
  <v-card class="pa-4" variant="outlined">
    <v-card-text class="text-center">
      <v-icon 
        :color="isRecording ? 'red' : 'grey'" 
        size="70"
        class="mb-4"
      >
        mdi-microphone
      </v-icon>

      <p v-if="isRecording" class="text-h6 text-red mb-4">
        Registrazione in corso...
      </p>
      <p v-else class="text-subtitle-1 mb-4">
        Premi il pulsante per iniziare a registrare
      </p>

      <v-btn
        v-if="!isRecording"
        color="primary"
        size="large"
        @click="startRecording"
      >
        <v-icon left>mdi-record</v-icon>
        Inizia Registrazione
      </v-btn>

      <v-btn
        v-else
        color="error"
        size="large"
        @click="stopRecording"
      >
        <v-icon left>mdi-stop</v-icon>
        Stop Registrazione
      </v-btn>
    </v-card-text>
  </v-card>
</template>
