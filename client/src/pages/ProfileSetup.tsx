import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  Loader2,
  Tractor,
  Upload,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import { useUpload } from "@/hooks/use-upload";

import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";

export default function ProfileSetup() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setUser } = useUser();

  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ---------------------------------------------------------------------------
  // LOCATION
  //
  // Latitude/longitude are captured automatically from browser GPS.
  // They are intentionally kept separate from the editable location name.
  // ---------------------------------------------------------------------------

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [locationName, setLocationName] = useState("");

  const [detectingLocation, setDetectingLocation] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [userType, setUserType] = useState<
    "farmer" | "associate" | null
  >(null);

  // Associate-specific fields
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [expectedDailySalary, setExpectedDailySalary] =
    useState("");
  const [travelDistance, setTravelDistance] =
    useState("");
  const [comfortableStaying, setComfortableStaying] =
    useState("");

  // Aadhaar KYC uploads
  const [aadharFrontUrl, setAadharFrontUrl] =
    useState("");
  const [aadharBackUrl, setAadharBackUrl] =
    useState("");
  const [uploadingFront, setUploadingFront] =
    useState(false);
  const [uploadingBack, setUploadingBack] =
    useState(false);

  const frontInputRef =
    useRef<HTMLInputElement>(null);

  const backInputRef =
    useRef<HTMLInputElement>(null);

  const { uploadFile } = useUpload({
    onSuccess: (response) => {
      console.log(
        "Upload successful:",
        response.objectPath
      );
    },
  });

  const totalSteps =
    userType === "associate" ? 4 : 3;

  // ---------------------------------------------------------------------------
  // GET PHONE NUMBER FROM LOGIN
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const phone = params.get("phone");

    if (phone) {
      setPhoneNumber(phone);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // DETERMINE WHETHER CURRENT STEP IS LOCATION
  // ---------------------------------------------------------------------------

  const isLocationStep =
    (userType === "farmer" && currentStep === 3) ||
    (userType === "associate" && currentStep === 4);

  // ---------------------------------------------------------------------------
  // AUTOMATIC GPS + REVERSE GEOCODING
  //
  // This runs automatically when the Location step opens.
  //
  // Coordinates are captured once and stored in selectedLocation.
  // locationName is populated from reverse geocoding but remains editable.
  // Editing locationName does NOT modify selectedLocation.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isLocationStep) {
      return;
    }

    // Don't request GPS again if it has already been captured.
    if (selectedLocation) {
      return;
    }

    let cancelled = false;

    const reverseGeocode = async (
      latitude: number,
      longitude: number
    ): Promise<string> => {
      const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        `&zoom=18` +
        `&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Reverse geocoding failed: ${response.status}`
        );
      }

      const data = await response.json();

      /*
       * Prefer a concise human-readable locality instead of
       * displaying the complete postal address.
       */
      const address = data?.address ?? {};

      const locality =
        address.village ||
        address.town ||
        address.city ||
        address.municipality ||
        address.suburb ||
        address.neighbourhood;

      const district =
        address.state_district ||
        address.county;

      const state =
        address.state;

      if (locality && district) {
        return `${locality}, ${district}`;
      }

      if (locality && state) {
        return `${locality}, ${state}`;
      }

      if (locality) {
        return locality;
      }

      if (data?.display_name) {
        return data.display_name;
      }

      return "";
    };

    const detectLocation = () => {
      if (!navigator.geolocation) {
        setLocationError(
          "Location services are not supported by this browser."
        );
        return;
      }

      setDetectingLocation(true);
      setLocationError("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (cancelled) {
            return;
          }

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          /*
           * Store coordinates immediately.
           *
           * These coordinates remain fixed even if the user
           * edits the Location name below.
           */
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
          });

          try {
            const detectedName =
              await reverseGeocode(
                latitude,
                longitude
              );

            if (
              !cancelled &&
              detectedName
            ) {
              setLocationName(
                detectedName
              );
            }
          } catch (error) {
            console.error(
              "Reverse geocoding failed:",
              error
            );

            if (!cancelled) {
              setLocationError(
                "Your location was detected, but we couldn't determine the place name. Please enter the location name manually."
              );
            }
          } finally {
            if (!cancelled) {
              setDetectingLocation(false);
            }
          }
        },
        (error) => {
          if (cancelled) {
            return;
          }

          console.error(
            "Browser location detection failed:",
            error
          );

          setDetectingLocation(false);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError(
                "Location permission was denied. Please allow location access in your browser to continue."
              );
              break;

            case error.POSITION_UNAVAILABLE:
              setLocationError(
                "Your current location could not be determined. Please try again."
              );
              break;

            case error.TIMEOUT:
              setLocationError(
                "Location detection timed out. Please try again."
              );
              break;

            default:
              setLocationError(
                "We couldn't detect your location. Please try again."
              );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

    detectLocation();

    return () => {
      cancelled = true;
    };
  }, [
    isLocationStep,
    selectedLocation,
  ]);

  // ---------------------------------------------------------------------------
  // CREATE USER + COMPLETE PROFILE
  // ---------------------------------------------------------------------------

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        data: createdUser,
        error: createError,
      } = await supabase.rpc(
        "create_fyndo_user",
        {
          p_phone_number:
            data.phoneNumber,

          p_name:
            data.name,

          p_user_type:
            data.userType,
        }
      );

      if (createError) {
        throw createError;
      }

      if (!createdUser?.id) {
        throw new Error(
          "User was not created"
        );
      }

      const {
        data: updatedUser,
        error: updateError,
      } = await supabase.rpc(
        "update_fyndo_user",
        {
          p_user_id:
            createdUser.id,

          p_name:
            data.name,

          p_user_type:
            data.userType,

          p_latitude:
            Number(data.latitude),

          p_longitude:
            Number(data.longitude),

          p_location:
            data.location,

          p_skills:
            data.skills || [],

          p_skill_level:
            data.skillLevel || null,

          p_hourly_rate:
            data.hourlyRate ?? null,

          p_gender:
            data.gender || null,

          p_date_of_birth:
            data.dateOfBirth || null,

          p_expected_daily_salary:
            data.expectedDailySalary ??
            null,

          p_travel_distance:
            data.travelDistance ??
            null,

          p_comfortable_staying:
            data.comfortableStaying ||
            null,

          p_aadhar_front_url:
            data.aadharFrontUrl ||
            null,

          p_aadhar_back_url:
            data.aadharBackUrl ||
            null,
        }
      );

      if (updateError) {
        throw updateError;
      }

      return updatedUser;
    },

    onSuccess: (data: any) => {
  const user = {
    ...data,
    phoneNumber: data.phone_number,
    userType: data.user_type,
    skillLevel: data.skill_level,
    hourlyRate: data.hourly_rate,
    dateOfBirth: data.date_of_birth,
    expectedDailySalary: data.expected_daily_salary,
    travelDistance: data.travel_distance,
    comfortableStaying: data.comfortable_staying,
    aadharFrontUrl: data.aadhar_front_url,
    aadharBackUrl: data.aadhar_back_url,
    averageRating: data.average_rating,
    totalRatings: data.total_ratings,
    jobsCompleted: data.jobs_completed,
    totalEarnings: data.total_earnings,
    pendingPayments: data.pending_payments,
    createdAt: data.created_at,
  };

  setUser(user);

  if (data.user_type?.toLowerCase() === "farmer") {
    // Farmer → open Post a Job once
    setLocation("/jobs?createJob=true");
  } else {
    // Associate → go to Jobs, where Select Your Skills is displayed
    setLocation("/jobs");
  }
},

    onError: (error) => {
      console.error(
        "FYNDO profile creation error:",
        error
      );
    },
  });

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(
        (step) => step + 1
      );
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(
        (step) => step - 1
      );
    }
  };

  // ---------------------------------------------------------------------------
  // AADHAAR UPLOADS
  // ---------------------------------------------------------------------------

  const handleAadharFrontUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setUploadingFront(true);

    try {
      const response =
        await uploadFile(file);

      if (response) {
        setAadharFrontUrl(
          response.objectPath
        );
      }
    } finally {
      setUploadingFront(false);
    }
  };

  const handleAadharBackUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setUploadingBack(true);

    try {
      const response =
        await uploadFile(file);

      if (response) {
        setAadharBackUrl(
          response.objectPath
        );
      }
    } finally {
      setUploadingBack(false);
    }
  };

  // ---------------------------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------------------------

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        name.trim().length > 0
      );
    }

    if (currentStep === 2) {
      return userType !== null;
    }

    if (userType === "associate") {
      if (currentStep === 3) {
        return (
          gender !== "" &&
          dateOfBirth !== "" &&
          expectedDailySalary !== "" &&
          travelDistance !== "" &&
          comfortableStaying !== "" &&
          aadharFrontUrl !== "" &&
          aadharBackUrl !== ""
        );
      }

      if (currentStep === 4) {
        return (
          selectedLocation !== null &&
          locationName.trim().length > 0
        );
      }
    } else {
      if (currentStep === 3) {
        return (
          selectedLocation !== null &&
          locationName.trim().length > 0
        );
      }
    }

    return false;
  };

  // ---------------------------------------------------------------------------
  // COMPLETE PROFILE
  // ---------------------------------------------------------------------------

  const handleComplete = () => {
    if (
      !name ||
      !selectedLocation ||
      !userType ||
      !locationName.trim()
    ) {
      return;
    }

    const baseData = {
      name,
      phoneNumber,
      userType,

      /*
       * These coordinates came from browser GPS.
       *
       * They are intentionally independent from locationName.
       */
      latitude:
        selectedLocation.lat.toString(),

      longitude:
        selectedLocation.lng.toString(),

      /*
       * This is the editable human-readable
       * location name.
       */
      location:
        locationName.trim(),
    };

    if (userType === "associate") {
      profileMutation.mutate({
        ...baseData,

        skills: [],

        skillLevel:
          "Beginner",

        hourlyRate:
          100,

        gender,

        dateOfBirth,

        expectedDailySalary:
          parseInt(
            expectedDailySalary
          ) || 0,

        travelDistance:
          parseInt(
            travelDistance
          ) || 0,

        comfortableStaying,

        aadharFrontUrl:
          aadharFrontUrl ||
          undefined,

        aadharBackUrl:
          aadharBackUrl ||
          undefined,
      });
    } else {
      profileMutation.mutate(
        baseData
      );
    }
  };

  // ---------------------------------------------------------------------------
  // STEP TITLE
  // ---------------------------------------------------------------------------

  const stepTitle = () => {
    if (currentStep === 1) {
      return "Tell us about yourself";
    }

    if (currentStep === 2) {
      return "How will you use FYNDO?";
    }

    if (
      userType === "associate" &&
      currentStep === 3
    ) {
      return "Tell us a little more";
    }

    return "Where are you located?";
  };

  // ---------------------------------------------------------------------------
  // STEP DESCRIPTION
  // ---------------------------------------------------------------------------

  const stepDescription = () => {
    if (currentStep === 1) {
      return "Let's get your profile ready.";
    }

    if (currentStep === 2) {
      return "Choose the option that best describes you.";
    }

    if (
      userType === "associate" &&
      currentStep === 3
    ) {
      return "This helps us connect you with suitable work opportunities.";
    }

    return "We'll use your location to show you nearby jobs and services.";
  };

  // ---------------------------------------------------------------------------
  // PROGRESS
  // ---------------------------------------------------------------------------

  const renderProgress = () => {
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({
          length: totalSteps,
        }).map((_, index) => {
          const step = index + 1;

          return (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? "w-9 bg-primary"
                  : step < currentStep
                  ? "w-7 bg-primary/60"
                  : "w-7 bg-[#DDE7E3]"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1F372E]">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#E7F0EB] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-6 sm:px-6">
        {/* ------------------------------------------------------------------ */}
        {/* HEADER                                                             */}
        {/* ------------------------------------------------------------------ */}

        <header className="flex items-center justify-between py-5">
          <button
            type="button"
            onClick={() =>
              setLocation("/")
            }
            className="flex items-center"
            aria-label="Go to FYNDO website"
          >
            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-9 w-auto object-contain"
            />
          </button>

          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7D75]">
              Profile Setup
            </p>

            <p className="mt-0.5 text-xs font-medium text-[#7C8C85]">
              Step {currentStep} of{" "}
              {totalSteps}
            </p>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* PROGRESS                                                           */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-7">
          {renderProgress()}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MAIN CONTENT                                                       */}
        {/* ------------------------------------------------------------------ */}

        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#1F372E] sm:text-3xl">
              {stepTitle()}
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7D75]">
              {stepDescription()}
            </p>
          </div>

          {/* ================================================================ */}
          {/* STEP 1                                                           */}
          {/* ================================================================ */}

          {currentStep === 1 && (
            <section className="animate-in fade-in duration-300">
              <div className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-[0_12px_32px_rgba(31,55,46,0.06)] sm:p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-[#1F372E]"
                  >
                    {t(
                      "profileSetup.name"
                    )}
                  </Label>

                  <Input
                    id="name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder={t(
                      "profileSetup.namePlaceholder"
                    )}
                    className="h-12 rounded-xl border-[#DDE7E3] bg-[#FBFCFB] px-4 text-base shadow-none focus-visible:ring-primary/20"
                    autoFocus
                    data-testid="input-name"
                  />

                  <p className="pt-1 text-xs leading-5 text-[#7C8C85]">
                    This is how people on
                    FYNDO will see your
                    name.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* STEP 2                                                           */}
          {/* ================================================================ */}

          {currentStep === 2 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              {/* Farmer */}
              <button
                type="button"
                onClick={() => {
                  setUserType(
                    "farmer"
                  );

                  setTimeout(() => {
                    setCurrentStep(3);
                  }, 200);
                }}
                className={`w-full rounded-3xl border bg-white p-5 text-left shadow-[0_12px_32px_rgba(31,55,46,0.05)] transition-all duration-200 ${
                  userType === "farmer"
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-[#DDE7E3] hover:border-primary/40"
                }`}
                data-testid="card-user-type-farmer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      userType === "farmer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#EAF2ED] text-primary"
                    }`}
                  >
                    <Tractor
                      className="h-7 w-7"
                      strokeWidth={2.1}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-[#1F372E]">
                      {t(
                        "profileSetup.farmer"
                      )}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#6B7D75]">
                      {t(
                        "profileSetup.farmerDescription"
                      )}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      userType === "farmer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#F3F6F4] text-[#7C8C85]"
                    }`}
                  >
                    <span className="text-lg">
                      →
                    </span>
                  </div>
                </div>
              </button>

              {/* Associate */}
              <button
                type="button"
                onClick={() => {
                  setUserType(
                    "associate"
                  );

                  setTimeout(() => {
                    setCurrentStep(3);
                  }, 200);
                }}
                className={`w-full rounded-3xl border bg-white p-5 text-left shadow-[0_12px_32px_rgba(31,55,46,0.05)] transition-all duration-200 ${
                  userType ===
                  "associate"
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-[#DDE7E3] hover:border-primary/40"
                }`}
                data-testid="card-user-type-associate"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      userType ===
                      "associate"
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#EAF2ED] text-primary"
                    }`}
                  >
                    <User
                      className="h-7 w-7"
                      strokeWidth={2.1}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-[#1F372E]">
                      {t(
                        "profileSetup.associate"
                      )}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#6B7D75]">
                      {t(
                        "profileSetup.associateDescription"
                      )}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      userType ===
                      "associate"
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#F3F6F4] text-[#7C8C85]"
                    }`}
                  >
                    <span className="text-lg">
                      →
                    </span>
                  </div>
                </div>
              </button>
            </section>
          )}

          {/* ================================================================ */}
          {/* ASSOCIATE STEP 3                                                 */}
          {/* ================================================================ */}

          {currentStep === 3 &&
            userType === "associate" && (
              <section className="space-y-4 animate-in fade-in duration-300">
                <div className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-[0_12px_32px_rgba(31,55,46,0.06)] sm:p-6">
                  <div className="space-y-5">
                    {/* Gender */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#1F372E]">
                        {t(
                          "profileSetup.gender",
                          "Gender"
                        )}
                      </Label>

                      <Select
                        value={gender}
                        onValueChange={
                          setGender
                        }
                      >
                        <SelectTrigger
                          className="h-12 rounded-xl border-[#DDE7E3] bg-[#FBFCFB] shadow-none"
                          data-testid="select-gender"
                        >
                          <SelectValue
                            placeholder={t(
                              "profileSetup.selectGender",
                              "Select gender"
                            )}
                          />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="male">
                            {t(
                              "profileSetup.male",
                              "Male"
                            )}
                          </SelectItem>

                          <SelectItem value="female">
                            {t(
                              "profileSetup.female",
                              "Female"
                            )}
                          </SelectItem>

                          <SelectItem value="other">
                            {t(
                              "profileSetup.other",
                              "Other"
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="date-of-birth"
                        className="text-sm font-semibold text-[#1F372E]"
                      >
                        {t(
                          "profileSetup.dateOfBirth",
                          "Date of Birth"
                        )}
                      </Label>

                      <Input
                        id="date-of-birth"
                        type="date"
                        value={
                          dateOfBirth
                        }
                        onChange={(e) =>
                          setDateOfBirth(
                            e.target.value
                          )
                        }
                        max={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() -
                                18
                            )
                          )
                            .toISOString()
                            .split("T")[0]
                        }
                        className="h-12 rounded-xl border-[#DDE7E3] bg-[#FBFCFB] shadow-none"
                        data-testid="input-date-of-birth"
                      />
                    </div>

                    {/* Salary */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="expected-salary"
                        className="text-sm font-semibold text-[#1F372E]"
                      >
                        {t(
                          "profileSetup.expectedDailySalary",
                          "Expected Daily Salary (Rs.)"
                        )}
                      </Label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6B7D75]">
                          ₹
                        </span>

                        <Input
                          id="expected-salary"
                          type="number"
                          value={
                            expectedDailySalary
                          }
                          onChange={(e) =>
                            setExpectedDailySalary(
                              e.target.value
                            )
                          }
                          placeholder={t(
                            "profileSetup.enterSalary",
                            "Enter expected daily salary"
                          )}
                          className="h-12 rounded-xl border-[#DDE7E3] bg-[#FBFCFB] pl-9 shadow-none"
                          min="0"
                          data-testid="input-expected-salary"
                        />
                      </div>
                    </div>

                    {/* Travel Distance */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[#1F372E]">
                        {t(
                          "profileSetup.travelDistance",
                          "How many kilometers are you willing to travel?"
                        )}
                      </Label>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ["5", "5 km"],
                          ["10", "10 km"],
                          ["20", "20 km"],
                          ["30", "30 km"],
                          ["50", "50 km"],
                          ["100", "100+ km"],
                        ].map(
                          ([
                            value,
                            label,
                          ]) => {
                            const selected =
                              travelDistance ===
                              value;

                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setTravelDistance(
                                    value
                                  )
                                }
                                className={`min-h-11 rounded-xl border px-2 text-sm font-semibold transition-all ${
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-[#DDE7E3] bg-[#FBFCFB] text-[#52665D] hover:border-primary/40"
                                }`}
                                data-testid={`travel-distance-${value}`}
                              >
                                {label}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Comfortable Staying */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[#1F372E]">
                        {t(
                          "profileSetup.comfortableStaying",
                          "Are you comfortable staying at farmer's location?"
                        )}
                      </Label>

                      <RadioGroup
                        value={
                          comfortableStaying
                        }
                        onValueChange={
                          setComfortableStaying
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        <label
                          htmlFor="stay-yes"
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                            comfortableStaying ===
                            "yes"
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-[#DDE7E3] bg-[#FBFCFB]"
                          }`}
                        >
                          <RadioGroupItem
                            value="yes"
                            id="stay-yes"
                            data-testid="radio-stay-yes"
                          />

                          <span className="text-sm font-medium text-[#1F372E]">
                            {t(
                              "profileSetup.yes",
                              "Yes"
                            )}
                          </span>
                        </label>

                        <label
                          htmlFor="stay-no"
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                            comfortableStaying ===
                            "no"
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-[#DDE7E3] bg-[#FBFCFB]"
                          }`}
                        >
                          <RadioGroupItem
                            value="no"
                            id="stay-no"
                            data-testid="radio-stay-no"
                          />

                          <span className="text-sm font-medium text-[#1F372E]">
                            {t(
                              "profileSetup.no",
                              "No"
                            )}
                          </span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* KYC */}
                <div className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-[0_12px_32px_rgba(31,55,46,0.06)] sm:p-6">
                  <div className="mb-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2ED]">
                        <Check
                          className="h-5 w-5 text-primary"
                          strokeWidth={2.4}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[#1F372E]">
                          {t(
                            "profileSetup.aadharKyc",
                            "Aadhar Card for KYC Verification"
                          )}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#7C8C85]">
                          {t(
                            "profileSetup.aadharKycDescription",
                            "Upload front and back side of your Aadhar card (required)"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Front */}
                    <div className="rounded-2xl border border-[#DDE7E3] bg-[#FBFCFB] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1F372E]">
                            {t(
                              "profileSetup.aadharFront",
                              "Aadhar Front Side"
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-[#7C8C85]">
                            JPG or PNG
                          </p>
                        </div>

                        {aadharFrontUrl && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={
                          frontInputRef
                        }
                        onChange={
                          handleAadharFrontUpload
                        }
                        accept="image/*"
                        className="hidden"
                        data-testid="input-aadhar-front"
                      />

                      <Button
                        type="button"
                        variant={
                          aadharFrontUrl
                            ? "default"
                            : "outline"
                        }
                        className={`h-11 w-full rounded-xl ${
                          aadharFrontUrl
                            ? ""
                            : "border-[#DDE7E3] bg-white"
                        }`}
                        onClick={() =>
                          frontInputRef.current?.click()
                        }
                        disabled={
                          uploadingFront
                        }
                        data-testid="button-upload-aadhar-front"
                      >
                        {uploadingFront ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t(
                              "profileSetup.uploading",
                              "Uploading..."
                            )}
                          </>
                        ) : aadharFrontUrl ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t(
                              "profileSetup.frontUploaded",
                              "Front Side Uploaded"
                            )}
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {t(
                              "profileSetup.uploadFront",
                              "Upload Front Side"
                            )}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Back */}
                    <div className="rounded-2xl border border-[#DDE7E3] bg-[#FBFCFB] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1F372E]">
                            {t(
                              "profileSetup.aadharBack",
                              "Aadhar Back Side"
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-[#7C8C85]">
                            JPG or PNG
                          </p>
                        </div>

                        {aadharBackUrl && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={
                          backInputRef
                        }
                        onChange={
                          handleAadharBackUpload
                        }
                        accept="image/*"
                        className="hidden"
                        data-testid="input-aadhar-back"
                      />

                      <Button
                        type="button"
                        variant={
                          aadharBackUrl
                            ? "default"
                            : "outline"
                        }
                        className={`h-11 w-full rounded-xl ${
                          aadharBackUrl
                            ? ""
                            : "border-[#DDE7E3] bg-white"
                        }`}
                        onClick={() =>
                          backInputRef.current?.click()
                        }
                        disabled={
                          uploadingBack
                        }
                        data-testid="button-upload-aadhar-back"
                      >
                        {uploadingBack ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t(
                              "profileSetup.uploading",
                              "Uploading..."
                            )}
                          </>
                        ) : aadharBackUrl ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t(
                              "profileSetup.backUploaded",
                              "Back Side Uploaded"
                            )}
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {t(
                              "profileSetup.uploadBack",
                              "Upload Back Side"
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

          {/* ================================================================ */}
          {/* LOCATION                                                         */}
          {/* ONLY THIS SECTION HAS BEEN CHANGED                              */}
          {/* ================================================================ */}

          {((currentStep === 3 &&
            userType === "farmer") ||
            (currentStep === 4 &&
              userType === "associate")) && (
            <section className="animate-in fade-in duration-300">
              <div className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-[0_12px_32px_rgba(31,55,46,0.06)] sm:p-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="location-name"
                    className="text-sm font-semibold text-[#1F372E]"
                  >
                    Location Name
                  </Label>

                  <Input
                    id="location-name"
                    value={locationName}
                    onChange={(e) =>
                      setLocationName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your location name"
                    disabled={
                      !selectedLocation
                    }
                    className="h-12 rounded-xl border-[#DDE7E3] bg-[#FBFCFB] px-4 text-base shadow-none focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="input-location-name"
                  />

                  {detectingLocation && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-[#7C8C85]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />

                      <span>
                        Detecting your location...
                      </span>
                    </div>
                  )}

                  {!detectingLocation &&
                    locationError && (
                      <p className="pt-1 text-xs leading-5 text-[#B45309]">
                        {locationError}
                      </p>
                    )}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* ------------------------------------------------------------------ */}
        {/* NAVIGATION BUTTONS                                                */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-6 flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={
                handlePrevious
              }
              variant="outline"
              className="h-12 w-12 shrink-0 rounded-xl border-[#DDE7E3] bg-white p-0 shadow-none"
              data-testid="button-previous"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {currentStep <
          totalSteps ? (
            <Button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                !canProceed()
              }
              className="h-12 flex-1 rounded-xl shadow-sm"
              data-testid="button-next"
            >
              {t(
                "profileSetup.next"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={
                handleComplete
              }
              disabled={
                !canProceed() ||
                profileMutation.isPending
              }
              className="h-12 flex-1 rounded-xl shadow-sm"
              data-testid="button-complete-setup"
            >
              {profileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {t(
                    "profileSetup.creating"
                  )}
                </>
              ) : (
                <>
                  {t(
                    "profileSetup.submit"
                  )}

                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Profile creation error */}
        {profileMutation.isError && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            We couldn't complete your
            profile setup. Please try
            again.
          </div>
        )}
      </div>
    </div>
  );
}