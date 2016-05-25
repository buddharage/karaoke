<template>
  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/'">
      <i class="material-icons">list</i>
    </a>
  </div>

  <form v-on:submit.prevent="searchYT">
    <div class="input-field">
      <input type="text" placeholder="Search" v-model="query">
    </div>
  </form>

  <div class="search-results row">
    <div class="card small activator col s12 m6 l4"
      v-for="video in videosResult"
      v-on:click.prevent="addToQueue(video)">
        <div class="card-image">
          <img v-bind:src="video.snippet.thumbnails.high.url">
        </div>
        <div class="card-content">
          <span class="card-title">{{ video.snippet.title }}</span>
        </div>
    </div>
  </div>
</template>

<script>
  import config from '../../config';
  import api from 'youtube-api-simple';

  // Set Youtube API object
  var youtube = api({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  export default {
    data() {
      return {
        query: '',
        videosResult: []
      }
    },
    props: [
      'firebaseRef'
    ],
    methods: {
      /**
       * addToQueue() adds video to Firebase database
       * in the 'queue' table
       * @param {Object}  video
       */
      addToQueue(video) {
        if(!video) {
          return;
        }

        this.firebaseRef.database().ref('queue').push({
          performer: 'Thai',
          song: {
            id: video.id.videoId,
            title: video.snippet.title
          }
        }).then(() =>
          // Redirect to queue view
          this.$route.router.go({name: 'queue'})
        );
      },
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

          // Parse search results
          // and show in Vue
          this.videosResult = JSON.parse(data).items;
        });
      }
    }
  }
</script>
