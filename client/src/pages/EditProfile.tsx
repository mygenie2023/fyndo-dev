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
  ArrowLeft,
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
import LocationPicker from "@/components/LocationPicker";

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
      const { data, error } = await supabase.rpc("get_fyndo_services");

      if (error) {
        console.error("FYNDO services error:", error);
        throw error;
      }

      console.log("FYNDO services returned:", data);

      return (data ?? []).map((service: any) => ({
        ...service,

        // Handle both possible Supabase values:
        // true / false
        // 1 / 0
        isActive:
          service.is_active === true ||
          service.is_active === 1 ||
          service.isActive === true ||
          service.isActive === 1,
      })) as Service[];
    },
  });

  /*
   * Only active services should appear in the dropdown.
   *
   * This intentionally does NOT depend on formData.skills.
   * Therefore, even if the Associate has ZERO selected skills,
   * all active skills remain available for selection.
   */
  const availableSkills = services
    .filter((service) => service.isActive === true)
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
    skills: Array.isArray(user?.skills)
      ? [...user.skills]
      : [],
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth || "",
    expectedDailySalary:
      user?.expectedDailySalary?.toString() || "",
    travelDistance:
      user?.travelDistance?.toString() || "",
    comfortableStaying:
      user?.comfortableStaying || "",
  });

  const [selectedLocation, setSelectedLocation] =
    useState<any>(
      user?.latitude != null &&
      user?.longitude != null
        ? {
            lat: Number(user.latitude),
            lng: Number(user.longitude),
            address: user.location || "",
          }
        : null
    );

  const [aadharFrontUrl, setAadharFrontUrl] =
    useState(user?.aadharFrontUrl || "");

  const [aadharBackUrl, setAadharBackUrl] =
    useState(user?.aadharBackUrl || "");

  const [uploadingFront, setUploadingFront] =
    useState(false);

  const [uploadingBack, setUploadingBack] =
    useState(false);

  const frontInputRef =
    useRef<HTMLInputElement>(null);

  const backInputRef =
    useRef<HTMLInputElement>(null);

  const [newSkill, setNewSkill] = useState("");

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

      // IMPORTANT:
      // Preserve an intentionally empty skills array.
      skills: Array.isArray(user.skills)
        ? [...user.skills]
        : [],

      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || "",

      expectedDailySalary:
        user.expectedDailySalary != null
          ? String(user.expectedDailySalary)
          : "",

      travelDistance:
        user.travelDistance != null
          ? String(user.travelDistance)
          : "",

      comfortableStaying:
        user.comfortableStaying || "",
    });

    if (
      user.latitude != null &&
      user.longitude != null
    ) {
      setSelectedLocation({
        lat: Number(user.latitude),
        lng: Number(user.longitude),
        address: user.location || "",
      });
    } else {
      setSelectedLocation(null);
    }

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
        throw new Error("User ID is missing");
      }

      /*
       * IMPORTANT:
       *
       * data.skills may intentionally be [].
       *
       * Do NOT use:
       *
       * data.skills || user.skills
       *
       * because [] is truthy in JS, but explicit handling
       * here makes the intent clear.
       */
      const skillsToSave = Array.isArray(data.skills)
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

      console.log("FYNDO profile update payload:", {
        userId: user.id,
        name: data.name,
        userType: user.userType,
        latitude,
        longitude,
        location,
        skills: skillsToSave,
      });

      const { data: updatedUser, error } =
        await supabase.rpc(
          "update_fyndo_user",
          {
            p_user_id: user.id,

            p_name: data.name,

            p_user_type:
              user.userType || null,

            p_latitude: latitude,

            p_longitude: longitude,

            p_location: location,

            /*
             * This is the important part.
             *
             * [] is deliberately sent to Supabase when
             * the Associate removed all skills.
             */
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
              data.expectedDailySalary !== undefined &&
              data.expectedDailySalary !== ""
                ? Number(data.expectedDailySalary)
                : user.expectedDailySalary ?? null,

            p_travel_distance:
              data.travelDistance !== undefined &&
              data.travelDistance !== ""
                ? Number(data.travelDistance)
                : user.travelDistance ?? null,

            p_comfortable_staying:
              data.comfortableStaying !== undefined
                ? data.comfortableStaying
                : user.comfortableStaying ?? null,

            p_aadhar_front_url:
              data.aadharFrontUrl !== undefined
                ? data.aadharFrontUrl
                : user.aadharFrontUrl ?? null,

            p_aadhar_back_url:
              data.aadharBackUrl !== undefined
                ? data.aadharBackUrl
                : user.aadharBackUrl ?? null,
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
        /*
         * Convert Supabase snake_case data into
         * the frontend camelCase User object.
         */
        const updatedFrontendUser = {
          ...user!,

          id: dbUser.id,

          phoneNumber:
            dbUser.phone_number ??
            dbUser.phoneNumber ??
            user!.phoneNumber,

          name:
            dbUser.name ??
            "",

          userType:
            dbUser.user_type ??
            dbUser.userType ??
            user!.userType,

          location:
            dbUser.location ??
            null,

          latitude:
            dbUser.latitude ??
            null,

          longitude:
            dbUser.longitude ??
            null,

          /*
           * IMPORTANT:
           *
           * If Supabase returns [],
           * we MUST keep [].
           *
           * Do not fall back to user.skills.
           */
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
            dbUser.gender ??
            null,

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

        setUser(updatedFrontendUser);
      }

      queryClient.invalidateQueries({
        queryKey: ["user", user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["fyndo-services"],
      });

      toast({
        title: "Profile Updated",
        description:
          "Your profile has been updated successfully",
        duration: 3000,
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
      if (previous.skills.includes(skill)) {
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

  const removeSkill = (skill: string) => {
    setFormData((previous) => ({
      ...previous,

      /*
       * If this is the last skill,
       * this correctly becomes [].
       */
      skills: previous.skills.filter(
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

  const handleAadharFrontUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

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

      /*
       * Allow selecting the same file again.
       */
      e.target.value = "";
    }
  };

  const handleAadharBackUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

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

      /*
       * Allow selecting the same file again.
       */
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
        description: "Name is required",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }

    const isAssociate =
      user.userType?.toLowerCase() ===
      "associate";

    /*
     * Base profile data.
     */
    const updates: any = {
      name: formData.name.trim(),

      /*
       * Always send skills explicitly.
       *
       * This is critical for the case where the user
       * removes ALL skills.
       */
      skills: [...formData.skills],
    };

    /*
     * Location
     */
    if (selectedLocation) {
      updates.latitude =
        Number(selectedLocation.lat);

      updates.longitude =
        Number(selectedLocation.lng);

      updates.location =
        selectedLocation.address || "";
    }

    /*
     * Associate-specific fields
     */
    if (isAssociate) {
      /*
       * IMPORTANT:
       *
       * There is NO "at least one skill" validation.
       *
       * [] is a valid value.
       */

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
        formData.dateOfBirth || null;

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to edit your profile
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
    <div className="min-h-screen bg-background pb-20">

      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 h-14 flex items-center">

        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            setLocation("/profile")
          }
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-xl font-bold ml-2">
          Edit Profile
        </h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">

        {/* ------------------------------------------------ */}
        {/* PERSONAL INFORMATION */}
        {/* ------------------------------------------------ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name
              </Label>

              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      name: e.target.value,
                    })
                  )
                }
                data-testid="input-name"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number
              </Label>

              <Input
                id="phone"
                value={formData.phone}
                disabled
                data-testid="input-phone"
              />

              <p className="text-xs text-muted-foreground">
                Contact support to change your
                phone number
              </p>
            </div>

            {/* Associate Fields */}
            {isAssociate && (
              <>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>
                    Gender
                  </Label>

                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          gender: value,
                        })
                      )
                    }
                    className="flex gap-4"
                    data-testid="radio-gender"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="male"
                        id="edit-male"
                        data-testid="radio-gender-male"
                      />
                      <Label htmlFor="edit-male">
                        Male
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="female"
                        id="edit-female"
                        data-testid="radio-gender-female"
                      />
                      <Label htmlFor="edit-female">
                        Female
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="other"
                        id="edit-other"
                        data-testid="radio-gender-other"
                      />
                      <Label htmlFor="edit-other">
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* DOB */}
                <div className="space-y-2">
                  <Label htmlFor="dob">
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
                    data-testid="input-dob"
                  />
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <Label htmlFor="salary">
                    Expected Daily Salary (Rs.)
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
                    data-testid="input-salary"
                  />
                </div>

                {/* Travel Distance */}
                <div className="space-y-2">
                  <Label>
                    Travel Distance (km)
                  </Label>

                  <Select
                    value={
                      formData.travelDistance
                    }
                    onValueChange={(value) =>
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
                  <Label>
                    Comfortable Staying at Farm?
                  </Label>

                  <Select
                    value={
                      formData.comfortableStaying
                    }
                    onValueChange={(value) =>
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

        {/* ------------------------------------------------ */}
        {/* SKILLS */}
        {/* ------------------------------------------------ */}

        {isAssociate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Skills & Expertise
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="space-y-2">

                <Label>
                  Your Skills
                </Label>

                {/* Selected skills */}
                <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">

                  {formData.skills.length > 0 ? (
                    formData.skills.map(
                      (skill) => (
                        <Badge
                          key={skill}
                          className="gap-1"
                          data-testid={`badge-skill-${skill}`}
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(skill)
                            }
                            className="ml-1 hover-elevate rounded-full"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills selected
                    </p>
                  )}

                </div>

                {/* Add skill */}
                <Select
                  value={newSkill}
                  onValueChange={addSkill}
                >
                  <SelectTrigger
                    data-testid="select-add-skill"
                  >
                    <SelectValue placeholder="Add a skill" />
                  </SelectTrigger>

                  <SelectContent>

                    {availableSkills.length > 0 ? (
                      availableSkills
                        .filter(
                          (skill) =>
                            !formData.skills.includes(
                              skill
                            )
                        )
                        .map((skill) => (
                          <SelectItem
                            key={skill}
                            value={skill}
                          >
                            {skill}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No active skills available
                      </div>
                    )}

                  </SelectContent>
                </Select>

                {/* Debug information during migration */}
                {availableSkills.length === 0 && (
                  <p className="text-xs text-destructive">
                    No active FYNDO services were returned.
                  </p>
                )}

              </div>

            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------ */}
        {/* AADHAR */}
        {/* ------------------------------------------------ */}

        {isAssociate && (
          <Card>
            <CardHeader>
              <CardTitle>
                KYC Documents - Aadhar Card
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Front */}
              <div className="space-y-2">

                <Label>
                  Aadhar Front Side
                </Label>

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
                  className="w-full"
                  onClick={() =>
                    frontInputRef.current?.click()
                  }
                  disabled={uploadingFront}
                  data-testid="button-aadhar-front"
                >
                  {uploadingFront ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : aadharFrontUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Front Side Uploaded
                      (Click to Replace)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Front Side
                    </>
                  )}
                </Button>

              </div>

              {/* Back */}
              <div className="space-y-2">

                <Label>
                  Aadhar Back Side
                </Label>

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
                  className="w-full"
                  onClick={() =>
                    backInputRef.current?.click()
                  }
                  disabled={uploadingBack}
                  data-testid="button-aadhar-back"
                >
                  {uploadingBack ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : aadharBackUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Back Side Uploaded
                      (Click to Replace)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Back Side
                    </>
                  )}
                </Button>

              </div>

            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------ */}
        {/* LOCATION */}
        {/* ------------------------------------------------ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Location
            </CardTitle>
          </CardHeader>

          <CardContent>
            <LocationPicker
              onLocationSelect={(location) =>
                setSelectedLocation(location)
              }
              currentLocation={
                selectedLocation || undefined
              }
            />
          </CardContent>
        </Card>

        {/* ------------------------------------------------ */}
        {/* SAVE */}
        {/* ------------------------------------------------ */}

        <div className="sticky bottom-0 bg-background pt-4">

          <Button
            type="button"
            onClick={handleSave}
            disabled={
              updateProfileMutation.isPending ||
              uploadingFront ||
              uploadingBack
            }
            className="w-full h-12"
            data-testid="button-save"
          >
            {updateProfileMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </div>

      </div>
    </div>
  );
}