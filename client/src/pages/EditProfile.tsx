import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  X,
  Upload,
  Check,
  Loader2,
} from "lucide-react";

import { useUser } from "@/lib/userContext";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";

import type { Service } from "@shared/schema";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user, setUser, isLoading } = useUser();
  const { toast } = useToast();
  const { uploadFile } = useUpload();

  /*
   * ---------------------------------------------------------
   * SERVICES / SKILLS
   * ---------------------------------------------------------
   */

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["fyndo-services"],

    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_fyndo_services"
      );

      if (error) {
        console.error(
          "FYNDO services error:",
          error
        );
        throw error;
      }

      console.log(
        "FYNDO services returned:",
        data
      );

      return (data ?? []).map((service: any) => ({
        ...service,

        isActive:
          service.is_active === true ||
          service.is_active === 1 ||
          service.isActive === true ||
          service.isActive === 1,
      })) as Service[];
    },
  });

  const availableSkills = services
    .filter(
      (service) =>
        service.isActive === true
    )
    .map((service) => service.name)
    .filter(Boolean);

  /*
   * ---------------------------------------------------------
   * FORM STATE
   * ---------------------------------------------------------
   */

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phoneNumber || "",
    skills:
      Array.isArray(user?.skills)
        ? [...user.skills]
        : [],
    gender: user?.gender || "",
    dateOfBirth:
      user?.dateOfBirth || "",
    expectedDailySalary:
      user?.expectedDailySalary?.toString() ||
      "",
    travelDistance:
      user?.travelDistance?.toString() ||
      "",
    comfortableStaying:
      user?.comfortableStaying || "",
  });

  /*
   * ---------------------------------------------------------
   * LOCATION
   *
   * Latitude/longitude and location name are intentionally
   * stored separately.
   *
   * selectedLocation = actual GPS coordinates
   * locationName     = editable human-readable name
   * ---------------------------------------------------------
   */

  const [selectedLocation, setSelectedLocation] =
    useState<{
      lat: number;
      lng: number;
    } | null>(
      user?.latitude != null &&
      user?.longitude != null
        ? {
            lat: Number(user.latitude),
            lng: Number(user.longitude),
          }
        : null
    );

  const [locationName, setLocationName] =
    useState(
      user?.location || ""
    );

  /*
   * ---------------------------------------------------------
   * AADHAR
   * ---------------------------------------------------------
   */

  const [aadharFrontUrl, setAadharFrontUrl] =
    useState(
      user?.aadharFrontUrl || ""
    );

  const [aadharBackUrl, setAadharBackUrl] =
    useState(
      user?.aadharBackUrl || ""
    );

  const [uploadingFront, setUploadingFront] =
    useState(false);

  const [uploadingBack, setUploadingBack] =
    useState(false);

  const frontInputRef =
    useRef<HTMLInputElement>(null);

  const backInputRef =
    useRef<HTMLInputElement>(null);

  const [newSkill, setNewSkill] =
    useState("");

  /*
   * ---------------------------------------------------------
   * LOAD USER DATA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      name: user.name || "",
      phone: user.phoneNumber || "",

      skills:
        Array.isArray(user.skills)
          ? [...user.skills]
          : [],

      gender:
        user.gender || "",

      dateOfBirth:
        user.dateOfBirth || "",

      expectedDailySalary:
        user.expectedDailySalary != null
          ? String(
              user.expectedDailySalary
            )
          : "",

      travelDistance:
        user.travelDistance != null
          ? String(
              user.travelDistance
            )
          : "",

      comfortableStaying:
        user.comfortableStaying || "",
    });

    /*
     * Load GPS coordinates independently
     * from the editable location name.
     */
    if (
      user.latitude != null &&
      user.longitude != null
    ) {
      setSelectedLocation({
        lat: Number(user.latitude),
        lng: Number(user.longitude),
      });
    } else {
      setSelectedLocation(null);
    }

    /*
     * Load the saved human-readable location
     * into its own editable state.
     */
    setLocationName(
      user.location || ""
    );

    setAadharFrontUrl(
      user.aadharFrontUrl || ""
    );

    setAadharBackUrl(
      user.aadharBackUrl || ""
    );

    setNewSkill("");
  }, [user]);

  /*
   * ---------------------------------------------------------
   * UPDATE PROFILE
   * ---------------------------------------------------------
   */

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) {
        throw new Error(
          "User ID is missing"
        );
      }

      const skillsToSave =
        Array.isArray(data.skills)
          ? data.skills
          : Array.isArray(user.skills)
            ? user.skills
            : [];

      const latitude =
        data.latitude !== undefined &&
        data.latitude !== null &&
        data.latitude !== ""
          ? Number(data.latitude)
          : user.latitude != null
            ? Number(user.latitude)
            : null;

      const longitude =
        data.longitude !== undefined &&
        data.longitude !== null &&
        data.longitude !== ""
          ? Number(data.longitude)
          : user.longitude != null
            ? Number(user.longitude)
            : null;

      const location =
        data.location !== undefined
          ? data.location
          : user.location ?? null;

      console.log(
        "FYNDO profile update payload:",
        {
          userId: user.id,
          name: data.name,
          userType: user.userType,
          latitude,
          longitude,
          location,
          skills: skillsToSave,
        }
      );

      const {
        data: updatedUser,
        error,
      } = await supabase.rpc(
        "update_fyndo_user",
        {
          p_user_id: user.id,

          p_name: data.name,

          p_user_type:
            user.userType || null,

          /*
           * GPS coordinates remain independent
           * from the manually edited location name.
           */
          p_latitude: latitude,

          p_longitude: longitude,

          /*
           * This is the manually editable
           * human-readable location.
           */
          p_location: location,

          p_skills: skillsToSave,

          p_skill_level:
            user.skillLevel ?? null,

          p_hourly_rate:
            user.hourlyRate ?? null,

          p_gender:
            data.gender !== undefined
              ? data.gender
              : user.gender ?? null,

          p_date_of_birth:
            data.dateOfBirth !== undefined
              ? data.dateOfBirth
              : user.dateOfBirth ?? null,

          p_expected_daily_salary:
            data.expectedDailySalary !==
              undefined &&
            data.expectedDailySalary !== ""
              ? Number(
                  data.expectedDailySalary
                )
              : user.expectedDailySalary ??
                null,

          p_travel_distance:
            data.travelDistance !==
              undefined &&
            data.travelDistance !== ""
              ? Number(
                  data.travelDistance
                )
              : user.travelDistance ??
                null,

          p_comfortable_staying:
            data.comfortableStaying !==
              undefined
              ? data.comfortableStaying
              : user.comfortableStaying ??
                null,

          p_aadhar_front_url:
            data.aadharFrontUrl !==
              undefined
              ? data.aadharFrontUrl
              : user.aadharFrontUrl ??
                null,

          p_aadhar_back_url:
            data.aadharBackUrl !==
              undefined
              ? data.aadharBackUrl
              : user.aadharBackUrl ??
                null,
        }
      );

      if (error) {
        console.error(
          "FYNDO profile update error:",
          error
        );

        throw error;
      }

      console.log(
        "FYNDO profile updated successfully:",
        updatedUser
      );

      return updatedUser;
    },

    onSuccess: (data) => {
      const dbUser =
        Array.isArray(data)
          ? data[0]
          : data;

      if (dbUser) {
        const updatedFrontendUser = {
          ...user!,

          id: dbUser.id,

          phoneNumber:
            dbUser.phone_number ??
            dbUser.phoneNumber ??
            user!.phoneNumber,

          name:
            dbUser.name ?? "",

          userType:
            dbUser.user_type ??
            dbUser.userType ??
            user!.userType,

          /*
           * Make sure the edited location name
           * is reflected immediately in the
           * frontend user context.
           */
          location:
            dbUser.location ?? null,

          latitude:
            dbUser.latitude ?? null,

          longitude:
            dbUser.longitude ?? null,

          skills:
            Array.isArray(dbUser.skills)
              ? dbUser.skills
              : [],

          skillLevel:
            dbUser.skill_level ??
            dbUser.skillLevel ??
            null,

          hourlyRate:
            dbUser.hourly_rate ??
            dbUser.hourlyRate ??
            null,

          gender:
            dbUser.gender ?? null,

          dateOfBirth:
            dbUser.date_of_birth ??
            dbUser.dateOfBirth ??
            null,

          expectedDailySalary:
            dbUser.expected_daily_salary ??
            dbUser.expectedDailySalary ??
            null,

          travelDistance:
            dbUser.travel_distance ??
            dbUser.travelDistance ??
            null,

          comfortableStaying:
            dbUser.comfortable_staying ??
            dbUser.comfortableStaying ??
            null,

          aadharFrontUrl:
            dbUser.aadhar_front_url ??
            dbUser.aadharFrontUrl ??
            null,

          aadharBackUrl:
            dbUser.aadhar_back_url ??
            dbUser.aadharBackUrl ??
            null,

          averageRating:
            dbUser.average_rating ??
            dbUser.averageRating ??
            null,

          totalRatings:
            dbUser.total_ratings ??
            dbUser.totalRatings ??
            0,

          jobsCompleted:
            dbUser.jobs_completed ??
            dbUser.jobsCompleted ??
            0,

          totalEarnings:
            dbUser.total_earnings ??
            dbUser.totalEarnings ??
            0,

          pendingPayments:
            dbUser.pending_payments ??
            dbUser.pendingPayments ??
            0,

          createdAt:
            dbUser.created_at ??
            dbUser.createdAt ??
            null,
        };

        console.log(
          "FYNDO frontend user after update:",
          updatedFrontendUser
        );

        setUser(
          updatedFrontendUser
        );
      }

      queryClient.invalidateQueries({
        queryKey: [
          "user",
          user?.id,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "fyndo-services",
        ],
      });

      setLocation("/profile");
    },

    onError: (error: any) => {
      console.error(
        "FYNDO profile update failed:",
        error
      );

      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to update profile",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  /*
   * ---------------------------------------------------------
   * SKILL HANDLERS
   * ---------------------------------------------------------
   */

  const addSkill = (skill: string) => {
    if (!skill) {
      return;
    }

    setFormData((previous) => {
      if (
        previous.skills.includes(
          skill
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        skills: [
          ...previous.skills,
          skill,
        ],
      };
    });

    setNewSkill("");
  };

  const removeSkill = (
    skill: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      skills:
        previous.skills.filter(
          (existingSkill) =>
            existingSkill !== skill
        ),
    }));
  };

  /*
   * ---------------------------------------------------------
   * AADHAR UPLOAD
   * ---------------------------------------------------------
   */

  const handleAadharFrontUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingFront(true);

      try {
        const response =
          await uploadFile(file);

        if (response) {
          setAadharFrontUrl(
            response.objectPath
          );
        }
      } catch (error) {
        console.error(
          "Aadhar front upload failed:",
          error
        );

        toast({
          title: "Upload Failed",
          description:
            "Failed to upload Aadhar front image",
          variant: "destructive",
        });
      } finally {
        setUploadingFront(false);
        e.target.value = "";
      }
    };

  const handleAadharBackUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingBack(true);

      try {
        const response =
          await uploadFile(file);

        if (response) {
          setAadharBackUrl(
            response.objectPath
          );
        }
      } catch (error) {
        console.error(
          "Aadhar back upload failed:",
          error
        );

        toast({
          title: "Upload Failed",
          description:
            "Failed to upload Aadhar back image",
          variant: "destructive",
        });
      } finally {
        setUploadingBack(false);
        e.target.value = "";
      }
    };

  /*
   * ---------------------------------------------------------
   * SAVE
   * ---------------------------------------------------------
   */

  const handleSave = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description:
          "User information not available",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description:
          "Name is required",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }

    if (!locationName.trim()) {
      toast({
        title: "Error",
        description:
          "Location name is required",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }

    const isAssociate =
      user.userType?.toLowerCase() ===
      "associate";

    const updates: any = {
      name:
        formData.name.trim(),

      skills: [
        ...formData.skills,
      ],

      /*
       * Always save the manually edited
       * location name separately.
       */
      location:
        locationName.trim(),
    };

    /*
     * Preserve the existing GPS coordinates.
     *
     * Editing locationName does NOT change
     * latitude/longitude.
     */
    if (selectedLocation) {
      updates.latitude =
        Number(
          selectedLocation.lat
        );

      updates.longitude =
        Number(
          selectedLocation.lng
        );
    }

    if (isAssociate) {
      if (
        !aadharFrontUrl ||
        !aadharBackUrl
      ) {
        toast({
          title: "Error",
          description:
            "Both Aadhar front and back images are required",
          variant: "destructive",
          duration: 3000,
        });

        return;
      }

      updates.skills = [
        ...formData.skills,
      ];

      updates.gender =
        formData.gender || null;

      updates.dateOfBirth =
        formData.dateOfBirth ||
        null;

      updates.expectedDailySalary =
        formData.expectedDailySalary
          ? Number(
              formData.expectedDailySalary
            )
          : null;

      updates.travelDistance =
        formData.travelDistance
          ? Number(
              formData.travelDistance
            )
          : null;

      updates.comfortableStaying =
        formData.comfortableStaying ||
        null;

      updates.aadharFrontUrl =
        aadharFrontUrl || null;

      updates.aadharBackUrl =
        aadharBackUrl || null;
    }

    console.log(
      "FYNDO handleSave updates:",
      updates
    );

    updateProfileMutation.mutate(
      updates
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING / NO USER
   * ---------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCF7]">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCF7]">
        <p className="text-muted-foreground">
          Please log in to edit your
          profile
        </p>
      </div>
    );
  }

  const isAssociate =
    user.userType?.toLowerCase() ===
    "associate";

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-24">
      <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-5 sm:py-6">

        {/* =====================================================
            PAGE TITLE
            ===================================================== */}

        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold text-[#1F372E]">
            Edit Profile
          </h1>

          <p className="mt-1 text-sm text-[#71827B]">
            Update your profile information.
          </p>
        </div>

        <div className="space-y-4">

          {/* =================================================
              PERSONAL INFORMATION
              ================================================= */}

          <Card className="overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

            <CardHeader className="border-b border-[#E7ECEA] px-5 py-5 sm:px-6">

              <CardTitle className="font-display text-xl font-bold text-[#1F372E]">
                Personal Information
              </CardTitle>

              <p className="mt-1 text-sm text-[#71827B]">
                Keep your profile details
                up to date.
              </p>

            </CardHeader>

            <CardContent className="space-y-5 px-5 py-5 sm:px-6">

              {/* Name */}

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="font-medium text-[#314B41]"
                >
                  Full Name
                </Label>

                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        name:
                          e.target.value,
                      })
                    )
                  }
                  className="h-11 rounded-xl border-[#D7E2DE] bg-white focus-visible:ring-[#2D8068]"
                  data-testid="input-name"
                />
              </div>

              {/* Phone */}

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-medium text-[#314B41]"
                >
                  Phone Number
                </Label>

                <Input
                  id="phone"
                  value={formData.phone}
                  disabled
                  className="h-11 rounded-xl border-[#D7E2DE] bg-[#F7F9F8] text-[#687A73]"
                  data-testid="input-phone"
                />

                <p className="text-xs text-[#7A8A84]">
                  Contact support to change
                  your phone number
                </p>
              </div>

              {/* Associate Fields */}

              {isAssociate && (
                <>

                  {/* Gender */}

                  <div className="space-y-2">
                    <Label className="font-medium text-[#314B41]">
                      Gender
                    </Label>

                    <RadioGroup
                      value={
                        formData.gender
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            gender:
                              value,
                          })
                        )
                      }
                      className="flex flex-wrap gap-x-5 gap-y-3 pt-1"
                      data-testid="radio-gender"
                    >

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="male"
                          id="edit-male"
                          data-testid="radio-gender-male"
                        />

                        <Label
                          htmlFor="edit-male"
                          className="cursor-pointer font-normal"
                        >
                          Male
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="female"
                          id="edit-female"
                          data-testid="radio-gender-female"
                        />

                        <Label
                          htmlFor="edit-female"
                          className="cursor-pointer font-normal"
                        >
                          Female
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="other"
                          id="edit-other"
                          data-testid="radio-gender-other"
                        />

                        <Label
                          htmlFor="edit-other"
                          className="cursor-pointer font-normal"
                        >
                          Other
                        </Label>
                      </div>

                    </RadioGroup>
                  </div>

                  {/* DOB */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="dob"
                      className="font-medium text-[#314B41]"
                    >
                      Date of Birth
                    </Label>

                    <Input
                      id="dob"
                      type="date"
                      value={
                        formData.dateOfBirth
                      }
                      onChange={(e) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            dateOfBirth:
                              e.target.value,
                          })
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
                      className="h-11 rounded-xl border-[#D7E2DE] bg-white focus-visible:ring-[#2D8068]"
                      data-testid="input-dob"
                    />
                  </div>

                  {/* Salary */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="salary"
                      className="font-medium text-[#314B41]"
                    >
                      Expected Daily Salary
                      (Rs.)
                    </Label>

                    <Input
                      id="salary"
                      type="number"
                      value={
                        formData.expectedDailySalary
                      }
                      onChange={(e) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            expectedDailySalary:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Enter expected daily salary"
                      className="h-11 rounded-xl border-[#D7E2DE] bg-white focus-visible:ring-[#2D8068]"
                      data-testid="input-salary"
                    />
                  </div>

                  {/* Travel Distance */}

                  <div className="space-y-2">
                    <Label className="font-medium text-[#314B41]">
                      Travel Distance (km)
                    </Label>

                    <Select
                      value={
                        formData.travelDistance
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            travelDistance:
                              value,
                          })
                        )
                      }
                    >
                      <SelectTrigger
                        className="h-11 rounded-xl border-[#D7E2DE] bg-white"
                        data-testid="select-travel-distance"
                      >
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="5">
                          Up to 5 km
                        </SelectItem>

                        <SelectItem value="10">
                          Up to 10 km
                        </SelectItem>

                        <SelectItem value="20">
                          Up to 20 km
                        </SelectItem>

                        <SelectItem value="50">
                          Up to 50 km
                        </SelectItem>

                        <SelectItem value="100">
                          Up to 100 km
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Staying */}

                  <div className="space-y-2">
                    <Label className="font-medium text-[#314B41]">
                      Comfortable Staying
                      at Farm?
                    </Label>

                    <Select
                      value={
                        formData.comfortableStaying
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            comfortableStaying:
                              value,
                          })
                        )
                      }
                    >
                      <SelectTrigger
                        className="h-11 rounded-xl border-[#D7E2DE] bg-white"
                        data-testid="select-comfortable-staying"
                      >
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="yes">
                          Yes
                        </SelectItem>

                        <SelectItem value="no">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </>
              )}

            </CardContent>
          </Card>

          {/* =================================================
              SKILLS
              ================================================= */}

          {isAssociate && (
            <Card className="overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

              <CardHeader className="border-b border-[#E7ECEA] px-5 py-5 sm:px-6">

                <CardTitle className="font-display text-xl font-bold text-[#1F372E]">
                  Skills & Expertise
                </CardTitle>

                <p className="mt-1 text-sm text-[#71827B]">
                  Add the services you are
                  comfortable providing.
                </p>

              </CardHeader>

              <CardContent className="space-y-4 px-5 py-5 sm:px-6">

                <div className="space-y-3">

                  <Label className="font-medium text-[#314B41]">
                    Your Skills
                  </Label>

                  <div className="flex min-h-[36px] flex-wrap gap-2">

                    {formData.skills.length > 0 ? (
                      formData.skills.map(
                        (skill) => (
                          <Badge
                            key={skill}
                            className="gap-1 rounded-full border border-[#B9D9CE] bg-[#EAF5F0] px-3 py-1.5 text-[#23614F] hover:bg-[#EAF5F0]"
                            data-testid={`badge-skill-${skill}`}
                          >
                            {skill}

                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(
                                  skill
                                )
                              }
                              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-[#D5EAE2]"
                              aria-label={`Remove ${skill}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-sm text-[#7A8A84]">
                        No skills selected
                      </p>
                    )}

                  </div>

                  <Select
                    value={newSkill}
                    onValueChange={
                      addSkill
                    }
                  >
                    <SelectTrigger
                      className="h-11 rounded-xl border-[#D7E2DE] bg-white"
                      data-testid="select-add-skill"
                    >
                      <SelectValue placeholder="Add a skill" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableSkills.length >
                      0 ? (
                        availableSkills
                          .filter(
                            (skill) =>
                              !formData.skills.includes(
                                skill
                              )
                          )
                          .map(
                            (skill) => (
                              <SelectItem
                                key={
                                  skill
                                }
                                value={
                                  skill
                                }
                              >
                                {skill}
                              </SelectItem>
                            )
                          )
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No active skills
                          available
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {availableSkills.length ===
                    0 && (
                    <p className="text-xs text-destructive">
                      No active FYNDO
                      services were
                      returned.
                    </p>
                  )}

                </div>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              AADHAR
              ================================================= */}

          {isAssociate && (
            <Card className="overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

              <CardHeader className="border-b border-[#E7ECEA] px-5 py-5 sm:px-6">

                <CardTitle className="font-display text-xl font-bold text-[#1F372E]">
                  KYC Documents - Aadhar Card
                </CardTitle>

                <p className="mt-1 text-sm text-[#71827B]">
                  Keep both sides of your
                  Aadhar card uploaded.
                </p>

              </CardHeader>

              <CardContent className="space-y-4 px-5 py-5 sm:px-6">

                {/* Front */}

                <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-4">

                  <div className="mb-3">
                    <Label className="font-medium text-[#314B41]">
                      Aadhar Front Side
                    </Label>
                  </div>

                  <input
                    type="file"
                    ref={frontInputRef}
                    onChange={
                      handleAadharFrontUpload
                    }
                    accept="image/*"
                    className="hidden"
                    data-testid="input-aadhar-front-file"
                  />

                  <Button
                    type="button"
                    variant={
                      aadharFrontUrl
                        ? "default"
                        : "outline"
                    }
                    className="h-11 w-full rounded-xl"
                    onClick={() =>
                      frontInputRef.current?.click()
                    }
                    disabled={
                      uploadingFront
                    }
                    data-testid="button-aadhar-front"
                  >
                    {uploadingFront ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : aadharFrontUrl ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Uploaded (Click to Replace)
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Front Side
                      </>
                    )}
                  </Button>

                </div>

                {/* Back */}

                <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-4">

                  <div className="mb-3">
                    <Label className="font-medium text-[#314B41]">
                      Aadhar Back Side
                    </Label>
                  </div>

                  <input
                    type="file"
                    ref={backInputRef}
                    onChange={
                      handleAadharBackUpload
                    }
                    accept="image/*"
                    className="hidden"
                    data-testid="input-aadhar-back-file"
                  />

                  <Button
                    type="button"
                    variant={
                      aadharBackUrl
                        ? "default"
                        : "outline"
                    }
                    className="h-11 w-full rounded-xl"
                    onClick={() =>
                      backInputRef.current?.click()
                    }
                    disabled={
                      uploadingBack
                    }
                    data-testid="button-aadhar-back"
                  >
                    {uploadingBack ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : aadharBackUrl ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Uploaded (Click to Replace)
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Back Side
                      </>
                    )}
                  </Button>

                </div>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              LOCATION
              ================================================= */}

          <Card className="overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

            <CardHeader className="border-b border-[#E7ECEA] px-5 py-5 sm:px-6">

              <CardTitle className="font-display text-xl font-bold text-[#1F372E]">
                Location
              </CardTitle>

              <p className="mt-1 text-sm text-[#71827B]">
                Update your current location
                so FYNDO can show relevant
                opportunities and services.
              </p>

            </CardHeader>

            <CardContent className="px-5 py-5 sm:px-6">

              <div className="space-y-3">

                <Label
                  htmlFor="location-name"
                  className="font-medium text-[#314B41]"
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
                  disabled={!selectedLocation}
                  className="h-11 rounded-xl border-[#D7E2DE] bg-white focus-visible:ring-[#2D8068] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="input-location-name"
                />

            

              </div>

            </CardContent>
          </Card>

          {/* =================================================
              SAVE
              ================================================= */}

          <div className="sticky bottom-0 z-30 -mx-4 border-t border-[#DDE7E3] bg-[#FDFCF7]/95 px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-5 sm:px-5">

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                updateProfileMutation.isPending ||
                uploadingFront ||
                uploadingBack
              }
              className="h-12 w-full rounded-xl bg-[#28745F] text-base font-semibold text-white shadow-[0_8px_20px_rgba(40,116,95,0.18)] transition-all hover:bg-[#236651] hover:shadow-[0_10px_24px_rgba(40,116,95,0.22)]"
              data-testid="button-save"
            >
              {updateProfileMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

        </div>

      </main>
    </div>
  );
}