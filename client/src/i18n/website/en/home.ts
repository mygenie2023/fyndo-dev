const home = {
  meta: {
    title: "FYNDO — Local Skilled Workers & Services in Dakshina Kannada",
    description:
      "FYNDO is a hyperlocal marketplace connecting people who need work done with skilled workers, service providers and equipment owners nearby. Post work, compare operators, connect directly. Available across all taluks of Dakshina Kannada.",
  },
  jsonLd: {
    name: "FYNDO",
  },
  hero: {
    badge: "Now across all taluks of Dakshina Kannada",
    title: "Find the right person for the work. Right around you.",
    subtitle:
      "FYNDO connects people who need work done with skilled workers, service providers and equipment owners nearby — directly, with no middlemen in between.",
    exploreHow: "Explore how FYNDO works",
    needWork: {
      title: "I need work done",
      body: "Post a requirement and find someone nearby",
    },
    offerSkills: {
      title: "I offer my skills",
      body: "Get discovered for work in your area",
    },
    visualAlt: "Mason, carpenter, electrician, tractor owner, tailor and bike mechanic at work",
    visualNote: "Illustrative interface — not live listings",
    visualAvailable: "Available nearby",
  },
  problems: {
    eyebrow: "The problem",
    title: "Finding reliable local help shouldn't depend on who you know.",
    description:
      "Local demand and local skill already exist in every town. What's missing is the connection between them.",
    items: [
      {
        title: "No central place to look",
        body: "Finding a mason, electrician, tractor or tailor still means asking neighbours, posting in WhatsApp groups, or calling around and hoping someone picks up.",
      },
      {
        title: "No easy way to compare",
        body: "There's little visibility into who is actually skilled, available, fairly priced or trustworthy before you commit to hiring them.",
      },
      {
        title: "Skilled workers stay invisible",
        body: "Carpenters, drivers and equipment owners with real skills have no reliable channel to reach the people nearby who need exactly what they offer.",
      },
    ],
    fixTitle: "FYNDO changes this.",
    fixBody:
      "One local network connecting people who need work done with the people nearby who can do it — directly, without leads being resold through a chain of contacts.",
  },
  twoSided: {
    eyebrow: "Two sides, one network",
    title: "Both sides of local work, in one place",
    description: "FYNDO is built for the person who needs the job done and the person who does it.",
    provider: {
      label: "For people who need work done",
      title: "Got a job? Find someone nearby.",
      steps: [
        "Post your requirement",
        "Add location and budget",
        "Describe the work",
        "See nearby operators",
        "Compare profiles and ratings",
        "Contact and assign",
        "Track it to completion",
        "Rate the experience",
      ],
    },
    operator: {
      label: "For skilled workers & service providers",
      title: "Have a skill? Find work nearby.",
      steps: [
        "Create your profile",
        "Add your skills and trades",
        "Set your service area",
        "Set your pricing",
        "Discover nearby work",
        "Respond to suitable requests",
        "Complete the job",
        "Build your rating",
      ],
    },
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Create → Discover → Connect → Complete",
    description: "Three simple steps, on both sides of the marketplace.",
    steps: [
      {
        n: "01",
        title: "Create account",
        body: "Sign up with your phone number as a Work Provider or an Operator. Operators add their trade, service area and pricing.",
      },
      {
        n: "02",
        title: "Post or find work",
        body: "Work Providers post a requirement with details, location and budget. Operators discover nearby opportunities that fit them.",
      },
      {
        n: "03",
        title: "Connect & complete",
        body: "The Work Provider assigns an operator, both sides connect directly, and progress is tracked until the work is marked complete.",
      },
    ],
  },
  categories: {
    eyebrow: "Categories",
    title: "Local trades, grouped so they're easy to find",
    description: "Browse by category, then narrow down to the exact trade you need.",
    exploreAll: "Explore all services",
  },
  nearby: {
    eyebrow: "Near you",
    title: "The people you need may already be nearby.",
    description:
      "FYNDO surfaces operators by trade, distance, price and rating inside your service area — so the shortlist starts local instead of starting from scratch.",
    sample: [
      { trade: "Electrician", rating: "4.8", distance: "2.4 km away", tag: "Available today" },
      { trade: "Tractor Rental", rating: "4.7", distance: "4.1 km away", tag: "Owner operated" },
      { trade: "Carpenter", rating: "4.9", distance: "1.8 km away", tag: "Available today" },
    ],
    exampleNote: "Example interface — these are not real listings.",
  },
  trust: {
    eyebrow: "Trust is the product",
    title: "Know who you're connecting with.",
    description:
      "In a hyperlocal marketplace, trust isn't a feature bolted on later — it's the reason the network works at all.",
    points: [
      {
        title: "Phone verification",
        body: "Every account, on both sides, signs up with phone verification. No anonymous accounts on the platform.",
      },
      {
        title: "Profile approval",
        body: "New operator profiles can go through an administrative review queue before they become publicly visible.",
      },
      {
        title: "Ratings & reviews",
        body: "Ratings are collected after completed work and roll up visibly on the profile, so a track record builds over time.",
      },
      {
        title: "Report & flag",
        body: "Any profile, listing or work request can be reported, and accounts can be suspended after review.",
      },
    ],
  },
  finalCta: {
    title: "Your Work. Our Network.",
    body: "Whether you need someone to get the job done, or you have the skills to do it, FYNDO helps you connect locally.",
  },
} as const;

export default home;
