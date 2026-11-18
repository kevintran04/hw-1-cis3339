<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const links = [{ to: '/students', label: 'Students', icon: '01' }, { to: '/courses', label: 'Courses', icon: '02' }, { to: '/enrollments', label: 'Enrollments', icon: '03' }]
</script>
<template>
  <header class="topbar"><RouterLink to="/students" class="brand"><span class="brand-mark">C</span><span>Campus<span class="brand-light">Desk</span><small>STUDENT INFORMATION SYSTEM</small></span></RouterLink>
    <nav aria-label="Main navigation"><RouterLink v-for="link in links" :key="link.to" :to="link.to" :class="['nav-link', { active: route.path === link.to }]"><span class="nav-number">{{ link.icon }}</span>{{ link.label }}</RouterLink></nav>
    <div class="top-status"><span class="status-dot"></span> Local workspace</div>
  </header>
</template>
