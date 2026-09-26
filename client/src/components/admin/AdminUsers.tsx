import { useState, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation } from "wouter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Eye,
  Plus,
  Pencil,
  Upload,
  Check,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/utils";

import type { User } from "@shared/schema";

import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";

/*
 * ============================================================================
 * Types
 * ============================================================================
 */

type AdminUser = User & {
  activeJobs: number | null;
  completedJobs: number;
};

/*
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const [, setLocation] = useLocation();

  const { toast } = useToast();

  /*
   * ==========================================================================
   * Dialog State
   * ==========================================================================
   */

  const [showAddUser, setShowAddUser] = useState(false);

  const [showEditUser, setShowEditUser] = useState(false);

  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  /*
   * ==========================================================================
   * Search
   * ==========================================================================
   */

  const [searchTerm, setSearchTerm] = useState("");

  /*
   * ==========================================================================
   * Edit Form
   * ==========================================================================
   */

  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    location: "",
    latitude: "",
    longitude: "",
    gender: "",
    dateOfBirth: "",
    expectedDailySalary: "",
    travelDistance: "",
    comfortableStaying: "",
  });

  /*
   * ==========================================================================
   * Aadhaar State
   * ==========================================================================
   */

  const [editAadharFrontUrl, setEditAadharFrontUrl] =
    useState("");

  const [editAadharBackUrl, setEditAadharBackUrl] =
    useState("");

  /*
   * ==========================================================================
   * Upload State
   * ==========================================================================
   */

  const [uploadingEditFront, setUploadingEditFront] =
    useState(false);

  const [uploadingEditBack, setUploadingEditBack] =
    useState(false);

  const editFrontInputRef =
    useRef<HTMLInputElement>(null);

  const editBackInputRef =
    useRef<HTMLInputElement>(null);

  const { uploadFile } = useUpload();

  /*
   * ==========================================================================
   * New User
   * ==========================================================================
   */

  const [newUser, setNewUser] = useState({
    name: "",
    phoneNumber: "",
    userType: "Farmer" as
      | "Farmer"
      | "Associate",
    location: "",
  });

  /*
   * ==========================================================================
   * Load Users
   * ==========================================================================
   */

  const {
    data: users = [],
    isLoading,
  } = useQuery<AdminUser[]>({
    queryKey: [
      "admin",
      "users",
    ],

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_all_users_with_active_jobs",
      );

      if (error) {
        console.error(
          "Failed to load admin users:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      return (data ?? []).map(
        (row: any) => {
          const user =
            row.user_data || {};

          const userType =
            String(
              user.user_type || "",
            );

          return {
            ...user,

            /*
             * Database snake_case
             * -> frontend camelCase
             */

            phoneNumber:
              user.phone_number,

            userType:
              user.user_type,

            dateOfBirth:
              user.date_of_birth,

            skillLevel:
              user.skill_level,

            hourlyRate:
              user.hourly_rate,

            expectedDailySalary:
              user.expected_daily_salary,

            travelDistance:
              user.travel_distance,

            comfortableStaying:
              user.comfortable_staying,

            aadharFrontUrl:
              user.aadhar_front_url,

            aadharBackUrl:
              user.aadhar_back_url,

            averageRating:
              user.average_rating,

            totalRatings:
              user.total_ratings,

            jobsCompleted:
              user.jobs_completed,

            totalEarnings:
              user.total_earnings,

            pendingPayments:
              user.pending_payments,

            createdAt:
              user.created_at,

            /*
             * Latitude / Longitude
             *
             * Keep the original DB values available
             * to the edit form.
             */

            latitude:
              user.latitude,

            longitude:
              user.longitude,

            /*
             * Active jobs
             *
             * Farmer -> actual count
             * Associate -> N/A
             */

            activeJobs:
              userType.toLowerCase() ===
              "farmer"
                ? Number(
                    row.active_jobs ?? 0,
                  )
                : null,

            /*
             * Completed jobs
             *
             * Both Farmer and Associate
             * receive the value from the
             * database function.
             */

            completedJobs:
              Number(
                row.completed_jobs ?? 0,
              ),
          } as AdminUser;
        },
      );
    },
  });

  /*
   * ==========================================================================
   * Search
   * ==========================================================================
   */

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  const filteredUsers =
    normalizedSearch === ""
      ? users
      : users.filter(
          (user) => {
            const searchableValues = [
              user.name,
              user.phoneNumber,
              user.userType,
              user.location,
              user.latitude,
              user.longitude,
              user.gender,
              user.dateOfBirth,
              user.skillLevel,
              user.hourlyRate,
              user.expectedDailySalary,
              user.travelDistance,
              user.comfortableStaying,
              user.averageRating,
              user.totalRatings,
              user.jobsCompleted,
              user.totalEarnings,
              user.pendingPayments,
              user.activeJobs,
              user.completedJobs,

              ...(Array.isArray(
                user.skills,
              )
                ? user.skills
                : []),
            ];

            return searchableValues
              .filter(
                (value) =>
                  value !== null &&
                  value !== undefined,
              )
              .some(
                (value) =>
                  String(value)
                    .toLowerCase()
                    .includes(
                      normalizedSearch,
                    ),
              );
          },
        );

  /*
   * ==========================================================================
   * Add User
   * ==========================================================================
   */

  const addUserMutation =
    useMutation({
      mutationFn:
        async (
          userData: {
            name: string;
            phoneNumber: string;
            userType: string;
            location: string;
          },
        ) => {
          const {
            data,
            error,
          } =
            await supabase.rpc(
              "admin_create_user",
              {
                p_phone_number:
                  userData.phoneNumber,

                p_name:
                  userData.name,

                p_user_type:
                  userData.userType,

                p_location:
                  userData.location ||
                  null,
              },
            );

          if (error) {
            console.error(
              "Failed to create user:",
              error,
            );

            throw new Error(
              error.message,
            );
          }

          return data;
        },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "users",
          ],
        });

        toast({
          title:
            "User created",

          description:
            "The user has been created successfully.",
        });

        setShowAddUser(false);

        setNewUser({
          name: "",
          phoneNumber: "",
          userType:
            "Farmer",
          location: "",
        });
      },

      onError: (
        error: Error,
      ) => {
        toast({
          title:
            "Failed to create user",

          description:
            error.message,

          variant:
            "destructive",
        });
      },
    });

  /*
   * ==========================================================================
   * Edit User
   * ==========================================================================
   */

  const editUserMutation =
    useMutation({
      mutationFn:
        async (
          user: AdminUser,
        ) => {
          /*
           * ================================================================
           * Validate latitude
           * ================================================================
           */

          const latitudeText =
            editForm.latitude.trim();

          const longitudeText =
            editForm.longitude.trim();

          const latitude =
            latitudeText !== ""
              ? Number(latitudeText)
              : null;

          const longitude =
            longitudeText !== ""
              ? Number(longitudeText)
              : null;

          if (
            latitude !== null &&
            (!Number.isFinite(latitude) ||
              latitude < -90 ||
              latitude > 90)
          ) {
            throw new Error(
              "Latitude must be a number between -90 and 90.",
            );
          }

          if (
            longitude !== null &&
            (!Number.isFinite(longitude) ||
              longitude < -180 ||
              longitude > 180)
          ) {
            throw new Error(
              "Longitude must be a number between -180 and 180.",
            );
          }

          /*
           * ================================================================
           * Validate that latitude and longitude are supplied together
           * ================================================================
           */

          if (
            (latitude !== null &&
              longitude === null) ||
            (latitude === null &&
              longitude !== null)
          ) {
            throw new Error(
              "Please enter both latitude and longitude.",
            );
          }

          const expectedDailySalary =
            editForm.expectedDailySalary.trim() !==
            ""
              ? Number(
                  editForm.expectedDailySalary,
                )
              : null;

          const travelDistance =
            editForm.travelDistance.trim() !==
            ""
              ? Number(
                  editForm.travelDistance,
                )
              : null;

          /*
           * ================================================================
           * 1. Update profile
           * ================================================================
           */

          const {
            data,
            error,
          } =
            await supabase.rpc(
              "update_fyndo_user",
              {
                p_user_id:
                  user.id,

                p_name:
                  editForm.name.trim(),

                p_user_type:
                  user.userType,

                /*
                 * IMPORTANT:
                 * Use the values entered by Admin rather than
                 * the original values stored in the user object.
                 */
                p_latitude:
                  latitude !== null
                    ? latitude
                    : 0,

                p_longitude:
                  longitude !== null
                    ? longitude
                    : 0,

                p_location:
                  editForm.location.trim() ||
                  null,

                p_skills:
                  user.skills ?? [],

                p_skill_level:
                  user.skillLevel ||
                  null,

                p_hourly_rate:
                  user.hourlyRate !==
                    null &&
                  user.hourlyRate !==
                    undefined
                    ? Number(
                        user.hourlyRate,
                      )
                    : null,

                p_gender:
                  editForm.gender.trim() !==
                  ""
                    ? editForm.gender
                    : user.gender ||
                      null,

                p_date_of_birth:
                  editForm.dateOfBirth.trim() !==
                  ""
                    ? editForm.dateOfBirth
                    : user.dateOfBirth ||
                      null,

                p_expected_daily_salary:
                  expectedDailySalary !==
                  null
                    ? expectedDailySalary
                    : user.expectedDailySalary !==
                          null &&
                        user.expectedDailySalary !==
                          undefined
                      ? Number(
                          user.expectedDailySalary,
                        )
                      : null,

                p_travel_distance:
                  travelDistance !==
                  null
                    ? travelDistance
                    : user.travelDistance !==
                          null &&
                        user.travelDistance !==
                          undefined
                      ? Number(
                          user.travelDistance,
                        )
                      : null,

                p_comfortable_staying:
                  editForm.comfortableStaying.trim() !==
                  ""
                    ? editForm.comfortableStaying
                    : user.comfortableStaying ||
                      null,

                p_aadhar_front_url:
                  editAadharFrontUrl.trim() !==
                  ""
                    ? editAadharFrontUrl
                    : user.aadharFrontUrl ||
                      null,

                p_aadhar_back_url:
                  editAadharBackUrl.trim() !==
                  ""
                    ? editAadharBackUrl
                    : user.aadharBackUrl ||
                      null,
              },
            );

          if (error) {
            console.error(
              "Failed to update user:",
              error,
            );

            throw new Error(
              error.message,
            );
          }

          /*
           * ================================================================
           * 2. Update phone number separately
           * ================================================================
           */

          const currentPhone =
            (
              user.phoneNumber ||
              ""
            ).trim();

          const newPhone =
            editForm.phoneNumber.trim();

          if (
            newPhone !==
            currentPhone
          ) {
            const {
              data:
                phoneData,
              error:
                phoneError,
            } =
              await supabase.rpc(
                "admin_update_user_phone",
                {
                  p_user_id:
                    user.id,

                  p_phone_number:
                    newPhone,
                },
              );

            if (phoneError) {
              console.error(
                "Failed to update mobile number:",
                phoneError,
              );

              throw new Error(
                phoneError.message,
              );
            }

            return phoneData;
          }

          return data;
        },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "users",
          ],
        });

        setShowEditUser(false);

        setEditingUser(null);

        toast({
          title:
            "User Updated",

          description:
            "User details and location have been updated successfully.",
        });
      },

      onError: (
        error: Error,
      ) => {
        console.error(
          "Failed to update user:",
          error,
        );

        toast({
          variant:
            "destructive",

          title:
            "Update Failed",

          description:
            error.message ||
            "Failed to update user details.",
        });
      },
    });

  /*
   * ==========================================================================
   * Add User Handler
   * ==========================================================================
   */

  const handleAddUser =
    () => {
      if (
        !newUser.name.trim() ||
        newUser.phoneNumber
          .length !== 10
      ) {
        return;
      }

      addUserMutation.mutate(
        newUser,
      );
    };

  /*
   * ==========================================================================
   * Edit User Handler
   * ==========================================================================
   */

  const handleEditClick =
    (user: AdminUser) => {
      setEditingUser(
        user,
      );

      setEditForm({
        name:
          user.name ||
          "",

        phoneNumber:
          user.phoneNumber ||
          "",

        location:
          user.location ||
          "",

        latitude:
          user.latitude !==
              null &&
          user.latitude !==
              undefined
            ? String(
                user.latitude,
              )
            : "",

        longitude:
          user.longitude !==
              null &&
          user.longitude !==
              undefined
            ? String(
                user.longitude,
              )
            : "",

        gender:
          user.gender ||
          "",

        dateOfBirth:
          user.dateOfBirth ||
          "",

        expectedDailySalary:
          user.expectedDailySalary !==
              null &&
          user.expectedDailySalary !==
              undefined
            ? String(
                user.expectedDailySalary,
              )
            : "",

        travelDistance:
          user.travelDistance !==
              null &&
          user.travelDistance !==
              undefined
            ? String(
                user.travelDistance,
              )
            : "",

        comfortableStaying:
          user.comfortableStaying ||
          "",
      });

      setEditAadharFrontUrl(
        user.aadharFrontUrl ||
          "",
      );

      setEditAadharBackUrl(
        user.aadharBackUrl ||
          "",
      );

      setShowEditUser(
        true,
      );
    };

  /*
   * ==========================================================================
   * Aadhaar Front Upload
   * ==========================================================================
   */

  const handleEditAadharFrontUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingEditFront(
        true,
      );

      try {
        const response =
          await uploadFile(
            file,
          );

        if (response) {
          setEditAadharFrontUrl(
            response.objectPath,
          );

          toast({
            title:
              "Aadhaar front uploaded",

            description:
              "The front side has been uploaded successfully.",
          });
        }
      } catch (error) {
        console.error(
          "Aadhaar front upload failed:",
          error,
        );

        toast({
          title:
            "Upload failed",

          description:
            "Failed to upload Aadhaar front side.",

          variant:
            "destructive",
        });
      } finally {
        setUploadingEditFront(
          false,
        );

        e.target.value = "";
      }
    };

  /*
   * ==========================================================================
   * Aadhaar Back Upload
   * ==========================================================================
   */

  const handleEditAadharBackUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingEditBack(
        true,
      );

      try {
        const response =
          await uploadFile(
            file,
          );

        if (response) {
          setEditAadharBackUrl(
            response.objectPath,
          );

          toast({
            title:
              "Aadhaar back uploaded",

            description:
              "The back side has been uploaded successfully.",
          });
        }
      } catch (error) {
        console.error(
          "Aadhaar back upload failed:",
          error,
        );

        toast({
          title:
            "Upload failed",

          description:
            "Failed to upload Aadhaar back side.",

          variant:
            "destructive",
        });
      } finally {
        setUploadingEditBack(
          false,
        );

        e.target.value = "";
      }
    };

  /*
   * ==========================================================================
   * Save Edit
   * ==========================================================================
   */

  const handleSaveEdit =
    () => {
      if (!editingUser) {
        return;
      }

      if (
        !editForm.name.trim()
      ) {
        toast({
          variant:
            "destructive",

          title:
            "Name required",

          description:
            "Please enter the user's name.",
        });

        return;
      }

      if (
        editForm.phoneNumber
          .length !== 10
      ) {
        toast({
          variant:
            "destructive",

          title:
            "Invalid mobile number",

          description:
            "Mobile number must contain exactly 10 digits.",
        });

        return;
      }

      /*
       * Validate coordinates before sending
       * the mutation.
       */

      const latitudeText =
        editForm.latitude.trim();

      const longitudeText =
        editForm.longitude.trim();

      const latitude =
        latitudeText !== ""
          ? Number(latitudeText)
          : null;

      const longitude =
        longitudeText !== ""
          ? Number(longitudeText)
          : null;

      if (
        latitude !== null &&
        (!Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90)
      ) {
        toast({
          variant:
            "destructive",

          title:
            "Invalid Latitude",

          description:
            "Latitude must be between -90 and 90.",
        });

        return;
      }

      if (
        longitude !== null &&
        (!Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180)
      ) {
        toast({
          variant:
            "destructive",

          title:
            "Invalid Longitude",

          description:
            "Longitude must be between -180 and 180.",
        });

        return;
      }

      if (
        (latitude !== null &&
          longitude === null) ||
        (latitude === null &&
          longitude !== null)
      ) {
        toast({
          variant:
            "destructive",

          title:
            "Incomplete Coordinates",

          description:
            "Please enter both latitude and longitude.",
        });

        return;
      }

      editUserMutation.mutate(
        editingUser,
      );
    };

  /*
   * ==========================================================================
   * Loading
   * ==========================================================================
   */

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  /*
   * ==========================================================================
   * UI
   * ==========================================================================
   */

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

        <CardHeader className="flex flex-row items-center justify-between gap-2">

          <div>
            <CardTitle>
              All Users
            </CardTitle>

            <p className="text-sm text-muted-foreground mt-1">
              Showing{" "}
              {filteredUsers.length}{" "}
              of{" "}
              {users.length}{" "}
              users
            </p>
          </div>

          <Button
            onClick={() =>
              setShowAddUser(true)
            }
            data-testid="button-add-user"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>

        </CardHeader>

        <CardContent>

          {/* ================================================================ */}
          {/* Search */}
          {/* ================================================================ */}

          <div className="mb-4">

            <div className="relative">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                value={
                  searchTerm
                }
                onChange={(
                  e,
                ) =>
                  setSearchTerm(
                    e.target.value,
                  )
                }
                placeholder="Search users by name, mobile, location, role, skill, or any keyword..."
                className="pl-9 pr-9"
                data-testid="input-search-users"
              />

              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() =>
                    setSearchTerm(
                      "",
                    )
                  }
                  data-testid="button-clear-user-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

            </div>

            {searchTerm && (
              <p className="text-xs text-muted-foreground mt-2">
                Searching for:{" "}
                <span className="font-medium">
                  {searchTerm}
                </span>
              </p>
            )}

          </div>

          {/* ================================================================ */}
          {/* Users Table */}
          {/* ================================================================ */}

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>
                    Name
                  </TableHead>

                  <TableHead>
                    Mobile
                  </TableHead>

                  <TableHead>
                    Location
                  </TableHead>

                  <TableHead>
                    Role
                  </TableHead>

                  <TableHead>
                    Open Jobs
                  </TableHead>

                  <TableHead>
                    Completed Jobs
                  </TableHead>

                  <TableHead className="text-right">
                    Action
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {filteredUsers.length ===
                0 ? (

                  <TableRow>

                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      {users.length ===
                      0
                        ? "No users found"
                        : "No users match your search"}
                    </TableCell>

                  </TableRow>

                ) : (

                  filteredUsers.map(
                    (
                      user,
                    ) => (

                      <TableRow
                        key={
                          user.id
                        }
                        data-testid={`row-user-${user.id}`}
                      >

                        {/* ================================================== */}
                        {/* Name */}
                        {/* ================================================== */}

                        <TableCell className="font-medium">

                          <button
                            type="button"
                            className="text-left text-primary hover:underline cursor-pointer font-medium"
                            onClick={() =>
                              setLocation(
                                `/admin/user/${user.id}`,
                              )
                            }
                            data-testid={`link-user-name-${user.id}`}
                          >
                            {
                              user.name
                            }
                          </button>

                        </TableCell>

                        {/* ================================================== */}
                        {/* Mobile */}
                        {/* ================================================== */}

                        <TableCell>
                          {formatPhone(
                            user.phoneNumber,
                          )}
                        </TableCell>

                        {/* ================================================== */}
                        {/* Location */}
                        {/* ================================================== */}

                        <TableCell className="max-w-xs truncate">
                          {
                            user.location ||
                            "N/A"
                          }
                        </TableCell>

                        {/* ================================================== */}
                        {/* Role */}
                        {/* ================================================== */}

                        <TableCell>

                          <Badge
                            variant={
                              user.userType
                                ?.toLowerCase() ===
                              "farmer"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {
                              user.userType
                            }
                          </Badge>

                        </TableCell>

                        {/* ================================================== */}
                        {/* Open Jobs */}
                        {/* ================================================== */}

                        <TableCell>

                          {user.userType?.toLowerCase() === "farmer" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setLocation(
                                  `/admin/user/${user.id}`,
                                )
                              }
                              className="cursor-pointer"
                              data-testid={`link-active-jobs-${user.id}`}
                            >
                              {(user.activeJobs ?? 0) > 0 ? (
                                <Badge variant="default">
                                  {user.activeJobs}
                                </Badge>
                              ) : (
                                <span className="font-medium text-muted-foreground hover:text-foreground">
                                  0
                                </span>
                              )}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              N/A
                            </span>
                          )}

                        </TableCell>

                        {/* ================================================== */}
                        {/* Completed Jobs */}
                        {/* ================================================== */}

                        <TableCell>

                          <button
                            type="button"
                            onClick={() =>
                              setLocation(
                                `/admin/user/${user.id}`,
                              )
                            }
                            className="cursor-pointer"
                            data-testid={`link-completed-jobs-${user.id}`}
                          >
                            {(user.completedJobs ?? 0) > 0 ? (
                              <Badge variant="default">
                                {user.completedJobs}
                              </Badge>
                            ) : (
                              <span className="font-medium text-muted-foreground hover:text-foreground">
                                0
                              </span>
                            )}
                          </button>

                        </TableCell>

                        {/* ================================================== */}
                        {/* Actions */}
                        {/* ================================================== */}

                        <TableCell className="text-right">

                          <div className="flex items-center justify-end gap-1">

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleEditClick(
                                  user,
                                )
                              }
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setLocation(
                                  `/admin/user/${user.id}`,
                                )
                              }
                              data-testid={`button-view-user-${user.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                          </div>

                        </TableCell>

                      </TableRow>

                    ),
                  )

                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      {/* ==================================================================== */}
      {/* Add User Dialog */}
      {/* ==================================================================== */}

      <Dialog
        open={
          showAddUser
        }
        onOpenChange={
          setShowAddUser
        }
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Add New User
            </DialogTitle>

            <DialogDescription>
              Create a new farmer or associate account
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* Name */}

            <div className="space-y-2">

              <Label htmlFor="name">
                Name
              </Label>

              <Input
                id="name"
                value={
                  newUser.name
                }
                onChange={(
                  e,
                ) =>
                  setNewUser({
                    ...newUser,
                    name:
                      e.target
                        .value,
                  })
                }
                placeholder="Enter name"
                data-testid="input-user-name"
              />

            </div>

            {/* Mobile */}

            <div className="space-y-2">

              <Label htmlFor="phone">
                Mobile Number
              </Label>

              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={
                  newUser.phoneNumber
                }
                onChange={(
                  e,
                ) =>
                  setNewUser({
                    ...newUser,
                    phoneNumber:
                      e.target.value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(
                          0,
                          10,
                        ),
                  })
                }
                placeholder="Enter 10-digit mobile number"
                data-testid="input-user-phone"
              />

            </div>

            {/* Role */}

            <div className="space-y-2">

              <Label htmlFor="userType">
                Role
              </Label>

              <Select
                value={
                  newUser.userType
                }
                onValueChange={(
                  value:
                    | "Farmer"
                    | "Associate",
                ) =>
                  setNewUser({
                    ...newUser,
                    userType:
                      value,
                  })
                }
              >

                <SelectTrigger data-testid="select-user-type">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="Farmer">
                    Farmer
                  </SelectItem>

                  <SelectItem value="Associate">
                    Associate
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            {/* Location */}

            <div className="space-y-2">

              <Label htmlFor="location">
                Location (optional)
              </Label>

              <Input
                id="location"
                value={
                  newUser.location
                }
                onChange={(
                  e,
                ) =>
                  setNewUser({
                    ...newUser,
                    location:
                      e.target
                        .value,
                  })
                }
                placeholder="Enter location"
                data-testid="input-user-location"
              />

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowAddUser(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleAddUser
              }
              disabled={
                !newUser.name ||
                newUser.phoneNumber
                  .length !== 10 ||
                addUserMutation.isPending
              }
              data-testid="button-submit-user"
            >
              {addUserMutation.isPending
                ? "Adding..."
                : "Add User"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ==================================================================== */}
      {/* Edit User Dialog */}
      {/* ==================================================================== */}

      <Dialog
        open={
          showEditUser
        }
        onOpenChange={
          setShowEditUser
        }
      >

        <DialogContent className="max-h-[85vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle>
              Edit User
            </DialogTitle>

            <DialogDescription>
              Update{" "}
              {editingUser?.name}
              's details
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* ================================================================ */}
            {/* Name */}
            {/* ================================================================ */}

            <div className="space-y-2">

              <Label htmlFor="edit-name">
                Name
              </Label>

              <Input
                id="edit-name"
                value={
                  editForm.name
                }
                onChange={(
                  e,
                ) =>
                  setEditForm({
                    ...editForm,
                    name:
                      e.target
                        .value,
                  })
                }
                placeholder="Enter name"
                data-testid="input-edit-name"
              />

            </div>

            {/* ================================================================ */}
            {/* Mobile */}
            {/* ================================================================ */}

            <div className="space-y-2">

              <Label htmlFor="edit-phone">
                Mobile Number
              </Label>

              <Input
                id="edit-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={
                  editForm.phoneNumber
                }
                onChange={(
                  e,
                ) =>
                  setEditForm({
                    ...editForm,
                    phoneNumber:
                      e.target.value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(
                          0,
                          10,
                        ),
                  })
                }
                placeholder="Enter 10-digit mobile number"
                data-testid="input-edit-phone"
              />

            </div>

            {/* ================================================================ */}
            {/* Location */}
            {/* ================================================================ */}

            <div className="space-y-2">

              <Label htmlFor="edit-location">
                Location
              </Label>

              <Input
                id="edit-location"
                value={
                  editForm.location
                }
                onChange={(
                  e,
                ) =>
                  setEditForm({
                    ...editForm,
                    location:
                      e.target
                        .value,
                  })
                }
                placeholder="Enter location"
                data-testid="input-edit-location"
              />

            </div>

            {/* ================================================================ */}
            {/* Location Coordinates */}
            {/* ================================================================ */}

            <div className="border-t pt-4">

              <p className="text-sm font-medium text-muted-foreground mb-1">
                Location Coordinates
              </p>

              <p className="text-xs text-muted-foreground mb-3">
                Admin can correct the GPS coordinates if
                the user's app detected the location incorrectly.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Latitude */}

              <div className="space-y-2">

                <Label htmlFor="edit-latitude">
                  Latitude
                </Label>

                <Input
                  id="edit-latitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-90"
                  max="90"
                  value={
                    editForm.latitude
                  }
                  onChange={(
                    e,
                  ) =>
                    setEditForm({
                      ...editForm,
                      latitude:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. 12.676570"
                  data-testid="input-edit-latitude"
                />

                <p className="text-xs text-muted-foreground">
                  Range: -90 to 90
                </p>

              </div>

              {/* Longitude */}

              <div className="space-y-2">

                <Label htmlFor="edit-longitude">
                  Longitude
                </Label>

                <Input
                  id="edit-longitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-180"
                  max="180"
                  value={
                    editForm.longitude
                  }
                  onChange={(
                    e,
                  ) =>
                    setEditForm({
                      ...editForm,
                      longitude:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. 75.472285"
                  data-testid="input-edit-longitude"
                />

                <p className="text-xs text-muted-foreground">
                  Range: -180 to 180
                </p>

              </div>

            </div>

            <p className="text-xs text-muted-foreground">
              Example: Latitude{" "}
              <span className="font-medium">
                12.676570
              </span>
              , Longitude{" "}
              <span className="font-medium">
                75.472285
              </span>
            </p>

            {/* ================================================================ */}
            {/* Associate-only fields */}
            {/* ================================================================ */}

            {editingUser?.userType
              ?.toLowerCase() ===
              "associate" && (
              <>

                <div className="border-t pt-4">

                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Associate Details
                  </p>

                </div>

                {/* Gender */}

                <div className="space-y-2">

                  <Label htmlFor="edit-gender">
                    Gender
                  </Label>

                  <Select
                    value={
                      editForm.gender
                    }
                    onValueChange={(
                      value,
                    ) =>
                      setEditForm({
                        ...editForm,
                        gender:
                          value,
                      })
                    }
                  >

                    <SelectTrigger data-testid="select-edit-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="male">
                        Male
                      </SelectItem>

                      <SelectItem value="female">
                        Female
                      </SelectItem>

                      <SelectItem value="other">
                        Other
                      </SelectItem>

                    </SelectContent>

                  </Select>

                </div>

                {/* Date of Birth */}

                <div className="space-y-2">

                  <Label htmlFor="edit-dob">
                    Date of Birth
                  </Label>

                  <Input
                    id="edit-dob"
                    type="date"
                    value={
                      editForm.dateOfBirth
                    }
                    onChange={(
                      e,
                    ) =>
                      setEditForm({
                        ...editForm,
                        dateOfBirth:
                          e.target.value,
                      })
                    }
                    max={
                      new Date(
                        new Date().setFullYear(
                          new Date().getFullYear() -
                            18,
                        ),
                      )
                        .toISOString()
                        .split(
                          "T",
                        )[0]
                    }
                    data-testid="input-edit-dob"
                  />

                </div>

                {/* Expected Salary */}

                <div className="space-y-2">

                  <Label htmlFor="edit-salary">
                    Expected Daily Salary (Rs.)
                  </Label>

                  <Input
                    id="edit-salary"
                    type="number"
                    value={
                      editForm.expectedDailySalary
                    }
                    onChange={(
                      e,
                    ) =>
                      setEditForm({
                        ...editForm,
                        expectedDailySalary:
                          e.target.value,
                      })
                    }
                    placeholder="Enter daily salary"
                    data-testid="input-edit-salary"
                  />

                </div>

                {/* Travel Distance */}

                <div className="space-y-2">

                  <Label htmlFor="edit-distance">
                    Travel Distance (km)
                  </Label>

                  <Input
                    id="edit-distance"
                    type="number"
                    value={
                      editForm.travelDistance
                    }
                    onChange={(
                      e,
                    ) =>
                      setEditForm({
                        ...editForm,
                        travelDistance:
                          e.target.value,
                      })
                    }
                    placeholder="Enter travel distance"
                    data-testid="input-edit-distance"
                  />

                </div>

                {/* Comfortable Staying */}

                <div className="space-y-2">

                  <Label htmlFor="edit-staying">
                    Comfortable Staying
                  </Label>

                  <Select
                    value={
                      editForm.comfortableStaying
                    }
                    onValueChange={(
                      value,
                    ) =>
                      setEditForm({
                        ...editForm,
                        comfortableStaying:
                          value,
                      })
                    }
                  >

                    <SelectTrigger data-testid="select-edit-staying">
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

                {/* ============================================================ */}
                {/* Aadhaar */}
                {/* ============================================================ */}

                <div className="border-t pt-4">

                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    KYC Documents - Aadhar Card
                  </p>

                </div>

                {/* Aadhaar Front */}

                <div className="space-y-2">

                  <Label>
                    Aadhar Front Side
                  </Label>

                  <input
                    type="file"
                    ref={
                      editFrontInputRef
                    }
                    onChange={
                      handleEditAadharFrontUpload
                    }
                    accept="image/*"
                    className="hidden"
                    data-testid="input-edit-aadhar-front"
                  />

                  <Button
                    type="button"
                    variant={
                      editAadharFrontUrl
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    onClick={() =>
                      editFrontInputRef.current?.click()
                    }
                    disabled={
                      uploadingEditFront
                    }
                    data-testid="button-edit-aadhar-front"
                  >

                    {uploadingEditFront ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : editAadharFrontUrl ? (
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

                {/* Aadhaar Back */}

                <div className="space-y-2">

                  <Label>
                    Aadhar Back Side
                  </Label>

                  <input
                    type="file"
                    ref={
                      editBackInputRef
                    }
                    onChange={
                      handleEditAadharBackUpload
                    }
                    accept="image/*"
                    className="hidden"
                    data-testid="input-edit-aadhar-back"
                  />

                  <Button
                    type="button"
                    variant={
                      editAadharBackUrl
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    onClick={() =>
                      editBackInputRef.current?.click()
                    }
                    disabled={
                      uploadingEditBack
                    }
                    data-testid="button-edit-aadhar-back"
                  >

                    {uploadingEditBack ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : editAadharBackUrl ? (
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

              </>
            )}

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowEditUser(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleSaveEdit
              }
              disabled={
                !editForm.name ||
                editForm.phoneNumber
                  .length !== 10 ||
                editUserMutation.isPending ||
                uploadingEditFront ||
                uploadingEditBack
              }
              data-testid="button-save-edit"
            >
              {editUserMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>
    </>
  );
}