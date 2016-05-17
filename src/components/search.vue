<template>
  <a v-link="'/queue'" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">list</i></a>

  <form v-on:submit.prevent="searchYT">
    <div class="input-field">
      <input type="text" placeholder="Search" v-model="query">
    </div>
  </form>

  <ul class="collection">
    <li class="collection-item" v-for="video in videos">
        {{ video.snippet.title }}
    </li>
  </ul>
</template>

<script>
  import config from '../../config';
  import Firebase from 'firebase';
  import api from 'youtube-api-simple';

  // Set Firebase collection
  var playlistRef = new Firebase(config.firebaseURL + '/room/queue');

  // Set Youtube API object
  var youtube = api({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  export default {
    data() {
      return {
        query: '',
        videos: []
      }
    },
    methods: {
      /**
       * searchYT uses Google API to get a list of videos
       * @return {Object}   List of videos
       */
      searchYT() {
        youtube.search().list({
          part: 'snippet',
          q: this.query + ' karaoke'
        }).then((data) => {
          if(!data) {
            return;
          }

          data = JSON.parse(data);

          this.videos = data.items;
        });
      }
    }
  }
</script>
