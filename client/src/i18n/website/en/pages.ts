const pages = {
  howItWorks: {
    meta: {
      title: "How FYNDO Works — Post Work, Find Operators, Get It Done",
      description:
        "See how FYNDO works for both sides: Work Providers post a requirement with location and budget, Operators discover nearby work, and both connect directly until the job is complete.",
    },
    breadcrumb: { home: "Home", current: "How FYNDO Works" },
    jsonLd: { howToName: "How FYNDO works" },
    hero: {
      title: "How FYNDO works, on both sides of the job",
      body: "FYNDO is a two-sided local marketplace. One side posts work. The other side does it. Everything in between is designed to be as short as possible.",
    },
    flow: {
      eyebrow: "Step by step",
      title: "The full flow, end to end",
      description: "Every step below is a real screen in the FYNDO app.",
      workProvider: {
        title: "Work Provider",
        steps: [
          "Sign up and verify your phone number",
          "Post the work with details, budget and location",
          "View matched operators nearby",
          "Contact and assign an operator",
          "Track status, mark complete and rate",
        ],
      },
      operator: {
        title: "Operator",
        steps: [
          "Sign up and verify your phone number",
          "Build a profile with skills, area and rate",
          "Browse or get notified of nearby work",
          "Respond and confirm directly",
          "Complete the job and receive a rating",
        ],
      },
    },
  },
  forWorkProviders: {
    meta: {
      title: "For Work Providers — Post a Job and Find Someone Nearby | FYNDO",
      description:
        "Need work done? Post your requirement with location and budget on FYNDO, compare nearby operators by rating and price, assign directly and track the job to completion.",
    },
    breadcrumb: { home: "Home", current: "For Work Providers" },
    hero: {
      title: "Got a job? Find someone nearby.",
      body: "Post what needs doing, see the skilled people around you, and assign the one that fits your budget and timing — without working your way through a chain of contacts.",
    },
    benefits: {
      eyebrow: "Why FYNDO",
      title: "Less asking around. More getting it done.",
      items: [
        {
          title: "Describe the job once",
          body: "Category, description, photos, location and budget — posted once instead of explained over a dozen phone calls.",
        },
        {
          title: "See who's actually nearby",
          body: "Operators are surfaced by trade and service area, so you start with people who can realistically reach you.",
        },
        {
          title: "Compare before you commit",
          body: "Ratings, price range and distance sit side by side on every profile, so the choice isn't guesswork.",
        },
        {
          title: "Assign and track",
          body: "Assign an operator, connect directly, follow the status from posted to complete, then leave a rating.",
        },
      ],
    },
  },
  forOperators: {
    meta: {
      title: "For Operators — Find Work Near You | FYNDO",
      description:
        "Have a skill, a service or equipment? Build a FYNDO profile with your trades, service area and pricing, see nearby work requests, and respond only to the jobs that fit.",
    },
    breadcrumb: { home: "Home", current: "For Operators" },
    hero: {
      title: "Have a skill? Find work nearby.",
      body: "Masons, carpenters, electricians, mechanics, drivers, tailors, farm hands and equipment owners — FYNDO puts your skills in front of the people around you who need them.",
    },
    benefits: {
      eyebrow: "Why FYNDO",
      title: "Your skills, visible where the work is.",
      items: [
        {
          title: "Be findable in your own area",
          body: "Your trade, service area and pricing sit on a profile that nearby people can actually search and browse.",
        },
        {
          title: "Work that comes to you",
          body: "A feed of nearby open requests, plus notifications when something matching your trade is posted close by.",
        },
        {
          title: "Only the jobs that fit",
          body: "You see the details, location and budget before responding — so you spend time on work worth travelling for.",
        },
        {
          title: "A rating that follows you",
          body: "Ratings collected after completed jobs roll up on your profile and build a track record over time.",
        },
      ],
    },
  },
  trust: {
    meta: {
      title: "Trust & Safety on FYNDO — Verification, Ratings and Reporting",
      description:
        "How FYNDO builds trust: phone verification on every account, administrative review of operator profiles, ratings after completed work, and reporting tools for listings and users.",
    },
    breadcrumb: { home: "Home", current: "Trust & Safety" },
    hero: {
      title: "Know who you're connecting with.",
      body: "An informal arrangement gives you no record and no recourse. FYNDO adds a verification and accountability layer to the same local connection.",
    },
    disclaimer: {
      heading: "What FYNDO does not claim",
      body: "FYNDO connects people; it does not employ operators, guarantee outcomes, or set prices on their behalf. Ratings reflect what other users reported after completed work, and profile review is an administrative check — not a professional certification or a background check.",
    },
    safety: {
      heading: "Staying safe on both sides",
      items: [
        "Agree the scope, price and timing clearly before work starts.",
        "Keep the conversation and the details inside the app where possible.",
        "Check the profile's ratings and history before assigning.",
        "Report any profile, listing or request that looks wrong — it goes for review.",
        "Never share OTPs with anyone, including someone claiming to be from FYNDO.",
      ],
    },
  },
  about: {
    meta: {
      title: "About FYNDO — A Local Network for Local Work",
      description:
        "FYNDO exists to solve a connection problem: local communities already have skill, equipment and demand. FYNDO makes local skills discoverable and local work accessible.",
    },
    breadcrumb: { home: "Home", current: "About" },
    jsonLd: {
      description:
        "Hyperlocal marketplace connecting people who need work done with skilled workers, service providers and equipment owners nearby.",
      slogan: "Your Work. Our Network.",
    },
    hero: { title: "Local skill isn't scarce. Connection is." },
    body: {
      p1: "Every town already contains an enormous amount of skill, experience and equipment. There are masons who can build the wall, mechanics who can fix the bike, tailors who can finish the order before the function, and tractor owners whose machine sits idle between seasons.",
      p2: "There is also no shortage of demand. Somebody nearby needs exactly that work done, this week. What's missing between the two is a reliable way to find each other.",
      p3: "Today that gap is filled by word of mouth — neighbours, WhatsApp groups, phone calls, and requests passed along until they reach someone who can actually do the job. It works unevenly, it's slow, and it leaves capable people invisible while others struggle to find them.",
      heading: "What FYNDO is building",
      p4: "FYNDO is a digital network for local work. Work Providers post what they need with location, budget and detail. Operators publish what they do, where they work and what they charge. Both sides see each other, connect directly, and rate the outcome — so the next person has more to go on than a recommendation from a friend of a friend.",
      p5: "Trust is built into the product rather than bolted on: phone verification for every account, administrative review of operator profiles, ratings after completed work, and tools to report anything that looks wrong.",
      slogan: "Your Work. Our Network.",
    },
  },
} as const;

export default pages;
