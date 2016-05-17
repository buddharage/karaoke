<template>
  <a v-link="'/search'" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">search</i></a>

  <ul class="collection">
    <li v-for="track in tracks" class="collection-item">
        {{ track.song.title }}
    </li>
  </ul>
</template>

<script>
  import config from '../../config';
  import Firebase from 'firebase';

  var playlistRef = new Firebase(config.firebaseURL + '/rooms/vibh/queue');

  export default {
    firebase: {
      tracks: playlistRef.limitToLast(100)
    }
  }
</script>
