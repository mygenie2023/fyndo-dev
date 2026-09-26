import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Plus,
  Edit,
  Power,
  Loader2,
  Tractor,
  Wheat,
  Droplets,
  Sprout,
  Bug,
  Users,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


/*
 * --------------------------------------------------------------------------
 * Available Service Icons
 * --------------------------------------------------------------------------
 */

const iconOptions = [
  {
    value: "Tractor",
    label: "Tractor",
    icon: Tractor,
  },
  {
    value: "Wheat",
    label: "Wheat",
    icon: Wheat,
  },
  {
    value: "Droplets",
    label: "Droplets",
    icon: Droplets,
  },
  {
    value: "Sprout",
    label: "Sprout",
    icon: Sprout,
  },
  {
    value: "Bug",
    label: "Bug",
    icon: Bug,
  },
  {
    value: "Users",
    label: "Users",
    icon: Users,
  },
];


/*
 * --------------------------------------------------------------------------
 * Database -> Frontend Service Mapping
 * --------------------------------------------------------------------------
 */

const mapService = (service: any): Service => {
  return {
    ...service,

    iconName: service.icon_name,

    isActive:
      service.is_active === true ||
      service.is_active === 1 ||
      service.is_active === "1",
  } as Service;
};


export default function AdminServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] =
    useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    iconName: "Tractor",
  });


  /*
   * --------------------------------------------------------------------------
   * Load All Services
   * --------------------------------------------------------------------------
   */

  const {
    data: services = [],
    isLoading,
    error: servicesError,
  } = useQuery<Service[]>({
    queryKey: ["admin", "services"],

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_all_services",
      );

      if (error) {
        console.error(
          "Failed to load services:",
          error,
        );

        throw new Error(error.message);
      }

      return (data ?? []).map(mapService);
    },
  });


  /*
   * --------------------------------------------------------------------------
   * Create Service
   * --------------------------------------------------------------------------
   */

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      iconName: string;
    }) => {
      const {
        data: createdService,
        error,
      } = await supabase.rpc(
        "admin_create_service",
        {
          p_name: data.name.trim(),
          p_icon_name: data.iconName,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return createdService;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "services"],
      });

      /*
       * Also invalidate the regular services
       * query so the Farmer job-posting UI
       * immediately sees the new service.
       */
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setShowDialog(false);

      setFormData({
        name: "",
        iconName: "Tractor",
      });

      toast({
        title: "Success",
        description:
          "Service created successfully",
        duration: 3000,
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create service",
        variant: "destructive",
        duration: 3000,
      });
    },
  });


  /*
   * --------------------------------------------------------------------------
   * Update Service
   * --------------------------------------------------------------------------
   */

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      iconName: string;
    }) => {
      const {
        data: updatedService,
        error,
      } = await supabase.rpc(
        "admin_update_service",
        {
          p_service_id: data.id,
          p_name: data.name.trim(),
          p_icon_name: data.iconName,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return updatedService;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      setShowDialog(false);

      setEditingService(null);

      setFormData({
        name: "",
        iconName: "Tractor",
      });

      toast({
        title: "Success",
        description:
          "Service updated successfully",
        duration: 3000,
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update service",
        variant: "destructive",
        duration: 3000,
      });
    },
  });


  /*
   * --------------------------------------------------------------------------
   * Toggle Active / Inactive
   * --------------------------------------------------------------------------
   */

  const toggleActiveMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      isActive: boolean;
    }) => {
      const {
        data: updatedService,
        error,
      } = await supabase.rpc(
        "admin_update_service_status",
        {
          p_service_id: data.id,
          p_is_active: data.isActive,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return updatedService;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      toast({
        title: "Success",
        description:
          "Service status updated",
        duration: 3000,
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update service status",
        variant: "destructive",
        duration: 3000,
      });
    },
  });


  /*
   * --------------------------------------------------------------------------
   * Open Add/Edit Dialog
   * --------------------------------------------------------------------------
   */

  const handleOpenDialog = (
    service?: Service,
  ) => {
    if (service) {
      setEditingService(service);

      setFormData({
        name: service.name,
        iconName:
          service.iconName || "Tractor",
      });
    } else {
      setEditingService(null);

      setFormData({
        name: "",
        iconName: "Tractor",
      });
    }

    setShowDialog(true);
  };


  /*
   * --------------------------------------------------------------------------
   * Submit Form
   * --------------------------------------------------------------------------
   */

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description:
          "Service name is required",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        name: formData.name,
        iconName: formData.iconName,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        iconName: formData.iconName,
      });
    }
  };


  /*
   * --------------------------------------------------------------------------
   * Toggle Service
   * --------------------------------------------------------------------------
   */

  const handleToggleActive = (
    service: Service,
  ) => {
    toggleActiveMutation.mutate({
      id: service.id,

      isActive: !Boolean(
        service.isActive,
      ),
    });
  };


  /*
   * --------------------------------------------------------------------------
   * Icon Resolver
   * --------------------------------------------------------------------------
   */

  const getIcon = (
    iconName: string,
  ) => {
    const iconOption =
      iconOptions.find(
        (option) =>
          option.value === iconName,
      );

    return (
      iconOption?.icon ||
      Tractor
    );
  };


  /*
   * --------------------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  /*
   * --------------------------------------------------------------------------
   * Error
   * --------------------------------------------------------------------------
   */

  if (servicesError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Services Management
          </h2>

          <p className="text-sm text-destructive mt-2">
            Failed to load services.
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            {servicesError instanceof Error
              ? servicesError.message
              : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }


  /*
   * --------------------------------------------------------------------------
   * UI
   * --------------------------------------------------------------------------
   */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Services Management
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Manage services that farmers can
            select when posting jobs
          </p>
        </div>

        <Button
          onClick={() =>
            handleOpenDialog()
          }
          data-testid="button-add-service"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>


      {/* Services Table */}

      <Card>
        <Table>

          <TableHeader>
            <TableRow>

              <TableHead>
                Icon
              </TableHead>

              <TableHead>
                Service Name
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>

            </TableRow>
          </TableHeader>


          <TableBody>

            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No services available
                </TableCell>
              </TableRow>
            ) : (
              services.map(
                (service) => {
                  const Icon =
                    getIcon(
                      service.iconName,
                    );

                  return (
                    <TableRow
                      key={service.id}
                    >

                      <TableCell>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>

                      <TableCell>

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {service.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </TableCell>

                      <TableCell className="text-right">

                        <div className="flex items-center justify-end gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenDialog(
                                service,
                              )
                            }
                            data-testid={`button-edit-${service.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>


                          <Button
                            variant={
                              service.isActive
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() =>
                              handleToggleActive(
                                service,
                              )
                            }
                            disabled={
                              toggleActiveMutation.isPending
                            }
                            data-testid={`button-toggle-${service.id}`}
                          >
                            <Power className="w-4 h-4" />
                          </Button>

                        </div>

                      </TableCell>

                    </TableRow>
                  );
                },
              )
            )}

          </TableBody>

        </Table>
      </Card>


      {/* Add/Edit Dialog */}

      <Dialog
        open={showDialog}
        onOpenChange={
          setShowDialog
        }
      >

        <DialogContent
          data-testid="dialog-service-form"
        >

          <DialogHeader>

            <DialogTitle>
              {editingService
                ? "Edit Service"
                : "Add New Service"}
            </DialogTitle>

            <DialogDescription>
              {editingService
                ? "Update the service details below"
                : "Create a new service for farmers to choose from"}
            </DialogDescription>

          </DialogHeader>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="space-y-4 py-4">

              {/* Service Name */}

              <div className="space-y-2">

                <Label htmlFor="name">
                  Service Name
                </Label>

                <Input
                  id="name"
                  placeholder="e.g., Ploughing"
                  value={
                    formData.name
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target
                        .value,
                    })
                  }
                  data-testid="input-service-name"
                />

              </div>


              {/* Icon */}

              <div className="space-y-2">

                <Label htmlFor="icon">
                  Icon
                </Label>

                <Select
                  value={
                    formData.iconName
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setFormData({
                      ...formData,
                      iconName:
                        value,
                    })
                  }
                >

                  <SelectTrigger
                    data-testid="select-icon"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    {iconOptions.map(
                      (option) => {
                        const Icon =
                          option.icon;

                        return (
                          <SelectItem
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {
                                option.label
                              }
                            </div>
                          </SelectItem>
                        );
                      },
                    )}

                  </SelectContent>

                </Select>

              </div>

            </div>


            <DialogFooter>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowDialog(
                    false,
                  )
                }
                data-testid="button-cancel"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                data-testid="button-submit-service"
              >

                {(
                  createMutation.isPending ||
                  updateMutation.isPending
                ) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}

                {editingService
                  ? "Update"
                  : "Create"}

              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </div>
  );
}