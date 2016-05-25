<template>
  <div class="main">
    <router-view
      :db="db"
      :firebase-ref="firebaseRef"
      :videos="videos"
      ></router-view>
  </div>
</template>

<script>
  import config from '../config';
  import Firebase from 'firebase/app';
  import firebaseMixin from './mixins/firebase';
  import 'firebase/database';

  var firebaseRef = Firebase.initializeApp(config.firebase);

  export default {
    mixins: [firebaseMixin],
    replace: false,
    data() {
      return {
        db: firebaseRef.database(),
        firebaseRef: firebaseRef,
        videos: {
          source: firebaseRef.database().ref('queue')
        }
      }
    }
  }
</script>
