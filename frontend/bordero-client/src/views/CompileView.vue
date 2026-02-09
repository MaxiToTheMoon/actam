<script setup lang="ts">
import BorderoForm from '../components/BorderoForm.vue'
import BorderoTable from '../components/BorderoTable.vue'
import { useBorderoStore } from '../../stores/bordero'
import { computed } from 'vue'

// Borderò store to manage the songs in the list
const store = useBorderoStore()
// Computed property to disable the export button if the borderò does not contain all required fields or if there are no songs in the list
const isExportDisabled = computed(() => !store.isBorderoComplete || store.songs.length === 0)
</script>

<template>
	<v-card class="mt-4">
		<v-card-text>
			<h2 class="mb-4">Borderò SIAE</h2>
			<!-- Borderò form component -->
			<BorderoForm class="mb-6" />
			<!-- Borderò table component -->
			<BorderoTable />

			<v-divider class="my-4"></v-divider>
			<!-- Export PDF button -->
			<div class="d-flex justify-end">
				<v-btn color="primary" size="large" :disabled="isExportDisabled" @click="store.exportPDF()">
					<v-icon left>mdi-download</v-icon>
					Esporta PDF
				</v-btn>
			</div>
		</v-card-text>
	</v-card>
</template>
