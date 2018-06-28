/**
 * Common database helper functions.
 */
class DBHelper {

  static get _dbPromise() {
    return DBHelper._openDatabase()
  }

  /**
   * Open Database
   */
  static _openDatabase() {
    return idb.open('restrev', 1, function(upgradeDb) {
      switch(upgradeDb.oldVersion) {
        case 0:
          let keyValStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      }
    });
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // Fetch from API and update idb
    fetch(DBHelper.DATABASE_URL)
    .then(response => response.json())
    .then(data => {
      DBHelper._dbPromise.then(db => {
        let tx = db.transaction('restaurants', 'readwrite');
        let store = tx.objectStore('restaurants');
        data.forEach(restaurant => {
          store.put(restaurant);
        });
      });
    })
    .catch(err => {
      error = (`Fetch failed. Returned status of ${err}`)
    });
    
    // Get from idb and return to callback function
    DBHelper._dbPromise.then(db => {
      db.transaction('restaurants')
        .objectStore('restaurants')
        .getAll()
        .then(data => {
          callback(null, data)
        })
        .catch(err => {
          const error = (`Get from idb failed. Returned status of ${err}`)
          callback(error, null)
        });
      })
      
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    const url = `${DBHelper.DATABASE_URL}/${id}`
    fetch(url)
    .then(response => response.json())
    .then(data => {
      DBHelper._dbPromise.then(db => {
        db.transaction('restaurants', 'readwrite')
        .objectStore('restaurants')
        .openCursor(parseInt(id))
        .then(cursor => {
          if (!cursor) return;
          cursor.update(data);
        })
      });
    })
    .catch(err => {
        const error = (`Request failed. Returned status of ${err}`)
    })

    // Get from idb and return to callback function
    DBHelper._dbPromise.then(db => {
      db.transaction('restaurants')
        .objectStore('restaurants')
        .get(parseInt(id))
        .then(data => {
          callback(null, data)
        })
        .catch(err => {
          const error = (`Get from idb failed. Returned status of ${err}`)
          callback(error, null)
        });
      })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    const img = {
      photo: restaurant.photograph,
      alt: restaurant.photograph_alt
    }
    return img;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
