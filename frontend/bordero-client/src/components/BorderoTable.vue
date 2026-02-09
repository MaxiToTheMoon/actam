<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBorderoStore } from '../../stores/bordero'
import type { Song } from '../../stores/bordero'

// Borderò store to manage the songs in the list
const store = useBorderoStore()

const editDialog = ref(false)
const editedSong = ref<Song | null>(null)
const newSong = ref<Song>({
  id: '',
  title: '',
  artist: '',
  composer: '',
  execution: false
})

// Load the number of items per page from localStorage
const itemsPerPage = ref<number>(10)

onMounted(() => {
  const saved = localStorage.getItem('bordero-items-per-page')
  if (saved) {
    itemsPerPage.value = parseInt(saved, 10)
  }
})

const updateItemsPerPage = (value: number) => {
  itemsPerPage.value = value
  localStorage.setItem('bordero-items-per-page', value.toString())
}

const headers = [
  { title: '#', key: 'index' },
  { title: 'Titolo', key: 'title' },
  { title: 'Artista', key: 'artist' },
  { title: 'Compositori', key: 'composer' },
  { title: 'Esecuzione < 30\'\'', key: 'execution', sortable: false },
  { title: 'Azioni', key: 'actions', sortable: false }
]

const editSong = (song: Song) => {
  editedSong.value = { ...song }
  editDialog.value = true
}

const saveEdit = () => {
  if (editedSong.value) {
    store.updateSong(editedSong.value)
    editDialog.value = false
  }
}

const addManualSong = () => {
  const song: Song = {
    ...newSong.value,
    // trim is used to treat whitespace strings as an empty input
    composer: newSong.value.composer?.trim() ? newSong.value.composer : 'Sconosciuto',
    id: crypto.randomUUID()
  }
  store.addSong(song)
  newSong.value = {
    id: '',
    title: '',
    artist: '',
    composer: '',
    execution: false
  }
}
</script>

<template>
  <div>
    <!-- Form to add a song manually -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title>
        <v-icon left>mdi-plus</v-icon>
        Aggiungi un brano manualmente
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="newSong.title"
              label="Titolo"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="newSong.artist"
              label="Artista"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="newSong.composer"
              label="Compositori (separati dalla virgola)"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              @click="addManualSong"
              :disabled="!newSong.title || !newSong.artist"
              block
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Songs Table -->
    <v-data-table
      :headers="headers"
      :items="store.songs"
      :items-per-page="itemsPerPage"
      :items-per-page-text="'Mostrati:'"
      @update:items-per-page="updateItemsPerPage"
      class="elevation-1"
    >
      <template v-slot:item.index="{ index }">
        {{ index + 1 }}
      </template>

      <!-- Execution under 30 seconds checkbox -->
      <template v-slot:item.execution="{ item }">
        <v-checkbox
          :model-value="item.execution"
          @update:model-value="(v: boolean | null) => store.updateSong({ ...item, execution: v ?? false })"
        ></v-checkbox>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="editSong(item)"
        ></v-btn>
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="store.removeSong(item.id)"
        ></v-btn>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="ma-4">
          Nessun brano nel borderò. Aggiungi brani tramite riconoscimento o manualmente.
        </v-alert>
      </template>
    </v-data-table>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card v-if="editedSong">
        <v-card-title>Modifica Brano</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedSong.title"
            label="Titolo"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="editedSong.artist"
            label="Artista"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="editedSong.composer"
            label="Compositori (separati da virgola)"
            class="mb-2"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false">Annulla</v-btn>
          <v-btn color="primary" @click="saveEdit">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
