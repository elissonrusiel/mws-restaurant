let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        title: 'Restaurants directions',
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.querySelector('.restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.querySelector('.restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.querySelector('.restaurant-img');
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

  const cuisine = document.querySelector('.restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.querySelector('.restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.querySelector('.reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const section = document.querySelector('.reviews-list');
  reviews.forEach(review => {
    section.appendChild(createReviewHTML(review));
  });
  container.appendChild(section);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const article = document.createElement('article');
  
  /* Review Header */
  const header = document.createElement('section');
  header.setAttribute('class', 'review-header');

  const name = document.createElement('section');
  name.setAttribute('class', 'review-name');
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('section');
  date.setAttribute('class', 'review-date');
  date.innerHTML = review.date;
  header.appendChild(date);

  article.appendChild(header);

  /* Review content */
  const content = document.createElement('section');
  content.setAttribute('class', 'review-content');

  const rating = document.createElement('section');
  rating.setAttribute('class', 'review-rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  content.appendChild(rating);

  const comments = document.createElement('p');
  comments.setAttribute('class', 'review-comment');
  comments.innerHTML = review.comments;
  content.appendChild(comments);

  article.appendChild(content);
  return article;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
