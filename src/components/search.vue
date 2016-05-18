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
    <div class="card small col s12 m6 l4"
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
  import Firebase from 'firebase';
  import api from 'youtube-api-simple';

  // Set Youtube API object
  var youtube = api({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  var queueRef = new Firebase(config.firebaseURL + '/room/queue');

  export default {
    data() {
      return {
        query: '',
        videosResult: []
      }
    },
    methods: {
      addToQueue(video) {
        if(!video) {
          return;
        }

        queueRef.push({
          id: video.id.videoId,
          title: video.snippet.title
        });
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

          data = JSON.parse(data);

          console.log(data);

          this.videosResult = data.items;
        });
      }
    }
  }
</script>
