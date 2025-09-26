import {
  appendCarousel,
  clear,
  createCarouselItem,
  start,
} from "./Carousel.js";

// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_s9mrwwa9aj6cDYSbsXua2amCW7yLgtV3sqzOTFriwmlVS9gbHiFIZhfHYGylnIec";

// Create an instance of axios with pre-built parameters (baseURL, headers with API_KEY)
const api = axios.create({
  baseURL: "https://api.thecatapi.com/v1",
  headers: {
    "x-api-key": API_KEY,
  },
  onDownloadProgress: updateProgess,
});

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */

// Create a function getting breeds list
async function initialLoad() {
  try {
    // Request for breeds list
    const response = await api.get("/breeds");
    // Store response data to the variable
    const breeds = response.data;

    // Create dropdown elements for each recieved object
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      // Append all elements to parent dropdown
      breedSelect.appendChild(option);
    });

    // If array of breeds not empty render first breed
    if (breeds) {
      handleBreedSelect(breeds[0].id);
    }
  } catch (error) {
    // Catch if any error
    console.error("Error fetching data:", error);
  }
}

// Run main function
initialLoad();

// Listener for changing the breed option
breedSelect.addEventListener("change", handleBreedSelect);

// Reaction for changing the breed option
async function handleBreedSelect(event) {
  // Variable to store breedID
  let breedId;

  // If change breed - store current breedId
  if (event.target) {
    breedId = event.target.value;
  } else {
    breedId = event;
  }

  try {
    // Request 5 objects (breed key, images, ids) of current breed
    const response = await api.get(
      // (`https://api.thecatapi.com/v1/images/search?limit=5&breed_ids=${breedId}&api_key=${API_KEY}`);
      "/images/search",
      { params: { limit: 5, breed_ids: breedId } }
    );

    // Store responce data (array of 5 objects (breed key, images, ids))
    const images = response.data;

    // Call clear carousel function
    clear();

    // Create carousel item for each object inside images array
    images.forEach((imgObj) => {
      const carouselItem = createCarouselItem(
        imgObj.url,
        "Cat Image",
        imgObj.id
      );
      appendCarousel(carouselItem);
    });

    // Get breed information from images breed key object
    // Use optional changing (?) to prevent the error if there no image (e.g. Malayan)
    const breedInfo = images[0]?.breeds?.[0];

    // If we're have breedInfo
    if (breedInfo) {
      // Fill infoDump element
      infoDump.innerHTML = `
        <h2>${breedInfo.name}</h2>
        <p><strong>Origin:</strong> ${breedInfo.origin}</p>
        <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
        <p><strong>Description:</strong> ${breedInfo.description}</p>
      `;
    } else {
      // If we're don't have breedInfo (e.g. Malayan)
      infoDump.innerHTML = `<p>No breed information available.</p>`;
    }

    // Call start carousel function
    start();
  } catch (error) {
    // Catch if any error
    console.error("Error fetching data:", error);
  }
}

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

// Create interceptor function to requests
api.interceptors.request.use((request) => {
  // Object request.metadata the same object or empty object (sometimes there's no request.metadata object)
  request.metadata = request.metadata || {};
  // Store startTime inside request.metadata object
  request.metadata.startTime = new Date().getTime();
  // Log start request message
  console.log(`Request begin: ${request.url}`);
  // Set progressBar as 0%
  progressBar.style.width = "0%";
  // Set cursor as in progress
  document.body.style.cursor = "progress";
  // Return request result
  return request;
});

// Create interceptor function to response
api.interceptors.response.use(
  (response) => {
    // Store endTime inside response.config.metadata object
    response.config.metadata.endTime = new Date().getTime();
    // Count difference between end and start time
    response.config.metadata.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;
    // Log the difference
    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );
    // Set progressBar as 100%
    progressBar.style.width = "100%";
    // Set cursor as default
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    // Error always has config.metadata if request had request.metadata
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `ERROR: Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    throw error;
  }
);

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

function updateProgess(event) {
  if (event.lengthComputable) {
    console.log(event);
  } else {
    console.log(event);
  }
}

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

// Declare local variable to store IDs
let favList = [];

export async function favourite(imgId) {
  try {
    // Get existing fav in favList array
    const isFavourite = favList.includes(imgId);

    // If it's in favList
    if (isFavourite) {
      // Get favourites from API
      const response = await api.get("/favourites");
      // Try to find match /fav with favList
      const favItem = response.data.find((item) => item.image_id === imgId);

      // If it's in /fav
      if (favItem) {
        // Request for deletion
        await api.delete(`/favourites/${favItem.id}`);
        // Remove id from favList
        favList = favList.filter((id) => id !== imgId);
        // Log removing
        console.log(`Removed favourite: ${imgId}`);
      }
      // Refresh carousel after delition
      clear();
      getFavourites();
      
    } else {
      // If it's new fav use post()
      const addFav = await api.post("/favourites", {
        // Body include image_id and sub_id
        image_id: imgId,
        sub_id: "test",
      });

      // Add new fav to local favList
      favList.push(imgId);
      // Log adding
      console.log("Added favourite:", addFav.data);
    }
  } catch (error) {
    console.error("Error adding or removing favourite:", error);
  }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

// Add eventListener to getFav btn
getFavouritesBtn.addEventListener("click", getFavourites);

export async function getFavourites(imgId) {
  try {
    // Request favourites
    const response = await api.get("/favourites");
    const favourites = response.data;

    // Use recieved favourites as local favourites
    favList = favourites.map((item) => item.image_id);

    // Call clear carousel function
    clear();

    // Create carousel item for each object inside favList array
    favourites.forEach((fav) => {
      const carouselItem = createCarouselItem(
        fav.image.url,
        "Cat Image",
        fav.image_id
      );
      appendCarousel(carouselItem);
    });

    // Call start carousel function
    start();

    infoDump.innerHTML = `<h2>It's your Fav's</h2>`;

  } catch (error) {
    console.error("Error fetching favourites:", error);
  }
}

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
