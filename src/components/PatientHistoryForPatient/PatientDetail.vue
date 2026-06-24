<template>
  <div class="p-4 bg-gray-900 min-h-screen text-emphasis dark:md:p-8 dark:bg-">
    <div v-if="loading" class="text-center py-10">
      <p class="text-xl text-muted">Loading patient history...</p>
    </div>

    <div v-else class="mb-6">
      <p class="text-3xl mb-2 font-bold">
        {{ patient.name || 'Patient' }}
        <span class="text-sm text-muted">(ID: {{ patient.id }})</span>
      </p>
      <div v-if="patient.visits.length" class="space-y-6">
        <div v-for="(visit, index) in sortedVisits" :key="index" class="bg-elevated p-4 rounded-xl shadow-md space-y-2">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-xl font-semibold">Visit Date: {{ formatDate(visit.date) }}</h2>
            <span v-if="visit.isEmergency" class="px-3 py-1 bg-danger text-white text-xs font-bold rounded-full">EMERGENCY</span>
          </div>

          <p v-if="visit.doctor">
            <strong>Doctor:</strong>
            {{ visit.doctor }}
          </p>

          <p>
            <strong>Symptoms:</strong>
            {{ visit.symptoms || 'Not Provided' }}
          </p>
          <p>
            <strong>Diagnosis:</strong>
            {{ visit.diagnosis || 'Not Provided' }}
          </p>

          <!-- Prescription -->
          <div>
            <strong>Prescription:</strong>
            <ul v-if="visit.prescription?.length && visit.prescription[0].name" class="list-disc pl-5">
              <li v-for="(med, i) in visit.prescription" :key="i">
                <span v-if="med.dosage || med.frequency || med.duration">{{ med.name }} - {{ med.dosage }}, {{ med.frequency }} for {{ med.duration }}</span>
                <span v-else>{{ med.name }}</span>
              </li>
            </ul>
            <p v-else class="text-muted italic">No prescription provided.</p>
          </div>

          <!-- Lab Tests -->
          <div v-if="visit.labTests?.length">
            <strong>Lab Tests:</strong>
            <ul class="list-disc pl-5">
              <li v-for="(test, tIndex) in visit.labTests" :key="tIndex">{{ test.name }} - {{ test.result || test.status || 'Pending' }}</li>
            </ul>
          </div>

          <!-- Admission Advice -->
          <div>
            <p>
              <strong>Advise admission:</strong>
              <span :class="visit.admissionAdvice?.status === 'Yes' ? 'text-warning' : 'text-muted'">
                {{ visit.admissionAdvice?.status || 'Not Provided' }}
              </span>
            </p>
            <div v-if="visit.admissionAdvice?.status === 'Yes'">
              <p>
                <strong>Reason:</strong>
                {{ visit.admissionAdvice.reason || 'Not Provided' }}
              </p>
              <p v-if="visit.admissionAdvice.ward">
                <strong>Ward:</strong>
                {{ visit.admissionAdvice.ward }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted text-center mt-10">
        <p class="text-xl mb-2">No Medical History</p>
        <p>This patient doesn't have any medical history records yet.</p>
      </div>

      <!-- Notes Panel -->
      <div v-if="patientHistoryId" class="mt-8">
        <BaseButton @click="showNotesPanel = !showNotesPanel" variant="primary" class="mb-4">{{ showNotesPanel ? 'Hide Notes' : 'Show Notes' }} ({{ notes.length }})</BaseButton>

        <div v-if="showNotesPanel" class="bg-elevated p-6 rounded-xl shadow-md">
          <h3 class="text-xl font-semibold mb-4">Patient History Notes</h3>

          <div class="mb-6">
            <BaseTextArea v-model="newNoteText" placeholder="Add a new note..." :rows="3" class="mb-2" />
            <BaseButton @click="addNote" :disabled="isAddingNote || !newNoteText.trim()" variant="primary">
              {{ isAddingNote ? 'Adding...' : 'Add Note' }}
            </BaseButton>
          </div>

          <div v-if="notes.length === 0" class="text-center py-8 text-muted">No notes yet</div>

          <div v-else class="space-y-4">
            <div v-for="note in notes" :key="note.id" class="bg-surface p-4 rounded-lg border border-stroke">
              <div class="flex justify-between items-start mb-2">
                <p class="text-sm text-muted">{{ note.createdAt ? formatDate(note.createdAt) : 'Recently added' }}</p>
                <BaseButton @click="deleteNote(note.id)" variant="ghost" size="sm" class="text-red-600 hover:text-red-700">Delete</BaseButton>
              </div>
              <p class="text-emphasis whitespace-pre-wrap">{{ note.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import PatientHistoryServices from '@/services/PatientHistory/PatientHistory.services';
  import PatientServices from '@/services/Patient/patient.services';
  import PatientHistoryNoteServices from '@/services/PatientHistoryNote/PatientHistoryNote.services';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';

  const route = useRoute();
  const patientHistoryService = new PatientHistoryServices();
  const patientService = new PatientServices();
  const patientHistoryNoteService = new PatientHistoryNoteServices();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();

  const patient = ref({
    name: '',
    id: '',
    visits: [],
  });

  const loading = ref(true);
  const patientHistoryId = ref(null);
  const notes = ref([]);
  const newNoteText = ref('');
  const isAddingNote = ref(false);
  const showNotesPanel = ref(false);

  const sortedVisits = computed(() => {
    return [...patient.value.visits].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  }

  const loadNotes = async () => {
    if (!patientHistoryId.value) return;
    try {
      const response = await patientHistoryNoteService.getPatientHistoryNotesByPatientHistoryId(patientHistoryId.value);
      notes.value = response.data || [];
    } catch {
      console.error('Error loading notes');
    }
  };

  const addNote = async () => {
    if (!newNoteText.value.trim()) {
      showAlert('warning', 'Please enter a note', 'Warning');
      return;
    }

    if (!patientHistoryId.value) {
      showAlert('warning', 'No patient history selected', 'Warning');
      return;
    }

    isAddingNote.value = true;
    try {
      const response = await patientHistoryNoteService.addPatientHistoryNote({
        notes: newNoteText.value,
        patientHistoryId: patientHistoryId.value,
      });
      if (response.isSuccess) {
        showAlert('success', 'Note added successfully', 'Success');
        newNoteText.value = '';
        await loadNotes();
      }
    } catch {
      showAlert('error', 'Failed to add note', 'Error');
    } finally {
      isAddingNote.value = false;
    }
  };

  const deleteNote = async (noteId) => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const response = await patientHistoryNoteService.deletePatientHistoryNote(noteId);
      if (response.isSuccess) {
        showAlert('success', 'Note deleted successfully', 'Success');
        await loadNotes();
      }
    } catch {
      showAlert('error', 'Failed to delete note', 'Error');
    }
  };

  const fetchPatientData = async () => {
    try {
      loading.value = true;
      const patientId = route.query.patientId || 1;

      const patientResponse = await patientService.getPatientById(patientId);
      if (patientResponse?.data) {
        patient.value.name = `${patientResponse.data.firstName} ${patientResponse.data.lastName}`;
        patient.value.id = patientResponse.data.id;
      }

      const historyResponse = await patientHistoryService.getPatientHistoryByPatientId(patientId, 0, 100);

      if (historyResponse?.content && historyResponse.content.length > 0) {
        patientHistoryId.value = historyResponse.content[0].id;
        patient.value.visits = historyResponse.content.map((history) => ({
          date: history.visitDate,
          symptoms: history.symptom,
          diagnosis: history.disease?.name || 'Not diagnosed',
          prescription: history.prescription
            ? [
                {
                  name: history.prescription,
                  dosage: '',
                  frequency: '',
                  duration: '',
                },
              ]
            : [],
          labTests: [],
          admissionAdvice: {
            status: history.adviseAdmission ? 'Yes' : 'No',
            reason: history.adviseAdmission ? 'Medical recommendation' : '',
            ward: '',
          },
          isEmergency: history.isEmergency,
          doctor: history.employee?.name || 'Unknown',
        }));

        await loadNotes();
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchPatientData();
  });
</script>

<style scoped>
  ul {
    margin-top: 0.25rem;
  }
</style>
