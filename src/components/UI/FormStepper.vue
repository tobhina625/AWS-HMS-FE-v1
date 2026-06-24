<script setup lang="ts">
  import BaseButton from '@/components/Base/BaseButton.vue';
  import CheckmarkIcon from '@/assets/images/SVGs/Checkmark.svg';

  interface Step {
    id: number;
    title: string;
    description?: string;
  }

  const props = defineProps<{
    steps: Step[];
    currentStep: number;
  }>();

  const emit = defineEmits<{
    'update:currentStep': [step: number];
  }>();

  const isStepCompleted = (stepId: number) => {
    return stepId < props.currentStep;
  };

  const isStepActive = (stepId: number) => {
    return stepId === props.currentStep;
  };

  const getStepState = (stepId: number): 'completed' | 'active' | 'disabled' => {
    if (isStepCompleted(stepId)) return 'completed';
    if (isStepActive(stepId)) return 'active';
    return 'disabled';
  };

  const goToStep = (stepId: number) => {
    if (stepId <= props.currentStep) {
      emit('update:currentStep', stepId);
    }
  };
</script>

<template>
  <div class="w-full py-6">
    <div class="flex items-center justify-between">
      <div v-for="(step, index) in steps" :key="step.id" class="flex items-center" :class="{ 'flex-1': index < steps.length - 1 }">
        <!-- Step Circle -->
        <div class="relative flex flex-col items-center">
          <BaseButton variant="step" :step-state="getStepState(step.id)" :disabled="step.id > currentStep" @click="goToStep(step.id)">
            <CheckmarkIcon v-if="isStepCompleted(step.id)" class="w-6 h-6" />
            <span v-else>{{ step.id }}</span>
          </BaseButton>
          <div class="mt-3 text-center">
            <p :class="['text-sm font-medium', isStepActive(step.id) || isStepCompleted(step.id) ? 'text-emphasis' : 'text-bodydark dark:text-bodydark1']">
              {{ step.title }}
            </p>
            <p v-if="step.description" class="text-xs text-bodydark dark:text-bodydark1 mt-1 max-w-[120px]">
              {{ step.description }}
            </p>
          </div>
        </div>

        <!-- Connector Line -->
        <div v-if="index < steps.length - 1" :class="['flex-1 h-1 mx-4 transition-all duration-200', isStepCompleted(step.id) ? 'bg-primary' : 'bg-elevated']"></div>
      </div>
    </div>
  </div>
</template>
