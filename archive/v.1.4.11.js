$(document).ready(function () {
    const getData = (options) => {
      axios
        .request(options)
        .then(function (response) {
          //console.log("Then checkpoint");
          //console.log(response.data);
  
          filterController(response.data);
        })
        .catch(function (error) {
          //console.error(error);
        });
    };
  
    const priceController = (parsedProperties) => {
  
  
  
      parsedProperties.forEach((element, index) => {
        //console.log(' element.id: ',  element.id)
        $(".item").each((i, el) => {
          if ($(el).find(".item_guesty-id").text() === element.id) {
            //console.log(' same id')
            let totalPrice = 0;
            element.datePrice.forEach((intraEl, i2) => {
              if (i2 + 1 < element.datePrice.length) {
                totalPrice += intraEl.price;
              }
  
            });
            //console.log('id: ', element.id);
            //console.log('total price: ',totalPrice );
            let inputotal = totalPrice / (element.datePrice.length - 1)
            inputotal = inputotal + inputotal * 0.154;
            $(el)
              .find(".per-night")
              .text(Math.round(inputotal));
            let procFee = Number($(el).find('.item_processing-fee').text());
            let cleanFee = Number($(el).find('.item_cleaning-fee').text());
  
            $(el)
              .find('#totalPrice')
              .text(Math.ceil(totalPrice + totalPrice * 0.154 + totalPrice * procFee * 0.01 + cleanFee));
          }
        });
      });
    };
  
    const priceParser = (availableDates, propertiesData) => {
      //console.log("available dates: ", availableDates);
      //console.log("properties data: ", propertiesData);
      let parsedProperties = [];
      let datePrice = [];
      availableDates.forEach((element, index) => {
        propertiesData.forEach((el, i) => {
          if (element === el.listingId) {
            //we are in the same id on propertiesData
            datePrice.push({
              date: el.date,
              price: el.price,
            });
          }
        });
  
        parsedProperties.push({
          id: element,
          datePrice: datePrice,
        });
        datePrice = [];
        //console.log("nº: ", index);
        //console.log("property added: ", parsedProperties[index]);
      });
      priceController(parsedProperties);
    };
  
    const queryBuilder = (formData) => {
      let queryData = "";
      let guestyIds = "";
      let dates = {};
  
      //placeholder
      date = { startDate: formData.checkIn, endDate: formData.checkOut };
  
      $(".locations-cms_item").each((index, element) => {
        let guestyId = $(element).find(".location-field_guesty").text();
        if (index === 0) guestyIds += guestyId;
        else guestyIds += "," + guestyId;
      });
      let guests = $("#guests").text();
      //console.log("guestyIds: ", guestyIds);
      queryData =
        `?guestsAmount=${guests}&startDate=${date.startDate}&endDate=${date.endDate}&limit=100`;
      console.log('query data: ', queryData)
      const options = {
        method: "GET",
        url: `https://host-made-server.herokuapp.com/frenchcowboys/availabilities${queryData}`,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
  
      return options;
    };
  
    const filterController = (data) => {
      if (!$(".no-items_block").hasClass("hidden"))
        $(".no-items_block").addClass("hidden");

      let availableProperties = data.availability;
      let showProperties = [];
      

      console.log('receive data:', data)

      // guests from the Calendar
      let guests = $("#guests").text();

      // match the availables, and hide the rest (reverse logic)
      $(".item").each((index, element) => {
        let currentId = $(element).find(".item_guesty-id").text();
        //console.log('currentId', currentId)

        const matchedProperties = availableProperties.find( (item) => item.listingId === currentId )
        if (!matchedProperties){
          if (!$(element).hasClass("hidden")) {
            $(element).addClass("hidden");
            $(".listings_wrapper").removeClass("loading");
            $(".loading-gif").addClass("hidden");
          }
        }
        /* 
        if (availableProperties.includes(currentId)) {
          if (!$(element).hasClass("hidden")) {
            $(element).addClass("hidden");
            $(".listings_wrapper").removeClass("loading");
            $(".loading-gif").addClass("hidden");
          }
        } else {
          showProperties.push(currentId);
        } */
  
        /* // second filter parameter -> numGuests should retrieve this information from the server, so its real time
        let numGuests = Number($(element).find(".item_guests").text());
        //console.log('guests: ', guests);
        //console.log('numGuests: ', numGuests);
        if (guests > numGuests) {
          if (!$(element).hasClass("hidden")) {
            $(element).addClass("hidden");
            $(".listings_wrapper").removeClass("loading");
            if (!$(".loading-gif").hasClass("hidden"))
              $(".loading-gif").addClass("hidden");
            //console.log("Listing removed: Too many guests.");
          }
        } */
      });
  
      /* priceParser(availableDates, data.availability);
      if ($(".item.hidden").length === $(".item").length)
        $(".no-items_block").removeClass("hidden");
      geoData = [];
      console.log("map update");
      //renderMap();
      localStorage.setItem("filter", "ready"); */
    };
  
    const filterSystem = (formData) => {
      
      let options = queryBuilder(formData);
      //console.log("options: ", options);
      getData(options);
    };
  
    //START MAP RENDER SCRIPT
  
    const locationsData = $(".locations-cms_item");
    let geoData = [];
    const locationsObject = {};
  
    const loadData = () => {
      $(".locations-cms_item").each((index, element) => {
        if ($(`.item:eq(${index})`).hasClass("hidden")) {
          //console.log("property unavailable");
        } else {
  
          // feeding slider images
          let cardTotalPrice;
          let cardPerNight;
          let slidePropertyName = $(`.slide-house_guesty:contains("${$(element).find(".location-field_guesty").text()}")`);
          let slideImages = slidePropertyName.siblings('img')
          let slideImagesArray = [];
          slideImages.each((index, element) => {
            slideImagesArray.push($(element).attr('src'))
          })
          cardTotalPrice = $('.item').eq(index).find('#totalPrice').text();
          cardPerNight = $('.item').eq(index).find('.per-night').text();
          //console.log(`per night: ${cardPerNight} | total cost: ${cardTotalPrice}`);
  
          geoData.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                Number($(element).find(".location-field_lang").text()),
                Number($(element).find(".location-field_lat").text()),
              ],
            },
            properties: {
              type: "fnac",
              guesty: $(element).find(".location-field_guesty").text(),
              title: $(element).find(".location-field_name").text(),
              //address: $(element).find(".location-field_address").text(),
              imgURL: $(element).find(".location-field_img").attr("src"),
              link: $(element).find(".location-field_link").attr("href"),
              slides: slideImagesArray,
              cardTotalPrice,
              cardPerNight
            },
          });
        }
      });
      return geoData;
    };
  
    //Current context:
    // - If card is closed and another opened, it works
    // - If another card is opened while the first one is still opened, it doesn't work -> create logic for that
  
  
  
    let sliderController = (cardData) => {
  
      $('.map-card').appendTo('#card-span');
      $('body').off('click.bodyClicked');
      let mapCard = $('#active-map-card');
      let dotList = mapCard.find('.w-slider-dot');
      let dotsLength = dotList.length;
      let previousActive = 0;
      let dotOnMiddle = false;
  
      //reset slider position
      if ($('.map-slider_arrow.right').hasClass('hidden')) $('.map-slider_arrow.right').removeClass('hidden');
      if (!($('.map-slider_arrow.left').hasClass('hidden'))) $('.map-slider_arrow.left').addClass('hidden');
      $('.map-card').find('.w-slider-dot').eq(0).trigger('click');
  
  
      let ar = cardData.slideImagesArray
      // feeding slider with new content
      $('.map-card').find('.map-card_heading').text(cardData.listingName);
      $('.map-slide_img').each((index, element) => {
        $(element).attr('src', cardData.slideImagesArray[index]);
        $(element).attr('srcset', cardData.slideImagesArray[index])
      })
      $('.map-card_link').attr('href', cardData.cardLink)
      $('#cardPerNight').text(cardData.cardPerNight);
      $('#cardTotalPrice').text(cardData.cardTotalPrice);
  
  
  
  
  
      dotList.each((index, element) => {
        if ($(element).hasClass('w-active')) {
          previousActive = index;
          //console.log(`previous active is slide ${index}`)
        }
        if (index > 4) $(element).addClass('hidden');
      })
      $('.map-slider_arrow').on('click', (e) => {
        let clickedButton = $(e.target);
        if (clickedButton.is('.map-slider_arrow-icon')) clickedButton = clickedButton.parent();
  
        dotList.each((index, element) => {
          if ($(element).hasClass('w-active')) {
            let currentActive = index;
            //console.log(`slide ${index} active`)
            if (clickedButton.hasClass('left')) {
              //show right arrow again
              if ($('.map-slider_arrow.right').hasClass('hidden')) $('.map-slider_arrow.right').removeClass('hidden');
  
              if ($(element).hasClass('hidden')) $(element).removeClass('hidden');
              if (index === 0) {
                clickedButton.addClass('hidden');
              }
            } else if (clickedButton.hasClass('right')) {
              if ($(element).hasClass('hidden')) $(element).removeClass('hidden');
              if ($('.map-slider_arrow.left').hasClass('hidden')) $('.map-slider_arrow.left').removeClass('hidden');
              if (index === dotList.length - 1) clickedButton.addClass('hidden');
  
            }
          }
        })
  
      })
  
  
      if (!($('.map-card').parent().is('.map-card_wrapper'))) {
        setTimeout(() => {
          $('body').on('click.bodyClicked', (e) => {
            let clickedButton = $(e.target);
            if (!(clickedButton.is('.map-card *'))) {
              mapCard.appendTo('.map-card_wrapper');
              //console.log('body listener activated and card transfered')
              //console.log('-------------')
            }
          })
        }, 10);
  
      }
    }
  
  
    const renderMap = () => {
      mapboxgl.accessToken =
        "pk.eyJ1IjoidXJiYW5zdGF5YXBpIiwiYSI6ImNsNmd3a3ZmdzAyYTAzY3ByaDUzaXNwNXEifQ.-ffaDzlRzlzCymEFe4f3OA";
      let map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/urbanstayapi/clh3p66of019c01p8dltob4j5",
        center: [-97.6938589, 30.2776495],
        zoom: 12,
      });
  
      let stores = {
        features: loadData(),
        type: "FeatureCollection",
      };
  
      stores.features.forEach(function (store, i) {
        store.properties.id = i;
      });
  
      function flyToStore(currentFeature) {
        map.flyTo({
          center: currentFeature.geometry.coordinates,
          //zoom: 12,
          //maxZoom: 12
        });
      }
  
      function createPopUp(currentFeature) {
  
        // Second click Handler
        if (!($('.map-card').parent().is('.map-card_wrapper'))) {
          mapCard.appendTo('.map-card_wrapper');
        }
  
  
        //INIT POP UP
        const popUps = document.getElementsByClassName("mapboxgl-popup");
        if (popUps[0]) popUps[0].remove();
        const popup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat(currentFeature.geometry.coordinates)
          .setHTML(
            `
                <span id="card-span" class="card-span"></span>
                `
          )
          .addTo(map);
  
  
  
        //NEW SLIDER CARD STARTS HERE
        let cardData = {}
        let listingName = currentFeature.properties.title;
        let slideImagesArray = currentFeature.properties.slides;
        let cardTotalPrice = currentFeature.properties.cardTotalPrice;
        let cardPerNight = currentFeature.properties.cardPerNight;
        let cardLink = currentFeature.properties.link;
        //slideImagesArray = JSON.parse(slideImagesArray)
        cardData = {
          listingName,
          slideImagesArray,
          cardTotalPrice,
          cardPerNight,
          cardLink
        }
  
  
        sliderController(cardData)
        //console.log(cardData)
  
        //Delete old tips
        const checkTipRemoval = () => {
          if (!($('.card-span').find('.map-card').length)  ) {
            let popUps = document.getElementsByClassName("mapboxgl-popup");
            if (popUps[0]) popUps[0].remove();
            //console.log('map card length', $('.card-span').find('.map-card').length)
          }
          clearInterval(refreshIntervalId)
        }
        // as soon as map-card no longer exists, remove it
        let refreshIntervalId = setInterval(checkTipRemoval, 5);
  
  
        //Load slider only after zoom finishes
        const loadSlide = () => {
  
          map.off('idle', loadSlide);
        }
        map.on('idle', loadSlide);
      }
  
      function buildLocationList(stores) {
        for (let [i, store] of stores.features.entries()) {
          let listings = $("#listings");
          let listing = listings.find(".item");
          if (!listing.hasClass("hidden")) {
            listing[i].id = `listing-${store.properties.id}`;
            currentListing = listing[i];
            $(".title").each((index, element) => {
              element.id = `link-${index}`;
            });
            $(listing[i]).on("click",  (e) => {
              let clickedButton = $(e.target);
              if(!clickedButton.is('.item')){
                if(clickedButton.parent().is('.item')) clickedButton = clickedButton.parent();
                else if(clickedButton.parent().parent().is('.item')) clickedButton = clickedButton.parent().parent();
                else if(clickedButton.parent().parent().parent().is('.item')) clickedButton = clickedButton.parent().parent().parent();
                else if(clickedButton.parent().parent().parent().parent().is('.item')) clickedButton = clickedButton.parent().parent().parent().parent();
                else if(clickedButton.parent().parent().parent().parent().parent().is('.item')) clickedButton = clickedButton.parent().parent().parent().parent().parent();
                else console.log('different event', clickedButton)
              }
              console.log(clickedButton)
  
              
  
              for (let feature of stores.features) {
                //console.log('---------------------------------')
                //console.log('clickedButton.id', clickedButton.id);
                //console.log('feature.properties.id', feature.properties.id);
                //console.log('---------------------------------')
                if (clickedButton.attr('id') === `listing-${feature.properties.id}`) {
                  flyToStore(feature);
                  createPopUp(feature);
                }
              }
              let activeItem = document.getElementsByClassName("active");
              if (activeItem[0]) {
                activeItem[0].classList.remove("active");
              }
              clickedButton.addClass("active");
            });
          }
        }
      }
  
      function duplicateCoordinateController(
        currentFeature,
        featuresObject,
        zoom,
        isFinalCluster
      ) {
        /* 
          .cluster_map-card_wrapper
          
          .map_cluster-card
          .cluster_item
          .cluster_map-card_link
          .cluster_text-wrapper
          .map-card_link
          .cluster-item_heading
          .cluster_card-total_text
          .cluster_card-per-night
          .cluster_card-total_cost
        */
  
  
        let oldCoord = [];
        let newCoord = [];
        let differentCoordCounts = 0;
        featuresObject.forEach((element, index) => {
          newCoord = element.geometry.coordinates;
          if (index === 0) {
            oldCoord = newCoord;
            return;
          }
          if (newCoord[0] === oldCoord[0] && newCoord[1] === oldCoord[1]) {
          } else {
            differentCoordCounts++;
          }
          oldCoord = newCoord;
        });
        if ((differentCoordCounts === 0) | isFinalCluster) {
          const popUps = document.getElementsByClassName("mapboxgl-popup");
  
          if (popUps[0]) popUps[0].remove();
          
  
          const popup = new mapboxgl.Popup()
            .setLngLat(newCoord)
            .setHTML(
              ` <span id="cluster_card-span" class="cluster_card-span" ></span>  `
            )
            .addTo(map);
  
            if ($('.cluster_map-card_wrapper').find('.cluster_item').length) {
              console.log('cluster card')
              $('.cluster_card-span').parent().css('box-shadow', '0 0 0 rgb(0 0 0 / 0%)')
              featuresObject.forEach((element, index) => { 
                $('.cluster_map-card_wrapper').find('.cluster_item').clone().appendTo('.cluster_card-span')
                $('.cluster_item').eq(index).find('.cluster-item_heading').text(element.properties.title)
                $('.cluster_item').eq(index).find('.cluster-item_heading').parent().attr('href', element.properties.link)
                $('.cluster_item').eq(index).find('.cluster_item-img').attr('srcset', element.properties.imgURL)
                console.log('index: ',index,'cardPerNight', element.properties.cardPerNight);
                console.log('index: ',index,'cardTotalPrice', element.properties.cardTotalPrice);
                $('.cluster_item').eq(index).find('#clusterCardPerNight').text(element.properties.cardPerNight)
                $('.cluster_item').eq(index).find('#clusterCardTotalPrice').text(element.properties.cardTotalPrice)
              });
            }
  
          
        } else {
          console.log("map zoom level: ", map.getZoom());
        }
      }
  
      map.on("load", function () {
        map.addSource("locations", {
          type: "geojson",
          data: stores,
          cluster: true,
          clusterMaxZoom: 18,
          clusterRadius: 80,
        });
  
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "locations",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#e3dfde",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              22,
              100,
              30,
              750,
              40,
            ],
          },
        });
  
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "locations",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 18,
          },
        });
        //https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/62f81aef38a728ec53bd4b2b_House%20Icon%2050.png
        //https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/637b97db26e11c513c2c6888_invisible-icon.png
        map.loadImage(
          "https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/637b97db26e11c513c2c6888_invisible-icon.png",
          function (error, image) {
            if (error) throw error;
            map.addImage("darty", image);
          }
        );
  
        map.loadImage(
          "https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/637b97db26e11c513c2c6888_invisible-icon.png",
          function (error, image) {
            if (error) throw error;
            map.addImage("fnac", image);
          }
        );
  
        map.addLayer({
          id: "unclustered-point",
          type: "symbol",
          source: "locations",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": "{type}",
          },
        });
  
        /* ----------- CUSTOM MARKER SYSTEM ---------- */
        const markerController = () => {
          //console.log('animation has ended and we can now toggle markers')
  
          let markerFilter = [];
  
          $('.marker-guesty').each((index, element) => {
            if (!($(element).parent().hasClass('hidden'))) $(element).parent().addClass('hidden');
          })
          for (const cluster of map.queryRenderedFeatures({ layers: ['unclustered-point'] })) {
            let guestyId = cluster.properties.guesty;
            $('.marker-guesty').each((index, element) => {
              if ($(element).text() === guestyId) {
                markerFilter.push(guestyId)
              }
            })
          }
          markerFilter.forEach((element, index) => {
            if ($(`.marker-guesty:contains("${element}")`).parent().hasClass('hidden')) $(`.marker-guesty:contains("${element}")`).parent().removeClass('hidden')
          })
  
          // render event runs this funciton on start, and now we can dettach it
          map.off('render', markerController)
  
  
        }
  
        map.on('idle', markerController)
        map.on('render', markerController);
  
        /* ----------- CUSTOM MARKER SYSTEM  END ---------- */
  
  
        map.on("click", "clusters", function (e) {
          var features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
  
          var clusterId = features[0].properties.cluster_id;
          map
            .getSource("locations")
            .getClusterExpansionZoom(clusterId, function (err, zoom) {
              let isFinalCluster = false;
              if (err) return;
              if (zoom > 17) {
                zoom = 17;
                isFinalCluster = true;
              }
              point_count = features[0].properties.point_count;
              clusterSource = map.getSource("locations");
              clusterSource.getClusterLeaves(
                clusterId,
                point_count,
                0,
                function (err, aFeatures) {
                  duplicateCoordinateController(
                    features,
                    aFeatures,
                    zoom,
                    isFinalCluster
                  );
                }
              );
  
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        })
  
  
        let unclusterClickHandler = (e) => {
          //console.log('second click')
  
          //remove card tip
          //$('.mapboxgl-popup-tip').remove()
  
          if ($('#card-span').find('.map-card').length) {
            //console.log('clicking a second cluster')
            let storedElementIndex;
            $('.card-span').each((index, element) => {
              if ($(element).find('.card-map')) storedElementIndex = index;
            });
            $('.map-card').appendTo('.map-card_wrapper');
  
            $('.card-span').each((index, element) => {
              if (index !== storedElementIndex) {
                $(element).parent().parent().remove();
              }
  
            });
  
            $('.map-card').appendTo('#card-span')
  
          }
          map.off("click", "unclustered-point", unclusterClickHandler);
          // map.off("click", mapClickHandler);
        }
  
        let mapClickHandler = (e) => {
          //console.log('random map click')
          map.off("click", mapClickHandler);
  
          //map.off("click", "unclustered-point", unclusterClickHandler);
        }
  
        map.on("click", "unclustered-point", function (e) {
          //$('.mapboxgl-popup-tip').remove();
          const popUps = document.getElementsByClassName("mapboxgl-popup");
          const popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(
              `
                <span id="card-span" class="card-span"></span>
                `
            )
            .addTo(map);
  
          // APPENDING SLIDER TO MAP AND  RESETING CARD
          map.on("click", "unclustered-point", unclusterClickHandler);
          map.on("click", mapClickHandler);
  
          let cardData = {}
          let listingName = e.features[0].properties.title;
          let slideImagesArray = e.features[0].properties.slides;
          let cardTotalPrice = e.features[0].properties.cardTotalPrice;
          let cardPerNight = e.features[0].properties.cardPerNight;
          let cardLink = e.features[0].properties.link;
          slideImagesArray = JSON.parse(slideImagesArray)
          cardData = {
            listingName,
            slideImagesArray,
            cardTotalPrice,
            cardPerNight,
            cardLink
          }
  
          sliderController(cardData);
  
  
        });
  
  
  
        // ------------- REFRESH MAP --------------- //
  
        const filterInit = () => {
          let popUps = document.getElementsByClassName("mapboxgl-popup");
          if (popUps[0]) popUps[0].remove();
  
          const checkAndRefreshMap = () => {
            if (localStorage.getItem("filter") === "ready") {
              stores = {
                features: loadData(),
                type: "FeatureCollection",
              };
  
  
              map.getSource("locations").setData(stores);
            } else {
              setTimeout(() => {
                checkAndRefreshMap();
              }, 500);
            }
          };
  
          checkAndRefreshMap();
        }
        filterInit();
  
        $(".submit-button").on("click", () => {
          let popUps = document.getElementsByClassName("mapboxgl-popup");
          if (popUps[0]) popUps[0].remove();
  
          const checkAndRefreshMap = () => {
            if (localStorage.getItem("filter") === "ready") {
              stores = {
                features: loadData(),
                type: "FeatureCollection",
              };
  
  
              map.getSource("locations").setData(stores);
            } else {
              setTimeout(() => {
                checkAndRefreshMap();
              }, 500);
            }
          };
  
          checkAndRefreshMap();
        });
  
        map.on("mouseenter", "clusters", function () {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", function () {
          map.getCanvas().style.cursor = "";
        });
  
        map.on("style.load", function () {
          map.on("click", mouseClick);
        });
  
        $('.mapboxgl-canvas').on('click', (e) => {
          // if there are no cards, delete the entire pop up
  
  
          const checkTipRemoval = () => {
            if (!($('.card-span').find('.map-card').length)  && !($('#cluster_card-span').length ) ) {
              let popUps = document.getElementsByClassName("mapboxgl-popup");
              if (popUps[0]) popUps[0].remove();
              //console.log('map card length', $('.card-span').find('.map-card').length)
            }
            clearInterval(refreshIntervalId)
          }
          // as soon as map-card no longer exists, remove it
          let refreshIntervalId = setInterval(checkTipRemoval, 5);
  
        })
  
  
  
  
        /**/ // add html markers to map
        for (const feature of stores.features) {
          // create a HTML element for each feature
          const el = document.createElement('div');
          //<div class="card-marker" >   <div class="card-marker_text" >$</div>  <div class="card-marker_text" id="markerPerNight" >1350</div>  </div>
          el.className = 'card-marker';
          el.innerHTML = `<div class="card-marker_text" >$</div>  <div class="card-marker_text" id="markerPerNight" >${feature.properties.cardPerNight}</div> <div class="marker-guesty">${feature.properties.guesty}</div> `
  
          // make a marker for each feature and add to the map
          new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
        }
  
        buildLocationList(stores);
      });
    };
  
    //initialize
    localStorage.setItem("filter", "");
    renderMap();
  
  
  
    // CLICK BUTTON LISTENER
    $(".submit-button").on("click", () => {
      localStorage.setItem("filter", "");
      $(".item").removeClass("hidden");
      $(".listings_wrapper").addClass("loading");
      $(".loading-gif").removeClass("hidden");
  
      let checkIn = $("#check-in").text();
      let checkOut = $("#checkout").text();
  
      filterSystem({ checkIn, checkOut });
    });
  });