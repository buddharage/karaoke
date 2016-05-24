<template>
  <div class="main">
    <router-view :firebase-ref="firebaseRef"></router-view>
  </div>
</template>

<script>
  import config from '../config';
  import Firebase from 'firebase/app';
  import 'firebase/database';

  export default {
    replace: false,
    data() {
      return {
        firebaseRef: Firebase.initializeApp(config.firebase)
      }
    }
  }
</script>
