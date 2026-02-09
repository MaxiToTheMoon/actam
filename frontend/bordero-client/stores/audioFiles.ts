import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RecognitionStatus {
  isRecognizing: boolean
  error: string | null
}

export const useAudioFilesStore = defineStore('audioFiles', () => {
  // List of audio files uploaded by the user
  const audioFiles = ref<File[]>([])
  // Recognition process status
  const recognitionStatus = ref<RecognitionStatus>({
    isRecognizing: false,
    error: null
  })

  // Adds a single file to the recognizeable files list
  function addFile(file: File) {
    audioFiles.value.push(file)
  }

  // Adds multiple files to the recognizeable files list
  function addFiles(files: File[]) {
    audioFiles.value.push(...files)
  }

  // Sets recognition state to active
  function startRecognition() {
    recognitionStatus.value = {
      isRecognizing: true,
      error: null
    }
  }

  // Recognition ended successfully
  function completeRecognition() {
    recognitionStatus.value = {
      isRecognizing: false,
      error: null
    }
  }

  // Recognition ended with an error
  function setRecognitionError(error: string) {
    recognitionStatus.value = {
      isRecognizing: false,
      error
    }
  }

  return {
    audioFiles,
    recognitionStatus,
    addFile,
    addFiles,
    startRecognition,
    completeRecognition,
    setRecognitionError
  }
})
