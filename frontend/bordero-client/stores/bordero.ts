import { defineStore } from 'pinia'
import jsPDF from 'jspdf'

export interface Song {
  id: string
  title: string
  artist: string
  composer: string
  execution: boolean
}

export interface BorderoData {
  // Event dates in dd-mm-yyyy format
  startDate: string
  endDate: string
  location: string
  eventType: string
  organizer: string
  startTime: string
  endTime: string
  solo: boolean
  performer: string
  isItalian: boolean
  address: string
  postalCode: string
  province: string
  municipality: string
  performerTaxId: string
  bandName: string
  partitaIva: string
  bandMembers?: Array<{
    nome: string
    cognome: string
    posizioneSiae: string
  }>
}

export const useBorderoStore = defineStore('bordero', {
  state: () => ({
    bordero: {
      // Event details
      startDate: '',
      endDate: '',
      location: '',
      eventType: '107-OR',
      organizer: '',
      startTime: '',
      endTime: '',
      // Performer details
      solo: true,
      performer: '',
      isItalian: true,
      address: '',
      postalCode: '',
      province: '',
      municipality: '',
      performerTaxId: '',
      partitaIva: '',
      bandName: '',
      bandMembers: []
    } as BorderoData,
    // Track list for the borderò
    songs: [] as Song[],
    isSaving: false,
    error: null as string | null
  }),
  getters: {
    // Total number of tracks
    songCount(state) {
      return state.songs.length
    }
    ,
    // Validation of required fields
    isBorderoComplete(state) {
      const b = state.bordero
      if (!b) return false
      if (!b.startDate || !b.endDate || !b.location || !b.eventType || !b.organizer || !b.startTime || !b.endTime) return false
      if (b.solo) {
        if (!b.performer || !b.address || !b.postalCode || !b.province || !b.municipality || !b.performerTaxId) return false
      } else {
        if (!b.performer || !b.address || !b.postalCode || !b.province || !b.municipality || !b.partitaIva) return false
      }
      return true
    }
  },
  actions: {
    // Adds a track to the list
    addSong(song: Song) {
      this.songs.push(song)
    },
    // Removes a track from the list
    removeSong(id: string) {
      this.songs = this.songs.filter(song => song.id !== id)
    },
    // Updates an existing track
    updateSong(updated: Song) {
      const idx = this.songs.findIndex(song => song.id === updated.id)
      if (idx !== -1) this.songs[idx] = updated
    },
    // Partially updates borderò data
    setBorderoData(data: Partial<BorderoData>) {
      this.bordero = { ...this.bordero, ...data }
    },
    exportPDF() {
      // Generates the borderò PDF
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(`Borderò - ${this.bordero.eventType}`, 10, 10)

      doc.setFontSize(12)
      doc.text(`Data: ${this.bordero.startDate} / ${this.bordero.endDate}`, 10, 20)
      doc.text(`Orario: ${this.bordero.startTime} - ${this.bordero.endTime}`, 10, 25)
      doc.text(`Luogo: ${this.bordero.location}`, 10, 30)
      
      doc.text(`Organizzatore: ${this.bordero.organizer}`, 10, 40)
      let y = 50

      doc.setFontSize(14)
      if (this.bordero.solo) {
        doc.text('--- Esecutore Singolo ---', 10, y)
        y += 10
        doc.setFontSize(12)
        doc.text(`Nome: ${this.bordero.performer || ''}`, 10, y); y += 5
        doc.text(`Nazionalità italiana: ${this.bordero.isItalian ? 'Sì' : 'No'}`, 10, y); y += 5
        doc.text(`Indirizzo: ${this.bordero.address || ''}`, 10, y); y += 5
        doc.text(`CAP: ${this.bordero.postalCode || ''}`, 10, y); y += 5
        doc.text(`Provincia: ${this.bordero.province || ''}`, 10, y); y += 5
        doc.text(`Comune: ${this.bordero.municipality || ''}`, 10, y); y += 5
        doc.text(`Codice Fiscale / Partita IVA: ${this.bordero.performerTaxId || ''}`, 10, y); y += 5
      } else {
        doc.text('--- Complesso Musicale ---', 10, y)
        y += 10
        doc.setFontSize(12)
        doc.text(`Nome del complesso: ${this.bordero.performer || ''}`, 10, y); y += 5
        doc.text(`Nazionalità italiana: ${this.bordero.isItalian ? 'Sì' : 'No'}`, 10, y); y += 5
        doc.text(`Indirizzo: ${this.bordero.address || ''}`, 10, y); y += 5
        doc.text(`CAP: ${this.bordero.postalCode || ''}`, 10, y); y += 5
        doc.text(`Provincia: ${this.bordero.province || ''}`, 10, y); y += 5
        doc.text(`Comune: ${this.bordero.municipality || ''}`, 10, y); y += 5
        doc.text(`Partita IVA: ${this.bordero.partitaIva || ''}`, 10, y); y += 5
        // Adds band members if present
        if (this.bordero.bandMembers && Array.isArray(this.bordero.bandMembers) && this.bordero.bandMembers.length > 0) {
          doc.text('Membri della band:', 10, y); y += 10
          this.bordero.bandMembers.forEach((m: any, idx: number) => {
            doc.text(`  - ${m.nome || ''} ${m.cognome || ''} (${m.posizioneSiae || ''})`, 12, y); y += 5
          })
        }
      }

      y += 10
      doc.setFontSize(14)
      doc.text('--- Brani ---', 10, y); y += 10
      doc.setFontSize(12)
      this.songs.forEach((song, index) => {
        doc.text(
          `${index + 1}. ${song.title} - ${song.artist} (Compositori: ${song.composer}), ${song.execution ? 'meno di 30 secondi' : 'più di 30 secondi'}`,
          10,
          y
        )
        y += 5
      })
      doc.save('bordero.pdf')
    }
  }
})
