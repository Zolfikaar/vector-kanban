<template>
  <section class="overlay">
    <section class="app-shell">


      <Topbar />

      <section class="content-shell">
        
        <Sidebar />

        <section class="main-area">
          <h1>Main Area</h1>
        </section>


      </section>

    </section>
  </section>
</template>

<script setup>

</script>

<style scoped>
.content-shell {
  display: flex;
  gap: 1em;
}
</style>