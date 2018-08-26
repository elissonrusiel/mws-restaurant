let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});

document.querySelector('#neighborhoods-select, #cuisines-select').addEventListener('change', event => {
  updateRestaurants();
});

registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function (reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
  });
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const section = document.querySelector('.restaurants-list');
  section.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const section = document.querySelector('.restaurants-list');
  restaurants.forEach(restaurant => {
    section.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const article = document.createElement('article');
  const content = document.createElement('section');
  const picture = document.createElement('picture');
  const db = DBHelper.imageUrlForRestaurant(restaurant);

  let source = document.createElement('source');
  source.media = `(max-width: 320px)`;
  source.srcset = `${db.photo['320']} 1x, ${db.photo['640']} 2x`;
  picture.append(source);

  source = document.createElement('source');
  source.media = `(max-width: 640px)`;
  source.srcset = `${db.photo['640']} 1x`;
  picture.append(source);

  source = document.createElement('source');
  source.media = `(min-width: 641px)`;
  source.srcset = `${db.photo['800']} 1x`;
  picture.append(source);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = `${db.photo[640]}`;
  image.alt = db.alt;
  picture.append(image);
  article.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  content.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  content.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  content.append(address);

  article.append(content);

  const divider = document.createElement('hr');
  article.append(divider);

  const more = document.createElement('a');
  more.setAttribute('aria-label', 'View more details of restaurant ' + restaurant.name);
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  article.append(more);

  const favorite = document.createElement('button');
  favorite.setAttribute('class', 'restaurant-favorite');
  favorite.innerHTML = '<svg viewBox="0 0 32 32" class="icon"><use xlink:href="/img/icons/heart-solid.svg#fa-heart"></use></svg>';
  toggleFavoriteClass(favorite, restaurant.is_favorite);
  favorite.addEventListener('click', (event) => {
    DBHelper.updateRestaurantFavorite(restaurant.id, !restaurant.is_favorite);
    restaurant.is_favorite = !restaurant.is_favorite;
    toggleFavoriteClass(favorite, restaurant.is_favorite);
  });
  article.append(favorite);

  return article;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Toggle favorite class
 */
toggleFavoriteClass = (element, favoriteStatus) => {
  if (favoriteStatus) {
    element.classList.add('favorite-active');
    element.setAttribute('aria-label', 'Marked as favorite.');
  } else {
    element.classList.remove('favorite-active');
    element.setAttribute('aria-label', 'Unmarked as favorite.');
  }
}