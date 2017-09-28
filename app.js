// Proxy requests to prevent CORS issues on some RSS Feed URLs
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

function getPodcastFeedUrl(mood) {
  // TODO Change remaining ids for feed urls
  // Go to https://itunes.apple.com/lookup?id=1210802178 (<---- ID)
  // Open downloaded file from browser, find feedUrl and replace id with that.
  const MOODCASTS = {
    'happy': [
      'https://www.npr.org/rss/podcast.php?id=344098539',
      'http://feeds.feedburner.com/Recode-TETA',
      'http://nerdist.libsyn.com/rss'
    ],
    
    'curious': [ 
      'https://rss.art19.com/i-think-youre-interesting', 
      'https://feeds.megaphone.fm/mogul', 
      'http://feeds.feedburner.com/ThisIsMyNextPodcast'
    ],
    
      'bored': [
      'http://www.howstuffworks.com/podcasts/stuff-you-should-know.rss', 
      'https://www.npr.org/rss/podcast.php?id=510313', 
      'http://feeds.feedburner.com/pod-save-america'
    ],
  };

  const podcastFeeds = MOODCASTS[mood];
  const randomIndex = Math.floor(Math.random() * podcastFeeds.length);
  return podcastFeeds[randomIndex];
}

function getFeedResponse(feedUrl, callback) {
  // Makes HTTP request to RSS Feed and returns parsed response
  $.get(PROXY_URL + feedUrl, function(response) {
    const feedResponse = parseFeedResponse(response);
    callback(feedResponse);
  });
}

function parseFeedResponse(feedResponse) {
  // Parse RSS Feed to extract useful data regarding show and episodes
  const rssFeed = $(feedResponse);

  // Podcast title
  const title = rssFeed.find('channel').find('title').first().text();

  // Podcast artwork image url
  const imageUrl = rssFeed.find('channel').find('itunes\\:image').attr('href');

  const episodes = rssFeed.find('item');
  const episodeData = [];

  episodes.each(function(index) {
    const episode = $(this);
    // Episode title
    const title = episode.find('title').text();

    // Episode audio file URL
    const audioUrl = episode.find('enclosure').attr('url');

    const data = {
      title: title,
      audioUrl: audioUrl
    };

    // Append normalized episode data to array
    episodeData.push(data);
  });

  return {
    title: title,
    imageUrl: imageUrl,
    episodes: episodeData
  };
}

function playPodcast(podcastData) {
  // Plays latest podcast episode and sets player state
  const latestEpisode = podcastData.episodes[0];

  // Update Now listening to... text to show podcast title
  $('#player-now-listening').text('Now listening to: ' + podcastData.title);

  // Set URL to audio file
  $('#player-source').attr('src', latestEpisode.audioUrl);

  // <audio> DOM element without jQuery
  const playerAudioElement = $('#player-audio')[0];

  // Download audio file from src
  playerAudioElement.load();

  // When audio file is loaded, play it!
  playerAudioElement.oncanplaythrough = playerAudioElement.play();

  // Show podcast artworks
  $('#player-artwork').attr('src', podcastData.imageUrl);

  // Show player
  $('#player').show();

  // Show share widget
  $('#share').show();
}

function getAndPlayPodcast(feedUrl) {
  // Hide share widget
  $('#share').hide();

  // Reset podcast artworks
  $('#player-artwork').attr('src', '');

  // Get normalized podcast data from RSS Feed
  getFeedResponse(feedUrl, function(podcastData) {
    console.log(podcastData);

    // Sets up player and plays episode.
    playPodcast(podcastData);
  });
}

// jQuery will call this when DOM is ready
$(function() {
  // Click event handler triggered for Happy mood link
  $('#picker-happy').click(function(event) {
    // Prevents browser from trying to navigate to href #
    event.preventDefault();

    console.log('Clicked on happy!');
    const podcastFeedUrl = getPodcastFeedUrl('happy');
    console.log('podcastFeedUrl=', podcastFeedUrl);

    getAndPlayPodcast(podcastFeedUrl);
  });

  // Click event handler triggered for Curious mood link
  $('#picker-curious').click(function(event) {
    // Prevents browser from trying to navigate to href #
    event.preventDefault();

    console.log('Clicked on curious!');
    const podcastFeedUrl = getPodcastFeedUrl('curious');
    console.log('podcastFeedUrl=', podcastFeedUrl);

    getAndPlayPodcast(podcastFeedUrl);
  });

  // Click event handler triggered for Bored mood link
  $('#picker-bored').click(function(event) {
    // Prevents browser from trying to navigate to href #
    event.preventDefault();

    console.log('Clicked on bored!');
    const podcastFeedUrl = getPodcastFeedUrl('bored');
    console.log('podcastFeedUrl=', podcastFeedUrl);

    getAndPlayPodcast(podcastFeedUrl);
  });
});
