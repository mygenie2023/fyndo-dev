import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle2,
  Navigation,
  Phone,
  Wheat,
  Tractor,
  Zap,
  Hammer,
  BrickWall,
  Paintbrush,
  Car,
  Snowflake,
  Wrench,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import SkillSelection from "@/components/SkillSelection";
import { useLocationName } from "@/hooks/use-location-name";
import type { Job } from "@shared/schema";
import { CATEGORIES, SERVICES } from "@/lib/services";

interface AssociateJobsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/* =========================================================
   JOB NORMALIZATION
   ========================================================= */

const mapJobFromSupabase = (job: any): Job => {
  /*
   * FYNDO stores the farmer-selected service in service_type.
   *
   * Some responses may use camelCase or expose the value
   * under job_type / jobType. Support all known forms.
   */
  const selectedServiceType =
    job?.service_type ??
    job?.serviceType ??
    job?.job_type ??
    job?.jobType ??
    job?.service ??
    job?.service_name ??
    job?.serviceName ??
    "";

  return {
    ...job,

    id: job?.id,

    farmerId:
      job?.farmer_id ??
      job?.farmerId,

    farmerName:
      job?.farmer_name ??
      job?.farmerName,

    farmerPhoneNumber:
      job?.farmer_phone_number ??
      job?.farmerPhoneNumber,

    /*
     * IMPORTANT:
     * Preserve the exact farmer-selected value.
     */
    serviceType:
      typeof selectedServiceType === "string"
        ? selectedServiceType
        : String(selectedServiceType ?? ""),

    date: job?.date,

    time: job?.time,

    duration:
      job?.duration ?? 0,

    associatesNeeded:
      job?.associates_needed ??
      job?.associatesNeeded ??
      0,

    skillLevel:
      job?.skill_level ??
      job?.skillLevel,

    budget:
      job?.budget ?? 0,

    latitude:
      job?.latitude,

    longitude:
      job?.longitude,

    location:
      job?.location ?? "",

    status:
      job?.status,

    createdAt:
      job?.created_at ??
      job?.createdAt,

    updatedAt:
      job?.updated_at ??
      job?.updatedAt,
  };
};

const mapInterestJobFromSupabase = (
  job: any
): Job => {
  return mapJobFromSupabase(job);
};

/* =========================================================
   JOB TYPE / SERVICE ICONS
   ========================================================= */

/*
 * Normalize values before comparing them.
 *
 * Examples:
 *
 * "Farm Labour"       -> "farm labour"
 * "farm-labour"       -> "farm labour"
 * "Farm_Labour"       -> "farm labour"
 * " FARM  LABOUR "    -> "farm labour"
 */
const normalizeJobType = (
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
};

/*
 * Icons are keyed by the ACTUAL FYNDO service/trade
 * names, not by arbitrary guesses.
 */
const JOB_TYPE_ICONS: Record<
  string,
  LucideIcon
> = {
  /* Home & Construction */
  electrician: Zap,
  carpenter: Hammer,
  mason: BrickWall,
  masonry: BrickWall,
  painter: Paintbrush,
  welder: Wrench,
  centring: Hammer,

  /* Repair */
  "bike/car mechanic": Wrench,
  "bike car mechanic": Wrench,
  "bike mechanic": Wrench,
  "mobile repair": Wrench,
  "ac repair": Snowflake,
  puncture: Wrench,

  /* Rental */
  tractor: Tractor,
  "tractor rental": Tractor,
  auto: Car,
  car: Car,
  "tata ace": Car,
  "tent house on rent": Briefcase,

  /* Agriculture */
  harvesters: Wheat,
  harvester: Wheat,
  "crop spraying": Wheat,
  "farm labour": Wheat,
  "agri services": Wheat,

  /* People / Labour */
  "construction labour": Users,
  drivers: Car,
  driver: Car,
  "daily wage work": Users,

  /* Emergency */
  "urgent local services": Zap,

  /* Health & Beauty */
  salon: Scissors,
  "home health services": Users,

  /* Services & Others */
  tailor: Scissors,
  "grass cutting": Wheat,
  "other local services": Briefcase,
};

