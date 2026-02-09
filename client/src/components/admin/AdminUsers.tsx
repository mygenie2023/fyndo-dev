import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Eye, Plus, Pencil, Upload, Check, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPhone } from "@/lib/utils";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    location: "",
    gender: "",
    dateOfBirth: "",
    expectedDailySalary: "",
    travelDistance: "",
    comfortableStaying: "",
  });
  const [editAadharFrontUrl, setEditAadharFrontUrl] = useState("");
  const [editAadharBackUrl, setEditAadharBackUrl] = useState("");
  const [uploadingEditFront, setUploadingEditFront] = useState(false);
  const [uploadingEditBack, setUploadingEditBack] = useState(false);
  const editFrontInputRef = useRef<HTMLInputElement>(null);
  const editBackInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  const [newUser, setNewUser] = useState({
    name: "",
    phoneNumber: "",
    userType: "Farmer" as "Farmer" | "Associate",
    location: "",
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddUser(false);
      setNewUser({
        name: "",
        phoneNumber: "",
        userType: "Farmer",
        location: "",
      });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      if (editingUser) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${editingUser.id}`] });
      }
      setShowEditUser(false);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User details have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update user details.",
      });
    },
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.phoneNumber) return;
    addUserMutation.mutate(newUser);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      location: user.location || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || "",
      expectedDailySalary: user.expectedDailySalary?.toString() || "",
      travelDistance: user.travelDistance?.toString() || "",
      comfortableStaying: user.comfortableStaying || "",
    });
    setEditAadharFrontUrl(user.aadharFrontUrl || "");
    setEditAadharBackUrl(user.aadharBackUrl || "");
    setShowEditUser(true);
  };

  const handleEditAadharFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditFront(true);
    try {
      const response = await uploadFile(file);
      if (response) {
        setEditAadharFrontUrl(response.objectPath);
      }
    } finally {
      setUploadingEditFront(false);
    }
  };

  const handleEditAadharBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditBack(true);
    try {
      const response = await uploadFile(file);
      if (response) {
        setEditAadharBackUrl(response.objectPath);
      }
    } finally {
      setUploadingEditBack(false);
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser || !editForm.name || !editForm.phoneNumber) return;

    const data: Record<string, any> = {
      name: editForm.name,
      phoneNumber: editForm.phoneNumber,
      location: editForm.location || undefined,
    };

    if (editingUser.userType?.toLowerCase() === "associate") {
      data.gender = editForm.gender || undefined;
      data.dateOfBirth = editForm.dateOfBirth || undefined;
      data.expectedDailySalary = editForm.expectedDailySalary ? parseInt(editForm.expectedDailySalary) : undefined;
      data.travelDistance = editForm.travelDistance ? parseInt(editForm.travelDistance) : undefined;
      data.comfortableStaying = editForm.comfortableStaying || undefined;
      data.aadharFrontUrl = editAadharFrontUrl || undefined;
      data.aadharBackUrl = editAadharBackUrl || undefined;
    }

    editUserMutation.mutate({ id: editingUser.id, data });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>All Users</CardTitle>
          <Button onClick={() => setShowAddUser(true)} data-testid="button-add-user">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{formatPhone(user.phoneNumber)}</TableCell>
                      <TableCell className="max-w-xs truncate">{user.location || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={user.userType?.toLowerCase() === "farmer" ? "default" : "secondary"}>
                          {user.userType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLocation(`/admin/user/${user.id}`)}
                            data-testid={`button-view-user-${user.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new farmer or associate account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter name"
                data-testid="input-user-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="Enter 10-digit mobile number"
                data-testid="input-user-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">Role</Label>
              <Select
                value={newUser.userType}
                onValueChange={(value: "Farmer" | "Associate") => setNewUser({ ...newUser, userType: value })}
              >
                <SelectTrigger data-testid="select-user-type">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farmer">Farmer</SelectItem>
                  <SelectItem value="Associate">Associate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={newUser.location}
                onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                placeholder="Enter location"
                data-testid="input-user-location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!newUser.name || newUser.phoneNumber.length !== 10 || addUserMutation.isPending}
              data-testid="button-submit-user"
            >
              {addUserMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update {editingUser?.name}'s details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter name"
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Mobile Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="Enter 10-digit mobile number"
                data-testid="input-edit-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Enter location"
                data-testid="input-edit-location"
              />
            </div>

            {editingUser?.userType?.toLowerCase() === "associate" && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Associate Details</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                  >
                    <SelectTrigger data-testid="select-edit-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    data-testid="input-edit-dob"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salary">Expected Daily Salary (Rs.)</Label>
                  <Input
                    id="edit-salary"
                    type="number"
                    value={editForm.expectedDailySalary}
                    onChange={(e) => setEditForm({ ...editForm, expectedDailySalary: e.target.value })}
                    placeholder="Enter daily salary"
                    data-testid="input-edit-salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-distance">Travel Distance (km)</Label>
                  <Input
                    id="edit-distance"
                    type="number"
                    value={editForm.travelDistance}
                    onChange={(e) => setEditForm({ ...editForm, travelDistance: e.target.value })}
                    placeholder="Enter travel distance"
                    data-testid="input-edit-distance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-staying">Comfortable Staying</Label>
                  <Select
                    value={editForm.comfortableStaying}
                    onValueChange={(value) => setEditForm({ ...editForm, comfortableStaying: value })}
                  >
                    <SelectTrigger data-testid="select-edit-staying">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">KYC Documents - Aadhar Card</p>
                </div>
                <div className="space-y-2">
                  <Label>Aadhar Front Side</Label>
                  <input
                    type="file"
                    ref={editFrontInputRef}
                    onChange={handleEditAadharFrontUpload}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-edit-aadhar-front"
                  />
                  <Button
                    type="button"
                    variant={editAadharFrontUrl ? "default" : "outline"}
                    className="w-full"
                    onClick={() => editFrontInputRef.current?.click()}
                    disabled={uploadingEditFront}
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
                        Front Side Uploaded (Click to Replace)
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Front Side
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Aadhar Back Side</Label>
                  <input
                    type="file"
                    ref={editBackInputRef}
                    onChange={handleEditAadharBackUpload}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-edit-aadhar-back"
                  />
                  <Button
                    type="button"
                    variant={editAadharBackUrl ? "default" : "outline"}
                    className="w-full"
                    onClick={() => editBackInputRef.current?.click()}
                    disabled={uploadingEditBack}
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
                        Back Side Uploaded (Click to Replace)
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
            <Button variant="outline" onClick={() => setShowEditUser(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.name || editForm.phoneNumber.length !== 10 || editUserMutation.isPending || uploadingEditFront || uploadingEditBack}
              data-testid="button-save-edit"
            >
              {editUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
