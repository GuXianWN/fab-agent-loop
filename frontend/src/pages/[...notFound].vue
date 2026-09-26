<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main>
    <UError :error="{ statusCode: 404, statusMessage: 'Page not found' }">
      <template #links>
        <UButton label="Back to home" @click="router.push('/')" />
      </template>
    </UError>
  </main>
</template>
