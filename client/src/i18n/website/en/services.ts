const services = {
  index: {
    meta: {
      title: "Local Services on FYNDO — Every Trade, by Category",
      description:
        "Browse local services on FYNDO: home & construction, repair, rental, agriculture, labour, emergency, health & beauty and more. Find skilled operators near you. Available across all taluks of Dakshina Kannada.",
    },
    hero: {
      title: "Local services and trades on FYNDO",
      subtitle:
        "Trades are grouped into broad categories so browsing stays simple. Categories and trades are adjusted per region to match what's actually in demand locally.",
    },
    guides: {
      eyebrow: "Service guides",
      title: "Popular trades people search for",
      description: "Detailed pages for the trades where we have genuinely useful guidance to share.",
      readMore: "Read more →",
    },
  },
  service: {
    notFound: {
      title: "We don't have a page for that service yet",
      body: "Browse all categories to find the trade you're looking for.",
      cta: "Explore all services →",
      metaTitle: "Service not found — FYNDO",
    },
    hero: {
      findNear: "Find a {name} near you",
    },
    covers: {
      title: "What a {name} covers",
    },
    when: {
      title: "When people usually look",
    },
    onFyndo: {
      eyebrow: "On FYNDO",
      title: "How to find a {name} through FYNDO",
      description:
        "Post what needs doing with your location and budget. Nearby {name}s can see the request and respond. You compare profiles, ratings, distance and price, then assign the one that fits — and rate them once the work is done.",
    },
    other: {
      title: "Other services",
    },
    metaTitle: "{name} Near You — Find Local {name}s on FYNDO",
  },
  categories: {
    "home-and-construction": {
      name: "Home & Construction",
      blurb: "Building, fixing and finishing work around homes, shops and sites.",
      trades: {
        Masonry: "Masonry",
        Carpenter: "Carpenter",
        Electrician: "Electrician",
        Painter: "Painter",
        Welder: "Welder",
        Centring: "Centring",
      },
    },
    repair: {
      name: "Repair",
      blurb: "Vehicles, appliances and devices repaired by people close by.",
      trades: {
        "Bike/Car Mechanic": "Bike/Car Mechanic",
        "Mobile Repair": "Mobile Repair",
        "AC Repair": "AC Repair",
        Puncture: "Puncture",
      },
    },
    rental: {
      name: "Rental",
      blurb: "Vehicles and equipment available from owners in your area.",
      trades: {
        Tractor: "Tractor",
        Auto: "Auto",
        Car: "Car",
        "Tata Ace": "Tata Ace",
        "Tent House on Rent": "Tent House on Rent",
      },
    },
    agriculture: {
      name: "Agriculture",
      blurb: "Seasonal farm work, machinery and field services.",
      trades: {
        Harvesters: "Harvesters",
        "Crop Spraying": "Crop Spraying",
        "Farm Labour": "Farm Labour",
        "Agri Services": "Agri Services",
      },
    },
    "people-and-labour": {
      name: "People / Labour",
      blurb: "Hands for the work — by the day, by the job or by the crew.",
      trades: {
        "Construction Labour": "Construction Labour",
        Drivers: "Drivers",
        "Daily Wage Work": "Daily Wage Work",
      },
    },
    emergency: {
      name: "Emergency",
      blurb: "Urgent local services that need a fast response.",
      trades: {
        "Urgent local services": "Urgent local services",
      },
    },
    "health-and-beauty": {
      name: "Health & Beauty",
      blurb: "Personal care and home health services nearby.",
      trades: {
        Salon: "Salon",
        "Home Health Services": "Home Health Services",
      },
    },
    "services-and-others": {
      name: "Services & Others",
      blurb: "Everything else local that people need done.",
      trades: {
        Tailor: "Tailor",
        "Grass Cutting": "Grass Cutting",
        "Other local services": "Other local services",
      },
    },
  },
  items: {
    electrician: {
      name: "Electrician",
      summary:
        "Find an electrician near you on FYNDO — post what needs fixing, compare nearby operators by rating and price, and assign directly.",
      covers: [
        "New wiring for homes, shops and sheds",
        "Switchboards, MCB and fuse problems",
        "Fan, light and appliance point installation",
        "Motor and pump connection work",
        "Fault finding on existing wiring",
      ],
      whenYouNeed: [
        "A tripping circuit that keeps cutting power",
        "A new room or floor that needs wiring",
        "Repeated bulb or switch failures",
        "Shifting to a new house and needing points installed",
      ],
    },
    carpenter: {
      name: "Carpenter",
      summary:
        "Find a carpenter near you on FYNDO. Describe the woodwork, see nearby carpenters with ratings, and connect directly — no middlemen.",
      covers: [
        "Doors, windows and frames",
        "Cupboards, shelves and storage",
        "Furniture repair and polishing",
        "Kitchen and wardrobe fitting",
        "On-site measurement and finishing",
      ],
      whenYouNeed: [
        "A door or window that no longer closes properly",
        "Built-in storage for a new home",
        "Old furniture worth repairing instead of replacing",
        "Fittings for a shop or office space",
      ],
    },
    mason: {
      name: "Mason",
      summary:
        "Find a mason near you on FYNDO for brickwork, plastering and repair work. Post the job with your budget and pick from nearby operators.",
      covers: [
        "Brick and block work",
        "Plastering and finishing",
        "Compound walls and steps",
        "Leak and crack repair",
        "Small extensions and additions",
      ],
      whenYouNeed: [
        "A wall, room or compound to be built",
        "Plaster falling off or cracking",
        "Water seeping through a wall or terrace",
        "Site work needing a skilled hand for a few days",
      ],
    },
    painter: {
      name: "Painter",
      summary:
        "Find a painter near you on FYNDO. Share the area, surface and budget, then compare nearby painters before you assign the work.",
      covers: [
        "Interior and exterior painting",
        "Putty, primer and surface preparation",
        "Repainting after repair work",
        "Shop boards and gates",
        "Texture and finish work",
      ],
      whenYouNeed: [
        "Moving into a new or repaired house",
        "Faded or peeling exterior walls",
        "A festival or event deadline",
        "Rented property being handed back",
      ],
    },
    "tractor-rental": {
      name: "Tractor Rental",
      summary:
        "Find tractor rental near you on FYNDO. Post your land, dates and work type, and connect directly with tractor owners in your area.",
      covers: [
        "Ploughing, tilling and levelling",
        "Trolley and transport work",
        "Rotavator and implement work",
        "Seasonal field preparation",
        "Short-duration hire by hour or acre",
      ],
      whenYouNeed: [
        "Field preparation before sowing",
        "Moving material to or from a site",
        "A short window between rains",
        "Peak season when local owners are booked out",
      ],
    },
    "bike-mechanic": {
      name: "Bike Mechanic",
      summary:
        "Find a bike mechanic near you on FYNDO. Describe the problem, see nearby mechanics with ratings and distance, and contact them directly.",
      covers: [
        "General service and oil change",
        "Chain, brake and clutch work",
        "Electrical and battery issues",
        "Puncture and tyre replacement",
        "Breakdown assistance where offered",
      ],
      whenYouNeed: [
        "A bike that won't start in the morning",
        "Service overdue by several months",
        "Brakes or clutch feeling unsafe",
        "A puncture far from your usual shop",
      ],
    },
    "ac-repair": {
      name: "AC Repair",
      summary:
        "Find AC repair near you on FYNDO. Post the unit type and fault, compare nearby technicians, and assign the one that fits your budget.",
      covers: [
        "Servicing and gas refilling",
        "Cooling and noise complaints",
        "Installation and relocation",
        "Drainage and leakage issues",
        "Split and window unit work",
      ],
      whenYouNeed: [
        "Cooling dropping just before summer",
        "Water dripping indoors from the unit",
        "Shifting an AC to another room or house",
        "Annual servicing before heavy use",
      ],
    },
    "farm-labour": {
      name: "Farm Labour",
      summary:
        "Find farm labour near you on FYNDO. Post the work, dates and daily rate, and connect with people available in your area.",
      covers: [
        "Sowing, weeding and harvesting help",
        "Crop loading and shifting",
        "Seasonal crew requirements",
        "Daily wage arrangements",
        "Support work alongside machinery",
      ],
      whenYouNeed: [
        "Harvest week with more work than hands",
        "A crop that must be cleared quickly",
        "Regular seasonal help for a few days",
        "Extra people alongside a harvester",
      ],
    },
    driver: {
      name: "Driver",
      summary:
        "Find a driver near you on FYNDO. Post the vehicle type, duration and route, and connect with drivers available nearby.",
      covers: [
        "Car and commercial vehicle driving",
        "Day trips and outstation runs",
        "Goods vehicle driving",
        "Temporary or replacement drivers",
        "Event and function duty",
      ],
      whenYouNeed: [
        "A long drive you'd rather not do yourself",
        "Your regular driver unavailable",
        "A family function needing extra vehicles",
        "A goods vehicle without a driver",
      ],
    },
    tailor: {
      name: "Tailor",
      summary:
        "Find a tailor near you on FYNDO. Share what needs stitching or altering and connect directly with tailors working in your area.",
      covers: [
        "Stitching from your own material",
        "Alterations and resizing",
        "Repairs on existing clothes",
        "Festival and function orders",
        "Uniform and bulk stitching",
      ],
      whenYouNeed: [
        "A function with a fixed date",
        "Clothes that no longer fit properly",
        "Bulk stitching for a school or shop",
        "A trusted tailor after moving to a new area",
      ],
    },
  },
} as const;

export default services;
