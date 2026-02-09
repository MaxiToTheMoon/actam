<script setup lang="ts">
import { ref } from 'vue'
import { useBorderoStore } from '../../stores/bordero'

// Borderò store to manage the songs in the list
const store = useBorderoStore()

const editPerformerDialog = ref(false)
const startTimeMenu = ref(false)
const endTimeMenu = ref(false)

const openPerformerDialog = () => {
  editPerformerDialog.value = true
}

const closePerformerDialog = () => {
  editPerformerDialog.value = false
}

// Band members management
const bandMembers = ref<Array<{ nome: string; cognome: string; posizioneSiae: string }>>([])
const newMember = ref({ nome: '', cognome: '', posizioneSiae: '' })

const addBandMember = () => {
  if (newMember.value.nome && newMember.value.cognome) {
    bandMembers.value.push({ ...newMember.value })
    newMember.value = { nome: '', cognome: '', posizioneSiae: '' }
  }
}

const removeBandMember = (index: number) => {
  bandMembers.value.splice(index, 1)
}

</script>

<template>
  <v-form>
    <v-row>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="store.bordero.startDate"
              @update:model-value="(v: string) => store.setBorderoData({ startDate: v })"
              :max="store.bordero.endDate || undefined"
              label="Data inizio"
              type="date"
              prepend-icon="mdi-calendar"
              variant="outlined"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :model-value="store.bordero.endDate"
              @update:model-value="(v: string) => store.setBorderoData({ endDate: v })"
              :min="store.bordero.startDate || undefined"
              label="Data fine"
              type="date"
              prepend-icon="mdi-calendar"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Location field -->
        <v-text-field
          :model-value="store.bordero.location"
          @update:model-value="(v: string) => store.setBorderoData({ location: v })"
          label="Luogo"
          prepend-icon="mdi-map-marker"
          variant="outlined"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="6">
            <!-- Start Time Picker -->
            <v-text-field
              :model-value="store.bordero.startTime"
              label="Seleziona l'ora di inizio"
              prepend-icon="mdi-clock-outline"
              readonly
              variant="outlined"
            >
              <v-menu
                v-model="startTimeMenu"
                :close-on-content-click="false"
                activator="parent"
              >
                <v-time-picker
                  v-model="store.bordero.startTime"
                  @update:model-value="(v: string) => store.setBorderoData({ startTime: v })"
                  :max="store.bordero.startDate === store.bordero.endDate ? store.bordero.endTime : undefined"
                  format="24hr"
                  hide-header
                ></v-time-picker>
              </v-menu>
            </v-text-field>
          </v-col>

          <v-col cols="6">
            <!-- End Time Picker -->
            <v-text-field
              :model-value="store.bordero.endTime"
              label="Seleziona l'ora di fine"
              prepend-icon="mdi-clock-outline"
              readonly
              variant="outlined"
            >
              <v-menu
                v-model="endTimeMenu"
                :close-on-content-click="false"
                activator="parent"
              >
                <v-time-picker
                  v-model="store.bordero.endTime"
                  @update:model-value="(v: string) => store.setBorderoData({ endTime: v })"
                  :min="store.bordero.startDate === store.bordero.endDate ? store.bordero.startTime : undefined"
                  format="24hr"
                  hide-header
                ></v-time-picker>
              </v-menu>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Organizer field -->
        <v-text-field
          :model-value="store.bordero.organizer"
          @update:model-value="(v: string) => store.setBorderoData({ organizer: v })"
          label="Organizzatore"
          prepend-icon="mdi-account"
          variant="outlined"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Event type dropdown -->
        <v-select
          :model-value="store.bordero.eventType"
          @update:model-value="(v: string) => store.setBorderoData({ eventType: v })"
          :items="['107-OR', '107-SM', '107-C']"
          label="Tipo Evento"
          prepend-icon="mdi-party-popper"
          variant="outlined"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" md="7">
            <v-select
              :model-value="store.bordero.solo"
              @update:model-value="(v: boolean | null) => store.setBorderoData({ solo: v ?? false })"
              :items="[{ title: 'Singolo', value: true }, { title: 'Complesso musicale', value: false }]"
              item-title="title"
              item-value="value"
              label="Esecutore"
              prepend-icon="mdi-trumpet"
              variant="outlined"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              label="Dati Esecutore"
              variant="outlined"
              @click="openPerformerDialog"
            >{{ 'Dati esecutore' }}</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>

  <!-- Performer Dialog -->
  <v-dialog v-model="editPerformerDialog" max-width="600px">
    <!-- Single performer data -->
    <v-card v-if="store.bordero.solo">
      <v-card-title>
        Dati Esecutore Singolo
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            :model-value="store.bordero.performer"
            @update:model-value="(v: string) => store.setBorderoData({ performer: v })"
            label="Nome Esecutore"
            prepend-icon="mdi-account-music"
            variant="outlined"
          ></v-text-field>

          <v-radio-group
            :model-value="store.bordero.isItalian"
            @update:model-value="(v: boolean | null) => store.setBorderoData({ isItalian: v ?? false })"
            label="Nazionalità italiana"
            inline
          >
            <v-radio label="Sì" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <v-text-field
            :model-value="store.bordero.address"
            @update:model-value="(v: string) => store.setBorderoData({ address: v })"
            label="Indirizzo"
            prepend-icon="mdi-home"
            variant="outlined"
          ></v-text-field>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="store.bordero.postalCode"
                @update:model-value="(v: string) => store.setBorderoData({ postalCode: v })"
                label="CAP"
                prepend-icon="mdi-mailbox"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="store.bordero.province"
                @update:model-value="(v: string) => store.setBorderoData({ province: v })"
                label="Provincia"
                prepend-icon="mdi-map"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            :model-value="store.bordero.municipality"
            @update:model-value="(v: string) => store.setBorderoData({ municipality: v })"
            label="Comune"
            prepend-icon="mdi-city"
            variant="outlined"
          ></v-text-field>

          <v-text-field
            :model-value="store.bordero.performerTaxId"
            @update:model-value="(v: string) => store.setBorderoData({ performerTaxId: v })"
            label="Codice Fiscale / Partita IVA"
            prepend-icon="mdi-card-account-details"
            variant="outlined"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closePerformerDialog">Chiudi</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Musical ensemble data -->
    <v-card v-else>
      <v-card-title>
        Dati Complesso Musicale
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            :model-value="store.bordero.performer"
            @update:model-value="(v: string) => store.setBorderoData({ performer: v })"
            label="Nome del complesso"
            prepend-icon="mdi-account-music"
            variant="outlined"
          ></v-text-field>

          <v-radio-group
            :model-value="store.bordero.isItalian"
            @update:model-value="(v: boolean | null) => store.setBorderoData({ isItalian: v ?? false })"
            label="Nazionalità italiana"
            inline
          >
            <v-radio label="Sì" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <v-text-field
            :model-value="store.bordero.address"
            @update:model-value="(v: string) => store.setBorderoData({ address: v })"
            label="Indirizzo"
            prepend-icon="mdi-home"
            variant="outlined"
          ></v-text-field>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="store.bordero.postalCode"
                @update:model-value="(v: string) => store.setBorderoData({ postalCode: v })"
                label="CAP"
                prepend-icon="mdi-mailbox"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="store.bordero.province"
                @update:model-value="(v: string) => store.setBorderoData({ province: v })"
                label="Provincia"
                prepend-icon="mdi-map"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            :model-value="store.bordero.municipality"
            @update:model-value="(v: string) => store.setBorderoData({ municipality: v })"
            label="Comune"
            prepend-icon="mdi-city"
            variant="outlined"
          ></v-text-field>

          <v-text-field
            :model-value="store.bordero.partitaIva"
            @update:model-value="(v: string) => store.setBorderoData({ partitaIva: v })"
            label="Partita IVA"
            prepend-icon="mdi-card-account-details"
            variant="outlined"
          ></v-text-field>
          <v-label class="d-block mb-4">Esecutori della band</v-label>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="newMember.nome"
                label="Nome"
                prepend-icon="mdi-account"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="newMember.cognome"
                label="Cognome"
                prepend-icon="mdi-account"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="newMember.posizioneSiae"
                label="Posizione SIAE"
                prepend-icon="mdi-music"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn variant="outlined" prepend-icon="mdi-plus" @click="addBandMember" :disabled="!newMember.nome || !newMember.cognome">
                Aggiungi
              </v-btn>
            </v-col>
          </v-row>

          <!-- Musical ensemble members -->
          <v-list v-if="bandMembers.length > 0" class="mt-4">
            <v-list-subheader>Membri della band ({{ bandMembers.length }})</v-list-subheader>
            <v-list-item
              v-for="(member, index) in bandMembers"
              :key="index"
            >
              <template v-slot:prepend>
                <v-icon>mdi-account-music</v-icon>
              </template>
              <v-list-item-title>{{ member.nome }} {{ member.cognome }}</v-list-item-title>
              <v-list-item-subtitle v-if="member.posizioneSiae">Posizione SIAE: {{ member.posizioneSiae }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="removeBandMember(index)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closePerformerDialog">Chiudi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
