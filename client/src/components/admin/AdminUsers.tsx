import { useState } from "react";
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
import { Eye, Plus, Pencil } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    userType: "Farmer" as string,
    location: "",
    gender: "",
    dateOfBirth: "",
    expectedDailySalary: "",
    travelDistance: "",
    comfortableStaying: "",
    skillLevel: "",
    hourlyRate: "",
  });
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
      userType: user.userType || "Farmer",
      location: user.location || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || "",
      expectedDailySalary: user.expectedDailySalary?.toString() || "",
      travelDistance: user.travelDistance?.toString() || "",
      comfortableStaying: user.comfortableStaying || "",
      skillLevel: user.skillLevel || "",
      hourlyRate: user.hourlyRate?.toString() || "",
    });
    setShowEditUser(true);
  };

  const handleSaveEdit = () => {
    if (!editingUser || !editForm.name || !editForm.phoneNumber) return;

    const data: Record<string, any> = {
      name: editForm.name,
      phoneNumber: editForm.phoneNumber,
      location: editForm.location || undefined,
    };

    if (editingUser.userType === "Associate") {
      data.gender = editForm.gender || undefined;
      data.dateOfBirth = editForm.dateOfBirth || undefined;
      data.expectedDailySalary = editForm.expectedDailySalary ? parseInt(editForm.expectedDailySalary) : undefined;
      data.travelDistance = editForm.travelDistance ? parseInt(editForm.travelDistance) : undefined;
      data.comfortableStaying = editForm.comfortableStaying || undefined;
      data.skillLevel = editForm.skillLevel || undefined;
      data.hourlyRate = editForm.hourlyRate ? parseInt(editForm.hourlyRate) : undefined;
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
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{user.location || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={user.userType === "Farmer" ? "default" : "secondary"}>
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
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                placeholder="Enter mobile number"
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
              disabled={!newUser.name || !newUser.phoneNumber || addUserMutation.isPending}
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
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                placeholder="Enter mobile number"
                data-testid="input-edit-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={editForm.userType}
                disabled
                data-testid="input-edit-role"
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

            {editingUser?.userType === "Associate" && (
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
                <div className="space-y-2">
                  <Label htmlFor="edit-skill-level">Skill Level</Label>
                  <Select
                    value={editForm.skillLevel}
                    onValueChange={(value) => setEditForm({ ...editForm, skillLevel: value })}
                  >
                    <SelectTrigger data-testid="select-edit-skill-level">
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hourly-rate">Hourly Rate (Rs.)</Label>
                  <Input
                    id="edit-hourly-rate"
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                    placeholder="Enter hourly rate"
                    data-testid="input-edit-hourly-rate"
                  />
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
              disabled={!editForm.name || !editForm.phoneNumber || editUserMutation.isPending}
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
