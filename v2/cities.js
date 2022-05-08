const CITIES = {
  // cities in bc
  // Abbotsford: {
  //   location: {
  //     lat: 49.049999,
  //     lng: -122.316666,
  //   },
  //   items: {},
  // },
  // Armstrong: {
  //   location: {
  //     lat: 50.448334,
  //     lng: -119.196114,
  //   },
  //   items: {},
  // },
  // Burnaby: {
  //   location: {
  //     lat: 49.267132,
  //     lng: -122.968941,
  //   },
  //   items: {},
  // },
  // "Campbell River": {
  //   location: {
  //     lat: 50.024445,
  //     lng: -125.247498,
  //   },
  //   items: {},
  // },
  // Castlegar: {
  //   location: {
  //     lat: 49.325558,
  //     lng: -117.666115,
  //   },
  //   items: {},
  // },
  // Chilliwack: {
  //   location: {
  //     lat: 49.15794,
  //     lng: -121.951469,
  //   },
  //   items: {},
  // },
  // Colwood: {
  //   location: {
  //     lat: 48.423611,
  //     lng: -123.495834,
  //   },
  //   items: {},
  // },
  // Coquitlam: {
  //   location: {
  //     lat: 49.283764,
  //     lng: -122.7932,
  //   },
  //   items: {},
  // },
  // Courtenay: {
  //   location: {
  //     lat: 49.687778,
  //     lng: -124.994446,
  //   },
  //   items: {},
  // },
  // Cranbrook: {
  //   location: {
  //     lat: 49.509724,
  //     lng: -115.76667,
  //   },
  //   items: {},
  // },
  // "Dawson Creek": {
  //   location: {
  //     lat: 55.760555,
  //     lng: -120.235558,
  //   },
  //   items: {},
  // },
  // Delta: {
  //   location: {
  //     lat: 49.084721,
  //     lng: -123.058609,
  //   },
  //   items: {},
  // },
  // Duncan: {
  //   location: {
  //     lat: 48.7786908,
  //     lng: -123.7079416,
  //   },
  //   items: {},
  // },
  // Enderby: {
  //   location: {
  //     lat: 50.550835,
  //     lng: -119.139725,
  //   },
  //   items: {},
  // },
  // Fernie: {
  //   location: {
  //     lat: 49.504166,
  //     lng: -115.062775,
  //   },
  //   items: {},
  // },
  // "Fort St. John": {
  //   location: {
  //     lat: 56.246464,
  //     lng: -120.847633,
  //   },
  //   items: {},
  // },
  // "Grand Forks": {
  //   location: {
  //     lat: 49.033333,
  //     lng: -118.440002,
  //   },
  //   items: {},
  // },
  // Greenwood: {
  //   location: {
  //     lat: 49.09111,
  //     lng: -118.676941,
  //   },
  //   items: {},
  // },
  // Kamloops: {
  //   location: {
  //     lat: 50.676109,
  //     lng: -120.340836,
  //   },
  //   items: {},
  // },
  // Kelowna: {
  //   location: {
  //     lat: 49.882114,
  //     lng: -119.477829,
  //   },
  //   items: {},
  // },
  // Kimberley: {
  //   location: {
  //     lat: 49.669724,
  //     lng: -115.977501,
  //   },
  //   items: {},
  // },
  // Langford: {
  //   location: {
  //     lat: 48.450558,
  //     lng: -123.505836,
  //   },
  //   items: {},
  // },
  // Langley: {
  //   location: {
  //     lat: 49.074329,
  //     lng: -122.559319,
  //   },
  //   items: {},
  // },
  // "Maple Ridge": {
  //   location: {
  //     lat: 49.216667,
  //     lng: -122.599998,
  //   },
  //   items: {},
  // },
  // Merritt: {
  //   location: {
  //     lat: 50.111308,
  //     lng: -120.786222,
  //   },
  //   items: {},
  // },
  Nanaimo: {
    location: {
      lat: 49.165882,
      lng: -123.940063,
    },
    items: {},
  },
  Nelson: {
    location: {
      lat: 49.5,
      lng: -117.283333,
    },
    items: {},
  },
  "New Westminster": {
    location: {
      lat: 49.206944,
      lng: -122.91111,
    },
    items: {},
  },
  "North Vancouver": {
    location: {
      lat: 49.316666,
      lng: -123.066666,
    },
    items: {},
  },

  Parksville: {
    location: {
      lat: 49.314999,
      lng: -124.311996,
    },
    items: {},
  },

  Penticton: {
    location: {
      lat: 49.489536,
      lng: -119.589615,
    },
    items: {},
  },
  "Pitt Meadows": {
    location: {
      lat: 49.233334,
      lng: -122.683334,
    },
    items: {},
  },
  "Port Alberni": {
    location: {
      lat: 49.233891,
      lng: -124.805,
    },
    items: {},
  },
  "Port Coquitlam": {
    location: {
      lat: 49.262501,
      lng: -122.781113,
    },
    items: {},
  },
  "Port Moody": {
    location: {
      lat: 49.283054,
      lng: -122.831665,
    },
    items: {},
  },
  "Powell River": {
    location: {
      lat: 49.830452,
      lng: -124.513893,
    },
    items: {},
  },
  "Prince George": {
    location: {
      lat: 53.916943,
      lng: -122.749443,
    },
    items: {},
  },
  Quesnel: {
    location: {
      lat: 52.978443,
      lng: -122.492668,
    },
    items: {},
  },
  Revelstoke: {
    location: {
      lat: 50.9832,
      lng: -118.2023,
    },
    items: {},
  },
  Richmond: {
    location: {
      lat: 49.166592,
      lng: -123.133568,
    },
    items: {},
  },
  Rossland: {
    location: {
      lat: 49.076809,
      lng: -117.802017,
    },
    items: {},
  },
  "Salmon Arm": {
    location: {
      lat: 50.702221,
      lng: -119.272224,
    },
    items: {},
  },
  Surrey: {
    location: {
      lat: 49.104431,
      lng: -122.801094,
    },
    items: {},
  },
  Terrace: {
    location: {
      lat: 54.515102,
      lng: -128.610764,
    },
    items: {},
  },
  Trail: {
    location: {
      lat: 49.095001,
      lng: -117.709999,
    },
    items: {},
  },
  Vancouver: {
    location: {
      lat: 49.246292,
      lng: -123.116226,
    },
    items: {},
  },
  Vernon: {
    location: {
      lat: 50.27179,
      lng: -119.276505,
    },
    items: {},
  },
  Victoria: {
    location: {
      lat: 48.407326,
      lng: -123.329773,
    },
    items: {},
  },

  "West Kelowna": {
    location: {
      lat: 49.863613,
      lng: -119.564461,
    },
    items: {},
  },
  "Williams Lake": {
    location: {
      lat: 52.128429,
      lng: -122.130203,
    },
    items: {},
  },
  "White Rock": {
    location: {
      lat: 49.019917,
      lng: -122.802612,
    },
    items: {},
  },
};

const cities2 = Object.keys(CITIES).reduce((cities, cityName) => {
  const { location } = CITIES[cityName];
  const coords = [];
  const unit = 0.01; // 0.01 deg in lng and lat is about 10km
  if (cityName === "Richmond") {
    for (let i = -2; i < 3; i++) {
      for (let j = -2; j < 3; j++) {
        coords.push({
          lat: location.lat + unit * i,
          lng: location.lng + unit * j,
        });
      }
    }
  } else {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        coords.push({
          lat: location.lat + unit * i,
          lng: location.lng + unit * j,
        });
      }
    }
  }
  cities[cityName] = coords;
  return cities;
}, {});

module.exports = cities2;
