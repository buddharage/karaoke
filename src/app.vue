<template>
  <div class="main">
    <nav>
      <a v-link="'/thai'">Thai</a>
      <a v-link="'/lydia'">Lydia</a>
    </nav>

    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    replace: false
  }
</script>
