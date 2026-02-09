<script setup lang="ts">
import SongRecognizer from '../components/SongRecognizer.vue'
import { useBorderoStore } from '../../stores/bordero'
import { useAudioFilesStore } from '../../stores/audioFiles'

// Borderò store to manage the songs in the list
const store = useBorderoStore()
// Use the audio files store to manage recorded and uploaded audio files
const audioFilesStore = useAudioFilesStore()

// Handles the event emitted by SongRecognizer and adds new songs to the borderò list when recognized
const handleSongRecognized = (songs: any[]) => {
  songs.forEach(song => {
    store.addSong({
      id: crypto.randomUUID(),
      title: song.title || 'Sconosciuto',
      artist: song.artist || 'Sconosciuto',
      composer: song.composer || 'Sconosciuto',
      execution: song.duration < 30
    })
  })
}
</script>

<template>
  <v-card class="mt-4">
    <v-card-text>
      <!-- Component for recognizing songs -->
      <h2 class="mb-4">Riconosci Canzoni</h2>
      <SongRecognizer 
        :audio-files="audioFilesStore.audioFiles" 
        @songs-recognized="handleSongRecognized" 
      />
    </v-card-text>
  </v-card>
</template>