/*
 * Find the icon from the actual FYNDO service taxonomy.
 *
 * Matching order:
 *
 * 1. Exact FYNDO service name
 * 2. Exact FYNDO service slug
 * 3. Exact FYNDO category trade
 * 4. Known normalized aliases
 * 5. Category-based fallback
 * 6. Briefcase only as final fallback
 */
const getJobTypeIcon = (
  serviceType?: unknown
): LucideIcon => {
  const normalizedType =
    normalizeJobType(serviceType);

  if (!normalizedType) {
    return Briefcase;
  }

  /*
   * -------------------------------------------------------
   * 1. Exact service-name match
   * -------------------------------------------------------
   *
   * Example:
   * "Farm Labour" -> SERVICES entry "Farm Labour"
   */
  const serviceByName =
    SERVICES.find(
      (service) =>
        normalizeJobType(
          service.name
        ) === normalizedType
    );

  if (serviceByName) {
    const icon =
      JOB_TYPE_ICONS[
        normalizeJobType(
          serviceByName.name
        )
      ];

    if (icon) {
      return icon;
    }
  }

  /*
   * -------------------------------------------------------
   * 2. Exact service-slug match
   * -------------------------------------------------------
   *
   * Example:
   * "farm-labour" -> SERVICES slug
   */
  const serviceBySlug =
    SERVICES.find(
      (service) =>
        normalizeJobType(
          service.slug
        ) === normalizedType
    );

  if (serviceBySlug) {
    const icon =
      JOB_TYPE_ICONS[
        normalizeJobType(
          serviceBySlug.name
        )
      ];

    if (icon) {
      return icon;
    }
  }

  /*
   * -------------------------------------------------------
   * 3. Exact category trade match
   * -------------------------------------------------------
   *
   * This covers values such as:
   * Masonry
   * Welder
   * Centring
   * Harvesters
   * Crop Spraying
   * Construction Labour
   */
  for (const category of CATEGORIES) {
    const matchingTrade =
      category.trades.find(
        (trade) =>
          normalizeJobType(
            trade
          ) === normalizedType
      );

    if (matchingTrade) {
      const icon =
        JOB_TYPE_ICONS[
          normalizeJobType(
            matchingTrade
          )
        ];

      if (icon) {
        return icon;
      }
    }
  }

  /*
   * -------------------------------------------------------
   * 4. Direct known mapping
   * -------------------------------------------------------
   */
  const directIcon =
    JOB_TYPE_ICONS[
      normalizedType
    ];

  if (directIcon) {
    return directIcon;
  }

  /*
   * -------------------------------------------------------
   * 5. Controlled aliases / variations
   * -------------------------------------------------------
   *
   * These handle possible differences in how the
   * selected service is returned by the database.
   */
  const aliases: Record<
    string,
    string
  > = {
    "bike/car mechanic":
      "bike mechanic",

    "bike car mechanic":
      "bike mechanic",

    mechanic: "bike mechanic",

    mechanics: "bike mechanic",

    ac: "ac repair",

    "ac service": "ac repair",

    tractor: "tractor",

    tractors: "tractor",

    harvest: "harvesters",

    harvesting: "harvesters",

    labour: "farm labour",

    labor: "farm labour",

    "farm labor": "farm labour",

    "farm worker": "farm labour",

    "farm workers": "farm labour",

    "driver service": "driver",

    drivers: "driver",

    mason: "mason",

    masonry: "masonry",

    electrician: "electrician",

    carpentry: "carpenter",

    painting: "painter",

    tailoring: "tailor",
  };

  const alias =
    aliases[normalizedType];

  if (alias) {
    const aliasIcon =
      JOB_TYPE_ICONS[alias];

    if (aliasIcon) {
      return aliasIcon;
    }
  }

  /*
   * -------------------------------------------------------
   * 6. Controlled category-level fallback
   * -------------------------------------------------------
   *
   * Only used if the exact service wasn't found but the
   * returned value clearly belongs to one of FYNDO's
   * service groups.
   */
  if (
    normalizedType.includes(
      "electric"
    )
  ) {
    return Zap;
  }

  if (
    normalizedType.includes(
      "carpenter"
    ) ||
    normalizedType.includes(
      "carpentry"
    )
  ) {
    return Hammer;
  }

  if (
    normalizedType.includes(
      "mason"
    ) ||
    normalizedType.includes(
      "masonry"
    )
  ) {
    return BrickWall;
  }

  if (
    normalizedType.includes(
      "paint"
    )
  ) {
    return Paintbrush;
  }

  if (
    normalizedType.includes(
      "tractor"
    )
  ) {
    return Tractor;
  }

  if (
    normalizedType.includes(
      "bike"
    ) ||
    normalizedType.includes(
      "mechanic"
    ) ||
    normalizedType.includes(
      "repair"
    ) ||
    normalizedType.includes(
      "puncture"
    )
  ) {
    return Wrench;
  }

  if (
    normalizedType.includes(
      "farm"
    ) ||
    normalizedType.includes(
      "harvest"
    ) ||
    normalizedType.includes(
      "crop"
    ) ||
    normalizedType.includes(
      "agri"
    )
  ) {
    return Wheat;
  }

  if (
    normalizedType.includes(
      "driver"
    )
  ) {
    return Car;
  }

  if (
    normalizedType.includes(
      "tailor"
    ) ||
    normalizedType.includes(
      "stitch"
    )
  ) {
    return Scissors;
  }

  /*
   * Final fallback.
   */
  console.warn(
    "FYNDO: No job type icon mapping found:",
    serviceType
  );

  return Briefcase;
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AssociateJobs({
  searchQuery: _searchQuery,
  setSearchQuery: _setSearchQuery,
}: AssociateJobsProps) {
  const { user } = useUser();
  const queryClient =
    useQueryClient();

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "new" | "applied" | "shortlisted"
  >("new");

  /* =======================================================
     USER REQUIREMENTS
     ======================================================= */

  const hasSkills =
    user?.skills &&
    Array.isArray(user.skills) &&
    user.skills.length > 0;

  const hasLocation =
    user?.latitude &&
    user?.longitude &&
    user.latitude !== null &&
    user.longitude !== null;

  /* =======================================================
     NEARBY JOBS
     ======================================================= */

  const {
    data: nearbyJobs = [],
    isLoading: jobsLoading,
  } = useQuery<Job[]>({
    queryKey: [
      "fyndo-nearby-jobs",
      user?.latitude,
      user?.longitude,
    ],

    queryFn: async () => {
      if (
        user?.latitude === null ||
        user?.latitude === undefined ||
        user?.longitude === null ||
        user?.longitude === undefined
      ) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_nearby_jobs",
        {
          user_lat: Number(
            user.latitude
          ),
          user_lon: Number(
            user.longitude
          ),
          radius_km: 20,
        }
      );

      if (error) {
        console.error(
          "FYNDO nearby jobs error:",
          error
        );

        throw error;
      }

      return (data ?? []).map(
        mapJobFromSupabase
      );
    },

    enabled: Boolean(
      hasLocation && hasSkills
    ),
  });

  /* =======================================================
     ASSOCIATE INTERESTS
     ======================================================= */

  interface AssociateInterest {
    jobId: string;
    status: string;
    job: Job;
  }

  const {
    data: interestData = [],
    isLoading: interestsLoading,
  } = useQuery<
    AssociateInterest[]
  >({
    queryKey: [
      "fyndo-associate-interests",
      user?.id,
    ],

    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_fyndo_associate_interests",
        {
          p_associate_id:
            user.id,
        }
      );

      if (error) {
        console.error(
          "FYNDO associate interests error:",
          error
        );

        throw error;
      }

      return (data ?? []).map(
        (item: any) => ({
          jobId:
            item.job_id ??
            item.jobId,

          status:
            item.status ?? "",

          job:
            mapInterestJobFromSupabase(
              item.job
            ),
        })
      );
    },

    enabled: Boolean(
      user?.id && hasSkills
    ),
  });

  /* =======================================================
     DISMISSED JOBS
     ======================================================= */

  const [
    dismissedJobIds,
    setDismissedJobIds,
  ] = useState<Set<string>>(
    () => {
      const stored =
        localStorage.getItem(
          `dismissed_jobs_${user?.id}`
        );

      return stored
        ? new Set(
            JSON.parse(stored)
          )
        : new Set();
    }
  );

  useEffect(() => {
    const stored =
      localStorage.getItem(
        `dismissed_jobs_${user?.id}`
      );

    setDismissedJobIds(
      stored
        ? new Set(
            JSON.parse(stored)
          )
        : new Set()
    );
  }, [user?.id]);

  const dismissJob = (
    jobId: string
  ) => {
    setDismissedJobIds(
      (prev) => {
        const newSet =
          new Set(prev);

        newSet.add(jobId);

        localStorage.setItem(
          `dismissed_jobs_${user?.id}`,
          JSON.stringify(
            Array.from(newSet)
          )
        );

        return newSet;
      }
    );
  };

  const undismissJob = (
    jobId: string
  ) => {
    setDismissedJobIds(
      (prev) => {
        const newSet =
          new Set(prev);

        newSet.delete(jobId);

        localStorage.setItem(
          `dismissed_jobs_${user?.id}`,
          JSON.stringify(
            Array.from(newSet)
          )
        );

        return newSet;
      }
    );
  };

  /* =======================================================
     EXPRESS INTEREST
     ======================================================= */

  const expressInterestMutation =
    useMutation({
      mutationFn: async ({
        jobId,
      }: {
        jobId: string;
      }) => {
        if (!user?.id) {
          throw new Error(
            "Associate ID is missing"
          );
        }

        const {
          data,
          error,
        } = await supabase.rpc(
          "create_fyndo_job_interest",
          {
            p_job_id: jobId,
            p_associate_id:
              user.id,
          }
        );

        if (error) {
          console.error(
            "FYNDO create job interest error:",
            error
          );

          throw error;
        }

        return data;
      },

      onSuccess: (_, { jobId }) => {
        undismissJob(jobId);

        queryClient.invalidateQueries(
          {
            queryKey: [
              "fyndo-associate-interests",
              user?.id,
            ],
          }
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "fyndo-nearby-jobs",
              user?.latitude,
              user?.longitude,
            ],
          }
        );
      },

      onError: (error) => {
        console.error(
          "FYNDO express interest failed:",
          error
        );
      },
    });

  /* =======================================================
     GOOGLE MAPS
     ======================================================= */

  const openGoogleMaps = (
    job: Job
  ) => {
    const hasCoordinates =
      job.latitude !== null &&
      job.latitude !== undefined &&
      job.longitude !== null &&
      job.longitude !== undefined;

    const destination =
      hasCoordinates
        ? `${job.latitude},${job.longitude}`
        : encodeURIComponent(
            job.location
          );

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     SKILLS
     ======================================================= */

  if (!hasSkills) {
    return <SkillSelection />;
  }

  /* =======================================================
     LOCATION
     ======================================================= */

  if (!hasLocation) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] bg-[#FDFCF7] px-5 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="h-7 w-7" />
          </div>

          <h3 className="mt-5 font-display text-lg font-bold text-[#1F372E]">
            Location Required
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#70867E]">
            We need your location to
            show jobs within 20km
            radius.
          </p>

          <p className="mt-3 text-xs text-[#8A9B95]">
            Please allow location
            access in your browser
            settings.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (
    jobsLoading ||
    interestsLoading
  ) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] bg-[#FDFCF7] px-5 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Briefcase className="h-6 w-6 animate-pulse text-primary" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#1F372E]">
            Loading jobs...
          </p>

          <p className="mt-1 text-xs text-[#8A9B95]">
            Finding opportunities
            near you
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     INTERACTED JOB IDS
     ======================================================= */

  const interestedJobIds =
    new Set(
      interestData.map(
        (interest) =>
          interest.jobId
      )
    );

  /* =======================================================
     USER SKILLS
     ======================================================= */

  const userSkills =
    user?.skills || [];

  const normalizedUserSkills =
    userSkills.map((skill) =>
      normalizeJobType(skill)
    );

  /* =======================================================
     NEW JOBS
     ======================================================= */

  const newJobs =
    nearbyJobs.filter(
      (job) => {
        if (
          interestedJobIds.has(
            job.id
          )
        ) {
          return false;
        }

        if (
          dismissedJobIds.has(
            job.id
          )
        ) {
          return false;
        }

        if (
          job.status !== "Open"
        ) {
          return false;
        }

        if (
          normalizedUserSkills.length >
            0 &&
          !normalizedUserSkills.includes(
            normalizeJobType(
              job.serviceType
            )
          )
        ) {
          return false;
        }

        return true;
      }
    );

  /* =======================================================
     APPLIED JOBS
     ======================================================= */

  const appliedJobs =
    interestData
      .filter(
        (interest) =>
          interest.status
            .toLowerCase() ===
            "interested" &&
          interest.job.status ===
            "Open"
      )
      .map(
        (interest) =>
          interest.job
      );

  /* =======================================================
     SHORTLISTED JOBS
     ======================================================= */

  const shortlistedJobs =
    interestData
      .filter(
        (interest) =>
          interest.status
            .toLowerCase() ===
          "shortlisted"
      )
      .map(
        (interest) =>
          interest.job
      );

  /* =======================================================
     JOB CARD
     ======================================================= */

  const JobCard = ({
    job,
    statusLabel,
    showActions = false,
  }: {
    job: Job;
    statusLabel: string;
    showActions?: boolean;
  }) => {
    const locationName =
      useLocationName(
        job.location,
        job.latitude,
        job.longitude
      );

    /*
     * This is the exact value returned from
     * Supabase after normalization.
     */
    const selectedJobType =
      job.serviceType;

    /*
     * Resolve the icon from the actual
     * farmer-selected service type.
     */
    const JobTypeIcon =
      getJobTypeIcon(
        selectedJobType
      );

    return (
      <div
        className="
          rounded-3xl
          border
          border-[#DCE7E3]
          bg-white
          p-4
          shadow-[0_8px_28px_rgba(31,55,46,0.075)]
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_12px_32px_rgba(31,55,46,0.10)]
        "
        data-testid={`job-card-${job.id}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Actual job-type icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <JobTypeIcon className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold text-[#1F372E]">
                  {selectedJobType ||
                    "Job"}
                </h3>

              </div>
            </div>

            {/* Location */}
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />

              <span className="min-w-0 truncate text-xs text-[#70867E]">
                {locationName ||
                  job.location ||
                  "Location unavailable"}
              </span>

              <button
                type="button"
                onClick={() =>
                  openGoogleMaps(
                    job
                  )
                }
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary/10
                  text-primary
                  transition-all
                  hover:bg-primary/15
                  active:scale-95
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary/25
                "
                aria-label="Open job location in Google Maps"
                title="Open in Google Maps"
                data-testid={`button-google-maps-${job.id}`}
              >
                <Navigation className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Farmer Information */}
            {(job as any).farmerName && (
              <div className="mt-2">
                <p className="text-xs text-[#70867E]">
                  Posted by:{" "}
                  <span className="font-semibold text-[#1F372E]">
                    {(job as any).farmerName}
                  </span>
                </p>

                {(job as any).farmerPhoneNumber && (
                  <a
                    href={`tel:${(job as any).farmerPhoneNumber}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>
                      {(job as any).farmerPhoneNumber}
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <span
            className={`
              shrink-0
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-semibold
              ${
                statusLabel ===
                "New Job"
                  ? "bg-primary/10 text-primary"
                  : statusLabel ===
                      "Applied"
                    ? "bg-[#EAF1EE] text-[#41665A]"
                    : "bg-[#FFF5DD] text-[#9A6B13]"
              }
            `}
          >
            {statusLabel}
          </span>
        </div>

        {/* Job information */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                <Calendar className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-[#8A9B95]">
                  Date
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                  {job.date
                    ? new Date(
                        job.date
                      ).toLocaleDateString(
                        "en-GB"
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Workers */}
          <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-[#8A9B95]">
                  Workers
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                  {job.associatesNeeded ??
                    0}
                </p>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-[#8A9B95]">
                  Budget
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                  ₹{job.budget ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                <Calendar className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-[#8A9B95]">
                  Duration
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                  {job.duration ??
                    0}{" "}
                  {(job.duration ??
                    0) === 1
                    ? "day"
                    : "days"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                dismissJob(
                  job.id
                )
              }
              className="
                h-11
                rounded-xl
                border
                border-[#D5E1DD]
                bg-[#F7F9F8]
                px-4
                text-sm
                font-semibold
                text-[#526C62]
                shadow-sm
                transition-all
                hover:border-[#C6D6D0]
                hover:bg-[#EAF1EE]
                hover:text-[#1F372E]
                active:scale-[0.98]
              "
              data-testid={`button-not-interested-${job.id}`}
            >
              Not Interested
            </button>

            <button
              type="button"
              onClick={() =>
                expressInterestMutation.mutate(
                  {
                    jobId:
                      job.id,
                  }
                )
              }
              disabled={
                expressInterestMutation.isPending
              }
              className="
                h-11
                rounded-xl
                bg-primary
                px-4
                text-sm
                font-semibold
                text-primary-foreground
                shadow-sm
                transition-all
                hover:bg-primary/95
                hover:shadow-md
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              data-testid={`button-interested-${job.id}`}
            >
              Interested
            </button>
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     TABS
     ======================================================= */

  const tabItems = [
    {
      id: "new" as const,
      label: "New",
      count:
        newJobs.length,
    },
    {
      id: "applied" as const,
      label: "Applied",
      count:
        appliedJobs.length,
    },
    {
      id: "shortlisted" as const,
      label: "Shortlisted",
      count:
        shortlistedJobs.length,
    },
  ];

  /* =======================================================
     EMPTY STATE
     ======================================================= */

  const renderEmptyState = (
    icon: React.ReactNode,
    title: string,
    description: string
  ) => (
    <div className="rounded-3xl border border-[#DCE7E3] bg-white px-5 py-12 text-center shadow-[0_8px_28px_rgba(31,55,46,0.05)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <p className="mt-4 font-display text-base font-bold text-[#1F372E]">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#70867E]">
        {description}
      </p>
    </div>
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#FDFCF7] px-4 pb-28 pt-5">
      <div className="mx-auto max-w-2xl space-y-4">

        {/* Tabs */}
        <div className="w-full rounded-2xl border border-[#DCE7E3] bg-white p-1.5 shadow-[0_4px_16px_rgba(31,55,46,0.04)]">
          <div className="grid grid-cols-3 gap-1.5">
            {tabItems.map(
              (tab) => {
                const isActive =
                  activeTab ===
                  tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.id
                      )
                    }
                    className={`
                      min-w-0
                      rounded-xl
                      px-2
                      py-2.5
                      text-xs
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-[#70867E] hover:bg-[#F7F9F8] hover:text-[#1F372E]"
                      }
                    `}
                    data-testid={`tab-${tab.id}`}
                  >
                    {tab.label} (
                    {tab.count})
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* New */}
        {activeTab ===
          "new" && (
          <>
            {newJobs.length >
            0 ? (
              <div className="space-y-3">
                {newJobs.map(
                  (job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      statusLabel="New Job"
                      showActions={
                        true
                      }
                    />
                  )
                )}
              </div>
            ) : (
              renderEmptyState(
                <Briefcase className="h-6 w-6" />,
                "No new jobs nearby",
                "Check back soon for new opportunities matching your skills."
              )
            )}
          </>
        )}

        {/* Applied */}
        {activeTab ===
          "applied" && (
          <>
            {appliedJobs.length >
            0 ? (
              <div className="space-y-3">
                {appliedJobs.map(
                  (job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      statusLabel="Applied"
                      showActions={
                        false
                      }
                    />
                  )
                )}
              </div>
            ) : (
              renderEmptyState(
                <CheckCircle2 className="h-6 w-6" />,
                "No applied jobs yet",
                "Express interest in jobs to see your applications here."
              )
            )}
          </>
        )}

        {/* Shortlisted */}
        {activeTab ===
          "shortlisted" && (
          <>
            {shortlistedJobs.length >
            0 ? (
              <div className="space-y-3">
                {shortlistedJobs.map(
                  (job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      statusLabel="Shortlisted"
                      showActions={
                        false
                      }
                    />
                  )
                )}
              </div>
            ) : (
              renderEmptyState(
                <TrendingUp className="h-6 w-6" />,
                "No shortlisted jobs yet",
                "FYNDO will shortlist you for suitable jobs."
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}